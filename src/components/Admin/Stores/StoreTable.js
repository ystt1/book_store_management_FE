// src/components/Admin/Stores/StoreTable.js
import React from 'react';
import styles from './StoreTable.module.css'; // Tạo file CSS này
import { FaEdit, FaToggleOn, FaToggleOff, FaEye } from 'react-icons/fa'; // Thêm FaEye

const StoreTable = ({ stores, onEdit, onToggleActivity, onViewDetails }) => { // Thêm onViewDetails
    return (
        <div className={styles.tableContainer}>
            <table className={styles.storeTable}>
                <thead>
                    <tr>
                        <th>ID Cửa Hàng</th>
                        <th>Tên Cửa Hàng</th>
                        <th>Địa Chỉ</th>
                        <th>SĐT</th>
                        <th>Email</th>
                        <th>Quản Lý</th>
                        <th>Trạng Thái</th>
                        <th>Hành Động</th>
                    </tr>
                </thead>
                <tbody>
                    {stores && stores.length > 0 ? (
                        stores.map(store => (
                            <tr key={store._id || store.id}>
                                <td data-label="ID CH:" className={styles.storeIdCell} onClick={() => onViewDetails && onViewDetails(store)}>{store._id || store.id}</td>
                                <td data-label="Tên CH:" className={styles.storeNameCell} onClick={() => onViewDetails && onViewDetails(store)}>{store.name}</td>
                                <td data-label="Địa Chỉ:">{store.address}</td>
                                <td data-label="SĐT:">{store.phone || 'N/A'}</td>
                                <td data-label="Email:">{store.email || 'N/A'}</td>
                                <td data-label="Quản Lý:">{store.manager_id?.full_name || store.manager_id?.username || 'Chưa gán'}</td>
                                <td data-label="Trạng Thái:">
                                    <span className={`${styles.statusBadge} ${store.is_active ? styles.statusActive : styles.statusInactive}`}>
                                        {store.is_active ? 'Hoạt động' : 'Vô hiệu hóa'}
                                    </span>
                                </td>
                                <td data-label="Hành Động:" className={styles.actionsCell}>
                                    {onViewDetails && <button onClick={() => onViewDetails(store)} className={`${styles.btnAction} ${styles.btnView}`} title="Xem chi tiết"><FaEye/></button>}
                                    <button onClick={() => onEdit(store)} className={`${styles.btnAction} ${styles.btnEdit}`} title="Sửa"> <FaEdit /> </button>
                                    <button onClick={() => onToggleActivity(store._id || store.id, store.name, store.is_active)}
                                        className={`${styles.btnAction} ${store.is_active ? styles.btnDeactivate : styles.btnActivate}`}
                                        title={store.is_active ? 'Vô hiệu hóa' : 'Kích hoạt'}>
                                        {store.is_active ? <FaToggleOff /> : <FaToggleOn />}
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8" className={styles.noResults}>Không có cửa hàng nào.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default StoreTable;