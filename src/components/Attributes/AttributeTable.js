// src/components/Attributes/AttributeTable.js
import React from 'react';
import styles from './AttributeTable.module.css';
// Import Ant Design components
import {
    Table, Button, Space, Tag, Tooltip, Typography
} from 'antd';
// Import Ant Design Icons
import {
    EditOutlined, DeleteOutlined
} from '@ant-design/icons';

const { Text } = Typography;

const AttributeTable = ({ data, attributeType, onEdit, onDelete }) => {
    const getAttributeNameLabel = () => {
        switch (attributeType) {
            case 'supplier': return 'Nhà Cung Cấp';
            case 'publisher': return 'Nhà Xuất Bản';
            case 'category': return 'Danh Mục';
            default: return 'Tên';
        }
    };

    // Define columns for Ant Design Table
    const columns = [
        {
            title: 'STT',
            key: 'stt',
            render: (text, record, index) => index + 1,
            width: 60,
        },
        {
            title: getAttributeNameLabel(),
            dataIndex: 'name',
            key: 'name',
            render: (text) => <Tooltip title={text}><Text ellipsis={{ tooltip: text }}>{text || '-'}</Text></Tooltip>,
            width: 200,
        },
    ];

    // Add specific columns based on attribute type
    if (attributeType !== 'category') {
        columns.push(
            {
                title: 'Số Điện Thoại',
                dataIndex: ['contact_info', 'phone'],
                key: 'phone',
                render: (phone) => phone || '-',
                width: 150,
            },
            {
                title: 'Email',
                dataIndex: ['contact_info', 'email'],
                key: 'email',
                render: (email) => email || '-',
                width: 200,
            },
            {
                title: 'Địa Chỉ',
                dataIndex: ['contact_info', 'address'],
                key: 'address',
                render: (address) => <Tooltip title={address}><Text ellipsis={{ tooltip: address }}>{address || '-'}</Text></Tooltip>,
                width: 300,
            }
        );
    } else {
        columns.push({
            title: 'Mô Tả',
            dataIndex: 'description',
            key: 'description',
            render: (description) => <Tooltip title={description}><Text ellipsis={{ tooltip: description }}>{description || '-'}</Text></Tooltip>,
            width: 400,
        });
    }

    // Add Action column
    columns.push({
        title: 'Thao Tác',
        key: 'action',
        render: (_, record) => (
            <Space size="small">
                <Tooltip title="Chỉnh sửa">
                    <Button 
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => onEdit('edit', record)}
                    />
                </Tooltip>
                <Tooltip title="Xóa">
                    <Button 
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => onDelete(record._id || record.id, record.name)}
                    />
                </Tooltip>
            </Space>
        ),
        width: 120,
    });

    return (
        <div className={styles.tableContainer}>
            <Table
                columns={columns}
                dataSource={data}
                rowKey="_id"
                pagination={false}
                scroll={{ x: 'max-content' }}
            />
        </div>
    );
};

export default AttributeTable;