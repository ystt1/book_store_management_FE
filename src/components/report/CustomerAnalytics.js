import React, { useState, useEffect } from 'react';
import {
    Card,
    Table,
    DatePicker,
    Space,
    Spin,
    message,
    Tabs,
    Row,
    Col,
    Statistic,
    Tag
} from 'antd';
import { reportService } from '../../services/report.service';
import moment from 'moment';

const { RangePicker } = DatePicker;

const CustomerAnalytics = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [dateRange, setDateRange] = useState([
        moment().subtract(6, 'months'),
        moment()
    ]);

    useEffect(() => {
        fetchCustomerAnalytics();
    }, [dateRange]);

    const fetchCustomerAnalytics = async () => {
        try {
            setLoading(true);
            const [start, end] = dateRange;
            const response = await reportService.getCustomerAnalytics({
                startDate: start.format('YYYY-MM-DD'),
                endDate: end.format('YYYY-MM-DD')
            });
            setData(response);
        } catch (error) {
            message.error('Không thể tải dữ liệu phân tích khách hàng');
        } finally {
            setLoading(false);
        }
    };

    const customerColumns = [
        {
            title: 'Tên khách hàng',
            dataIndex: 'full_name',
            key: 'full_name'
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email'
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            key: 'phone'
        },
        {
            title: 'Tổng đơn hàng',
            dataIndex: 'totalOrders',
            key: 'totalOrders',
            sorter: (a, b) => a.totalOrders - b.totalOrders
        },
        {
            title: 'Tổng chi tiêu',
            dataIndex: 'totalSpent',
            key: 'totalSpent',
            sorter: (a, b) => a.totalSpent - b.totalSpent,
            render: (value) => `${value.toLocaleString()} VNĐ`
        },
        {
            title: 'Giá trị trung bình/đơn',
            dataIndex: 'averageOrderValue',
            key: 'averageOrderValue',
            render: (value) => `${value?.toLocaleString()} VNĐ`
        }
    ];

    const renderSegmentTable = (customers, title, description) => (
        <Card title={title} style={{ marginBottom: 16 }}>
            <p>{description}</p>
            <Table
                dataSource={customers}
                columns={customerColumns}
                rowKey="_id"
                pagination={{ pageSize: 5 }}
            />
        </Card>
    );

    if (loading) {
        return <Spin size="large" />;
    }

    return (
        <div className="customer-analytics">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
                <Card title="Phân tích khách hàng">
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <div style={{ marginBottom: 16 }}>
                            <RangePicker
                                value={dateRange}
                                onChange={setDateRange}
                                format="DD/MM/YYYY"
                            />
                        </div>

                        <Row gutter={16}>
                            <Col span={8}>
                                <Card>
                                    <Statistic
                                        title="Tổng số khách hàng"
                                        value={data?.summary?.totalCustomers || 0}
                                    />
                                </Card>
                            </Col>
                            <Col span={8}>
                                <Card>
                                    <Statistic
                                        title="Giá trị vòng đời trung bình"
                                        value={data?.summary?.averageLifetimeValue?.toFixed(2) || 0}
                                        suffix="VNĐ"
                                    />
                                </Card>
                            </Col>
                            <Col span={8}>
                                <Card>
                                    <Statistic
                                        title="Top khách hàng"
                                        value={data?.summary?.topSpenders?.length || 0}
                                        suffix="khách"
                                    />
                                </Card>
                            </Col>
                        </Row>
                    </Space>
                </Card>

                <Tabs defaultActiveKey="champions">
                    <Tabs.TabPane
                        tab={<span>Khách hàng trung thành <Tag color="gold">Champions</Tag></span>}
                        key="champions"
                    >
                        {renderSegmentTable(
                            data?.rfmAnalysis?.champions || [],
                            'Khách hàng trung thành',
                            'Những khách hàng tốt nhất, mua sắm thường xuyên và chi tiêu nhiều.'
                        )}
                    </Tabs.TabPane>

                    <Tabs.TabPane
                        tab={<span>Khách hàng thân thiết <Tag color="blue">Loyal</Tag></span>}
                        key="loyal"
                    >
                        {renderSegmentTable(
                            data?.rfmAnalysis?.loyalCustomers || [],
                            'Khách hàng thân thiết',
                            'Khách hàng mua sắm đều đặn và có giá trị đơn hàng ổn định.'
                        )}
                    </Tabs.TabPane>

                    <Tabs.TabPane
                        tab={<span>Khách hàng tiềm năng <Tag color="cyan">Potential</Tag></span>}
                        key="potential"
                    >
                        {renderSegmentTable(
                            data?.rfmAnalysis?.potentialLoyalists || [],
                            'Khách hàng tiềm năng',
                            'Khách hàng mới nhưng có tiềm năng trở thành khách hàng trung thành.'
                        )}
                    </Tabs.TabPane>

                    <Tabs.TabPane
                        tab={<span>Khách hàng mới <Tag color="green">New</Tag></span>}
                        key="recent"
                    >
                        {renderSegmentTable(
                            data?.rfmAnalysis?.recentCustomers || [],
                            'Khách hàng mới',
                            'Khách hàng mới với ít đơn hàng nhưng mua gần đây.'
                        )}
                    </Tabs.TabPane>

                    <Tabs.TabPane
                        tab={<span>Khách hàng cần chú ý <Tag color="orange">At Risk</Tag></span>}
                        key="atRisk"
                    >
                        {renderSegmentTable(
                            data?.rfmAnalysis?.atRiskCustomers || [],
                            'Khách hàng cần chú ý',
                            'Khách hàng thường xuyên nhưng không mua sắm gần đây.'
                        )}
                    </Tabs.TabPane>

                    <Tabs.TabPane
                        tab={<span>Khách hàng cần giữ chân <Tag color="red">Can't Lose</Tag></span>}
                        key="cantLose"
                    >
                        {renderSegmentTable(
                            data?.rfmAnalysis?.cantLoseThemCustomers || [],
                            'Khách hàng cần giữ chân',
                            'Khách hàng có giá trị cao nhưng không hoạt động gần đây.'
                        )}
                    </Tabs.TabPane>

                    <Tabs.TabPane
                        tab={<span>Khách hàng không hoạt động <Tag color="default">Lost</Tag></span>}
                        key="lost"
                    >
                        {renderSegmentTable(
                            data?.rfmAnalysis?.lostCustomers || [],
                            'Khách hàng không hoạt động',
                            'Khách hàng không còn hoạt động trong thời gian dài.'
                        )}
                    </Tabs.TabPane>
                </Tabs>
            </Space>
        </div>
    );
};

export default CustomerAnalytics; 