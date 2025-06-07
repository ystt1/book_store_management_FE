import React, { useState, useEffect } from 'react';
import {
    Row,
    Col,
    Card,
    Table,
    Tag,
    Space,
    Typography,
    message
} from 'antd';
import SendNotification from '../../components/notification/SendNotification';
import { notificationService } from '../../services/notification.service';
import moment from 'moment';

const { Title } = Typography;

const NotificationManagement = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const data = await notificationService.getAllNotifications();
            setNotifications(data);
        } catch (error) {
            message.error('Không thể tải danh sách thông báo');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Tiêu đề',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Nội dung',
            dataIndex: 'content',
            key: 'content',
            ellipsis: true,
        },
        {
            title: 'Vai trò',
            dataIndex: 'targetRoles',
            key: 'targetRoles',
            render: roles => (
                <Space>
                    {roles.map(role => (
                        <Tag key={role} color={role === 'manager' ? 'blue' : 'green'}>
                            {role === 'manager' ? 'Quản lý' : 'Nhân viên'}
                        </Tag>
                    ))}
                </Space>
            ),
        },
        {
            title: 'Phạm vi',
            key: 'scope',
            render: record => (
                record.isGlobal ? (
                    <Tag color="purple">Tất cả cửa hàng</Tag>
                ) : (
                    <span>{record.targetStores?.length || 0} cửa hàng</span>
                )
            ),
        },
        {
            title: 'Đã đọc',
            key: 'readCount',
            render: record => (
                <span>{record.readBy?.length || 0} người dùng</span>
            ),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: date => moment(date).format('DD/MM/YYYY HH:mm'),
            sorter: (a, b) => moment(a.createdAt).unix() - moment(b.createdAt).unix(),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Title level={2}>Quản lý thông báo</Title>
            <Row gutter={[24, 24]}>
                <Col xs={24} lg={8}>
                    <SendNotification onSuccess={fetchNotifications} />
                </Col>
                <Col xs={24} lg={16}>
                    <Card title="Danh sách thông báo">
                        <Table
                            columns={columns}
                            dataSource={notifications}
                            loading={loading}
                            rowKey="_id"
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default NotificationManagement; 