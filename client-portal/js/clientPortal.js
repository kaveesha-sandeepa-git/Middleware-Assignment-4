// This is your portal code with two additions:
// 1) a toast helper
// 2) safe init + tab switching + submit form binding

let clientOrders = [];

// Toast helper
function showToast(message, type = "info") {
  const el = document.getElementById("toast");
  if (!el) return;

  el.className = `toast show ${type}`;
  el.textContent = message;

  window.clearTimeout(el._t);
  el._t = window.setTimeout(() => {
    el.className = "toast";
    el.textContent = "";
  }, 2500);
}
window.showToast = showToast;

// Initialize client portal
function initClientPortal() {
  loadClientDashboard();
  setupWebSocketListeners();

  // bind submit form
  const form = document.getElementById("submit-order-form");
  if (form && !form._bound) {
    form.addEventListener("submit", handleSubmitOrder);
    form._bound = true;
  }

  // auto refresh dashboard every 5 seconds (simple "real-time")
  if (!window.__dashboardTimer) {
    window.__dashboardTimer = setInterval(() => {
      loadClientDashboard();
    }, 5000);
  }
}

// Setup WebSocket event listeners
function setupWebSocketListeners() {
  if (!window.wsService) return;

  wsService.on("delivery_status_updated", (data) => {
    updateOrderInList(data.orderId, data.status);
    updateDashboardStats();
  });

  wsService.on("order_created", (data) => {
    if (data.orderId) loadClientDashboard();
  });
}

// Load dashboard data
async function loadClientDashboard() {
  try {
    const response = await apiClient.get("/api/orders");
    clientOrders = response.orders || [];

    updateDashboardStats();
    displayRecentOrders();
    displayAllOrders();
  } catch (error) {
    console.error("Failed to load dashboard:", error);
    showToast("Failed to load dashboard data", "error");
  }
}

// Update dashboard statistics
function updateDashboardStats() {
  const stats = {
    total: clientOrders.length,
    active: clientOrders.filter((o) => ["in_transit", "out_for_delivery"].includes(o.status)).length,
    completed: clientOrders.filter((o) => o.status === "delivered").length,
    pending: clientOrders.filter((o) => o.status === "pending").length
  };

  const totalEl = document.getElementById("total-orders");
  const activeEl = document.getElementById("active-deliveries");
  const completedEl = document.getElementById("completed-deliveries");
  const pendingEl = document.getElementById("pending-orders");

  if (totalEl) totalEl.textContent = stats.total;
  if (activeEl) activeEl.textContent = stats.active;
  if (completedEl) completedEl.textContent = stats.completed;
  if (pendingEl) pendingEl.textContent = stats.pending;
}

// Display recent orders on dashboard
function displayRecentOrders() {
  const container = document.getElementById("recent-orders-list");
  if (!container) return;

  const recentOrders = clientOrders.slice(0, 5);
  container.innerHTML = recentOrders.map((order) => createOrderCard(order)).join("");
}

// Display all orders in track orders tab
function displayAllOrders() {
  const container = document.getElementById("orders-list");
  if (!container) return;

  if (clientOrders.length === 0) {
    container.innerHTML = '<p class="empty-state">No orders found. Submit your first order!</p>';
    return;
  }

  container.innerHTML = clientOrders.map((order) => createOrderCard(order)).join("");
}

// Create order card HTML
function createOrderCard(order) {
  const status = order.status || "pending";
  const statusClass = `status-${status}`;
  const statusText = status.replaceAll("_", " ").toUpperCase();
  const date = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A";

  const address =
    typeof order.deliveryAddress === "string"
      ? order.deliveryAddress
      : order.deliveryAddress
      ? `${order.deliveryAddress.street ?? ""}, ${order.deliveryAddress.city ?? ""}`
      : "N/A";

  return `
    <div class="order-card" onclick="showOrderDetail('${order.id}')">
      <div class="order-header">
        <div class="order-id">Order #<span class="mono">${order.id}</span></div>
        <span class="status-badge ${statusClass}">${statusText}</span>
      </div>
      <div class="order-info muted" style="margin-top:8px;">
        <div><strong>Customer:</strong> ${order.customerName || "N/A"}</div>
        <div><strong>Address:</strong> ${address}</div>
        <div><strong>Created:</strong> ${date}</div>
      </div>
    </div>
  `;
}

// Update order in list
function updateOrderInList(orderId, status) {
  const order = clientOrders.find((o) => o.id === orderId);
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
    customerName: document.getElementById("customer-name").value,
    customerEmail: document.getElementById("customer-email").value,
    deliveryAddress: {
      street: document.getElementById("delivery-street").value,
      city: document.getElementById("delivery-city").value,
      state: document.getElementById("delivery-state").value,
      zipCode: document.getElementById("delivery-zip").value
    },
    packageDetails: {
      weight: parseFloat(document.getElementById("package-weight").value),
      description: document.getElementById("package-description").value
    },
    priority: document.getElementById("order-priority").value
  };

  try {
    showToast("Submitting order...", "info");
    const response = await apiClient.post("/api/orders", orderData);

    if (response.orderId) {
      showToast(`Order ${response.orderId} created successfully!`, "success");

      const newOrder = {
        id: response.orderId,
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        deliveryAddress: `${orderData.deliveryAddress.street}, ${orderData.deliveryAddress.city}`,
        status: response.status || "pending",
        createdAt: new Date().toISOString()
      };

      clientOrders.unshift(newOrder);
      updateDashboardStats();
      displayRecentOrders();
      displayAllOrders();

      if (window.wsService) {
        wsService.subscribe(response.orderId, (update) => {
          updateOrderInList(response.orderId, update.status);
        });
      }

      document.getElementById("submit-order-form").reset();
      showClientTab("track-orders");
    } else {
      showToast("Backend did not return orderId", "error");
    }
  } catch (error) {
    console.error("Failed to submit order:", error);
    showToast(error.message || "Failed to submit order", "error");
  }
}

// Show order detail modal
function showOrderDetail(orderId) {
  const order = clientOrders.find((o) => o.id === orderId);
  if (!order) {
    showToast("Order not found", "error");
    return;
  }

  const modal = document.getElementById("order-detail-modal");
  const content = document.getElementById("order-detail-content");
  if (!modal || !content) return;

  const status = order.status || "pending";
  const statusClass = `status-${status}`;
  const statusText = status.replaceAll("_", " ").toUpperCase();

  const address =
    typeof order.deliveryAddress === "string"
      ? order.deliveryAddress
      : order.deliveryAddress
      ? `${order.deliveryAddress.street ?? ""}, ${order.deliveryAddress.city ?? ""}`
      : "N/A";

  content.innerHTML = `
    <h2 style="margin-top:0;">Order Details</h2>
    <div class="card">
      <div class="row">
        <div><strong>Order ID:</strong> <span class="mono">${order.id}</span></div>
        <div><span class="status-badge ${statusClass}">${statusText}</span></div>
      </div>
      <div style="margin-top:8px;">
        <div><strong>Customer:</strong> ${order.customerName || "N/A"}</div>
        <div><strong>Email:</strong> ${order.customerEmail || "N/A"}</div>
        <div><strong>Delivery Address:</strong> ${address}</div>
        <div><strong>Created:</strong> ${order.createdAt ? new Date(order.createdAt).toLocaleString() : "N/A"}</div>
      </div>
    </div>
  `;

  modal.classList.add("active");
}

// Search orders
function searchOrders() {
  const searchTerm = document.getElementById("order-search")?.value.toLowerCase() || "";
  const container = document.getElementById("orders-list");
  if (!container) return;

  if (!searchTerm) {
    displayAllOrders();
    return;
  }

  const filtered = clientOrders.filter(
    (order) =>
      (order.id && order.id.toLowerCase().includes(searchTerm)) ||
      (order.customerName && order.customerName.toLowerCase().includes(searchTerm))
  );

  if (filtered.length === 0) {
    container.innerHTML = '<p class="empty-state">No orders found matching your search.</p>';
    return;
  }

  container.innerHTML = filtered.map((order) => createOrderCard(order)).join("");
}

// Show client tab
function showClientTab(tabName) {
  document.querySelectorAll(".tab-content").forEach((tab) => tab.classList.remove("active"));
  document.querySelectorAll(".tabBtn").forEach((btn) => btn.classList.remove("active"));

  const tab = document.getElementById(`client-${tabName}`);
  if (tab) tab.classList.add("active");

  // Activate button based on order
  const buttons = Array.from(document.querySelectorAll(".tabBtn"));
  const map = { dashboard: 0, "track-orders": 1, "submit-order": 2 };
  const idx = map[tabName];
  if (idx !== undefined && buttons[idx]) buttons[idx].classList.add("active");

  if (tabName === "track-orders") displayAllOrders();
}

// Export functions (your snippet expects these)
window.searchOrders = searchOrders;
window.showClientTab = showClientTab;
window.showOrderDetail = showOrderDetail;
window.handleSubmitOrder = handleSubmitOrder;
window.initClientPortal = initClientPortal;