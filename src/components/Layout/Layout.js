// src/components/Layout/Layout.js
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import styles from './Layout.module.css';

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Tự động đóng sidebar trên màn hình nhỏ khi load
    useEffect(() => {
        const checkScreenSize = () => {
            if (window.innerWidth <= 992) { // Thay đổi breakpoint nếu cần
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(true);
            }
        }
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    return (
        <div className={styles.appContainer}>
            {/* Không còn Topbar ở đây */}
            <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
            <main className={`${styles.mainContent} ${isSidebarOpen ? styles.mainContentShifted : styles.mainContentFull}`}>
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;