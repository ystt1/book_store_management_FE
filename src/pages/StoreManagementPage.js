import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import storeService from '../services/storeService';
import styles from './StoreManagementPage.module.css';

const StoreManagementPage = () => {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingId, setEditingId] = useState(null);
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const columns = [
        {
            title: 'Mã cửa hàng',
            dataIndex: '_id',
            key: '_id',
        },
        {
            title: 'Tên cửa hàng',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            key: 'address',
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="primary"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewDetails(record._id)}
                    >
                        Chi tiết
                    </Button>
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        Sửa
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

    const fetchStores = async () => {
        setLoading(true);
        try {
            const response = await storeService.getAllStores();
            setStores(response);
        } catch (error) {
            message.error('Không thể tải danh sách cửa hàng!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStores();
    }, []);

    const handleViewDetails = (storeId) => {
        if (!storeId) {
            message.error('Không tìm thấy thông tin cửa hàng!');
            return;
        }
        navigate(`/admin/stores/${storeId}`);
    };

    const handleEdit = (record) => {
        if (!record || !record._id) {
            message.error('Không tìm thấy thông tin cửa hàng!');
            return;
        }
        setEditingId(record._id);
        form.setFieldsValue(record);
        setModalVisible(true);
    };

    const handleDelete = async (id) => {
        if (!id) {
            message.error('Không tìm thấy thông tin cửa hàng!');
            return;
        }
        try {
            await storeService.deleteStore(id);
            message.success('Xóa cửa hàng thành công!');
            fetchStores();
        } catch (error) {
            message.error('Xóa cửa hàng thất bại!');
        }
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            if (editingId) {
                await storeService.updateStore(editingId, values);
                message.success('Cập nhật cửa hàng thành công!');
            } else {
                await storeService.createStore(values);
                message.success('Thêm cửa hàng thành công!');
            }
            setModalVisible(false);
            form.resetFields();
            setEditingId(null);
            fetchStores();
        } catch (error) {
            message.error('Xử lý thất bại: ' + error.message);
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
                <h2>Quản Lý Cửa Hàng</h2>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setEditingId(null);
                        form.resetFields();
                        setModalVisible(true);
                    }}
                >
                    Thêm Cửa Hàng
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={stores}
                loading={loading}
                rowKey="_id"
            />

            <Modal
                title={editingId ? 'Sửa Cửa Hàng' : 'Thêm Cửa Hàng'}
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
                        name="name"
                        label="Tên cửa hàng"
                        rules={[{ required: true, message: 'Vui lòng nhập tên cửa hàng!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="address"
                        label="Địa chỉ"
                        rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="phone"
                        label="Số điện thoại"
                        rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email!' },
                            { type: 'email', message: 'Email không hợp lệ!' }
                        ]}
                    >
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default StoreManagementPage; 