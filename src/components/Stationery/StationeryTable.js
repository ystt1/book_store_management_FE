// src/components/Stationery/StationeryTable.js
import React from 'react';
import styles from './StationeryTable.module.css';

const StationeryTable = ({ stationeryItems, onEdit, onDelete, onViewDetails }) => {
    return (
        <div className={styles.tableContainer}>
            <table className={styles.stationeryTable}>
                <thead>
                    <tr>
                        <th>Mã VPP</th>
                        <th>Tên Văn Phòng Phẩm</th>
                        <th>Mô tả</th>
                        <th>Đơn giá</th>
                        <th>SL Tồn</th>
                        <th>Nhà Cung Cấp</th>
                        {/* <th>Ngày tạo</th> */}
                        <th>Hành Động</th>
                    </tr>
                </thead>
                <tbody>
                    {stationeryItems && stationeryItems.length > 0 ? (
                        stationeryItems.map(item => (
                            <tr key={item.id}>
                                <td data-label="Mã VPP:">{item.id}</td>
                                <td data-label="Tên VPP:" className={styles.itemName} onClick={() => onViewDetails && onViewDetails(item)}>
                                    {item.name}
                                </td>
                                <td data-label="Mô tả:" className={styles.descriptionCell}>{item.description || 'N/A'}</td>
                                <td data-label="Đơn giá:" className={styles.priceCell}>{item.price?.toLocaleString('vi-VN')} VNĐ</td>
                                <td data-label="SL Tồn:" className={styles.stockCell}>{item.stock_quantity}</td>
                                <td data-label="NCC:">{item.supplier_name || item.supplier_id || 'N/A'}</td>
                                {/* <td data-label="Ngày tạo:">{item.created_at ? new Date(item.created_at).toLocaleDateString('vi-VN') : 'N/A'}</td> */}
                                <td data-label="Hành động:" className={styles.actionsCell}>
                                    {onViewDetails && <button onClick={() => onViewDetails(item)} className={`${styles.btnAction} ${styles.btnView}`} title="Xem chi tiết">👁️</button>}
                                    <button onClick={() => onEdit(item)} className={`${styles.btnAction} ${styles.btnEdit}`} title="Sửa">✏️</button>
                                    <button onClick={() => onDelete(item.id)} className={`${styles.btnAction} ${styles.btnDelete}`} title="Xóa">🗑️</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className={styles.noResults}>Không có văn phòng phẩm nào.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default StationeryTable;