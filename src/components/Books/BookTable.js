// src/components/Books/BookTable.js
import React from 'react';
import styles from './BookTable.module.css'; // Tạo file CSS này ở cùng thư mục
import { FaEye, FaEdit, FaTrashAlt } from 'react-icons/fa'; // Ví dụ dùng react-icons

const BookTable = ({ books, onEdit, onDelete, onViewDetails }) => {
    if (!books || books.length === 0) {
        return null; // Không render gì nếu không có sách
    }

    return (
        <div className={styles.tableContainer}>
            <table className={styles.bookTable}>
                <thead>
                    <tr>
                        <th>Mã Sách</th>
                        <th>Hình Ảnh</th>
                        <th>Tên Sách</th>
                        <th>Tác Giả</th>
                        <th>Danh Mục</th>
                        <th>NXB</th>
                        <th>Giá Bán</th>
                        <th>SL Tồn</th>
                        <th>NCC</th>
                        <th>Hành Động</th>
                    </tr>
                </thead>
                <tbody>
                    {books.map(book => (
                        <tr key={book._id || book.id}> {/* Ưu tiên _id từ MongoDB */}
                            <td data-label="Mã Sách:">{book.id || book._id}</td>
                            <td data-label="Hình Ảnh:">
                                <img
                                    src={book.image || 'https://files.fullstack.edu.vn/f8-prod/courses/12.png'}
                                    alt={book.title}
                                    className={styles.bookImage}
                                    onError={(e) => { e.target.onerror = null; e.target.src='https://files.fullstack.edu.vn/f8-prod/courses/12.png'; }}
                                />
                            </td>
                            <td data-label="Tên Sách:" className={styles.bookTitle} onClick={() => onViewDetails && onViewDetails(book)}>
                                {book.title}
                            </td>
                            <td data-label="Tác Giả:">{book.author || 'N/A'}</td>
                            <td data-label="Danh Mục:">
                                {book.categories && book.categories.length > 0
                                    ? book.categories.map(cat => cat.name || cat).join(', ') // Hiển thị tên nếu đã populate, ngược lại là ID
                                    : 'N/A'}
                            </td>
                            <td data-label="NXB:">{book.publisher_id?.name || 'N/A'}</td>
                            <td data-label="Giá Bán:" className={styles.priceCell}>
                                {book.price != null ? book.price.toLocaleString('vi-VN') + ' VNĐ' : 'N/A'}
                            </td>
                            <td data-label="SL Tồn:" className={styles.stockCell}>
                                {book.stock_quantity != null ? book.stock_quantity : 'N/A'}
                            </td>
                            <td data-label="NCC:">
                                {book.supplier_id?.name || book.supplier_id || 'N/A'} {/* Hiển thị tên NCC nếu đã populate */}
                            </td>
                            <td data-label="Hành Động:" className={styles.actionsCell}>
                                {onViewDetails && (
                                    <button onClick={() => onViewDetails(book)} className={`${styles.btnAction} ${styles.btnView}`} title="Xem chi tiết">
                                        <FaEye />
                                    </button>
                                )}
                                {onEdit && (
                                    <button onClick={() => onEdit('edit',book)} className={`${styles.btnAction} ${styles.btnEdit}`} title="Sửa">
                                        <FaEdit />
                                    </button>
                                )}
                                {onDelete && (
                                    <button onClick={() => onDelete(book._id || book.id)} className={`${styles.btnAction} ${styles.btnDelete}`} title="Xóa">
                                        <FaTrashAlt />
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default BookTable;