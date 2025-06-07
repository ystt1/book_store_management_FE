// src/components/Auth/LoginForm.js
import React from 'react'; // Bỏ useState nếu LoginPage quản lý
import styles from './LoginForm.module.css'; // Đảm bảo file CSS này tồn tại

const LoginForm = ({
    username, // << NHẬN TỪ PROPS
    password, // << NHẬN TỪ PROPS
    onUsernameChange, // << NHẬN TỪ PROPS
    onPasswordChange, // << NHẬN TỪ PROPS
    onSubmit,
    isLoading,
    error,
    // stores, // Nếu có chọn chi nhánh
    // selectedStoreId,
    // onStoreChange
}) => {

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(); // Không cần truyền username, password ở đây nữa vì LoginPage đã có
    };

    return (
        <form onSubmit={handleSubmit} className={styles.loginForm}>
            <h2>Đăng Nhập</h2>
            {error && <p className={styles.error}>{error}</p>}
            <div className={styles.formGroup}>
                <label htmlFor="login-username">Tên đăng nhập</label> {/* Đổi id để tránh trùng với id của state LoginPage */}
                <input
                    type="text"
                    id="login-username"
                    value={username} // << GIÁ TRỊ TỪ PROPS
                    onChange={onUsernameChange} // << HÀM TỪ PROPS
                    required
                    disabled={isLoading}
                    placeholder="Nhập tên đăng nhập"
                />
            </div>
            <div className={styles.formGroup}>
                <label htmlFor="login-password">Mật khẩu</label> {/* Đổi id */}
                <input
                    type="password"
                    id="login-password"
                    value={password} // << GIÁ TRỊ TỪ PROPS
                    onChange={onPasswordChange} // << HÀM TỪ PROPS
                    required
                    disabled={isLoading}
                    placeholder="Nhập mật khẩu"
                />
            </div>

            {/* Ví dụ chọn chi nhánh (nếu cần) */}
            {/* {stores && stores.length > 0 && (
                <div className={styles.formGroup}>
                    <label htmlFor="store">Chọn chi nhánh:</label>
                    <select id="store" value={selectedStoreId} onChange={onStoreChange} disabled={isLoading}>
                        <option value="">-- Chọn --</option>
                        {stores.map(store => <option key={store.value} value={store.value}>{store.label}</option>)}
                    </select>
                </div>
            )} */}

            <button type="submit" disabled={isLoading} className={styles.submitButton}>
                {isLoading ? 'Đang xử lý...' : 'Đăng Nhập'}
            </button>
            {/* ... (các link khác) ... */}
        </form>
    );
};

export default LoginForm;