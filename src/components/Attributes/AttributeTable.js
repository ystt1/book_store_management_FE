// src/components/Attributes/AttributeTable.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AttributeTable.module.css';

const AttributeTable = ({ data, attributeType, onEdit, onDelete }) => {
    const navigate = useNavigate();

    const handleRowClick = (item) => {
        // ... (logic giữ nguyên) ...
    };

    const getAttributeNameLabel = () => { /* ... giữ nguyên ... */ };

    return (
        <div className={styles.tableContainer}>
            <table className={styles.attributeTable}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tên {getAttributeNameLabel()}</th>
                        {attributeType === 'category' && <th>Mô tả</th>}
                        <th>Số lượng sách <span className={styles.smallText}>(liên kết)</span></th> {/* Sửa lại */}
                        <th>Tổng SL Bán <span className={styles.smallText}>(từ sách)</span></th> {/* Sửa lại */}
                        <th>Tổng SL Tồn <span className={styles.smallText}>(từ sách)</span></th> {/* Sửa lại */}
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {data && data.length > 0 ? (
                        data.map(item => (
                            <tr key={item.id} className={styles.tableRow}>
                                <td data-label="ID:" onClick={() => handleRowClick(item)} className={styles.clickableCell}>{item.id}</td>
                                <td data-label={`Tên ${getAttributeNameLabel()}:`} onClick={() => handleRowClick(item)} className={styles.clickableCell}>{item.name}</td>
                                {attributeType === 'category' && <td data-label="Mô tả:">{item.description || 'N/A'}</td>}
                                <td data-label="SL Sách:" onClick={() => handleRowClick(item)} className={styles.clickableCell}>{item.bookCount != null ? item.bookCount : 'N/A'}</td>
                                <td data-label="Tổng Bán:" onClick={() => handleRowClick(item)} className={styles.clickableCell}>{item.totalSold != null ? item.totalSold : 'N/A'}</td>
                                <td data-label="Tổng Tồn:" onClick={() => handleRowClick(item)} className={styles.clickableCell}>{item.totalStock != null ? item.totalStock : 'N/A'}</td>
                                <td data-label="Hành động:" className={styles.actionsCell}>
                                    <button onClick={() => onEdit(item)} className={`${styles.btnAction} ${styles.btnEdit}`} title="Sửa">✏️</button>
                                    <button onClick={() => onDelete(item.id, attributeType)} className={`${styles.btnAction} ${styles.btnDelete}`} title="Xóa">🗑️</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={attributeType === 'category' ? 7 : 6} className={styles.noResults}> {/* Cập nhật colSpan */}
                                Không có dữ liệu {getAttributeNameLabel().toLowerCase()}.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default AttributeTable;