// src/services/attributeService.js
import axios from 'axios';
import authService from './authService';
import { API_CONFIG } from '../config/api.config';

const getAuthHeaders = () => {
    const token = authService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// --- Category APIs ---
const getAllCategories = async (params) => {
    try {
        console.log('Fetching categories with params:', params);
        const response = await axios.get(`${API_CONFIG.BASE_URL}/v1${API_CONFIG.CATEGORY}`, {
            headers: getAuthHeaders(),
            params
        });
        console.log('Categories response:', response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching categories:", error.response?.data || error.message);
        throw error.response?.data || { message: 'Không thể tải danh sách danh mục.' };
    }
};

const createCategory = async (categoryData) => {
    try {
        console.log('Creating category with data:', categoryData);
        const response = await axios.post(`${API_CONFIG.BASE_URL}/v1${API_CONFIG.CATEGORY}`, categoryData, {
            headers: getAuthHeaders()
        });
        console.log('Create category response:', response.data);
        return response.data;
    } catch (error) {
        console.error("Error creating category:", error.response?.data || error.message);
        throw error.response?.data || { message: 'Không thể tạo danh mục.' };
    }
};

const updateCategory = async (categoryId, categoryData) => {
    try {
        console.log(`Updating category ${categoryId} with data:`, categoryData);
        const response = await axios.put(`${API_CONFIG.BASE_URL}/v1${API_CONFIG.CATEGORY}/${categoryId}`, categoryData, {
            headers: getAuthHeaders()
        });
        console.log('Update category response:', response.data);
        return response.data;
    } catch (error) {
        console.error("Error updating category:", error.response?.data || error.message);
        throw error.response?.data || { message: 'Không thể cập nhật danh mục.' };
    }
};

const deleteCategory = async (categoryId) => {
    try {
        console.log(`Deleting category ${categoryId}`);
        const response = await axios.delete(`${API_CONFIG.BASE_URL}/v1${API_CONFIG.CATEGORY}/${categoryId}`, {
            headers: getAuthHeaders()
        });
        console.log('Delete category response:', response.data);
        return response.data;
    } catch (error) {
        console.error("Error deleting category:", error.response?.data || error.message);
        throw error.response?.data || { message: 'Không thể xóa danh mục.' };
    }
};

// --- Supplier APIs ---
const getAllSuppliers = async (params) => {
    try {
        console.log('Fetching suppliers with params:', params);
        const response = await axios.get(`${API_CONFIG.BASE_URL}/v1${API_CONFIG.SUPPLIER}`, {
            headers: getAuthHeaders(),
            params
        });
        console.log('Suppliers response:', response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching suppliers:", error.response?.data || error.message);
        throw error.response?.data || { message: 'Không thể tải danh sách nhà cung cấp.' };
    }
};

const createSupplier = async (supplierData) => {
    try {
        console.log('Creating supplier with data:', supplierData);
        const response = await axios.post(`${API_CONFIG.BASE_URL}/v1${API_CONFIG.SUPPLIER}`, supplierData, {
            headers: getAuthHeaders()
        });
        console.log('Create supplier response:', response.data);
        return response.data;
    } catch (error) {
        console.error("Error creating supplier:", error.response?.data || error.message);
        throw error.response?.data || { message: 'Không thể tạo nhà cung cấp.' };
    }
};

const updateSupplier = async (supplierId, supplierData) => {
    try {
        console.log(`Updating supplier ${supplierId} with data:`, supplierData);
        const response = await axios.put(`${API_CONFIG.BASE_URL}/v1${API_CONFIG.SUPPLIER}/${supplierId}`, supplierData, {
            headers: getAuthHeaders()
        });
        console.log('Update supplier response:', response.data);
        return response.data;
    } catch (error) {
        console.error("Error updating supplier:", error.response?.data || error.message);
        throw error.response?.data || { message: 'Không thể cập nhật nhà cung cấp.' };
    }
};

const deleteSupplier = async (supplierId) => {
    try {
        console.log(`Deleting supplier ${supplierId}`);
        const response = await axios.delete(`${API_CONFIG.BASE_URL}/v1${API_CONFIG.SUPPLIER}/${supplierId}`, {
            headers: getAuthHeaders()
        });
        console.log('Delete supplier response:', response.data);
        return response.data;
    } catch (error) {
        console.error("Error deleting supplier:", error.response?.data || error.message);
        throw error.response?.data || { message: 'Không thể xóa nhà cung cấp.' };
    }
};

// --- Publisher APIs ---
const getAllPublishers = async (params) => {
    try {
        console.log('Fetching publishers with params:', params);
        const response = await axios.get(`${API_CONFIG.BASE_URL}/v1${API_CONFIG.PUBLISHER}`, {
            headers: getAuthHeaders(),
            params
        });
        console.log('Publishers response:', response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching publishers:", error.response?.data || error.message);
        throw error.response?.data || { message: 'Không thể tải danh sách nhà xuất bản.' };
    }
};

const createPublisher = async (publisherData) => {
    try {
        console.log('Creating publisher with data:', publisherData);
        const response = await axios.post(`${API_CONFIG.BASE_URL}/v1${API_CONFIG.PUBLISHER}`, publisherData, {
            headers: getAuthHeaders()
        });
        console.log('Create publisher response:', response.data);
        return response.data;
    } catch (error) {
        console.error("Error creating publisher:", error.response?.data || error.message);
        throw error.response?.data || { message: 'Không thể tạo nhà xuất bản.' };
    }
};

const updatePublisher = async (publisherId, publisherData) => {
    try {
        console.log(`Updating publisher ${publisherId} with data:`, publisherData);
        const response = await axios.put(`${API_CONFIG.BASE_URL}/v1${API_CONFIG.PUBLISHER}/${publisherId}`, publisherData, {
            headers: getAuthHeaders()
        });
        console.log('Update publisher response:', response.data);
        return response.data;
    } catch (error) {
        console.error("Error updating publisher:", error.response?.data || error.message);
        throw error.response?.data || { message: 'Không thể cập nhật nhà xuất bản.' };
    }
};

const deletePublisher = async (publisherId) => {
    try {
        console.log(`Deleting publisher ${publisherId}`);
        const response = await axios.delete(`${API_CONFIG.BASE_URL}/v1${API_CONFIG.PUBLISHER}/${publisherId}`, {
            headers: getAuthHeaders()
        });
        console.log('Delete publisher response:', response.data);
        return response.data;
    } catch (error) {
        console.error("Error deleting publisher:", error.response?.data || error.message);
        throw error.response?.data || { message: 'Không thể xóa nhà xuất bản.' };
    }
};

// --- Store-specific book statistics ---
const getAttributeBookStats = async (storeId, attributeType, attributeId) => {
    try {
        console.log(`Fetching book stats for ${attributeType} ${attributeId} in store ${storeId}`);
        let endpoint;
        switch (attributeType) {
            case 'category':
                endpoint = `${API_CONFIG.CATEGORY}/${attributeId}/stats/${storeId}`;
                break;
            case 'supplier':
                endpoint = `${API_CONFIG.SUPPLIER}/${attributeId}/stats/${storeId}`;
                break;
            case 'publisher':
                endpoint = `${API_CONFIG.PUBLISHER}/${attributeId}/stats/${storeId}`;
                break;
            default:
                throw new Error('Invalid attribute type');
        }
        const response = await axios.get(`${API_CONFIG.BASE_URL}/v1${endpoint}`, {
            headers: getAuthHeaders()
        });
        console.log('Book stats response:', response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching book stats:", error.response?.data || error.message);
        throw error.response?.data || { message: 'Không thể lấy thống kê sách.' };
    }
};

const attributeService = {
    getAllCategories, createCategory, updateCategory, deleteCategory,
    getAllSuppliers, createSupplier, updateSupplier, deleteSupplier,
    getAllPublishers, createPublisher, updatePublisher, deletePublisher,
    getAttributeBookStats
};

export default attributeService;