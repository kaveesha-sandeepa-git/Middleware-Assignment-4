// Configuration
const CONFIG = {
    API_BASE_URL: 'https://api.swifttrack.com',
    WS_URL: 'wss://api.swifttrack.com/updates',
    // For demo purposes, you can use mock mode
    MOCK_MODE: true,
    MOCK_DELAY: 500, // Simulate network delay in ms
};

// Export for use in other files
window.CONFIG = CONFIG;
