// src/pages/GeneralImportOrderPage.js
import React, { useState, useEffect, useMemo } from 'react';
import styles from './GeneralImportOrderPage.module.css'; // Tạo file CSS mới
import ImportOrderTable from '../components/ImportOrders/ImportOrderTable';
import ImportOrderFormModal from '../components/ImportOrders/ImportOrderFormModal';
import ConfirmModal from '../components/Common/ConfirmModal';
import Pagination from '../components/Common/Pagination';
import Select from 'react-select';
import ImportOrderDetailsModal from '../components/ImportOrders/ImportOrderDetailsModal'; 
import { FaPlus, FaSearch, FaFilter, FaChevronDown, FaChevronUp } from 'react-icons/fa';

// --- DỮ LIỆU MẪU (Lấy từ các trang khác hoặc fetch API) ---
const sampleSuppliers = [
    { value: 'S001', label: 'Nhà Cung Cấp Alpha' },
    { value: 'S002', label: 'Nhà Cung Cấp Beta' },
];
const sampleBooksForForm = [ // Chỉ cần id, name, price (giá bán hiện tại)
    { id: 'B001', name: 'Sách ReactJS Toàn Tập', price: 220000 },
    { id: 'B002', name: 'Lập Trình Với Node.js', price: 150000 },
    { id: 'B003', name: 'Sách Văn Học A', price: 90000 },
];
const sampleStationeryForForm = [
    { id: 'ST001', name: 'Bút bi Thiên Long TL-027', price: 3500 },
    { id: 'ST002', name: 'Vở kẻ ngang Campus 120 trang', price: 12000 },
];
const initialImportOrders = [ // Dữ liệu đơn nhập hàng
    { id: 'DNH001', supplier_id: 'S001', supplier_name: 'Nhà Cung Cấp Alpha', import_date: '2023-10-20T10:00:00Z', expected_delivery_date: '2023-10-25', total_amount: 27500000, status: 'completed', items: [{product_id: 'B001', product_type:'book', quantity: 50, unit_price: 180000}, {product_id: 'B002', product_type:'book', quantity: 50, unit_price: 120000}, {product_id: 'ST001', product_type: 'stationery', quantity: 1000, unit_price: 2500}]},
    { id: 'DNH002', supplier_id: 'S002', supplier_name: 'Nhà Cung Cấp Beta', import_date: '2023-11-01T14:30:00Z', expected_delivery_date: '2023-11-05', total_amount: 1200000, status: 'pending_approval', items: [{product_id: 'ST002', product_type:'stationery', quantity: 100, unit_price: 12000}]},
    { id: 'DNH002', supplier_id: 'S002', supplier_name: 'Nhà Cung Cấp Beta', import_date: '2023-11-01T14:30:00Z', expected_delivery_date: '2023-11-05', total_amount: 1200000, status: 'pending_approval', items: [{product_id: 'ST002', product_type:'stationery', quantity: 100, unit_price: 12000}]},
];
const importOrderStatusOptions = [
    { value: 'pending_approval', label: 'Chờ duyệt' },
    { value: 'approved', label: 'Đã duyệt' },
    { value: 'importing', label: 'Đang nhập hàng' },
    { value: 'completed', label: 'Hoàn thành' },
    { value: 'cancelled', label: 'Đã hủy' },
];
// --- KẾT THÚC DỮ LIỆU MẪU ---


const GeneralImportOrderPage = () => {
    // States cho Đơn Nhập Hàng
    const [importOrders, setImportOrders] = useState(initialImportOrders);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [currentImportOrder, setCurrentImportOrder] = useState(null);
    const [importModalMode, setImportModalMode] = useState('add');

    // Filter & Search
    const [searchTerm, setSearchTerm] = useState('');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [filterStatus, setFilterStatus] = useState(null);
    const [filterSupplier, setFilterSupplier] = useState(null);
    const [filterDateFrom, setFilterDateFrom] = useState('');
    const [filterDateTo, setFilterDateTo] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Modal xác nhận
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [itemToDeleteId, setItemToDeleteId] = useState(null);

    // Giả sử bạn có state chứa danh sách sách và VPP (hoặc sẽ fetch chúng)
    const [allBooks, setAllBooks] = useState(sampleBooksForForm);
    const [allStationery, setAllStationery] = useState(sampleStationeryForForm);


    const filteredAndSearchedImportOrders = useMemo(() => {
        return importOrders.filter(order => {
            const searchMatch = searchTerm === '' ||
                order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (order.supplier_name && order.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()));
            if (!searchMatch) return false;

            const statusMatch = !filterStatus || order.status === filterStatus.value;
            const supplierMatch = !filterSupplier || order.supplier_id === filterSupplier.value;
            const dateFromMatch = filterDateFrom === '' || new Date(order.import_date) >= new Date(filterDateFrom);
            const dateToMatch = filterDateTo === '' || new Date(order.import_date) <= new Date(new Date(filterDateTo).setHours(23,59,59,999));

            return statusMatch && supplierMatch && dateFromMatch && dateToMatch;
        });
    }, [importOrders, searchTerm, filterStatus, filterSupplier, filterDateFrom, filterDateTo]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentImportOrdersOnPage = filteredAndSearchedImportOrders.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredAndSearchedImportOrders.length / itemsPerPage);

    const handlePageChange = (page) => setCurrentPage(page);

    const openImportModal = (mode, importOrder = null) => {
        setIsImportModalOpen(true);
        setImportModalMode(mode);
        setCurrentImportOrder(importOrder);
    };
    const closeImportModal = () => setIsImportModalOpen(false);


    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false); // << THÊM STATE
    const [selectedImportOrderForDetails, setSelectedImportOrderForDetails] = useState(null); // << THÊM STATE

    // ... (các hàm filter, pagination, openImportModal, closeImportModal, handleSubmit, handleDelete, handleUpdateStatus giữ nguyên) ...

    const handleOpenDetailsModal = (importOrder) => { 
        console.log(importOrder);
        const detailedOrder = {
            ...importOrder,
            items: importOrder.items?.map(item => {
                let productName = 'N/A';
                if (item.product_type === 'book') {
                    const book = sampleBooksForForm.find(b => b.id === item.product_id);
                    if (book) productName = book.name;
                } else if (item.product_type === 'stationery') {
                    const stationery = sampleStationeryForForm.find(s => s.id === item.product_id);
                    if (stationery) productName = stationery.name;
                }
                return { ...item, product_name: productName };
            }) || []
        };
        setSelectedImportOrderForDetails(detailedOrder);
        setIsDetailsModalOpen(true);
    };

    const handleImportOrderSubmit = (submittedData) => {
        console.log("Submitting General Import Order:", submittedData);
        if (importModalMode === 'add') {
            const newImportOrder = {
                ...submittedData,
                id: `DNHG${Date.now().toString().slice(-3)}`,
                supplier_name: sampleSuppliers.find(s => s.value === submittedData.supplier_id)?.label,
                // created_by: 'current_user_id' // Lấy từ context/auth
            };
            setImportOrders(prev => [newImportOrder, ...prev]);
            alert("Tạo đơn nhập hàng thành công!");
        } else {
            setImportOrders(prev => prev.map(io =>
                io.id === submittedData.id ? {
                    ...io,
                    ...submittedData,
                    supplier_name: sampleSuppliers.find(s => s.value === submittedData.supplier_id)?.label || io.supplier_name,
                } : io
            ));
            alert("Cập nhật đơn nhập hàng thành công!");
        }
        setCurrentPage(1); // Reset về trang 1
        closeImportModal();
    };

    const handleDeleteImportOrderClick = (orderId) => {
        setItemToDeleteId(orderId);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmDelete = () => {
        console.log("Deleting Import Order ID:", itemToDeleteId);
        const updatedOrders = importOrders.filter(io => io.id !== itemToDeleteId);
        setImportOrders(updatedOrders);
        // Cập nhật pagination
        const newTotalPages = Math.ceil(updatedOrders.filter(o => o.id.includes(searchTerm) /* ... */).length / itemsPerPage);
        if (currentPage > newTotalPages && newTotalPages > 0) setCurrentPage(newTotalPages);
        else if (newTotalPages === 0) setCurrentPage(1);

        setIsConfirmModalOpen(false);
        setItemToDeleteId(null);
        alert('Hủy/Xóa đơn nhập hàng thành công!');
    };

    const handleUpdateImportOrderStatus = (orderId, newStatus) => {
        console.log(`Updating import order ${orderId} to ${newStatus}`);
        setImportOrders(prev => prev.map(io => io.id === orderId ? { ...io, status: newStatus } : io));

        if (newStatus === 'completed') {
            const completedOrder = importOrders.find(io => io.id === orderId);
            if (completedOrder && completedOrder.items) {
                // TODO: Cần có state riêng cho books và stationery ở trang này nếu muốn cập nhật tồn kho
                // Hoặc, tốt hơn là khi đơn nhập hoàn thành, backend sẽ tự động cập nhật tồn kho
                // và frontend chỉ cần fetch lại dữ liệu sách/VPP nếu cần.
                alert(`Đơn nhập ${orderId} hoàn thành. (Logic cập nhật tồn kho cần được thực hiện ở backend hoặc fetch lại dữ liệu sản phẩm).`);
            }
        }
    };
    
    const resetAdvancedFilters = () => {
        setFilterStatus(null);
        setFilterSupplier(null);
        setFilterDateFrom('');
        setFilterDateTo('');
        setCurrentPage(1);
    };


    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <h1>Quản Lý Đơn Nhập Hàng (Sách & VPP)</h1>
                <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => openImportModal('add')}>
                    <FaPlus /> Tạo Đơn Nhập Mới
                </button>
            </div>

            <div className={styles.mainFilterControls}>
                <div className={styles.searchWrapper}>
                    <FaSearch className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Tìm Mã ĐNH, Tên NCC..."
                        value={searchTerm}
                        onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className={styles.mainSearchInput}
                    />
                </div>
                <button
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className={`${styles.btn} ${styles.btnToggleFilter}`}
                >
                    <FaFilter /> Lọc Nâng Cao {showAdvancedFilters ? <FaChevronUp /> : <FaChevronDown />}
                </button>
            </div>

            {showAdvancedFilters && (
                <div className={`${styles.advancedFilterBar} ${showAdvancedFilters ? styles.open : ''}`}>
                    <h4 className={styles.advancedFilterTitle}>Lọc đơn nhập hàng:</h4>
                    <div className={styles.filterGrid}>
                        <Select
                            options={importOrderStatusOptions}
                            value={filterStatus}
                            onChange={val => { setFilterStatus(val); setCurrentPage(1); }}
                            placeholder="Trạng thái ĐNH"
                            isClearable
                            className={`${styles.filterControl} react-select-container`}
                            classNamePrefix="react-select"
                        />
                        <Select
                            options={sampleSuppliers} // Dùng sampleSuppliers đã có
                            value={filterSupplier}
                            onChange={val => { setFilterSupplier(val); setCurrentPage(1); }}
                            placeholder="Nhà cung cấp"
                            isClearable
                            className={`${styles.filterControl} react-select-container`}
                            classNamePrefix="react-select"
                        />
                        <input type="date" value={filterDateFrom} onChange={e => { setFilterDateFrom(e.target.value); setCurrentPage(1); }} className={styles.filterControl} title="Từ ngày tạo"/>
                        <input type="date" value={filterDateTo} onChange={e => { setFilterDateTo(e.target.value); setCurrentPage(1); }} className={styles.filterControl} title="Đến ngày tạo"/>
                    </div>
                     <div className={styles.filterActions}>
                        <button onClick={resetAdvancedFilters} className={`${styles.btn} ${styles.btnSecondary}`}>Xóa bộ lọc</button>
                    </div>
                </div>
            )}

            <ImportOrderTable
                importOrders={currentImportOrdersOnPage}
                onEdit={openImportModal}
                onDelete={handleDeleteImportOrderClick}
                onViewDetails={handleOpenDetailsModal} 
                onUpdateStatus={handleUpdateImportOrderStatus}
            />

            {totalPages > 0 && filteredAndSearchedImportOrders.length > itemsPerPage && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    itemsPerPage={itemsPerPage}
                    totalItems={filteredAndSearchedImportOrders.length}
                />
            )}

            <ImportOrderFormModal
                isOpen={isImportModalOpen}
                onClose={closeImportModal}
                onSubmit={handleImportOrderSubmit}
                currentImportOrder={currentImportOrder}
                mode={importModalMode}
                sampleSuppliers={sampleSuppliers} // Truyền danh sách NCC
                sampleBooks={allBooks}           // Truyền danh sách Sách
                sampleStationery={allStationery} // Truyền danh sách VPP
            />

            <ConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Xác nhận Hủy/Xóa Đơn Nhập Hàng"
                message={`Bạn có chắc chắn muốn hủy/xóa đơn nhập hàng "${itemToDeleteId}" không?`}
            />

            {selectedImportOrderForDetails && ( // << RENDER MODAL CHI TIẾT
                <ImportOrderDetailsModal
                    isOpen={isDetailsModalOpen}
                    onClose={() => setIsDetailsModalOpen(false)}
                    importOrder={selectedImportOrderForDetails}
                    onUpdateStatus={handleUpdateImportOrderStatus} // Cho phép cập nhật trạng thái từ modal chi tiết
                    importOrderStatusOptions={importOrderStatusOptions}
                />
            )}

        </div>
    );
};

export default GeneralImportOrderPage;