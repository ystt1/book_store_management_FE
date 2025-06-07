// src/components/Customers/CustomerTable.js
import React from 'react';
import { Table, Space, Button, Tooltip } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import styles from './CustomerTable.module.css';

const CustomerTable = ({ customers, onEdit, onDelete, onViewHistory, pagination }) => {
    const columns = [
        {
            title: 'ID Khách Hàng',
            dataIndex: '_id',
            key: '_id',
            width: 120,
        },
        {
            title: 'Họ và Tên',
            dataIndex: 'full_name',
            key: 'full_name',
            render: (text, record) => (
                <span 
                    className={styles.customerName}
                    onClick={() => onViewHistory(record)}
                >
                    {text}
                </span>
            ),
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            key: 'phone',
            width: 120,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            render: (text) => text || 'N/A',
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            key: 'address',
            ellipsis: {
                showTitle: false,
            },
            render: (address) => (
                <Tooltip placement="topLeft" title={address || 'N/A'}>
                    {address || 'N/A'}
                </Tooltip>
            ),
        },
        {
            title: 'Tổng chi tiêu',
            dataIndex: 'totalSpent',
            key: 'totalSpent',
            align: 'right',
            sorter: true,
            render: (value) => `${(value || 0).toLocaleString('vi-VN')} VNĐ`,
        },
        {
            title: 'Số đơn hàng',
            dataIndex: 'orderCount',
            key: 'orderCount',
            align: 'right',
            sorter: true,
            render: (value) => value || 0,
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 150,
            fixed: 'right',
            render: (_, record) => (
                <Space size="small" className={styles.actionsCell}>
                    <Tooltip title="Xem lịch sử">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            className={`${styles.btnAction} ${styles.btnView}`}
                            onClick={() => onViewHistory(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            className={`${styles.btnAction} ${styles.btnEdit}`}
                            onClick={() => onEdit('edit', record)}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            className={`${styles.btnAction} ${styles.btnDelete}`}
                            onClick={() => onDelete(record._id)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className={styles.tableContainer}>
            <Table
                columns={columns}
                dataSource={customers}
                rowKey={(record) => record._id}
                pagination={pagination}
                scroll={{ x: 1200 }}
            />
        </div>
    );
};

export default CustomerTable;