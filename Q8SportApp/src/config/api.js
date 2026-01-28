// API Configuration
const API_CONFIG = {
  BASE_URL: 'https://www.q8sportcar.com/api',  // Production (Custom Domain)
  // Alternative: 'https://q8sport.vercel.app/api'
  // For local testing on physical device, use your computer's IP:
  // BASE_URL: 'http://192.168.x.x:3000/api'
  
  TIMEOUT: 30000, // 30 seconds
  
  ENDPOINTS: {
    // Auth
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    UPDATE_PROFILE: '/auth/update-profile',
    
    // Products
    PRODUCTS: '/products',
    PRODUCT_DETAILS: (id) => `/products/${id}`,
    USER_PRODUCTS: '/user/products',
    USER_FAVORITES: '/user/favorites',
    USER_FAVORITE_DETAILS: (productId) => `/user/favorites/${productId}`,
    USER_STATS: '/user/stats',
    USER_NOTIFICATIONS: '/user/notifications',
    USER_NOTIFICATION_READ: (notificationId) => `/user/notifications/${notificationId}/read`,
    USER_CHANGE_PASSWORD: '/user/change-password',
    UPLOAD: '/upload',

    // Requests (Wanted)
    REQUESTS: '/requests',
    REQUESTS_MY: '/requests/my',
    REQUEST_DETAILS: (id) => `/requests/${id}`,
    
    // Auctions
    AUCTIONS: '/auctions',
    AUCTIONS_MY: '/auctions/my',
    AUCTION_DETAILS: (id) => `/auctions/${id}`,
    PLACE_BID: (id) => `/auctions/${id}/bid`,
    
    // Categories
    CATEGORIES: '/categories',
    
    // Messages
    MESSAGES: '/messages',
    MESSAGES_CONVERSATIONS: '/messages/conversations',
    MESSAGE_THREAD: (conversationId) => `/messages/${conversationId}`,

    // Showcases
    SHOWCASES: '/showcases',
    SHOWCASE_DETAILS: (id) => `/showcases/${id}`,
    SHOWCASE_LIKE: (id) => `/showcases/${id}/like`,
    
    // Users / Stores (Shops)
    USERS: '/users',
    USER_DETAILS: (id) => `/users/${id}`,
    USER_PRODUCTS_BY_ID: (id) => `/users/${id}/products`,
    
    // Admin
    ADMIN_STATS: '/admin/stats',
    ADMIN_USERS: '/admin/users',
    ADMIN_USER_BLOCK: (id) => `/admin/users/${id}/block`,
    ADMIN_REPORTS: '/admin/reports',
    ADMIN_AUCTIONS: '/admin/auctions',
    ADMIN_PRODUCTS: '/admin/products',
    ADMIN_BLOCKED_PRODUCTS: '/admin/products/blocked',
    ADMIN_PRODUCT_BLOCK: (id) => `/admin/products/${id}/block`,
    ADMIN_PRODUCT_APPROVE: (id) => `/admin/products/${id}/approve`,
    ADMIN_PRODUCT_UNBLOCK: (id) => `/admin/products/${id}/unblock`,
    ADMIN_PRODUCT_DELETE: (id) => `/admin/products/${id}`,
    ADMIN_SETTINGS: '/admin/settings',
    ADMIN_REQUESTS: '/admin/requests',
  }
};

export default API_CONFIG;
