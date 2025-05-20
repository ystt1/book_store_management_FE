// src/components/Customers/CustomerTable.js
import React from 'react';
import styles from './CustomerTable.module.css';

const CustomerTable = ({ customers, onEdit, onDelete, onViewHistory }) => {
    return (
        <div className={styles.tableContainer}>
            <table className={styles.customerTable}>
                <thead>
                    <tr>
                        <th>ID Khách Hàng</th>
                        <th>Họ và Tên</th>
                        <th>Số điện thoại</th>
                        <th>Email</th>
                        <th>Địa chỉ</th>
                        <th>Tổng chi tiêu</th> {/* Cần dữ liệu tổng hợp */}
                        <th>Số đơn hàng</th> {/* Cần dữ liệu tổng hợp */}
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {customers && customers.length > 0 ? (
                        customers.map(customer => (
                            <tr key={customer.id}>
                                <td data-label="ID KH:">{customer.id}</td>
                                <td data-label="Họ tên:" className={styles.customerName} onClick={() => onViewHistory(customer)}>{customer.full_name}</td>
                                <td data-label="SĐT:">{customer.phone}</td>
                                <td data-label="Email:">{customer.email || 'N/A'}</td>
                                <td data-label="Địa chỉ:" className={styles.addressCell}>{customer.address || 'N/A'}</td>
                                <td data-label="Tổng chi:" className={styles.numericCell}>{customer.totalSpent?.toLocaleString('vi-VN') || 0} VNĐ</td>
                                <td data-label="Số đơn:" className={styles.numericCell}>{customer.orderCount || 0}</td>
                                <td data-label="Hành động:" className={styles.actionsCell}>
                                    <button onClick={() => onViewHistory(customer)} className={`${styles.btnAction} ${styles.btnView}`} title="Xem lịch sử">👁️</button>
                                    <button onClick={() => onEdit(customer)} className={`${styles.btnAction} ${styles.btnEdit}`} title="Sửa">✏️</button>
                                    <button onClick={() => onDelete(customer.id)} className={`${styles.btnAction} ${styles.btnDelete}`} title="Xóa">🗑️</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8" className={styles.noResults}>Không có khách hàng nào.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default CustomerTable;