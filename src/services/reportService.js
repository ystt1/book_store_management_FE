// src/services/reportService.js
import axios from 'axios';
import authService from './authService'; // Để lấy token

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const REPORT_API_URL = `${API_BASE_URL}/reports`; // Endpoint gốc cho báo cáo

const getAuthHeaders = () => {
    const token = authService.getCurrentUserToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Báo cáo Doanh thu
const getRevenueReport = async (params) => { // params: { periodType, year, month, quarter, date, startDate, endDate, storeId }
    try {
        const response = await axios.get(`${REPORT_API_URL}/revenue`, { headers: getAuthHeaders(), params });
        console.log(response);
        
        return response.data; // Mong đợi { summary: {totalRevenue, totalOrders}, detailsForChart: {labels, values}, timePeriodApplied }
    } catch (error) {
        console.error("Lỗi API getRevenueReport:", error.response?.data || error.message);
        throw error.response?.data || { message: 'Không thể tải báo cáo doanh thu.' };
    }
};

// Báo cáo Sản phẩm bán chạy
const getTopSellingProductsReport = async (params) => { // params: { periodType, year, ..., storeId, categoryId, topN }
    try {
        const response = await axios.get(`${REPORT_API_URL}/top-selling-products`, { headers: getAuthHeaders(), params });
        console.log(response);
        
        return response.data; // Mong đợi mảng [{ productId, productName, productType, quantitySold, revenueGenerated }]
    } catch (error) {
        console.error("Lỗi API getTopSellingProductsReport:", error.response?.data || error.message);
        throw error.response?.data || { message: 'Không thể tải báo cáo sản phẩm bán chạy.' };
    }
};

// Báo cáo Tồn kho
const getInventoryReport = async (params) => { // params: { storeId, lowStockThreshold }
    try {
        const response = await axios.get(`${REPORT_API_URL}/inventory`, { headers: getAuthHeaders(), params });
        return response.data; // Mong đợi { totalUniqueItems, overallStockQuantity, lowStockItems: [{name, stock, type}] }
    } catch (error) {
        console.error("Lỗi API getInventoryReport:", error.response?.data || error.message);
        throw error.response?.data || { message: 'Không thể tải báo cáo tồn kho.' };
    }
};

// Báo cáo Lương Nhân viên
const getSalaryReport = async (params) => { // params: { periodType, year, ..., storeId }
    try {
        const response = await axios.get(`${REPORT_API_URL}/salaries`, { headers: getAuthHeaders(), params });
        return response.data; // Mong đợi { summary: {totalSalaryPaid, totalPayments}, details: [{employeeName, amount, ...}] }
    } catch (error) {
        console.error("Lỗi API getSalaryReport:", error.response?.data || error.message);
        throw error.response?.data || { message: 'Không thể tải báo cáo lương.' };
    }
};

const reportService = {
    getRevenueReport,
    getTopSellingProductsReport,
    getInventoryReport,
    getSalaryReport,
};

export default reportService;