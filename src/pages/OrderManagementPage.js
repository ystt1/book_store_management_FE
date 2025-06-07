// src/pages/OrderManagementPage.js
import React, { useState, useEffect, useMemo, useCallback, useContext } from 'react';
import { useSearchParams, useNavigate, useParams, useLocation } from 'react-router-dom';
import styles from './OrderManagementPage.module.css';
import OrderTable from '../components/Orders/OrderTable';
import OrderFormModal from '../components/Orders/OrderFormModal';
import OrderDetailsModal from '../components/Orders/OrderDetailsModal';
import ConfirmModal from '../components/Common/ConfirmModal';
import Select from 'react-select';
import orderService from '../services/orderService';
import customerService from '../services/customerService';
import { FaPlus, FaSearch, FaFilter, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { Table, Button, Space, Modal, Form, Input, message, DatePicker, Tag, Row, Col, InputNumber, Card, Statistic, Divider } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ContainerOutlined, DollarOutlined, SyncOutlined } from '@ant-design/icons';
import { debounce } from 'lodash';

const { Option } = Select;

const paymentStatusOptions = [
    { value: 'pending', label: 'Chờ thanh toán' },
    { value: 'paid', label: 'Đã thanh toán' },
    { value: 'failed', label: 'Thất bại' },
    { value: 'refunded', label: 'Đã hoàn tiền' },
];

// Định nghĩa các trạng thái đơn hàng và luồng chuyển đổi
const ORDER_STATUS = {
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
};

const ORDER_STATUS_FLOW = {
    [ORDER_STATUS.PROCESSING]: [ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED],
    [ORDER_STATUS.COMPLETED]: [],
    [ORDER_STATUS.CANCELLED]: []
};

const ORDER_STATUS_LABELS = {
    [ORDER_STATUS.PROCESSING]: 'Đang xử lý',
    [ORDER_STATUS.COMPLETED]: 'Hoàn thành',
    [ORDER_STATUS.CANCELLED]: 'Đã hủy'
};

const ORDER_STATUS_COLORS = {
    [ORDER_STATUS.PROCESSING]: '#1890ff',   // Màu xanh dương
    [ORDER_STATUS.COMPLETED]: '#52c41a',    // Màu xanh lá
    [ORDER_STATUS.CANCELLED]: '#ff4d4f'     // Màu đỏ
};

// initialOrderForm cho OrderFormModal
const initialOrderFormData = {
    customer_id: null,
    customer_name_cache: '', // Cho khách lẻ
    items: [],
    discount_type: null,
    discount_value: 0,
    tax_percentage: 10, // Mặc định thuế (nếu có)
    shipping_address: '',
    notes_customer: '',
    notes_internal: '',
    payment_method: null, // Sẽ được chọn khi thanh toán
};

const OrderManagementPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { storeId } = useParams(); // Get storeId from URL params
    const { currentUser } = useAuth();
    const location = useLocation();

    // Determine if we're in admin mode (no storeId) or store-specific mode
    const isAdminView = !storeId;

    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
    const [pageSize, setPageSize] = useState(parseInt(searchParams.get('limit')) || 10);
    const [total, setTotal] = useState(0);

    // Filter
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterDateRange, setFilterDateRange] = useState([null, null]);
    const [filterMinAmount, setFilterMinAmount] = useState('');
    const [filterMaxAmount, setFilterMaxAmount] = useState('');
    const [isFilterVisible, setIsFilterVisible] = useState(false);

    // Thêm state để lưu giá trị tạm thời
    const [tempSearchTerm, setTempSearchTerm] = useState('');
    const [tempMinAmount, setTempMinAmount] = useState('');
    const [tempMaxAmount, setTempMaxAmount] = useState('');

    // Data cho dropdowns trong Form và Filter
    const [productOptions, setProductOptions] = useState([]); // Sách và VPP gộp lại

    // Modals
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [currentOrderDataForForm, setCurrentOrderDataForForm] = useState(initialOrderFormData);
    const [formModalMode, setFormModalMode] = useState('add');

    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedOrderForDetails, setSelectedOrderForDetails] = useState(null);

    // const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    // const [orderToPay, setOrderToPay] = useState(null);

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [itemToConfirm, setItemToConfirm] = useState({ id: null, name: '', action: '' });

    const [modalVisible, setModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingId, setEditingId] = useState(null);
    const [customerOptions, setCustomerOptions] = useState([]);
    const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);

    // Debounced search function
    const debouncedSearchCustomers = useMemo(
        () =>
            debounce(async (searchText) => {
                if (!searchText) {
                    return;
                }
                setIsLoadingCustomers(true);
                try {
                    const response = await customerService.searchCustomers(searchText);
                    const formattedOptions = response.customers.map(customer => ({
                        value: customer._id,
                        label: `${customer.full_name} (${customer.phone})`,
                        customer: customer
                    }));
                    setCustomerOptions(formattedOptions);
                } catch (error) {
                    console.error('Error searching customers:', error);
                    message.error('Không thể tìm kiếm khách hàng');
                } finally {
                    setIsLoadingCustomers(false);
                }
            }, 500),
        []
    );

    // Initial customers load
    const loadInitialCustomers = async () => {
        setIsLoadingCustomers(true);
        try {
            const response = await customerService.getAllCustomers();
            const formattedOptions = response.customers.map(customer => ({
                value: customer._id,
                label: `${customer.full_name} (${customer.phone})`,
                customer: customer
            }));
            setCustomerOptions(formattedOptions);
        } catch (error) {
            console.error('Error loading initial customers:', error);
            message.error('Không thể tải danh sách khách hàng');
        } finally {
            setIsLoadingCustomers(false);
        }
    };

    useEffect(() => {
        loadInitialCustomers();
    }, []);

    // Handle customer search
    const handleCustomerSearch = (value) => {
        if (value) {
            debouncedSearchCustomers(value);
        } else {
            loadInitialCustomers();
        }
    };

    // Clean up debounce on unmount
    useEffect(() => {
        return () => {
            debouncedSearchCustomers.cancel();
        };
    }, [debouncedSearchCustomers]);

   
    const fetchOrders = useCallback(async (pageToFetch, currentFilters) => {
        setIsLoading(true);
        setError(null);
        try {
            const params = {
                page: pageToFetch,
                limit: pageSize,
                ...(currentFilters.searchTerm && { searchTerm: currentFilters.searchTerm }),
                ...(currentFilters.filterStatus && { status: currentFilters.filterStatus }),
                ...(currentFilters.filterDateRange?.[0] && { dateFrom: currentFilters.filterDateRange[0] }),
                ...(currentFilters.filterDateRange?.[1] && { dateTo: currentFilters.filterDateRange[1] }),
                ...(currentFilters.filterMinAmount && { minAmount: currentFilters.filterMinAmount }),
                ...(currentFilters.filterMaxAmount && { maxAmount: currentFilters.filterMaxAmount })
            };

            const response = await orderService.getAllOrders(storeId, params);
            console.log('Orders response:', response); // Debug log

            if (response.orders) {
                setOrders(response.orders);
                setTotal(response.pagination?.total || 0);
                setCurrentPage(response.pagination?.currentPage || pageToFetch);
            }

            // Cập nhật URL params
            const newSearchParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== '') newSearchParams.set(key, value);
            });
            setSearchParams(newSearchParams, { replace: true });
        } catch (err) {
            console.error("Lỗi khi lấy danh sách đơn hàng:", err);
            setError(err.message || 'Không thể tải danh sách đơn hàng.');
            setOrders([]);
            setTotal(0);
        } finally {
            setIsLoading(false);
        }
    }, [pageSize, setSearchParams, storeId]);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                if (!storeId) {
                    throw new Error('Store ID is required');
                }

                const response = await orderService.getProductsForForm(storeId);
                const customerResponse = await customerService.getAllCustomers();
                if (response?.success && response?.data) {
                    setProductOptions(response.data.allProducts);
                }
                if (customerResponse?.success && customerResponse?.data) {
                    setCustomerOptions(customerResponse.data.customers);
                }
            } catch (err) {
                console.error("Lỗi tải dữ liệu form:", err);
                setError("Lỗi tải dữ liệu cho form.");
            }
        };
        fetchInitialData();
    }, [storeId]);

    // Cập nhật useEffect để đọc params từ URL và fetch data
    useEffect(() => {
        const pageFromUrl = parseInt(searchParams.get('page')) || 1;
        const searchTermFromUrl = searchParams.get('searchTerm') || '';
        const statusFromUrl = searchParams.get('status') || '';
        const dateFromUrl = searchParams.get('dateFrom');
        const dateToUrl = searchParams.get('dateTo');
        const minAmountFromUrl = searchParams.get('minAmount');
        const maxAmountFromUrl = searchParams.get('maxAmount');

        // Cập nhật state từ URL
        setSearchTerm(searchTermFromUrl);
        setFilterStatus(statusFromUrl);
        setFilterMinAmount(minAmountFromUrl || '');
        setFilterMaxAmount(maxAmountFromUrl || '');
        if (dateFromUrl && dateToUrl) {
            setFilterDateRange([dateFromUrl, dateToUrl]);
        }

        // Fetch orders với các params từ URL
        fetchOrders(pageFromUrl, {
            searchTerm: searchTermFromUrl,
            filterStatus: statusFromUrl,
            filterDateRange: dateFromUrl && dateToUrl ? [dateFromUrl, dateToUrl] : null,
            filterMinAmount: minAmountFromUrl,
            filterMaxAmount: maxAmountFromUrl
        });
    }, [searchParams, fetchOrders]);

    const handleFilterChange = (filterName, value) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set(filterName, value);
        } else {
            newParams.delete(filterName);
        }
        newParams.set('page', '1'); // Reset về trang 1 khi filter thay đổi
        setSearchParams(newParams);
    };

    const handlePageChange = (page, pageSize) => {
        setCurrentPage(page);
        setPageSize(pageSize);
        const newParams = new URLSearchParams(searchParams);
        newParams.set('page', page.toString());
        newParams.set('limit', pageSize.toString());
        setSearchParams(newParams);

        // Fetch orders với trang mới
        fetchOrders(page, {
            searchTerm,
            filterStatus,
            filterDateRange,
            filterMinAmount,
            filterMaxAmount
        });
    };

    const openFormModal = (mode, order = null) => {
        setFormModalMode(mode);
        if (mode === 'edit' && order) {
            const formData = {
                ...initialOrderFormData,
                ...order,
                id: order._id || order.id,
                customer_id: order.customer_id || null,  // Directly use the customer_id from order
                items: order.items?.map(item => ({
                    ...item,
                    product: productOptions?.find(p => p.value === item.product_id) || null
                })) || []
            };
            setCurrentOrderDataForForm(formData);
        } else {
            setCurrentOrderDataForForm(initialOrderFormData);
        }
        setIsFormModalOpen(true);
    };
    const closeFormModal = () => setIsFormModalOpen(false);

    const handleSubmitOrder = async (formData) => {
       
    
        setIsLoading(true);
        try {
            if (!storeId) {
                throw new Error('Store ID is required');
            }

            console.log('Form data received:', formData); // Debug log

            // Gửi trực tiếp formData mà không format lại
            const response = await orderService.createOrder(storeId, formData);
            
            if (response.success) {
                message.success('Tạo đơn hàng thành công!');
                closeFormModal();
                fetchOrders(currentPage, {
                    searchTerm,
                    filterStatus,
                    filterDateRange,
                    filterMinAmount,
                    filterMaxAmount
                });
            }
        } catch (err) {
            console.error('Error creating order:', err);
            message.error(err.response?.data?.message || 'Lỗi khi tạo đơn hàng.');
        } finally {
            setIsLoading(false);
        }
    };

    const openDetailsModal = async (order) => {
        setIsLoading(true);
        try {
            const detailedOrder = await orderService.getOrderById(order._id || order.id);
            // API nên trả về items với product_name đã được điền
            setSelectedOrderForDetails(detailedOrder);
            setIsDetailsModalOpen(true);
        } catch (err) {
            setError(err.message || "Không thể tải chi tiết đơn hàng.");
        } finally {
            setIsLoading(false);
        }
    };

    // Thêm hàm kiểm tra trạng thái có thể chuyển đổi
    const getAvailableStatusTransitions = (currentStatus) => {
        return ORDER_STATUS_FLOW[currentStatus] || [];
    };

    // Cập nhật hàm xử lý thay đổi trạng thái
    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            if (!storeId) {
                throw new Error('Store ID is required');
            }

            setIsLoading(true);
            const response = await orderService.updateOrderStatus(storeId, orderId, { status: newStatus });

            if (response.success) {
                // Fetch lại dữ liệu ngay sau khi update thành công
                await fetchOrders(currentPage, {
                    searchTerm,
                    filterStatus,
                    filterDateRange,
                    filterMinAmount,
                    filterMaxAmount
                });
                message.success('Cập nhật trạng thái đơn hàng thành công');
            } else {
                message.error(response.message || 'Lỗi khi cập nhật trạng thái đơn hàng');
            }
        } catch (err) {
            console.error('Error updating order status:', err);
            message.error(err.message || 'Lỗi khi cập nhật trạng thái đơn hàng');
        } finally {
            setIsLoading(false);
        }
    };

    // const handleProcessPaymentOnPage = async (paymentData) => {
    //     // Được gọi từ PaymentModal (nếu dùng)
    //     setIsLoading(true);
    //     try {
    //         await orderService.processOrderPayment(paymentData.orderId, paymentData);
    //         alert("Thanh toán thành công!");
    //         // setIsPaymentModalOpen(false);
    //         // setOrderToPay(null);
    //         fetchOrders(); // Fetch lại
    //     } catch (err) { setError(err.message || 'Lỗi xử lý thanh toán.'); }
    //     finally { setIsLoading(false); }
    // };


    const handleCancelOrderClick = (orderId) => {
        setItemToConfirm({ id: orderId, name: `đơn hàng ${orderId}`, action: 'cancel' });
        setIsConfirmModalOpen(true);
    };

    const handleConfirmCancelOrder = async () => {
        if (!itemToConfirm.id) return;
        setIsLoading(true);
        try {
            if (!storeId) {
                throw new Error('Store ID is required');
            }

            await orderService.cancelOrder(storeId, itemToConfirm.id, 'Hủy bởi người dùng');
            alert('Hủy đơn hàng thành công!');
            setIsConfirmModalOpen(false);
            setItemToConfirm({ id: null, name: '', action: '' });
            fetchOrders(currentPage, { searchTerm, filterStatus, filterDateRange, filterMinAmount, filterMaxAmount });
        } catch (err) {
            setError(err.message || 'Lỗi khi hủy đơn hàng.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (record) => {
        setEditingId(record.orderId);
        form.setFieldsValue(record);
        setModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            // Gọi API xóa đơn hàng
            message.success('Xóa đơn hàng thành công!');
        } catch (error) {
            message.error('Xóa đơn hàng thất bại!');
        }
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            if (editingId) {
                // Gọi API cập nhật đơn hàng
                message.success('Cập nhật đơn hàng thành công!');
            } else {
                // Gọi API thêm đơn hàng mới
                message.success('Thêm đơn hàng thành công!');
            }
            setModalVisible(false);
            form.resetFields();
            setEditingId(null);
        } catch (error) {
            console.error('Validate Failed:', error);
        }
    };

    const handleModalCancel = () => {
        setModalVisible(false);
        form.resetFields();
        setEditingId(null);
    };

    // Hàm xử lý khi nhấn Enter
    const handleSearchKeyPress = (e) => {
        if (e.key === 'Enter') {
            setSearchTerm(tempSearchTerm);
        }
    };

    // Hàm xử lý khi nhấn Enter cho bộ lọc giá
    const handleAmountFilterKeyPress = (e) => {
        if (e.key === 'Enter') {
            setFilterMinAmount(tempMinAmount);
            setFilterMaxAmount(tempMaxAmount);
        }
    };

    // Hàm reset bộ lọc
    const handleResetFilters = () => {
        setSearchParams(new URLSearchParams({ page: '1', limit: pageSize.toString() }));
    };

    // Cập nhật hàm tìm kiếm để hỗ trợ tìm theo ID
    const handleSearch = (value) => {
        setSearchTerm(value);
        setCurrentPage(1);
        const params = new URLSearchParams(searchParams);
        params.set('searchTerm', value);
        params.set('page', '1');
        setSearchParams(params);
    };

    // --- JSX ---
    return (
        <div className={styles.pageContainer}>
            

            <Row gutter={[16, 16]} className={styles.statsSection}>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Tổng Đơn Hàng"
                            value={total}
                            prefix={<ContainerOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Tổng Doanh Thu"
                            value={orders.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0)}
                            prefix={<DollarOutlined />}
                            formatter={(value) => `${value.toLocaleString('vi-VN')} VNĐ`}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Đơn Đang Xử Lý"
                            value={orders.filter(order => order.status === ORDER_STATUS.PROCESSING).length}
                            prefix={<SyncOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Divider />

            <Card>
                <div className={styles.tableHeader}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Row gutter={[16, 16]} align="middle" justify="space-between">
                            <Col xs={24} sm={16} md={12} lg={8}>
                                <Input
                                    placeholder="Tìm kiếm theo mã đơn hàng..."
                                    prefix={<FaSearch />}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onSearch={handleSearch}
                                    style={{ width: '100%' }}
                                />
                            </Col>
                            <Col xs={24} sm={8} md={12} lg={16} style={{ textAlign: 'right' }}>
                                <Space>
                                    
                                    <Button
                                        icon={isFilterVisible ? <FaChevronUp /> : <FaChevronDown />}
                                        onClick={() => setIsFilterVisible(!isFilterVisible)}
                                    >
                                        Bộ lọc nâng cao
                                    </Button>
                                    {!isAdminView && (
                                        <Button
                                            type="primary"
                                            icon={<FaPlus />}
                                            onClick={() => openFormModal('add')}
                                        >
                                            Tạo đơn hàng mới
                                        </Button>
                                    )}
                                </Space>
                            </Col>
                        </Row>

                        {isFilterVisible && (
                            <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
                                <Col xs={24} sm={12} md={8} lg={6}>
                                    <Form.Item label="Trạng thái">
                                        <Select
                                            value={filterStatus}
                                            onChange={(value) => setFilterStatus(value)}
                                            allowClear
                                            placeholder="Chọn trạng thái"
                                            style={{ width: '100%' }}
                                        >
                                            {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
                                                <Select.Option key={value} value={value}>
                                                    {label}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={12} md={8} lg={6}>
                                    <Form.Item label="Khoảng thời gian">
                                        <DatePicker.RangePicker
                                            value={filterDateRange}
                                            onChange={(dates) => setFilterDateRange(dates)}
                                            format="DD/MM/YYYY"
                                            style={{ width: '100%' }}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={12} md={8} lg={6}>
                                    <Form.Item label="Giá trị đơn hàng">
                                        <Space style={{ width: '100%' }}>
                                            <InputNumber
                                                placeholder="Từ"
                                                value={filterMinAmount}
                                                onChange={(value) => setFilterMinAmount(value)}
                                                style={{ width: '100%' }}
                                            />
                                            <InputNumber
                                                placeholder="Đến"
                                                value={filterMaxAmount}
                                                onChange={(value) => setFilterMaxAmount(value)}
                                                style={{ width: '100%' }}
                                            />
                                        </Space>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} md={8} lg={6}>
                                    <Form.Item label=" " className={styles.filterActions}>
                                        <Button onClick={handleResetFilters}>
                                            Đặt lại bộ lọc
                                        </Button>
                                    </Form.Item>
                                </Col>
                            </Row>
                        )}
                    </Space>
                </div>

                {isLoading && <div className={styles.loadingOverlay}><div className={styles.loader}></div></div>}
                {error && <div className={styles.errorBanner}>{error}</div>}

                {!isLoading && orders.length > 0 && !error && (
                    <OrderTable
                        orders={orders}
                        onViewDetails={openDetailsModal}
                        onEditOrder={!isAdminView ? openFormModal : undefined}
                        onDeleteOrder={!isAdminView ? handleCancelOrderClick : undefined}
                        onUpdateStatus={handleUpdateStatus}
                        statusLabels={ORDER_STATUS_LABELS}
                        statusColors={ORDER_STATUS_COLORS}
                        orderStatusOptions={Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({
                            value,
                            label
                        }))}
                        isAdminView={isAdminView}
                        loading={isLoading}
                        pagination={{
                            current: currentPage,
                            pageSize: pageSize,
                            total: total,
                            onChange: handlePageChange,
                            showSizeChanger: true,
                            showTotal: (total) => `Tổng ${total} mục`
                        }}
                    />
                )}
                {!isLoading && orders.length === 0 && !error && (
                    <div className={styles.noResultsContainer}>
                        <p className={styles.noResults}>Không có đơn hàng nào.</p>
                    </div>
                )}
            </Card>

            <OrderFormModal
                isOpen={isFormModalOpen}
                onClose={closeFormModal}
                onSubmit={handleSubmitOrder}
                currentOrder={currentOrderDataForForm}
                mode={formModalMode}
                customerOptions={customerOptions}
                onCustomerSearch={handleCustomerSearch}
                isLoadingCustomers={isLoadingCustomers}
                sampleProducts={productOptions}
            />

            {selectedOrderForDetails && (
                <OrderDetailsModal
                    isOpen={isDetailsModalOpen}
                    onClose={() => setIsDetailsModalOpen(false)}
                    order={selectedOrderForDetails}
                    statusLabels={ORDER_STATUS_LABELS}
                    statusColors={ORDER_STATUS_COLORS}
                    onUpdateStatus={handleUpdateStatus}
                />
            )}

            {/* PaymentModal nếu có */}
            {/* {orderToPay && (
                <PaymentModal
                    isOpen={isPaymentModalOpen}
                    onClose={() => setIsPaymentModalOpen(false)}
                    order={orderToPay}
                    onProcessPayment={handleProcessPaymentOnPage}
                />
            )} */}


            <ConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirmCancelOrder}
                title="Xác nhận Hủy Đơn Hàng"
                message={`Bạn có chắc chắn muốn hủy đơn hàng "${itemToConfirm.name}" không?`}
            />

            <Modal
                title={editingId ? 'Sửa Đơn Hàng' : 'Thêm Đơn Hàng'}
                open={modalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
            >
                <Form
                    form={form}
                    layout="vertical"
                >
                    <Form.Item
                        name="customer"
                        label="Khách hàng"
                        rules={[{ required: true, message: 'Vui lòng nhập tên khách hàng!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="orderDate"
                        label="Ngày đặt"
                        rules={[{ required: true, message: 'Vui lòng chọn ngày đặt!' }]}
                    >
                        <Input type="date" />
                    </Form.Item>
                    <Form.Item
                        name="status"
                        label="Trạng thái"
                        rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                    >
                        <Select>
                            <Option value="processing">Đang xử lý</Option>
                            <Option value="completed">Hoàn thành</Option>
                            <Option value="cancelled">Đã hủy</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default OrderManagementPage;