// Driver Portal Functions
let driverDeliveries = [];
let currentDriverId = null;

// Initialize driver portal
function initDriverPortal() {
    const user = authService.getCurrentUser();
    if (user && user.id) {
        currentDriverId = user.id;
        loadDriverDeliveries();
    }
}

// Load driver deliveries
async function loadDriverDeliveries() {
    if (!currentDriverId) {
        currentDriverId = 'DRIVER001'; // Mock driver ID
    }

    try {
        const response = await apiClient.get(`/api/drivers/${currentDriverId}/deliveries`);
        driverDeliveries = response.deliveries || [];
        displayDeliveries();
    } catch (error) {
        console.error('Failed to load deliveries:', error);
        showToast('Failed to load deliveries', 'error');
    }
}

// Display deliveries list
function displayDeliveries() {
    const container = document.getElementById('deliveries-list');
    if (!container) return;

    if (driverDeliveries.length === 0) {
        container.innerHTML = '<p class="empty-state">No deliveries assigned for today.</p>';
        return;
    }

    container.innerHTML = driverDeliveries.map(delivery => createDeliveryCard(delivery)).join('');
}

// Create delivery card HTML
function createDeliveryCard(delivery) {
    const statusClass = `status-${delivery.status || 'assigned'}`;
    const statusText = (delivery.status || 'assigned').replace('_', ' ').toUpperCase();
    const priorityBadge = delivery.priority === 'express' ? '<span class="priority-badge priority-express">EXPRESS</span>' : 
                         delivery.priority === 'urgent' ? '<span class="priority-badge priority-urgent">URGENT</span>' : '';

    return `
        <div class="delivery-card">
            <div class="delivery-header">
                <div>
                    <div class="order-id">Order #${delivery.orderId}</div>
                    <div class="customer-name">${delivery.customerName || 'N/A'}</div>
                    ${priorityBadge}
                </div>
                <span class="status-badge ${statusClass}">${statusText}</span>
            </div>
            <div class="delivery-info">
                <div><strong>Address:</strong> ${delivery.address || 'N/A'}</div>
            </div>
            <div class="delivery-actions">
                ${delivery.status === 'assigned' ? `
                    <button class="btn btn-primary" onclick="updateDeliveryStatus('${delivery.id}', 'in_transit')">
                        Start Delivery
                    </button>
                ` : ''}
                ${delivery.status === 'in_transit' ? `
                    <button class="btn btn-warning" onclick="updateDeliveryStatus('${delivery.id}', 'out_for_delivery')">
                        Out for Delivery
                    </button>
                ` : ''}
                ${['in_transit', 'out_for_delivery'].includes(delivery.status) ? `
                    <button class="btn btn-success" onclick="markAsDelivered('${delivery.id}')">
                        Mark as Delivered
                    </button>
                    <button class="btn btn-danger" onclick="markAsFailed('${delivery.id}')">
                        Mark as Failed
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}

// Update delivery status
async function updateDeliveryStatus(deliveryId, status) {
    try {
        showToast('Updating status...', 'info');

        const response = await apiClient.put(`/api/deliveries/${deliveryId}/status`, {
            status: status,
            timestamp: new Date().toISOString(),
        });

        if (response.success !== false) {
            showToast(`Status updated to ${status}`, 'success');
            
            // Update local delivery
            const delivery = driverDeliveries.find(d => d.id === deliveryId);
            if (delivery) {
                delivery.status = status;
                displayDeliveries();
            }

            // Simulate WebSocket update to client portal
            if (window.wsService && delivery) {
                setTimeout(() => {
                    wsService.handleMessage({
                        event: 'delivery_status_updated',
                        orderId: delivery.orderId,
                        status: status,
                        timestamp: new Date().toISOString()
                    });
                }, 500);
            }
        }
    } catch (error) {
        console.error('Failed to update status:', error);
        showToast(error.message || 'Failed to update status', 'error');
    }
}

// Mark delivery as delivered
async function markAsDelivered(deliveryId) {
    const delivery = driverDeliveries.find(d => d.id === deliveryId);
    if (!delivery) return;

    // In a real app, you would capture photo/signature here
    // For demo, we'll just update the status
    const confirmed = confirm('Mark this delivery as completed?');
    if (!confirmed) return;

    try {
        showToast('Marking as delivered...', 'info');

        // Update status
        await updateDeliveryStatus(deliveryId, 'delivered');

        // Simulate proof upload
        showToast('Proof of delivery uploaded', 'success');

        // Reload deliveries
        setTimeout(() => {
            loadDriverDeliveries();
        }, 1000);
    } catch (error) {
        console.error('Failed to mark as delivered:', error);
        showToast(error.message || 'Failed to mark as delivered', 'error');
    }
}

// Mark delivery as failed
async function markAsFailed(deliveryId) {
    const reason = prompt('Please provide reason for failure:');
    if (!reason) return;

    try {
        showToast('Marking as failed...', 'info');

        const response = await apiClient.put(`/api/deliveries/${deliveryId}/status`, {
            status: 'failed',
            timestamp: new Date().toISOString(),
            failureReason: reason,
        });

        if (response.success !== false) {
            showToast('Delivery marked as failed', 'warning');
            
            // Update local delivery
            const delivery = driverDeliveries.find(d => d.id === deliveryId);
            if (delivery) {
                delivery.status = 'failed';
                displayDeliveries();
            }
        }
    } catch (error) {
        console.error('Failed to mark as failed:', error);
        showToast(error.message || 'Failed to mark as failed', 'error');
    }
}

// Load route
async function loadRoute() {
    if (!currentDriverId) {
        currentDriverId = 'DRIVER001';
    }

    try {
        const response = await apiClient.get(`/api/drivers/${currentDriverId}/route`);
        displayRoute(response);
    } catch (error) {
        console.error('Failed to load route:', error);
        showToast('Failed to load route', 'error');
    }
}

// Display route
function displayRoute(routeData) {
    const mapContainer = document.getElementById('route-map');
    const stepsContainer = document.getElementById('route-steps');
    
    if (!mapContainer || !stepsContainer) return;

    // In a real app, you would integrate with a map library like Google Maps or Leaflet
    mapContainer.innerHTML = `
        <div class="route-placeholder">
            <h3>Optimized Route</h3>
            <p>Route visualization would appear here</p>
            <p class="route-info">Total stops: ${driverDeliveries.length}</p>
            <p class="route-info">Estimated time: ${driverDeliveries.length * 15} minutes</p>
        </div>
    `;

    // Display route steps
    if (driverDeliveries.length > 0) {
        stepsContainer.innerHTML = `
            <h3>Delivery Sequence</h3>
            ${driverDeliveries.map((delivery, index) => `
                <div class="route-step">
                    <strong>Stop ${index + 1}:</strong> ${delivery.address || 'N/A'}
                    <br>
                    <small>Order #${delivery.orderId} - ${delivery.customerName || 'N/A'}</small>
                </div>
            `).join('')}
        `;
    } else {
        stepsContainer.innerHTML = '<p>No deliveries assigned</p>';
    }
}

// Show driver tab
function showDriverTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Update sidebar items
    const sidebarItems = document.querySelectorAll('#driver-sidebar .sidebar-item');
    sidebarItems.forEach(item => {
        item.classList.remove('active');
    });

    // Show selected tab
    const tab = document.getElementById(`driver-${tabName}`);
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
    closeSidebarOnMobile('driver');

    // Load data if needed
    if (tabName === 'route') {
        loadRoute();
    } else if (tabName === 'deliveries') {
        loadDriverDeliveries();
    }
}

// Export functions
window.updateDeliveryStatus = updateDeliveryStatus;
window.markAsDelivered = markAsDelivered;
window.markAsFailed = markAsFailed;
window.loadRoute = loadRoute;
window.showDriverTab = showDriverTab;
window.initDriverPortal = initDriverPortal;
window.loadDriverDeliveries = loadDriverDeliveries;
