// src/components/Attributes/AttributeModal.js
import React, { useState, useEffect } from 'react';
import styles from './AttributeModal.module.css';

const AttributeModal = ({ isOpen, onClose, onSubmit, currentData, mode, attributeType }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        contact_info: {
            phone: '',
            email: '',
            address: ''
        }
    });

    useEffect(() => {
        if (isOpen && currentData) {
            setFormData({
                name: currentData.name || '',
                description: currentData.description || '',
                contact_info: {
                    phone: currentData.contact_info?.phone || '',
                    email: currentData.contact_info?.email || '',
                    address: currentData.contact_info?.address || ''
                }
            });
        } else if (isOpen && !currentData) {
            setFormData({
                name: '',
                description: '',
                contact_info: {
                    phone: '',
                    email: '',
                    address: ''
                }
            });
        }
    }, [isOpen, currentData]);

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
        const dataToSubmit = {
            name: formData.name,
            ...(attributeType === 'category' && { description: formData.description }),
            ...(attributeType !== 'category' && {
                contact_info: {
                    phone: formData.contact_info.phone,
                    email: formData.contact_info.email,
                    address: formData.contact_info.address
                }
            })
        };
        onSubmit(dataToSubmit);
    };

    const handleChange = (field, value) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h3 className={styles.title}>{getTitle()}</h3>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="name">Tên {attributeType === 'category' ? 'Danh Mục' : (attributeType === 'supplier' ? 'Nhà Cung Cấp' : 'Nhà Xuất Bản')} (*):</label>
                        <input
                            type="text"
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            required
                            className={styles.inputField}
                        />
                    </div>

                    {attributeType === 'category' ? (
                        <div className={styles.formGroup}>
                            <label htmlFor="description">Mô tả:</label>
                            <textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                rows="3"
                                className={styles.textareaField}
                            />
                        </div>
                    ) : (
                        <>
                            <div className={styles.formGroup}>
                                <label htmlFor="phone">Số điện thoại:</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    value={formData.contact_info.phone}
                                    onChange={(e) => handleChange('contact_info.phone', e.target.value)}
                                    className={styles.inputField}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="email">Email:</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={formData.contact_info.email}
                                    onChange={(e) => handleChange('contact_info.email', e.target.value)}
                                    className={styles.inputField}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="address">Địa chỉ:</label>
                                <textarea
                                    id="address"
                                    value={formData.contact_info.address}
                                    onChange={(e) => handleChange('contact_info.address', e.target.value)}
                                    rows="2"
                                    className={styles.textareaField}
                                />
                            </div>
                        </>
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