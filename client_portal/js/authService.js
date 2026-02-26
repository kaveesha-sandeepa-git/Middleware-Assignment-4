// Authentication Service
class AuthService {
    async login(email, password, userType = 'client') {
        try {
            const endpoint = userType === 'driver' ? '/api/auth/driver/login' : '/api/auth/login';
            const response = await apiClient.post(endpoint, {
                email: email,
                password: password,
            });

            // Store token and user info
            apiClient.setToken(response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            localStorage.setItem('userType', userType);

            return {
                success: true,
                user: response.user,
                token: response.token,
                userType: userType
            };
        } catch (error) {
            console.error('Login failed:', error);
            return {
                success: false,
                error: error.message || 'Login failed. Please check your credentials.',
            };
        }
    }

    logout() {
        apiClient.setToken(null);
        localStorage.removeItem('user');
        localStorage.removeItem('userType');
        localStorage.removeItem('authToken');
        
        // Disconnect WebSocket
        if (window.wsService) {
            wsService.disconnect();
        }

        // Redirect to landing page
        showPage('landing-page');
    }

    isAuthenticated() {
        return !!localStorage.getItem('authToken');
    }

    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }

    getUserType() {
        return localStorage.getItem('userType') || 'client';
    }
}

const authService = new AuthService();
window.authService = authService;
