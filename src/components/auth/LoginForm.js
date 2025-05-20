// src/components/Auth/LoginForm.js
import React from 'react';
import styles from './LoginForm.module.css';

const LoginForm = ({
    username,
    password,
    onUsernameChange,
    onPasswordChange,
    onSubmit,
    isLoading,
    error
}) => {
    return (
        <form onSubmit={onSubmit} className={styles.loginForm}>
            <h2>Login</h2>
            {error && <p className={styles.error}>{error}</p>}
            <div className={styles.formGroup}>
                <label htmlFor="username">Username</label>
                <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={onUsernameChange}
                    required
                    disabled={isLoading}
                    placeholder="Enter your username"
                />
            </div>
            <div className={styles.formGroup}>
                <label htmlFor="password">Password</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={onPasswordChange}
                    required
                    disabled={isLoading}
                    placeholder="Enter your password"
                />
            </div>
            <button type="submit" disabled={isLoading} className={styles.submitButton}>
                {isLoading ? 'Logging in...' : 'Login'}
            </button>
            <div className={styles.extraLinks}>
                <p><a href="#forgot-password">Forgot Password?</a></p>
                <p>Don't have an account? <a href="#register">Register</a></p>
            </div>
        </form>
    );
};

export default LoginForm;