// src/components/ImportOrders/ImportOrderTable.js
import React from 'react';
import styles from './ImportOrderTable.module.css'; // Tạo file CSS mới
import Select from 'react-select';

// Giả sử bạn có các tùy chọn trạng thái này
const importOrderStatusOptions = [
    { value: 'pending_approval', label: 'Chờ duyệt' },
    { value: 'approved', label: 'Đã duyệt' },
    { value: 'importing', label: 'Đang nhập hàng' },
    { value: 'completed', label: 'Hoàn thành' },
    { value: 'cancelled', label: 'Đã hủy' },
];


const ImportOrderTable = ({ importOrders, onEdit, onDelete, onViewDetails, onUpdateStatus }) => {

    const getStatusLabel = (statusValue) => {
        return importOrderStatusOptions.find(opt => opt.value === statusValue)?.label || statusValue;
    };
    const getStatusColorClass = (statusValue) => {
        // Tương tự getStatusColor trong OrderTable, nhưng cho trạng thái đơn nhập
        switch (statusValue) {
            case 'pending_approval': return styles.statusPending;
            case 'approved': return styles.statusApproved;
            case 'importing': return styles.statusImporting;
            case 'completed': return styles.statusCompleted;
            case 'cancelled': return styles.statusCancelled;
            default: return '';
        }
    };


    return (
        <div className={styles.tableContainer}>
            <table className={styles.importOrderTable}>
                <thead>
                    <tr>
                        <th>Mã ĐNH</th>
                        <th>Nhà Cung Cấp</th>
                        <th>Ngày Tạo</th>
                        <th>Ngày Dự Kiến Nhận</th>
                        <th>Tổng Tiền</th>
                        <th>Trạng Thái</th>
                        {/* <th>Người Tạo</th> */}
                        <th>Hành Động</th>
                    </tr>
                </thead>
                <tbody>
                    {importOrders && importOrders.length > 0 ? (
                        importOrders.map(order => (
                            <tr key={order.id}>
                                <td data-label="Mã ĐNH:" className={styles.orderIdCell} onClick={() => onViewDetails && onViewDetails(order)}>
                                    {order.id}
                                </td>
                                <td data-label="NCC:">{order.supplier_name || order.supplier_id}</td>
                                <td data-label="Ngày Tạo:">{new Date(order.import_date || order.created_at).toLocaleDateString('vi-VN')}</td>
                                <td data-label="Ngày Nhận (DK):">
                                    {order.expected_delivery_date ? new Date(order.expected_delivery_date).toLocaleDateString('vi-VN') : 'N/A'}
                                </td>
                                <td data-label="Tổng Tiền:" className={styles.amountCell}>
                                    {order.total_amount?.toLocaleString('vi-VN')} VNĐ
                                </td>
                                <td data-label="Trạng Thái:" className={styles.statusCell}>
                                     {onUpdateStatus && (order.status !== 'completed' && order.status !== 'cancelled') ? (
                                        <Select
                                            options={importOrderStatusOptions}
                                            value={importOrderStatusOptions.find(opt => opt.value === order.status)}
                                            onChange={(selectedOption) => onUpdateStatus(order.id, selectedOption.value)}
                                            className={`${styles.statusSelect} react-select-container-table`}
                                            classNamePrefix="react-select-table"
                                            menuPlacement="auto"
                                            styles={{control: (base) => ({
                                                    ...base,
                                                    minHeight: '30px',
                                                    height: '30px',
                                                    fontSize: '0.85rem',
                                                }),
                                                valueContainer: (base) => ({
                                                    ...base,
                                                    height: '30px',
                                                    padding: '0 6px'
                                                }),
                                                input: (base) => ({
                                                    ...base,
                                                    margin: '0px',
                                                }),
                                                indicatorSeparator: () => ({
                                                    display: 'none',
                                                }),
                                                indicatorsContainer: (base) => ({
                                                    ...base,
                                                    height: '30px',
                                                }),
                                                option: (base, state) => ({
                                                    ...base,
                                                    fontSize: '0.85rem',
                                                    padding: '6px 10px',
                                                    backgroundColor: state.isSelected ? '#007bff' : (state.isFocused ? '#e9ecef' : base.backgroundColor),
                                                    color: state.isSelected ? 'white' : base.color,
                                                }),
                                                singleValue: (base) => ({ // Style cho text trạng thái hiển thị
                                                    ...base,
                                                    color: '#333' // Hoặc màu dựa trên getStatusColor(order.status) nếu muốn
                                                }) }}
                                        />
                                    ) : (
                                        <span className={`${styles.statusBadge} ${getStatusColorClass(order.status)}`}>
                                            {getStatusLabel(order.status)}
                                        </span>
                                    )}
                                </td>
                                {/* <td data-label="Người Tạo:">{order.created_by || 'N/A'}</td> */}
                                <td data-label="Hành Động:" className={styles.actionsCell}>
                                    {onViewDetails && <button onClick={() => onViewDetails(order)} className={`${styles.btnAction} ${styles.btnView}`} title="Xem chi tiết">👁️</button>}
                                    {/* Chỉ cho sửa khi chưa hoàn thành hoặc hủy */}
                                    {onEdit && order.status !== 'completed' && order.status !== 'cancelled' && (
                                        <button onClick={() => onEdit(order)} className={`${styles.btnAction} ${styles.btnEdit}`} title="Sửa ĐNH">✏️</button>
                                    )}
                                    {onDelete && order.status !== 'completed' && order.status !== 'cancelled' && (
                                        <button onClick={() => onDelete(order.id)} className={`${styles.btnAction} ${styles.btnDelete}`} title="Hủy ĐNH">🗑️</button>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className={styles.noResults}>Không có đơn nhập hàng nào.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ImportOrderTable;