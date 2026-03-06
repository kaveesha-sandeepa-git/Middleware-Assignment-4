// WebSocket Service for Real-Time Updates
class WebSocketService {
    constructor() {
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 5000;
        this.subscriptions = new Map();
        this.eventHandlers = new Map();
        this.isConnected = false;
        this.mockMode = window.CONFIG?.MOCK_MODE || false;
    }

    connect() {
        if (this.mockMode) {
            this.simulateMockConnection();
            return;
        }

        const token = localStorage.getItem('authToken');
        if (!token) {
            console.warn('No auth token available for WebSocket connection');
            return;
        }

        const wsUrl = `${window.CONFIG?.WS_URL || 'wss://api.swifttrack.com/updates'}?token=${token}`;
        
        try {
            this.ws = new WebSocket(wsUrl);

            this.ws.onopen = () => {
                console.log('WebSocket connected');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                
                // Authenticate connection
                this.send({
                    type: 'auth',
                    token: token,
                });
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleMessage(data);
                } catch (error) {
                    console.error('Failed to parse WebSocket message:', error);
                }
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

            this.ws.onclose = () => {
                console.log('WebSocket disconnected');
                this.isConnected = false;
                this.attemptReconnect();
            };
        } catch (error) {
            console.error('Failed to create WebSocket connection:', error);
            if (this.mockMode) {
                this.simulateMockConnection();
            }
        }
    }

    simulateMockConnection() {
        console.log('WebSocket: Mock mode enabled');
        this.isConnected = true;
        
        // Simulate receiving updates periodically
        setInterval(() => {
            // Simulate random status updates for demo
            if (Math.random() > 0.95) { // 5% chance every interval
                const mockEvents = [
                    {
                        event: 'delivery_status_updated',
                        orderId: 'ORD001',
                        status: 'in_transit',
                        timestamp: new Date().toISOString()
                    },
                    {
                        event: 'delivery_status_updated',
                        orderId: 'ORD002',
                        status: 'out_for_delivery',
                        timestamp: new Date().toISOString()
                    }
                ];
                
                const randomEvent = mockEvents[Math.floor(Math.random() * mockEvents.length)];
                this.handleMessage(randomEvent);
            }
        }, 5000);
    }

    send(message) {
        if (this.mockMode) {
            console.log('WebSocket send (mock):', message);
            return;
        }

        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        } else {
            console.warn('WebSocket not connected, message not sent:', message);
        }
    }

    subscribe(orderId, callback) {
        this.subscriptions.set(orderId, callback);
        
        this.send({
            type: 'subscribe',
            orderId: orderId,
        });
    }

    unsubscribe(orderId) {
        this.subscriptions.delete(orderId);
        
        this.send({
            type: 'unsubscribe',
            orderId: orderId,
        });
    }

    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event).push(handler);
    }

    off(event, handler) {
        const handlers = this.eventHandlers.get(event);
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }

    handleMessage(data) {
        console.log('WebSocket message received:', data);

        const { event, orderId } = data;

        // Call subscription callback if exists
        if (orderId) {
            const callback = this.subscriptions.get(orderId);
            if (callback) {
                callback(data);
            }
        }

        // Trigger global event handlers
        if (event) {
            const handlers = this.eventHandlers.get(event) || [];
            handlers.forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error('Error in event handler:', error);
                }
            });
        }

        // Handle specific events
        switch (event) {
            case 'order_created':
                this.handleOrderCreated(data);
                break;
            case 'delivery_status_updated':
                this.handleStatusUpdate(data);
                break;
            case 'driver_assigned':
                this.handleDriverAssignment(data);
                break;
            case 'location_updated':
                this.handleLocationUpdate(data);
                break;
            case 'delivery_completed':
                this.handleDeliveryCompleted(data);
                break;
            default:
                console.log('Unknown event:', event);
        }
    }

    handleOrderCreated(data) {
        showToast('New order created: ' + data.orderId, 'success');
    }

    handleStatusUpdate(data) {
        const { orderId, status } = data;
        showToast(`Order ${orderId} status updated: ${status}`, 'success');
        
        // Update UI if order is displayed
        updateOrderStatusUI(orderId, status);
    }

    handleDriverAssignment(data) {
        showToast('Driver assigned to order: ' + data.orderId, 'success');
    }

    handleLocationUpdate(data) {
        // Update driver location on map if displayed
        console.log('Location update:', data);
    }

    handleDeliveryCompleted(data) {
        showToast('Delivery completed: ' + data.orderId, 'success');
    }

    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            setTimeout(() => {
                console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
                this.connect();
            }, this.reconnectDelay);
        } else {
            console.error('Max reconnection attempts reached');
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.isConnected = false;
    }
}

// Helper function to update order status in UI
function updateOrderStatusUI(orderId, status) {
    // Find and update order card
    const orderCards = document.querySelectorAll('.order-card');
    orderCards.forEach(card => {
        const idElement = card.querySelector('.order-id');
        if (idElement && idElement.textContent.includes(orderId)) {
            const statusBadge = card.querySelector('.status-badge');
            if (statusBadge) {
                statusBadge.className = `status-badge status-${status}`;
                statusBadge.textContent = status.replace('_', ' ').toUpperCase();
            }
        }
    });

    // Update dashboard stats
    updateDashboardStats();
}

// Helper function to update dashboard statistics
function updateDashboardStats() {
    const orders = document.querySelectorAll('.order-card');
    const stats = {
        total: orders.length,
        active: 0,
        completed: 0,
        pending: 0
    };

    orders.forEach(order => {
        const statusBadge = order.querySelector('.status-badge');
        if (statusBadge) {
            const status = statusBadge.className.includes('delivered') ? 'delivered' :
                          statusBadge.className.includes('in_transit') || statusBadge.className.includes('out_for_delivery') ? 'active' :
                          statusBadge.className.includes('pending') ? 'pending' : '';
            
            if (status === 'delivered') stats.completed++;
            else if (status === 'active') stats.active++;
            else if (status === 'pending') stats.pending++;
        }
    });

    // Update stat cards
    const totalEl = document.getElementById('total-orders');
    const activeEl = document.getElementById('active-deliveries');
    const completedEl = document.getElementById('completed-deliveries');
    const pendingEl = document.getElementById('pending-orders');

    if (totalEl) totalEl.textContent = stats.total;
    if (activeEl) activeEl.textContent = stats.active;
    if (completedEl) completedEl.textContent = stats.completed;
    if (pendingEl) pendingEl.textContent = stats.pending;
}

// Create singleton instance
const wsService = new WebSocketService();
window.wsService = wsService;
