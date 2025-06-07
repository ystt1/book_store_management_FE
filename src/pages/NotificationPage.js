import React from 'react';
import { Typography } from 'antd';
import NotificationList from '../components/notification/NotificationList';

const { Title } = Typography;

const NotificationPage = () => {
    return (
        <div style={{ padding: 24 }}>
            <Title level={2}>Thông báo</Title>
            <NotificationList />
        </div>
    );
};

export default NotificationPage; 