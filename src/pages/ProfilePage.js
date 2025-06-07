import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import userService from '../services/userService';
import {
    Card,
    Avatar,
    Form,
    Input,
    Button,
    Tabs,
    message,
    Upload,
    Descriptions,
    Modal,
    Divider,
    Space
} from 'antd';
import {
    UserOutlined,
    LockOutlined,
    MailOutlined,
    PhoneOutlined,
    UploadOutlined
} from '@ant-design/icons';
import styles from './ProfilePage.module.css';

const { TabPane } = Tabs;

const ProfilePage = () => {
    const { currentUser, updateCurrentUser } = useAuth();
    const [form] = Form.useForm();
    const [passwordForm] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [profileData, setProfileData] = useState(null);
    const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);

    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        try {
            const data = await userService.getProfile();
            setProfileData(data);
            form.setFieldsValue({
                fullName: data.fullName,
                email: data.email,
                phone: data.phone,
                username: data.username
            });
        } catch (error) {
            message.error('Không thể tải thông tin profile.');
        }
    };

    const handleUpdateProfile = async (values) => {
        try {
            setLoading(true);
            const response = await userService.updateProfile(values);
            message.success('Cập nhật thông tin thành công!');
            updateCurrentUser(response.user);
            await fetchProfileData();
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin!');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (values) => {
        try {
            setLoading(true);
            await userService.changePassword(values);
            message.success('Đổi mật khẩu thành công!');
            setIsPasswordModalVisible(false);
            passwordForm.resetFields();
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu!');
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarChange = async (info) => {
        if (info.file.status === 'uploading') {
            setLoading(true);
            return;
        }
        if (info.file.status === 'done') {
            setLoading(false);
            message.success('Cập nhật ảnh đại diện thành công!');
            updateCurrentUser({ ...currentUser, avatar: info.file.response.avatar });
            await fetchProfileData();
        } else if (info.file.status === 'error') {
            setLoading(false);
            message.error('Có lỗi xảy ra khi tải ảnh lên!');
        }
    };

    const uploadProps = {
        name: 'avatar',
        action: `${process.env.REACT_APP_API_URL}/users/profile/avatar`,
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        beforeUpload: (file) => {
            const isImage = file.type.startsWith('image/');
            if (!isImage) {
                message.error('Bạn chỉ có thể tải lên file ảnh!');
            }
            const isLt5M = file.size / 1024 / 1024 < 5;
            if (!isLt5M) {
                message.error('Ảnh phải nhỏ hơn 5MB!');
            }
            return isImage && isLt5M;
        },
    };

    if (!profileData) {
        return null; // hoặc loading spinner
    }

    return (
        <div className={styles.profilePage}>
            <Card className={styles.profileCard}>
                <div className={styles.header}>
                    <div className={styles.avatarSection}>
                        <Avatar
                            size={120}
                            icon={<UserOutlined />}
                            src={profileData.avatar}
                            className={styles.avatar}
                        />
                        <Upload
                            {...uploadProps}
                            showUploadList={false}
                            onChange={handleAvatarChange}
                        >
                            <Button icon={<UploadOutlined />}>Thay đổi ảnh</Button>
                        </Upload>
                    </div>
                    <div className={styles.userInfo}>
                        <h2>{profileData.fullName}</h2>
                        <p>{profileData.role === 'admin' ? 'Quản trị viên' : 
                           profileData.role === 'manager' ? 'Quản lý' : 'Nhân viên'}</p>
                    </div>
                </div>

                <Divider />

                <Tabs defaultActiveKey="info">
                    <TabPane tab="Thông tin cá nhân" key="info">
                        <Descriptions bordered column={1}>
                            <Descriptions.Item label="Họ và tên">{profileData.fullName}</Descriptions.Item>
                            <Descriptions.Item label="Email">{profileData.email}</Descriptions.Item>
                            <Descriptions.Item label="Số điện thoại">{profileData.phone}</Descriptions.Item>
                            <Descriptions.Item label="Tên đăng nhập">{profileData.username}</Descriptions.Item>
                            <Descriptions.Item label="Vai trò">
                                {profileData.role === 'admin' ? 'Quản trị viên' : 
                                 profileData.role === 'manager' ? 'Quản lý' : 'Nhân viên'}
                            </Descriptions.Item>
                            {profileData.employeeInfo && (
                                <>
                                    <Descriptions.Item label="Vị trí">{profileData.employeeInfo.position}</Descriptions.Item>
                                    <Descriptions.Item label="Lương cơ bản">{profileData.employeeInfo.base_salary}</Descriptions.Item>
                                </>
                            )}
                        </Descriptions>

                        <div className={styles.actionButtons}>
                            <Space>
                                <Button type="primary" onClick={() => form.submit()}>
                                    Chỉnh sửa thông tin
                                </Button>
                                <Button onClick={() => setIsPasswordModalVisible(true)}>
                                    Đổi mật khẩu
                                </Button>
                            </Space>
                        </div>
                    </TabPane>

                    <TabPane tab="Chỉnh sửa thông tin" key="edit">
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleUpdateProfile}
                        >
                            <Form.Item
                                name="fullName"
                                label="Họ và tên"
                                rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                            >
                                <Input prefix={<UserOutlined />} placeholder="Họ và tên" />
                            </Form.Item>

                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập email!' },
                                    { type: 'email', message: 'Email không hợp lệ!' }
                                ]}
                            >
                                <Input prefix={<MailOutlined />} placeholder="Email" />
                            </Form.Item>

                            <Form.Item
                                name="phone"
                                label="Số điện thoại"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập số điện thoại!' },
                                    { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ!' }
                                ]}
                            >
                                <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại" />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" loading={loading}>
                                    Cập nhật thông tin
                                </Button>
                            </Form.Item>
                        </Form>
                    </TabPane>
                </Tabs>
            </Card>

            <Modal
                title="Đổi mật khẩu"
                open={isPasswordModalVisible}
                onCancel={() => setIsPasswordModalVisible(false)}
                footer={null}
            >
                <Form
                    form={passwordForm}
                    layout="vertical"
                    onFinish={handleChangePassword}
                >
                    <Form.Item
                        name="currentPassword"
                        label="Mật khẩu hiện tại"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu hiện tại" />
                    </Form.Item>

                    <Form.Item
                        name="newPassword"
                        label="Mật khẩu mới"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu mới" />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        label="Xác nhận mật khẩu mới"
                        dependencies={['newPassword']}
                        rules={[
                            { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Xác nhận mật khẩu mới" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Đổi mật khẩu
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ProfilePage; 