// src/components/Attributes/AttributeModal.js
import React, { useState, useEffect } from 'react';
import styles from './AttributeModal.module.css';

const AttributeModal = ({ isOpen, onClose, onSubmit, currentData, mode, attributeType }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState(''); // Dùng cho Category

    useEffect(() => {
        if (isOpen && currentData) {
            setName(currentData.name || '');
            if (attributeType === 'category') {
                setDescription(currentData.description || '');
            }
        } else if (isOpen && !currentData) { // Chế độ thêm mới
            setName('');
            setDescription('');
        }
    }, [isOpen, currentData, attributeType]);

    if (!isOpen) return null;

    const getTitle = () => {
        const action = mode === 'add' ? 'Thêm mới' : 'Chỉnh sửa';
        switch (attributeType) {
            case 'supplier': return `${action} Nhà Cung Cấp`;
            case 'publisher': return `${action} Nhà Xuất Bản`;
            case 'category': return `${action} Danh Mục Sách`;
            default: return `${action} Thuộc Tính`;
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const dataToSubmit = { name };
        if (mode === 'edit' && currentData) {
            dataToSubmit.id = currentData.id;
        }
        if (attributeType === 'category') {
            dataToSubmit.description = description;
        }
        onSubmit(dataToSubmit, attributeType);
        onClose(); // Tự đóng modal sau khi submit
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h3 className={styles.title}>{getTitle()}</h3>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="attributeName">Tên {attributeType === 'category' ? 'Danh Mục' : (attributeType === 'supplier' ? 'Nhà Cung Cấp' : 'Nhà Xuất Bản')} (*):</label>
                        <input
                            type="text"
                            id="attributeName"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className={styles.inputField}
                        />
                    </div>
                    {attributeType === 'category' && (
                        <div className={styles.formGroup}>
                            <label htmlFor="attributeDescription">Mô tả (cho Danh mục):</label>
                            <textarea
                                id="attributeDescription"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows="3"
                                className={styles.textareaField}
                            />
                        </div>
                    )}
                    <div className={styles.actions}>
                        <button type="submit" className={`${styles.btn} ${styles.btnSubmit}`}>
                            {mode === 'add' ? 'Thêm' : 'Lưu'}
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

export default AttributeModal;