import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Button, Spin, message, Row, Col, Statistic } from 'antd';
import { ArrowLeftOutlined, LoginOutlined, ShoppingOutlined, TeamOutlined, BookOutlined, DollarOutlined } from '@ant-design/icons';
import storeService from '../services/storeService';
import styles from './StoreDetailPage.module.css';

const StoreDetailPage = () => {
    const { storeId } = useParams();
    const navigate = useNavigate();
    const [store, setStore] = useState(null);
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStoreDetails = async () => {
            try {
                const [storeData, statsData] = await Promise.all([
                    storeService.getStoreById(storeId),
                    storeService.getStoreStatistics(storeId)
                ]);
                setStore(storeData);
                setStatistics(statsData);
            } catch (error) {
                message.error('Không thể tải thông tin cửa hàng: ' + error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStoreDetails();
    }, [storeId]);

    const handleAccessAsManager = () => {
        // Lưu thông tin cửa hàng vào localStorage
        localStorage.setItem('currentStore', JSON.stringify(store));
        // Chuyển hướng đến trang dashboard của cửa hàng
        navigate(`/store/${storeId}/dashboard`);
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <Spin size="large" />
            </div>
        );
    }

    if (!store) {
        return (
            <div className={styles.errorContainer}>
                <h2>Không tìm thấy thông tin cửa hàng</h2>
                <Button type="primary" onClick={() => navigate('/admin/stores')}>
                    Quay lại
                </Button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/admin/stores')}
                    className={styles.backButton}
                >
                    Quay lại
                </Button>
                <Button
                    type="primary"
                    icon={<LoginOutlined />}
                    onClick={handleAccessAsManager}
                    className={styles.accessButton}
                >
                    Truy cập với vai trò quản lý
                </Button>
            </div>

            <Row gutter={[16, 16]} className={styles.statisticsRow}>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Tổng đơn hàng"
                            value={statistics?.totalOrders || 0}
                            prefix={<ShoppingOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Tổng doanh thu"
                            value={statistics?.totalRevenue || 0}
                            prefix={<DollarOutlined />}
                            suffix="đ"
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Tổng nhân viên"
                            value={statistics?.totalEmployees || 0}
                            prefix={<TeamOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Tổng sách"
                            value={statistics?.totalBooks || 0}
                            prefix={<BookOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            <Card title="Thông tin chi tiết cửa hàng" className={styles.card}>
                <Descriptions bordered>
                    <Descriptions.Item label="Mã cửa hàng" span={3}>
                        {store._id}
                    </Descriptions.Item>
                    <Descriptions.Item label="Tên cửa hàng" span={3}>
                        {store.name}
                    </Descriptions.Item>
                    <Descriptions.Item label="Địa chỉ" span={3}>
                        {store.address}
                    </Descriptions.Item>
                    <Descriptions.Item label="Số điện thoại" span={3}>
                        {store.phone}
                    </Descriptions.Item>
                    <Descriptions.Item label="Email" span={3}>
                        {store.email}
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái" span={3}>
                        {store.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                    </Descriptions.Item>
                </Descriptions>
            </Card>
        </div>
    );
};

export default StoreDetailPage; 