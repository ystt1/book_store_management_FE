// src/pages/LoginPage.js
import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './LoginPage.module.css';

const LoginPage = () => {
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const result = await login(values.username, values.password);
            if (result.success) {
                message.success('Đăng nhập thành công!');
                // Chuyển hướng dựa trên vai trò từ response
                const { user } = result;
                const redirectPath = user.role === 'admin' 
                    ? '/admin/dashboard'
                    : `/store/${user.storeId}/dashboard`;
                
                // Sử dụng replace: true để thay thế history entry hiện tại
                navigate(redirectPath, { replace: true });
            } else {
                message.error(result.message || 'Đăng nhập thất bại');
            }
        } catch (error) {
            message.error('Đăng nhập thất bại: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.loginContainer}>
            <Card className={styles.loginCard}>
                <h1 className={styles.loginTitle}>Đăng Nhập</h1>
                <Form
                    name="login"
                    onFinish={onFinish}
                    autoComplete="off"
                    layout="vertical"
                >
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="Tên đăng nhập"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Mật khẩu"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            className={styles.loginButton}
                            size="large"
                            block
                        >
                            Đăng Nhập
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default LoginPage;