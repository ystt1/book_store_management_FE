import React, { useState, useEffect } from 'react';
import { Badge, Popover, List, Typography, Empty, Spin } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { notificationService } from '../../services/notification.service';
import NotificationDetail from './NotificationDetail';
import { Link } from 'react-router-dom';
import moment from 'moment';

const { Text } = Typography;

const NotificationBadge = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [popoverVisible, setPopoverVisible] = useState(false);

    useEffect(() => {
        fetchNotifications();
        // Refresh notifications every 5 minutes
        const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const data = await notificationService.getUserNotifications();
            setNotifications(data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationClick = async (notification) => {
        setSelectedNotification(notification);
        setModalVisible(true);
        setPopoverVisible(false);

        if (!notification.isRead) {
            try {
                await notificationService.markAsRead(notification._id);
                setNotifications(notifications.map(n => 
                    n._id === notification._id ? { ...n, isRead: true } : n
                ));
            } catch (error) {
                console.error('Error marking notification as read:', error);
            }
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const notificationList = (
        <div style={{ width: 300, maxHeight: 400, overflow: 'auto' }}>
            <Spin spinning={loading}>
                {notifications.length > 0 ? (
                    <List
                        itemLayout="vertical"
                        dataSource={notifications.slice(0, 5)}
                        renderItem={notification => (
                            <List.Item
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <List.Item.Meta
                                    title={
                                        <Text strong={!notification.isRead}>
                                            {notification.title}
                                        </Text>
                                    }
                                    description={
                                        <>
                                            <Text type="secondary">
                                                Từ: {notification.sender?.fullName || 'Admin'}
                                            </Text>
                                            <br />
                                            <Text type="secondary">
                                                {moment(notification.createdAt).fromNow()}
                                            </Text>
                                        </>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                ) : (
                    <Empty description="Không có thông báo" />
                )}
                <div
                    style={{
                        textAlign: 'center',
                        margin: '12px 0',
                        borderTop: '1px solid #f0f0f0',
                        paddingTop: 12
                    }}
                >
                    <Link to="/notifications" onClick={() => setPopoverVisible(false)}>
                        Xem tất cả thông báo
                    </Link>
                </div>
            </Spin>
        </div>
    );

    return (
        <>
            <Popover
                content={notificationList}
                trigger="click"
                placement="bottomRight"
                title="Thông báo"
                open={popoverVisible}
                onOpenChange={setPopoverVisible}
            >
                <Badge count={unreadCount} style={{ cursor: 'pointer' }}>
                    <BellOutlined style={{ fontSize: 20 }} />
                </Badge>
            </Popover>

            <NotificationDetail
                notification={selectedNotification}
                visible={modalVisible}
                onClose={() => {
                    setModalVisible(false);
                    setSelectedNotification(null);
                }}
            />
        </>
    );
};

export default NotificationBadge; 