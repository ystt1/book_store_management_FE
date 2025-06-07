// src/services/customerService.js
import axios from 'axios';
import { API_URL } from '../config';

const customerService = {
    getAllCustomers: async (params = {}) => {
        const response = await axios.get(`${API_URL}/customers`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            params: {
                page: params.page || 1,
                limit: params.limit || 10,
                sortBy: params.sortBy,
                sortOrder: params.sortOrder,
                searchTerm: params.searchTerm
            }
        });
        return response.data;
    },

    searchCustomers: async (searchTerm = '', page = 1, limit = 10) => {
        const response = await axios.get(`${API_URL}/customers/search`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            params: {
                searchTerm,
                page,
                limit
            }
        });
        return response.data;
    },

    getCustomerById: async (id) => {
        const response = await axios.get(`${API_URL}/customers/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    },

    createCustomer: async (customerData) => {
        const response = await axios.post(`${API_URL}/customers`, customerData, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    },

    updateCustomer: async (id, customerData) => {
        const response = await axios.put(`${API_URL}/customers/${id}`, customerData, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    },

    deleteCustomer: async (id) => {
        const response = await axios.delete(`${API_URL}/customers/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    },

    getPurchaseHistory: async (customerId, params = {}) => {
        const response = await axios.get(`${API_URL}/customers/${customerId}/purchase-history`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            params
        });
        return response.data;
    }
};

export default customerService;