// src/components/Customers/PurchaseHistoryModal.js
import React from 'react';
import { Modal, Table, Tag } from 'antd';
import styles from './PurchaseHistoryModal.module.css';

const PurchaseHistoryModal = ({ isOpen, onClose, customerName, history, currentPage, totalPages, onPageChange }) => {
    const columns = [
        {
            title: 'Ngày đặt',
            dataIndex: 'date',
            key: 'date',
            render: (date) => new Date(date).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            })
        },
        {
            title: 'Sản phẩm',
            dataIndex: 'products',
            key: 'products',
            width: '30%'
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'total_amount',
            key: 'total_amount',
            align: 'right',
            render: (amount) => `${amount?.toLocaleString('vi-VN')} VNĐ`
        },
        {
            title: 'Trạng thái đơn hàng',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = 'blue';
                let text = status;
                switch (status) {
                    case 'completed':
                        color = 'green';
                        text = 'Hoàn thành';
                        break;
                    case 'processing':
                        color = 'blue';
                        text = 'Đang xử lý';
                        break;
                    case 'cancelled':
                        color = 'red';
                        text = 'Đã hủy';
                        break;
                    default:
                        color = 'default';
                }
                return <Tag color={color}>{text}</Tag>;
            }
        },
        {
            title: 'Trạng thái thanh toán',
            dataIndex: 'payment_status',
            key: 'payment_status',
            render: (status) => {
                let color = 'blue';
                let text = status;
                switch (status) {
                    case 'paid':
                        color = 'green';
                        text = 'Đã thanh toán';
                        break;
                    case 'pending':
                        color = 'orange';
                        text = 'Chờ thanh toán';
                        break;
                    case 'refunded':
                        color = 'red';
                        text = 'Đã hoàn tiền';
                        break;
                    default:
                        color = 'default';
                }
                return <Tag color={color}>{text}</Tag>;
            }
        },
        {
            title: 'Phương thức thanh toán',
            dataIndex: 'payment_method',
            key: 'payment_method',
            render: (method) => {
                let text = method;
                switch (method) {
                    case 'cash':
                        text = 'Tiền mặt';
                        break;
                    case 'bank_transfer':
                        text = 'Chuyển khoản';
                        break;
                    case 'momo':
                        text = 'Ví MoMo';
                        break;
                    default:
                        text = method;
                }
                return text;
            }
        }
    ];

    return (
        <Modal
            title={`Lịch sử mua hàng của ${customerName}`}
            open={isOpen}
            onCancel={onClose}
            width={1000}
            footer={null}
        >
            <Table
                columns={columns}
                dataSource={history}
                rowKey="id"
                pagination={{
                    current: currentPage,
                    total: totalPages * 10,
                    onChange: onPageChange
                }}
            />
        </Modal>
    );
};

export default PurchaseHistoryModal;