// src/components/Stationery/StationeryModal.js
import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, Upload, Button, message, Row, Col, Space } from 'antd';
import { UploadOutlined, LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import styles from './StationeryModal.module.css';

const { TextArea } = Input;

// Dữ liệu mẫu cho select (nếu có) - ví dụ Nhà cung cấp
// Bạn sẽ fetch từ API hoặc truyền từ StationeryManagementPage

// Nếu có danh mục VPP, tương tự
// const sampleStationeryCategories = [ { value: 'SCAT01', label: 'Bút viết'} ];

const StationeryModal = ({ isOpen, onClose, onSubmit, currentStationery, mode, sampleSuppliers }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [imageFile, setImageFile] = useState(null);

    useEffect(() => {
        if (isOpen && currentStationery) {
            form.setFieldsValue({
                ...currentStationery,
                supplier_id: currentStationery.supplier_id?.value || currentStationery.supplier_id,
            });
            setImageUrl(currentStationery.imagePreview || '');
        }
    }, [isOpen, currentStationery, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            await onSubmit({
                ...values,
                image: imageFile,
                imagePreview: imageUrl,
            });
            handleClose();
        } catch (error) {
            console.error('Validation failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        form.resetFields();
        setImageUrl('');
        setImageFile(null);
        onClose();
    };

    const handleImageChange = async (info) => {
        console.log('Upload event:', info);
        
        if (info.file.status === 'uploading') {
            setLoading(true);
            return;
        }
        
        if (info.fileList && info.fileList.length > 0) {
            const file = info.fileList[0].originFileObj;
            if (file) {
                try {
                    const reader = new FileReader();
                    reader.onload = () => {
                        setImageUrl(reader.result);
                        setImageFile(file);
                        setLoading(false);
                    };
                    reader.onerror = () => {
                        console.error('Error reading file');
                        setLoading(false);
                    };
                    reader.readAsDataURL(file);
                } catch (error) {
                    console.error('Error handling image:', error);
                    setLoading(false);
                }
            }
        } else {
            setImageUrl('');
            setImageFile(null);
            setLoading(false);
        }
    };

    return (
        <Modal
            title={mode === 'add' ? 'Thêm Văn Phòng Phẩm Mới' : 'Chỉnh Sửa Văn Phòng Phẩm'}
            open={isOpen}
            onCancel={handleClose}
            footer={null}
            width={800}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                className={styles.form}
            >
                <Row gutter={16}>
                    <Col span={16}>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="name"
                                    label="Tên sản phẩm"
                                    rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
                                >
                                    <Input placeholder="Nhập tên sản phẩm" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="supplier_id"
                                    label="Nhà cung cấp"
                                    rules={[{ required: true, message: 'Vui lòng chọn nhà cung cấp' }]}
                                >
                                    <Select
                                        placeholder="Chọn nhà cung cấp"
                                        options={sampleSuppliers}
                                        showSearch
                                        optionFilterProp="children"
                                        filterOption={(input, option) =>
                                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                        }
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="price"
                                    label="Giá"
                                    rules={[{ required: true, message: 'Vui lòng nhập giá sản phẩm' }]}
                                >
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                        placeholder="Nhập giá sản phẩm"
                                        min={0}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="stock"
                                    label="Tồn kho"
                                    rules={[{ required: true, message: 'Vui lòng nhập số lượng tồn kho' }]}
                                >
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        min={0}
                                        placeholder="Nhập số lượng tồn kho"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item
                            name="description"
                            label="Mô tả"
                        >
                            <TextArea
                                placeholder="Nhập mô tả sản phẩm"
                                autoSize={{ minRows: 4, maxRows: 6 }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label="Hình ảnh"
                            name="image"
                        >
                            <Upload
                                name="avatar"
                                listType="picture-card"
                                className={styles.avatarUploader}
                                showUploadList={false}
                                beforeUpload={(file) => {
                                    const isImage = file.type.startsWith('image/');
                                    if (!isImage) {
                                        message.error('Bạn chỉ có thể tải lên file hình ảnh!');
                                        return false;
                                    }
                                    const isLt2M = file.size / 1024 / 1024 < 2;
                                    if (!isLt2M) {
                                        message.error('Hình ảnh phải nhỏ hơn 2MB!');
                                        return false;
                                    }
                                    return false;
                                }}
                                onChange={handleImageChange}
                                accept="image/*"
                                maxCount={1}
                            >
                                {imageUrl ? (
                                    <img
                                        src={imageUrl}
                                        alt="avatar"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : currentStationery?.image ? (
                                    <img
                                        src={`${process.env.REACT_APP_API_URL}${currentStationery.image}`}
                                        alt="current"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div>
                                        {loading ? <LoadingOutlined /> : <PlusOutlined />}
                                        <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                                    </div>
                                )}
                            </Upload>
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item>
                    <Space>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            {mode === 'add' ? 'Thêm mới' : 'Cập nhật'}
                        </Button>
                        <Button onClick={handleClose}>Hủy</Button>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    );
};

StationeryModal.defaultProps = {
    sampleSuppliers: []
};

export default StationeryModal;