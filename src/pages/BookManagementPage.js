// src/pages/BookManagementPage.js
import React, { useState, useEffect, useMemo } from 'react'; // Thêm useMemo
import styles from './BookManagementPage.module.css';
import Select from 'react-select';
// Import các component đã tách
import Pagination from '../components/Common/Pagination'; 
import BookModal from '../components/Books/BookModal';
import BookDetailsView from '../components/Books/BookDetailsView';
// Icons
import { FaFilter, FaSearch } from 'react-icons/fa';

// Dữ liệu mẫu (giữ nguyên như bạn cung cấp)
// Dữ liệu mẫu
const sampleCategories = [
{ value: 'C001', label: 'Tiểu thuyết' },
{ value: 'C002', label: 'Khoa học - Kỹ thuật' },
{ value: 'C003', label: 'Văn học thiếu nhi' },
{ value: 'C004', label: 'Kinh tế' },
];

const sampleSuppliers = [
{ value: 'S001', label: 'Nhà Cung Cấp Alpha' },
{ value: 'S002', label: 'Nhà Cung Cấp Beta' },
{ value: 'S003', label: 'Đối Tác Gamma' },
];

const samplePublishers = [
{ value: 'P001', label: 'NXB Trẻ' },
{ value: 'P002', label: 'NXB Kim Đồng' },
{ value: 'P003', label: 'NXB Giáo Dục Việt Nam' },
{ value: 'P004', label: 'NXB Tổng Hợp TPHCM' },
];

const initialBookForm = {
id: '',
title: '',
author: '',
categories: [], // Sẽ lưu mảng các {value, label} từ react-select
publisher: null, // Sẽ lưu {value, label}
price: 0,
image: null, // Sẽ lưu File object
imagePreview: '', // Để xem trước ảnh
stock_quantity: 0,
supplier: null, // Sẽ lưu {value, label}
description: '', // Thêm trường mô tả
};

const sampleBooks = [ // Ví dụ dữ liệu mẫu đã chuẩn hóa hơn
{
id: 'B001', title: 'Lập Trình Với Node.js', author: 'Nguyễn Văn A',
category_ids: ['C002'], publisher_id: 'P001', price: 150000,
image_url: 'https://via.placeholder.com/80x120.png?text=NodeJS', stock_quantity: 50, supplier_id: 'S001',
description: 'Cuốn sách hay về Node.js',
},
{
id: 'B002', title: 'ReactJS Toàn Tập', author: 'Trần Thị B',
category_ids: ['C002', 'C004'], publisher_id: 'P002', price: 220000,
image_url: 'https://via.placeholder.com/80x120.png?text=ReactJS', stock_quantity: 30, supplier_id: 'S002',
description: 'Học React từ cơ bản đến nâng cao.',
},
// Thêm sách khác
];


const initialImportOrders = [
    { id: 'DNH001', supplier_id: 'S001', supplier_name: 'Nhà Cung Cấp Alpha', import_date: '2023-10-20T10:00:00Z', expected_delivery_date: '2023-10-25', total_amount: 15000000, status: 'completed', notes: 'Nhập lô 1', items: [{book_id: 'B001', quantity: 50, unit_price: 100000}, {book_id: 'B002', quantity: 50, unit_price: 200000}]},
    { id: 'DNH002', supplier_id: 'S002', supplier_name: 'Nhà Cung Cấp Beta', import_date: '2023-11-01T14:30:00Z', expected_delivery_date: '2023-11-05', total_amount: 7500000, status: 'pending_approval', notes: '', items: [{book_id: 'B002', quantity: 50, unit_price: 150000}]},
];

const importOrderStatusOptions = [ // << Thêm vào đây hoặc import từ file config
    { value: 'pending_approval', label: 'Chờ duyệt' },
    { value: 'approved', label: 'Đã duyệt' },
    { value: 'importing', label: 'Đang nhập hàng' },
    { value: 'received_partial', label: 'Nhận một phần' }, // Có thể thêm
    { value: 'completed', label: 'Hoàn thành' },
    { value: 'cancelled', label: 'Đã hủy' },
];

const BookManagementPage = () => {
    const [books, setBooks] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentBookData, setCurrentBookData] = useState(initialBookForm);
    const [modalMode, setModalMode] = useState('add');

    // State cho filter
    const [searchTerm, setSearchTerm] = useState('');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false); // <<< THÊM STATE NÀY
    const [filterCategories, setFilterCategories] = useState([]);
    const [filterSupplier, setFilterSupplier] = useState(null);
    const [filterPublisher, setFilterPublisher] = useState(null);
    const [filterMinPrice, setFilterMinPrice] = useState('');
    const [filterMaxPrice, setFilterMaxPrice] = useState('');
    const [filterMinStock, setFilterMinStock] = useState('');

    // State cho Pagination
    const [currentPage, setCurrentPage] = useState(1); // <<< THÊM STATE NÀY
    const booksPerPage = 10; // Hoặc lấy từ config/state khác // <<< THÊM BIẾN NÀY

    useEffect(() => {
        const loadedBooks = sampleBooks.map(book => ({
            ...book,
            categories: book.category_ids ? book.category_ids.map(id => sampleCategories.find(c => c.value === id)).filter(Boolean) : [],
            publisher: samplePublishers.find(p => p.value === book.publisher_id) || null,
            supplier: sampleSuppliers.find(s => s.value === book.supplier_id) || null,
        }));
        setBooks(loadedBooks);
    }, []);

    // Sử dụng useMemo để tối ưu hóa việc filter
    const filteredAndSearchedBooks = useMemo(() => {
        return books.filter(book => {
            const searchMatch = searchTerm === '' ||
                book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (book.id && book.id.toLowerCase().includes(searchTerm.toLowerCase()));

            if (!searchMatch) return false;

            // Chỉ áp dụng filter chi tiết nếu showAdvancedFilters là true HOẶC có giá trị filter được đặt
            // Nếu không muốn filter khi ẩn, có thể thêm điều kiện `if (!showAdvancedFilters) return true;` ở đây
            // Tuy nhiên, việc luôn filter và chỉ ẩn/hiện UI có thể trực quan hơn cho người dùng.
            const categoryMatch = filterCategories.length === 0 ||
                filterCategories.every(fc => book.categories.some(bc => bc.value === fc.value));
            const supplierMatch = !filterSupplier || (book.supplier && book.supplier.value === filterSupplier.value);
            const publisherMatch = !filterPublisher || (book.publisher && book.publisher.value === filterPublisher.value);
            const priceMatch = (filterMinPrice === '' || book.price >= parseFloat(filterMinPrice)) &&
                               (filterMaxPrice === '' || book.price <= parseFloat(filterMaxPrice));
            const stockMatch = filterMinStock === '' || book.stock_quantity >= parseInt(filterMinStock);

            return categoryMatch && supplierMatch && publisherMatch && priceMatch && stockMatch;
        });
    }, [books, searchTerm, filterCategories, filterSupplier, filterPublisher, filterMinPrice, filterMaxPrice, filterMinStock]);


    // Logic cho Pagination
    const indexOfLastBook = currentPage * booksPerPage;
    const indexOfFirstBook = indexOfLastBook - booksPerPage;
    const currentBooksOnPage = filteredAndSearchedBooks.slice(indexOfFirstBook, indexOfLastBook); // <<< SỬ DỤNG MẢNG ĐÃ FILTER
    const totalPages = Math.ceil(filteredAndSearchedBooks.length / booksPerPage); // <<< TÍNH TRÊN MẢNG ĐÃ FILTER

    const handlePageChange = (pageNumber) => { // <<< THÊM HÀM NÀY
        setCurrentPage(pageNumber);
    };

    const resetAdvancedFilters = () => { // <<< THÊM HÀM NÀY
        setFilterCategories([]);
        setFilterSupplier(null);
        setFilterPublisher(null);
        setFilterMinPrice('');
        setFilterMaxPrice('');
        setFilterMinStock('');
        setCurrentPage(1); // Reset về trang 1 khi xóa filter
        // setShowAdvancedFilters(false); // Tùy chọn: có thể đóng luôn thanh filter
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentBookData(initialBookForm);
    };

    const openModal = (mode, book = null) => {
        setModalMode(mode);
        if (mode === 'edit' && book) {
            setCurrentBookData({
                ...initialBookForm,
                ...book,
                imagePreview: book.image_url || '',
                image: null,
            });
        } else {
            setCurrentBookData(initialBookForm);
        }
        setIsModalOpen(true);
    };

    const handleBookSubmit = (submittedData) => {
        console.log("Dữ liệu Modal gửi đi:", submittedData);
        if (modalMode === 'add') {
            const newBookRaw = {
                ...submittedData,
                id: `B${Date.now().toString().slice(-4)}`,
                image_url: submittedData.image ? URL.createObjectURL(submittedData.image) : 'https://via.placeholder.com/80x120.png?text=NewBook',
            };
            const newBookProcessed = {
                ...newBookRaw,
                categories: submittedData.category_ids ? submittedData.category_ids.map(id => sampleCategories.find(c => c.value === id)).filter(Boolean) : [],
                publisher: samplePublishers.find(p => p.value === submittedData.publisher_id) || null,
                supplier: sampleSuppliers.find(s => s.value === submittedData.supplier_id) || null,
            };
            setBooks(prevBooks => [newBookProcessed, ...prevBooks]);
            alert("Thêm sách thành công! (Mô phỏng)");
        } else {
            setBooks(prevBooks => prevBooks.map(b =>
                b.id === submittedData.id ? {
                    ...b,
                    ...submittedData,
                    image_url: submittedData.image ? URL.createObjectURL(submittedData.image) : b.image_url,
                    categories: submittedData.category_ids ? submittedData.category_ids.map(id => sampleCategories.find(c => c.value === id)).filter(Boolean) : b.categories,
                    publisher: samplePublishers.find(p => p.value === submittedData.publisher_id) || b.publisher,
                    supplier: sampleSuppliers.find(s => s.value === submittedData.supplier_id) || b.supplier,
                } : b
            ));
            alert("Cập nhật sách thành công! (Mô phỏng)");
        }
        setCurrentPage(1); // Reset về trang 1 sau khi submit
        closeModal();
    };

    const handleDeleteBook = (bookId) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa sách ID: ${bookId}?`)) {
            const updatedBooks = books.filter(book => book.id !== bookId);
            setBooks(updatedBooks); // Cập nhật state books trước

            // Tính toán lại filteredAndSearchedBooks dựa trên updatedBooks
            // Điều này quan trọng vì totalPages và currentBooksOnPage phụ thuộc vào nó
            const newFilteredLength = updatedBooks.filter(book => { /* ... logic filter của bạn ... */ return true; }).length;
            const newTotalPages = Math.ceil(newFilteredLength / booksPerPage);

            if (currentPage > newTotalPages && newTotalPages > 0) {
                setCurrentPage(newTotalPages);
            } else if (newTotalPages === 0 && newFilteredLength === 0) {
                setCurrentPage(1);
            }
            // Nếu currentBooksOnPage sau khi xóa trở nên rỗng và không phải là trang cuối cùng,
            // và trang hiện tại vẫn còn sách (ví dụ xóa item cuối của trang 2, nhưng trang 1 vẫn còn)
            // thì không cần setCurrentPage nếu currentPage vẫn < newTotalPages
            else if (currentBooksOnPage.length === 1 && currentPage > 1 && currentPage === totalPages && newTotalPages < totalPages ) {
                 setCurrentPage(currentPage - 1);
            }


            alert(`Xóa sách ID ${bookId} thành công! (Mô phỏng)`);
        }
    };

    const [selectedBookForDetails, setSelectedBookForDetails] = useState(null);
    const openEditModalFromDetails = (bookToEdit) => {
        setSelectedBookForDetails(null);
        openModal('edit', bookToEdit);
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <h1>Quản Lý Sách</h1>
                <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => openModal('add')}>
                    + Thêm Sách Mới
                </button>
            </div>

            {/* Thanh Tìm kiếm chính và Nút mở Filter chi tiết */}
            <div className={styles.mainFilterControls}> {/* <<< WRAPPER CHO CẢ HAI */}
                <div className={styles.searchWrapper}> {/* <<< WRAPPER CHO Ô TÌM KIẾM */}
                    <FaSearch className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên, tác giả, mã..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className={styles.mainSearchInput}
                    />
                </div>
                <button
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className={`${styles.btn} ${styles.btnToggleFilter}`}
                    title={showAdvancedFilters ? "Ẩn bộ lọc nâng cao" : "Hiện bộ lọc nâng cao"}
                >
                    <FaFilter /> {showAdvancedFilters ? "Ẩn bộ lọc" : "Thêm bộ lọc"}
                </button>
            </div>


            {/* Bộ lọc chi tiết (ẩn/hiện) */}
            {showAdvancedFilters && ( // <<< ĐIỀU KIỆN HIỂN THỊ
                <div className={styles.advancedFilterBar}>
                    <div className={styles.filterGrid}>
                        <Select
                            isMulti options={sampleCategories} value={filterCategories}
                            onChange={(val) => { setFilterCategories(val || []); setCurrentPage(1); }} // Đảm bảo val không phải null
                            placeholder="Lọc theo Danh mục"
                            className={`${styles.filterControl} react-select-container`} classNamePrefix="react-select"
                        />
                        <Select
                            options={samplePublishers} value={filterPublisher}
                            onChange={(val) => { setFilterPublisher(val); setCurrentPage(1); }}
                            placeholder="Lọc theo NXB" isClearable
                            className={`${styles.filterControl} react-select-container`} classNamePrefix="react-select"
                        />
                        <Select
                            options={sampleSuppliers} value={filterSupplier}
                            onChange={(val) => { setFilterSupplier(val); setCurrentPage(1); }}
                            placeholder="Lọc theo NCC" isClearable
                            className={`${styles.filterControl} react-select-container`} classNamePrefix="react-select"
                        />
                        <input
                            type="number" placeholder="Giá từ (VNĐ)" value={filterMinPrice}
                            onChange={(e) => { setFilterMinPrice(e.target.value); setCurrentPage(1); }}
                            className={styles.filterControl}
                        />
                        <input
                            type="number" placeholder="Giá đến (VNĐ)" value={filterMaxPrice}
                            onChange={(e) => { setFilterMaxPrice(e.target.value); setCurrentPage(1); }}
                            className={styles.filterControl}
                        />
                         <input
                            type="number" placeholder="Tồn kho từ" value={filterMinStock}
                            onChange={(e) => { setFilterMinStock(e.target.value); setCurrentPage(1); }}
                            className={styles.filterControl}
                        />
                    </div>
                    <div className={styles.filterActions}> {/* <<< THÊM NÚT RESET */}
                        <button onClick={resetAdvancedFilters} className={`${styles.btn} ${styles.btnSecondary}`}>
                            Xóa bộ lọc
                        </button>
                    </div>
                </div>
            )}


            <div className={styles.tableContainer}>
                {currentBooksOnPage.length > 0 ? ( // <<< SỬ DỤNG currentBooksOnPage
                    <table className={styles.booksTable}>
                        <thead>
                            <tr>
                                <th>Mã Sách</th>
                                <th>Hình Ảnh</th>
                                <th>Tên Sách</th>
                                <th>Tác Giả</th>
                                <th>Giá</th>
                                <th>SL Tồn</th>
                                <th>Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentBooksOnPage.map(book => ( // <<< SỬ DỤNG currentBooksOnPage
                                <tr key={book.id} onClick={() => setSelectedBookForDetails(book)} className={styles.tableRowClickable}>
                                    <td>{book.id}</td>
                                    <td>
                                        <img src={book.image_url || 'https://via.placeholder.com/50x75.png?text=Img'} alt={book.title} className={styles.bookImageTable} />
                                    </td>
                                    <td className={styles.bookTitle}>{book.title}</td>
                                    <td>{book.author}</td>
                                    <td className={styles.priceCell}>{book.price?.toLocaleString('vi-VN')}</td>
                                    <td>{book.stock_quantity}</td>
                                    <td className={styles.actionsCell}>
                                        <button className={`${styles.btnAction} ${styles.btnEdit}`} onClick={(e) => { e.stopPropagation(); openModal('edit', book); }} title="Sửa">✏️</button>
                                        <button className={`${styles.btnAction} ${styles.btnDelete}`} onClick={(e) => { e.stopPropagation(); handleDeleteBook(book.id); }} title="Xóa">🗑️</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className={styles.noResultsContainer}>
                        <p className={styles.noResults}>
                            {filteredAndSearchedBooks.length === 0 && books.length > 0 ? "Không tìm thấy sách nào khớp với bộ lọc." : "Chưa có sách nào trong hệ thống."}
                        </p>
                    </div>
                )}
            </div>

            {/* Component Pagination */}
            {totalPages > 0 && filteredAndSearchedBooks.length > booksPerPage && ( // Chỉ hiển thị nếu có nhiều hơn 1 trang
                 <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    itemsPerPage={booksPerPage}
                    totalItems={filteredAndSearchedBooks.length}
                />
            )}

            <BookModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSubmit={handleBookSubmit}
                bookData={currentBookData}
                setBookData={setCurrentBookData}
                mode={modalMode}
                sampleCategories={sampleCategories} // Truyền props
                samplePublishers={samplePublishers} // Truyền props
                sampleSuppliers={sampleSuppliers}   // Truyền props
            />
            {selectedBookForDetails && (
                <BookDetailsView
                    book={selectedBookForDetails}
                    onClose={() => setSelectedBookForDetails(null)}
                    onEdit={openEditModalFromDetails} // Truyền hàm để mở modal edit
                />
            )}
        </div>
    );
};

export default BookManagementPage;