import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import userService from '../services/userService';
import storeService from '../services/storeService';
import styles from './UserManagementPage.module.css';

const { Option } = Select;

const UserManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingId, setEditingId] = useState(null);
    const { currentUser } = useAuth();

    const columns = [
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: 'Họ và tên',
            dataIndex: 'fullName',
            key: 'fullName',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            render: (role) => {
                const roleMap = {
                    'admin': 'Quản trị viên',
                    'manager': 'Quản lý',
                    'staff': 'Nhân viên'
                };
                return roleMap[role] || role;
            }
        },
        {
            title: 'Cửa hàng',
            dataIndex: 'storeName',
            key: 'storeName',
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        Sửa
                    </Button>
                    <Button
                        onClick={() => handleResetPassword(record._id)}
                        title="Đặt lại mật khẩu về 123456"
                    >
                        Reset MK
                    </Button>
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record._id)}
                    >
                        Xóa
                    </Button>
                </Space>
            ),
        },
    ];

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await userService.getAllUsers();
            console.log('Raw response:', response);
            
            // Map dữ liệu từ response
            const formattedUsers = response.employees.map(emp => ({
                key: emp._id,
                _id: emp._id,
                username: emp.user_id?.username || '',
                fullName: emp.user_id?.fullName || '',
                email: emp.user_id?.email || '',
                role: emp.user_id?.role || '',
                phone: emp.phone || emp.user_id?.phone || '',
                storeName: emp.store_id?.name || 'N/A',
                storeId: emp.store_id?._id
            }));

            console.log('Formatted users:', formattedUsers);
            setUsers(formattedUsers);
        } catch (error) {
            console.error('Error fetching users:', error);
            message.error('Không thể tải danh sách người dùng!');
        } finally {
            setLoading(false);
        }
    };

    const fetchStores = async () => {
        try {
            const response = await storeService.getAllStores();
            setStores(response);
        } catch (error) {
            message.error('Không thể tải danh sách cửa hàng!');
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchStores();
    }, []);

    const handleEdit = (record) => {
        console.log('Editing record:', record);
        setEditingId(record._id);
        // Set form values với dữ liệu hiện tại
        form.setFieldsValue({
            username: record.username,
            full_name_user: record.fullName,
            email_user: record.email,
            phone: record.phone,
            role: record.role,
            storeId: record.storeId
        });
        setModalVisible(true);
    };

    const handleResetPassword = async (userId) => {
        try {
            await userService.resetPassword(userId);
            message.success('Đặt lại mật khẩu thành công! Mật khẩu mới là: 123456');
        } catch (error) {
            console.error('Error in handleResetPassword:', error);
            message.error(error.message || 'Không thể đặt lại mật khẩu');
        }
    };

    const handleDelete = async (id) => {
        try {
            await userService.deleteUser(id);
            message.success('Xóa người dùng thành công!');
            fetchUsers();
        } catch (error) {
            message.error('Xóa người dùng thất bại!');
        }
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            
            if (editingId) {
                console.log('Submitting edit with values:', values);
                await userService.updateUser(editingId, values);
                message.success('Cập nhật người dùng thành công');
            } else {
                await userService.createUser(values);
                message.success('Tạo người dùng thành công');
            }
            
            setModalVisible(false);
            form.resetFields();
            setEditingId(null);
            fetchUsers(); // Refresh danh sách
        } catch (error) {
            console.error('Error in handleModalOk:', error);
            message.error(error.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const handleModalCancel = () => {
        setModalVisible(false);
        form.resetFields();
        setEditingId(null);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Quản Lý Người Dùng</h2>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setEditingId(null);
                        form.resetFields();
                        setModalVisible(true);
                    }}
                >
                    Thêm Người Dùng
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={users}
                loading={loading}
                rowKey="_id"
                pagination={{
                    defaultPageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} người dùng`
                }}
            />

            <Modal
                title={editingId ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
                open={modalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
                confirmLoading={loading}
            >
                <Form
                    form={form}
                    layout="vertical"
                >
                    <Form.Item
                        name="username"
                        label="Tên đăng nhập"
                        rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
                    >
                        <Input disabled={!!editingId} />
                    </Form.Item>
                    
                    {!editingId && (
                        <Form.Item
                            name="password"
                            label="Mật khẩu"
                            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
                        >
                            <Input.Password />
                        </Form.Item>
                    )}
                    
                    <Form.Item
                        name="full_name_user"
                        label="Họ và tên"
                        rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
                    >
                        <Input />
                    </Form.Item>
                    
                    <Form.Item
                        name="email_user"
                        label="Email"
                        rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ' }]}
                    >
                        <Input />
                    </Form.Item>
                    
                    <Form.Item
                        name="phone"
                        label="Số điện thoại"
                        rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                    >
                        <Input />
                    </Form.Item>
                    
                    <Form.Item
                        name="role"
                        label="Vai trò"
                        rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
                    >
                        <Select disabled={!!editingId}>
                            <Option value="admin">Quản trị viên</Option>
                            <Option value="manager">Quản lý</Option>
                            <Option value="staff">Nhân viên</Option>
                        </Select>
                    </Form.Item>
                    
                    <Form.Item
                        name="storeId"
                        label="Cửa hàng"
                        rules={[{ required: true, message: 'Vui lòng chọn cửa hàng' }]}
                    >
                        <Select disabled={!!editingId}>
                            {stores?.map(store => (
                                <Option key={store._id} value={store._id}>{store.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default UserManagementPage; 