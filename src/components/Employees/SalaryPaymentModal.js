// src/components/Employees/SalaryPaymentModal.js
import React, { useState, useEffect } from 'react';
import styles from './SalaryPaymentModal.module.css'; // Tạo file CSS mới

const SalaryPaymentModal = ({ isOpen, onClose, employee, onProcessPayment }) => {
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [paymentNotes, setPaymentNotes] = useState('');

    useEffect(() => {
        if (isOpen && employee) {
            setPaymentAmount(employee.base_salary || ''); // Gợi ý bằng lương cơ bản
            setPaymentDate(new Date().toISOString().split('T')[0]);
            setPaymentNotes(`Thanh toán lương tháng [MM/YYYY] cho ${employee.full_name_user || employee.employee_full_name}`);
        }
    }, [isOpen, employee]);

    if (!isOpen || !employee) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
            alert("Vui lòng nhập số tiền thanh toán hợp lệ.");
            return;
        }
        const paymentData = {
            employeeId: employee.id,
            userId: employee.user_id, // Nếu cần
            amount: parseFloat(paymentAmount),
            paymentDate: paymentDate,
            notes: paymentNotes,
            // Thêm các trường khác: kỳ lương, thưởng, phạt, phương thức thanh toán...
        };
        onProcessPayment(paymentData);
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h3 className={styles.title}>Thanh Toán Lương cho {employee.full_name_user || employee.employee_full_name}</h3>
                <form onSubmit={handleSubmit}>
                    <div className={styles.infoSection}>
                        <p><strong>Nhân viên:</strong> {employee.full_name_user || employee.employee_full_name} (ID: {employee.id})</p>
                        <p><strong>Chức vụ:</strong> {employee.position || 'N/A'}</p>
                        <p><strong>Lương cơ bản:</strong> {(employee.base_salary || 0).toLocaleString('vi-VN')} VNĐ</p>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="paymentAmount">Số tiền thanh toán (*):</label>
                        <input type="number" id="paymentAmount" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} required min="0" className={styles.inputField} />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="paymentDate">Ngày thanh toán (*):</label>
                        <input type="date" id="paymentDate" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} required className={styles.inputField} />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="paymentNotes">Ghi chú thanh toán:</label>
                        <textarea id="paymentNotes" value={paymentNotes} onChange={(e) => setPaymentNotes(e.target.value)} rows="3" className={styles.textareaField} />
                    </div>
                    <div className={styles.actions}>
                        <button type="submit" className={`${styles.btn} ${styles.btnSubmit}`}>Xác Nhận Thanh Toán</button>
                        <button type="button" onClick={onClose} className={`${styles.btn} ${styles.btnCancel}`}>Hủy</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SalaryPaymentModal;