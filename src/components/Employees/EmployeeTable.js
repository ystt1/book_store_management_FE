// src/components/Employees/EmployeeTable.js
import React from 'react';
import styles from './EmployeeTable.module.css';
import { FaHistory } from 'react-icons/fa';
import SalaryHistoryModal from './SalaryHistoryModal';

const EmployeeTable = ({ employees, onEdit, onDelete, onPaySalary, onViewSalaryHistory }) => {
    console.log('Employees in table:', employees); // Debug log

    return (
        <div className={styles.tableContainer}>
            <table className={styles.employeeTable}>
                <thead>
                    <tr>
                        <th>ID NV</th>
                        <th>Tên đăng nhập</th>
                        <th>Họ tên</th>
                        <th>Email</th>
                        <th>SĐT</th>
                        <th>Vai trò</th>
                        <th>Cửa hàng</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {employees && employees.length > 0 ? (
                        employees.map(emp => {
                            // Debug log cho từng employee
                            console.log('Processing employee:', emp);
                            console.log('User data:', emp.user_id);
                            console.log('Store data:', emp.store_id);

                            return (
                                <tr key={emp._id}>
                                    <td>{emp._id}</td>
                                    <td>{emp.user_id?.username}</td>
                                    <td className={styles.employeeName}>
                                        {emp.user_id?.fullName}
                                    </td>
                                    <td>{emp.user_id?.email}</td>
                                    <td>{emp.phone || emp.user_id?.phone}</td>
                                    <td>{emp.user_id?.role}</td>
                                    <td>{emp.store_id?.name}</td>
                                    <td className={styles.actionsCell}>
                                        {onViewSalaryHistory && (
                                            <button 
                                                onClick={() => onViewSalaryHistory(emp)} 
                                                className={`${styles.btnAction} ${styles.btnHistory}`} 
                                                title="Xem lịch sử lương"
                                            >
                                                <FaHistory />
                                            </button>
                                        )}
                                        {onPaySalary && (
                                            <button 
                                                onClick={() => onPaySalary(emp)} 
                                                className={`${styles.btnAction} ${styles.btnPay}`} 
                                                title="Thanh toán lương"
                                            >
                                                💰
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => onEdit(emp)} 
                                            className={`${styles.btnAction} ${styles.btnEdit}`} 
                                            title="Sửa"
                                        >
                                            ✏️
                                        </button>
                                        <button 
                                            onClick={() => onDelete(emp._id)} 
                                            className={`${styles.btnAction} ${styles.btnDelete}`} 
                                            title="Xóa"
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan="8" className={styles.noResults}>
                                Không có nhân viên nào.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default EmployeeTable;