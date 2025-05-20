// src/pages/CustomerManagementPage.js
import React, { useState, useEffect, useMemo } from 'react';
import styles from './CustomerManagementPage.module.css';
import CustomerTable from '../components/Customers/CustomerTable';
import CustomerModal from '../components/Customers/CustomerModal';
import PurchaseHistoryModal from '../components/Customers/PurchaseHistoryModal';
import ConfirmModal from '../components/Common/ConfirmModal';
import Pagination from '../components/Common/Pagination';
import { FaPlus, FaSearch } from 'react-icons/fa';

// Dữ liệu mẫu
const initialCustomers = [
    { id: 'CUS001', full_name: 'Nguyễn Văn An', phone: '0901234567', email: 'an.nv@example.com', address: '123 Đường ABC, Quận 1, TP.HCM', note: 'Khách VIP', store_id: 'STORE001', totalSpent: 5500000, orderCount: 5 },
    { id: 'CUS002', full_name: 'Trần Thị Bình', phone: '0912345678', email: 'binh.tt@example.com', address: '456 Đường XYZ, Quận 2, TP.HCM', note: '', store_id: 'STORE001', totalSpent: 1200000, orderCount: 2 },
    // Thêm nhiều khách hàng
];

// Dữ liệu mẫu cho lịch sử mua hàng
const samplePurchaseHistory = {
    'CUS001': [
        { id: 'ORD001', order_date: '2023-10-01', items: [{name: 'Sách React', quantity: 1}], total_amount: 220000, status: 'Đã giao' },
        { id: 'ORD005', order_date: '2023-10-15', items: [{name: 'Sách Node.js', quantity: 2}, {name: 'Bút bi', quantity: 5}], total_amount: 350000, status: 'Đang xử lý' },
    ],
    'CUS002': [
        { id: 'ORD002', order_date: '2023-09-20', items: [{name: 'Vở học sinh', quantity: 10}], total_amount: 120000, status: 'Đã giao' },
    ]
};


const CustomerManagementPage = () => {
    const [customers, setCustomers] = useState(initialCustomers);
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [customerModalMode, setCustomerModalMode] = useState('add');
    const [currentCustomer, setCurrentCustomer] = useState(null);

    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [selectedCustomerForHistory, setSelectedCustomerForHistory] = useState(null);
    const [purchaseHistory, setPurchaseHistory] = useState([]);

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [customerIdToDelete, setCustomerIdToDelete] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Logic filter và pagination
    const filteredCustomers = useMemo(() => {
        return customers.filter(customer =>
            customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.phone.includes(searchTerm) ||
            (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [customers, searchTerm]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentCustomersOnPage = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleOpenCustomerModal = (mode, customer = null) => {
        setCustomerModalMode(mode);
        setCurrentCustomer(customer);
        setIsCustomerModalOpen(true);
    };

    const handleCloseCustomerModal = () => {
        setIsCustomerModalOpen(false);
        setCurrentCustomer(null);
    };

    const handleSubmitCustomer = (formData) => {
        // TODO: Gọi API để thêm/sửa khách hàng
        console.log("Submitting customer:", formData);
        if (customerModalMode === 'add') {
            const newCustomer = { ...formData, id: `CUS${Date.now().toString().slice(-3)}`, totalSpent: 0, orderCount: 0 };
            setCustomers(prev => [newCustomer, ...prev]);
            alert('Thêm khách hàng thành công!');
        } else {
            setCustomers(prev => prev.map(cust => cust.id === formData.id ? { ...cust, ...formData } : cust));
            alert('Cập nhật thông tin khách hàng thành công!');
        }
        // Có thể cần tính lại trang hiện tại
        const newTotalPages = Math.ceil(customers.length / itemsPerPage); // Tính trên customers chưa filter
        if (currentPage > newTotalPages && newTotalPages > 0) setCurrentPage(newTotalPages);
        else if (newTotalPages === 0) setCurrentPage(1);

        handleCloseCustomerModal();
    };

    const handleDeleteCustomerClick = (customerId) => {
        setCustomerIdToDelete(customerId);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmDeleteCustomer = () => {
        // TODO: Gọi API để xóa khách hàng
        console.log("Deleting customer ID:", customerIdToDelete);
        const updatedCustomers = customers.filter(cust => cust.id !== customerIdToDelete);
        setCustomers(updatedCustomers);

        // Tính toán lại trang hiện tại
        const filteredAfterDelete = updatedCustomers.filter(c => c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) /* ... */);
        const newTotalPages = Math.ceil(filteredAfterDelete.length / itemsPerPage);
        if (currentPage > newTotalPages && newTotalPages > 0) {
            setCurrentPage(newTotalPages);
        } else if (newTotalPages === 0) {
            setCurrentPage(1);
        } else if (currentCustomersOnPage.length === 1 && currentPage > 1 && newTotalPages < totalPages) {
             setCurrentPage(currentPage -1);
        }

        setIsConfirmModalOpen(false);
        setCustomerIdToDelete(null);
        alert('Xóa khách hàng thành công!');
    };

    const handleViewHistory = (customer) => {
        // TODO: Fetch lịch sử mua hàng từ API cho customer.id
        console.log("Viewing history for:", customer.full_name);
        setSelectedCustomerForHistory(customer);
        setPurchaseHistory(samplePurchaseHistory[customer.id] || []); // Dùng dữ liệu mẫu
        setIsHistoryModalOpen(true);
    };


    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <h1>Quản Lý Khách Hàng</h1>
            </div>

            <div className={styles.controlsBar}>
                <div className={styles.searchWrapper}>
                    <FaSearch className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm khách hàng (tên, SĐT, email)..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1);}}
                        className={styles.searchInput}
                    />
                </div>
                <button
                    className={`${styles.btn} ${styles.btnPrimary}`}
                    onClick={() => handleOpenCustomerModal('add')}
                >
                    <FaPlus /> Thêm Khách Hàng
                </button>
            </div>

            <CustomerTable
                customers={currentCustomersOnPage}
                onEdit={(cust) => handleOpenCustomerModal('edit', cust)}
                onDelete={handleDeleteCustomerClick}
                onViewHistory={handleViewHistory}
            />

            {totalPages > 0 && filteredCustomers.length > itemsPerPage && (
                 <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    itemsPerPage={itemsPerPage}
                    totalItems={filteredCustomers.length}
                />
            )}

            <CustomerModal
                isOpen={isCustomerModalOpen}
                onClose={handleCloseCustomerModal}
                onSubmit={handleSubmitCustomer}
                currentCustomer={currentCustomer}
                mode={customerModalMode}
            />

            {selectedCustomerForHistory && (
                <PurchaseHistoryModal
                    isOpen={isHistoryModalOpen}
                    onClose={() => setIsHistoryModalOpen(false)}
                    customerName={selectedCustomerForHistory.full_name}
                    history={purchaseHistory}
                />
            )}

            <ConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirmDeleteCustomer}
                title="Xác nhận xóa Khách Hàng"
                message={`Bạn có chắc chắn muốn xóa khách hàng "${customers.find(c=>c.id === customerIdToDelete)?.full_name}" không?`}
            />
        </div>
    );
};

export default CustomerManagementPage;