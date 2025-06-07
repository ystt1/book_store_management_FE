// src/services/stationeryService.js
import axios from 'axios';
import authService from './authService'; // Để lấy token
import { API_CONFIG } from '../config/api.config';

const STATIONERY_API_URL = `${API_CONFIG.BASE_URL}/v1/stationery`;

const getAuthHeaders = () => {
    const token = authService.getToken();
    if (token) {
        return { Authorization: `Bearer ${token}` };
    }
    return {};
};

// Lấy danh sách VPP (có filter, pagination)
const getAllStationeryItems = async (storeId, params) => {
    try {
        if (!storeId) {
            throw new Error('StoreId is required');
        }
        const response = await axios.get(`${STATIONERY_API_URL}/store/${storeId}`, {
            headers: getAuthHeaders(),
            params: params
        });
        return response.data; // { stationeryItems, currentPage, totalPages, totalItems }
    } catch (error) {
        console.error("Lỗi khi lấy danh sách VPP:", error.response?.data || error.message);
        throw error.response?.data || { message: 'Không thể tải danh sách văn phòng phẩm.' };
    }
};

// Lấy chi tiết một VPP
const getStationeryItemById = async (storeId, itemId) => {
    try {
        if (!storeId) {
            throw new Error('StoreId is required');
        }
        const response = await axios.get(`${STATIONERY_API_URL}/store/${storeId}/${itemId}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi lấy VPP ID ${itemId}:`, error.response?.data || error.message);
        throw error.response?.data || { message: 'Không thể tải thông tin văn phòng phẩm.' };
    }
};

// Tạo VPP mới
const createStationeryItem = async (storeId, itemData) => {
    try {
        if (!storeId) {
            throw new Error('StoreId is required');
        }

        // Chỉ gửi dữ liệu dạng JSON, không gửi file
        const response = await axios.post(`${STATIONERY_API_URL}/store/${storeId}`, itemData, {
            headers: { ...getAuthHeaders() }
        });
        return response.data;
    } catch (error) {
        console.error("Lỗi khi tạo VPP:", error.response?.data || error.message);
        throw error.response?.data || { message: 'Không thể tạo văn phòng phẩm mới.' };
    }
};

// Cập nhật VPP
const updateStationeryItem = async (storeId, itemId, itemData) => {
    try {
        if (!storeId) {
            throw new Error('StoreId is required');
        }

        // Chỉ gửi dữ liệu dạng JSON, không gửi file
        const response = await axios.put(`${STATIONERY_API_URL}/store/${storeId}/${itemId}`, itemData, {
            headers: { ...getAuthHeaders() }
        });
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi cập nhật VPP ID ${itemId}:`, error.response?.data || error.message);
        throw error.response?.data || { message: 'Không thể cập nhật văn phòng phẩm.' };
    }
};

// Xóa VPP
const deleteStationeryItem = async (storeId, itemId) => {
    try {
        if (!storeId) {
            throw new Error('StoreId is required');
        }
        const response = await axios.delete(`${STATIONERY_API_URL}/store/${storeId}/${itemId}`, {
            headers: getAuthHeaders()
        });
        return response.data; // { message, item }
    } catch (error) {
        console.error(`Lỗi khi xóa VPP ID ${itemId}:`, error.response?.data || error.message);
        throw error.response?.data || { message: 'Không thể xóa văn phòng phẩm.' };
    }
};

// Upload image
const uploadImage = async (storeId, file) => {
    try {
        if (!storeId) {
            throw new Error('StoreId is required');
        }
        const formData = new FormData();
        formData.append('image', file);

        const response = await axios.post(`${API_CONFIG.BASE_URL}/v1/stationery/store/${storeId}/upload-image`, formData, {
            headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' }
        });
        console.log('Upload image API response:', response.data);
        
        // Đảm bảo response có đúng format
        if (!response.data || !response.data.imagePath) {
            throw new Error('Invalid image upload response format');
        }
        
        // Trả về object với imageUrl để giữ nhất quán với interface
        return {
            imageUrl: response.data.imagePath,
            success: response.data.success,
            message: response.data.message
        };
    } catch (error) {
        console.error('Error uploading image:', error.response?.data || error.message);
        throw error.response?.data || { message: 'Không thể upload ảnh.' };
    }
};

// Lấy danh sách Suppliers cho Form
const getAllSuppliersForForm = async (storeId) => {
    try {
        if (!storeId) {
            throw new Error('StoreId is required');
        }
        const response = await axios.get(`${API_CONFIG.BASE_URL}/v1${API_CONFIG.SUPPLIER}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy NCC cho form VPP:", error.response?.data || error.message);
        throw error.response?.data || { message: 'Không thể tải nhà cung cấp.' };
    }
};

const stationeryService = {
    uploadImage,
    getAllStationeryItems,
    getStationeryItemById,
    createStationeryItem,
    updateStationeryItem,
    deleteStationeryItem,
    getAllSuppliersForForm
};

export default stationeryService;