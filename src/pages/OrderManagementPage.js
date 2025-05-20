// src/pages/OrderManagementPage.js
import React, { useState, useEffect, useMemo } from 'react';
import styles from './OrderManagementPage.module.css';
import OrderTable from '../components/Orders/OrderTable';
import OrderFormModal from '../components/Orders/OrderFormModal';
import OrderDetailsModal from '../components/Orders/OrderDetailsModal';
import ConfirmModal from '../components/Common/ConfirmModal';
import Pagination from '../components/Common/Pagination';
import Select from 'react-select'; // Cho filter trạng thái
import { FaPlus, FaSearch, FaFilter, FaChevronDown, FaChevronUp } from 'react-icons/fa';

// Dữ liệu mẫu
const sampleOrders = [
    { id: 'ORD001', customer_id: 'CUS001', customer_name: 'Nguyễn Văn An', order_date: '2023-10-28T10:30:00Z', total_amount: 220000, status: 'pending', created_by: 'admin', items: [{product_id: 'B001', product_type: 'book', name: 'Sách ReactJS', quantity: 1, unit_price: 220000}], discount: 0, tax_rate: 10 },
    { id: 'ORD002', customer_id: 'CUS002', customer_name: 'Trần Thị Bình', order_date: '2023-10-27T14:00:00Z', total_amount: 150000, status: 'processing', created_by: 'staff01', items: [{product_id: 'S001', product_type: 'stationery', name: 'Bút bi', quantity: 30, unit_price: 5000}], discount: 5, tax_rate: 10 },
    { id: 'ORD003', customer_id: 'CUS001', customer_name: 'Nguyễn Văn An', order_date: '2023-10-26T09:15:00Z', total_amount: 575000, status: 'completed', created_by: 'admin', items: [{product_id: 'B002',product_type: 'book', name: 'Sách Node.js', quantity: 2, unit_price: 150000}, {product_id: 'S002', product_type: 'stationery', name: 'Vở Campus', quantity: 5, unit_price: 55000}], discount: 0, tax_rate: 0},
];
const orderStatusOptions = [
    { value: 'pending', label: 'Chờ xử lý' },
    { value: 'processing', label: 'Đang xử lý' },
    { value: 'shipped', label: 'Đang giao' },
    { value: 'completed', label: 'Hoàn thành' },
    { value: 'cancelled', label: 'Đã hủy' },
    { value: 'refunded', label: 'Đã hoàn tiền' },
];


const OrderManagementPage = () => {
    const [orders, setOrders] = useState(sampleOrders);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [formModalMode, setFormModalMode] = useState('add'); // 'add' or 'edit'
    const [currentOrder, setCurrentOrder] = useState(null); // Đơn hàng đang được sửa hoặc xem

    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [orderIdToDelete, setOrderIdToDelete] = useState(null);

    // Filter & Search
    const [searchTerm, setSearchTerm] = useState(''); // Theo mã ĐH, tên KH
    const [filterStatus, setFilterStatus] = useState(null); // Select dropdown
    const [filterDateFrom, setFilterDateFrom] = useState('');
    const [filterDateTo, setFilterDateTo] = useState('');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [filterMinAmount, setFilterMinAmount] = useState(''); // <<< THÊM CHO KHOẢNG GIÁ
    const [filterMaxAmount, setFilterMaxAmount] = useState(''); // <<< THÊM CHO KHOẢNG GIÁ

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const searchMatch = searchTerm === '' ||
                order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.customer_name.toLowerCase().includes(searchTerm.toLowerCase());

            const statusMatch = !filterStatus || order.status === filterStatus.value;

            const dateFromMatch = filterDateFrom === '' || new Date(order.order_date) >= new Date(filterDateFrom);
            const dateToMatch = filterDateTo === '' || new Date(order.order_date) <= new Date(new Date(filterDateTo).setHours(23,59,59,999)); // Đến cuối ngày

            return searchMatch && statusMatch && dateFromMatch && dateToMatch;
        });
    }, [orders, searchTerm, filterStatus, filterDateFrom, filterDateTo]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentOrdersOnPage = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

    const handlePageChange = (page) => setCurrentPage(page);

    const handleOpenFormModal = (mode, order = null) => {
        setFormModalMode(mode);
        setCurrentOrder(order); // Sẽ truyền vào OrderFormModal
        setIsFormModalOpen(true);
    };

    const handleCloseFormModal = () => {
        setIsFormModalOpen(false);
        setCurrentOrder(null);
    };

    const handleSubmitOrder = (orderData) => {
        // TODO: Gọi API để tạo/cập nhật đơn hàng
        console.log("Submitting order:", orderData);
        if (formModalMode === 'add') {
            const newOrder = { ...orderData, id: `ORD${Date.now().toString().slice(-4)}`, customer_name: sampleOrders.find(c=>c.customer_id === orderData.customer_id)?.customer_name || 'Khách Lẻ', created_by: 'CurrentUser' }; // Cần lấy tên KH
            setOrders(prev => [newOrder, ...prev]);
            alert('Tạo đơn hàng thành công!');
        } else {
            setOrders(prev => prev.map(o => o.id === orderData.id ? { ...o, ...orderData, customer_name: sampleOrders.find(c=>c.customer_id === orderData.customer_id)?.customer_name || o.customer_name } : o));
            alert('Cập nhật đơn hàng thành công!');
        }
        handleCloseFormModal();
        setCurrentPage(1); // Quay về trang 1
    };

    const handleOpenDetailsModal = (order) => {
        setCurrentOrder(order);
        setIsDetailsModalOpen(true);
    };

    const handleDeleteClick = (orderId) => {
        setOrderIdToDelete(orderId);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmDelete = () => {
        // TODO: Gọi API để xóa đơn hàng (có thể chỉ là thay đổi trạng thái sang 'cancelled')
        console.log("Deleting order ID:", orderIdToDelete);
        setOrders(prev => prev.filter(o => o.id !== orderIdToDelete));
        // Cập nhật lại pagination
        const newTotalPages = Math.ceil((filteredOrders.length -1) / itemsPerPage);
        if(currentPage > newTotalPages && newTotalPages > 0) setCurrentPage(newTotalPages);
        else if(newTotalPages === 0) setCurrentPage(1);

        setIsConfirmModalOpen(false);
        setOrderIdToDelete(null);
        alert('Xóa đơn hàng thành công (hoặc đã hủy)!');
    };

    const handleUpdateOrderStatus = (orderId, newStatus) => {
        // TODO: Gọi API cập nhật trạng thái đơn hàng
        console.log(`Updating status for order ${orderId} to ${newStatus}`);
        setOrders(prevOrders =>
            prevOrders.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            )
        );
        alert(`Đã cập nhật trạng thái đơn hàng ${orderId} thành ${orderStatusOptions.find(s=>s.value === newStatus)?.label}!`);
    };



 const resetAdvancedFilters = () => { // <<< CẬP NHẬT
        setFilterStatus(null);
        setFilterDateFrom('');
        setFilterDateTo('');
        setFilterMinAmount('');
        setFilterMaxAmount('');
        setCurrentPage(1);
        setShowAdvancedFilters(false); // Tùy chọn
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <h1>Quản Lý Đơn Hàng</h1>
                <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => handleOpenFormModal('add')}>
                    <FaPlus /> Tạo Đơn Hàng Mới
                </button>
            </div>

            <div className={styles.mainFilterControls}>
                <div className={styles.searchWrapper}>
                    <FaSearch className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Tìm Mã ĐH, Tên Khách Hàng..."
                        value={searchTerm}
                        onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className={styles.mainSearchInput}
                    />
                </div>
                <button
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className={`${styles.btn} ${styles.btnToggleFilter}`}
                    title={showAdvancedFilters ? "Ẩn bộ lọc nâng cao" : "Hiện bộ lọc nâng cao"}
                >
                    <FaFilter /> Lọc Nâng Cao {showAdvancedFilters ? <FaChevronUp /> : <FaChevronDown />}
                </button>
            </div>

            {/* Bộ lọc chi tiết (ẩn/hiện) */}
            {showAdvancedFilters && (
                <div className={`${styles.advancedFilterBar} ${showAdvancedFilters ? styles.open : ''}`}>
                    <h4 className={styles.advancedFilterTitle}>Tùy chọn lọc:</h4>
                    <div className={styles.filterGrid}>
                        <Select
                            options={orderStatusOptions}
                            value={filterStatus}
                            onChange={val => { setFilterStatus(val); setCurrentPage(1); }}
                            placeholder="Trạng thái đơn hàng"
                            isClearable
                            className={`${styles.filterControl} react-select-container`}
                            classNamePrefix="react-select"
                        />
                        <input
                            type="date"
                            value={filterDateFrom}
                            onChange={e => { setFilterDateFrom(e.target.value); setCurrentPage(1); }}
                            className={styles.filterControl}
                            title="Từ ngày tạo"
                        />
                        <input
                            type="date"
                            value={filterDateTo}
                            onChange={e => { setFilterDateTo(e.target.value); setCurrentPage(1); }}
                            className={styles.filterControl}
                            title="Đến ngày tạo"
                        />
                        <input
                            type="number"
                            placeholder="Tổng tiền từ (VNĐ)"
                            value={filterMinAmount}
                            onChange={e => { setFilterMinAmount(e.target.value); setCurrentPage(1); }}
                            className={styles.filterControl}
                            min="0"
                        />
                        <input
                            type="number"
                            placeholder="Tổng tiền đến (VNĐ)"
                            value={filterMaxAmount}
                            onChange={e => { setFilterMaxAmount(e.target.value); setCurrentPage(1); }}
                            className={styles.filterControl}
                            min="0"
                        />
                    </div>
                    <div className={styles.filterActions}>
                        <button onClick={resetAdvancedFilters} className={`${styles.btn} ${styles.btnSecondary}`}>
                            Xóa bộ lọc
                        </button>
                    </div>
                </div>
            )}



            <OrderTable
                orders={currentOrdersOnPage}
                onViewDetails={handleOpenDetailsModal}
                onEditOrder={(order) => handleOpenFormModal('edit', order)} // Cho phép sửa đơn hàng (nếu cần)
                onDeleteOrder={handleDeleteClick}
                onUpdateStatus={handleUpdateOrderStatus} // Truyền hàm cập nhật trạng thái
                orderStatusOptions={orderStatusOptions} // Truyền options để hiển thị dropdown
            />

            {totalPages > 0 && filteredOrders.length > itemsPerPage && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    itemsPerPage={itemsPerPage}
                    totalItems={filteredOrders.length}
                />
            )}

            <OrderFormModal
                isOpen={isFormModalOpen}
                onClose={handleCloseFormModal}
                onSubmit={handleSubmitOrder}
                currentOrder={currentOrder}
                mode={formModalMode}
            />

            {currentOrder && isDetailsModalOpen && (
                <OrderDetailsModal
                    isOpen={isDetailsModalOpen}
                    onClose={() => setIsDetailsModalOpen(false)}
                    order={currentOrder} // Truyền đơn hàng đang được chọn
                    orderStatusOptions={orderStatusOptions}
                    onUpdateStatus={handleUpdateOrderStatus} // Cho phép cập nhật trạng thái từ chi tiết
                />
            )}

            <ConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Xác nhận Hủy/Xóa Đơn Hàng"
                message={`Bạn có chắc chắn muốn xóa/hủy đơn hàng "${orderIdToDelete}" không?`}
            />
        </div>
    );
};

export default OrderManagementPage;