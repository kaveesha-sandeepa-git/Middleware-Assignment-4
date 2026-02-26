// API Client for REST API calls
class APIClient {
    constructor() {
        this.baseURL = window.CONFIG?.API_BASE_URL || 'https://api.swifttrack.com';
        this.token = localStorage.getItem('authToken');
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': this.token ? `Bearer ${this.token}` : '',
                ...options.headers,
            },
        };

        // Remove Authorization header if no token
        if (!this.token) {
            delete config.headers.Authorization;
        }

        try {
            // Simulate API call in mock mode
            if (window.CONFIG?.MOCK_MODE) {
                return await this.mockRequest(endpoint, config);
            }

            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    async mockRequest(endpoint, config) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, window.CONFIG?.MOCK_DELAY || 500));

        // Mock responses based on endpoint
        if (endpoint.includes('/auth/login')) {
            const body = JSON.parse(config.body || '{}');
            if (body.email && body.password) {
                return {
                    token: 'mock_jwt_token_' + Date.now(),
                    user: {
                        id: '1',
                        email: body.email,
                        name: body.email.split('@')[0],
                        role: endpoint.includes('driver') ? 'driver' : 'client'
                    }
                };
            }
            throw new Error('Invalid credentials');
        }

        if (endpoint.includes('/orders') && config.method === 'POST') {
            const body = JSON.parse(config.body || '{}');
            const orderId = 'ORD' + Date.now();
            return {
                orderId: orderId,
                status: 'pending',
                estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                ...body
            };
        }

        if (endpoint.includes('/orders') && config.method === 'GET') {
            // Return mock orders
            return {
                orders: [
                    {
                        id: 'ORD001',
                        customerName: 'John Doe',
                        status: 'pending',
                        createdAt: new Date().toISOString(),
                        deliveryAddress: '123 Main St, City, State 12345'
                    },
                    {
                        id: 'ORD002',
                        customerName: 'Jane Smith',
                        status: 'in_transit',
                        createdAt: new Date(Date.now() - 3600000).toISOString(),
                        deliveryAddress: '456 Oak Ave, City, State 12345'
                    }
                ]
            };
        }

        if (endpoint.includes('/deliveries') && config.method === 'PUT') {
            const body = JSON.parse(config.body || '{}');
            return {
                success: true,
                status: body.status,
                timestamp: body.timestamp || new Date().toISOString()
            };
        }

        if (endpoint.includes('/drivers') && endpoint.includes('/deliveries')) {
            return {
                deliveries: [
                    {
                        id: 'DEL001',
                        orderId: 'ORD001',
                        customerName: 'John Doe',
                        address: '123 Main St, City, State 12345',
                        status: 'assigned',
                        priority: 'standard'
                    },
                    {
                        id: 'DEL002',
                        orderId: 'ORD002',
                        customerName: 'Jane Smith',
                        address: '456 Oak Ave, City, State 12345',
                        status: 'in_transit',
                        priority: 'express'
                    }
                ]
            };
        }

        return { success: true };
    }

    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('authToken', token);
        } else {
            localStorage.removeItem('authToken');
        }
    }
}

// Create singleton instance
const apiClient = new APIClient();
window.apiClient = apiClient;
