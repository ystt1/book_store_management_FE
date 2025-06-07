import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Spin, message } from 'antd';
import { 
    ShoppingCartOutlined, 
    DollarOutlined, 
    BookOutlined,
    UserOutlined 
} from '@ant-design/icons';
import { Line, Pie } from '@ant-design/plots';
import { useParams } from 'react-router-dom';
import styles from './StoreDashboardPage.module.css';
import storeDashboardService from '../services/storeDashboardService';

const StoreDashboardPage = () => {
    const { storeId } = useParams();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalCustomers: 0,
        revenueData: [],
        topProducts: [],
        productTypeRatio: []
    });

    useEffect(() => {
        fetchDashboardData();
    }, [storeId]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const data = await storeDashboardService.getDashboardData(storeId);
            setDashboardData(data);
        } catch (error) {
            message.error('Không thể tải dữ liệu dashboard: ' + error.message);
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const revenueConfig = {
        data: dashboardData.revenueData || [],
        xField: 'month',
        yField: 'revenue',
        smooth: true,
        yAxis: {
            label: {
                formatter: (v) => `${(v/1000000).toFixed(1)}M`,
            },
        },
        tooltip: {
            formatter: (data) => {
                return {
                    name: 'Doanh thu',
                    value: storeDashboardService.formatCurrency(data.revenue)
                };
            }
        }
    };

    const productTypeConfig = {
        appendPadding: 10,
        data: dashboardData.productTypeRatio || [],
        angleField: 'value',
        colorField: 'type',
        radius: 0.9,
        legend: false,
        label: {
            autoRotate: false,
            formatter: (text, item) => {
                if (item?.type && item?.value) {
                    return `${item.type}: ${item.value}%`;
                }
                return '';
            },
            style: {
                fontSize: 12,
                textAlign: 'center',
            },
        },
    };

    const topProductColumns = [
        {
            title: 'Sản phẩm',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Số lượng bán',
            dataIndex: 'sold',
            key: 'sold',
            sorter: (a, b) => a.sold - b.sold,
        },
        {
            title: 'Doanh thu',
            dataIndex: 'revenue',
            key: 'revenue',
            render: (value) => storeDashboardService.formatCurrency(value),
            sorter: (a, b) => a.revenue - b.revenue,
        },
    ];

    if (loading) {
        return <Spin size="large" className={styles.spinner} />;
    }

    return (
        <div className={styles.dashboard}>
            <h2>Tổng Quan Cửa Hàng</h2>
            
            {/* Thống kê tổng quan */}
            <Row gutter={16} className={styles.statsRow}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tổng doanh thu"
                            value={dashboardData.totalRevenue}
                            prefix={<DollarOutlined />}
                            formatter={(value) => storeDashboardService.formatCurrency(value)}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tổng đơn hàng"
                            value={dashboardData.totalOrders}
                            prefix={<ShoppingCartOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tổng sản phẩm"
                            value={dashboardData.totalProducts}
                            prefix={<BookOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tổng khách hàng"
                            value={dashboardData.totalCustomers}
                            prefix={<UserOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Biểu đồ doanh thu */}
            <Row gutter={16} className={styles.chartRow}>
                <Col xs={24} lg={16}>
                    <Card title="Biểu Đồ Doanh Thu">
                        {dashboardData.revenueData && dashboardData.revenueData.length > 0 ? (
                            <Line {...revenueConfig} />
                        ) : (
                            <div>Không có dữ liệu doanh thu</div>
                        )}
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card title="Tỷ Lệ Sản Phẩm">
                        {dashboardData.productTypeRatio && dashboardData.productTypeRatio.length > 0 ? (
                            <Pie {...productTypeConfig} />
                        ) : (
                            <div>Không có dữ liệu tỷ lệ sản phẩm</div>
                        )}
                    </Card>
                </Col>
            </Row>

            {/* Bảng top sản phẩm */}
            <Row className={styles.tableRow}>
                <Col span={24}>
                    <Card title="Top Sản Phẩm Bán Chạy">
                        <Table
                            columns={topProductColumns}
                            dataSource={dashboardData.topProducts}
                            pagination={false}
                            rowKey="name"
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default StoreDashboardPage; 