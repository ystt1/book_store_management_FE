// src/components/Books/BookDetailsView.js
import React from 'react';
import styles from './BookDetailsView.module.css'; // Hoặc từ BookManagementPage.module.css

const BookDetailsView = ({ book, onClose, onEdit }) => { // Thêm prop onEdit
    if (!book) return null;

    return (
        <div className={styles.bookDetailsOverlay}>
            <div className={styles.bookDetailsContent}>
                <button onClick={onClose} className={styles.closeDetailsButton}>×</button>
                <h2>Chi tiết sách: {book.title}</h2>
                <div className={styles.detailsGrid}>
                    <div className={styles.detailsImageContainer}>
                        <img src={book.image_url || 'https://via.placeholder.com/150x220.png?text=No+Image'} alt={book.title} />
                    </div>
                    <div className={styles.detailsInfo}>
                        <p><strong>Mã sách:</strong> {book.id}</p>
                        <p><strong>Tác giả:</strong> {book.author}</p>
                        <p><strong>Danh mục:</strong> {book.categories?.map(c => c.label).join(', ') || 'N/A'}</p>
                        <p><strong>Nhà xuất bản:</strong> {book.publisher?.label || 'N/A'}</p>
                        <p><strong>Nhà cung cấp:</strong> {book.supplier?.label || 'N/A'}</p>
                        <p><strong>Giá:</strong> {book.price?.toLocaleString('vi-VN')} VNĐ</p>
                        <p><strong>Số lượng tồn:</strong> {book.stock_quantity}</p>
                        <p><strong>Mô tả:</strong> {book.description || 'Chưa có mô tả.'}</p>
                    </div>
                </div>
                <div className={styles.detailsActions}>
                    {/* Gọi onEdit khi nhấn nút Sửa */}
                    <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => { if(onEdit) onEdit(book); }}>Sửa thông tin</button>
                </div>
            </div>
        </div>
    );
};

export default BookDetailsView;