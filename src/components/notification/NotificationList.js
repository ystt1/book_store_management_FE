import React, { useState, useEffect } from 'react';
import {
    List,
    Card,
    Badge,
    Typography,
    message,
    Space,
    Tag
} from 'antd';
import { BellOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { notificationService } from '../../services/notification.service';
import NotificationDetail from './NotificationDetail';
import moment from 'moment';
import './NotificationList.css';

const { Text, Title } = Typography;

const NotificationList = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const data = await notificationService.getUserNotifications();
            setNotifications(data);
        } catch (error) {
            message.error('Không thể tải thông báo');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            await notificationService.markAsRead(notificationId);
            setNotifications(notifications.map(notification => 
                notification._id === notificationId 
                    ? { ...notification, isRead: true }
                    : notification
            ));
            message.success('Đã đánh dấu là đã đọc');
        } catch (error) {
            message.error('Không thể đánh dấu thông báo');
        }
    };

    const handleNotificationClick = async (notification) => {
        setSelectedNotification(notification);
        setModalVisible(true);
        
        if (!notification.isRead) {
            await handleMarkAsRead(notification._id);
        }
    };

    return (
        <>
            <Card title={
                <Space>
                    <BellOutlined />
                    <span>Thông báo của bạn</span>
                </Space>
            }>
                <List
                    loading={loading}
                    itemLayout="vertical"
                    dataSource={notifications}
                    renderItem={notification => (
                        <List.Item
                            className="notification-item"
                            onClick={() => handleNotificationClick(notification)}
                            actions={[
                                !notification.isRead && (
                                    <a 
                                        key="mark-read" 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleMarkAsRead(notification._id);
                                        }}
                                    >
                                        Đánh dấu đã đọc
                                    </a>
                                )
                            ]}
                        >
                            <List.Item.Meta
                                title={
                                    <Space>
                                        {!notification.isRead && (
                                            <Badge status="processing" />
                                        )}
                                        <Title level={5}>{notification.title}</Title>
                                    </Space>
                                }
                                description={
                                    <Space direction="vertical">
                                        <Text type="secondary">
                                            Từ: {notification.sender?.fullName || 'Admin'}
                                        </Text>
                                        <Text type="secondary">
                                            {moment(notification.createdAt).format('DD/MM/YYYY HH:mm')}
                                        </Text>
                                        {notification.isRead && (
                                            <Tag icon={<CheckCircleOutlined />} color="success">
                                                Đã đọc
                                            </Tag>
                                        )}
                                    </Space>
                                }
                            />
                            <div style={{ marginTop: 16 }}>
                                <Text>{notification.content.slice(0, 100)}...</Text>
                            </div>
                        </List.Item>
                    )}
                />
            </Card>

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

export default NotificationList; 