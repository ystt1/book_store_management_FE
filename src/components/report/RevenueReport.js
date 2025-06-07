import React, { useState, useEffect } from 'react';
import {
    Card,
    DatePicker,
    Space,
    Spin,
    message,
    Radio,
    Row,
    Col,
    Statistic,
    Table,
    Select,
    Typography
} from 'antd';
import {
    Line,
    Bar
} from '@ant-design/charts';
import { reportService } from '../../services/report.service';
import moment from 'moment';
import {
    ArrowUpOutlined,
    ArrowDownOutlined
} from '@ant-design/icons';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title } = Typography;

// Hàm format số an toàn
const formatCurrency = (value) => {
    if (value === null || value === undefined) return '0 VNĐ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const RevenueReport = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [period, setPeriod] = useState('monthly');
    const [year, setYear] = useState(moment().year());
    const [dateRange, setDateRange] = useState(null);

    useEffect(() => {
        fetchRevenueReport();
    }, [period, year, dateRange]);

    const fetchRevenueReport = async () => {
        try {
            setLoading(true);
            const params = { period };

            if (period === 'daily' && dateRange) {
                const [start, end] = dateRange;
                params.startDate = start.format('YYYY-MM-DD');
                params.endDate = end.format('YYYY-MM-DD');
            } else {
                params.year = year;
            }

            const response = await reportService.getRevenueReport(params);
            setData(response);
        } catch (error) {
            message.error('Không thể tải dữ liệu doanh thu');
            setData({
                data: [],
                growth: { growth: 0, currentValue: 0, previousValue: 0 },
                summary: { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 }
            });
        } finally {
            setLoading(false);
        }
    };

    const getChartData = () => {
        if (!data?.data) return [];
        
        return data.data.map(item => ({
            label: item.time || 'N/A',
            revenue: Number(item.value || 0),
            orders: Number(item.orderCount || 0),
            avgOrderValue: item.orderCount > 0 ? Number(item.value || 0) / Number(item.orderCount) : 0
        }));
    };

    const lineConfig = {
        data: getChartData(),
        xField: 'label',
        yField: 'revenue',
        smooth: true,
        point: {
            size: 5,
            shape: 'diamond',
            style: {
                fill: '#5B8FF9',
                stroke: '#5B8FF9',
                lineWidth: 2
            }
        },
        label: {
            position: 'top',
            offsetY: -4,
            style: {
                fill: '#666',
                fontSize: 12,
                opacity: 0.6
            },
            formatter: (item) => {
                // Chỉ hiển thị label cho các điểm có giá trị khác 0
                return item.revenue > 0 ? formatCurrency(item.revenue) : '';
            }
        },
        xAxis: {
            label: {
                style: {
                    fontSize: 12,
                    fill: '#666'
                }
            }
        },
        yAxis: {
            label: {
                style: {
                    fontSize: 12,
                    fill: '#666'
                },
                formatter: (v) => formatCurrency(v)
            }
        },
        tooltip: {
            showMarkers: true,
            showTitle: false,
            domStyles: {
                'g2-tooltip': {
                    padding: '8px',
                    fontSize: '12px'
                }
            },
            formatter: (v) => ({
                name: 'Doanh thu',
                value: formatCurrency(v.revenue || 0)
            })
        },
        animation: {
            appear: {
                animation: 'path-in',
                duration: 1000
            }
        }
    };

    const barConfig = {
        data: getChartData(),
        xField: 'label',
        yField: 'orders',
        columnStyle: {
            radius: [4, 4, 0, 0],
            fill: '#5B8FF9',
            fillOpacity: 0.8
        },
        label: {
            position: 'top',
            style: {
                fill: '#666',
                fontSize: 12,
                fontWeight: 500,
                opacity: 0.6
            },
            formatter: (item) => {
                // Chỉ hiển thị label cho các cột có giá trị khác 0
                return item.orders > 0 ? `${item.orders}` : '';
            }
        },
        xAxis: {
            label: {
                style: {
                    fontSize: 12,
                    fill: '#666'
                }
            }
        },
        yAxis: {
            label: {
                style: {
                    fontSize: 12,
                    fill: '#666'
                },
                formatter: (v) => Math.floor(v)
            }
        },
        tooltip: {
            showMarkers: false,
            showTitle: false,
            domStyles: {
                'g2-tooltip': {
                    padding: '8px',
                    fontSize: '12px'
                }
            },
            formatter: (v) => ({
                name: 'Số đơn hàng',
                value: v.orders || 0
            })
        },
        animation: {
            appear: {
                animation: 'fade-in',
                duration: 1000
            }
        }
    };

    const columns = [
        {
            title: 'Thời gian',
            dataIndex: 'label',
            key: 'label'
        },
        {
            title: 'Doanh thu',
            dataIndex: 'revenue',
            key: 'revenue',
            render: (value) => formatCurrency(value),
            sorter: (a, b) => (a.revenue || 0) - (b.revenue || 0)
        },
        {
            title: 'Số đơn hàng',
            dataIndex: 'orders',
            key: 'orders',
            render: (value) => value || 0,
            sorter: (a, b) => (a.orders || 0) - (b.orders || 0)
        },
        {
            title: 'Giá trị trung bình/đơn',
            dataIndex: 'avgOrderValue',
            key: 'avgOrderValue',
            render: (value) => formatCurrency(value),
            sorter: (a, b) => (a.avgOrderValue || 0) - (b.avgOrderValue || 0)
        }
    ];

    const renderDateSelector = () => {
        switch (period) {
            case 'daily':
                return (
                    <RangePicker
                        value={dateRange}
                        onChange={setDateRange}
                        format="DD/MM/YYYY"
                    />
                );
            default:
                return (
                    <Select value={year} onChange={setYear}>
                        {Array.from({ length: 5 }, (_, i) => moment().year() - i).map(y => (
                            <Option key={y} value={y}>{y}</Option>
                        ))}
                    </Select>
                );
        }
    };

    if (loading) {
        return <Spin size="large" />;
    }

    const summary = data?.summary || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 };
    const growth = data?.growth || { growth: 0, currentValue: 0, previousValue: 0 };

    return (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Space style={{ marginBottom: 16 }}>
                <Radio.Group value={period} onChange={e => setPeriod(e.target.value)}>
                    <Radio.Button value="daily">Theo ngày</Radio.Button>
                    <Radio.Button value="monthly">Theo tháng</Radio.Button>
                    <Radio.Button value="quarterly">Theo quý</Radio.Button>
                </Radio.Group>
                {renderDateSelector()}
            </Space>

            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Tổng doanh thu"
                            value={summary.totalRevenue}
                            precision={0}
                            formatter={(value) => formatCurrency(value)}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Tổng số đơn hàng"
                            value={summary.totalOrders}
                            precision={0}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Giá trị trung bình/đơn"
                            value={summary.avgOrderValue}
                            precision={0}
                            formatter={(value) => formatCurrency(value)}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Tăng trưởng"
                            value={growth.growth}
                            precision={2}
                            prefix={growth.growth >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                            suffix="%"
                            valueStyle={{ color: growth.growth >= 0 ? '#3f8600' : '#cf1322' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card title="Biểu đồ doanh thu" style={{ marginBottom: 16 }}>
                <div style={{ height: 400, padding: '20px 0' }}>
                    <Line {...lineConfig} />
                </div>
            </Card>

            <Card title="Biểu đồ số lượng đơn hàng" style={{ marginBottom: 16 }}>
                <div style={{ height: 400, padding: '20px 0' }}>
                    <Bar {...barConfig} />
                </div>
            </Card>

            <Card title="Chi tiết doanh thu">
                <Table
                    columns={columns}
                    dataSource={getChartData()}
                    rowKey="label"
                    pagination={false}
                />
            </Card>
        </Space>
    );
};

export default RevenueReport; 
