// Main Application Logic
let currentUser = null;
let currentUserType = null;

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    // Initialize sidebar state based on screen size
    if (window.innerWidth > 768) {
        // Desktop: sidebar visible by default
        document.querySelectorAll('.sidebar').forEach(sidebar => {
            sidebar.classList.add('active');
        });
    } else {
        // Mobile: sidebar hidden by default
        document.querySelectorAll('.sidebar').forEach(sidebar => {
            sidebar.classList.remove('active');
        });
    }

    // Check if user is already logged in
    if (authService.isAuthenticated()) {
        currentUser = authService.getCurrentUser();
        currentUserType = authService.getUserType();
        
        if (currentUserType === 'driver') {
            showPage('driver-portal');
            initDriverPortal();
        } else {
            showPage('client-portal');
            initClientPortal();
        }
        
        // Connect WebSocket
        if (window.wsService) {
            wsService.connect();
        }
    } else {
        showPage('landing-page');
    }
});

// Show login page based on user type
function showLogin(userType) {
    if (userType === 'driver') {
        showPage('driver-login');
    } else {
        showPage('client-login');
    }
}

// Handle client login
async function handleClientLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('client-email').value;
    const password = document.getElementById('client-password').value;

    const result = await authService.login(email, password, 'client');
    
    if (result.success) {
        currentUser = result.user;
        currentUserType = 'client';
        
        // Update UI
        const userNameEl = document.getElementById('client-user-name');
        if (userNameEl) {
            userNameEl.textContent = result.user.name || result.user.email;
        }
        
        showPage('client-portal');
        initClientPortal();
        
        // Connect WebSocket
        if (window.wsService) {
            wsService.connect();
        }
    } else {
        showToast(result.error || 'Login failed', 'error');
    }
}

// Handle driver login
async function handleDriverLogin(event) {
    event.preventDefault();
    
    const driverId = document.getElementById('driver-id').value;
    const password = document.getElementById('driver-password').value;

    // For demo, use driverId as email
    const result = await authService.login(driverId, password, 'driver');
    
    if (result.success) {
        currentUser = result.user;
        currentUserType = 'driver';
        
        // Update UI
        const userNameEl = document.getElementById('driver-user-name');
        if (userNameEl) {
            userNameEl.textContent = `Driver ${driverId}`;
        }
        
        showPage('driver-portal');
        initDriverPortal();
        
        // Connect WebSocket
        if (window.wsService) {
            wsService.connect();
        }
    } else {
        showToast(result.error || 'Login failed', 'error');
    }
}

// Handle logout
function handleLogout() {
    authService.logout();
    currentUser = null;
    currentUserType = null;
    showToast('Logged out successfully', 'success');
}

// Show specific page
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const page = document.getElementById(pageId);
    if (page) {
        page.classList.add('active');
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.className = `toast ${type} show`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Toggle sidebar
function toggleSidebar(userType) {
    const sidebarId = userType === 'driver' ? 'driver-sidebar' : 'client-sidebar';
    const sidebar = document.getElementById(sidebarId);
    if (!sidebar) return;

    const isActive = sidebar.classList.contains('active');
    
    if (isActive) {
        sidebar.classList.remove('active');
        const overlay = document.querySelector('.sidebar-overlay');
        if (overlay) overlay.classList.remove('active');
    } else {
        // Close other sidebars first
        document.querySelectorAll('.sidebar').forEach(s => {
            if (s.id !== sidebarId) s.classList.remove('active');
        });
        
        sidebar.classList.add('active');
        
        // Show overlay on mobile
        if (window.innerWidth <= 768) {
            const overlay = document.querySelector('.sidebar-overlay');
            if (overlay) overlay.classList.add('active');
        }
    }
}

// Close sidebar on mobile after navigation
function closeSidebarOnMobile(userType) {
    if (window.innerWidth <= 768) {
        toggleSidebar(userType);
    }
}

// Close all sidebars
function closeAllSidebars() {
    document.querySelectorAll('.sidebar').forEach(sidebar => {
        sidebar.classList.remove('active');
    });
    const overlay = document.querySelector('.sidebar-overlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
}

// Handle window resize
window.addEventListener('resize', () => {
    const overlay = document.querySelector('.sidebar-overlay');
    
    if (window.innerWidth > 768) {
        // On desktop, ensure sidebar is visible
        document.querySelectorAll('.sidebar').forEach(sidebar => {
            sidebar.classList.add('active');
        });
        if (overlay) {
            overlay.classList.remove('active');
        }
    } else {
        // On mobile, hide overlay when sidebar is closed
        document.querySelectorAll('.sidebar').forEach(sidebar => {
            if (!sidebar.classList.contains('active') && overlay) {
                overlay.classList.remove('active');
            }
        });
    }
});

// Close modal
function closeModal() {
    const modal = document.getElementById('order-detail-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('order-detail-modal');
    if (event.target === modal) {
        closeModal();
    }
}

// Export functions
window.showLogin = showLogin;
window.handleClientLogin = handleClientLogin;
window.handleDriverLogin = handleDriverLogin;
window.handleLogout = handleLogout;
window.showPage = showPage;
window.showToast = showToast;
window.closeModal = closeModal;
window.toggleSidebar = toggleSidebar;
window.closeSidebarOnMobile = closeSidebarOnMobile;
window.closeAllSidebars = closeAllSidebars;
