import React from 'react';
import { Layout, Menu } from 'antd';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
    DashboardOutlined,
    ShopOutlined,
    UserOutlined,
    BookOutlined,
    BellOutlined,
    BarChartOutlined,
    TeamOutlined,
    StockOutlined,
    DollarOutlined
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
    const location = useLocation();

    const menuItems = [
        {
            key: 'dashboard',
            icon: <DashboardOutlined />,
            label: <Link to="/admin/dashboard">Tổng quan</Link>
        },
        {
            key: 'reports',
            icon: <BarChartOutlined />,
            label: 'Báo cáo & Phân tích',
            children: [
                {
                    key: 'reports-dashboard',
                    label: <Link to="/admin/dashboard">Thống kê tổng quan</Link>
                },
                {
                    key: 'reports-revenue',
                    icon: <DollarOutlined />,
                    label: <Link to="/admin/reports/revenue">Báo cáo doanh thu</Link>
                },
                {
                    key: 'reports-inventory',
                    icon: <StockOutlined />,
                    label: <Link to="/admin/reports/inventory">Báo cáo tồn kho</Link>
                },
                {
                    key: 'reports-customers',
                    icon: <TeamOutlined />,
                    label: <Link to="/admin/reports/customers">Phân tích khách hàng</Link>
                }
            ]
        },
        {
            key: 'stores',
            icon: <ShopOutlined />,
            label: <Link to="/admin/stores">Quản lý cửa hàng</Link>
        },
        {
            key: 'users',
            icon: <UserOutlined />,
            label: <Link to="/admin/users">Quản lý người dùng</Link>
        },
        {
            key: 'books',
            icon: <BookOutlined />,
            label: <Link to="/admin/books">Quản lý sách</Link>
        },
        {
            key: 'customers',
            icon: <TeamOutlined />,
            label: <Link to="/admin/customers">Quản lý khách hàng</Link>
        },
        {
            key: 'notifications',
            icon: <BellOutlined />,
            label: 'Thông báo',
            children: [
                {
                    key: 'notifications-list',
                    label: <Link to="/admin/notifications">Danh sách thông báo</Link>
                },
                {
                    key: 'notifications-send',
                    label: <Link to="/admin/notifications/send">Gửi thông báo</Link>
                }
            ]
        }
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider width={250} theme="light">
                <div style={{ height: 32, margin: 16, background: 'rgba(0, 0, 0, 0.2)' }} />
                <Menu
                    mode="inline"
                    selectedKeys={[location.pathname.split('/')[2] || 'dashboard']}
                    items={menuItems}
                    style={{ height: '100%', borderRight: 0 }}
                />
            </Sider>
            <Layout>
                <Header style={{ background: '#fff', padding: 0 }} />
                <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default AdminLayout; 