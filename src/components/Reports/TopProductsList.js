// src/components/Reports/TopProductsList.js
import React from 'react';
import styles from './ReportCard.module.css'; // Có thể dùng chung hoặc tạo style riêng

const TopProductsList = ({ products }) => {
    if (!products || products.length === 0) {
        return <p className={styles.noDataChart}>Không có dữ liệu sản phẩm bán chạy.</p>;
    }
    return (
        <ul className={styles.topProductList}> {/* Sử dụng class từ ReportPage.module.css hoặc style riêng */}
            {products.map((p, index) => (
                <li key={p.productId || index}>
                    <span>{index + 1}. {p.productName} ({p.productType === 'book' ? 'Sách' : 'VPP'})</span>
                    <span>{p.quantitySold} đã bán</span>
                </li>
            ))}
        </ul>
    );
};
export default TopProductsList;