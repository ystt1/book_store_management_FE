import axios from 'axios';
import { API_CONFIG } from '../config/api.config';

// Hàm helper để lấy header xác thực
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

const adminService = {
    // Lấy thống kê tổng quan
    getDashboardStats: async () => {
        try {
            const response = await axios.get(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ADMIN}/dashboard/stats`,
                getAuthHeader()
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Lấy báo cáo doanh thu
    getRevenueReport: async (params) => {
        try {
            const response = await axios.get(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ADMIN}/reports/revenue`,
                {
                    ...getAuthHeader(),
                    params
                }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Lấy danh sách cửa hàng
    getStores: async () => {
        try {
            const response = await axios.get(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ADMIN}/stores`,
                getAuthHeader()
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Lấy thống kê cửa hàng
    getStoreStats: async (storeId) => {
        try {
            const response = await axios.get(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ADMIN}/stores/${storeId}/stats`,
                getAuthHeader()
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Lấy báo cáo tồn kho
    getInventoryReport: async (params) => {
        try {
            const response = await axios.get(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ADMIN}/reports/inventory`,
                {
                    ...getAuthHeader(),
                    params
                }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Lấy báo cáo nhân viên
    getEmployeeReport: async (params) => {
        try {
            const response = await axios.get(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ADMIN}/reports/employees`,
                {
                    ...getAuthHeader(),
                    params
                }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Lấy top sách bán chạy
    getTopBooks: async () => {
        try {
            const response = await axios.get(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ADMIN}/reports/top-books`,
                getAuthHeader()
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default adminService; 