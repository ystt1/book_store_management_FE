// src/components/Common/Pagination.js
import React from 'react';
import styles from './Pagination.module.css';
// Import icons nếu bạn muốn dùng từ react-icons trong component này
import { FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';

const Pagination = ({ currentPage, totalPages, onPageChange, itemsPerPage, totalItems }) => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    // Logic hiển thị số trang (có thể phức tạp hơn với "...")
    // Hiển thị tối đa 5 nút số trang, cộng với nút đầu/cuối và "..."
    const maxPageButtons = 5;
    let startPage, endPage;

    if (totalPages <= maxPageButtons) {
        startPage = 1;
        endPage = totalPages;
    } else {
        const maxPagesShownBeforeCurrentPage = Math.floor(maxPageButtons / 2);
        const maxPagesShownAfterCurrentPage = Math.ceil(maxPageButtons / 2) - 1;
        if (currentPage <= maxPagesShownBeforeCurrentPage) {
            startPage = 1;
            endPage = maxPageButtons;
        } else if (currentPage + maxPagesShownAfterCurrentPage >= totalPages) {
            startPage = totalPages - maxPageButtons + 1;
            endPage = totalPages;
        } else {
            startPage = currentPage - maxPagesShownBeforeCurrentPage;
            endPage = currentPage + maxPagesShownAfterCurrentPage;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }

    const indexOfFirstItemOnPage = (currentPage - 1) * itemsPerPage + 1;
    const indexOfLastItemOnPage = Math.min(currentPage * itemsPerPage, totalItems);


    return (
        <div className={styles.paginationContainer}> {/* Optional: wrapper cho cả info và nav */}
            {totalItems > 0 && itemsPerPage > 0 && (
                 <div className={styles.paginationInfo}>
                    Hiển thị {indexOfFirstItemOnPage} - {indexOfLastItemOnPage} của {totalItems} kết quả
                </div>
            )}
            <nav className={styles.paginationNav}>
                <ul className={styles.pagination}>
                    {currentPage > 1 && (
                        <>
                            <li className={styles.pageItem}>
                                <button onClick={() => onPageChange(1)} className={styles.pageLink} title="Trang đầu">
                                    <FaAngleDoubleLeft />
                                </button>
                            </li>
                            <li className={styles.pageItem}>
                                <button onClick={() => onPageChange(currentPage - 1)} className={styles.pageLink} title="Trang trước">
                                    <FaChevronLeft />
                                </button>
                            </li>
                        </>
                    )}

                    {startPage > 1 && (
                        <>
                            <li className={styles.pageItem}><button className={styles.pageLink} onClick={() => onPageChange(1)}>1</button></li>
                            {startPage > 2 && <li className={`${styles.pageItem} ${styles.disabled}`}><span className={styles.pageLink}>...</span></li>}
                        </>
                    )}

                    {pageNumbers.map(number => (
                        <li key={number} className={`${styles.pageItem} ${currentPage === number ? styles.active : ''}`}>
                            <button onClick={() => onPageChange(number)} className={styles.pageLink}>
                                {number}
                            </button>
                        </li>
                    ))}

                    {endPage < totalPages && (
                        <>
                            {endPage < totalPages - 1 && <li className={`${styles.pageItem} ${styles.disabled}`}><span className={styles.pageLink}>...</span></li>}
                            <li className={styles.pageItem}><button className={styles.pageLink} onClick={() => onPageChange(totalPages)}>{totalPages}</button></li>
                        </>
                    )}

                    {currentPage < totalPages && (
                        <>
                            <li className={styles.pageItem}>
                                <button onClick={() => onPageChange(currentPage + 1)} className={styles.pageLink} title="Trang sau">
                                    <FaChevronRight />
                                </button>
                            </li>
                            <li className={styles.pageItem}>
                                <button onClick={() => onPageChange(totalPages)} className={styles.pageLink} title="Trang cuối">
                                    <FaAngleDoubleRight />
                                </button>
                            </li>
                        </>
                    )}
                </ul>
            </nav>
        </div>
    );
};

export default Pagination;