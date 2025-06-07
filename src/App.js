// src/App.js
import React from "react";
import {
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
  useParams,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import BookManagementPage from "./pages/BookManagementPage";
import AttributeManagementPage from "./pages/AttributeManagementPage";
import CustomerManagementPage from "./pages/CustomerManagementPage";
import OrderManagementPage from "./pages/OrderManagementPage";
import StationeryManagementPage from "./pages/StationeryManagementPage";
import GeneralImportOrderPage from "./pages/GeneralImportOrderPage";
import EmployeeManagementPage from "./pages/EmployeeManagementPage";
import ReportsPage from "./pages/ReportsPage";
import StoreLayout from "./components/Layout/Layout"; // Rename to StoreLayout
import AdminLayout from "./components/Layout/AdminLayout"; // Layout RIÊNG cho admin
import { useAuth } from "./contexts/AuthContext";
import StoreManagementPage from "./pages/StoreManagementPage";
import UserManagementPage from './pages/UserManagementPage';
import StoreDetailPage from './pages/StoreDetailPage';
import ProfilePage from './pages/ProfilePage';
import StoreDashboardPage from './pages/StoreDashboardPage';
import NotificationManagement from './pages/admin/NotificationManagement';
import NotificationPage from './pages/NotificationPage';
import ReportsDashboardPage from "./pages/ReportsDashboardPage";
import "./App.css";

// ProtectedRoute kiểm tra đăng nhập và vai trò
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, currentUser, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Admin có thể truy cập mọi route
  if (currentUser.role === 'admin') {
    return children;
  }

  // Với các role khác, kiểm tra quyền truy cập
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

// PublicRoute cho trang đăng nhập
const PublicRoute = () => {
  const { currentUser, token, isLoadingAuth } = useAuth();
  const location = useLocation();

  if (isLoadingAuth) {
    return <div className="loading-app">Đang tải ứng dụng...</div>;
  }

  if (currentUser && token) {
    // Chuyển hướng dựa trên vai trò
    const defaultPath = currentUser.role === 'admin' 
      ? '/admin/dashboard' 
      : `/store/${currentUser.storeId}/dashboard`;
    return <Navigate to={defaultPath} replace />;
  }

  return <Outlet />;
};

// FallbackNavigate cho các route không tồn tại
const FallbackNavigate = () => {
  const { currentUser, token, isLoadingAuth } = useAuth();
  if (isLoadingAuth) return <div className="loading-app">Đang tải...</div>;

  if (currentUser && token) {
    const defaultPath = currentUser.role === 'admin' 
      ? '/admin/dashboard' 
      : `/store/${currentUser.storeId}/dashboard`;
    return <Navigate to={defaultPath} replace />;
  }
  return <Navigate to="/login" replace />;
};

// Admin Routes Component
const AdminRoutes = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/dashboard" element={<AdminDashboardPage />} />
        <Route path="/stores" element={<StoreManagementPage />} />
        <Route path="/stores/:storeId" element={<StoreDetailPage />} />
        <Route path="/users" element={<UserManagementPage />} />
        <Route path="/customers" element={<CustomerManagementPage />} />
        <Route path="/books" element={<BookManagementPage />} />
        <Route path="/orders" element={<OrderManagementPage />} />
        <Route path="/general-import" element={<GeneralImportOrderPage />} />
        <Route path="/reports" element={<ReportsDashboardPage />} />
        <Route path="/settings" element={<div>Cài Đặt Hệ Thống</div>} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/notifications" element={<NotificationManagement />} />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </AdminLayout>
  );
};

// Store Routes Component
const StoreRoutes = () => {
  const { storeId } = useParams();
  
  return (
    <StoreLayout>
      <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<StoreDashboardPage />} />
        
        {/* Manager Only Routes */}
        <Route path="quan-ly-nhan-vien" element={
          <ProtectedRoute allowedRoles={['manager']}>
            <EmployeeManagementPage />
          </ProtectedRoute>
        } />
        <Route path="bao-cao" element={
          <ProtectedRoute allowedRoles={['manager']}>
            <ReportsDashboardPage />
          </ProtectedRoute>
        } />

        {/* Profile Route */}
        <Route path="profile" element={<ProfilePage />} />

        {/* Notifications Route */}
        <Route path="notifications" element={<NotificationPage />} />

        {/* Shared Routes for Manager & Staff */}
        <Route path="quan-ly-sach" element={<BookManagementPage />} />
        <Route path="quan-ly-van-phong-pham" element={<StationeryManagementPage />} />
        <Route path="quan-ly-attribute" element={<AttributeManagementPage />} />
        <Route path="quan-ly-khach-hang" element={<CustomerManagementPage />} />
        <Route path="quan-ly-don-hang" element={<OrderManagementPage />} />
        <Route path="quan-ly-nhap-hang" element={<GeneralImportOrderPage />} />
        
        {/* Fallback route for store */}
        <Route path="*" element={<Navigate to={`/store/${storeId}/dashboard`} replace />} />
      </Routes>
    </StoreLayout>
  );
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminRoutes />
          </ProtectedRoute>
        }
      />

      {/* Store Routes (Manager & Staff) */}
      <Route
        path="/store/:storeId/*"
        element={
          <ProtectedRoute allowedRoles={['manager', 'staff', 'admin']}>
            <StoreRoutes />
          </ProtectedRoute>
        }
      />

      {/* Other Routes */}
      <Route path="/unauthorized" element={
        <div style={{textAlign: 'center', marginTop: '50px'}}>
          <h1>403 - Không Có Quyền Truy Cập</h1>
          <p>Bạn không được phép xem trang này.</p>
        </div>
      } />
      <Route path="*" element={<FallbackNavigate />} />
    </Routes>
  );
}

export default App;