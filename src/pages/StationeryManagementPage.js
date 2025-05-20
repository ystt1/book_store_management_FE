// src/pages/StationeryManagementPage.js
import React, { useState, useEffect, useMemo } from 'react';
import styles from './StationeryManagementPage.module.css'; // Tạo file CSS mới
import StationeryTable from '../components/Stationery/StationeryTable';
import StationeryModal from '../components/Stationery/StationeryModal';
import ConfirmModal from '../components/Common/ConfirmModal';
import Pagination from '../components/Common/Pagination';
import Select from 'react-select'; // Nếu có filter theo NCC hoặc danh mục VPP
import { FaPlus, FaSearch, FaFilter, FaChevronDown, FaChevronUp } from 'react-icons/fa';

// Dữ liệu mẫu (sau này sẽ là API calls)
const sampleSuppliersForStationery = [ // Dùng cho form và filter
    { value: 'S001', label: 'VPP Tổng Hợp Minh Khai' },
    { value: 'S002', label: 'Công ty Thiên Long' },
    { value: 'S003', label: 'Đại lý VPP Hồng Hà' },
];
const initialStationeryItems = [
    { id: 'ST001', name: 'Bút bi Thiên Long TL-027', description: 'Mực xanh, đầu bi 0.5mm', price: 3500, stock_quantity: 1000, supplier_id: 'S002', supplier_name: 'Công ty Thiên Long', created_at: '2023-01-15T00:00:00Z' },
    { id: 'ST002', name: 'Vở kẻ ngang Campus 120 trang', description: 'Định lượng giấy 70gsm', price: 12000, stock_quantity: 500, supplier_id: 'S003', supplier_name: 'Đại lý VPP Hồng Hà', created_at: '2023-02-20T00:00:00Z' },
    { id: 'ST003', name: 'Băng keo trong Deli', description: 'Khổ 4.8cm, dài 100 yard', price: 8000, stock_quantity: 300, supplier_id: 'S001', supplier_name: 'VPP Tổng Hợp Minh Khai', created_at: '2023-03-10T00:00:00Z' },
    // Thêm nhiều VPP
];

const StationeryManagementPage = () => {
    const [stationeryItems, setStationeryItems] = useState(initialStationeryItems);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [currentStationery, setCurrentStationery] = useState(null);

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [itemIdToDelete, setItemIdToDelete] = useState(null);

    // Filter & Search
    const [searchTerm, setSearchTerm] = useState('');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [filterSupplierSt, setFilterSupplierSt] = useState(null); // Filter theo NCC cho VPP
    const [filterMinStockSt, setFilterMinStockSt] = useState(''); // Filter theo SL tồn

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredItems = useMemo(() => {
        return stationeryItems.filter(item => {
            const searchMatch = searchTerm === '' ||
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.id && item.id.toLowerCase().includes(searchTerm.toLowerCase()));
            if (!searchMatch) return false;

            const supplierMatch = !filterSupplierSt || item.supplier_id === filterSupplierSt.value;
            const stockMatch = filterMinStockSt === '' || item.stock_quantity >= parseInt(filterMinStockSt);

            return supplierMatch && stockMatch;
        });
    }, [stationeryItems, searchTerm, filterSupplierSt, filterMinStockSt]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItemsOnPage = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

    const handlePageChange = (page) => setCurrentPage(page);

    const handleOpenModal = (mode, item = null) => {
        setModalMode(mode);
        setCurrentStationery(item);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentStationery(null);
    };

    const handleSubmitStationery = (formData) => {
        // TODO: Gọi API để thêm/sửa VPP
        console.log("Submitting Stationery:", formData);
        if (modalMode === 'add') {
            const newItem = {
                ...formData,
                id: `ST${Date.now().toString().slice(-4)}`,
                supplier_name: sampleSuppliersForStationery.find(s => s.value === formData.supplier_id)?.label || formData.supplier_id,
                created_at: new Date().toISOString()
            };
            setStationeryItems(prev => [newItem, ...prev]);
            alert('Thêm văn phòng phẩm thành công!');
        } else {
            setStationeryItems(prev => prev.map(item =>
                item.id === formData.id ? {
                    ...item,
                    ...formData,
                    supplier_name: sampleSuppliersForStationery.find(s => s.value === formData.supplier_id)?.label || formData.supplier_id,
                } : item
            ));
            alert('Cập nhật văn phòng phẩm thành công!');
        }
        // Tính lại trang nếu cần
        const newTotalPages = Math.ceil(stationeryItems.length / itemsPerPage);
        if (currentPage > newTotalPages && newTotalPages > 0) setCurrentPage(newTotalPages);
        else if (newTotalPages === 0) setCurrentPage(1);

        handleCloseModal();
    };

    const handleDeleteClick = (id) => {
        setItemIdToDelete(id);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmDelete = () => {
        // TODO: Gọi API để xóa VPP
        console.log("Deleting Stationery ID:", itemIdToDelete);
        const updatedItems = stationeryItems.filter(item => item.id !== itemIdToDelete);
        setStationeryItems(updatedItems);

        // Tính toán lại trang hiện tại
        const filteredAfterDelete = updatedItems.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()) /* ...other filters... */);
        const newTotalPages = Math.ceil(filteredAfterDelete.length / itemsPerPage);
        if (currentPage > newTotalPages && newTotalPages > 0) {
            setCurrentPage(newTotalPages);
        } else if (newTotalPages === 0) {
            setCurrentPage(1);
        } else if (currentItemsOnPage.length === 1 && currentPage > 1 && newTotalPages < totalPages) {
             setCurrentPage(currentPage -1);
        }

        setIsConfirmModalOpen(false);
        setItemIdToDelete(null);
        alert('Xóa văn phòng phẩm thành công!');
    };
    
    const handleViewDetails = (item) => {
        // Tạm thời alert, bạn có thể tạo StationeryDetailsView.js tương tự BookDetailsView
        alert(`Xem chi tiết: ${item.name}\nMô tả: ${item.description}\nGiá: ${item.price}\nTồn kho: ${item.stock_quantity}\nNCC: ${item.supplier_name || item.supplier_id}`);
    };

    const resetAdvancedFilters = () => {
        setFilterSupplierSt(null);
        setFilterMinStockSt('');
        setCurrentPage(1);
    };


    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <h1>Quản Lý Văn Phòng Phẩm</h1>
                {/* Nút Thêm Mới nằm ở thanh controls bên dưới */}
            </div>

            <div className={styles.mainFilterControls}>
                <div className={styles.searchWrapper}>
                    <FaSearch className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm VPP (tên, mã)..."
                        value={searchTerm}
                        onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className={styles.mainSearchInput}
                    />
                </div>
                 <button
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className={`${styles.btn} ${styles.btnToggleFilter}`}
                >
                    <FaFilter /> Lọc VPP {showAdvancedFilters ? <FaChevronUp /> : <FaChevronDown />}
                </button>
                <button
                    className={`${styles.btn} ${styles.btnPrimary}`}
                    onClick={() => handleOpenModal('add')}
                    style={{marginLeft: 'auto'}} /* Đẩy nút Thêm Mới sang phải */
                >
                    <FaPlus /> Thêm VPP Mới
                </button>
            </div>

            {showAdvancedFilters && (
                <div className={`${styles.advancedFilterBar} ${showAdvancedFilters ? styles.open : ''}`}>
                    <h4 className={styles.advancedFilterTitle}>Lọc văn phòng phẩm:</h4>
                    <div className={styles.filterGrid}>
                        <Select
                            options={sampleSuppliersForStationery}
                            value={filterSupplierSt}
                            onChange={val => {setFilterSupplierSt(val); setCurrentPage(1);}}
                            placeholder="Nhà cung cấp"
                            isClearable
                            className={`${styles.filterControl} react-select-container`}
                            classNamePrefix="react-select"
                        />
                        <input
                            type="number"
                            placeholder="Tồn kho từ"
                            value={filterMinStockSt}
                            onChange={e => {setFilterMinStockSt(e.target.value); setCurrentPage(1);}}
                            className={styles.filterControl}
                            min="0"
                        />
                    </div>
                    <div className={styles.filterActions}>
                        <button onClick={resetAdvancedFilters} className={`${styles.btn} ${styles.btnSecondary}`}>Xóa bộ lọc</button>
                    </div>
                </div>
            )}

            <StationeryTable
                stationeryItems={currentItemsOnPage}
                onEdit={handleOpenModal}
                onDelete={handleDeleteClick}
                onViewDetails={handleViewDetails} // Truyền hàm xem chi tiết
            />

            {totalPages > 0 && filteredItems.length > itemsPerPage && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    itemsPerPage={itemsPerPage}
                    totalItems={filteredItems.length}
                />
            )}

            <StationeryModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleSubmitStationery}
                currentStationery={currentStationery}
                mode={modalMode}
                sampleSuppliers={sampleSuppliersForStationery} // Truyền NCC vào modal
            />

            <ConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Xác nhận xóa Văn Phòng Phẩm"
                message={`Bạn có chắc chắn muốn xóa mục "${stationeryItems.find(i => i.id === itemIdToDelete)?.name}" không?`}
            />
        </div>
    );
};

export default StationeryManagementPage;