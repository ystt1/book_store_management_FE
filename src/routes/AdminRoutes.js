import React from 'react';
import { Route, Routes } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import Dashboard from '../components/report/Dashboard';
import CustomerAnalytics from '../components/report/CustomerAnalytics';
import RevenueReport from '../components/report/RevenueReport';
import InventoryReport from '../components/report/InventoryReport';
import SendNotification from '../components/notification/SendNotification';
import NotificationList from '../components/notification/NotificationList';

const AdminRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                
                {/* Báo cáo & Phân tích */}
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="reports/customers" element={<CustomerAnalytics />} />
                <Route path="reports/revenue" element={<RevenueReport />} />
                <Route path="reports/inventory" element={<InventoryReport />} />
                
                {/* Thông báo */}
                <Route path="notifications/send" element={<SendNotification />} />
                <Route path="notifications" element={<NotificationList />} />
            </Route>
        </Routes>
    );
};

export default AdminRoutes; 