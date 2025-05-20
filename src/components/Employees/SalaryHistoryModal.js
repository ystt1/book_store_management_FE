// src/components/Employees/SalaryHistoryModal.js
import React from 'react';
import styles from './SalaryHistoryModal.module.css';

const SalaryHistoryModal = ({ isOpen, onClose, employee, salaryHistory }) => {
    if (!isOpen || !employee) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <button onClick={onClose} className={styles.closeButton}>×</button>
                <h3 className={styles.title}>Lịch Sử Thanh Toán Lương</h3>
                <div className={styles.employeeInfo}>
                    Nhân viên: <strong>{employee.full_name_user || employee.employee_full_name || employee.username}</strong> (ID: {employee.id})
                </div>

                {salaryHistory && salaryHistory.length > 0 ? (
                    <div className={styles.historyTableContainer}>
                        <table className={styles.historyTable}>
                            <thead>
                                <tr>
                                    <th className={styles.dateCell}>Ngày Thanh Toán</th>
                                    <th>Kỳ Lương</th> {/* Ví dụ: "Tháng 10/2023" */}
                                    <th className={styles.amountCell}>Số Tiền (VNĐ)</th>
                                    <th>Phương Thức</th>
                                    <th>Người Thực Hiện</th>
                                    <th>Ghi Chú</th>
                                </tr>
                            </thead>
                            <tbody>
                                {salaryHistory.map(payment => (
                                    <tr key={payment.id}>
                                        <td data-label="Ngày TT:" className={styles.dateCell}>{new Date(payment.payment_date).toLocaleDateString('vi-VN')}</td>
                                        <td data-label="Kỳ lương:">{payment.period || `Tháng ${payment.period_month}/${payment.period_year}`}</td>
                                        <td data-label="Số tiền:" className={styles.amountCell}>{payment.amount_paid?.toLocaleString('vi-VN')}</td>
                                        <td data-label="PTTT:">{payment.payment_method || 'N/A'}</td>
                                        <td data-label="Người TT:">{payment.created_by || 'N/A'}</td>
                                        <td data-label="Ghi chú:">{payment.notes || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className={styles.noHistory}>Chưa có lịch sử thanh toán lương cho nhân viên này.</p>
                )}

                <div className={styles.actions}>
                    <button onClick={onClose} className={`${styles.btn} ${styles.btnSecondary}`}>
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

SalaryHistoryModal.defaultProps = {
    salaryHistory: []
};

export default SalaryHistoryModal;