// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import BookManagementPage from './pages/BookManagementPage';
import AttributeManagementPage from './pages/AttributeManagementPage';
import CustomerManagementPage from './pages/CustomerManagementPage';
import OrderManagementPage from './pages/OrderManagementPage';
import StationeryManagementPage from './pages/StationeryManagementPage';
import GeneralImportOrderPage from './pages/GeneralImportOrderPage';
import EmployeeManagementPage from './pages/EmployeeManagementPage';
import ReportsPage from './pages/ReportsPage';
import Layout from './components/Layout/Layout'; // Import Layout
import './App.css';

// Placeholder cho các trang khác nếu cần
const QuanLyDonHangPage = () => <div><h1>Trang Quản Lý Đơn Hàng</h1><p>Nội dung đang được xây dựng...</p></div>;
const BaoCaoPage = () => <div><h1>Trang Báo Cáo</h1><p>Nội dung đang được xây dựng...</p></div>;


function App() {
  // Giả sử bạn có một cách để kiểm tra người dùng đã đăng nhập hay chưa
  // const isAuthenticated = !!localStorage.getItem('userToken'); // Ví dụ đơn giản
  const isAuthenticated = true; // Tạm thời cho phép truy cập để test layout

  return (
    <BrowserRouter>
      <Routes>
        {/* Route cho trang đăng nhập, không dùng Layout có Sidebar */}
        <Route path="/dang-nhap" element={<LoginPage />} />

        {/* Routes sử dụng Layout có Sidebar */}
        {/* Nếu chưa đăng nhập, có thể chuyển hướng về /dang-nhap */}
        <Route
          path="/"
          element={isAuthenticated ? <Layout /> : <Navigate to="/dang-nhap" replace />}
        >
          {/* Trang mặc định khi vào / (sau khi đăng nhập) */}
          <Route index element={<Navigate to="/quan-ly-sach" replace />} />
          <Route path="quan-ly-sach" element={<BookManagementPage />} />
          <Route path="quan-ly-attribute" element={<AttributeManagementPage />} />
          <Route path="quan-ly-khach-hang" element={<CustomerManagementPage />} />
          <Route path="quan-ly-don-hang" element={<OrderManagementPage />} />
          <Route path="quan-ly-van-phong-pham" element={<StationeryManagementPage />} />
          <Route path="quan-ly-nhap-hang" element={<GeneralImportOrderPage />} />
          <Route path="quan-ly-nhan-vien" element={<EmployeeManagementPage />} />
          <Route path="bao-cao" element={<ReportsPage/>} />
          {/* Thêm các route con khác sử dụng Layout ở đây */}
        </Route>

        {/* Route bắt các đường dẫn không hợp lệ */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/quan-ly-sach" : "/dang-nhap"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;