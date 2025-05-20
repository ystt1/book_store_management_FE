// src/components/Books/BookModal.js
import React, { useEffect } from 'react'; // Đã xóa useState nếu không cần
import Select from 'react-select'; // THÊM DÒNG NÀY
import styles from './BookModal.module.css';

const BookModal = ({
    isOpen,
    onClose,
    onSubmit,
    bookData,
    setBookData,
    mode,
    sampleCategories = [], // Đảm bảo các props này được truyền từ BookManagementPage
    samplePublishers = [],
    sampleSuppliers = []
}) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setBookData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (bookData.imagePreview) {
                URL.revokeObjectURL(bookData.imagePreview);
            }
            setBookData(prev => ({
                ...prev,
                image: file,
                imagePreview: URL.createObjectURL(file)
            }));
        } else {
             if (bookData.imagePreview) {
                URL.revokeObjectURL(bookData.imagePreview);
            }
            setBookData(prev => ({
                ...prev,
                image: null,
                imagePreview: ''
            }));
        }
    };

    const handleCategoryChange = (selectedOptions) => {
        setBookData(prev => ({ ...prev, categories: selectedOptions || [] }));
    };

    const handleSupplierChange = (selectedOption) => {
        setBookData(prev => ({ ...prev, supplier: selectedOption }));
    };

    const handlePublisherChange = (selectedOption) => {
        setBookData(prev => ({...prev, publisher: selectedOption}));
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const dataToSubmit = {
            ...bookData,
            category_ids: bookData.categories.map(cat => cat.value),
            publisher_id: bookData.publisher ? bookData.publisher.value : null,
            supplier_id: bookData.supplier ? bookData.supplier.value : null,
        };
        delete dataToSubmit.categories;
        delete dataToSubmit.publisher;
        delete dataToSubmit.supplier;
        onSubmit(dataToSubmit);
    };

    useEffect(() => {
        const currentPreview = bookData.imagePreview;
        return () => {
            if (currentPreview) {
                URL.revokeObjectURL(currentPreview);
            }
        };
    }, [bookData.imagePreview]);

    return isOpen ? (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2>{mode === 'add' ? 'Thêm Sách Mới' : 'Chỉnh Sửa Sách'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="title">Tên sách (*):</label>
                            <input type="text" id="title" name="title" value={bookData.title || ''} onChange={handleChange} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="author">Tác giả (*):</label>
                            <input type="text" id="author" name="author" value={bookData.author || ''} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="categories">Danh mục sách (*):</label>
                        <Select 
                            id="categories"
                            isMulti
                            options={sampleCategories} 
                            value={bookData.categories}
                            onChange={handleCategoryChange}
                            placeholder="Chọn danh mục..."
                            className="react-select-container"
                            classNamePrefix="react-select"
                        />
                    </div>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="publisher">Nhà xuất bản:</label>
                             <Select 
                                id="publisher"
                                options={samplePublishers} 
                                value={bookData.publisher}
                                onChange={handlePublisherChange}
                                placeholder="Chọn nhà xuất bản..."
                                isClearable
                                className="react-select-container"
                                classNamePrefix="react-select"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="supplier">Nhà cung cấp:</label>
                            <Select 
                                id="supplier"
                                options={sampleSuppliers} 
                                value={bookData.supplier}
                                onChange={handleSupplierChange}
                                placeholder="Chọn nhà cung cấp..."
                                isClearable
                                className="react-select-container"
                                classNamePrefix="react-select"
                            />
                        </div>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="price">Giá (VNĐ) (*):</label>
                            <input type="number" id="price" name="price" value={bookData.price || '0'} onChange={handleChange} required min="0" />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="stock_quantity">Số lượng tồn (*):</label>
                            <input type="number" id="stock_quantity" name="stock_quantity" value={bookData.stock_quantity || '0'} onChange={handleChange} required min="0" />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="image">Hình ảnh bìa:</label>
                        <input type="file" id="image" name="image" accept="image/*" onChange={handleFileChange} />
                        {bookData.imagePreview && (
                            <img src={bookData.imagePreview} alt="Xem trước bìa sách" className={styles.imagePreviewModal} />
                        )}
                    </div>

                     <div className={styles.formGroup}>
                        <label htmlFor="description">Mô tả sách:</label>
                        <textarea id="description" name="description" value={bookData.description || ''} onChange={handleChange} rows="4" />
                    </div>

                    <div className={styles.modalActions}>
                        <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
                            {mode === 'add' ? 'Thêm Sách' : 'Lưu Thay Đổi'}
                        </button>
                        <button type="button" onClick={onClose} className={`${styles.btn} ${styles.btnSecondary}`}>Hủy</button>
                    </div>
                </form>
            </div>
        </div>
    ) : null;
};

BookModal.defaultProps = {
    sampleCategories: [],
    samplePublishers: [],
    sampleSuppliers: []
};

export default BookModal;