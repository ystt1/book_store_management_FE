// src/components/Reports/ReportCard.js
import React from 'react';
import styles from './ReportCard.module.css';

const ReportCard = ({ title, children, isLoading, onRefresh, extraHeaderContent }) => {
    return (
        <div className={styles.reportCard}>
            <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>{title}</h3>
                <div className={styles.headerActions}>
                    {extraHeaderContent}
                    {onRefresh && (
                        <button onClick={onRefresh} className={styles.refreshButton} disabled={isLoading} title="Làm mới dữ liệu">
                            {isLoading ? 'Đang tải...' : '🔄'}
                        </button>
                    )}
                </div>
            </div>
            <div className={styles.cardBody}>
                {isLoading ? <div className={styles.loader}>Đang tải dữ liệu...</div> : children}
            </div>
        </div>
    );
};

export default ReportCard;