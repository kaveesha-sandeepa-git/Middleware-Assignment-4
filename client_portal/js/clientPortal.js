// Client Portal Functions
let clientOrders = [];

// Initialize client portal
function initClientPortal() {
    loadClientDashboard();
    setupWebSocketListeners();
}

// Setup WebSocket event listeners
function setupWebSocketListeners() {
    if (!window.wsService) return;

    wsService.on('delivery_status_updated', (data) => {
        updateOrderInList(data.orderId, data.status);
        updateDashboardStats();
    });

    wsService.on('order_created', (data) => {
        if (data.orderId) {
            loadClientDashboard();
        }
    });
}

// Load dashboard data
async function loadClientDashboard() {
    try {
        const response = await apiClient.get('/api/orders');
        clientOrders = response.orders || [];
        
        updateDashboardStats();
        displayRecentOrders();
        displayAllOrders();
    } catch (error) {
        console.error('Failed to load dashboard:', error);
        showToast('Failed to load dashboard data', 'error');
    }
}

// Update dashboard statistics
function updateDashboardStats() {
    const stats = {
        total: clientOrders.length,
        active: clientOrders.filter(o => ['in_transit', 'out_for_delivery'].includes(o.status)).length,
        completed: clientOrders.filter(o => o.status === 'delivered').length,
        pending: clientOrders.filter(o => o.status === 'pending').length,
    };

    const totalEl = document.getElementById('total-orders');
    const activeEl = document.getElementById('active-deliveries');
    const completedEl = document.getElementById('completed-deliveries');
    const pendingEl = document.getElementById('pending-orders');

    if (totalEl) totalEl.textContent = stats.total;
    if (activeEl) activeEl.textContent = stats.active;
    if (completedEl) completedEl.textContent = stats.completed;
    if (pendingEl) pendingEl.textContent = stats.pending;
}

// Display recent orders on dashboard
function displayRecentOrders() {
    const container = document.getElementById('recent-orders-list');
    if (!container) return;

    const recentOrders = clientOrders.slice(0, 5);
    container.innerHTML = recentOrders.map(order => createOrderCard(order)).join('');
}

// Display all orders in track orders tab
function displayAllOrders() {
    const container = document.getElementById('orders-list');
    if (!container) return;

    if (clientOrders.length === 0) {
        container.innerHTML = '<p class="empty-state">No orders found. Submit your first order!</p>';
        return;
    }

    container.innerHTML = clientOrders.map(order => createOrderCard(order)).join('');
}

// Create order card HTML
function createOrderCard(order) {
    const statusClass = `status-${order.status || 'pending'}`;
    const statusText = (order.status || 'pending').replace('_', ' ').toUpperCase();
    const date = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A';

    return `
        <div class="order-card" onclick="showOrderDetail('${order.id}')">
            <div class="order-header">
                <div class="order-id">Order #${order.id}</div>
                <span class="status-badge ${statusClass}">${statusText}</span>
            </div>
            <div class="order-info">
                <div><strong>Customer:</strong> ${order.customerName || 'N/A'}</div>
                <div><strong>Address:</strong> ${order.deliveryAddress || 'N/A'}</div>
                <div><strong>Created:</strong> ${date}</div>
            </div>
        </div>
    `;
}

// Update order in list
function updateOrderInList(orderId, status) {
    const order = clientOrders.find(o => o.id === orderId);
    if (order) {
        order.status = status;
        displayAllOrders();
        displayRecentOrders();
    }
}

// Handle order submission
async function handleSubmitOrder(event) {
    event.preventDefault();

    const orderData = {
        customerName: document.getElementById('customer-name').value,
        customerEmail: document.getElementById('customer-email').value,
        deliveryAddress: {
            street: document.getElementById('delivery-street').value,
            city: document.getElementById('delivery-city').value,
            state: document.getElementById('delivery-state').value,
            zipCode: document.getElementById('delivery-zip').value,
        },
        packageDetails: {
            weight: parseFloat(document.getElementById('package-weight').value),
            description: document.getElementById('package-description').value,
        },
        priority: document.getElementById('order-priority').value,
    };

    try {
        showToast('Submitting order...', 'info');
        
        const response = await apiClient.post('/api/orders', orderData);

        if (response.orderId) {
            showToast(`Order ${response.orderId} created successfully!`, 'success');
            
            // Add to orders list
            const newOrder = {
                id: response.orderId,
                customerName: orderData.customerName,
                deliveryAddress: `${orderData.deliveryAddress.street}, ${orderData.deliveryAddress.city}`,
                status: response.status || 'pending',
                createdAt: new Date().toISOString(),
            };
            
            clientOrders.unshift(newOrder);
            updateDashboardStats();
            displayRecentOrders();
            displayAllOrders();

            // Subscribe to updates
            if (window.wsService) {
                wsService.subscribe(response.orderId, (update) => {
                    updateOrderInList(response.orderId, update.status);
                });
            }

            // Reset form
            document.getElementById('submit-order-form').reset();
            
            // Switch to track orders tab
            showClientTab('track-orders');
        }
    } catch (error) {
        console.error('Failed to submit order:', error);
        showToast(error.message || 'Failed to submit order', 'error');
    }
}

// Show order detail modal
function showOrderDetail(orderId) {
    const order = clientOrders.find(o => o.id === orderId);
    if (!order) {
        showToast('Order not found', 'error');
        return;
    }

    const modal = document.getElementById('order-detail-modal');
    const content = document.getElementById('order-detail-content');
    
    if (!modal || !content) return;

    const statusClass = `status-${order.status || 'pending'}`;
    const statusText = (order.status || 'pending').replace('_', ' ').toUpperCase();

    content.innerHTML = `
        <h2>Order Details</h2>
        <div class="order-detail">
            <div class="detail-row">
                <strong>Order ID:</strong> ${order.id}
            </div>
            <div class="detail-row">
                <strong>Status:</strong> <span class="status-badge ${statusClass}">${statusText}</span>
            </div>
            <div class="detail-row">
                <strong>Customer:</strong> ${order.customerName || 'N/A'}
            </div>
            <div class="detail-row">
                <strong>Delivery Address:</strong> ${order.deliveryAddress || 'N/A'}
            </div>
            <div class="detail-row">
                <strong>Created:</strong> ${order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}
            </div>
        </div>
        <div class="timeline">
            <h3>Delivery Timeline</h3>
            <div class="timeline-item">
                <div class="timeline-timestamp">${order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}</div>
                <div class="timeline-event">Order created</div>
            </div>
            ${order.status === 'delivered' ? `
                <div class="timeline-item">
                    <div class="timeline-timestamp">${new Date().toLocaleString()}</div>
                    <div class="timeline-event">Order delivered</div>
                </div>
            ` : ''}
        </div>
    `;

    modal.classList.add('active');
}

// Search orders
function searchOrders() {
    const searchTerm = document.getElementById('order-search')?.value.toLowerCase() || '';
    const container = document.getElementById('orders-list');
    if (!container) return;

    if (!searchTerm) {
        displayAllOrders();
        return;
    }

    const filtered = clientOrders.filter(order => 
        order.id.toLowerCase().includes(searchTerm) ||
        (order.customerName && order.customerName.toLowerCase().includes(searchTerm))
    );

    if (filtered.length === 0) {
        container.innerHTML = '<p class="empty-state">No orders found matching your search.</p>';
        return;
    }

    container.innerHTML = filtered.map(order => createOrderCard(order)).join('');
}

// Show client tab
function showClientTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Update sidebar items
    const sidebarItems = document.querySelectorAll('#client-sidebar .sidebar-item');
    sidebarItems.forEach(item => {
        item.classList.remove('active');
    });

    // Show selected tab
    const tab = document.getElementById(`client-${tabName}`);
    if (tab) tab.classList.add('active');

    // Activate corresponding sidebar item
    const sidebarItem = Array.from(sidebarItems).find(item => {
        const text = item.querySelector('.sidebar-text')?.textContent.toLowerCase();
        return text && text.includes(tabName.replace('-', ' '));
    });
    if (sidebarItem) {
        sidebarItem.classList.add('active');
    }

    // Close sidebar on mobile
    closeSidebarOnMobile('client');

    // Load data if needed
    if (tabName === 'track-orders') {
        displayAllOrders();
    }
}

// Export functions
window.handleSubmitOrder = handleSubmitOrder;
window.showOrderDetail = showOrderDetail;
window.searchOrders = searchOrders;
window.showClientTab = showClientTab;
window.initClientPortal = initClientPortal;
