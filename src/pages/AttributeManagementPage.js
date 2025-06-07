// src/pages/AttributeManagementPage.js
import React, { useState, useEffect, useCallback } from 'react';
import styles from './AttributeManagementPage.module.css';
import AttributeTable from '../components/Attributes/AttributeTable';
import AttributeModal from '../components/Attributes/AttributeModal';
import ConfirmModal from '../components/Common/ConfirmModal';
import Pagination from '../components/Common/Pagination';
import attributeService from '../services/attributeService';
import { FaPlus, FaSearch } from 'react-icons/fa';
import {
    Tabs, Card, Row, Col, Statistic, Typography, Divider,
    Input, Button, Space
} from 'antd';
import {
    PlusOutlined, SearchOutlined, CarryOutOutlined, TeamOutlined, ContainerOutlined
} from '@ant-design/icons';

const { Title } = Typography;

const AttributeManagementPage = () => {
    const [activeTab, setActiveTab] = useState('suppliers');
    const [suppliers, setSuppliers] = useState({ data: [], total: 0, totalPages: 0 });
    const [publishers, setPublishers] = useState({ data: [], total: 0, totalPages: 0 });
    const [categories, setCategories] = useState({ data: [], total: 0, totalPages: 0 });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [currentData, setCurrentData] = useState(null);
    const [currentAttributeType, setCurrentAttributeType] = useState('');
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState({ id: null, type: '', name: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchDataForTab = useCallback(async (tab, page = 1, search = '') => {
        console.log(`Fetching data for tab: ${tab}, page: ${page}, search: ${search}`);
        setIsLoading(true);
        setError(null);

        const params = { 
            page, 
            limit: itemsPerPage, 
            searchTerm: search || undefined, 
            sortBy: 'name',
            sortOrder: 'asc'
        };

        try {
            let result;
            switch (tab) {
                case 'suppliers':
                    result = await attributeService.getAllSuppliers(params);
                    setSuppliers({ 
                        data: result.suppliers || [], 
                        total: result.totalSuppliers || 0, 
                        totalPages: result.totalPages || 0 
                    });
                    break;
                case 'publishers':
                    result = await attributeService.getAllPublishers(params);
                    setPublishers({ 
                        data: result.publishers || [], 
                        total: result.totalPublishers || 0, 
                        totalPages: result.totalPages || 0 
                    });
                    break;
                case 'categories':
                    result = await attributeService.getAllCategories(params);
                    setCategories({ 
                        data: result.categories || [], 
                        total: result.totalCategories || 0, 
                        totalPages: result.totalPages || 0 
                    });
                    break;
                default:
                    console.warn('Invalid tab:', tab);
                    return;
            }
            
            if (result) {
                console.log(`Data fetched for ${tab}:`, result);
                setCurrentPage(result.currentPage || 1);
            }
        } catch (err) {
            console.error(`Error fetching data for ${tab}:`, err);
            setError(err.message || `Không thể tải dữ liệu cho ${tab}.`);
            switch (tab) {
                case 'suppliers':
                    setSuppliers({ data: [], total: 0, totalPages: 0 });
                    break;
                case 'publishers':
                    setPublishers({ data: [], total: 0, totalPages: 0 });
                    break;
                case 'categories':
                    setCategories({ data: [], total: 0, totalPages: 0 });
                    break;
                default:
                    break;
            }
        } finally {
            setIsLoading(false);
        }
    }, [itemsPerPage]);

    useEffect(() => {
        console.log('Tab changed to:', activeTab);
        setCurrentPage(1);
        setSearchTerm('');
        const initialSearchTerm = '';
        const initialPage = 1;
        fetchDataForTab(activeTab, initialPage, initialSearchTerm);

    }, [activeTab, fetchDataForTab]);

    useEffect(() => {
        if (currentPage !== 1 || searchTerm !== '') {
            const handler = setTimeout(() => {
                console.log('Refetching due to page/search change', {currentPage, searchTerm});
                fetchDataForTab(activeTab, currentPage, searchTerm);
            }, 300);

            return () => { clearTimeout(handler); };
        }
    }, [currentPage, searchTerm, fetchDataForTab, activeTab]);

    const getCurrentTabData = () => {
        switch (activeTab) {
            case 'suppliers': return suppliers.data;
            case 'publishers': return publishers.data;
            case 'categories': return categories.data;
            default: return [];
        }
    };

    const getCurrentTabTotalPages = () => {
        switch (activeTab) {
            case 'suppliers': return suppliers.totalPages;
            case 'publishers': return publishers.totalPages;
            case 'categories': return categories.totalPages;
            default: return 0;
        }
    };

    const getCurrentTabTotalItems = () => {
        switch (activeTab) {
            case 'suppliers': return suppliers.total;
            case 'publishers': return publishers.total;
            case 'categories': return categories.total;
            default: return 0;
        }
    };

    const getCurrentTabLabel = () => {
        switch (activeTab) {
            case 'suppliers': return "nhà cung cấp";
            case 'publishers': return "nhà xuất bản";
            case 'categories': return 'danh mục';
            default: return '';
        }
    };

    const getAttributeTypeForModal = () => {
        switch (activeTab) {
            case 'suppliers': return 'supplier';
            case 'publishers': return 'publisher';
            case 'categories': return 'category';
            default: return '';
        }
    };

    const handleOpenModal = (mode, data = null) => {
        setModalMode(mode);
        setCurrentData(data);
        setCurrentAttributeType(getAttributeTypeForModal());
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentData(null);
        setCurrentAttributeType('');
    };

    const handleSubmitAttribute = async (formData) => {
        setIsLoading(true);
        setError(null);
        try {
            let response;
            const dataToSend = { ...formData };

            if (modalMode === 'add') {
                switch (activeTab) {
                    case 'suppliers':
                        response = await attributeService.createSupplier(dataToSend);
                        break;
                    case 'publishers':
                        response = await attributeService.createPublisher(dataToSend);
                        break;
                    case 'categories':
                        response = await attributeService.createCategory(dataToSend);
                        break;
                    default:
                        throw new Error('Loại thuộc tính không hợp lệ');
                }
                if (!response.success) throw new Error(response.message || 'Thêm thất bại.');
                alert(`${getCurrentTabLabel()} đã được thêm thành công!`);
            } else {
                if (!currentData?._id) {
                    throw new Error("Không tìm thấy ID để cập nhật.");
                }
                dataToSend._id = currentData._id;

                switch (activeTab) {
                    case 'suppliers':
                        response = await attributeService.updateSupplier(currentData._id, dataToSend);
                        break;
                    case 'publishers':
                        response = await attributeService.updatePublisher(currentData._id, dataToSend);
                        break;
                    case 'categories':
                        response = await attributeService.updateCategory(currentData._id, dataToSend);
                        break;
                    default:
                        throw new Error('Loại thuộc tính không hợp lệ');
                }
                if (!response.success) throw new Error(response.message || 'Cập nhật thất bại.');
                alert(`${getCurrentTabLabel()} đã được cập nhật thành công!`);
            }

            handleCloseModal();
            fetchDataForTab(activeTab, currentPage, searchTerm);
        } catch (err) {
            console.error("Lỗi khi submit form:", err);
            setError(err.message || `Lỗi khi ${modalMode === 'add' ? 'thêm' : 'cập nhật'} ${getCurrentTabLabel()}.`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteClick = (id, name) => {
        setItemToDelete({ id, type: activeTab.slice(0, -1), name });
        setIsConfirmModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete.id) return;
        
        setIsLoading(true);
        setError(null);
        try {
            let response;
            switch (activeTab) {
                case 'suppliers':
                    response = await attributeService.deleteSupplier(itemToDelete.id);
                    break;
                case 'publishers':
                    response = await attributeService.deletePublisher(itemToDelete.id);
                    break;
                case 'categories':
                    response = await attributeService.deleteCategory(itemToDelete.id);
                    break;
                default:
                    throw new Error('Loại thuộc tính không hợp lệ');
            }

            if (!response.success) throw new Error(response.message || 'Xóa thất bại.');

            alert(`${getCurrentTabLabel()} "${itemToDelete.name}" đã được xóa thành công!`);
            setIsConfirmModalOpen(false);
            fetchDataForTab(activeTab, currentPage, searchTerm);
        } catch (err) {
            console.error("Lỗi khi xóa:", err);
            setError(err.message || `Lỗi khi xóa ${getCurrentTabLabel()}.`);
            setIsConfirmModalOpen(false);
        } finally {
            setIsLoading(false);
            setItemToDelete({ id: null, type: '', name: '' });
        }
    };

    const handleTabChange = (key) => {
        setActiveTab(key);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleSearch = (value) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <Title level={2}>Quản Lý Thuộc Tính</Title>
            </div>

            <Tabs activeKey={activeTab} onChange={handleTabChange} centered>
                <Tabs.TabPane
                    tab={
                        <span>
                            <TeamOutlined />
                            Nhà Cung Cấp ({suppliers.total})
                        </span>
                    }
                    key="suppliers"
                >
                    <Card style={{ marginTop: 20 }}>
                        <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Space>
                                <Input.Search
                                    placeholder="Tìm nhà cung cấp..."
                                    allowClear
                                    onSearch={handleSearch}
                                    style={{ width: 250 }}
                                    value={searchTerm}
                                    prefix={<SearchOutlined />}
                                />
                            </Space>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => handleOpenModal('add')}
                            >
                                Thêm Nhà Cung Cấp Mới
                            </Button>
                        </div>

                        {isLoading && activeTab === 'suppliers' && <div className={styles.loadingOverlay}><div className={styles.loader}></div></div>}
                        {error && activeTab === 'suppliers' && <div className={styles.errorBanner}>{error}</div>}
                        {!isLoading && activeTab === 'suppliers' && suppliers.data.length === 0 && !error && (
                            <div className={styles.noResultsContainer}><p className={styles.noResults}>Không có nhà cung cấp nào.</p></div>
                        )}

                        {!isLoading && activeTab === 'suppliers' && suppliers.data.length > 0 && (
                            <AttributeTable
                                data={suppliers.data}
                                type="supplier"
                                onEdit={handleOpenModal}
                                onDelete={handleDeleteClick}
                            />
                        )}

                        {!isLoading && activeTab === 'suppliers' && suppliers.total > 0 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={suppliers.totalPages}
                                onPageChange={handlePageChange}
                                itemsPerPage={itemsPerPage}
                                totalItems={suppliers.total}
                            />
                        )}
                    </Card>
                </Tabs.TabPane>

                <Tabs.TabPane
                    tab={
                        <span>
                            <CarryOutOutlined />
                            Nhà Xuất Bản ({publishers.total})
                        </span>
                    }
                    key="publishers"
                >
                    <Card style={{ marginTop: 20 }}>
                        <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Space>
                                <Input.Search
                                    placeholder="Tìm nhà xuất bản..."
                                    allowClear
                                    onSearch={handleSearch}
                                    style={{ width: 250 }}
                                    value={searchTerm}
                                    prefix={<SearchOutlined />}
                                />
                            </Space>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => handleOpenModal('add')}
                            >
                                Thêm Nhà Xuất Bản Mới
                            </Button>
                        </div>

                        {isLoading && activeTab === 'publishers' && <div className={styles.loadingOverlay}><div className={styles.loader}></div></div>}
                        {error && activeTab === 'publishers' && <div className={styles.errorBanner}>{error}</div>}
                        {!isLoading && activeTab === 'publishers' && publishers.data.length === 0 && !error && (
                            <div className={styles.noResultsContainer}><p className={styles.noResults}>Không có nhà xuất bản nào.</p></div>
                        )}

                        {!isLoading && activeTab === 'publishers' && publishers.data.length > 0 && (
                            <AttributeTable
                                data={publishers.data}
                                type="publisher"
                                onEdit={handleOpenModal}
                                onDelete={handleDeleteClick}
                            />
                        )}

                        {!isLoading && activeTab === 'publishers' && publishers.total > 0 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={publishers.totalPages}
                                onPageChange={handlePageChange}
                                itemsPerPage={itemsPerPage}
                                totalItems={publishers.total}
                            />
                        )}
                    </Card>
                </Tabs.TabPane>

                <Tabs.TabPane
                    tab={
                        <span>
                            <ContainerOutlined />
                            Danh Mục ({categories.total})
                        </span>
                    }
                    key="categories"
                >
                    <Card style={{ marginTop: 20 }}>
                        <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Space>
                                <Input.Search
                                    placeholder="Tìm danh mục..."
                                    allowClear
                                    onSearch={handleSearch}
                                    style={{ width: 250 }}
                                    value={searchTerm}
                                    prefix={<SearchOutlined />}
                                />
                            </Space>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => handleOpenModal('add')}
                            >
                                Thêm Danh Mục Mới
                            </Button>
                        </div>

                        {isLoading && activeTab === 'categories' && <div className={styles.loadingOverlay}><div className={styles.loader}></div></div>}
                        {error && activeTab === 'categories' && <div className={styles.errorBanner}>{error}</div>}
                        {!isLoading && activeTab === 'categories' && categories.data.length === 0 && !error && (
                            <div className={styles.noResultsContainer}><p className={styles.noResults}>Không có danh mục nào.</p></div>
                        )}

                        {!isLoading && activeTab === 'categories' && categories.data.length > 0 && (
                            <AttributeTable
                                data={categories.data}
                                type="category"
                                onEdit={handleOpenModal}
                                onDelete={handleDeleteClick}
                            />
                        )}

                        {!isLoading && activeTab === 'categories' && categories.total > 0 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={categories.totalPages}
                                onPageChange={handlePageChange}
                                itemsPerPage={itemsPerPage}
                                totalItems={categories.total}
                            />
                        )}
                    </Card>
                </Tabs.TabPane>
            </Tabs>

            <AttributeModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleSubmitAttribute}
                currentData={currentData}
                mode={modalMode}
                attributeType={currentAttributeType}
            />

            <ConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title={`Xác nhận xóa ${itemToDelete.type === 'supplier' ? 'Nhà Cung Cấp' : itemToDelete.type === 'publisher' ? 'Nhà Xuất Bản' : 'Danh Mục'}`}
                message={`Bạn có chắc chắn muốn xóa ${itemToDelete.type} "${itemToDelete.name}" không?`}
            />

            {isLoading && !isModalOpen && !isConfirmModalOpen && <div className={styles.loadingOverlay}><div className={styles.loader}></div></div>}
            {error && !isModalOpen && !isConfirmModalOpen && <div className={styles.errorBanner}>{error}</div>}
        </div>
    );
};

export default AttributeManagementPage;