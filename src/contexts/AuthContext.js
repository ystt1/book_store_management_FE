// src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import storeService from '../services/storeService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);
    const [currentStore, setCurrentStore] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const storedToken = authService.getToken();
            const storedUser = authService.getCurrentUser();
            
            if (storedToken && storedUser) {
                setToken(storedToken);
                setCurrentUser(storedUser);

                // Nếu user có storeId, lấy thông tin store
                if (storedUser.storeId) {
                    try {
                        const storeData = await storeService.getStoreById(storedUser.storeId);
                        setCurrentStore(storeData);
                    } catch (error) {
                        console.error('Error fetching store info:', error);
                    }
                }
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        } finally {
            setIsLoadingAuth(false);
        }
    };

    const login = async (username, password) => {
        try {
            const response = await authService.login(username, password);
            const { token: newToken, user } = response;
            
            // Cập nhật state trước khi lưu localStorage
            setToken(newToken);
            setCurrentUser(user);
            
            // Sau đó lưu vào localStorage
            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify(user));

            // Nếu user có storeId, lấy thông tin store
            if (user.storeId) {
                try {
                    const storeData = await storeService.getStoreById(user.storeId);
                    setCurrentStore(storeData);
                } catch (error) {
                    console.error('Error fetching store info:', error);
                }
            }
            
            // Chuyển hướng dựa trên vai trò
            const redirectPath = user.role === 'admin' 
                ? '/admin/dashboard'
                : `/store/${user.storeId}/dashboard`;
            navigate(redirectPath, { replace: true });
            
            return {
                success: true,
                user,
                token: newToken
            };
        } catch (error) {
            console.error('Login error:', error);
            return { 
                success: false, 
                message: error.message || 'Đăng nhập thất bại' 
            };
        }
    };

    const logout = () => {
        authService.logout();
        setToken(null);
        setCurrentUser(null);
        setCurrentStore(null);
        navigate('/login', { replace: true });
    };

    const value = {
        currentUser,
        currentStore,
        token,
        isLoadingAuth,
        isAuthenticated: !!token,
        login,
        logout,
        checkAuth
    };

    return (
        <AuthContext.Provider value={value}>
            {!isLoadingAuth && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;