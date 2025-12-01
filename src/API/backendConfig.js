// src/API/backendConfig.js
const backendConfig = {
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5001",
  endpoints: {
    // Auth endpoints
    login: "/api/admin/login",
    logout: "/api/admin/logout",
    
    // Order management
    orders: "/api/orders/admin/orders",
    orderStats: "/api/orders/admin/order-stats",
    updateOrder: "/api/orders/admin/orders/update",
  },
  
  getHeaders: (token = null) => {
    // Try to get token from localStorage if not provided
    const authToken = token || localStorage.getItem('adminToken');
    
    console.log('🔐 Getting headers with token:', authToken ? 'Token exists' : 'No token');
    
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    return headers;
  },
  
  // Store admin token after login
  storeAdminToken: (token) => {
    localStorage.setItem('adminToken', token);
    console.log('✅ Admin token stored in localStorage');
  },
  
  // Get admin token
  getAdminToken: () => {
    const token = localStorage.getItem('adminToken');
    console.log('🔍 Retrieved admin token:', token ? 'Exists' : 'Not found');
    return token;
  },
  
  // Remove admin token
  removeAdminToken: () => {
    localStorage.removeItem('adminToken');
    console.log('🗑️ Admin token removed');
  }
};

export default backendConfig;



// // src/API/backendConfig.tsx
// const backendConfig = {
//   baseURL: process.env.REACT_APP_API_URL || "https://backendddd-2xa6.onrender.com/api",
//   endpoints: {
//     // Auth endpoints
//     login: "/admin/login",
//     logout: "/admin/logout",
    
//     // User management
//     users: "/users",
//     usersRegistered: "/users/registered",
    
//     // Ride management
//     rides: "/rides",
//     activeRides: "/rides/active",
//     rideHistory: "/rides/history",
    
//     // Order management
//     orders: "/orders",
//     pendingOrders: "/orders/pending",
//     completedOrders: "/orders/completed",
    
//     // Driver management
//     drivers: "/drivers",
//     driverApplications: "/drivers/applications",
//     driverPayouts: "/drivers/payouts",
    
//     // Analytics
//     analytics: "/analytics",
//     revenue: "/analytics/revenue",
//     performance: "/analytics/performance",
    
//     // Support
//     supportTickets: "/support/tickets",
//     disputes: "/support/disputes",
    
//     // Inventory
//     inventory: "/inventory",
//     categories: "/inventory/categories"
//   },
  
//   // Headers configuration
//   getHeaders: (token?: string) => {
//     const headers: HeadersInit = {
//       'Content-Type': 'application/json',
//     };
    
//     if (token) {
//       headers['Authorization'] = `Bearer ${token}`;
//     }
    
//     return headers;
//   }
// };

// export default backendConfig;