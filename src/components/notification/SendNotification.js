import React, { useState, useEffect } from 'react';
import {
    Form,
    Input,
    Button,
    Select,
    Card,
    message,
    Switch,
    Space
} from 'antd';
import { notificationService } from '../../services/notification.service';
import storeService from '../../services/storeService';

const { TextArea } = Input;
const { Option } = Select;

const SendNotification = ({ onSuccess }) => {
    const [form] = Form.useForm();
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isGlobal, setIsGlobal] = useState(false);

    useEffect(() => {
        fetchStores();
    }, []);

    const fetchStores = async () => {
        try {
            const response = await storeService.getAllStores();
            setStores(response);
        } catch (error) {
            message.error('Không thể tải danh sách cửa hàng');
        }
    };

    const onFinish = async (values) => {
        try {
            setLoading(true);
            const response = await notificationService.createNotification({
                ...values,
                isGlobal,
                targetStores: isGlobal ? [] : values.targetStores
            });
            message.success('Đã gửi thông báo thành công');
            form.resetFields();
            if (onSuccess) {
                onSuccess(); // Gọi callback để cập nhật danh sách
            }
        } catch (error) {
            message.error('Không thể gửi thông báo');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="Gửi thông báo">
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
            >
                <Form.Item
                    name="title"
                    label="Tiêu đề"
                    rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
                >
                    <Input placeholder="Nhập tiêu đề thông báo" />
                </Form.Item>

                <Form.Item
                    name="content"
                    label="Nội dung"
                    rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
                >
                    <TextArea
                        rows={4}
                        placeholder="Nhập nội dung thông báo"
                    />
                </Form.Item>

                <Form.Item
                    name="targetRoles"
                    label="Gửi đến vai trò"
                    rules={[{ required: true, message: 'Vui lòng chọn ít nhất một vai trò' }]}
                >
                    <Select
                        mode="multiple"
                        placeholder="Chọn vai trò"
                        allowClear
                    >
                        <Option value="manager">Quản lý</Option>
                        <Option value="staff">Nhân viên</Option>
                    </Select>
                </Form.Item>

                <Form.Item label="Phạm vi gửi">
                    <Space>
                        <Switch
                            checked={isGlobal}
                            onChange={(checked) => setIsGlobal(checked)}
                        />
                        <span>Gửi đến tất cả cửa hàng</span>
                    </Space>
                </Form.Item>

                {!isGlobal && (
                    <Form.Item
                        name="targetStores"
                        label="Gửi đến cửa hàng"
                        rules={[{ required: true, message: 'Vui lòng chọn ít nhất một cửa hàng' }]}
                    >
                        <Select
                            mode="multiple"
                            placeholder="Chọn cửa hàng"
                            allowClear
                            showSearch
                            optionFilterProp="children"
                        >
                            {stores.map(store => (
                                <Option key={store._id} value={store._id}>
                                    {store.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                )}

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Gửi thông báo
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default SendNotification; 