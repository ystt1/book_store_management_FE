// src/pages/GeneralImportOrderPage.js
import React, { useState, useEffect, useMemo, useCallback, useContext, useRef } from 'react'; // Thêm useContext và useRef
import { useSearchParams, useNavigate, useParams, useLocation } from 'react-router-dom';
import styles from './GeneralImportOrderPage.module.css';
import ImportOrderTable from '../components/ImportOrders/ImportOrderTable';
import ImportOrderFormModal from '../components/ImportOrders/ImportOrderFormModal';
import ImportOrderDetailsModal from '../components/ImportOrders/ImportOrderDetailsModal';
import ConfirmModal from '../components/Common/ConfirmModal';
import Pagination from '../components/Common/Pagination';
import { debounce } from 'lodash';

import importOrderService from '../services/importOrderService'; // << IMPORT SERVICE
import { AuthContext } from '../contexts/AuthContext'; // << IMPORT AUTHCONTEXT
import { FaPlus, FaSearch, FaFilter, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { Table, Button, Space, Modal, Form, Input, message, Row, Col, Card, InputNumber, Select, DatePicker, Statistic, Divider, Typography, Tag, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, FilterOutlined, ContainerOutlined, DollarOutlined, SyncOutlined, CaretUpOutlined, CaretDownOutlined } from '@ant-design/icons';
import { PlusOutlined as AntPlusOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Text } = Typography;

// Cập nhật lại các trạng thái
const importOrderStatusOptions = [
    { value: 'pending_approval', label: 'Chờ duyệt' },
    { value: 'completed', label: 'Hoàn thành' },
    { value: 'cancelled', label: 'Đã hủy' }
];

const initialImportOrderForm = { // Dùng cho currentImportOrder trong modal
    supplier_id: null, items: [], total_amount: 0, expected_delivery_date: '', notes: '', status: 'pending_approval'
};

const { Option } = Select;
const { RangePicker } = DatePicker;

const GeneralImportOrderPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { storeId } = useParams(); // Get storeId from URL params
    const { currentUser } = useAuth();
    const location = useLocation();

    // Determine if we're in admin mode (no storeId) or store-specific mode
    const isAdminView = !storeId;

    const [importOrders, setImportOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [expandedOrderId, setExpandedOrderId] = useState(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = parseInt(searchParams.get('limit')) || 10;

    // Filter
    const [searchTerm, setSearchTerm] = useState(searchParams.get('searchTerm') || '');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [filterStatus, setFilterStatus] = useState(null);
    const [filterSupplier, setFilterSupplier] = useState(null);
    const [filterDateFrom, setFilterDateFrom] = useState(searchParams.get('dateFrom') || '');
    const [filterDateTo, setFilterDateTo] = useState(searchParams.get('dateTo') || '');

    // Data cho dropdowns form/filter
    const [supplierOptions, setSupplierOptions] = useState([]);
    const [bookOptionsForForm, setBookOptionsForForm] = useState([]);
    const [stationeryOptionsForForm, setStationeryOptionsForForm] = useState([]);

    // Modals
    const [modalVisible, setModalVisible] = useState(false);
    const [currentImportOrder, setCurrentImportOrder] = useState(null); // Dữ liệu cho modal sửa/chi tiết
    const [importModalMode, setImportModalMode] = useState('add');
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState({ id: null, name: '' });

    const [selectedImportOrderForDetails, setSelectedImportOrderForDetails] = useState(null);

    const [orders, setOrders] = useState([]);
    const [form] = Form.useForm();
    const [editingId, setEditingId] = useState(null);

    // Thêm state cho bộ lọc số lượng và giá tiền
    const [filterMinAmount, setFilterMinAmount] = useState('');
    const [filterMaxAmount, setFilterMaxAmount] = useState('');

    const [sortField, setSortField] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('descend'); // 'ascend' or 'descend'

    // Thêm state để kiểm soát việc cập nhật URL
    const [shouldUpdateUrl, setShouldUpdateUrl] = useState(true);
    const prevSearchParamsRef = useRef(null);

    // Định nghĩa updateUrlParams trước khi sử dụng trong các hàm khác
    const updateUrlParams = useCallback((updates) => {
        if (!shouldUpdateUrl) return;

        setShouldUpdateUrl(false);
        const newParams = new URLSearchParams(searchParams);

        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === undefined || value === '') {
                newParams.delete(key);
            } else {
                newParams.set(key, value.toString());
            }
        });

        setSearchParams(newParams);
        setTimeout(() => setShouldUpdateUrl(true), 0);
    }, [searchParams, setSearchParams, shouldUpdateUrl]);

    // Sau đó định nghĩa các hàm sử dụng updateUrlParams
    const handleFilterChange = useCallback((filterName, value) => {
        const updates = { [filterName]: value?.value || value, page: 1 };
        updateUrlParams(updates);
    }, [updateUrlParams]);

    const handleTableChange = useCallback((pagination, filters, sorter) => {
        if (sorter) {
            const newSortField = sorter.field || 'created_at';
            const newSortOrder = !sorter.order ? -1 : (sorter.order === 'ascend' ? 1 : -1);

            updateUrlParams({
                sortField: newSortField,
                sortOrder: newSortOrder,
                page: currentPage
            });
        }
    }, [currentPage, updateUrlParams]);

    const [debouncedAmountChange] = useState(() =>
        debounce((type, value) => {
            const updates = {
                [type]: value,
                page: 1
            };
            if (type === 'minAmount' && filterMaxAmount) {
                updates.maxAmount = filterMaxAmount;
            } else if (type === 'maxAmount' && filterMinAmount) {
                updates.minAmount = filterMinAmount;
            }
            updateUrlParams(updates);
        }, 500)
    );

    // Cleanup effect
    useEffect(() => {
        return () => {
            if (debouncedSearch?.cancel) debouncedSearch.cancel();
            if (debouncedAmountChange?.cancel) debouncedAmountChange.cancel();
            
            setImportOrders([]);
            setCurrentPage(1);
            setTotalPages(0);
            setTotalItems(0);
            setSearchTerm('');
            setFilterStatus(null);
            setFilterSupplier(null);
            setFilterDateFrom('');
            setFilterDateTo('');
            setFilterMinAmount('');
            setFilterMaxAmount('');
            setSortField('created_at');
            setSortOrder(-1);
        };
    }, []);

    // URL sync effect
    useEffect(() => {
        if (!shouldUpdateUrl) return;

        const currentSearchParams = Object.fromEntries(searchParams.entries());
        const prevSearchParams = prevSearchParamsRef.current;

        if (JSON.stringify(currentSearchParams) === JSON.stringify(prevSearchParams)) {
            return;
        }

        prevSearchParamsRef.current = currentSearchParams;

        const loadData = async () => {
            const pageFromUrl = parseInt(searchParams.get('page')) || 1;
            const searchTermFromUrl = searchParams.get('searchTerm') || '';
            const statusFromUrl = searchParams.get('status') || '';
            const supplierFromUrl = searchParams.get('supplierId') || '';
            const dateFromUrl = searchParams.get('dateFrom') || '';
            const dateToUrl = searchParams.get('dateTo') || '';
            const minAmountFromUrl = searchParams.get('minAmount') || '';
            const maxAmountFromUrl = searchParams.get('maxAmount') || '';
            const sortFieldFromUrl = searchParams.get('sortField') || 'created_at';
            const sortOrderFromUrl = searchParams.get('sortOrder') || '-1';

            setCurrentPage(pageFromUrl);
            setSearchTerm(searchTermFromUrl);
            setFilterStatus(importOrderStatusOptions.find(opt => opt.value === statusFromUrl) || null);
            setFilterSupplier(supplierOptions.find(opt => opt.value === supplierFromUrl) || null);
            setFilterDateFrom(dateFromUrl);
            setFilterDateTo(dateToUrl);
            setFilterMinAmount(minAmountFromUrl);
            setFilterMaxAmount(maxAmountFromUrl);
            setSortField(sortFieldFromUrl);
            setSortOrder(parseInt(sortOrderFromUrl));

            const currentFilters = {
                searchTerm: searchTermFromUrl,
                filterStatus: importOrderStatusOptions.find(opt => opt.value === statusFromUrl) || null,
                filterSupplier: supplierOptions.find(opt => opt.value === supplierFromUrl) || null,
                filterDateFrom: dateFromUrl,
                filterDateTo: dateToUrl,
                filterMinAmount: minAmountFromUrl,
                filterMaxAmount: maxAmountFromUrl,
                sortField: sortFieldFromUrl,
                sortOrder: parseInt(sortOrderFromUrl)
            };

            if (supplierOptions.length > 0 || !searchParams.get('supplierId')) {
                await fetchImportOrders(pageFromUrl, currentFilters);
            }
        };

        loadData();
    }, [searchParams, shouldUpdateUrl, supplierOptions, importOrderStatusOptions]);

    // Thêm debounce handlers
    const debouncedSearch = useMemo(
        () =>
            debounce((value) => {
                handleFilterChange('searchTerm', value);
            }, 500),
        [handleFilterChange]
    );

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

    const openModal = (mode, order = null) => {
        setImportModalMode(mode);
        setCurrentImportOrder(order ? {
            ...order,
            supplier_id: supplierOptions.find(s => s.value === order.supplier_id._id) || null,
        } : initialImportOrderForm);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setCurrentImportOrder(null);
    };

    const handlePageChange = (page) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('page', page.toString());
        setSearchParams(newParams);
    };

    const resetAdvancedFilters = () => {
        setFilterStatus(null);
        setFilterSupplier(null);
        setFilterDateFrom('');
        setFilterDateTo('');
        setFilterMinAmount('');
        setFilterMaxAmount('');

        // Cập nhật URL để xóa các filter
        const newParams = new URLSearchParams();
        newParams.set('page', '1');
        setSearchParams(newParams);
    };

    const columns = useMemo(() => [
        {
            title: 'Mã ĐN',
            dataIndex: '_id',
            key: '_id',
            width: 120,
            render: (id) => (
                <div 
                    className={styles.orderIdCell}
                    style={{ cursor: 'pointer', color: '#1890ff' }}
                    onClick={() => setExpandedOrderId(expandedOrderId === id ? null : id)}
                >
                    {id}
                    {expandedOrderId === id ? (
                        <CaretUpOutlined style={{ marginLeft: 5 }} />
                    ) : (
                        <CaretDownOutlined style={{ marginLeft: 5 }} />
                    )}
                </div>
            )
        },
        isAdminView && {
            title: 'Cửa hàng',
            dataIndex: 'store',
            key: 'store',
            width: 150,
            render: (store) => (
                <div className={styles.storeInfo}>
                    <div>{store?.name || 'N/A'}</div>
                    <div className={styles.storeAddress}>{store?.address || 'N/A'}</div>
                </div>
            )
        },
        {
            title: 'Nhà cung cấp',
            dataIndex: ['supplier', 'name'],
            key: 'supplier',
            width: 200,
            render: (name, record) => (
                <div className={styles.supplierInfo}>
                    {record.supplier?.name || name || 'N/A'}
                </div>
            )
        },
        {
            title: 'Số lượng',
            dataIndex: 'items',
            key: 'items',
            width: 300,
            render: (items) => {
                if (!items || items.length === 0) return 'Không có sản phẩm';
                
                const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
                const itemsList = items.map(item => {
                    const productName = item.productType === 'Book' 
                        ? item.product?.title 
                        : item.product?.name;
                    return `${productName} (${item.quantity})`;
                }).join(', ');

                return (
                    <div className={styles.itemsList}>
                        <div className={styles.itemsCount}>
                            {totalItems} sản phẩm
                        </div>
                    </div>
                );
            }
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 150,
            sorter: true,
            sortOrder: sortField === 'created_at' ? sortOrder : null,
            render: (date) => {
                const formattedDate = new Date(date).toLocaleDateString('vi-VN');
                const formattedTime = new Date(date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                return (
                    <div>
                        <div>{formattedDate}</div>
                        <div className={styles.timePart}>{formattedTime}</div>
                    </div>
                );
            }
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'total_amount',
            key: 'total_amount',
            width: 150,
            sorter: true,
            sortOrder: sortField === 'total_amount' ? sortOrder : null,
            render: (amount) => (
                <div className={styles.amountCell}>
                    {amount?.toLocaleString('vi-VN')} VNĐ
                </div>
            )
        },
        {
            title: 'Người tạo',
            dataIndex: ['created_by', 'full_name'],
            key: 'created_by',
            width: 150,
            render: (name, record) => (
                <div className={styles.creatorInfo}>
                    <div>{name || 'N/A'}</div>
                </div>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            fixed: 'right',
            width: 150,
            render: (status, record) => {
                const statusConfig = {
                    'pending_approval': { color: '#faad14', label: 'Chờ duyệt' },
                    'approved': { color: '#52c41a', label: 'Đã duyệt' },
                    'importing': { color: '#1890ff', label: 'Đang nhập hàng' },
                    'completed': { color: '#52c41a', label: 'Hoàn thành' },
                    'cancelled': { color: '#ff4d4f', label: 'Đã hủy' }
                };

                return (
                    <Select
                        value={status}
                        onChange={(value) => handleUpdateStatus(record._id, value)}
                        disabled={status === 'completed' || status === 'cancelled'}
                        style={{ width: '100%' }}
                        className={styles.statusSelect}
                    >
                        {importOrderStatusOptions.map(option => (
                            <Option 
                                key={option.value} 
                                value={option.value}
                                style={{ color: statusConfig[option.value]?.color }}
                            >
                                {option.label}
                            </Option>
                        ))}
                    </Select>
                );
            }
        }
    ].filter(Boolean), [expandedOrderId, isAdminView, importOrderStatusOptions, sortField, sortOrder]);

    const fetchImportOrders = useCallback(async (pageToFetch, currentFilters) => {
        setIsLoading(true);
        setError(null);
        try {
            const params = {
                page: pageToFetch,
                limit: itemsPerPage,
                ...(currentFilters.searchTerm && { searchTerm: currentFilters.searchTerm }),
                ...(currentFilters.filterStatus?.value && { status: currentFilters.filterStatus.value }),
                ...(currentFilters.filterSupplier?.value && { supplierId: currentFilters.filterSupplier.value }),
                ...(currentFilters.filterDateFrom && { dateFrom: currentFilters.filterDateFrom }),
                ...(currentFilters.filterDateTo && { dateTo: currentFilters.filterDateTo }),
                ...(currentFilters.filterMinAmount && { minAmount: currentFilters.filterMinAmount }),
                ...(currentFilters.filterMaxAmount && { maxAmount: currentFilters.filterMaxAmount }),
                ...(currentFilters.sortField && { sortField: currentFilters.sortField }),
                ...(currentFilters.sortOrder && { sortOrder: currentFilters.sortOrder })
            };

            // Chuyển đổi các giá trị undefined thành null hoặc giá trị mặc định
            if (!params.sortField) params.sortField = 'created_at';
            if (!params.sortOrder) params.sortOrder = -1;

            Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

            let response;
            if (isAdminView) {
                response = await importOrderService.getAllImportsAdmin(params);
            } else {
                if (!storeId) {
                    throw new Error('Store ID is required for store view');
                }
                response = await importOrderService.getAllImportOrders(storeId, params);
            }

            if (response.success && response.data) {
                setImportOrders(response.data);
                setTotalPages(response.pagination.totalPages || 0);
                setTotalItems(response.pagination.total || 0);
                setCurrentPage(response.pagination.page || 1);
            } else {
                setImportOrders([]);
                setTotalPages(0);
                setTotalItems(0);
            }

            // Cập nhật URL params
            const newSearchParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== '') newSearchParams.set(key, value.toString());
            });
            setSearchParams(newSearchParams);
        } catch (err) {
            setError(err.message || 'Không thể tải danh sách đơn nhập hàng.');
        } finally {
            setIsLoading(false);
        }
    }, [itemsPerPage, searchParams, setSearchParams, storeId, isAdminView]);

    // Tách riêng useEffect cho việc fetch suppliers để tránh re-render không cần thiết
    useEffect(() => {
        let isSubscribed = true;

        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                if (!isAdminView && storeId) {
                    const suppliersResponse = await importOrderService.getSuppliersForForm(storeId);
                    if (suppliersResponse && Array.isArray(suppliersResponse) && isSubscribed) {
                        const formattedSuppliers = suppliersResponse.map(supplier => ({
                            value: supplier._id,
                            label: `${supplier.name} ${supplier.phone ? `(${supplier.phone})` : ''}`,
                            name: supplier.name,
                            phone: supplier.phone
                        }));
                        setSupplierOptions(formattedSuppliers);

                        // Set filter state từ URL
                        const statusValFromUrl = searchParams.get('status');
                        if (isSubscribed) {
                            setFilterStatus(importOrderStatusOptions.find(opt => opt.value === statusValFromUrl) || null);

                            const supplierValFromUrl = searchParams.get('supplierId');
                            const selectedSupplier = formattedSuppliers.find(opt => opt.value === supplierValFromUrl);
                            setFilterSupplier(selectedSupplier || null);
                        }
                    }
                }
            } catch (err) {
                if (isSubscribed) {
                    setError("Lỗi tải dữ liệu ban đầu cho trang.");
                }
            } finally {
                if (isSubscribed) {
                    setIsLoading(false);
                }
            }
        };

        fetchInitialData();

        return () => {
            isSubscribed = false;
        };
    }, [storeId, isAdminView, searchParams, importOrderStatusOptions]);

    const filteredAndSearchedImportOrders = useMemo(() => {
        return importOrders.filter(order => {
            const searchMatch = !searchTerm || 
                (order._id && order._id.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (order.supplier?.name && order.supplier.name.toLowerCase().includes(searchTerm.toLowerCase()));

            if (!searchMatch) return false;

            const statusMatch = !filterStatus || order.status === filterStatus.value;
            const supplierMatch = !filterSupplier || order.supplier_id === filterSupplier.value;
            const dateFromMatch = !filterDateFrom || new Date(order.created_at) >= new Date(filterDateFrom);
            const dateToMatch = !filterDateTo || new Date(order.created_at) <= new Date(new Date(filterDateTo).setHours(23,59,59,999));
            
            // Lọc theo tổng tiền
            const totalAmount = parseFloat(order.total_amount) || 0;
            const minAmountMatch = !filterMinAmount || totalAmount >= filterMinAmount;
            const maxAmountMatch = !filterMaxAmount || totalAmount <= filterMaxAmount;

            return statusMatch && supplierMatch && dateFromMatch && dateToMatch && 
                   minAmountMatch && maxAmountMatch;
        });
    }, [importOrders, searchTerm, filterStatus, filterSupplier, filterDateFrom, filterDateTo,
        filterMinAmount, filterMaxAmount]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentImportOrdersOnPage = filteredAndSearchedImportOrders.slice(indexOfFirstItem, indexOfLastItem);

    const handleSubmitImportOrder = async (formData) => {
        setIsLoading(true);
        try {
            // Format data before sending to server
            const formattedData = {
                supplier: formData.supplier,
                expected_delivery_date: formData.expected_delivery_date,
                items: formData.items.map(item => ({
                    product: item.product,
                    productType: item.productType,
                    quantity: item.quantity,
                    price: item.price,
                    total: item.quantity * item.price
                })),
                discount_type: formData.discount_type?.value || null,
                discount_value: formData.discount_value || 0,
                tax_percentage: formData.tax_percentage || 0,
                notes: formData.notes || ''
            };

            // Tính total_amount
            const subtotal = formattedData.items.reduce((sum, item) => sum + item.total, 0);
            let total_amount = subtotal;

            // Áp dụng giảm giá
            if (formattedData.discount_type === 'percentage' && formattedData.discount_value) {
                total_amount = total_amount * (1 - formattedData.discount_value / 100);
            } else if (formattedData.discount_type === 'fixed' && formattedData.discount_value) {
                total_amount = total_amount - formattedData.discount_value;
            }

            // Áp dụng thuế
            if (formattedData.tax_percentage) {
                total_amount = total_amount * (1 + formattedData.tax_percentage / 100);
            }

            formattedData.total_amount = Math.round(total_amount * 100) / 100;

            console.log('Formatted Data:', formattedData);
            console.log('Store ID:', storeId);
            
            if (importModalMode === 'add') {
                await importOrderService.createImportOrder(storeId, formattedData);
                message.success('Tạo đơn nhập hàng thành công!');
                setModalVisible(false); // Đóng modal sau khi tạo thành công
            } else {
                await importOrderService.updateImportOrderDetails(storeId, currentImportOrder._id, formattedData);
                message.success('Cập nhật đơn nhập hàng thành công!');
                setModalVisible(false); // Đóng modal sau khi cập nhật thành công
            }
            fetchImportOrders(1, { searchTerm, filterStatus, filterSupplier, filterDateFrom, filterDateTo });
        } catch (err) {
            console.error('Error creating import order:', err);
            message.error(err.message || 'Lỗi xử lý đơn nhập hàng.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteClick = (orderId, orderName = 'này') => {
        console.log(importOrders);
        
        setItemToDelete({id: orderId, name: orderName});
        setIsConfirmModalOpen(true);
    };
    const handleConfirmDelete = async () => {
        // ... (logic tương tự BookManagementPage, gọi importOrderService.cancelImportOrder) ...
        // Sau đó fetch lại dữ liệu
        console.log(itemToDelete);
        
        if (!itemToDelete.id) return;
        setIsLoading(true);
        try {
            await importOrderService.cancelImportOrder(itemToDelete.id, { reason: "Hủy bởi người dùng" });
            alert(`Đơn nhập hàng "${itemToDelete.id}" đã được hủy.`);
            setIsConfirmModalOpen(false);
            // Fetch lại trang hiện tại hoặc trang trước nếu trang hiện tại rỗng
            const paramsForFetch = { searchTerm, filterStatus, filterSupplier, filterDateFrom, filterDateTo};
            let pageToFetch = currentPage;
            if (currentImportOrdersOnPage.length === 1 && currentPage > 1) {
                pageToFetch = currentPage - 1;
            }
            fetchImportOrders(pageToFetch, paramsForFetch);

        } catch (err) {
            setError(err.message || 'Lỗi khi hủy đơn nhập hàng.');
            setIsConfirmModalOpen(false);
        } finally {
            setIsLoading(false);
            setItemToDelete({ id: null, name: '' });
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'manager')) {
            message.error("Bạn không có quyền thay đổi trạng thái đơn hàng này.");
            return;
        }

        try {
            setIsLoading(true);
            await importOrderService.updateImportOrderStatus(storeId, orderId, { status: newStatus });
            message.success('Cập nhật trạng thái thành công');
            // Fetch lại dữ liệu
            const paramsForFetch = { searchTerm, filterStatus, filterSupplier, filterDateFrom, filterDateTo };
            fetchImportOrders(currentPage, paramsForFetch);
        } catch (err) {
            message.error(err.message || 'Lỗi cập nhật trạng thái.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenDetails = (record) => {
        setSelectedImportOrderForDetails(record);
        setIsDetailsModalOpen(true);
    };

    const handleEdit = (record) => {
        setEditingId(record._id);
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

    const renderExpandedRow = (record) => {
        if (!record.items || record.items.length === 0) return null;

        const statusConfig = {
            'pending_approval': { color: '#faad14', label: 'Chờ duyệt' },
            'approved': { color: '#52c41a', label: 'Đã duyệt' },
            'importing': { color: '#1890ff', label: 'Đang nhập hàng' },
            'completed': { color: '#52c41a', label: 'Hoàn thành' },
            'cancelled': { color: '#ff4d4f', label: 'Đã hủy' }
        };

        // Tính toán các giá trị
        const subtotal = record.items.reduce((sum, item) => sum + (item.total || 0), 0);
        const discountAmount = record.discount_type === 'percentage' 
            ? (subtotal * record.discount_value / 100)
            : (record.discount_value || 0);
        const afterDiscount = subtotal - discountAmount;
        const taxAmount = afterDiscount * (record.tax_percentage / 100);

    return (
            <div className={styles.expandedRow}>
                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <Card bordered={false} className={styles.detailsCard}>
                            <Row gutter={[16, 16]}>
                                <Col span={8}>
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>Mã đơn:</span>
                                        <span>{record._id}</span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>Nhà cung cấp:</span>
                                        <span>{record.supplier?.name}</span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>Người tạo:</span>
                                        <span>{record.created_by?.full_name}</span>
                                    </div>
                                </Col>
                                <Col span={8}>
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>Ngày tạo:</span>
                                        <span>{new Date(record.created_at).toLocaleDateString('vi-VN')}</span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>Ngày dự kiến:</span>
                                        <span>{new Date(record.expected_delivery_date).toLocaleDateString('vi-VN')}</span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>Trạng thái:</span>
                                        <Tag color={statusConfig[record.status]?.color}>
                                            {statusConfig[record.status]?.label}
                                        </Tag>
                                    </div>
                                </Col>
                                <Col span={8}>
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>Giảm giá:</span>
                                        <span>
                                            {record.discount_type ? (
                                                <>
                                                    {record.discount_type === 'percentage' 
                                                        ? `${record.discount_value}%` 
                                                        : `${record.discount_value?.toLocaleString('vi-VN')} VNĐ`
                                                    }
                                                    {` (-${discountAmount?.toLocaleString('vi-VN')} VNĐ)`}
                                                </>
                                            ) : 'Không có'}
                                        </span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>Thuế:</span>
                                        <span>
                                            {record.tax_percentage}% 
                                            {` (${taxAmount?.toLocaleString('vi-VN')} VNĐ)`}
                                        </span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>Ghi chú:</span>
                                        <span>{record.notes || 'Không có'}</span>
                                    </div>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                    <Col span={24}>
                        <Table
                            dataSource={record.items}
                            pagination={false}
                            className={styles.detailsTable}
                            columns={[
                                {
                                    title: 'Sản phẩm',
                                    dataIndex: ['product'],
                                    key: 'product',
                                    render: (product, item) => {
                                        if (item.productType === 'Book') {
                                            return (
                                                <div>
                                                    <div>{product?.title}</div>
                                                    <div className={styles.productMeta}>
                                                        Tồn kho: {product?.stock_quantity || 0}
                                                    </div>
                                                </div>
                                            );
                                        } else {
                                            return (
                                                <div>
                                                    <div>{product?.name}</div>
                                                    <div className={styles.productMeta}>
                                                        Tồn kho: {product?.stock || 0}
                                                    </div>
                                                </div>
                                            );
                                        }
                                    }
                                },
                                {
                                    title: 'Loại',
                                    dataIndex: 'productType',
                                    key: 'productType',
                                    render: (type) => type === 'Book' ? 'Sách' : 'Văn phòng phẩm'
                                },
                                {
                                    title: 'Số lượng',
                                    dataIndex: 'quantity',
                                    key: 'quantity',
                                    align: 'right'
                                },
                                {
                                    title: 'Đơn giá',
                                    dataIndex: 'price',
                                    key: 'price',
                                    align: 'right',
                                    render: (price) => `${price?.toLocaleString('vi-VN')} VNĐ`
                                },
                                {
                                    title: 'Thành tiền',
                                    dataIndex: 'total',
                                    key: 'total',
                                    align: 'right',
                                    render: (total) => `${total?.toLocaleString('vi-VN')} VNĐ`
                                }
                            ]}
                            summary={() => (
                                <Table.Summary>
                                    <Table.Summary.Row>
                                        <Table.Summary.Cell colSpan={4} className={styles.summaryLabel}>
                                            Tổng tiền hàng:
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell align="right">
                                            {subtotal?.toLocaleString('vi-VN')} VNĐ
                                        </Table.Summary.Cell>
                                    </Table.Summary.Row>
                                    {record.discount_type && (
                                        <Table.Summary.Row>
                                            <Table.Summary.Cell colSpan={4} className={styles.summaryLabel}>
                                                Giảm giá ({record.discount_type === 'percentage' ? `${record.discount_value}%` : 'cố định'}):
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell align="right">
                                                -{discountAmount?.toLocaleString('vi-VN')} VNĐ
                                            </Table.Summary.Cell>
                                        </Table.Summary.Row>
                                    )}
                                    <Table.Summary.Row>
                                        <Table.Summary.Cell colSpan={4} className={styles.summaryLabel}>
                                            Thuế ({record.tax_percentage}%):
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell align="right">
                                            {taxAmount?.toLocaleString('vi-VN')} VNĐ
                                        </Table.Summary.Cell>
                                    </Table.Summary.Row>
                                    <Table.Summary.Row className={styles.totalRow}>
                                        <Table.Summary.Cell colSpan={4} className={styles.totalLabel}>
                                            Tổng cộng:
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell align="right" className={styles.totalAmount}>
                                            {record.total_amount?.toLocaleString('vi-VN')} VNĐ
                                        </Table.Summary.Cell>
                                    </Table.Summary.Row>
                                </Table.Summary>
                            )}
                        />
                    </Col>
                </Row>
            </div>
        );
    };

    const ImportOrderForm = ({ onSubmit, initialValues }) => {
        const [form] = Form.useForm();
        const [suppliers, setSuppliers] = useState([]);
        const [products, setProducts] = useState([]);
        const [selectedProductType, setSelectedProductType] = useState(null);
        const [loading, setLoading] = useState(false);
        const [orderSummary, setOrderSummary] = useState({
            subtotal: 0,
            discount: 0,
            tax: 0,
            total: 0
        });
        const { storeId } = useParams();

        useEffect(() => {
            fetchSuppliers();
        }, [storeId]);

        // Tính toán lại tổng tiền khi form thay đổi
        const calculateOrderSummary = (values) => {
            // Kiểm tra và khởi tạo items nếu chưa có
            const items = values?.items || [];
            
            const subtotal = items.reduce((sum, item) => {
                if (!item || !item.quantity || !item.price) return sum;
                return sum + (item.quantity * item.price);
            }, 0);

            let discount = 0;
            if (values?.discount_type === 'percentage' && values?.discount_value) {
                discount = subtotal * (values.discount_value / 100);
            } else if (values?.discount_type === 'fixed' && values?.discount_value) {
                discount = values.discount_value;
            }

            const afterDiscount = subtotal - discount;
            const tax = afterDiscount * ((values?.tax_percentage || 0) / 100);
            const total = afterDiscount + tax;

            setOrderSummary({
                subtotal,
                discount,
                tax,
                total
            });
        };

        const fetchSuppliers = async () => {
            try {
                const suppliersData = await importOrderService.getSuppliersForForm(storeId);
                setSuppliers(suppliersData);
            } catch (error) {
                message.error('Failed to fetch suppliers');
            }
        };

        const fetchProducts = async (productType) => {
            try {
                setLoading(true);
                const productsData = await importOrderService.getProductsForForm(storeId, productType);
                setProducts(productsData);
            } catch (error) {
                message.error('Failed to fetch products');
            } finally {
                setLoading(false);
            }
        };

        const handleProductTypeChange = (value) => {
            setSelectedProductType(value);
            setProducts([]);
            if (value) {
                fetchProducts(value);
            }
        };

        const handleProductSelect = (value, option, formItem) => {
            const selectedProduct = products.find(p => p.value === value);
            if (selectedProduct) {
                form.setFieldsValue({
                    items: form.getFieldValue('items').map((item, index) => {
                        if (index === formItem.name) {
                            return {
                                ...item,
                                price: selectedProduct.price,
                                quantity: 1
                            };
                        }
                        return item;
                    })
                });
            }
        };

        const handleSubmit = async (values) => {
            try {
                await onSubmit(values);
                // Form sẽ tự động đóng khi onSubmit thành công
            } catch (error) {
                // Giữ nguyên dữ liệu form khi có lỗi
                console.error('Form submission error:', error);
            }
        };

        return (
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    items: [],
                    tax_percentage: 10,
                    ...initialValues
                }}
                onValuesChange={(changedValues, allValues) => {
                    calculateOrderSummary(allValues);
                }}
            >
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="supplier"
                            label="Nhà cung cấp"
                            rules={[{ required: true, message: 'Vui lòng chọn nhà cung cấp' }]}
                        >
                            <Select
                                placeholder="Chọn nhà cung cấp"
                                options={suppliers}
                                showSearch
                                optionFilterProp="label"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="expected_delivery_date"
                            label="Ngày dự kiến nhận hàng"
                            rules={[{ required: true, message: 'Vui lòng chọn ngày dự kiến' }]}
                        >
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.List name="items">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Card key={key} style={{ marginBottom: 16 }}>
                                    <Row gutter={16}>
                                        <Col span={24}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'productType']}
                                                label="Loại sản phẩm"
                                                rules={[{ required: true, message: 'Vui lòng chọn loại sản phẩm' }]}
                                            >
                                                <Select
                                                    placeholder="Chọn loại sản phẩm"
                                                    onChange={handleProductTypeChange}
                                                    options={[
                                                        { value: 'Book', label: 'Sách' },
                                                        { value: 'Stationery', label: 'Văn phòng phẩm' }
                                                    ]}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={24}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'product']}
                                                label="Sản phẩm"
                                                rules={[{ required: true, message: 'Vui lòng chọn sản phẩm' }]}
                                            >
                                                <Select
                                                    placeholder="Chọn sản phẩm"
                                                    options={products}
                                                    loading={loading}
                                                    showSearch
                                                    optionFilterProp="label"
                                                    onChange={(value, option) => handleProductSelect(value, option, { name })}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'quantity']}
                                                label="Số lượng"
                                                rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
                                            >
                                                <InputNumber min={1} style={{ width: '100%' }} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'price']}
                                                label="Đơn giá"
                                                rules={[{ required: true, message: 'Vui lòng nhập đơn giá' }]}
                                            >
                                                <InputNumber
                                                    min={0}
                                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                                    style={{ width: '100%' }}
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Button type="link" danger onClick={() => remove(name)}>
                                        Xóa sản phẩm
                                    </Button>
                                </Card>
                            ))}
                            <Form.Item>
                                <Button type="dashed" onClick={() => add()} block>
                                    Thêm sản phẩm
                                </Button>
                            </Form.Item>
                        </>
                    )}
                </Form.List>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                            name="discount_type"
                            label="Loại giảm giá"
                        >
                            <Select
                                placeholder="Chọn loại giảm giá"
                                options={[
                                    { value: 'percentage', label: 'Phần trăm' },
                                    { value: 'fixed', label: 'Số tiền cố định' }
                                ]}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="discount_value"
                            label="Giá trị giảm giá"
                        >
                            <InputNumber
                                min={0}
                                style={{ width: '100%' }}
                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="tax_percentage"
                            label="Thuế (%)"
                            initialValue={10}
                        >
                            <InputNumber
                                min={0}
                                max={100}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Card title="Tổng kết đơn hàng" style={{ marginBottom: 16 }}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <p>Tổng tiền hàng: {orderSummary.subtotal.toLocaleString('vi-VN')} VNĐ</p>
                            <p>Giảm giá: {orderSummary.discount.toLocaleString('vi-VN')} VNĐ</p>
                            <p>Thuế: {orderSummary.tax.toLocaleString('vi-VN')} VNĐ</p>
                        </Col>
                        <Col span={12}>
                            <p style={{ fontSize: '18px', fontWeight: 'bold' }}>
                                Tổng cộng: {orderSummary.total.toLocaleString('vi-VN')} VNĐ
                            </p>
                        </Col>
                    </Row>
                </Card>

                <Form.Item
                    name="notes"
                    label="Ghi chú"
                >
                    <Input.TextArea rows={4} />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Tạo đơn nhập hàng
                    </Button>
                </Form.Item>
            </Form>
        );
    };

    // --- JSX ---
    return (
        <div className={styles.container}>
            <Row gutter={[16, 16]} className={styles.statsRow}>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Tổng đơn nhập"
                            value={totalItems}
                            prefix={<ContainerOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Tổng giá trị"
                            value={importOrders.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0)}
                            prefix={<DollarOutlined />}
                            formatter={(value) => `${value.toLocaleString('vi-VN')} VNĐ`}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Đơn chờ duyệt"
                            value={importOrders.filter(order => order.status === 'pending_approval').length}
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
                                    placeholder="Tìm kiếm theo mã đơn, nhà cung cấp..."
                                    prefix={<SearchOutlined />}
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        debouncedSearch(e.target.value);
                                    }}
                                    className={styles.searchInput}
                                />
                            </Col>
                            <Col xs={24} sm={8} md={12} lg={16} style={{ textAlign: 'right' }}>
                                <Space>
                        <Button
                                        icon={showAdvancedFilters ? <FaChevronUp /> : <FaChevronDown />}
                            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        >
                                        Bộ lọc nâng cao
                        </Button>
                                    {!isAdminView && (
                                        <Button
                                            type="primary"
                                            icon={<PlusOutlined />}
                                            onClick={() => openModal('add')}
                                        >
                                            Tạo đơn nhập hàng
                                        </Button>
                                    )}
                                </Space>
                            </Col>
                        </Row>

            {showAdvancedFilters && (
                            <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
                                <Col xs={24} sm={12} md={6} lg={6}>
                                    <Form.Item label="Trạng thái" style={{ marginBottom: '0px' }}>
                                        <Select
                                            value={filterStatus}
                                            onChange={(value) => handleFilterChange('status', value)}
                                            placeholder="Chọn trạng thái"
                                            allowClear
                                            style={{ width: '100%' }}
                                            options={importOrderStatusOptions}
                                            className={styles.filterSelect}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} md={6} lg={6}>
                                    <Form.Item label="Nhà cung cấp" style={{ marginBottom: '0px' }}>
                                        <Select
                                            value={filterSupplier}
                                            onChange={(value) => handleFilterChange('supplierId', value)}
                                            placeholder="Chọn nhà cung cấp"
                                            allowClear
                                            showSearch
                                            optionFilterProp="label"
                                            filterOption={(input, option) =>
                                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                            }
                                            style={{ width: '100%' }}
                                            className={styles.filterSelect}
                                            options={supplierOptions}
                                            dropdownRender={(menu) => (
                                                <div>
                                                    {menu}
                                                    {supplierOptions.length === 0 && (
                                                        <div style={{ padding: '8px', color: '#999' }}>
                                                            Không có nhà cung cấp
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} md={6} lg={6}>
                                    <Form.Item label="Khoảng thời gian tạo" style={{ marginBottom: '0px' }}>
                                        <RangePicker
                                            value={[filterDateFrom ? moment(filterDateFrom) : null, filterDateTo ? moment(filterDateTo) : null]}
                                            onChange={(dates) => {
                                                handleFilterChange('dateFrom', dates?.[0]?.format('YYYY-MM-DD'));
                                                handleFilterChange('dateTo', dates?.[1]?.format('YYYY-MM-DD'));
                                            }}
                                            style={{ width: '100%' }}
                                            className={styles.filterDatePicker}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} md={6} lg={6}>
                                    <Form.Item label="Tổng tiền (VNĐ)" style={{ marginBottom: '0px' }}>
                                        <Space.Compact style={{ width: '100%' }}>
                                            <InputNumber
                                                placeholder="Từ"
                                                value={filterMinAmount}
                                                onChange={(value) => {
                                                    setFilterMinAmount(value);
                                                    debouncedAmountChange('minAmount', value);
                                                }}
                                                style={{ width: '50%' }}
                                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                                min={0}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        const value = e.target.value.replace(/\$\s?|(,*)/g, '');
                                                        debouncedAmountChange('minAmount', value);
                                                    }
                                                }}
                                            />
                                            <InputNumber
                                                placeholder="Đến"
                                                value={filterMaxAmount}
                                                onChange={(value) => {
                                                    setFilterMaxAmount(value);
                                                    debouncedAmountChange('maxAmount', value);
                                                }}
                                                style={{ width: '50%' }}
                                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                                min={0}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        const value = e.target.value.replace(/\$\s?|(,*)/g, '');
                                                        debouncedAmountChange('maxAmount', value);
                                                    }
                                                }}
                                            />
                                        </Space.Compact>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} md={6} lg={6} style={{ display: 'flex', alignItems: 'flex-end', marginBottom: '24px' }}>
                                    <Button onClick={resetAdvancedFilters}>
                                        Đặt lại bộ lọc
                                    </Button>
                                </Col>
                            </Row>
                    )}
                    </Space>
                </div>

            <div className={styles.tableSection}>
                <Table
                    columns={columns}
                    dataSource={importOrders}
                    rowKey="_id"
                    pagination={{
                        current: currentPage,
                        total: totalItems,
                        pageSize: itemsPerPage,
                        onChange: handlePageChange,
                        showSizeChanger: false
                    }}
                    expandable={{
                        expandedRowRender: renderExpandedRow,
                        expandedRowKeys: expandedOrderId ? [expandedOrderId] : [],
                        onExpand: (expanded, record) => {
                            setExpandedOrderId(expanded ? record._id : null);
                        }
                    }}
                    onChange={handleTableChange}
                    className={styles.table}
                    loading={isLoading}
                    scroll={{ x: 1200 }}
                />
                </div>
            </Card>

            <Modal
                title={importModalMode === 'add' ? 'Thêm Đơn Hàng' : 'Sửa Đơn Hàng'}
                open={modalVisible}
                onOk={handleModalOk}
                onCancel={closeModal}
                footer={null}
                width={800}
            >
                <ImportOrderForm
                    onSubmit={handleSubmitImportOrder}
                    initialValues={currentImportOrder}
                />
            </Modal>
            {selectedImportOrderForDetails && (
                <Modal
                    title="Chi tiết đơn nhập hàng"
                    open={isDetailsModalOpen}
                    onCancel={() => setIsDetailsModalOpen(false)}
                    footer={null}
                    width={800}
                >
                    <div>
                        <h3>Thông tin chung</h3>
                        <Row gutter={16}>
                            <Col span={12}>
                                <p><strong>Mã đơn hàng:</strong> {selectedImportOrderForDetails._id}</p>
                                <p><strong>Nhà cung cấp:</strong> {selectedImportOrderForDetails.supplier?.name}</p>
                                <p><strong>Người tạo:</strong> {selectedImportOrderForDetails.created_by?.full_name}</p>
                                <p><strong>Ngày tạo:</strong> {new Date(selectedImportOrderForDetails.created_at).toLocaleDateString('vi-VN')}</p>
                            </Col>
                            <Col span={12}>
                                <p><strong>Trạng thái:</strong> {
                                    {
                                        'pending_approval': 'Chờ duyệt',
                                        'approved': 'Đã duyệt',
                                        'importing': 'Đang nhập hàng',
                                        'completed': 'Hoàn thành',
                                        'cancelled': 'Đã hủy'
                                    }[selectedImportOrderForDetails.status] || selectedImportOrderForDetails.status
                                }</p>
                                <p><strong>Ngày dự kiến nhận hàng:</strong> {new Date(selectedImportOrderForDetails.expected_delivery_date).toLocaleDateString('vi-VN')}</p>
                                <p><strong>Ghi chú:</strong> {selectedImportOrderForDetails.notes || 'Không có'}</p>
                            </Col>
                        </Row>

                        <h3>Danh sách sản phẩm</h3>
                        {renderExpandedRow(selectedImportOrderForDetails)}

                        <h3>Thông tin thanh toán</h3>
                        <Row gutter={16}>
                            <Col span={12}>
                                <p><strong>Loại giảm giá:</strong> {
                                    selectedImportOrderForDetails.discount_type === 'percentage' ? 'Phần trăm' : 
                                    selectedImportOrderForDetails.discount_type === 'fixed' ? 'Số tiền cố định' : 'Không có'
                                }</p>
                                <p><strong>Giá trị giảm giá:</strong> {
                                    selectedImportOrderForDetails.discount_value ? 
                                    selectedImportOrderForDetails.discount_value.toLocaleString('vi-VN') + 
                                    (selectedImportOrderForDetails.discount_type === 'percentage' ? '%' : ' VNĐ') : 
                                    '0'
                                }</p>
                            </Col>
                            <Col span={12}>
                                <p><strong>Thuế:</strong> {selectedImportOrderForDetails.tax_percentage}%</p>
                                <p><strong>Tổng tiền:</strong> {selectedImportOrderForDetails.total_amount.toLocaleString('vi-VN')} VNĐ</p>
                            </Col>
                        </Row>
                    </div>
                </Modal>
            )}
            <ConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Xác nhận Hủy Đơn Nhập Hàng"
                message={`Bạn có chắc chắn muốn hủy đơn nhập hàng "${itemToDelete.name}" không?`}
            />
        </div>
    );
};

export default GeneralImportOrderPage;