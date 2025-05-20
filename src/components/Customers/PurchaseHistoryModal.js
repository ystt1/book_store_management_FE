// src/components/Customers/PurchaseHistoryModal.js
import React from 'react';
import styles from './PurchaseHistoryModal.module.css';

const PurchaseHistoryModal = ({ isOpen, onClose, customerName, history }) => {
    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <button onClick={onClose} className={styles.closeButton}>×</button>
                <h3 className={styles.title}>Lịch sử mua hàng của {customerName}</h3>
                {history && history.length > 0 ? (
                    <div className={styles.historyTableContainer}>
                        <table className={styles.historyTable}>
                            <thead>
                                <tr>
                                    <th>Mã ĐH</th>
                                    <th>Ngày Mua</th>
                                    <th>Sản phẩm</th> {/* Có thể chi tiết hơn */}
                                    <th>Số lượng</th>
                                    <th>Đơn giá</th>
                                    <th>Tổng tiền</th>
                                    <th>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map(order => (
                                    <tr key={order.id}>
                                        <td>{order.id}</td>
                                        <td>{new Date(order.order_date).toLocaleDateString('vi-VN')}</td>
                                        <td>
                                            {/* Giả sử order.items là mảng các sản phẩm trong đơn */}
                                            {order.items?.map(item => item.name).join(', ') || 'N/A'}
                                        </td>
                                        <td className={styles.centerText}>{order.total_quantity || order.items?.reduce((sum, i) => sum + i.quantity, 0) || 'N/A'}</td>
                                        <td className={styles.rightText}>{order.unit_price_display || 'N/A'}</td>
                                        <td className={styles.rightTextBold}>{order.total_amount?.toLocaleString('vi-VN')} VNĐ</td>
                                        <td>{order.status || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className={styles.noHistory}>Chưa có lịch sử mua hàng.</p>
                )}
                <div className={styles.actions}>
                    <button onClick={onClose} className={`${styles.btn} ${styles.btnSecondary}`}>
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PurchaseHistoryModal;