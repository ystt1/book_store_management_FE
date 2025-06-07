// src/components/Layout/AdminLayout.js
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    DashboardOutlined,
    ShopOutlined,
    UserOutlined,
    BookOutlined,
    ShoppingCartOutlined,
    BarChartOutlined,
    SettingOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    LogoutOutlined,
    ImportOutlined,
    BellOutlined,
    TeamOutlined
} from '@ant-design/icons';
import { Layout, Menu, Button, theme, Avatar, Dropdown, Space } from 'antd';
import styles from './AdminLayout.module.css';
import NotificationBadge from '../notification/NotificationBadge';

const { Header, Sider, Content } = Layout;

const AdminLayout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, currentUser } = useAuth();
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const userMenuItems = [
        {
            key: 'profile',
            label: <Link to="/admin/profile">Thông tin cá nhân</Link>,
            icon: <UserOutlined />,
        },
        {
            key: 'settings',
            label: 'Cài đặt',
            icon: <SettingOutlined />,
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            label: 'Đăng xuất',
            icon: <LogoutOutlined />,
            onClick: handleLogout,
        },
    ];

    const menuItems = [
        {
            key: '/admin/dashboard',
            icon: <DashboardOutlined />,
            label: 'Tổng quan',
        },
        {
            key: '/admin/stores',
            icon: <ShopOutlined />,
            label: 'Quản lý cửa hàng',
        },
        {
            key: '/admin/users',
            icon: <UserOutlined />,
            label: 'Quản lý người dùng',
        },
        {
            key: '/admin/customers',
            icon: <TeamOutlined />,
            label: 'Quản lý khách hàng',
        },
        {
            key: '/admin/books',
            icon: <BookOutlined />,
            label: 'Quản lý sách',
        },
        {
            key: '/admin/orders',
            icon: <ShoppingCartOutlined />,
            label: 'Quản lý đơn hàng',
        },
        {
            key: '/admin/general-import',
            icon: <ImportOutlined />,
            label: 'Quản lý nhập hàng',
        },
        {
            key: '/admin/notifications',
            icon: <BellOutlined />,
            label: 'Quản lý thông báo',
        },
        {
            key: '/admin/reports',
            icon: <BarChartOutlined />,
            label: 'Báo cáo thống kê',
        },
        {
            key: '/admin/settings',
            icon: <SettingOutlined />,
            label: 'Cài đặt hệ thống',
        },
    ];

    return (
        <Layout className={styles.adminLayout}>
            <Sider 
                trigger={null} 
                collapsible 
                collapsed={collapsed}
                className={styles.sider}
                theme="light"
                width={250}
            >
                <div className={styles.logo}>
                    <img src="/logo.png" alt="Logo" className={styles.logoImage} />
                    {!collapsed && <span className={styles.logoText}>BookStore Admin</span>}
                </div>
                <Menu
                    theme="light"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    className={styles.menu}
                    onClick={({ key }) => navigate(key)}
                />
            </Sider>
            <Layout>
                <Header className={styles.header} style={{ background: colorBgContainer }}>
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        className={styles.trigger}
                    />
                    <div className={styles.headerRight}>
                        <Space size={24}>
                            <NotificationBadge />
                            <Dropdown
                                menu={{ items: userMenuItems }}
                                placement="bottomRight"
                                arrow
                            >
                                <div className={styles.userInfo}>
                                    <Avatar 
                                        icon={<UserOutlined />} 
                                        className={styles.avatar}
                                    />
                                    {!collapsed && (
                                        <span className={styles.userName}>
                                            {currentUser?.fullName || 'Admin'}
                                        </span>
                                    )}
                                </div>
                            </Dropdown>
                        </Space>
                    </div>
                </Header>
                <Content
                    className={styles.content}
                    style={{
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;