// src/components/Orders/OrderTable.js
import React, { useState, useMemo } from 'react';
import { Table, Space, Button, Tooltip, Typography, Select as AntSelect } from 'antd';
import { EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import Select from 'react-select';
import styles from './OrderTable.module.css';

const { Text } = Typography;

const OrderTable = ({
    orders,
    onDeleteOrder,
    onUpdateStatus,
    orderStatusOptions,
    statusLabels,
    statusColors,
    isAdminView,
    loading,
    pagination
}) => {
    const [expandedOrderId, setExpandedOrderId] = useState(null);

    const handleStatusChange = async (orderId, selectedOption) => {
        if (selectedOption && selectedOption.value) {
            try {
                await onUpdateStatus(orderId, selectedOption.value);
            } catch (error) {
                console.error('Error updating status:', error);
            }
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('vi-VN'),
            time: date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        };
    };

    const renderOrderDetails = (order) => {
        if (!order.items || order.items.length === 0) return null;

        return (
            <div className={styles.orderDetails}>
                <div className={styles.detailsHeader}>
                    <h4>Chi tiết đơn hàng</h4>
                </div>
                <Table
                    dataSource={order.items}
                    pagination={false}
                    className={styles.detailsTable}
                    columns={[
                        {
                            title: 'Sản phẩm',
                            dataIndex: 'product_name',
                            key: 'product_name'
                        },
                        {
                            title: 'Loại',
                            dataIndex: 'product_type',
                            key: 'product_type',
                            render: (type) => type === 'book' ? 'Sách' : 'Văn phòng phẩm'
                        },
                        {
                            title: 'Số lượng',
                            dataIndex: 'quantity',
                            key: 'quantity'
                        },
                        {
                            title: 'Đơn giá',
                            dataIndex: 'price',
                            key: 'price',
                            render: (price) => `${price?.toLocaleString('vi-VN')} VNĐ`
                        },
                        {
                            title: 'Giảm giá',
                            dataIndex: 'discount',
                            key: 'discount',
                            render: (discount) => `${discount || 0}%`
                        },
                        {
                            title: 'Thuế',
                            dataIndex: 'tax',
                            key: 'tax',
                            render: (tax) => `${tax || 0}%`
                        },
                        {
                            title: 'Thành tiền',
                            dataIndex: 'total',
                            key: 'total',
                            render: (total) => `${total?.toLocaleString('vi-VN')} VNĐ`
                        }
                    ]}
                    summary={() => (
                        <Table.Summary>
                            <Table.Summary.Row>
                                <Table.Summary.Cell colSpan={6} className={styles.totalLabel}>
                                    Tổng tiền:
                                </Table.Summary.Cell>
                                <Table.Summary.Cell className={styles.totalAmount}>
                                    {order.total_amount?.toLocaleString('vi-VN')} VNĐ
                                </Table.Summary.Cell>
                            </Table.Summary.Row>
                        </Table.Summary>
                    )}
                />
            </div>
        );
    };

    const columns = useMemo(() => [
        {
            title: 'Mã ĐH',
            dataIndex: '_id',
            key: '_id',
            render: (id) => (
                <Text
                    className={styles.orderIdCell}
                    onClick={() => setExpandedOrderId(expandedOrderId === id ? null : id)}
                >
                    {id}
                </Text>
            )
        },
        isAdminView && {
            title: 'Cửa hàng',
            dataIndex: 'store',
            key: 'store',
            render: (store) => (
                <div className={styles.storeInfo}>
                    <div>{store?.name || 'N/A'}</div>
                    <div className={styles.storeAddress}>{store?.address || 'N/A'}</div>
                </div>
            )
        },
        {
            title: 'Khách Hàng',
            dataIndex: 'customer',
            key: 'customer',
            render: (customer, record) => (
                <div className={styles.customerInfo}>
                    {customer?.name || record.customer_name || 'N/A'}
                </div>
            )
        },
        {
            title: 'Ngày Tạo',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date) => {
                const { date: formattedDate, time } = formatDate(date);
                return (
                    <>
                        {formattedDate}
                        <br />
                        <span className={styles.timePart}>{time}</span>
                    </>
                );
            }
        },
        {
            title: 'Tổng Tiền',
            dataIndex: 'total_amount',
            key: 'total_amount',
            render: (amount) => (
                <Text className={styles.amountCell}>
                    {amount?.toLocaleString('vi-VN')} VNĐ
                </Text>
            )
        },
        {
            title: 'Người Tạo',
            dataIndex: 'created_by',
            key: 'created_by_name',
            render: (createdBy, record) => {
                const { time } = formatDate(record.created_at);
                return (
                    <div className={styles.creatorInfo}>
                        <div>{createdBy?.fullName || 'N/A'}</div>
                    </div>
                );
            }
        },
        {
            title: 'Trạng Thái',
            dataIndex: 'status',
            key: 'status',
            fixed: 'right',
            width: 150,
            render: (status, record) => (
                <Select
                    options={orderStatusOptions}
                    value={orderStatusOptions.find(opt => opt.value === status)}
                    onChange={(selectedOption) => handleStatusChange(record._id, selectedOption)}
                    isDisabled={status === 'completed' || status === 'cancelled'}
                    className={`${styles.statusSelect}`}
                    classNamePrefix="react-select"
                    menuPlacement="auto"
                    menuPortalTarget={document.body}
                    styles={{
                        menuPortal: base => ({ ...base, zIndex: 9999 }),
                        control: (base) => ({
                            ...base,
                            minHeight: '30px',
                            height: '30px',
                            fontSize: '0.85rem',
                            backgroundColor: statusColors[status] || '#ffffff',
                            color: '#ffffff'
                        }),
                        singleValue: (base) => ({
                            ...base,
                            color: '#ffffff'
                        }),
                        valueContainer: (base) => ({
                            ...base,
                            height: '30px',
                            padding: '0 6px'
                        }),
                        input: (base) => ({
                            ...base,
                            margin: '0px',
                        }),
                        indicatorSeparator: () => ({
                            display: 'none',
                        }),
                        indicatorsContainer: (base) => ({
                            ...base,
                            height: '30px',
                        }),
                        option: (base, state) => ({
                            ...base,
                            fontSize: '0.85rem',
                            padding: '6px 10px',
                            backgroundColor: state.isSelected ? '#007bff' : (state.isFocused ? '#e9ecef' : base.backgroundColor),
                            color: state.isSelected ? 'white' : base.color,
                        })
                    }}
                />
            )
        }
    ].filter(Boolean), [expandedOrderId, onDeleteOrder, isAdminView, orderStatusOptions, statusColors]);

    return (
        <div className={styles.tableContainer}>
            <Table
                columns={columns}
                dataSource={orders}
                rowKey={record => record._id}
                loading={loading}
                pagination={pagination}
                className={styles.orderTable}
                scroll={{ x: 1200 }}
                expandable={{
                    expandedRowKeys: expandedOrderId ? [expandedOrderId] : [],
                    expandedRowRender: renderOrderDetails,
                    onExpand: (expanded, record) => setExpandedOrderId(expanded ? record._id : null)
                }}
                locale={{
                    emptyText: 'Không có đơn hàng nào.'
                }}
            />
        </div>
    );
};

export default React.memo(OrderTable);