import React, { useState, useEffect } from 'react';
import {
    Row,
    Col,
    Card,
    Statistic,
    Table,
    DatePicker,
    Space,
    Spin,
    message,
    Tag,
    List,
    Typography
} from 'antd';
import {
    ShopOutlined,
    UserOutlined,
    DollarOutlined,
    ShoppingCartOutlined
} from '@ant-design/icons';
import { reportService } from '../../services/report.service';
import moment from 'moment';

const { RangePicker } = DatePicker;
const { Title } = Typography;

const formatCurrency = (value) => {
    if (value === null || value === undefined) return '0 VNĐ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const Dashboard = () => {
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState(null);
    const [dateRange, setDateRange] = useState([
        moment().startOf('month'),
        moment().endOf('month')
    ]);
    const [topSellingData, setTopSellingData] = useState(null);

    useEffect(() => {
        fetchDashboardStats();
        fetchTopSellingProducts();
    }, [dateRange]);

    const fetchDashboardStats = async () => {
        try {
            setLoading(true);
            const [start, end] = dateRange;
            const data = await reportService.getDashboardStats({
                startDate: start.format('YYYY-MM-DD'),
                endDate: end.format('YYYY-MM-DD')
            });
            setStats(data);
        } catch (error) {
            message.error('Không thể tải dữ liệu thống kê');
        } finally {
            setLoading(false);
        }
    };

    const fetchTopSellingProducts = async () => {
        try {
            const data = await reportService.getTopSellingProducts();
            setTopSellingData(data);
        } catch (error) {
            console.error('Error fetching top selling products:', error);
        }
    };

    const orderColumns = [
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const statusMap = {
                    'pending': 'Chờ xử lý',
                    'processing': 'Đang xử lý',
                    'completed': 'Hoàn thành',
                    'cancelled': 'Đã hủy'
                };
                return statusMap[status] || status;
            }
        },
        {
            title: 'Số lượng',
            dataIndex: 'count',
            key: 'count'
        },
        {
            title: 'Doanh thu',
            dataIndex: 'revenue',
            key: 'revenue',
            render: (value) => formatCurrency(value)
        }
    ];

    const storeColumns = [
        {
            title: 'Tên cửa hàng',
            dataIndex: 'name',
            key: 'name'
        },
        {
            title: 'Số nhân viên',
            dataIndex: 'employeeCount',
            key: 'employeeCount'
        }
    ];

    if (loading) {
        return <Spin size="large" />;
    }

    return (
        <div className="dashboard">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
                <div style={{ marginBottom: 16 }}>
                    <RangePicker
                        value={dateRange}
                        onChange={setDateRange}
                        format="DD/MM/YYYY"
                    />
                </div>

                <Row gutter={16}>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Doanh thu"
                                value={stats?.revenue || 0}
                                precision={0}
                                formatter={(value) => formatCurrency(value)}
                                prefix={<DollarOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Đơn hàng"
                                value={stats?.ordersByStatus?.reduce((sum, item) => sum + item.count, 0) || 0}
                                prefix={<ShoppingCartOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Cửa hàng"
                                value={stats?.storeStats?.length || 0}
                                prefix={<ShopOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Khách hàng"
                                value={stats?.customerStats?.totalCustomers || 0}
                                prefix={<UserOutlined />}
                            />
                        </Card>
                    </Col>
                </Row>

                <Card title="Top 5 Sản Phẩm Bán Chạy">
                    <List
                        dataSource={topSellingData?.data?.slice(0, 5) || []}
                        renderItem={(item, index) => (
                            <List.Item>
                                <Row style={{ width: '100%' }} align="middle">
                                    <Col flex="70px">
                                        <div style={{ 
                                            width: 24, 
                                            height: 24, 
                                            background: index < 3 ? '#1890ff' : '#d9d9d9',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white'
                                        }}>
                                            {index + 1}
                                        </div>
                                    </Col>
                                    <Col flex="300px">
                                        <Space direction="vertical" size={0}>
                                            <span style={{ fontWeight: 'bold' }}>{item.productName}</span>
                                            <Tag color={item.productType === 'book' ? 'blue' : 'green'}>
                                                {item.productType === 'book' ? 'Sách' : 'Văn phòng phẩm'}
                                            </Tag>
                                        </Space>
                                    </Col>
                                    <Col flex="auto">
                                        <Row gutter={[16, 0]}>
                                            <Col span={6}>
                                                <span style={{ color: '#8c8c8c' }}>Đã bán:</span>
                                                <br />
                                                <span>{item.totalQuantity}</span>
                                            </Col>
                                            <Col span={6}>
                                                <span style={{ color: '#8c8c8c' }}>Doanh thu:</span>
                                                <br />
                                                <span>{formatCurrency(item.totalRevenue)}</span>
                                            </Col>
                                            <Col span={6}>
                                                <span style={{ color: '#8c8c8c' }}>Giá TB:</span>
                                                <br />
                                                <span>{formatCurrency(item.averagePrice)}</span>
                                            </Col>
                                            <Col span={6}>
                                                <span style={{ color: '#8c8c8c' }}>Số đơn:</span>
                                                <br />
                                                <span>{item.orderCount}</span>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </List.Item>
                        )}
                    />
                </Card>

                <Row gutter={16}>
                    <Col span={12}>
                        <Card title="Thống kê đơn hàng">
                            <Table
                                dataSource={stats?.ordersByStatus || []}
                                columns={orderColumns}
                                pagination={false}
                                rowKey="status"
                            />
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card title="Thống kê cửa hàng">
                            <Table
                                dataSource={stats?.storeStats || []}
                                columns={storeColumns}
                                pagination={false}
                                rowKey="_id"
                            />
                        </Card>
                    </Col>
                </Row>

                <Row>
                    <Col span={24}>
                        <Card title="Thống kê khách hàng">
                            <Row gutter={16}>
                                <Col span={8}>
                                    <Statistic
                                        title="Tổng số khách hàng"
                                        value={stats?.customerStats?.totalCustomers || 0}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic
                                        title="Đơn hàng trung bình/khách"
                                        value={stats?.customerStats?.avgOrdersPerCustomer || 0}
                                        precision={2}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic
                                        title="Chi tiêu trung bình/khách"
                                        value={stats?.customerStats?.avgSpentPerCustomer || 0}
                                        precision={0}
                                        formatter={(value) => formatCurrency(value)}
                                    />
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>
            </Space>
        </div>
    );
};

export default Dashboard; 