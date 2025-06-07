import axios from 'axios';
import { API_CONFIG } from '../config/api.config';
import authService from './authService';
const getAuthHeader = () => {
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

const storeDashboardService = {
    // Lấy tất cả thông tin dashboard của cửa hàng
    getDashboardData: async (storeId) => {
        try {
            const response = await axios.get(
                `${API_CONFIG.BASE_URL}/v1/stores/${storeId}/dashboard`,
                getAuthHeader()
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            throw error;
        }
    },

    // Lấy thống kê doanh thu theo khoảng thời gian
    getRevenueStats: async (storeId, params) => {
        try {
            const response = await axios.get(
                `${API_CONFIG.BASE_URL}/v1/stores/${storeId}/revenue-stats`,
                {
                    ...getAuthHeader(),
                    params: {
                        startDate: params.startDate,
                        endDate: params.endDate,
                        groupBy: params.groupBy // 'day', 'week', 'month'
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching revenue stats:', error);
            throw error;
        }
    },

    // Lấy top sản phẩm bán chạy
    getTopProducts: async (storeId, params) => {
        try {
            const response = await axios.get(
                `${API_CONFIG.BASE_URL}/v1/stores/${storeId}/top-products`,
                {
                    ...getAuthHeader(),
                    params: {
                        limit: params.limit || 10,
                        period: params.period // 'day', 'week', 'month', 'year'
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching top products:', error);
            throw error;
        }
    },

    // Lấy tỷ lệ loại sản phẩm
    getProductTypeRatio: async (storeId) => {
        try {
            const response = await axios.get(
                `${API_CONFIG.BASE_URL}/v1/stores/${storeId}/product-type-ratio`,
                getAuthHeader()
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching product type ratio:', error);
            throw error;
        }
    },

    // Format dữ liệu cho biểu đồ doanh thu
    formatRevenueChartData: (revenueData) => {
        if (!revenueData || !Array.isArray(revenueData)) return { labels: [], values: [] };

        return {
            labels: revenueData.map(item => item.month),
            values: revenueData.map(item => item.revenue)
        };
    },

    // Format dữ liệu cho biểu đồ tỷ lệ sản phẩm
    formatProductTypeChartData: (productTypeData) => {
        if (!productTypeData || !Array.isArray(productTypeData)) return { labels: [], values: [] };

        return {
            labels: productTypeData.map(item => item.type),
            values: productTypeData.map(item => item.value)
        };
    },

    // Format số tiền thành định dạng VND
    formatCurrency: (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    }
};

export default storeDashboardService; 