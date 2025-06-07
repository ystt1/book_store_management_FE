// src/components/Books/BookDetailsView.js
import React from 'react';
import { Drawer, Descriptions, Button, Image, Space } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import styles from './BookDetailsView.module.css';

const BookDetailsView = ({ book, onClose, onEdit }) => {
    if (!book) return null;

    return (
        <Drawer
            title={`Chi tiết sách: ${book.title}`}
            placement="right"
            onClose={onClose}
            open={true}
            width={600}
            extra={
                <Space>
                    <Button type="primary" icon={<EditOutlined />} onClick={() => onEdit(book)}>
                        Chỉnh sửa
                    </Button>
                </Space>
            }
        >
            <div className={styles.detailsContainer}>
                <div className={styles.imageContainer}>
                    <Image
                        src={book.image_url || 'https://via.placeholder.com/150x220.png?text=No+Image'}
                        alt={book.title}
                        fallback="https://via.placeholder.com/150x220.png?text=Error"
                        className={styles.bookImage}
                    />
                </div>
                <Descriptions bordered column={1} className={styles.descriptions}>
                    <Descriptions.Item label="Mã sách">{book.id}</Descriptions.Item>
                    <Descriptions.Item label="Tác giả">{book.author}</Descriptions.Item>
                    <Descriptions.Item label="Danh mục">
                        {book.categories && book.categories.length > 0
                            ? book.categories.map(cat => cat.name || cat).join(', ')
                            : 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Nhà xuất bản">
                        {book.publisher_id?.name || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Nhà cung cấp">
                        {book.supplier_id?.name || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Giá">
                        {book.price?.toLocaleString('vi-VN')} VNĐ
                    </Descriptions.Item>
                    <Descriptions.Item label="Số lượng tồn">
                        {book.stock_quantity}
                    </Descriptions.Item>
                    <Descriptions.Item label="Mô tả">
                        {book.description || 'Chưa có mô tả.'}
                    </Descriptions.Item>
                </Descriptions>
            </div>
        </Drawer>
    );
};

export default BookDetailsView;