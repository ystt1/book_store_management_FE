// src/components/Employees/EmployeeTable.js
import React from 'react';
import styles from './EmployeeTable.module.css';
import { FaHistory } from 'react-icons/fa';
import SalaryHistoryModal from './SalaryHistoryModal';
const EmployeeTable = ({ employees, onEdit, onDelete, onPaySalary,onViewSalaryHistory  }) => {
    return (
        <div className={styles.tableContainer}>
            <table className={styles.employeeTable}>
                <thead>
                    <tr>
                        <th>ID NV</th>
                        <th>Tên đăng nhập (User)</th>
                        <th>Họ tên</th>
                        <th>Email (User)</th>
                        <th>SĐT Liên Hệ</th>
                        <th>Chức vụ</th>
                        <th>Vai trò (User)</th>
                        <th>Lương Cơ Bản</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {employees && employees.length > 0 ? (
                        employees.map(emp => (
                            <tr key={emp.id}> {/* Sử dụng Employee ID làm key */}
                                <td data-label="ID NV:">{emp.id}</td>
                                <td data-label="Tên ĐN:">{emp.username || 'N/A'}</td>
                                <td data-label="Họ tên:" className={styles.employeeName}>{emp.full_name_user || emp.employee_full_name || 'N/A'}</td>
                                <td data-label="Email User:">{emp.email_user || 'N/A'}</td>
                                <td data-label="SĐT LH:">{emp.phone_employee || 'N/A'}</td>
                                <td data-label="Chức vụ:">{emp.position || 'N/A'}</td>
                                <td data-label="Vai trò:">{emp.role_label || emp.role || 'N/A'}</td>
                                <td data-label="Lương CB:" className={styles.salaryCell}>{(emp.base_salary || 0).toLocaleString('vi-VN')} VNĐ</td>
                                <td data-label="Hành động:" className={styles.actionsCell}>
                                    {onViewSalaryHistory && <button onClick={() => onViewSalaryHistory(emp)} className={`${styles.btnAction} ${styles.btnHistory}`} title="Xem lịch sử lương"><FaHistory /></button>} {/* << NÚT MỚI */}
                                    {onPaySalary && <button onClick={() => onPaySalary(emp)} className={`${styles.btnAction} ${styles.btnPay}`} title="Thanh toán lương">💰</button>}
                                    <button onClick={() => onEdit(emp)} className={`${styles.btnAction} ${styles.btnEdit}`} title="Sửa">✏️</button>
                                    <button onClick={() => onDelete(emp.id)} className={`${styles.btnAction} ${styles.btnDelete}`} title="Xóa">🗑️</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="9" className={styles.noResults}>Không có nhân viên nào.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default EmployeeTable;