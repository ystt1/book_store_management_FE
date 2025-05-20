// src/components/Customers/CustomerModal.js
import React, { useState, useEffect } from 'react';
import styles from './CustomerModal.module.css';

const CustomerModal = ({ isOpen, onClose, onSubmit, currentCustomer, mode }) => {
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        email: '',
        address: '',
        note: '',
        store_id: 'STORE001' // Giả sử có store_id mặc định hoặc lấy từ context/config
    });

    useEffect(() => {
        if (isOpen && currentCustomer && mode === 'edit') {
            setFormData({
                full_name: currentCustomer.full_name || '',
                phone: currentCustomer.phone || '',
                email: currentCustomer.email || '',
                address: currentCustomer.address || '',
                note: currentCustomer.note || '',
                store_id: currentCustomer.store_id || 'STORE001', // Giữ store_id nếu có
                id: currentCustomer.id // Giữ id để biết là sửa
            });
        } else if (isOpen && mode === 'add') {
            setFormData({ // Reset form cho chế độ thêm
                full_name: '', phone: '', email: '', address: '', note: '',
                store_id: 'STORE001'
            });
        }
    }, [isOpen, currentCustomer, mode]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData); // Truyền toàn bộ formData
        // onClose(); // Đóng modal sau khi submit (có thể do component cha xử lý)
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h3 className={styles.title}>{mode === 'add' ? 'Thêm Khách Hàng Mới' : 'Chỉnh Sửa Thông Tin Khách Hàng'}</h3>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="full_name">Họ và Tên (*):</label>
                        <input type="text" id="full_name" name="full_name" value={formData.full_name} onChange={handleChange} required className={styles.inputField} />
                    </div>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="phone">Số điện thoại (*):</label>
                            <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} required className={styles.inputField} />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="email">Email:</label>
                            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className={styles.inputField} />
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="address">Địa chỉ:</label>
                        <textarea id="address" name="address" value={formData.address} onChange={handleChange} rows="3" className={styles.textareaField} />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="note">Ghi chú:</label>
                        <textarea id="note" name="note" value={formData.note} onChange={handleChange} rows="2" className={styles.textareaField} />
                    </div>
                    {/* Trường store_id có thể ẩn hoặc là dropdown nếu có nhiều store */}
                    {/* <input type="hidden" name="store_id" value={formData.store_id} /> */}

                    <div className={styles.actions}>
                        <button type="submit" className={`${styles.btn} ${styles.btnSubmit}`}>
                            {mode === 'add' ? 'Thêm Khách Hàng' : 'Lưu Thay Đổi'}
                        </button>
                        <button type="button" onClick={onClose} className={`${styles.btn} ${styles.btnCancel}`}>
                            Hủy
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CustomerModal;