import React, { useState, useEffect } from 'react';
import {
    Card,
    Space,
    Spin,
    message,
    Row,
    Col,
    Statistic,
    Table,
    Tag,
    Typography,
    Progress
} from 'antd';
import { reportService } from '../../services/report.service';
import { WarningOutlined } from '@ant-design/icons';

const { Title } = Typography;

const formatCurrency = (value) => {
    if (value === null || value === undefined) return '0 VNĐ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const InventoryReport = () => {
    const [loading, setLoading] = useState(false);
    const [inventoryData, setInventoryData] = useState(null);

    useEffect(() => {
        fetchInventoryReport();
    }, []);

    const fetchInventoryReport = async () => {
        try {
            setLoading(true);
            const response = await reportService.getInventoryReport();
            setInventoryData(response);
        } catch (error) {
            message.error('Không thể tải dữ liệu tồn kho');
        } finally {
            setLoading(false);
        }
    };

    const lowStockColumns = [
        {
            title: 'Tên sản phẩm',
            dataIndex: 'name',
            key: 'name'
        },
        {
            title: 'Loại',
            dataIndex: 'type',
            key: 'type',
            render: (type) => <Tag color={type === 'Sách' ? 'blue' : 'green'}>{type}</Tag>
        },
        {
            title: 'Danh mục',
            dataIndex: 'category',
            key: 'category'
        },
        {
            title: 'Tồn kho',
            dataIndex: 'stock',
            key: 'stock',
            render: (stock) => (
                <Space>
                    <span style={{ color: stock <= 10 ? 'red' : 'inherit' }}>{stock}</span>
                    <Progress 
                        percent={(stock / 100) * 100} 
                        size="small" 
                        status={stock <= 10 ? "exception" : "normal"}
                        showInfo={false}
                        style={{ width: 60 }}
                    />
                </Space>
            )
        },
        {
            title: 'Giá',
            dataIndex: 'price',
            key: 'price',
            render: (price) => formatCurrency(price)
        },
        {
            title: 'Giá trị tồn',
            dataIndex: 'value',
            key: 'value',
            render: (value) => formatCurrency(value)
        }
    ];

    const productListColumns = [
        {
            title: 'Tên sản phẩm',
            dataIndex: 'name',
            key: 'name'
        },
        {
            title: 'Loại',
            dataIndex: 'type',
            key: 'type',
            render: (type) => <Tag color={type === 'Sách' ? 'blue' : 'green'}>{type}</Tag>
        },
        {
            title: 'Danh mục',
            dataIndex: 'category',
            key: 'category'
        },
        {
            title: 'Tồn kho',
            dataIndex: 'stock',
            key: 'stock',
            render: (stock) => (
                <Space>
                    <span>{stock}</span>
                    <Progress 
                        percent={(stock / inventoryData?.summary?.maxStock || 1) * 100} 
                        size="small" 
                        status={stock <= 10 ? "exception" : "normal"}
                        showInfo={false}
                        style={{ width: 60 }}
                    />
                </Space>
            )
        },
        {
            title: 'Mức tồn trung bình',
            dataIndex: 'averageStock',
            key: 'averageStock'
        },
        {
            title: 'Giá',
            dataIndex: 'price',
            key: 'price',
            render: (price) => formatCurrency(price)
        },
        {
            title: 'Giá trị tồn',
            dataIndex: 'value',
            key: 'value',
            render: (value) => formatCurrency(value)
        }
    ];

    if (loading) {
        return <Spin size="large" />;
    }

    return (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Row gutter={16}>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Tổng số sản phẩm"
                            value={inventoryData?.summary?.totalProducts || 0}
                            precision={0}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Tổng số lượng tồn"
                            value={inventoryData?.summary?.totalStock || 0}
                            precision={0}
                        />
                        <div style={{ fontSize: '12px', marginTop: '8px' }}>
                            Mức tồn trung bình: {inventoryData?.summary?.averageStock || 0}
                        </div>
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Tổng giá trị tồn kho"
                            value={inventoryData?.summary?.totalValue || 0}
                            precision={0}
                            formatter={(value) => formatCurrency(value)}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Giá trị trung bình/sản phẩm"
                            value={inventoryData?.summary?.averagePrice || 0}
                            precision={0}
                            formatter={(value) => formatCurrency(value)}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={12}>
                    <Card title="Chi tiết sách">
                        <Statistic
                            title="Tổng số sách"
                            value={inventoryData?.details?.books?.total || 0}
                            precision={0}
                            style={{ marginBottom: 16 }}
                        />
                        <Statistic
                            title="Tổng số lượng tồn"
                            value={inventoryData?.details?.books?.stock || 0}
                            precision={0}
                            style={{ marginBottom: 16 }}
                        />
                        <div style={{ fontSize: '12px', marginBottom: 16 }}>
                            Mức tồn trung bình: {inventoryData?.details?.books?.averageStock || 0}
                        </div>
                        <Statistic
                            title="Tổng giá trị tồn"
                            value={inventoryData?.details?.books?.value || 0}
                            precision={0}
                            formatter={(value) => formatCurrency(value)}
                        />
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Chi tiết văn phòng phẩm">
                        <Statistic
                            title="Tổng số văn phòng phẩm"
                            value={inventoryData?.details?.stationery?.total || 0}
                            precision={0}
                            style={{ marginBottom: 16 }}
                        />
                        <Statistic
                            title="Tổng số lượng tồn"
                            value={inventoryData?.details?.stationery?.stock || 0}
                            precision={0}
                            style={{ marginBottom: 16 }}
                        />
                        <div style={{ fontSize: '12px', marginBottom: 16 }}>
                            Mức tồn trung bình: {inventoryData?.details?.stationery?.averageStock || 0}
                        </div>
                        <Statistic
                            title="Tổng giá trị tồn"
                            value={inventoryData?.details?.stationery?.value || 0}
                            precision={0}
                            formatter={(value) => formatCurrency(value)}
                        />
                    </Card>
                </Col>
            </Row>

            <Card 
                title={
                    <Space>
                        <WarningOutlined style={{ color: '#faad14' }} />
                        <span>Sản phẩm sắp hết hàng (Tồn kho {'<='} 10)</span>
                    </Space>
                }
            >
                <Table
                    columns={lowStockColumns}
                    dataSource={inventoryData?.lowStockItems || []}
                    rowKey="id"
                    pagination={false}
                />
            </Card>

            <Card title="Danh sách sản phẩm">
                <Table
                    columns={productListColumns}
                    dataSource={inventoryData?.products || []}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                />
            </Card>
        </Space>
    );
};

export default InventoryReport; 