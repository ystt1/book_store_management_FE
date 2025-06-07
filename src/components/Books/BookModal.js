import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber, Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import styles from './BookModal.module.css';

const { TextArea } = Input;
const { Option } = Select;

const BookModal = ({
    isOpen,
    onClose,
    onSubmit,
    bookData,
    setBookData,
    mode,
    sampleCategories,
    samplePublishers,
    sampleSuppliers,
    isLoading
}) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (isOpen && bookData) {
            form.setFieldsValue({
                title: bookData.title,
                author: bookData.author,
                categories: bookData.categories,
                publisher: bookData.publisher,
                supplier: bookData.supplier,
                price: bookData.price,
                stock_quantity: bookData.stock_quantity,
                description: bookData.description
            });
        }
    }, [isOpen, bookData, form]);

    const handleSubmit = async (values) => {
        if (!values.categories || values.categories.length === 0) {
            message.error("Vui lòng chọn ít nhất một danh mục.");
            return;
        }
        await onSubmit(values);
    };

    const handleImageChange = (info) => {
        if (info.file.status === 'uploading') {
            return;
        }
        if (info.file.status === 'done') {
            // Get this url from response in real world
            setBookData(prev => ({
                ...prev,
                image: info.file.originFileObj,
                imagePreview: URL.createObjectURL(info.file.originFileObj)
            }));
        }
    };

    const uploadProps = {
        beforeUpload: (file) => {
            const isImage = file.type.startsWith('image/');
            if (!isImage) {
                message.error('Vui lòng chọn file hình ảnh!');
                return false;
            }
            const isLt5M = file.size / 1024 / 1024 < 5;
            if (!isLt5M) {
                message.error('Kích thước hình ảnh phải nhỏ hơn 5MB!');
                return false;
            }
            return false; // Return false to prevent auto upload
        },
        onChange: handleImageChange,
        showUploadList: false
    };

    return (
        <Modal
            title={mode === 'create' ? 'Thêm Sách Mới' : 'Cập Nhật Sách'}
            open={isOpen}
            onCancel={onClose}
            footer={null}
            width={800}
            destroyOnClose
            className={styles.bookModal}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={bookData}
                className={styles.form}
            >
                <Form.Item
                    name="title"
                    label="Tên Sách"
                    rules={[{ required: true, message: 'Vui lòng nhập tên sách!' }]}
                >
                    <Input placeholder="Nhập tên sách" disabled={isLoading} />
                </Form.Item>

                <Form.Item
                    name="author"
                    label="Tác Giả"
                    rules={[{ required: true, message: 'Vui lòng nhập tên tác giả!' }]}
                >
                    <Input placeholder="Nhập tên tác giả" disabled={isLoading} />
                </Form.Item>

                <Form.Item
                    name="categories"
                    label="Danh Mục"
                    rules={[{ required: true, message: 'Vui lòng chọn ít nhất một danh mục!' }]}
                >
                    <Select
                        mode="multiple"
                        placeholder="Chọn danh mục"
                        options={sampleCategories}
                        disabled={isLoading}
                    />
                </Form.Item>

                <Form.Item
                    name="publisher"
                    label="Nhà Xuất Bản"
                >
                    <Select
                        placeholder="Chọn nhà xuất bản"
                        options={samplePublishers}
                        disabled={isLoading}
                        allowClear
                    />
                </Form.Item>

                <Form.Item
                    name="supplier"
                    label="Nhà Cung Cấp"
                >
                    <Select
                        placeholder="Chọn nhà cung cấp"
                        options={sampleSuppliers}
                        disabled={isLoading}
                        allowClear
                    />
                </Form.Item>

                <Form.Item
                    name="price"
                    label="Giá"
                    rules={[{ required: true, message: 'Vui lòng nhập giá!' }]}
                >
                    <InputNumber
                        min={0}
                        placeholder="Nhập giá"
                        style={{ width: '100%' }}
                        disabled={isLoading}
                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    />
                </Form.Item>

                <Form.Item
                    name="stock_quantity"
                    label="Số Lượng"
                    rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}
                >
                    <InputNumber
                        min={0}
                        placeholder="Nhập số lượng"
                        style={{ width: '100%' }}
                        disabled={isLoading}
                    />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Mô Tả"
                >
                    <TextArea
                        rows={4}
                        placeholder="Nhập mô tả sách"
                        disabled={isLoading}
                    />
                </Form.Item>

                <Form.Item
                    label="Hình Ảnh"
                    className={styles.uploadContainer}
                >
                    <Upload {...uploadProps}>
                        <Button icon={<UploadOutlined />} disabled={isLoading}>
                            Chọn Hình Ảnh
                        </Button>
                    </Upload>
                    {bookData?.imagePreview && (
                        <div className={styles.imagePreview}>
                            <img src={bookData.imagePreview} alt="Preview" />
                        </div>
                    )}
                </Form.Item>

                <Form.Item className={styles.formActions}>
                    <Button onClick={onClose} disabled={isLoading}>
                        Hủy
                    </Button>
                    <Button type="primary" htmlType="submit" loading={isLoading}>
                        {mode === 'create' ? 'Thêm Sách' : 'Cập Nhật'}
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default BookModal;