import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, message } from 'antd';
import {
    ShopOutlined,
    UserOutlined,
    ShoppingCartOutlined,
    DollarOutlined,
    BookOutlined,
    TeamOutlined
} from '@ant-design/icons';
import storeService from '../services/storeService';
import styles from './AdminDashboardPage.module.css';

const AdminDashboardPage = () => {
    const [loading, setLoading] = useState(false);
    const [statistics, setStatistics] = useState({
        totalStores: 0,
        totalUsers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalBooks: 0,
        totalEmployees: 0
    });
    const [recentStores, setRecentStores] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Lấy danh sách cửa hàng
            const stores = await storeService.getAllStores();
            setRecentStores(stores.slice(0, 5)); // Lấy 5 cửa hàng gần nhất

            // Tính toán thống kê tổng quan
            let totalRevenue = 0;
            let totalOrders = 0;
            let totalBooks = 0;
            let totalEmployees = 0;

            // Lấy thống kê từ từng cửa hàng
            const storeStats = await Promise.all(
                stores.map(store => storeService.getStoreStatistics(store.id))
            );

            storeStats.forEach(stat => {
                totalRevenue += stat.totalRevenue || 0;
                totalOrders += stat.totalOrders || 0;
                totalBooks += stat.totalBooks || 0;
                totalEmployees += stat.totalEmployees || 0;
            });

            setStatistics({
                totalStores: stores.length,
                totalUsers: totalEmployees,
                totalOrders,
                totalRevenue,
                totalBooks,
                totalEmployees
            });

            // Lấy đơn hàng gần nhất từ tất cả cửa hàng
            const allOrders = await Promise.all(
                stores.map(store => storeService.getStoreOrders(store.id))
            );
            const recentOrders = allOrders
                .flat()
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5);
            setRecentOrders(recentOrders);

        } catch (error) {
            message.error('Không thể tải dữ liệu tổng quan!');
        } finally {
            setLoading(false);
        }
    };

    const storeColumns = [
        {
            title: 'Tên cửa hàng',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            key: 'address',
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            key: 'phone',
        }
    ];

    const orderColumns = [
        {
            title: 'Mã đơn hàng',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Cửa hàng',
            dataIndex: ['store', 'name'],
            key: 'storeName',
        },
        {
            title: 'Khách hàng',
            dataIndex: ['customer', 'fullName'],
            key: 'customerName',
        },
        {
            title: 'Số tiền',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            render: (amount) => `${amount.toLocaleString('vi-VN')}đ`
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => new Date(date).toLocaleDateString('vi-VN')
        }
    ];

    return (
        <div className={styles.container}>
            <h2>Tổng Quan Hệ Thống</h2>

            <Row gutter={[16, 16]} className={styles.statistics}>
                <Col xs={24} sm={12} lg={8}>
                    <Card>
                        <Statistic
                            title="Tổng số cửa hàng"
                            value={statistics.totalStores}
                            prefix={<ShopOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <Card>
                        <Statistic
                            title="Tổng số người dùng"
                            value={statistics.totalUsers}
                            prefix={<UserOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <Card>
                        <Statistic
                            title="Tổng số đơn hàng"
                            value={statistics.totalOrders}
                            prefix={<ShoppingCartOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <Card>
                        <Statistic
                            title="Tổng doanh thu"
                            value={statistics.totalRevenue}
                            prefix={<DollarOutlined />}
                            formatter={(value) => `${value.toLocaleString('vi-VN')}đ`}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <Card>
                        <Statistic
                            title="Tổng số sách"
                            value={statistics.totalBooks}
                            prefix={<BookOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <Card>
                        <Statistic
                            title="Tổng số nhân viên"
                            value={statistics.totalEmployees}
                            prefix={<TeamOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} className={styles.tables}>
                <Col xs={24} lg={12}>
                    <Card title="Cửa Hàng Gần Đây" loading={loading}>
                        <Table
                            columns={storeColumns}
                            dataSource={recentStores}
                            rowKey="id"
                            pagination={false}
                        />
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Đơn Hàng Gần Đây" loading={loading}>
                        <Table
                            columns={orderColumns}
                            dataSource={recentOrders}
                            rowKey="id"
                            pagination={false}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AdminDashboardPage; 