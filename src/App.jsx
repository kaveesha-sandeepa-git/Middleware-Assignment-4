import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';

const PAGES = {
  LANDING: 'landing',
  CLIENT_LOGIN: 'client-login',
  DRIVER_LOGIN: 'driver-login',
  CLIENT_PORTAL: 'client-portal',
  DRIVER_PORTAL: 'driver-portal'
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

function normalizeStatus(status) {
  if (!status) return 'pending';
  return String(status).toLowerCase();
}

function mapTrackingOrder(order) {
  const orderId = order.orderId ?? order.id;
  return {
    id: String(orderId),
    orderId: Number(orderId),
    customerName: order.customerName || 'N/A',
    deliveryAddress: order.deliveryAddress || order.destination || 'N/A',
    status: normalizeStatus(order.status),
    createdAt: order.createdAt || null,
    routeId: order.routeId || null,
    estimatedDuration: order.estimatedDuration || null,
    totalDistance: order.totalDistance || null
  };
}

function App() {
  const [currentPage, setCurrentPage] = useState(PAGES.LANDING);
  const [userType, setUserType] = useState(null);
  const [clientUser, setClientUser] = useState(null);
  const [driverUser, setDriverUser] = useState(null);
  const [clientOrders, setClientOrders] = useState([]);
  const [driverDeliveries, setDriverDeliveries] = useState([]);
  const [clientTab, setClientTab] = useState('dashboard');
  const [driverTab, setDriverTab] = useState('deliveries');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [orderSearch, setOrderSearch] = useState('');
  const [deliverySearch, setDeliverySearch] = useState('');
  const [trackingConnected, setTrackingConnected] = useState(false);
  const [driverTrackingConnected, setDriverTrackingConnected] = useState(false);
  const [trackingError, setTrackingError] = useState('');
  const [driverTrackingError, setDriverTrackingError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDriverRefreshing, setIsDriverRefreshing] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [statusUpdateError, setStatusUpdateError] = useState('');
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState('');
  const streamRef = useRef(null);
  const driverStreamRef = useRef(null);

  const reconnectTrackingStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.close();
    }
    const stream = new EventSource(`${API_BASE_URL}/api/tracking/stream`);
    streamRef.current = stream;
    setTrackingConnected(true);

    stream.addEventListener('tracking_snapshot', (event) => {
      try {
        const payload = JSON.parse(event.data);
        const snapshot = Array.isArray(payload) ? payload.map(mapTrackingOrder) : [];
        setClientOrders(snapshot);
        setTrackingError('');
      } catch (error) {
        setTrackingError('Invalid realtime snapshot payload');
      }
    });

    stream.addEventListener('tracking_update', (event) => {
      try {
        const payload = mapTrackingOrder(JSON.parse(event.data));
        setClientOrders((prev) => {
          const index = prev.findIndex((order) => order.id === payload.id);
          if (index === -1) {
            return [payload, ...prev];
          }
          const updated = [...prev];
          updated[index] = { ...updated[index], ...payload };
          return updated;
        });
        setTrackingError('');
      } catch (error) {
        setTrackingError('Invalid realtime update payload');
      }
    });

    stream.onerror = () => {
      setTrackingConnected(false);
      setTrackingError('Realtime stream disconnected. Reconnecting...');
    };

    stream.onopen = () => {
      setTrackingConnected(true);
      setTrackingError('');
    };
  }, []);

  const refreshTrackingOrders = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/tracking/orders`);
      if (!response.ok) {
        throw new Error(`Failed loading tracking orders (${response.status})`);
      }
      const data = await response.json();
      const orders = Array.isArray(data.orders) ? data.orders.map(mapTrackingOrder) : [];
      setClientOrders(orders);
      setTrackingError('');
      reconnectTrackingStream();
    } catch (error) {
      const msg = error.message || 'Unable to load tracking orders';
      setTrackingError(msg);
    } finally {
      setIsRefreshing(false);
    }
  }, [reconnectTrackingStream]);

  const reconnectDriverStream = useCallback(() => {
    if (driverStreamRef.current) {
      driverStreamRef.current.close();
    }
    const stream = new EventSource(`${API_BASE_URL}/api/tracking/stream`);
    driverStreamRef.current = stream;
    setDriverTrackingConnected(true);

    stream.addEventListener('tracking_snapshot', (event) => {
      try {
        const payload = JSON.parse(event.data);
        const snapshot = Array.isArray(payload) ? payload.map(mapTrackingOrder) : [];
        setDriverDeliveries(snapshot);
        setDriverTrackingError('');
      } catch (error) {
        setDriverTrackingError('Invalid realtime snapshot payload');
      }
    });

    stream.addEventListener('tracking_update', (event) => {
      try {
        const payload = mapTrackingOrder(JSON.parse(event.data));
        setDriverDeliveries((prev) => {
          const index = prev.findIndex((order) => order.id === payload.id);
          if (index === -1) {
            return [payload, ...prev];
          }
          const updated = [...prev];
          updated[index] = { ...updated[index], ...payload };
          return updated;
        });
        setDriverTrackingError('');
      } catch (error) {
        setDriverTrackingError('Invalid realtime update payload');
      }
    });

    stream.onerror = () => {
      setDriverTrackingConnected(false);
      setDriverTrackingError('Realtime stream disconnected. Reconnecting...');
    };

    stream.onopen = () => {
      setDriverTrackingConnected(true);
      setDriverTrackingError('');
    };
  }, []);

  const refreshDriverDeliveries = useCallback(async () => {
    setIsDriverRefreshing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/tracking/orders`);
      if (!response.ok) {
        throw new Error(`Failed loading deliveries (${response.status})`);
      }
      const data = await response.json();
      const orders = Array.isArray(data.orders) ? data.orders.map(mapTrackingOrder) : [];
      setDriverDeliveries(orders);
      setDriverTrackingError('');
      reconnectDriverStream();
    } catch (error) {
      const msg = error.message || 'Unable to load deliveries';
      setDriverTrackingError(msg);
    } finally {
      setIsDriverRefreshing(false);
    }
  }, [reconnectDriverStream]);

  useEffect(() => {
    if (currentPage !== PAGES.CLIENT_PORTAL) {
      return undefined;
    }
    refreshTrackingOrders();
    return () => {
      if (streamRef.current) {
        streamRef.current.close();
      }
    };
  }, [currentPage, refreshTrackingOrders]);

  useEffect(() => {
    if (currentPage !== PAGES.DRIVER_PORTAL) {
      return undefined;
    }
    refreshDriverDeliveries();
    return () => {
      if (driverStreamRef.current) {
        driverStreamRef.current.close();
      }
    };
  }, [currentPage, refreshDriverDeliveries]);

  const handleSelectPortal = (type) => {
    if (type === 'client') {
      setCurrentPage(PAGES.CLIENT_LOGIN);
      setUserType('client');
    } else {
      setCurrentPage(PAGES.DRIVER_LOGIN);
      setUserType('driver');
    }
  };

  const handleClientLogin = (event) => {
    event.preventDefault();
    const form = event.target;
    const email = form.elements.email.value;
    const password = form.elements.password.value;
    if (!email || !password) return;
    const user = { email, name: email.split('@')[0] || 'Client' };
    setClientUser(user);
    setUserType('client');
    setClientTab('dashboard');
    setCurrentPage(PAGES.CLIENT_PORTAL);
  };

  const handleDriverLogin = (event) => {
    event.preventDefault();
    const form = event.target;
    const driverId = form.elements.driverId.value;
    const password = form.elements.password.value;
    if (!driverId || !password) return;
    const user = { id: driverId };
    setDriverUser(user);
    setUserType('driver');
    setDriverTab('deliveries');
    setCurrentPage(PAGES.DRIVER_PORTAL);
    // Will load deliveries via useEffect when portal is mounted
  };

  const handleLogout = () => {
    setClientUser(null);
    setDriverUser(null);
    setClientOrders([]);
    setDriverDeliveries([]);
    setCurrentPage(PAGES.LANDING);
    setUserType(null);
    setClientTab('dashboard');
    setDriverTab('deliveries');
  };

  const handleSubmitOrder = async (event) => {
    event.preventDefault();
    const form = event.target;
    const customerName = form.elements.customerName?.value || clientUser?.name;
    const destination = form.elements.destination?.value;
    const address = form.elements.address?.value;

    if (!customerName || !destination || !address) {
      setSubmitError('Please fill in all required fields');
      return;
    }

    try {
      // Create order via backend
      const response = await fetch(`${API_BASE_URL}/api/tracking/demo/seed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 1 })
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      setSubmitSuccess('Order submitted successfully!');
      setSubmitError('');
      form.reset();
      
      // Refresh orders to show the new one
      refreshTrackingOrders();
      
      setTimeout(() => setSubmitSuccess(''), 3000);
    } catch (error) {
      setSubmitError('Failed to submit order. Please try again.');
      console.error('Order submission error:', error);
    }
  };

  const loadMoreDemoOrders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tracking/demo/seed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 1 })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to load demo orders (${response.status})`);
      }
      
      // Refresh the orders after seeding
      refreshTrackingOrders();
      refreshDriverDeliveries();
    } catch (error) {
      console.error('Error loading demo orders:', error);
      setTrackingError('Failed to load more orders');
    }
  };

  const filteredOrders = useMemo(() => {
    if (!orderSearch.trim()) {
      return clientOrders;
    }
    const query = orderSearch.toLowerCase();
    return clientOrders.filter((order) => {
      const orderId = String(order.orderId).toLowerCase();
      const customerName = (order.customerName || '').toLowerCase();
      return orderId.includes(query) || customerName.includes(query);
    });
  }, [clientOrders, orderSearch]);

  const filteredDeliveries = useMemo(() => {
    if (!deliverySearch.trim()) {
      return driverDeliveries;
    }
    const query = deliverySearch.toLowerCase();
    return driverDeliveries.filter((delivery) => {
      const orderId = String(delivery.orderId).toLowerCase();
      const customerName = (delivery.customerName || '').toLowerCase();
      return orderId.includes(query) || customerName.includes(query);
    });
  }, [driverDeliveries, deliverySearch]);

  const handleStatusUpdate = (delivery, newStatus) => {
    const validStatuses = ['assigned', 'picked_up', 'in_transit', 'completed'];
    if (!validStatuses.includes(newStatus)) {
      setStatusUpdateError('Invalid status');
      return;
    }

    // Optimistic UI update
    setDriverDeliveries((prev) => {
      const updated = [...prev];
      const index = updated.findIndex((d) => d.id === delivery.id);
      if (index !== -1) {
        updated[index] = { ...updated[index], status: newStatus };
      }
      return updated;
    });

    // Update the selected delivery modal if open
    if (selectedDelivery?.id === delivery.id) {
      setSelectedDelivery({ ...selectedDelivery, status: newStatus });
    }

    // Persist to backend
    const updatePayload = {
      orderId: delivery.orderId,
      status: newStatus,
      updatedAt: new Date().toISOString()
    };

    fetch(`${API_BASE_URL}/api/tracking/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatePayload)
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Status update failed (${response.status})`);
        }
        setStatusUpdateSuccess(`Order marked as ${newStatus.replace('_', ' ').toUpperCase()}`);
        setStatusUpdateError('');
        setTimeout(() => setStatusUpdateSuccess(''), 3000);
      })
      .catch((error) => {
        const msg = error.message || 'Failed to update status';
        setStatusUpdateError(msg);
        // Revert optimistic update on error
        setDriverDeliveries((prev) => {
          const updated = [...prev];
          const index = updated.findIndex((d) => d.id === delivery.id);
          if (index !== -1) {
            updated[index] = { ...updated[index], status: delivery.status };
          }
          return updated;
        });
        if (selectedDelivery?.id === delivery.id) {
          setSelectedDelivery(delivery);
        }
      });
  };

  const renderOrderCard = (order) => (
    <div key={order.id} className="order-card" onClick={() => setSelectedOrder(order)}>
      <div className="order-header">
        <h3>Order #{order.orderId}</h3>
        <span className={`order-status status-${order.status}`}>{order.status.toUpperCase()}</span>
      </div>
      <p><strong>Customer:</strong> {order.customerName}</p>
      <p><strong>Address:</strong> {order.deliveryAddress}</p>
      <p><strong>Route ID:</strong> {order.routeId || 'N/A'}</p>
      <p><strong>ETA:</strong> {order.estimatedDuration ? `${order.estimatedDuration} min` : 'N/A'}</p>
      <p><strong>Distance:</strong> {order.totalDistance ? `${order.totalDistance.toFixed(1)} km` : 'N/A'}</p>
    </div>
  );

  const renderLanding = () => (
    <div className="landing-container">
      <div className="landing-content">
        <h1>🚚 SwiftTrack</h1>
        <p>Real-time Delivery Tracking & Management</p>
        <div className="portal-buttons">
          <button className="btn btn-primary" onClick={() => handleSelectPortal('client')}>
            Client Portal
          </button>
          <button className="btn btn-secondary" onClick={() => handleSelectPortal('driver')}>
            Driver Portal
          </button>
        </div>
      </div>
    </div>
  );

  const renderClientLogin = () => (
    <div className="login-container">
      <div className="login-card">
        <h2>Client Portal</h2>
        <form onSubmit={handleClientLogin}>
          <label>Email:</label>
          <input type="email" name="email" required />
          <label>Password:</label>
          <input type="password" name="password" required />
          <button type="submit" className="btn btn-primary">Login</button>
        </form>
        <button className="btn btn-link" onClick={() => setCurrentPage(PAGES.LANDING)}>Back</button>
      </div>
    </div>
  );

  const renderDriverLogin = () => (
    <div className="login-container">
      <div className="login-card">
        <h2>Driver Portal</h2>
        <form onSubmit={handleDriverLogin}>
          <label>Driver ID:</label>
          <input type="text" name="driverId" required />
          <label>Password:</label>
          <input type="password" name="password" required />
          <button type="submit" className="btn btn-primary">Login</button>
        </form>
        <button className="btn btn-link" onClick={() => setCurrentPage(PAGES.LANDING)}>Back</button>
      </div>
    </div>
  );

  const renderClientPortal = () => (
    <div className="portal-container">
      <div className="portal-header">
        <h1>Client Portal</h1>
        <div className="header-user">
          <span>{clientUser?.name || 'Client'}</span>
          <button className="btn btn-sm" onClick={handleLogout}>Logout</button>
        </div>
      </div>
      <div className="portal-content">
        <div className="sidebar">
          <div className={'sidebar-item' + (clientTab === 'dashboard' ? ' active' : '')} onClick={() => setClientTab('dashboard')}>
            <span className="sidebar-icon">📊</span>
            <span className="sidebar-text">Dashboard</span>
          </div>
          <div className={'sidebar-item' + (clientTab === 'submit-order' ? ' active' : '')} onClick={() => setClientTab('submit-order')}>
            <span className="sidebar-icon">📝</span>
            <span className="sidebar-text">Submit Order</span>
          </div>
          <div className={'sidebar-item' + (clientTab === 'track-orders' ? ' active' : '')} onClick={() => setClientTab('track-orders')}>
            <span className="sidebar-icon">📍</span>
            <span className="sidebar-text">Track Orders</span>
          </div>
        </div>

        <div className="main-content">
          {clientTab === 'dashboard' && (
            <div className="tab-content active">
              <h2>Dashboard</h2>
              <p>Welcome to SwiftTrack Client Portal</p>
            </div>
          )}

          {clientTab === 'submit-order' && (
            <div className="tab-content active">
              <h2>Submit New Order</h2>
              {submitSuccess && <p className="submit-success">{submitSuccess}</p>}
              {submitError && <p className="submit-error">{submitError}</p>}
              <form onSubmit={handleSubmitOrder} className="order-form">
                <div className="form-group">
                  <label>Customer Name:</label>
                  <input type="text" name="customerName" defaultValue={clientUser?.name} />
                </div>
                <div className="form-group">
                  <label>Pickup Address:</label>
                  <input type="text" name="address" placeholder="e.g., Warehouse Hub A" required />
                </div>
                <div className="form-group">
                  <label>Delivery Destination:</label>
                  <input type="text" name="destination" placeholder="e.g., 123 Main St, City" required />
                </div>
                <button type="submit" className="btn btn-primary">Submit Order</button>
              </form>
            </div>
          )}

          {clientTab === 'track-orders' && (
            <div className="tab-content active">
              <h2>Track Orders</h2>
              <div className="tracking-meta">
                <span className={'tracking-connection ' + (trackingConnected ? 'tracking-live' : 'tracking-offline')}>
                  {trackingConnected ? 'Live updates connected' : 'Realtime offline'}
                </span>
                <div className="meta-buttons">
                  <button type="button" className="btn btn-sm" onClick={refreshTrackingOrders} disabled={isRefreshing}>
                    {isRefreshing ? 'Refreshing...' : 'Refresh'}
                  </button>
                  <button type="button" className="btn btn-sm btn-secondary" onClick={loadMoreDemoOrders}>
                    + Add Order
                  </button>
                </div>
              </div>
              {trackingError && <p className="tracking-error">{trackingError}</p>}
              <div className="search-box">
                <input type="text" placeholder="Search by Order ID or Customer..." value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} />
              </div>
              <div className="orders-list">
                {filteredOrders.length === 0 ? (
                  <p className="empty-state">No orders found matching your search.</p>
                ) : (
                  filteredOrders.map(renderOrderCard)
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order Details #{selectedOrder.orderId}</h2>
              <button className="close-btn" onClick={() => setSelectedOrder(null)}>×</button>
            </div>
            <div className="modal-body">
              <p><strong>Customer Name:</strong> {selectedOrder.customerName}</p>
              <p><strong>Delivery Address:</strong> {selectedOrder.deliveryAddress}</p>
              <p><strong>Status:</strong> <span className={`order-status status-${selectedOrder.status}`}>{selectedOrder.status.toUpperCase()}</span></p>
              <p><strong>Created At:</strong> {selectedOrder.createdAt || 'N/A'}</p>
              <p><strong>Route ID:</strong> {selectedOrder.routeId || 'N/A'}</p>
              <p><strong>Estimated Duration:</strong> {selectedOrder.estimatedDuration ? `${selectedOrder.estimatedDuration} min` : 'N/A'}</p>
              <p><strong>Total Distance:</strong> {selectedOrder.totalDistance ? `${selectedOrder.totalDistance.toFixed(1)} km` : 'N/A'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderDriverPortal = () => (
    <div className="portal-container">
      <div className="portal-header">
        <h1>Driver Portal</h1>
        <div className="header-user">
          <span>{driverUser?.id || 'Driver'}</span>
          <button className="btn btn-sm" onClick={handleLogout}>Logout</button>
        </div>
      </div>
      <div className="portal-content">
        <div className="sidebar">
          <div className={'sidebar-item' + (driverTab === 'deliveries' ? ' active' : '')} onClick={() => setDriverTab('deliveries')}>
            <span className="sidebar-icon">📦</span>
            <span className="sidebar-text">My Deliveries</span>
          </div>
          <div className={'sidebar-item' + (driverTab === 'completed' ? ' active' : '')} onClick={() => setDriverTab('completed')}>
            <span className="sidebar-icon">✅</span>
            <span className="sidebar-text">Completed</span>
          </div>
        </div>
        <div className="main-content">
          {driverTab === 'deliveries' && (
            <div className="tab-content active">
              <h2>Active Deliveries</h2>
              <div className="tracking-meta">
                <span className={'tracking-connection ' + (driverTrackingConnected ? 'tracking-live' : 'tracking-offline')}>
                  {driverTrackingConnected ? 'Live updates connected' : 'Realtime offline'}
                </span>
                <div className="meta-buttons">
                  <button type="button" className="btn btn-sm" onClick={refreshDriverDeliveries} disabled={isDriverRefreshing}>
                    {isDriverRefreshing ? 'Refreshing...' : 'Refresh'}
                  </button>
                  <button type="button" className="btn btn-sm btn-secondary" onClick={loadMoreDemoOrders}>
                    + Add Order
                  </button>
                </div>
              </div>
              {driverTrackingError && <p className="tracking-error">{driverTrackingError}</p>}
              {statusUpdateSuccess && <p className="submit-success">{statusUpdateSuccess}</p>}
              {statusUpdateError && <p className="submit-error">{statusUpdateError}</p>}
              <div className="search-box">
                <input type="text" placeholder="Search by Order ID or Customer..." value={deliverySearch} onChange={(e) => setDeliverySearch(e.target.value)} />
              </div>
              <div className="deliveries-list">
                {filteredDeliveries.filter((d) => d.status !== 'completed').length === 0 ? (
                  <p className="empty-state">No active deliveries. Great job! 👏</p>
                ) : (
                  filteredDeliveries
                    .filter((d) => d.status !== 'completed')
                    .map((delivery) => (
                      <div key={delivery.id} className="delivery-card">
                        <div className="delivery-header">
                          <div>
                            <h3>Order #{delivery.orderId}</h3>
                            <p className="customer-name">{delivery.customerName}</p>
                          </div>
                          <span className={`order-status status-${delivery.status}`}>{delivery.status.replace('_', ' ').toUpperCase()}</span>
                        </div>
                        <p><strong>📍 Delivery Address:</strong> {delivery.deliveryAddress}</p>
                        <p><strong>Distance:</strong> {delivery.totalDistance ? `${delivery.totalDistance.toFixed(1)} km` : 'Calculating...'}</p>
                        <p><strong>ETA:</strong> {delivery.estimatedDuration ? `${delivery.estimatedDuration} min` : 'Calculating...'}</p>
                        <div className="status-flow">
                          <span className={`flow-step ${delivery.status === 'assigned' || ['picked_up', 'in_transit', 'completed'].includes(delivery.status) ? 'active' : ''}`}>📦 Assigned</span>
                          <span className="flow-arrow">→</span>
                          <span className={`flow-step ${delivery.status === 'picked_up' || ['in_transit', 'completed'].includes(delivery.status) ? 'active' : ''}`}>🚚 Picked Up</span>
                          <span className="flow-arrow">→</span>
                          <span className={`flow-step ${delivery.status === 'in_transit' || delivery.status === 'completed' ? 'active' : ''}`}>🛣️ In Transit</span>
                          <span className="flow-arrow">→</span>
                          <span className={`flow-step ${delivery.status === 'completed' ? 'active' : ''}`}>✅ Completed</span>
                        </div>
                        <div className="delivery-actions">
                          {delivery.status !== 'completed' && (
                            <>
                              {delivery.status === 'assigned' && (
                                <button className="btn btn-sm" onClick={() => handleStatusUpdate(delivery, 'picked_up')}>
                                  📦 Mark as Picked Up
                                </button>
                              )}
                              {delivery.status === 'picked_up' && (
                                <button className="btn btn-sm" onClick={() => handleStatusUpdate(delivery, 'in_transit')}>
                                  🚚 Start Delivery
                                </button>
                              )}
                              {delivery.status === 'in_transit' && (
                                <button className="btn btn-sm btn-success" onClick={() => handleStatusUpdate(delivery, 'completed')}>
                                  ✓ Mark as Completed
                                </button>
                              )}
                            </>
                          )}
                          <button className="btn btn-sm btn-secondary" onClick={() => setSelectedDelivery(delivery)}>
                            View Details
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}

          {driverTab === 'completed' && (
            <div className="tab-content active">
              <h2>Completed Deliveries</h2>
              <div className="deliveries-list">
                {filteredDeliveries.filter((d) => d.status === 'completed').length === 0 ? (
                  <p className="empty-state">No completed deliveries yet.</p>
                ) : (
                  filteredDeliveries
                    .filter((d) => d.status === 'completed')
                    .map((delivery) => (
                      <div key={delivery.id} className="delivery-card completed">
                        <div className="delivery-header">
                          <div>
                            <h3>Order #{delivery.orderId}</h3>
                            <p className="customer-name">{delivery.customerName}</p>
                          </div>
                          <span className={`order-status status-completed`}>COMPLETED ✓</span>
                        </div>
                        <p><strong>📍 Delivery Address:</strong> {delivery.deliveryAddress}</p>
                        <p><strong>Completed:</strong> {delivery.createdAt || 'N/A'}</p>
                        <button className="btn btn-sm btn-secondary" onClick={() => setSelectedDelivery(delivery)}>
                          View Details
                        </button>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedDelivery && (
        <div className="modal-overlay" onClick={() => setSelectedDelivery(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delivery Details - Order #{selectedDelivery.orderId}</h2>
              <button className="close-btn" onClick={() => setSelectedDelivery(null)}>×</button>
            </div>
            <div className="modal-body">
              <p><strong>Customer Name:</strong> {selectedDelivery.customerName}</p>
              <p><strong>Delivery Address:</strong> {selectedDelivery.deliveryAddress}</p>
              <p><strong>Status:</strong> <span className={`order-status status-${selectedDelivery.status}`}>{selectedDelivery.status.replace('_', ' ').toUpperCase()}</span></p>
              <p><strong>Route ID:</strong> {selectedDelivery.routeId || 'N/A'}</p>
              <p><strong>Estimated Duration:</strong> {selectedDelivery.estimatedDuration ? `${selectedDelivery.estimatedDuration} min` : 'N/A'}</p>
              <p><strong>Total Distance:</strong> {selectedDelivery.totalDistance ? `${selectedDelivery.totalDistance.toFixed(1)} km` : 'N/A'}</p>
              <p><strong>Created At:</strong> {selectedDelivery.createdAt || 'N/A'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (currentPage === PAGES.CLIENT_LOGIN) return renderClientLogin();
  if (currentPage === PAGES.DRIVER_LOGIN) return renderDriverLogin();
  if (currentPage === PAGES.CLIENT_PORTAL) return renderClientPortal();
  if (currentPage === PAGES.DRIVER_PORTAL) return renderDriverPortal();
  return renderLanding();
}

export default App;

