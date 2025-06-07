// src/services/storeService.js
import axios from 'axios';
import { API_URL } from '../config';

const storeService = {
    // Lấy danh sách cửa hàng
    getAllStores: async () => {
        try {
            const response = await axios.get(`${API_URL}/stores`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Không thể lấy danh sách cửa hàng');
        }
    },

    // Lấy thông tin chi tiết cửa hàng
    getStoreById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/stores/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Không thể lấy thông tin cửa hàng');
        }
    },

    // Tạo cửa hàng mới
    createStore: async (storeData) => {
        try {
            const response = await axios.post(`${API_URL}/stores`, storeData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Không thể tạo cửa hàng');
        }
    },

    // Cập nhật thông tin cửa hàng
    updateStore: async (id, storeData) => {
        try {
            const response = await axios.put(`${API_URL}/stores/${id}`, storeData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Không thể cập nhật cửa hàng');
        }
    },

    // Xóa cửa hàng
    deleteStore: async (id) => {
        try {
            const response = await axios.delete(`${API_URL}/stores/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Không thể xóa cửa hàng');
        }
    },

    // Lấy thống kê tổng quan của cửa hàng
    getStoreStatistics: async (storeId) => {
        try {
            const response = await axios.get(`${API_URL}/stores/${storeId}/stats`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Không thể lấy thống kê cửa hàng');
        }
    },

    // Lấy danh sách nhân viên của cửa hàng
    getStoreEmployees: async (storeId) => {
        try {
            const response = await axios.get(`${API_URL}/stores/${storeId}/employees`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Không thể lấy danh sách nhân viên');
        }
    },

    // Lấy danh sách đơn hàng của cửa hàng
    getStoreOrders: async (storeId) => {
        try {
            const response = await axios.get(`${API_URL}/stores/${storeId}/orders`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Không thể lấy danh sách đơn hàng');
        }
    },

    // Lấy thông tin kho hàng của cửa hàng
    getStoreInventory: async (storeId) => {
        try {
            const response = await axios.get(`${API_URL}/stores/${storeId}/inventory`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Không thể lấy thông tin kho hàng');
        }
    }
};

export default storeService;