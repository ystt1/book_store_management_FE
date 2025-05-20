// src/pages/AttributeManagementPage.js
import React, { useState, useEffect } from 'react';
import styles from './AttributeManagementPage.module.css';
import AttributeTable from '../components/Attributes/AttributeTable';
import AttributeModal from '../components/Attributes/AttributeModal';
import ConfirmModal from '../components/Common/ConfirmModal';
import { FaPlus,FaSearch } from 'react-icons/fa';

// Dữ liệu mẫu (sau này sẽ là API calls)
const initialSuppliers = [
    { id: 'S001', name: 'Nhà Cung Cấp Alpha', bookCount: 15, totalSold: 120, totalStock: 300 },
    { id: 'S002', name: 'Nhà Cung Cấp Beta', bookCount: 25, totalSold: 200, totalStock: 450 },
];
const initialPublishers = [
    { id: 'P001', name: 'NXB Trẻ', bookCount: 50, totalSold: 450, totalStock: 800 },
    { id: 'P002', name: 'NXB Kim Đồng', bookCount: 35, totalSold: 300, totalStock: 600 },
];
const initialCategories = [
    { id: 'C001', name: 'Tiểu thuyết', description: 'Các tác phẩm văn học hư cấu.', bookCount: 100, totalSold: 800, totalStock: 1500 },
    { id: 'C002', name: 'Khoa học - Kỹ thuật', description: 'Sách về khoa học và công nghệ.', bookCount: 70, totalSold: 500, totalStock: 1000 },
];


const AttributeManagementPage = () => {
    const [activeTab, setActiveTab] = useState('suppliers'); // 'suppliers', 'publishers', 'categories'
    const [suppliers, setSuppliers] = useState(initialSuppliers);
    const [publishers, setPublishers] = useState(initialPublishers);
    const [categories, setCategories] = useState(initialCategories);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [currentData, setCurrentData] = useState(null); // Dữ liệu cho modal sửa
    const [currentAttributeType, setCurrentAttributeType] = useState(''); // Loại thuộc tính cho modal
const [searchTerm, setSearchTerm] = useState(''); 
const [currentPage, setCurrentPage] = useState(1);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState({ id: null, type: '' });

    // Hàm lấy dữ liệu hiển thị cho tab hiện tại
    const getCurrentTabData = () => {
        switch (activeTab) {
            case 'suppliers': return suppliers;
            case 'publishers': return publishers;
            case 'categories': return categories;
            default: return [];
        }
    };
     const getCurrentTabLabel = () => {
        switch (activeTab) {
            case 'suppliers': return 'Nhà Cung Cấp';
            case 'publishers': return 'Nhà Xuất Bản';
            case 'categories': return 'Danh Mục Sách';
            default: return '';
        }
    };


    const handleOpenModal = (mode, data = null, type) => {
        setModalMode(mode);
        setCurrentData(data);
        setCurrentAttributeType(type);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentData(null);
        setCurrentAttributeType('');
    };

    const handleSubmitAttribute = (formData, attributeType) => {
        // TODO: Gọi API để thêm/sửa
        console.log(`Submitting ${attributeType}`, formData);
        const updateState = (setter, items) => {
            if (modalMode === 'add') {
                const newItem = { ...formData, id: `${attributeType.charAt(0).toUpperCase()}${Date.now().toString().slice(-3)}`, bookCount: 0 }; // Tạo ID tạm
                setter([newItem, ...items]);
            } else {
                setter(items.map(item => item.id === formData.id ? { ...item, ...formData } : item));
            }
        };

        switch (attributeType) {
            case 'supplier': updateState(setSuppliers, suppliers); break;
            case 'publisher': updateState(setPublishers, publishers); break;
            case 'category': updateState(setCategories, categories); break;
            default: break;
        }
        handleCloseModal(); // Đóng modal sau khi submit
    };


    const handleDeleteClick = (id, type) => {
        setItemToDelete({ id, type });
        setIsConfirmModalOpen(true);
    };

    const handleConfirmDelete = () => {
        // TODO: Gọi API để xóa
        console.log(`Deleting ${itemToDelete.type} with ID: ${itemToDelete.id}`);
        const updateStateAfterDelete = (setter, items) => {
            setter(items.filter(item => item.id !== itemToDelete.id));
        };

        switch (itemToDelete.type) {
            case 'supplier': updateStateAfterDelete(setSuppliers, suppliers); break;
            case 'publisher': updateStateAfterDelete(setPublishers, publishers); break;
            case 'category': updateStateAfterDelete(setCategories, categories); break;
            default: break;
        }
        setIsConfirmModalOpen(false);
        setItemToDelete({ id: null, type: '' });
    };


    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <h1>Quản Lý Thuộc Tính Sách</h1>
                {/* Có thể thêm nút chung ở đây nếu cần */}
            </div>


            <div className={styles.tabContainer}>
                <button
                    className={`${styles.tabButton} ${activeTab === 'suppliers' ? styles.active : ''}`}
                    onClick={() => setActiveTab('suppliers')}
                >
                    Nhà Cung Cấp
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'publishers' ? styles.active : ''}`}
                    onClick={() => setActiveTab('publishers')}
                >
                    Nhà Xuất Bản
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'categories' ? styles.active : ''}`}
                    onClick={() => setActiveTab('categories')}
                >
                    Danh Mục Sách
                </button>
            </div>

            <div className={styles.tabContent}>
                <div className={styles.contentHeader}>
                    <h2>Danh sách {getCurrentTabLabel()}</h2>


                    
                    <div className={styles.headerActions}> {/* Wrapper cho tìm kiếm và nút thêm */}
                        <div className={styles.searchWrapper}> {/* <<< Ô TÌM KIẾM */}
                            <FaSearch className={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder={`Tìm ${getCurrentTabLabel().toLowerCase()}...`}
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1);}}
                                className={styles.searchInput}
                            />
                        </div>
                        <button
                            className={`${styles.btn} ${styles.btnPrimary}`}
                            onClick={() => handleOpenModal('add', null, activeTab.slice(0, -1))}
                        >
                            <FaPlus /> Thêm Mới
                        </button>
                    </div>
                </div>

                <AttributeTable
                    data={getCurrentTabData()}
                    attributeType={activeTab.slice(0, -1)} // Chuyển 'suppliers' thành 'supplier'
                    onEdit={handleOpenModal} // Sửa lại: onEdit giờ sẽ là handleOpenModal
                    onDelete={handleDeleteClick}
                />
            </div>

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
                title={`Xác nhận xóa ${currentAttributeType === 'category' ? 'Danh Mục' : (currentAttributeType === 'supplier' ? 'Nhà Cung Cấp' : 'Nhà Xuất Bản')}`}
                message={`Bạn có chắc chắn muốn xóa mục này không? Hành động này không thể hoàn tác.`}
            />

        </div>
    );
};

export default AttributeManagementPage;