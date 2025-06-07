// src/services/orderService.js
import axios from 'axios';
import { API_CONFIG } from '../config/api.config';
import authService from './authService';

const ORDER_API_URL = `${API_CONFIG.BASE_URL}/v1${API_CONFIG.ORDER}`;

const getAuthHeaders = () => {
    const token = authService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const getAllOrders = async (params) => { // { page, limit, searchTerm, customerId, status, paymentStatus, dateFrom, dateTo }
    try {
        const response = await axios.get(ORDER_API_URL, { headers: getAuthHeaders(), params });
        console.log(response);
        
        return response.data; // { orders, currentPage, totalPages, totalOrders }
    } catch (error) {
        throw error.response?.data || { message: 'Không thể tải danh sách đơn hàng.' };
    }
};

const getOrderById = async (orderId) => {
    try {
        const response = await axios.get(`${ORDER_API_URL}/${orderId}`, { headers: getAuthHeaders() });
        // API backend nên populate customer_id và created_by, cũng như product_name cho items
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Không thể tải chi tiết đơn hàng.' };
    }
};

const createOrder = async (orderData) => {
    try {
        const response = await axios.post(ORDER_API_URL, orderData, { headers: getAuthHeaders() });
        return response.data; // { message, order }
    } catch (error) {
        throw error.response?.data || { message: 'Không thể tạo đơn hàng mới.' };
    }
};

// Cập nhật trạng thái đơn hàng
const updateOrderStatus = async (orderId, statusData) => { // statusData: { status, paymentDetails? }
    try {
        const response = await axios.patch(`${ORDER_API_URL}/${orderId}/status`, statusData, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Không thể cập nhật trạng thái đơn hàng.' };
    }
};

// Xử lý/Cập nhật thông tin thanh toán
const processOrderPayment = async (orderId, paymentData) => { // paymentData: { paymentMethod, paymentStatus, ... }
    try {
        const response = await axios.post(`${ORDER_API_URL}/${orderId}/payment`, paymentData, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Lỗi khi xử lý thanh toán.' };
    }
};

// Hủy đơn hàng
const cancelOrder = async (orderId, cancelData) => { // cancelData: { reason }
    try {
        const response = await axios.patch(`${ORDER_API_URL}/${orderId}/cancel`, cancelData, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Không thể hủy đơn hàng.' };
    }
};

// API để sửa chi tiết đơn hàng (ví dụ: items, discount, tax) - phức tạp hơn
// const updateOrderDetails = async (orderId, orderDetailsData) => {
//     try {
//         const response = await axios.put(`${ORDER_API_URL}/${orderId}`, orderDetailsData, { headers: getAuthHeaders() });
//         return response.data;
//     } catch (error) {
//         throw error.response?.data || { message: 'Không thể cập nhật chi tiết đơn hàng.' };
//     }
// };

// --- Lấy dữ liệu cho Form ---
const getCustomersForForm = async (searchTerm = '') => {
    try {
        const response = await axios.get(`${API_CONFIG.BASE_URL}/customers`, {
            headers: getAuthHeaders(),
            params: { limit: 20, searchTerm } // Lấy tối đa 20 KH khớp với tìm kiếm
        });
        return response.data.customers?.map(c => ({ value: c._id, label: `${c.full_name} - ${c.phone}` })) || [];
    } catch (error) {
        throw error.response?.data || { message: 'Lỗi tải danh sách khách hàng.' };
    }
};

const getBooksForForm = async () => { // Lấy sách cho form nhập hàng
    try {
        const response = await axios.get(`${API_CONFIG.BASE_URL}/v1/books?limit=1000&fields=name,price,stock_quantity`, { headers: getAuthHeaders() }); // fields=name,price để giảm dữ liệu
        return response.data.books?.map(b => ({ id: b._id, name: b.title, price: b.price,stock:b.stock_quantity })) || [];
    } catch (error) {
        throw error.response?.data || { message: 'Lỗi tải danh sách sách.' };
    }
};

const getStationeryForForm = async () => { // Lấy VPP cho form nhập hàng
    try {
        const response = await axios.get(`${API_CONFIG.BASE_URL}/stationery?limit=1000&fields=name,price`, { headers: getAuthHeaders() });
        return response.data.stationeryItems?.map(s => ({ id: s._id, name: s.name, price: s.price })) || [];
    } catch (error) {
        throw error.response?.data || { message: 'Lỗi tải danh sách VPP.' };
    }
};

// Lấy Sách và VPP cho form (kết hợp hoặc gọi riêng)
const getProductsForOrderForm = async (searchTerm = '') => {
    try {
        // Cách 1: Tạo 1 API backend trả về cả sách và VPP đã gộp và có type
        // const response = await axios.get(`${API_CONFIG.BASE_URL}/products-for-order`, { params: { searchTerm }});
        // return response.data.map(p => ({...p, value: `${p.type}-${p.id}`, label: `${p.name} (${p.type === 'book' ? 'Sách' : 'VPP'}) - ${p.price?.toLocaleString()}đ (Tồn: ${p.stock_quantity})`}));

        // Cách 2: Gọi 2 API riêng và gộp lại ở FE (như đã làm với ImportOrderFormModal)
        const [booksData, stationeryData] = await Promise.all([
            axios.get(`${API_CONFIG.BASE_URL}/v1/books`, { headers: getAuthHeaders(), params: { limit: 15, searchTerm, fields: 'title,price,stock_quantity' } }),
            axios.get(`${API_CONFIG.BASE_URL}/stationery`, { headers: getAuthHeaders(), params: { limit: 15, searchTerm, fields: 'name,price,stock_quantity' } })
        ]);
        console.log(booksData);
        console.log(stationeryData);
        
        const books = booksData.data.books?.map(b => ({ product: {...b, id: b._id, type: 'book', name: b.title}, value: `book-${b._id}`, label: `${b.title} (Sách) - ${b.price?.toLocaleString()}đ (Tồn: ${b.stock_quantity})` })) || [];
        const stationery = stationeryData.data.stationeryItems?.map(s => ({ product: {...s, id: s._id, type: 'stationery'}, value: `stationery-${s._id}`, label: `${s.name} (VPP) - ${s.price?.toLocaleString()}đ (Tồn: ${s.stock_quantity})` })) || [];

        return [...books, ...stationery];

    } catch (error) {
        throw error.response?.data || { message: 'Lỗi tải danh sách sản phẩm.' };
    }
};

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

const orderService = {
    getAllOrders,
    getOrderById,
    createOrder,
    updateOrderStatus,
    processOrderPayment,
    cancelOrder,
    // updateOrderDetails,
    getCustomersForForm,
    getBooksForForm,
    getStationeryForForm,
    // Get all orders for a store
    getAllOrders: async (storeId, params) => {
        try {
            let url;
            if (storeId) {
                url = `${API_CONFIG.BASE_URL}/v1/orders/store/${storeId}`;
            } else {
                url = `${API_CONFIG.BASE_URL}/v1/orders/admin`;
            }
            
            const response = await axios.get(
                url,
                {
                    ...getAuthHeader(),
                    params
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching orders:', error);
            throw error.response?.data || { message: 'Could not fetch orders' };
        }
    },

    // Get order by ID
    getOrderById: async (storeId, orderId) => {
        try {
            if (!storeId) {
                throw new Error('Store ID is required');
            }
            const response = await axios.get(
                `${API_CONFIG.BASE_URL}/v1/orders/store/${storeId}/${orderId}`,
                getAuthHeader()
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching order:', error);
            throw error.response?.data || { message: 'Could not fetch order details' };
        }
    },

    // Create new order
    createOrder: async (storeId, orderData) => {
        try {
            if (!storeId) {
                throw new Error('Store ID is required');
            }
            const response = await axios.post(
                `${API_CONFIG.BASE_URL}/v1/orders/store/${storeId}`,
                orderData,
                getAuthHeader()
            );
            return response.data;
        } catch (error) {
            console.error('Error creating order:', error);
            throw error.response?.data || { message: 'Could not create order' };
        }
    },

    // Update order status
    updateOrderStatus: async (storeId, orderId, statusData) => {
        try {
            if (!storeId) {
                throw new Error('Store ID is required');
            }
            const response = await axios.put(
                `${API_CONFIG.BASE_URL}/v1/orders/store/${storeId}/${orderId}/status`,
                statusData,
                getAuthHeader()
            );
            return response.data;
        } catch (error) {
            console.error('Error updating order status:', error);
            throw error.response?.data || { message: 'Could not update order status' };
        }
    },

    // Cancel order
    cancelOrder: async (storeId, orderId, reason) => {
        try {
            if (!storeId) {
                throw new Error('Store ID is required');
            }
            const response = await axios.put(
                `${API_CONFIG.BASE_URL}/v1/orders/store/${storeId}/${orderId}/cancel`,
                { reason },
                getAuthHeader()
            );
            return response.data;
        } catch (error) {
            console.error('Error canceling order:', error);
            throw error.response?.data || { message: 'Could not cancel order' };
        }
    },

    // Get books for order form
    getBooksForForm: async (storeId) => {
        try {
            if (!storeId) {
                throw new Error('Store ID is required');
            }
            const response = await axios.get(
                `${API_CONFIG.BASE_URL}/v1/orders/store/${storeId}/products`,
                getAuthHeader()
            );
            return response.data.data.books;
        } catch (error) {
            console.error('Error fetching books:', error);
            throw error.response?.data || { message: 'Could not fetch books' };
        }
    },

    // Get stationery items for order form
    getStationeryForForm: async (storeId) => {
        try {
            if (!storeId) {
                throw new Error('Store ID is required');
            }
            const response = await axios.get(
                `${API_CONFIG.BASE_URL}/v1/orders/store/${storeId}/products`,
                getAuthHeader()
            );
            return response.data.data.stationery;
        } catch (error) {
            console.error('Error fetching stationery items:', error);
            throw error.response?.data || { message: 'Could not fetch stationery items' };
        }
    },

    // Get products for order form
    getProductsForForm: async (storeId) => {
        try {
            if (!storeId) {
                throw new Error('Store ID is required');
            }
            const response = await axios.get(
                `${API_CONFIG.BASE_URL}/v1/orders/store/${storeId}/products`,
                getAuthHeader()
            );

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to fetch products');
            }

            // Format the data while maintaining the success response structure
            return {
                success: true,
                data: {
                    books: response.data.data.books.map(product => ({
                        value: product.id,
                        type: 'book',
                        name: product.name,
                        price: product.price,
                        stock: product.stock,
                        label: `${product.name} (Sách) - ${product.price?.toLocaleString()}đ (Tồn: ${product.stock})`
                    })),
                    stationery: response.data.data.stationery.map(product => ({
                        value: product.id,
                        type: 'stationery',
                        name: product.name,
                        price: product.price,
                        stock: product.stock,
                        label: `${product.name} (VPP) - ${product.price?.toLocaleString()}đ (Tồn: ${product.stock})`
                    })),
                    allProducts: response.data.data.allProducts.map(product => ({
                        value: product.id,
                        type: product.type,
                        name: product.name,
                        price: product.price,
                        stock: product.stock,
                        label: `${product.name} (${product.type === 'book' ? 'Sách' : 'VPP'}) - ${product.price?.toLocaleString()}đ (Tồn: ${product.stock})`
                    }))
                }
            };
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error.response?.data || { message: 'Could not fetch products' };
        }
    },

    // Get all orders (admin only)
    getAllOrdersAdmin: async (params) => {
        try {
            const response = await axios.get(
                `${API_CONFIG.BASE_URL}/v1/orders/admin`,
                {
                    ...getAuthHeader(),
                    params
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching orders:', error);
            throw error.response?.data || { message: 'Could not fetch orders' };
        }
    }
};

export default orderService;