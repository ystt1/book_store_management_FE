// src/pages/EmployeeManagementPage.js
import React, { useState, useEffect, useMemo } from 'react';
import styles from './EmployeeManagementPage.module.css'; // Tạo file CSS mới
import EmployeeTable from '../components/Employees/EmployeeTable';
import EmployeeModal from '../components/Employees/EmployeeModal';
import SalaryPaymentModal from '../components/Employees/SalaryPaymentModal';
import SalaryHistoryModal from '../components/Employees/SalaryHistoryModal';
import ConfirmModal from '../components/Common/ConfirmModal';
import Pagination from '../components/Common/Pagination';
import { FaPlus, FaSearch } from 'react-icons/fa';

// Dữ liệu mẫu
const roleOptionsForDisplay = [ // Để hiển thị label của role trong bảng
    { value: 'staff', label: 'Nhân viên' },
    { value: 'manager', label: 'Quản lý' },
    { value: 'admin', label: 'Quản trị viên' },
];
const initialEmployees = [
    { id: 'EMP001', user_id: 'USR001', username: 'an.nv', full_name_user: 'Nguyễn Văn An (User)', employee_full_name: 'Nguyễn Văn An', email_user: 'an.nv@example.com', phone_employee: '0901234567', position: 'Nhân viên bán hàng', role: 'staff', base_salary: 8000000 },
    { id: 'EMP002', user_id: 'USR002', username: 'binh.tt', full_name_user: 'Trần Thị Bình (User)', employee_full_name: 'Trần Thị Bình', email_user: 'binh.tt@example.com', phone_employee: '0912345678', position: 'Quản lý cửa hàng', role: 'manager', base_salary: 15000000 },
    // Thêm nhân viên
].map(emp => ({...emp, role_label: roleOptionsForDisplay.find(r => r.value === emp.role)?.label || emp.role }));

const sampleEmployeeSalaryHistory = {
    'EMP001': [
        { id: 'SPAY001', payment_date: '2023-10-31', period_month: 10, period_year: 2023, amount_paid: 8000000, payment_method: 'Chuyển khoản', created_by: 'admin', notes: 'Lương tháng 10' },
        { id: 'SPAY003', payment_date: '2023-09-30', period_month: 9, period_year: 2023, amount_paid: 7800000, payment_method: 'Tiền mặt', created_by: 'admin', notes: 'Lương tháng 9 + Thưởng nhỏ' },
    ],
    'EMP002': [
        { id: 'SPAY002', payment_date: '2023-10-31', period_month: 10, period_year: 2023, amount_paid: 15000000, payment_method: 'Chuyển khoản', created_by: 'admin', notes: 'Lương tháng 10 quản lý' },
    ],
};
const EmployeeManagementPage = () => {
    const [employees, setEmployees] = useState(initialEmployees);
    const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
    const [employeeModalMode, setEmployeeModalMode] = useState('add');
    const [currentEmployee, setCurrentEmployee] = useState(null);

    const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
    const [employeeToPay, setEmployeeToPay] = useState(null);

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [employeeIdToDelete, setEmployeeIdToDelete] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

     const [isSalaryHistoryModalOpen, setIsSalaryHistoryModalOpen] = useState(false); // << THÊM STATE
    const [selectedEmployeeForSalaryHistory, setSelectedEmployeeForSalaryHistory] = useState(null); // << THÊM STATE
    const [currentSalaryHistory, setCurrentSalaryHistory] = useState([]); 

    const handleOpenSalaryHistoryModal = (employee) => { // << THÊM HÀM NÀY
        // TODO: Fetch lịch sử lương cho employee.id từ API
        console.log("Viewing salary history for:", employee.id);
        setSelectedEmployeeForSalaryHistory(employee);
        // Dùng dữ liệu mẫu, thay thế bằng API call
        setCurrentSalaryHistory(sampleEmployeeSalaryHistory[employee.id] || []);
        setIsSalaryHistoryModalOpen(true);
    };

    const filteredEmployees = useMemo(() => {
        return employees.filter(emp =>
            (emp.full_name_user && emp.full_name_user.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (emp.employee_full_name && emp.employee_full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (emp.username && emp.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (emp.email_user && emp.email_user.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (emp.phone_employee && emp.phone_employee.includes(searchTerm)) ||
            (emp.position && emp.position.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [employees, searchTerm]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentEmployeesOnPage = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

    const handlePageChange = (page) => setCurrentPage(page);

    const handleOpenEmployeeModal = (mode, employee = null) => {
        setEmployeeModalMode(mode);
        setCurrentEmployee(employee);
        setIsEmployeeModalOpen(true);
    };

    const handleCloseEmployeeModal = () => {
        setIsEmployeeModalOpen(false);
        setCurrentEmployee(null);
    };

    const handleSubmitEmployee = (formData) => {
        // TODO: Gọi API để thêm/sửa nhân viên (và tài khoản user liên quan)
        console.log("Submitting Employee:", formData);
        if (employeeModalMode === 'add') {
            const newEmployee = {
                ...formData, // username, email_user, full_name_user, role (value), phone_employee, position, base_salary
                id: `EMP${Date.now().toString().slice(-3)}`, // Employee ID
                user_id: `USR${Date.now().toString().slice(-3)}`, // User ID (giả sử backend trả về)
                role_label: roleOptionsForDisplay.find(r => r.value === formData.role)?.label || formData.role,
                // password sẽ được hash ở backend
            };
            delete newEmployee.password; // Không lưu password dạng text ở client sau khi gửi
            setEmployees(prev => [newEmployee, ...prev]);
            alert('Thêm nhân viên thành công!');
        } else {
            setEmployees(prev => prev.map(emp =>
                emp.id === formData.employee_id ? {
                    ...emp,
                    username: formData.username,
                    email_user: formData.email_user,
                    full_name_user: formData.full_name_user,
                    role: formData.role,
                    role_label: roleOptionsForDisplay.find(r => r.value === formData.role)?.label || formData.role,
                    phone_employee: formData.phone_employee,
                    position: formData.position,
                    base_salary: formData.base_salary,
                    // Backend sẽ xử lý việc cập nhật user và employee
                } : emp
            ));
            alert('Cập nhật thông tin nhân viên thành công!');
        }
        setCurrentPage(1);
        handleCloseEmployeeModal();
    };

    const handleDeleteEmployeeClick = (employeeId) => {
        setEmployeeIdToDelete(employeeId);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmDeleteEmployee = () => {
        // TODO: Gọi API để xóa nhân viên (và có thể cả user liên quan hoặc vô hiệu hóa user)
        console.log("Deleting Employee ID:", employeeIdToDelete);
        const updatedEmployees = employees.filter(emp => emp.id !== employeeIdToDelete);
        setEmployees(updatedEmployees);
        // Cập nhật pagination
        // ... (logic tương tự các trang khác) ...
        setIsConfirmModalOpen(false);
        setEmployeeIdToDelete(null);
        alert('Xóa nhân viên thành công!');
    };

    const handleOpenSalaryModal = (employee) => {
        setEmployeeToPay(employee);
        setIsSalaryModalOpen(true);
    };

    const handleProcessSalaryPayment = (paymentData) => {
        // TODO: Gọi API để xử lý thanh toán lương và lưu lại
        console.log("Processing Salary Payment:", paymentData);
        alert(`Đã xử lý thanh toán ${paymentData.amount.toLocaleString('vi-VN')} VNĐ cho ${employeeToPay?.full_name_user || employeeToPay?.employee_full_name}.`);
        setIsSalaryModalOpen(false);
        setEmployeeToPay(null);
        // Có thể fetch lại dữ liệu lương hoặc cập nhật UI nếu cần
    };


    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <h1>Quản Lý Nhân Viên</h1>
            </div>

            <div className={styles.controlsBar}>
                <div className={styles.searchWrapper}>
                    <FaSearch className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm nhân viên..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className={styles.searchInput}
                    />
                </div>
                <button
                    className={`${styles.btn} ${styles.btnPrimary}`}
                    onClick={() => handleOpenEmployeeModal('add')}
                >
                    <FaPlus /> Thêm Nhân Viên
                </button>
            </div>

            <EmployeeTable
                employees={currentEmployeesOnPage}
                onEdit={(emp) => handleOpenEmployeeModal('edit', emp)}
                onDelete={handleDeleteEmployeeClick}
                onPaySalary={handleOpenSalaryModal}
                onViewSalaryHistory={handleOpenSalaryHistoryModal}
            />

            {totalPages > 0 && filteredEmployees.length > itemsPerPage && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    itemsPerPage={itemsPerPage}
                    totalItems={filteredEmployees.length}
                />
            )}

            <EmployeeModal
                isOpen={isEmployeeModalOpen}
                onClose={handleCloseEmployeeModal}
                onSubmit={handleSubmitEmployee}
                currentEmployee={currentEmployee}
                mode={employeeModalMode}
            />

            {employeeToPay && (
                <SalaryPaymentModal
                    isOpen={isSalaryModalOpen}
                    onClose={() => setIsSalaryModalOpen(false)}
                    employee={employeeToPay}
                    onProcessPayment={handleProcessSalaryPayment}
                />
            )}

            {selectedEmployeeForSalaryHistory && ( // << RENDER MODAL LỊCH SỬ LƯƠNG
                <SalaryHistoryModal
                    isOpen={isSalaryHistoryModalOpen}
                    onClose={() => {
                        setIsSalaryHistoryModalOpen(false);
                        setSelectedEmployeeForSalaryHistory(null);
                        setCurrentSalaryHistory([]);
                    }}
                    employee={selectedEmployeeForSalaryHistory}
                    salaryHistory={currentSalaryHistory}
                />
            )}

            <ConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirmDeleteEmployee}
                title="Xác nhận xóa Nhân Viên"
                message={`Bạn có chắc chắn muốn xóa nhân viên "${employees.find(e => e.id === employeeIdToDelete)?.full_name_user || employees.find(e => e.id === employeeIdToDelete)?.employee_full_name}" không? Hành động này có thể ảnh hưởng đến tài khoản đăng nhập của họ.`}
            />
        </div>
    );
};

export default EmployeeManagementPage;