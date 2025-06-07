// src/components/Employees/EmployeeModal.js
import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import { useAuth } from '../../contexts/AuthContext';
import styles from './EmployeeModal.module.css';

const { Option } = Select;

const EmployeeModal = ({ isOpen, onClose, onSubmit, currentEmployee, mode }) => {
    const [form] = Form.useForm();
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && currentEmployee) {
            form.setFieldsValue({
                username: currentEmployee.username,
                full_name_user: currentEmployee.full_name_user,
                email_user: currentEmployee.email_user,
                phone_employee: currentEmployee.phone_employee,
                role: currentEmployee.role,
                position: currentEmployee.position,
                base_salary: currentEmployee.base_salary
            });
        } else {
            form.resetFields();
        }
    }, [isOpen, currentEmployee, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            await onSubmit(values);
            onClose();
        } catch (error) {
            console.error('Form validation failed:', error);
            message.error('Vui lòng kiểm tra lại thông tin!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={mode === 'add' ? "Thêm nhân viên mới" : "Chỉnh sửa thông tin nhân viên"}
            open={isOpen}
            onOk={handleSubmit}
            onCancel={onClose}
            confirmLoading={loading}
            width={600}
        >
            <Form
                form={form}
                layout="vertical"
                className={styles.employeeForm}
            >
                <Form.Item
                    name="username"
                    label="Tên đăng nhập"
                    rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
                >
                    <Input disabled={mode === 'edit'} />
                </Form.Item>

                {mode === 'add' && (
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
                    rules={[
                        { required: true, message: 'Vui lòng nhập email' },
                        { type: 'email', message: 'Email không hợp lệ' }
                    ]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="phone_employee"
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
                    <Select disabled={mode === 'edit'}>
                        {currentUser?.role === 'admin' ? (
                            <>
                                <Option value="manager">Quản lý</Option>
                                <Option value="staff">Nhân viên</Option>
                            </>
                        ) : (
                            <Option value="staff">Nhân viên</Option>
                        )}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="position"
                    label="Chức vụ"
                    rules={[{ required: true, message: 'Vui lòng nhập chức vụ' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="base_salary"
                    label="Lương cơ bản"
                    rules={[{ required: true, message: 'Vui lòng nhập lương cơ bản' }]}
                >
                    <Input type="number" min={0} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default EmployeeModal;