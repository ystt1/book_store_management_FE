// src/pages/StationeryManagementPage.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import styles from './StationeryManagementPage.module.css';
import StationeryTable from '../components/Stationery/StationeryTable';
import StationeryModal from '../components/Stationery/StationeryModal';
import ConfirmModal from '../components/Common/ConfirmModal';
import stationeryService from '../services/stationeryService';
import StationeryDetailModal from '../components/Stationery/StationeryDetailModal';

import {
    Card, Row, Col, Statistic, Typography, Divider,
    Input, Button, Space, Tooltip, Select, Form,
    InputNumber, message
} from 'antd';

import {
    PlusOutlined, SearchOutlined, FilterOutlined,
    DollarOutlined, TagsOutlined, ContainerOutlined,
    DownOutlined, UpOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const initialStationeryForm = {
    id: '',
    name: '',
    description: '',
    price: '',
    stock: '',
    supplier_id: null,
    image: null,
    imagePreview: ''
};

// Thêm debounce hook
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

const StationeryManagementPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { storeId } = useParams();
    const [form] = Form.useForm();

    const [stationeryItems, setStationeryItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);

    // Filters state
    const [filters, setFilters] = useState({
        searchTerm: searchParams.get('searchTerm') || '',
        supplier: searchParams.get('supplier') ? {
            value: searchParams.get('supplier'),
            label: ''
        } : null,
        minStock: searchParams.get('minStock') || '',
        sortBy: searchParams.get('sortBy') || 'created_at',
        sortOrder: searchParams.get('sortOrder') || 'desc'
    });

    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const debouncedFilters = useDebounce(filters, 500);

    // Dropdown options
    const [supplierOptions, setSupplierOptions] = useState([]);

    // Modals state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [currentStationery, setCurrentStationery] = useState(initialStationeryForm);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [itemIdToDelete, setItemIdToDelete] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedStationery, setSelectedStationery] = useState(null);

    // Statistics state
    const [statistics, setStatistics] = useState({
        totalItems: 0,
        totalValue: 0,
        lowStock: 0
    });

    // Fetch data effect
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const params = {
                    page: currentPage,
                    limit: pageSize,
                    sortBy: debouncedFilters.sortBy,
                    sortOrder: debouncedFilters.sortOrder,
                    ...(debouncedFilters.searchTerm && { searchTerm: debouncedFilters.searchTerm }),
                    ...(debouncedFilters.supplier?.value && { supplier: debouncedFilters.supplier.value }),
                    ...(debouncedFilters.minStock && { minStock: debouncedFilters.minStock })
                };

                // Update URL params
                const currentParams = new URLSearchParams();
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined && value !== null && value !== '') {
                        currentParams.set(key, value.toString());
                    }
                });
                setSearchParams(currentParams, { replace: true });

                const response = await stationeryService.getAllStationeryItems(storeId, params);
                if (response.success && response.data) {
                    setStationeryItems(response.data);
                    setTotal(response.pagination.total);
                    calculateStatistics(response.data);
                }
            } catch (err) {
                console.error("Lỗi khi lấy danh sách VPP:", err);
                message.error(err.message || 'Không thể tải danh sách văn phòng phẩm.');
                setStationeryItems([]);
                setTotal(0);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [debouncedFilters, currentPage, pageSize, storeId, setSearchParams]);

    // Fetch dropdown data effect
    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const suppliersData = await stationeryService.getAllSuppliersForForm(storeId);
                if (suppliersData?.suppliers) {
                    const formattedSuppliers = suppliersData.suppliers.map(s => ({
                        value: s.value || s._id,
                        label: s.label || s.name
                    }));
                    setSupplierOptions(formattedSuppliers);

                    // Initialize supplier filter from URL
                    const supplierFromUrl = searchParams.get('supplier');
                    if (supplierFromUrl) {
                        const supplierOption = formattedSuppliers.find(s => s.value === supplierFromUrl);
                        setFilters(prev => ({ ...prev, supplier: supplierOption }));
                    }
                }
            } catch (err) {
                console.error("Lỗi tải dữ liệu form:", err);
                message.error("Lỗi tải dữ liệu cho bộ lọc.");
            }
        };

        fetchDropdownData();
    }, [storeId, searchParams]);

    // Statistics calculation
    const calculateStatistics = useCallback((items) => {
        const stats = {
            totalItems: total,
            totalValue: items.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * (parseInt(item.stock) || 0), 0),
            lowStock: items.filter(item => (parseInt(item.stock) || 0) < 10).length
        };
        setStatistics(stats);
    }, [total]);

    // Event handlers
    const handleSearch = (value) => {
        setFilters(prev => ({ ...prev, searchTerm: value }));
        setCurrentPage(1);
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
        setCurrentPage(1);
    };

    const resetFilters = () => {
        setFilters({
            searchTerm: '',
            supplier: null,
            minStock: '',
            sortBy: 'created_at',
            sortOrder: 'desc'
        });
        setCurrentPage(1);
        form.resetFields();
    };

    const openModal = (mode, item = null) => {
        setModalMode(mode);
        setCurrentStationery(item || initialStationeryForm);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentStationery(initialStationeryForm);
    };

    const handleSubmit = async (formData) => {
        setIsLoading(true);
        try {
            if (modalMode === 'add') {
                await stationeryService.createStationeryItem(storeId, formData);
                message.success('Thêm văn phòng phẩm thành công!');
            } else {
                await stationeryService.updateStationeryItem(storeId, currentStationery.id, formData);
                message.success('Cập nhật văn phòng phẩm thành công!');
            }
            closeModal();
            // Refresh data
            const currentFilters = { ...filters };
            setFilters(currentFilters);
        } catch (err) {
            message.error(err.message || 'Có lỗi xảy ra khi xử lý yêu cầu.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = (itemId) => {
        setItemIdToDelete(itemId);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        setIsLoading(true);
        try {
            await stationeryService.deleteStationeryItem(storeId, itemIdToDelete);
            message.success('Xóa văn phòng phẩm thành công!');
            setIsConfirmModalOpen(false);
            // Refresh data
            const currentFilters = { ...filters };
            setFilters(currentFilters);
        } catch (err) {
            message.error(err.message || 'Có lỗi xảy ra khi xóa văn phòng phẩm.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePageChange = (page, pageSize) => {
        setCurrentPage(page);
        setPageSize(pageSize);
        const newParams = new URLSearchParams(searchParams);
        newParams.set('page', page.toString());
        newParams.set('limit', pageSize.toString());
        setSearchParams(newParams);
    };

    const handleViewDetails = (item) => {
        setSelectedStationery(item);
        setIsDetailModalOpen(true);
    };

    const closeDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedStationery(null);
    };

    return (
        <div className={styles.pageContainer}>
            <Row gutter={[16, 16]} className={styles.statsSection}>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Tổng số VPP"
                            value={statistics.totalItems}
                            prefix={<ContainerOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Tổng giá trị"
                            value={statistics.totalValue}
                            prefix={<DollarOutlined />}
                            formatter={(value) => new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                            }).format(value)}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Sắp hết hàng"
                            value={statistics.lowStock}
                            prefix={<TagsOutlined />}
                            valueStyle={{ color: statistics.lowStock > 0 ? '#cf1322' : '#3f8600' }}
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
                                    placeholder="Tìm kiếm văn phòng phẩm..."
                                    prefix={<SearchOutlined />}
                                    value={filters.searchTerm}
                                    onChange={e => handleFilterChange('searchTerm', e.target.value)}
                                    style={{ width: '100%' }}
                                />
                            </Col>
                            <Col xs={24} sm={8} md={12} lg={16} style={{ textAlign: 'right' }}>
                                <Space>
                                    <Button
                                        icon={showAdvancedFilters ? <UpOutlined /> : <DownOutlined />}
                                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                    >
                                        Bộ lọc nâng cao
                                    </Button>
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        onClick={() => openModal('add')}
                                    >
                                        Thêm VPP mới
                                    </Button>
                                </Space>
                            </Col>
                        </Row>

                        {showAdvancedFilters && (
                            <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
                                <Col xs={24} sm={12} md={8} lg={6}>
                                    <Form.Item label="Nhà cung cấp">
                                        <Select
                                            value={filters.supplier}
                                            onChange={value => handleFilterChange('supplier', value)}
                                            options={supplierOptions}
                                            placeholder="Chọn nhà cung cấp"
                                            allowClear
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} md={8} lg={6}>
                                    <Form.Item label="Tồn kho tối thiểu">
                                        <InputNumber
                                            value={filters.minStock}
                                            onChange={value => handleFilterChange('minStock', value)}
                                            min={0}
                                            placeholder="Nhập số lượng"
                                            style={{ width: '100%' }}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} md={8} lg={6}>
                                    <Form.Item label=" " className={styles.filterActions}>
                                        <Button onClick={resetFilters}>Đặt lại bộ lọc</Button>
                                    </Form.Item>
                                </Col>
                            </Row>
                        )}
                    </Space>
                </div>

                <StationeryTable
                    stationeryItems={stationeryItems}
                    onEdit={openModal}
                    onDelete={handleDelete}
                    onViewDetails={handleViewDetails}
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
            </Card>

            {/* Modals */}
            <StationeryModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSubmit={handleSubmit}
                mode={modalMode}
                stationeryData={currentStationery}
                isLoading={isLoading}
            />

            <ConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Xác nhận xóa"
                message="Bạn có chắc chắn muốn xóa văn phòng phẩm này?"
            />

            {/* New Detail Modal */}
            <StationeryDetailModal
                isOpen={isDetailModalOpen}
                onClose={closeDetailModal}
                stationeryData={selectedStationery}
            />
        </div>
    );
};

export default StationeryManagementPage;