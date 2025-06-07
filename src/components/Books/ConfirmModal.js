// src/components/Books/ConfirmModal.js
import React from 'react';
import { Modal } from 'antd';

const ConfirmModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title = 'Xác nhận', 
    message = 'Bạn có chắc chắn muốn thực hiện hành động này?',
    confirmText = 'Xác nhận',
    cancelText = 'Hủy'
}) => {
    return (
        <Modal
            title={title}
            open={isOpen}
            onOk={onConfirm}
            onCancel={onClose}
            okText={confirmText}
            cancelText={cancelText}
            okButtonProps={{ danger: true }}
        >
            <p>{message}</p>
        </Modal>
    );
};

export default ConfirmModal;