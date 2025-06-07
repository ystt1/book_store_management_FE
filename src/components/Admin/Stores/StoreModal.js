// src/components/Admin/Stores/StoreModal.js
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import styles from './StoreModal.module.css'; // Tạo file CSS này

const StoreModal = ({ isOpen, onClose, onSubmit, currentStore, mode, managerOptions }) => {
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        email: '',
        manager_id: null, // Sẽ là object {value, label} cho Select
        is_active: true,
    });

    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && currentStore) {
                setFormData({
                    id: currentStore._id || currentStore.id,
                    name: currentStore.name || '',
                    address: currentStore.address || '',
                    phone: currentStore.phone || '',
                    email: currentStore.email || '',
                    manager_id: currentStore.manager_id
                        ? managerOptions.find(m => m.value === (currentStore.manager_id._id || currentStore.manager_id)) || null
                        : null,
                    is_active: currentStore.is_active !== undefined ? currentStore.is_active : true,
                });
            } else { // Add mode
                setFormData({
                    name: '', address: '', phone: '', email: '', manager_id: null, is_active: true,
                });
            }
        }
    }, [isOpen, currentStore, mode, managerOptions]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleManagerChange = (selectedOption) => {
        setFormData(prev => ({ ...prev, manager_id: selectedOption }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const dataToSubmit = {
            ...formData,
            manager_id: formData.manager_id ? formData.manager_id.value : null, // Gửi ID của manager
        };
        // Không cần gửi ID khi thêm mới, API tự tạo
        if (mode === 'add' && dataToSubmit.hasOwnProperty('id')) {
            delete dataToSubmit.id;
        }
        onSubmit(dataToSubmit);
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h3 className={styles.title}>{mode === 'add' ? 'Thêm Cửa Hàng Mới' : 'Chỉnh Sửa Thông Tin Cửa Hàng'}</h3>
                <form onSubmit={handleSubmit} className={styles.storeForm}>
                    <div className={styles.formGroup}>
                        <label htmlFor="name">Tên Cửa Hàng (*):</label>
                        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className={styles.inputField} />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="address">Địa Chỉ (*):</label>
                        <input type="text" id="address" name="address" value={formData.address} onChange={handleChange} required className={styles.inputField} />
                    </div>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="phone">Số Điện Thoại:</label>
                            <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} className={styles.inputField} />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="email">Email:</label>
                            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className={styles.inputField} />
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="manager_id">Người Quản Lý:</label>
                        <Select
                            id="manager_id"
                            options={managerOptions}
                            value={formData.manager_id}
                            onChange={handleManagerChange}
                            placeholder="Chọn người quản lý..."
                            isClearable
                            className="react-select-container"
                            classNamePrefix="react-select"
                        />
                    </div>
                    <div className={styles.formGroupCheckbox}>
                        <input type="checkbox" id="is_active" name="is_active" checked={formData.is_active} onChange={handleChange} className={styles.checkboxInput}/>
                        <label htmlFor="is_active" className={styles.checkboxLabel}>Đang hoạt động</label>
                    </div>

                    <div className={styles.actions}>
                        <button type="submit" className={`${styles.btn} ${styles.btnSubmit}`}>
                            {mode === 'add' ? 'Thêm Cửa Hàng' : 'Lưu Thay Đổi'}
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

StoreModal.defaultProps = {
    managerOptions: []
};

export default StoreModal;