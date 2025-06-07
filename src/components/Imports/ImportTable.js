import React, { useState } from 'react';
import styles from './ImportTable.module.css';
import { FaEye, FaTrash } from 'react-icons/fa';
import { Select } from 'antd';

const { Option } = Select;

const ImportTable = ({
    imports,
    onViewDetails,
    onDeleteImport,
    onUpdateStatus,
    importStatusOptions
}) => {
    const [expandedImportId, setExpandedImportId] = useState(null);

    const getStatusLabel = (status) => {
        const statusOption = importStatusOptions.find(option => option.value === status);
        return statusOption ? statusOption.label : status;
    };

    const getStatusColor = (status) => {
        const statusColors = {
            pending: '#ffa500',
            processing: '#1890ff',
            completed: '#52c41a',
            cancelled: '#ff4d4f',
            refunded: '#722ed1'
        };
        return statusColors[status] || '#666';
    };

    const toggleImportDetails = (importId) => {
        setExpandedImportId(expandedImportId === importId ? null : importId);
    };

    const renderImportDetails = (importOrder) => {
        return (
            <div className={styles.importDetails}>
                <h4>Chi tiết đơn nhập hàng</h4>
                <div className={styles.detailsGrid}>
                    <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Nhà cung cấp:</span>
                        <span className={styles.detailValue}>{importOrder.supplier?.name || 'N/A'}</span>
                    </div>
                    <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Số điện thoại:</span>
                        <span className={styles.detailValue}>{importOrder.supplier?.phone || 'N/A'}</span>
                    </div>
                    <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Người tạo:</span>
                        <span className={styles.detailValue}>{importOrder.created_by_name || 'N/A'}</span>
                    </div>
                    <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Thời gian tạo:</span>
                        <span className={styles.detailValue}>
                            {new Date(importOrder.created_at).toLocaleString('vi-VN')}
                        </span>
                    </div>
                </div>

                <div className={styles.itemsTable}>
                    <h4>Danh sách sản phẩm</h4>
                    <table>
                        <thead>
                            <tr>
                                <th>Sản phẩm</th>
                                <th>Loại</th>
                                <th>Số lượng</th>
                                <th>Đơn giá</th>
                                <th>Giảm giá</th>
                                <th>Thuế</th>
                                <th>Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            {importOrder.items.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.product_name}</td>
                                    <td>{item.product_type === 'book' ? 'Sách' : 'Văn phòng phẩm'}</td>
                                    <td>{item.quantity}</td>
                                    <td>{item.price.toLocaleString('vi-VN')}đ</td>
                                    <td>{item.discount}%</td>
                                    <td>{item.tax}%</td>
                                    <td>{item.total.toLocaleString('vi-VN')}đ</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className={styles.tableContainer}>
            <table className={styles.importTable}>
                <thead>
                    <tr>
                        <th>Mã đơn</th>
                        <th>Nhà cung cấp</th>
                        <th>Ngày nhập</th>
                        <th>Tổng tiền</th>
                        <th>Trạng thái</th>
                        <th>Người tạo</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {imports.map((importOrder) => (
                        <React.Fragment key={importOrder._id}>
                            <tr 
                                className={expandedImportId === importOrder._id ? styles.expandedRow : ''}
                                onClick={() => toggleImportDetails(importOrder._id)}
                            >
                                <td>{importOrder._id}</td>
                                <td>{importOrder.supplier?.name || importOrder.supplier_name || 'N/A'}</td>
                                <td>{new Date(importOrder.import_date).toLocaleDateString('vi-VN')}</td>
                                <td>{importOrder.total_amount.toLocaleString('vi-VN')}đ</td>
                                <td>
                                    <Select
                                        value={importOrder.status}
                                        onChange={(value) => onUpdateStatus(importOrder._id, value)}
                                        style={{ width: 150 }}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {importStatusOptions.map(option => (
                                            <Option key={option.value} value={option.value}>
                                                {option.label}
                                            </Option>
                                        ))}
                                    </Select>
                                </td>
                                <td>{importOrder.created_by_name || 'N/A'}</td>
                                <td>
                                    <div className={styles.actionButtons}>
                                        <button
                                            className={styles.viewButton}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onViewDetails(importOrder);
                                            }}
                                            title="Xem chi tiết"
                                        >
                                            <FaEye />
                                        </button>
                                        <button
                                            className={styles.deleteButton}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteImport(importOrder._id);
                                            }}
                                            title="Hủy đơn"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            {expandedImportId === importOrder._id && (
                                <tr>
                                    <td colSpan="7">
                                        {renderImportDetails(importOrder)}
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ImportTable; 