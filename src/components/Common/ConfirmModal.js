// src/components/Common/ConfirmModal.js
import React from 'react';
import styles from './ConfirmModal.module.css';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h3 className={styles.title}>{title || 'Xác nhận'}</h3>
                <p className={styles.message}>{message || 'Bạn có chắc chắn muốn thực hiện hành động này?'}</p>
                <div className={styles.actions}>
                    <button onClick={onConfirm} className={`${styles.btn} ${styles.btnConfirm}`}>
                        Xác nhận
                    </button>
                    <button onClick={onClose} className={`${styles.btn} ${styles.btnCancel}`}>
                        Hủy
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;