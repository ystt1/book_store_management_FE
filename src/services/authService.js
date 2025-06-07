// src/services/authService.js
import axios from 'axios';
import { API_CONFIG } from '../config/api.config';

// Thêm interceptor cho axios
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Thêm interceptor cho response
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

const authService = {
    // Đăng nhập
    login: async (username, password) => {
        try {
            const response = await axios.post(`${API_CONFIG.BASE_URL}/v1${API_CONFIG.AUTH}/login`, {
                username,
                password
            });
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Đăng nhập thất bại' };
        }
    },

    // Đăng xuất
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    // Lấy thông tin user hiện tại
    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            return JSON.parse(userStr);
        }
        return null;
    },

    // Lấy token
    getToken: () => {
        return localStorage.getItem('token');
    },

    // Kiểm tra đã đăng nhập chưa
    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },

    // Kiểm tra có phải admin không
    isAdmin: () => {
        const user = authService.getCurrentUser();
        return user && user.role === 'admin';
    },

    // Kiểm tra có phải manager không
    isManager: () => {
        const user = authService.getCurrentUser();
        return user && user.role === 'manager';
    },

    // Kiểm tra có phải staff không
    isStaff: () => {
        const user = authService.getCurrentUser();
        return user && user.role === 'staff';
    },

    // Lấy storeId của user
    getStoreId: () => {
        const user = authService.getCurrentUser();
        return user ? user.storeId : null;
    },

    // Lấy thông tin cửa hàng của user
    getStoreInfo: () => {
        const user = authService.getCurrentUser();
        return user ? user.storeInfo : null;
    }
};

export default authService;