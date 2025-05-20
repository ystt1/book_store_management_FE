// src/components/Employees/EmployeeModal.js
import React, { useState, useEffect } from 'react';
import Select from 'react-select'; // Nếu cần chọn User hoặc Role
import styles from './EmployeeModal.module.css';

// Giả sử bạn có danh sách role
const roleOptions = [
    { value: 'staff', label: 'Nhân viên (Staff)' },
    { value: 'manager', label: 'Quản lý (Manager)' },
    // { value: 'admin', label: 'Quản trị viên (Admin)' } // Có thể quản lý admin riêng
];

const EmployeeModal = ({ isOpen, onClose, onSubmit, currentEmployee, mode }) => {
    const [formData, setFormData] = useState({
        // User fields (sẽ được tạo/cập nhật ở backend khi tạo employee)
        username: '', // Thường là username để đăng nhập
        email_user: '', // Email để đăng nhập, có thể khác email liên hệ của Employee
        password: '', // Chỉ nhập khi tạo mới hoặc muốn đổi mật khẩu
        full_name_user: '', // Tên đầy đủ trên User account
        role: null, // Object {value, label}

        // Employee fields
        phone_employee: '',
        position: '',
        base_salary: '',
        // user_id sẽ được liên kết ở backend
    });
    const [showPassword, setShowPassword] = useState(false);


    useEffect(() => {
        if (isOpen) {
            if (currentEmployee && mode === 'edit') {
                setFormData({
                    id: currentEmployee.id, // Employee ID
                    user_id: currentEmployee.user_id, // User ID (nếu có)
                    username: currentEmployee.username || '', // Lấy từ user liên kết
                    email_user: currentEmployee.email_user || '', // Lấy từ user liên kết
                    password: '', // Để trống khi sửa, chỉ nhập nếu muốn đổi
                    full_name_user: currentEmployee.full_name_user || currentEmployee.employee_full_name || '', // Ưu tiên tên user
                    role: roleOptions.find(r => r.value === currentEmployee.role) || null,

                    phone_employee: currentEmployee.phone_employee || '',
                    position: currentEmployee.position || '',
                    base_salary: currentEmployee.base_salary || '',
                });
            } else { // Chế độ thêm mới
                setFormData({
                    username: '', email_user: '', password: '', full_name_user: '', role: null,
                    phone_employee: '', position: '', base_salary: '',
                });
            }
            setShowPassword(mode === 'add'); // Hiện trường mật khẩu khi thêm mới
        }
    }, [isOpen, currentEmployee, mode]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRoleChange = (selectedOption) => {
        setFormData(prev => ({ ...prev, role: selectedOption }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const dataToSubmit = {
            // User data
            username: formData.username,
            email_user: formData.email_user,
            full_name_user: formData.full_name_user,
            role: formData.role ? formData.role.value : null, // Gửi value của role

            // Employee data
            phone_employee: formData.phone_employee,
            position: formData.position,
            base_salary: formData.base_salary ? parseFloat(formData.base_salary) : null,
        };

        if (mode === 'edit' && currentEmployee) {
            dataToSubmit.employee_id = currentEmployee.id; // ID của Employee
            dataToSubmit.user_id = currentEmployee.user_id; // User ID nếu có để backend cập nhật
            if (formData.password) { // Chỉ gửi password nếu người dùng nhập để đổi
                dataToSubmit.password = formData.password;
            }
        } else if (mode === 'add') { // Thêm mới
            if (!formData.password) {
                alert("Vui lòng nhập mật khẩu cho nhân viên mới.");
                return;
            }
            dataToSubmit.password = formData.password;
        }
        onSubmit(dataToSubmit);
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h3 className={styles.title}>{mode === 'add' ? 'Thêm Nhân Viên Mới' : 'Chỉnh Sửa Thông Tin Nhân Viên'}</h3>
                <form onSubmit={handleSubmit}>
                    <h4>Thông Tin Tài Khoản Đăng Nhập</h4>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="username">Tên đăng nhập (*):</label>
                            <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} required className={styles.inputField} />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="email_user">Email đăng nhập (*):</label>
                            <input type="email" id="email_user" name="email_user" value={formData.email_user} onChange={handleChange} required className={styles.inputField} />
                        </div>
                    </div>
                    <div className={styles.formRow}>
                         <div className={styles.formGroup}>
                            <label htmlFor="full_name_user">Họ tên (hiển thị trên hệ thống) (*):</label>
                            <input type="text" id="full_name_user" name="full_name_user" value={formData.full_name_user} onChange={handleChange} required className={styles.inputField} />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="role">Vai trò (*):</label>
                            <Select
                                id="role"
                                options={roleOptions}
                                value={formData.role}
                                onChange={handleRoleChange}
                                placeholder="Chọn vai trò..."
                                classNamePrefix="react-select"
                                className="react-select-container"
                                required
                            />
                        </div>
                    </div>
                    {(mode === 'add' || showPassword) && (
                        <div className={styles.formGroup}>
                            <label htmlFor="password">{mode === 'add' ? 'Mật khẩu (*):' : 'Mật khẩu mới (để trống nếu không đổi):'}</label>
                            <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} className={styles.inputField} required={mode==='add'} />
                        </div>
                    )}
                    {mode === 'edit' && !showPassword && (
                        <button type="button" onClick={() => setShowPassword(true)} className={styles.linkButton}>Đổi mật khẩu?</button>
                    )}


                    <h4 className={styles.sectionTitle}>Thông Tin Nhân Viên</h4>
                     <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="phone_employee">Số điện thoại liên hệ:</label>
                            <input type="tel" id="phone_employee" name="phone_employee" value={formData.phone_employee} onChange={handleChange} className={styles.inputField} />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="position">Chức vụ:</label>
                            <input type="text" id="position" name="position" value={formData.position} onChange={handleChange} className={styles.inputField} />
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="base_salary">Lương cơ bản (VNĐ):</label>
                        <input type="number" id="base_salary" name="base_salary" value={formData.base_salary} onChange={handleChange} min="0" className={styles.inputField} />
                    </div>

                    <div className={styles.actions}>
                        <button type="submit" className={`${styles.btn} ${styles.btnSubmit}`}>
                            {mode === 'add' ? 'Thêm Nhân Viên' : 'Lưu Thay Đổi'}
                        </button>
                        <button type="button" onClick={onClose} className={`${styles.btn} ${styles.btnCancel}`}>
                            Hủy
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EmployeeModal;