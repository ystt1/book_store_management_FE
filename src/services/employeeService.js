// src/services/employeeService.js
import axios from 'axios';
import authService from './authService';
import { API_CONFIG } from '../config/api.config';

const getAuthHeaders = () => {
    const token = authService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const getAllEmployees = async (storeId) => {
    try {
        const response = await axios.get(`${API_CONFIG.BASE_URL}/v1/employees/stores/${storeId}/employees`, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const getEmployeeById = async (storeId, employeeId) => {
    try {
        const response = await axios.get(`${API_CONFIG.BASE_URL}/v1/employees/stores/${storeId}/employees/${employeeId}`, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const createEmployee = async (storeId, employeeData) => {
    try {
        const response = await axios.post(`${API_CONFIG.BASE_URL}/v1/employees/stores/${storeId}/employees`, employeeData, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const updateEmployee = async (storeId, employeeId, employeeData) => {
    try {
        const response = await axios.put(`${API_CONFIG.BASE_URL}/v1/employees/stores/${storeId}/employees/${employeeId}`, employeeData, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const deleteEmployee = async (storeId, employeeId) => {
    try {
        const response = await axios.delete(`${API_CONFIG.BASE_URL}/v1/employees/stores/${storeId}/employees/${employeeId}`, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const paySalary = async (storeId, employeeId, salaryData) => {
    try {
        const response = await axios.post(`${API_CONFIG.BASE_URL}/v1/employees/stores/${storeId}/employees/${employeeId}/salary-payments`, salaryData, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const getSalaryHistory = async (storeId, employeeId) => {
    try {
        const response = await axios.get(`${API_CONFIG.BASE_URL}/v1/stores/${storeId}/employees/${employeeId}/salary-history`, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const changePassword = async (storeId, employeeId, passwordData) => {
    try {
        const response = await axios.post(`${API_CONFIG.BASE_URL}/v1/employees/stores/${storeId}/employees/${employeeId}/change-password`, passwordData, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const getStoresForForm = async () => {
    try {
        const response = await axios.get(`${API_CONFIG.BASE_URL}/v1/employees/stores?limit=1000`, { headers: getAuthHeaders() });
        return response.data.stores?.map(s => ({ value: s._id, label: s.name })) || [];
    } catch (error) {
        throw error.response?.data || { message: 'Lỗi tải danh sách cửa hàng.' };
    }
};

const employeeService = {
    getAllEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    paySalary,
    getSalaryHistory,
    getStoresForForm,
    changePassword,
};

export default employeeService;