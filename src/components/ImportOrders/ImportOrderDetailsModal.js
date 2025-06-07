// src/components/ImportOrders/ImportOrderDetailsModal.js
import React, { useMemo } from 'react';
import styles from './ImportOrderDetailsModal.module.css';
import Select from 'react-select'; // Để cập nhật trạng thái

// importOrderStatusOptions cần được truyền vào hoặc định nghĩa ở đây
// Giả sử nó được truyền vào từ props
// const importOrderStatusOptions = [
//     { value: 'pending_approval', label: 'Chờ duyệt' }, ...
// ];


const ImportOrderDetailsModal = ({ isOpen, onClose, importOrder, onUpdateStatus, importOrderStatusOptions = [] }) => {
   
console.log(importOrder);

    const getStatusLabel = (statusValue) => {
        return importOrderStatusOptions.find(opt => opt.value === statusValue)?.label || statusValue;
    };

    const getStatusColorClass = (statusValue) => {
        switch (statusValue) {
            case 'pending_approval': return styles.statusPending;
            case 'approved': return styles.statusApproved;
            case 'importing': return styles.statusImporting;
            case 'completed': return styles.statusCompleted;
            case 'cancelled': return styles.statusCancelled;
            default: return '';
        }
    };

    const totalQuantity = useMemo(() => {
        return importOrder.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
    }, [importOrder.items]);

    const totalBookQuantity = useMemo(() => {
        return importOrder.items?.filter(item => item.product_type === 'book').reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
    }, [importOrder.items]);

    const totalStationeryQuantity = useMemo(() => {
        return importOrder.items?.filter(item => item.product_type === 'stationery').reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
    }, [importOrder.items]);

    
     if (!isOpen || !importOrder) { // Bây giờ return null ở đây là an toàn
        return null;
    }

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <button onClick={onClose} className={styles.closeButton}>×</button>
                <h3 className={styles.title}>Chi Tiết Đơn Nhập Hàng: {importOrder.id}</h3>

                <div className={styles.detailsGridContainer}>
                    <div className={styles.detailSection}>
                        <h4>Thông Tin Chung</h4>
                        <div className={styles.detailItem}><strong>Nhà cung cấp:</strong> <span>{importOrder.supplier_id.name || importOrder.supplier_id}</span></div>
                        <div className={styles.detailItem}><strong>Ngày tạo đơn:</strong> <span>{new Date(importOrder.import_date || importOrder.created_at).toLocaleString('vi-VN')}</span></div>
                        <div className={styles.detailItem}><strong>Ngày dự kiến nhận:</strong> <span>{importOrder.expected_delivery_date ? new Date(importOrder.expected_delivery_date).toLocaleDateString('vi-VN') : 'N/A'}</span></div>
                        <div className={styles.detailItem}><strong>Người tạo:</strong> <span>{importOrder.created_by.full_name || 'N/A'}</span></div>
                        <div className={styles.detailItem}>
                            <strong>Trạng thái:</strong>
                            {onUpdateStatus && importOrder.status !== 'completed' && importOrder.status !== 'cancelled' ? (
                                <Select
                                    options={importOrderStatusOptions}
                                    value={importOrderStatusOptions.find(opt => opt.value === importOrder.status)}
                                    onChange={(selectedOption) => onUpdateStatus(importOrder.id, selectedOption.value)}
                                    className={`${styles.statusSelectInline} react-select-container-details`} // Thêm class để style riêng
                                    classNamePrefix="react-select-details"
                                    menuPlacement="auto"
                                    styles={{ 
                                        control: (base) => ({ ...base, minHeight: '28px', height: '28px', fontSize: '0.85rem', width: '180px' }),
                                        valueContainer: (base) => ({ ...base, height: '28px', padding: '0 6px' }),
                                        input: (base) => ({ ...base, margin: '0px', padding: '0px'}),
                                        indicatorSeparator: () => ({display: 'none'}),
                                        indicatorsContainer: (base) => ({...base, height: '28px'}),
                                        option: (base) => ({...base, fontSize: '0.85rem', padding: '5px 10px'}),
                                     }}
                                />
                            ) : (
                                <span className={`${styles.statusValue} ${getStatusColorClass(importOrder.status)}`}>
                                    {getStatusLabel(importOrder.status)}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className={styles.detailSection}>
                        <h4>Thống Kê Số Lượng</h4>
                        <div className={styles.detailItem}><strong>Tổng SL Sách:</strong> <span>{totalBookQuantity}</span></div>
                        <div className={styles.detailItem}><strong>Tổng SL VPP:</strong> <span>{totalStationeryQuantity}</span></div>
                        <div className={styles.detailItem}><strong>Tổng SL Sản Phẩm:</strong> <span>{totalQuantity}</span></div>
                        <hr style={{margin: '10px 0', borderStyle: 'dashed'}}/>
                        <div className={styles.detailItem}><strong>Tổng tiền đơn hàng:</strong> <span style={{fontWeight: 'bold', color: '#c82333'}}>{importOrder.total_amount?.toLocaleString('vi-VN')} VNĐ</span></div>
                    </div>
                </div>


                {importOrder.items && importOrder.items.length > 0 && (
                    <div className={styles.detailSection}>
                        <h4>Danh Sách Sản Phẩm Nhập</h4>
                        <div className={styles.itemsTableContainer}>
                            <table className={styles.itemsTable}>
                                <thead>
                                    <tr>
                                        <th>Mã SP</th>
                                        <th>Tên Sản Phẩm</th>
                                        <th className={styles.productTypeCell}>Loại</th>
                                        <th className={styles.numberCell}>Số Lượng</th>
                                        <th className={styles.numberCell}>Đơn Giá Nhập</th>
                                        <th className={styles.numberCell}>Thành Tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {importOrder.items.map((item, index) => (
                                        <tr key={item.product_id + '-' + index}>
                                            <td>{item.product?._id}</td>
                                            <td>
                                                {item.productType === 'Book' 
                                                    ? item.product?.title 
                                                    : item.product?.name || 'N/A'}
                                            </td>
                                            <td className={styles.productTypeCell}>
                                                {item.productType === 'Book' ? 'Sách' : 'Văn phòng phẩm'}
                                            </td>
                                            <td className={styles.numberCell}>{item.quantity}</td>
                                            <td className={styles.numberCell}>{item.price?.toLocaleString('vi-VN')} VNĐ</td>
                                            <td className={styles.numberCell}>{item.total?.toLocaleString('vi-VN')} VNĐ</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {importOrder.notes && (
                    <div className={styles.notesSection}>
                        <strong>Ghi chú đơn hàng:</strong>
                        <p>{importOrder.notes}</p>
                    </div>
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

ImportOrderDetailsModal.defaultProps = {
    importOrderStatusOptions: []
};

export default ImportOrderDetailsModal;