// src/components/Stationery/StationeryTable.js
import React, { useMemo } from 'react';
import { Table, Space, Button, Tooltip, Tag, Typography } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import styles from './StationeryTable.module.css';

const { Text } = Typography;

const StationeryTable = ({ stationeryItems, onEdit, onDelete, onViewDetails, loading, pagination }) => {
    const columns = useMemo(() => [
        {
            title: 'Hình ảnh',
            dataIndex: 'image',
            key: 'image',
            width: 100,
            render: (image, record) => (
                <div className={styles.imageContainer}>
                    <img
                        src={image?.url ? `${process.env.REACT_APP_API_URL}/uploads/books/${image.public_id}` : 'https://via.placeholder.com/150x220.png?text=No+Image'}
                        alt={record.name}
                        className={styles.stationeryImage}
                         
                    />
                </div>
            )
        },
        {
            title: 'Tên VPP',
            dataIndex: 'name',
            key: 'name',
            width: 200,
            render: (text, record) => (
                <Tooltip title={text}>
                    <Text 
                        className={styles.stationeryTitle} 
                        onClick={() => onViewDetails(record)}
                    >
                        {text}
                    </Text>
                </Tooltip>
            )
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            width: 200,
            ellipsis: {
                showTitle: false
            },
            render: (text) => (
                <Tooltip placement="topLeft" title={text || 'Chưa có mô tả'}>
                    <div className={styles.descriptionCell}>{text || 'Chưa có mô tả'}</div>
                </Tooltip>
            )
        },
        {
            title: 'Giá bán',
            dataIndex: 'price',
            key: 'price',
            width: 120,
            render: (price) => (
                <Text className={styles.priceCell}>
                    {price?.toLocaleString('vi-VN')} VNĐ
                </Text>
            )
        },
        {
            title: 'Tồn kho',
            dataIndex: 'stock',
            key: 'stock',
            width: 100,
            render: (stock) => (
                <Tag color={stock < 10 ? 'red' : stock < 30 ? 'orange' : 'green'} className={styles.stockCell}>
                    {stock}
                </Tag>
            )
        },
        {
            title: 'Nhà cung cấp',
            dataIndex: 'supplier',
            key: 'supplier',
            width: 150,
            render: (supplier, record) => (
                <Tag color="purple">
                    {supplier?.name || record.supplier_id || 'N/A'}
                </Tag>
            )
        },
        {
            title: 'Thao tác',
            key: 'actions',
            fixed: 'right',
            width: 150,
            render: (_, record) => (
                <Space size="small" className={styles.actionsCell}>
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            className={`${styles.btnAction} ${styles.btnView}`}
                            onClick={() => onViewDetails(record)}
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
                            onClick={() => onDelete(record._id || record.id)}
                        />
                    </Tooltip>
                </Space>
            )
        }
    ], [onViewDetails, onEdit, onDelete]);

    const memoizedData = useMemo(() => stationeryItems, [stationeryItems]);

    return (
        <div className={styles.tableContainer}>
            <Table
                columns={columns}
                dataSource={memoizedData}
                rowKey={record => record._id || record.id}
                loading={loading}
                pagination={pagination}
                className={styles.stationeryTable}
                scroll={{ x: 1200 }}
            />
        </div>
    );
};

export default React.memo(StationeryTable);