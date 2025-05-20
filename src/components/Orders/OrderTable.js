// src/components/Orders/OrderTable.js
import React from 'react';
import styles from './OrderTable.module.css';
import Select from 'react-select'; // Dùng để thay đổi trạng thái nhanh

const OrderTable = ({
    orders,
    onViewDetails,
    onEditOrder,
    onDeleteOrder,
    onUpdateStatus,
    orderStatusOptions // Mảng các tùy chọn trạng thái
}) => {

    const getStatusLabel = (statusValue) => {
        const option = orderStatusOptions.find(opt => opt.value === statusValue);
        return option ? option.label : statusValue;
    };

    const getStatusColor = (statusValue) => {
        // Trả về class màu dựa trên trạng thái
        switch (statusValue) {
            case 'pending': return styles.statusPending;
            case 'processing': return styles.statusProcessing;
            case 'shipped': return styles.statusShipped;
            case 'completed': return styles.statusCompleted;
            case 'cancelled': return styles.statusCancelled;
            case 'refunded': return styles.statusRefunded;
            default: return '';
        }
    };


    return (
        <div className={styles.tableContainer}>
            <table className={styles.orderTable}>
                <thead>
                    <tr>
                        <th>Mã ĐH</th>
                        <th>Khách Hàng</th>
                        <th>Ngày Tạo</th>
                        <th>Tổng Tiền</th>
                        <th>Trạng Thái</th>
                        <th>Người Tạo</th>
                        <th>Hành Động</th>
                    </tr>
                </thead>
                <tbody>
                    {orders && orders.length > 0 ? (
                        orders.map(order => (
                            <tr key={order.id}>
                                <td data-label="Mã ĐH:" className={styles.orderIdCell} onClick={() => onViewDetails(order)}>
                                    {order.id}
                                </td>
                                <td data-label="Khách Hàng:">{order.customer_name || 'N/A'}</td>
                                <td data-label="Ngày Tạo:">
                                    {new Date(order.order_date).toLocaleDateString('vi-VN')} <br/>
                                    <span className={styles.timePart}>{new Date(order.order_date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit'})}</span>
                                </td>
                                <td data-label="Tổng Tiền:" className={styles.amountCell}>
                                    {order.total_amount?.toLocaleString('vi-VN')} VNĐ
                                </td>
                                <td data-label="Trạng Thái:" className={styles.statusCell}>
                                    {/* Tùy chọn: Hiển thị Select để đổi nhanh trạng thái */}
                                    {onUpdateStatus ? (
                                        <Select
                                            options={orderStatusOptions}
                                            value={orderStatusOptions.find(opt => opt.value === order.status)}
                                            onChange={(selectedOption) => onUpdateStatus(order.id, selectedOption.value)}
                                            className={`${styles.statusSelect} react-select-container-table`}
                                            classNamePrefix="react-select-table"
                                            menuPlacement="auto" // Để menu không bị cắt
                                            styles={{ // Custom style cho Select nhỏ hơn
                                                control: (base) => ({
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
                                                })
                                            }}
                                        />
                                    ) : (
                                        <span className={`${styles.statusBadge} ${getStatusColor(order.status)}`}>
                                            {getStatusLabel(order.status)}
                                        </span>
                                    )}
                                </td>
                                <td data-label="Người Tạo:">{order.created_by || 'N/A'}</td>
                                <td data-label="Hành Động:" className={styles.actionsCell}>
                                    <button onClick={() => onViewDetails(order)} className={`${styles.btnAction} ${styles.btnView}`} title="Xem chi tiết">👁️</button>
                                    {/* Chỉ cho phép sửa đơn hàng ở một số trạng thái nhất định, ví dụ 'pending' */}
                                    {(order.status === 'pending' || order.status === 'processing') && onEditOrder && (
                                        <button onClick={() => onEditOrder(order)} className={`${styles.btnAction} ${styles.btnEdit}`} title="Sửa đơn hàng">✏️</button>
                                    )}
                                    {/* Chỉ cho phép xóa/hủy đơn hàng ở một số trạng thái */}
                                    {(order.status === 'pending' || order.status === 'processing') && onDeleteOrder && (
                                        <button onClick={() => onDeleteOrder(order.id)} className={`${styles.btnAction} ${styles.btnDelete}`} title="Hủy/Xóa đơn hàng">🗑️</button>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className={styles.noResults}>Không có đơn hàng nào.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default OrderTable;