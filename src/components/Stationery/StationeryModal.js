// src/components/Stationery/StationeryModal.js
import React, { useState, useEffect } from 'react';
import Select from 'react-select'; // Nếu bạn cần chọn nhà cung cấp hoặc danh mục VPP
import styles from './StationeryModal.module.css';

// Dữ liệu mẫu cho select (nếu có) - ví dụ Nhà cung cấp
// Bạn sẽ fetch từ API hoặc truyền từ StationeryManagementPage
const sampleSuppliersForStationery = [
    { value: 'S001', label: 'NCC Văn Phòng Phẩm A' },
    { value: 'S002', label: 'NCC Văn Phòng Phẩm B' },
];
// Nếu có danh mục VPP, tương tự
// const sampleStationeryCategories = [ { value: 'SCAT01', label: 'Bút viết'} ];

const StationeryModal = ({ isOpen, onClose, onSubmit, currentStationery, mode, sampleSuppliers }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock_quantity: '',
        supplier_id: null, // Hoặc là object {value, label} nếu dùng react-select
        // created_at sẽ được tạo bởi backend
        // id sẽ được tạo bởi backend khi thêm mới
    });

    useEffect(() => {
        if (isOpen) {
            if (currentStationery && mode === 'edit') {
                setFormData({
                    id: currentStationery.id,
                    name: currentStationery.name || '',
                    description: currentStationery.description || '',
                    price: currentStationery.price || '',
                    stock_quantity: currentStationery.stock_quantity || '',
                    supplier_id: sampleSuppliers?.find(s => s.value === currentStationery.supplier_id) || null,
                    // Map các trường khác nếu có (ví dụ: category)
                });
            } else { // Chế độ thêm mới hoặc không có currentStationery
                setFormData({
                    name: '', description: '', price: '', stock_quantity: '', supplier_id: null,
                });
            }
        }
    }, [isOpen, currentStationery, mode, sampleSuppliers]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSupplierChange = (selectedOption) => {
        setFormData(prev => ({ ...prev, supplier_id: selectedOption }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const dataToSubmit = {
            ...formData,
            // Chỉ gửi supplier_id value nếu dùng react-select
            supplier_id: formData.supplier_id ? formData.supplier_id.value : null,
            // Xử lý các trường select khác tương tự
        };
        // Xóa id nếu không có (chế độ thêm mới không cần id)
        if (mode === 'add') {
            delete dataToSubmit.id;
        }
        onSubmit(dataToSubmit);
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h3 className={styles.title}>{mode === 'add' ? 'Thêm Văn Phòng Phẩm Mới' : 'Chỉnh Sửa Văn Phòng Phẩm'}</h3>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="name">Tên Văn Phòng Phẩm (*):</label>
                        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className={styles.inputField} />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="description">Mô tả:</label>
                        <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows="3" className={styles.textareaField} />
                    </div>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="price">Đơn giá (VNĐ) (*):</label>
                            <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} required min="0" className={styles.inputField} />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="stock_quantity">Số lượng tồn (*):</label>
                            <input type="number" id="stock_quantity" name="stock_quantity" value={formData.stock_quantity} onChange={handleChange} required min="0" className={styles.inputField} />
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="supplier_id">Nhà cung cấp:</label>
                        <Select
                            id="supplier_id"
                            options={sampleSuppliers}
                            value={formData.supplier_id}
                            onChange={handleSupplierChange}
                            placeholder="Chọn nhà cung cấp..."
                            isClearable
                            className="react-select-container"
                            classNamePrefix="react-select"
                        />
                    </div>
                    {/* Thêm các trường khác nếu cần (ví dụ: danh mục VPP) */}
                    <div className={styles.actions}>
                        <button type="submit" className={`${styles.btn} ${styles.btnSubmit}`}>
                            {mode === 'add' ? 'Thêm' : 'Lưu Thay Đổi'}
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

StationeryModal.defaultProps = { // Để tránh lỗi khi prop không được truyền
    sampleSuppliers: []
};

export default StationeryModal;