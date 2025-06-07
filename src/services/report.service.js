import axios from 'axios';
import { API_CONFIG } from '../config/api.config';

const REPORT_API_URL = `${API_CONFIG.BASE_URL}/v1${API_CONFIG.REPORT}`;
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No authentication token found');
    }
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
};
export const reportService = {
    getDashboardStats: async (params) => {
        const response = await axios.get(`${REPORT_API_URL}/dashboard`, { headers: getAuthHeaders(), params });
        return response.data;
    },

    getRevenueReport: async (params) => {
        const response = await axios.get(`${REPORT_API_URL}/revenue`, { headers: getAuthHeaders(), params });
        return response.data;
    },

    getTopSellingProducts: async (params) => {
        const response = await axios.get(`${REPORT_API_URL}/top-selling-products`, { headers: getAuthHeaders(), params });
        return response.data;
    },

    getInventoryReport: async (params) => {
        const response = await axios.get(`${REPORT_API_URL}/inventory`, { headers: getAuthHeaders(), params });
        return response.data;
    },

    getCustomerAnalytics: async (params) => {
        const response = await axios.get(`${REPORT_API_URL}/customer-analytics`, { headers: getAuthHeaders(), params });
        return response.data;
    }
}; 