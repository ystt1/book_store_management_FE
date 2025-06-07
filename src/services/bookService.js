// src/services/bookService.js
import axios from 'axios';
import { API_CONFIG } from '../config/api.config';

// Hàm helper để lấy header xác thực (giống adminService)
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

const getMultipartAuthHeader = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No authentication token found');
    }
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        }
    };
};

const handleAuthError = (error) => {
    if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
    }
    throw error;
};

const bookService = {
    // Lấy danh sách sách (có filter, pagination)
    getAllBooks: async (storeId, params) => {
        try {
            const response = await axios.get(
                `${API_CONFIG.BASE_URL}/v1/books/store/${storeId}`,
                {
                    ...getAuthHeader(),
                    params
                }
            );
            return response.data;
        } catch (error) {
            handleAuthError(error);
        }
    },

    // Lấy chi tiết một sách
    getBookById: async (storeId, bookId) => {
        try {
            const response = await axios.get(
                `${API_CONFIG.BASE_URL}/v1/books/store/${storeId}/${bookId}`,
                getAuthHeader() 
            );
            return response.data;
        } catch (error) {
            // console.error(`Lỗi khi lấy sách ID ${bookId}:`, error.response?.data || error.message);
            // throw error.response?.data || { message: 'Không thể tải thông tin sách.' };
            throw error; // Thay đổi error handling
        }
    },

    // Tạo sách mới
    createBook: async (storeId, formData) => {
        try {
            const response = await axios.post(
                `${API_CONFIG.BASE_URL}/v1/books/store/${storeId}`,
                formData,
                getMultipartAuthHeader()
            );
            return response.data;
        } catch (error) {
            handleAuthError(error);
        }
    },

    // Cập nhật sách
    updateBook: async (storeId, bookId, formData) => {
        try {
            const response = await axios.put(
                `${API_CONFIG.BASE_URL}/v1/books/store/${storeId}/${bookId}`,
                formData,
                getMultipartAuthHeader()
            );
            return response.data;
        } catch (error) {
            handleAuthError(error);
        }
    },

    // Xóa sách
    deleteBook: async (storeId, bookId) => {
        try {
            const response = await axios.delete(
                `${API_CONFIG.BASE_URL}/v1/books/store/${storeId}/${bookId}`,
                getAuthHeader()
            );
            return response.data;
        } catch (error) {
            handleAuthError(error);
        }
    },

    // Lấy dữ liệu cho form
    getCategoriesForForm: async (storeId) => {
        try {
            const response = await axios.get(
                `${API_CONFIG.BASE_URL}/v1/books/store/${storeId}/form-data/categories`,
                getAuthHeader()
            );
            return response.data.map(category => ({
                value: category._id,
                label: category.name
            }));
        } catch (error) {
            handleAuthError(error);
        }
    },

    getSuppliersForForm: async (storeId) => {
        try {
            const response = await axios.get(
                `${API_CONFIG.BASE_URL}/v1/books/store/${storeId}/form-data/suppliers`,
                getAuthHeader()
            );
            return response.data.map(supplier => ({
                value: supplier._id,
                label: supplier.name
            }));
        } catch (error) {
            handleAuthError(error);
        }
    },

    getPublishersForForm: async (storeId) => {
        try {
            const response = await axios.get(
                `${API_CONFIG.BASE_URL}/v1/books/store/${storeId}/form-data/publishers`,
                getAuthHeader()
            );
            return response.data.map(publisher => ({
                value: publisher._id,
                label: publisher.name
            }));
        } catch (error) {
            handleAuthError(error);
        }
    },

    // Thêm hàm upload hình
    uploadImage: async (storeId, file) => {
        try {
            if (!storeId) {
                throw new Error('StoreId is required');
            }
            const formData = new FormData();
            formData.append('image', file);

            const response = await axios.post(
                `${API_CONFIG.BASE_URL}/v1/books/store/${storeId}/upload-image`,
                formData,
                getMultipartAuthHeader()
            );
            console.log('Upload image API response:', response.data);
            
            // Đảm bảo response có đúng format
            if (!response.data || !response.data.imagePath) {
                throw new Error('Invalid image upload response format');
            }
            
            return {
                imageUrl: response.data.imagePath,
                success: response.data.success,
                message: response.data.message
            };
        } catch (error) {
            console.error('Error uploading image:', error.response?.data || error.message);
            throw error.response?.data || { message: 'Không thể upload ảnh.' };
        }
    }
};

export default bookService;