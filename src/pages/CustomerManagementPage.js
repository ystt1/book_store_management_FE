// src/pages/CustomerManagementPage.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import styles from './CustomerManagementPage.module.css';
import CustomerTable from '../components/Customers/CustomerTable';
import CustomerModal from '../components/Customers/CustomerModal';
import PurchaseHistoryModal from '../components/Customers/PurchaseHistoryModal';
import ConfirmModal from '../components/Common/ConfirmModal';
import customerService from '../services/customerService';
import { FaPlus, FaSearch, FaFilter, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { 
    Table, Button, Input, Space, Modal, Form,
    message, Tag, Row, Col, Card, Statistic, 
    Divider, Typography
} from 'antd';
import { 
    UserOutlined, ShoppingOutlined, 
    DollarOutlined, PlusOutlined
} from '@ant-design/icons';

const { Title } = Typography;

const initialCustomerForm = {
    id: '', full_name: '', phone: '', email: '', address: '', note: '',
};

const CustomerManagementPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const [customers, setCustomers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
    const [pageSize, setPageSize] = useState(parseInt(searchParams.get('limit')) || 10);
    const [total, setTotal] = useState(0);

    // Search and Filters
    const [searchTerm, setSearchTerm] = useState(searchParams.get('searchTerm') || '');
    const [isFilterVisible, setIsFilterVisible] = useState(false);

    // Statistics
    const [statistics, setStatistics] = useState({
        totalCustomers: 0,
        totalOrders: 0,
        totalRevenue: 0
    });

    // Modals
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [customerModalMode, setCustomerModalMode] = useState('add');
    const [currentCustomer, setCurrentCustomer] = useState(null);

    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [purchaseHistory, setPurchaseHistory] = useState([]);
    const [historyCurrentPage, setHistoryCurrentPage] = useState(1);
    const [historyTotalPages, setHistoryTotalPages] = useState(0);
    const historyItemsPerPage = 5;

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState({ id: null, name: '' });

    const fetchCustomers = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const params = {
                page: currentPage,
                limit: pageSize,
                sortBy: searchParams.get('sortBy') || 'full_name',
                sortOrder: searchParams.get('sortOrder') || 'asc',
                searchTerm: searchParams.get('searchTerm') || ''
            };

            // Remove empty params
            Object.keys(params).forEach(key => 
                (params[key] === undefined || params[key] === '') && delete params[key]
            );

            const data = await customerService.getAllCustomers(params);
            setCustomers(data.customers || []);
            setTotal(data.totalCustomers || 0);
            setCurrentPage(data.currentPage || currentPage);

            // Update statistics
            setStatistics({
                totalCustomers: data.totalCustomers || 0,
                totalOrders: data.totalOrders || 0,
                totalRevenue: data.totalRevenue || 0
            });

        } catch (err) {
            setError(err.message || 'Không thể tải danh sách khách hàng.');
            setCustomers([]);
            setTotal(0);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, pageSize, searchParams]);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    const handlePageChange = (page, pageSize) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('page', page.toString());
        newParams.set('limit', pageSize.toString());
        setSearchParams(newParams);
        setCurrentPage(page);
        setPageSize(pageSize);
    };

    const handleSearchChange = (e) => {
        const newSearchTerm = e.target.value;
        const newParams = new URLSearchParams(searchParams);
        if (newSearchTerm) newParams.set('searchTerm', newSearchTerm);
        else newParams.delete('searchTerm');
        newParams.set('page', '1');
        setSearchParams(newParams);
    };

    const openCustomerModal = (mode, customer = null) => {
        setCustomerModalMode(mode);
        setCurrentCustomer(customer);
        setIsCustomerModalOpen(true);
    };

    const closeCustomerModal = () => {
        setIsCustomerModalOpen(false);
        setCurrentCustomer(null);
    };

    const handleSubmitCustomer = async (formData) => {
        setIsLoading(true);
        try {
            if (customerModalMode === 'add') {
                await customerService.createCustomer(formData);
                message.success('Thêm khách hàng thành công!');
            } else {
                await customerService.updateCustomer(currentCustomer._id || currentCustomer.id, formData);
                message.success('Cập nhật khách hàng thành công!');
            }
            closeCustomerModal();
            fetchCustomers();
        } catch (err) {
            message.error(err.message || 'Lỗi xử lý thông tin khách hàng.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteClick = (customerId, customerName) => {
        setItemToDelete({ id: customerId, name: customerName });
        setIsConfirmModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete.id) return;
        setIsLoading(true);
        try {
            await customerService.deleteCustomer(itemToDelete.id);
            message.success(`Xóa khách hàng "${itemToDelete.name}" thành công!`);
            setIsConfirmModalOpen(false);
            
            let pageToFetch = currentPage;
            if (customers.length === 1 && currentPage > 1 && (total - 1) < ((currentPage - 1) * pageSize) + 1) {
                pageToFetch = currentPage - 1;
            }
            
            const newParams = new URLSearchParams();
            if (searchTerm) newParams.set('searchTerm', searchTerm);
            newParams.set('page', pageToFetch.toString());
            setSearchParams(newParams);

        } catch (err) {
            message.error(err.message || 'Lỗi khi xóa khách hàng.');
            setIsConfirmModalOpen(false);
        } finally {
            setIsLoading(false);
            setItemToDelete({ id: null, name: '' });
        }
    };

    const fetchPurchaseHistory = async (customerId, page = 1) => {
        setIsLoading(true);
        try {
            const params = { page, limit: historyItemsPerPage, sortBy: 'order_date', sortOrder: 'desc' };
            const data = await customerService.getPurchaseHistory(customerId, params);
            setPurchaseHistory(data.history || []);
            setHistoryCurrentPage(data.currentPage || 1);
            setHistoryTotalPages(data.totalPages || 0);
        } catch (err) {
            message.error(err.message || "Không thể tải lịch sử mua hàng.");
            setPurchaseHistory([]);
        } finally {
            setIsLoading(false);
        }
    };

    const openHistoryModal = (customer) => {
        setCurrentCustomer(customer);
        setHistoryCurrentPage(1);
        fetchPurchaseHistory(customer._id || customer.id, 1);
        setIsHistoryModalOpen(true);
    };

    const handleHistoryPageChange = (page) => {
        if (currentCustomer) {
            fetchPurchaseHistory(currentCustomer._id || currentCustomer.id, page);
        }
    };

    return (
        <div className={styles.pageContainer}>
            <Row gutter={[16, 16]} className={styles.statsRow}>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Tổng số khách hàng"
                            value={statistics.totalCustomers}
                            prefix={<UserOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Tổng đơn hàng"
                            value={statistics.totalOrders}
                            prefix={<ShoppingOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Tổng doanh thu"
                            value={statistics.totalRevenue}
                            prefix={<DollarOutlined />}
                            formatter={(value) => `${value.toLocaleString('vi-VN')} VNĐ`}
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
                                    placeholder="Tìm kiếm khách hàng..."
                                    prefix={<FaSearch />}
                                    value={searchTerm}
                                    onChange={handleSearchChange}
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
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        onClick={() => openCustomerModal('add')}
                                    >
                                        Thêm khách hàng
                                    </Button>
                                </Space>
                            </Col>
                        </Row>

                        {isFilterVisible && (
                            <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
                                {/* Add your filter components here */}
                            </Row>
                        )}
                    </Space>
                </div>

                {isLoading && <div className={styles.loadingOverlay}><div className={styles.loader}></div></div>}
                {error && <div className={styles.errorBanner}>{error}</div>}

                {!isLoading && customers.length > 0 && !error && (
                    <CustomerTable
                        customers={customers}
                        onEdit={openCustomerModal}
                        onDelete={(customerId) => handleDeleteClick(customerId, customers.find(c => c._id === customerId || c.id === customerId)?.full_name)}
                        onViewHistory={openHistoryModal}
                        pagination={{
                            current: currentPage,
                            pageSize: pageSize,
                            total: total,
                            onChange: handlePageChange,
                            showSizeChanger: true,
                            showTotal: (total) => `Tổng ${total} khách hàng`
                        }}
                    />
                )}
                {!isLoading && customers.length === 0 && !error && (
                    <div className={styles.noResultsContainer}>
                        <p className={styles.noResults}>Không có khách hàng nào.</p>
                    </div>
                )}
            </Card>

            <CustomerModal
                isOpen={isCustomerModalOpen}
                onClose={closeCustomerModal}
                onSubmit={handleSubmitCustomer}
                currentCustomer={currentCustomer}
                mode={customerModalMode}
            />

            {currentCustomer && isHistoryModalOpen && (
                <PurchaseHistoryModal
                    isOpen={isHistoryModalOpen}
                    onClose={() => setIsHistoryModalOpen(false)}
                    customerName={currentCustomer.full_name}
                    history={purchaseHistory}
                    currentPage={historyCurrentPage}
                    totalPages={historyTotalPages}
                    onPageChange={handleHistoryPageChange}
                />
            )}

            <ConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Xác nhận xóa Khách Hàng"
                message={`Bạn có chắc chắn muốn xóa khách hàng "${itemToDelete.name}" không?`}
            />
        </div>
    );
};

export default CustomerManagementPage;