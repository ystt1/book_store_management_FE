// src/components/Layout/Sidebar.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';
// Ví dụ dùng react-icons
import {
    FaTachometerAlt, FaBook, FaShoppingCart, FaChartBar, FaSignOutAlt,
    FaBars, FaTimes // Icons cho nút toggle
} from 'react-icons/fa';

const Sidebar = ({ isOpen, onToggle }) => { // Nhận onToggle từ Layout

    return (
        <div className={`${styles.sidebar} ${!isOpen ? styles.collapsed : ''}`}>
            <div className={styles.sidebarHeader}>
                <div className={styles.sidebarHeaderLogo}>
                    <FaTachometerAlt className={styles.icon} />
                    <span className={styles.navText}>Quản Lý</span> {/* navText class giúp ẩn */}
                </div>
                <button onClick={onToggle} className={styles.toggleButton}>
                    {isOpen ? <FaTimes /> : <FaBars />} {/* Thay đổi icon tùy trạng thái */}
                </button>
            </div>

            <nav className={styles.sidebarNav}>
                <ul>
                    <li>
                        <NavLink
                            to="/quan-ly-sach"
                            className={({ isActive }) => isActive ? styles.active : ''}
                            title="Quản Lý Sách" // Thêm title cho tooltip khi thu gọn
                        >
                            <FaBook className={styles.icon} />
                            <span className={styles.navText}>Quản Lý Sách</span>
                        </NavLink>
                    </li>
                     <li>
                        <NavLink
                            to="/quan-ly-van-phong-pham"
                            className={({ isActive }) => isActive ? styles.active : ''}
                            title="Quản Lý Văn Phòng Phẩm"
                        >
                            <FaShoppingCart className={styles.icon} />
                            <span className={styles.navText}>Quản Lý Văn Phòng Phẩm</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/quan-ly-nhap-hang"
                            className={({ isActive }) => isActive ? styles.active : ''}
                            title="Quản Lý Nhập Hàng"
                        >
                            <FaShoppingCart className={styles.icon} />
                            <span className={styles.navText}>Quản Lý Nhập Hàng</span>
                        </NavLink>
                    </li>
                     <li>
                        <NavLink
                            to="/quan-ly-attribute"
                            className={({ isActive }) => isActive ? styles.active : ''}
                            title="Quản Lý Sách" // Thêm title cho tooltip khi thu gọn
                        >
                            <FaBook className={styles.icon} />
                            <span className={styles.navText}>Quản Lý Thuộc Tính</span>
                        </NavLink>
                    </li>
                     <li>
                        <NavLink
                            to="/quan-ly-khach-hang"
                            className={({ isActive }) => isActive ? styles.active : ''}
                            title="Quản lý khách hàng" // Thêm title cho tooltip khi thu gọn
                        >
                            <FaBook className={styles.icon} />
                            <span className={styles.navText}>Quản lý khách hàng</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/quan-ly-don-hang"
                            className={({ isActive }) => isActive ? styles.active : ''}
                            title="Quản Lý Đơn Hàng"
                        >
                            <FaShoppingCart className={styles.icon} />
                            <span className={styles.navText}>Quản Lý Đơn Hàng</span>
                        </NavLink>
                    </li>

                    <li>
                        <NavLink
                            to="/quan-ly-nhan-vien"
                            className={({ isActive }) => isActive ? styles.active : ''}
                            title="Quản Lý Nhân Viên"
                        >
                            <FaShoppingCart className={styles.icon} />
                            <span className={styles.navText}>Quản Lý Nhân Viên</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/bao-cao"
                            className={({ isActive }) => isActive ? styles.active : ''}
                            title="Báo Cáo"
                        >
                            <FaChartBar className={styles.icon} />
                            <span className={styles.navText}>Báo Cáo</span>
                        </NavLink>
                    </li>
                    {/* Thêm các mục khác */}
                </ul>
            </nav>

            <div className={styles.sidebarFooter}>
                 <NavLink to="/login" title="Đăng Xuất">
                    <FaSignOutAlt className={styles.icon} />
                    <span className={styles.navText}>Đăng Xuất</span>
                </NavLink>
            </div>
        </div>
    );
};

export default Sidebar;