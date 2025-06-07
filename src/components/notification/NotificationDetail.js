import React from 'react';
import { Modal, Typography, Space, Descriptions, Tag } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Text, Title } = Typography;

const NotificationDetail = ({ notification, visible, onClose }) => {
    if (!notification) return null;

    return (
        <Modal
            title={
                <Space align="center">
                    <Title level={4} style={{ margin: 0 }}>Chi tiết thông báo</Title>
                    {notification.isRead && (
                        <Tag icon={<CheckCircleOutlined />} color="success">
                            Đã đọc
                        </Tag>
                    )}
                </Space>
            }
            open={visible}
            onCancel={onClose}
            footer={null}
            width={600}
        >
            <Descriptions column={1} bordered>
                <Descriptions.Item label="Tiêu đề">
                    <Text strong>{notification.title}</Text>
                </Descriptions.Item>
                
                <Descriptions.Item label="Người gửi">
                    <Text>{notification.sender?.fullName || 'Admin'}</Text>
                </Descriptions.Item>

                <Descriptions.Item label="Thời gian">
                    <Text>{moment(notification.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
                </Descriptions.Item>

                <Descriptions.Item label="Nội dung">
                    <div style={{ whiteSpace: 'pre-wrap' }}>
                        <Text>{notification.content}</Text>
                    </div>
                </Descriptions.Item>

                {notification.isRead && (
                    <Descriptions.Item label="Đã đọc lúc">
                        <Text>{moment(notification.readAt).format('DD/MM/YYYY HH:mm')}</Text>
                    </Descriptions.Item>
                )}
            </Descriptions>
        </Modal>
    );
};

export default NotificationDetail; 