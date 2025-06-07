// src/services/importOrderService.js
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

const importOrderService = {
    // Admin-specific methods
    getAllImportsAdmin: async (params = {}) => {
        try {
            const response = await axios.get(
                `${API_CONFIG.BASE_URL}/v1/imports/admin`,
                {
                    ...getAuthHeader(),
                    params: params
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching all imports:', error);
            throw error.response?.data || { message: 'Could not fetch imports' };
        }
    },

    getSuppliersForFormAdmin: async () => {
        try {
            const response = await axios.get(
                `${API_CONFIG.BASE_URL}/v1/imports/admin/suppliers`,
                getAuthHeader()
            );
            return response.data.data.suppliers;
        } catch (error) {
            console.error('Error fetching suppliers:', error);
            throw error.response?.data || { message: 'Could not fetch suppliers' };
        }
    },

    getBooksForFormAdmin: async () => {
        try {
            const response = await axios.get(
                `${API_CONFIG.BASE_URL}/v1/imports/admin/products?productType=Book`,
                getAuthHeader()
            );
            return response.data.data.products;
        } catch (error) {
            console.error('Error fetching books:', error);
            throw error.response?.data || { message: 'Could not fetch books' };
        }
    },

    getStationeryForFormAdmin: async () => {
        try {
            const response = await axios.get(
                `${API_CONFIG.BASE_URL}/v1/imports/admin/products?productType=Stationery`,
                getAuthHeader()
            );
            return response.data.data.products;
        } catch (error) {
            console.error('Error fetching stationery:', error);
            throw error.response?.data || { message: 'Could not fetch stationery' };
        }
    },

    // Get all import orders for a store
    getAllImportOrders: async (storeId, params = {}) => {
        try {
            if (!storeId || typeof storeId !== 'string') {
                throw new Error('Store ID is required and must be a string');
            }
            console.log('Making API call with storeId:', storeId); // Debug log
            console.log('With params:', params); // Debug log

            const response = await axios.get(
                `${API_CONFIG.BASE_URL}/v1/imports/store/${storeId}`,
                {
                    ...getAuthHeader(),
                    params: params
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching import orders:', error);
            throw error.response?.data || { message: 'Could not fetch import orders' };
        }
    },

    // Get import order by ID
    getImportOrderById: async (storeId, importId) => {
        try {
            if (!storeId) {
                throw new Error('Store ID is required');
            }
            const response = await axios.get(
                `${API_CONFIG.BASE_URL}/v1/imports/store/${storeId}/${importId}`,
                getAuthHeader()
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching import order:', error);
            throw error.response?.data || { message: 'Could not fetch import order details' };
        }
    },

    // Create new import order
    createImportOrder: async (storeId, importData) => {
        try {
            if (!storeId) {
                throw new Error('Store ID is required');
            }
            const response = await axios.post(
                `${API_CONFIG.BASE_URL}/v1/imports/store/${storeId}`,
                importData,
                getAuthHeader()
            );
            return response.data;
        } catch (error) {
            console.error('Error creating import order:', error);
            throw error.response?.data || { message: 'Could not create import order' };
        }
    },

    // Update import order status
    updateImportOrderStatus: async (storeId, orderId, statusData) => {
        try {
            const response = await axios.put(
                `${API_CONFIG.BASE_URL}/v1/imports/store/${storeId}/${orderId}/status`,
                statusData,
                getAuthHeader()
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Cancel import order
    cancelImportOrder: async (storeId, importId, reason) => {
        try {
            if (!storeId) {
                throw new Error('Store ID is required');
            }
            const response = await axios.put(
                `${API_CONFIG.BASE_URL}/v1/imports/store/${storeId}/${importId}/cancel`,
                { reason },
                getAuthHeader()
            );
            return response.data;
        } catch (error) {
            console.error('Error canceling import order:', error);
            throw error.response?.data || { message: 'Could not cancel import order' };
        }
    },

    // Get suppliers for import form
    getSuppliersForForm: async (storeId) => {
        try {
            if (!storeId) {
                throw new Error('Store ID is required');
            }
            const response = await axios.get(
                `${API_CONFIG.BASE_URL}/v1/imports/store/${storeId}/suppliers`,
                getAuthHeader()
            );
            return response.data.data.suppliers;
        } catch (error) {
            console.error('Error fetching suppliers:', error);
            throw error.response?.data || { message: 'Could not fetch suppliers' };
        }
    },

    // Get products for import form
    getProductsForForm: async (storeId, productType) => {
        try {
            if (!storeId) {
                throw new Error('Store ID is required');
            }
            if (!productType) {
                throw new Error('Product type is required');
            }

            const response = await axios.get(
                `${API_CONFIG.BASE_URL}/v1/imports/store/${storeId}/products`,
                {
                    ...getAuthHeader(),
                    params: { productType }
                }
            );

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to fetch products');
            }

            return response.data.data.products;
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error.response?.data || { message: 'Could not fetch products' };
        }
    }
};

export default importOrderService;