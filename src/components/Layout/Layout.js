// src/components/Layout/Layout.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    DashboardOutlined,
    UserOutlined,
    BookOutlined,
    ShoppingCartOutlined,
    BarChartOutlined,
    SettingOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    LogoutOutlined,
    ShopOutlined,
    TeamOutlined,
    BellOutlined,
    TagsOutlined,
    ImportOutlined,
    ArrowLeftOutlined
} from '@ant-design/icons';
import { Layout, Menu, Button, theme, Avatar, Dropdown, Space, Typography, Spin, Tooltip } from 'antd';
import styles from './Layout.module.css';
import NotificationBadge from '../notification/NotificationBadge';
import storeService from '../../services/storeService';
import classNames from 'classnames';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const StoreLayout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const [storeInfo, setStoreInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 576);
    const location = useLocation();
    const navigate = useNavigate();
    const { storeId } = useParams();
    const { logout, currentUser } = useAuth();
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 576);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchStoreInfo = async () => {
            if (!storeId) return;
            try {
                const response = await storeService.getStoreById(storeId);
                setStoreInfo(response);
            } catch (error) {
                console.error('Error fetching store info:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStoreInfo();
    }, [storeId]);

    const handleLogout = () => {
        logout();
    };

    const toggleCollapsed = () => {
        setCollapsed(!collapsed);
    };

    const handleBackToAdmin = () => {
        navigate('/admin/dashboard');
    };

    const userMenuItems = [
        {
            key: 'profile',
            label: <Link to={`/store/${storeId}/profile`}>Thông tin cá nhân</Link>,
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
            key: `/store/${storeId}/quan-ly-don-hang`,
            icon: <ShoppingCartOutlined />,
            label: 'Quản lý đơn hàng'
        },
        {
            key: `/store/${storeId}/dashboard`,
            icon: <DashboardOutlined />,
            label: 'Tổng quan',
            hidden: currentUser?.role === 'staff'
        },
        {
            key: `/store/${storeId}/quan-ly-nhap-hang`,
            icon: <ImportOutlined />,
            label: 'Quản lý nhập hàng'
        },
        {
            key: `/store/${storeId}/quan-ly-nhan-vien`,
            icon: <TeamOutlined />,
            label: 'Quản lý nhân viên',
            hidden: currentUser?.role !== 'manager'
        },
        {
            key: `/store/${storeId}/quan-ly-sach`,
            icon: <BookOutlined />,
            label: 'Quản lý sách'
        },
        {
            key: `/store/${storeId}/quan-ly-van-phong-pham`,
            icon: <ShopOutlined />,
            label: 'Quản lý văn phòng phẩm'
        },
        {
            key: `/store/${storeId}/quan-ly-attribute`,
            icon: <TagsOutlined />,
            label: 'Quản lý thuộc tính',
            hidden: currentUser?.role === 'staff'
        },
        {
            key: `/store/${storeId}/quan-ly-khach-hang`,
            icon: <UserOutlined />,
            label: 'Quản lý khách hàng'
        },
        {
            key: `/store/${storeId}/notifications`,
            icon: <BellOutlined />,
            label: 'Thông báo'
        }
    ].filter(item => !item.hidden);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <Layout>
            <Sider 
                trigger={null} 
                collapsible 
                collapsed={collapsed}
                className={classNames(styles.sider, {
                    [styles.visible]: !collapsed || !isMobile
                })}
                theme="light"
                width={250}
            >
                <div className={styles.logo}>
                    {!collapsed ? (
                        <Title level={5} className={styles.storeName}>
                            {storeInfo?.name || 'Loading...'}
                        </Title>
                    ) : (
                        <Title level={5} className={styles.storeNameCollapsed}>
                            {storeInfo?.name?.charAt(0) || 'L'}
                        </Title>
                    )}
                </div>
                <div className={styles.siderContent}>
                    <Menu
                        theme="light"
                        mode="inline"
                        selectedKeys={[location.pathname]}
                        items={menuItems}
                        className={styles.menu}
                        onClick={({ key }) => navigate(key)}
                    />
                    {currentUser?.role === 'admin' && (
                        <div className={styles.backToAdminWrapper}>
                            <Button
                                type="primary"
                                icon={<ArrowLeftOutlined />}
                                onClick={handleBackToAdmin}
                                className={styles.backToAdminBtn}
                                block
                            >
                                {!collapsed && 'Quay lại Admin'}
                            </Button>
                        </div>
                    )}
                </div>
            </Sider>
            <Layout className={classNames(styles.mainLayout, {
                [styles.collapsed]: collapsed
            })}>
                <Header className={styles.header} style={{ background: colorBgContainer }}>
                    <div className={styles.headerLeft}>
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={toggleCollapsed}
                            className={styles.trigger}
                        />
                    </div>
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
                                    <span className={styles.userName}>
                                        {currentUser?.fullName || 'User'}
                                    </span>
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

export default StoreLayout;