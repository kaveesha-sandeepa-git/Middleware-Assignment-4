import React, { useMemo, useState } from 'react';

const PAGES = {
  LANDING: 'landing',
  CLIENT_LOGIN: 'client-login',
  CLIENT_PORTAL: 'client-portal'
};

function App() {
  const [currentPage, setCurrentPage] = useState(PAGES.LANDING);
  const [clientUser, setClientUser] = useState(null);
  const [clientOrders, setClientOrders] = useState([]);
  const [clientTab, setClientTab] = useState('dashboard');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderSearch, setOrderSearch] = useState('');

  const handleClientLogin = (event) => {
    event.preventDefault();
    const form = event.target;
    const email = form.elements.email.value;
    const password = form.elements.password.value;
    if (!email || !password) return;

    const user = { email, name: email.split('@')[0] || 'Client' };
    setClientUser(user);

    // Seed with some mock orders
    setClientOrders([
      {
        id: 'ORD001',
        customerName: 'John Doe',
        deliveryAddress: '123 Main St, City, State 12345',
        status: 'pending',
        createdAt: new Date().toISOString()
      },
      {
        id: 'ORD002',
        customerName: 'Jane Smith',
        deliveryAddress: '456 Oak Ave, City, State 12345',
        status: 'in_transit',
        createdAt: new Date(Date.now() - 3600000).toISOString()
      }
    ]);

    setClientTab('dashboard');
    setCurrentPage(PAGES.CLIENT_PORTAL);
  };

  const handleLogout = () => {
    setClientUser(null);
    setCurrentPage(PAGES.LANDING);
  };

  const handleSubmitOrder = (event) => {
    event.preventDefault();
    const form = event.target;

    const customerName = form.elements.customerName.value;
    const customerEmail = form.elements.customerEmail.value;
    const street = form.elements.deliveryStreet.value;
    const city = form.elements.deliveryCity.value;
    const state = form.elements.deliveryState.value;
    const zip = form.elements.deliveryZip.value;
    const weight = parseFloat(form.elements.packageWeight.value || '0');
    const description = form.elements.packageDescription.value;
    const priority = form.elements.orderPriority.value;

    const id = 'ORD' + Date.now();
    const newOrder = {
      id,
      customerName,
      customerEmail,
      deliveryAddress: `${street}, ${city}, ${state} ${zip}`,
      weight,
      description,
      priority,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setClientOrders((prev) => [newOrder, ...prev]);
    form.reset();
    setClientTab('track-orders');
  };

  const dashboardStats = useMemo(() => {
    const total = clientOrders.length;
    const active = clientOrders.filter((o) =>
      ['in_transit', 'out_for_delivery'].includes(o.status)
    ).length;
    const completed = clientOrders.filter((o) => o.status === 'delivered').length;
    const pending = clientOrders.filter((o) => o.status === 'pending').length;
    return { total, active, completed, pending };
  }, [clientOrders]);

  const filteredOrders = useMemo(() => {
    const term = orderSearch.trim().toLowerCase();
    if (!term) return clientOrders;
    return clientOrders.filter((order) => {
      const id = (order.id || '').toLowerCase();
      const name = (order.customerName || '').toLowerCase();
      return id.includes(term) || name.includes(term);
    });
  }, [clientOrders, orderSearch]);

  const renderOrderCard = (order) => {
    const statusClass = `status-${order.status || 'pending'}`;
    const statusText = (order.status || 'pending').replace('_', ' ').toUpperCase();
    const date = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A';

    return (
      <div
        key={order.id}
        className="order-card"
        onClick={() => setSelectedOrder(order)}
      >
        <div className="order-header">
          <div className="order-id">Order #{order.id}</div>
          <span className={`status-badge ${statusClass}`}>{statusText}</span>
        </div>
        <div className="order-info">
          <div>
            <strong>Customer:</strong> {order.customerName || 'N/A'}
          </div>
          <div>
            <strong>Address:</strong> {order.deliveryAddress || 'N/A'}
          </div>
          <div>
            <strong>Created:</strong> {date}
          </div>
        </div>
      </div>
    );
  };

  const renderLanding = () => (
    <div className="page active">
      <div className="landing-container">
        <div className="logo">
          <h1>🚚 SwiftTrack</h1>
          <p>Efficient Delivery Management System</p>
        </div>
        <div className="landing-options">
          <div
            className="option-card"
            onClick={() => setCurrentPage(PAGES.CLIENT_LOGIN)}
          >
            <div className="card-icon">💼</div>
            <h2>Client Portal</h2>
            <p>For businesses managing deliveries</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderClientLogin = () => (
    <div className="page active">
      <div className="login-container">
        <div className="login-box">
          <h2>Client Portal Login</h2>
          <form onSubmit={handleClientLogin}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" required />
            </div>
            <button type="submit" className="btn btn-primary">
              Login
            </button>
          </form>
          <button
            className="btn btn-link"
            onClick={() => setCurrentPage(PAGES.LANDING)}
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );

  const renderClientPortal = () => (
    <div className="page active">
      <nav className="navbar">
        <div className="nav-brand">SwiftTrack Client Portal</div>
        <div className="nav-user">
          <span>{clientUser?.name || clientUser?.email || 'User'}</span>
          <button className="btn btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>
      <div className="dashboard-layout">
        <aside className="sidebar">
          <div className="sidebar-header">
            <h3>Menu</h3>
          </div>
          <nav className="sidebar-nav">
            <button
              type="button"
              className={
                'sidebar-item' + (clientTab === 'dashboard' ? ' active' : '')
              }
              onClick={() => setClientTab('dashboard')}
            >
              <span className="sidebar-icon">📊</span>
              <span className="sidebar-text">Dashboard</span>
            </button>
            <button
              type="button"
              className={
                'sidebar-item' + (clientTab === 'submit-order' ? ' active' : '')
              }
              onClick={() => setClientTab('submit-order')}
            >
              <span className="sidebar-icon">➕</span>
              <span className="sidebar-text">Submit Order</span>
            </button>
            <button
              type="button"
              className={
                'sidebar-item' + (clientTab === 'track-orders' ? ' active' : '')
              }
              onClick={() => setClientTab('track-orders')}
            >
              <span className="sidebar-icon">📍</span>
              <span className="sidebar-text">Track Orders</span>
            </button>
          </nav>
        </aside>
        <div className="main-content">
          <div className="container">
            {clientTab === 'dashboard' && (
              <div className="tab-content active">
                <h2>Dashboard</h2>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-value">{dashboardStats.total}</div>
                    <div className="stat-label">Total Orders</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{dashboardStats.active}</div>
                    <div className="stat-label">Active Deliveries</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{dashboardStats.completed}</div>
                    <div className="stat-label">Completed</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{dashboardStats.pending}</div>
                    <div className="stat-label">Pending</div>
                  </div>
                </div>
                <div className="section">
                  <h3>Recent Orders</h3>
                  <div className="orders-list">
                    {clientOrders.slice(0, 5).length === 0 ? (
                      <p className="empty-state">
                        No orders yet. Submit your first order!
                      </p>
                    ) : (
                      clientOrders.slice(0, 5).map(renderOrderCard)
                    )}
                  </div>
                </div>
              </div>
            )}
            {clientTab === 'submit-order' && (
              <div className="tab-content active">
                <h2>Submit New Order</h2>
                <form
                  className="order-form"
                  onSubmit={handleSubmitOrder}
                  id="submit-order-form"
                >
                  <div className="form-row">
                    <div className="form-group">
                      <label>Customer Name *</label>
                      <input type="text" name="customerName" required />
                    </div>
                    <div className="form-group">
                      <label>Customer Email *</label>
                      <input type="email" name="customerEmail" required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Delivery Address *</label>
                    <input
                      type="text"
                      name="deliveryStreet"
                      placeholder="Street Address"
                      required
                    />
                    <div className="form-row">
                      <input
                        type="text"
                        name="deliveryCity"
                        placeholder="City"
                        required
                      />
                      <input
                        type="text"
                        name="deliveryState"
                        placeholder="State"
                        required
                      />
                      <input
                        type="text"
                        name="deliveryZip"
                        placeholder="ZIP Code"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Package Weight (kg) *</label>
                      <input
                        type="number"
                        name="packageWeight"
                        step="0.1"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Priority *</label>
                      <select name="orderPriority" required defaultValue="standard">
                        <option value="standard">Standard</option>
                        <option value="express">Express</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Package Description</label>
                    <textarea name="packageDescription" rows="3" />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary btn-large"
                  >
                    Submit Order
                  </button>
                </form>
              </div>
            )}
            {clientTab === 'track-orders' && (
              <div className="tab-content active">
                <h2>Track Orders</h2>
                <div className="search-box">
                  <input
                    type="text"
                    placeholder="Search by Order ID or Customer..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                  />
                </div>
                <div className="orders-list">
                  {filteredOrders.length === 0 ? (
                    <p className="empty-state">
                      No orders found matching your search.
                    </p>
                  ) : (
                    filteredOrders.map(renderOrderCard)
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {selectedOrder && (
        <div className="modal active" onClick={() => setSelectedOrder(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <span
              className="close"
              onClick={() => setSelectedOrder(null)}
            >
              &times;
            </span>
            <h2>Order Details</h2>
            <div className="order-detail">
              <div className="detail-row">
                <strong>Order ID:</strong> {selectedOrder.id}
              </div>
              <div className="detail-row">
                <strong>Status:</strong>{' '}
                <span
                  className={`status-badge status-${
                    selectedOrder.status || 'pending'
                  }`}
                >
                  {(selectedOrder.status || 'pending')
                    .replace('_', ' ')
                    .toUpperCase()}
                </span>
              </div>
              <div className="detail-row">
                <strong>Customer:</strong>{' '}
                {selectedOrder.customerName || 'N/A'}
              </div>
              <div className="detail-row">
                <strong>Delivery Address:</strong>{' '}
                {selectedOrder.deliveryAddress || 'N/A'}
              </div>
              <div className="detail-row">
                <strong>Created:</strong>{' '}
                {selectedOrder.createdAt
                  ? new Date(selectedOrder.createdAt).toLocaleString()
                  : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (currentPage === PAGES.CLIENT_LOGIN) return renderClientLogin();
  if (currentPage === PAGES.CLIENT_PORTAL) return renderClientPortal();
  return renderLanding();
}

export default App;

