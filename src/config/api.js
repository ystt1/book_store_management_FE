// API Configuration
const API_CONFIG = {
    BASE_URL: 'http://localhost:3000/api/v1',
    AUTH: '/auth',
    ADMIN: '/admin',
    STORES: '/stores',
    BOOKS: '/books',
    ORDERS: '/orders',
    USERS: '/users',
    REPORTS: '/reports',
    CATEGORIES: '/categories',
    SUPPLIERS: '/suppliers',
    STATIONERY: '/stationery',
    IMPORT_ORDERS: '/import-orders',
    EMPLOYEES: '/employees',
    CUSTOMERS: '/customers',
    PUBLISHERS: '/publishers'
};

// Hàm tạo header với token
export const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export default API_CONFIG; 