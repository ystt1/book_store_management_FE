// src/components/Reports/InventorySummary.js
import React from 'react';
import styles from './ReportCard.module.css'; // Hoặc style riêng

const InventorySummary = ({ inventoryData }) => {
    if (!inventoryData) {
        return <p className={styles.noDataChart}>Không có dữ liệu tồn kho.</p>;
    }
    return (
        <div>
            <p><strong>Tổng số loại sản phẩm:</strong> {inventoryData.totalUniqueItems?.toLocaleString() || 0}</p>
            <p><strong>Tổng SL tồn kho:</strong> {inventoryData.overallStockQuantity?.toLocaleString() || 0}</p>
            {inventoryData.lowStockItems && inventoryData.lowStockItems.length > 0 && (
                <>
                    <h5 style={{marginTop: '15px', marginBottom: '5px'}}>Sản phẩm sắp hết hàng (dưới {inventoryData.lowStockThreshold || 10}):</h5>
                    <ul className={styles.lowStockList}> {/* Cần style cho .lowStockList */}
                        {inventoryData.lowStockItems.map((item, index) => (
                            <li key={index}> {item.name} ({item.type}) - Còn: <strong>{item.stock}</strong></li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
};
export default InventorySummary;