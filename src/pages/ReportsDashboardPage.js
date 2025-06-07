import React, { useState } from 'react';
import { Tabs, Card } from 'antd';
import RevenueReport from '../components/report/RevenueReport';
import InventoryReport from '../components/report/InventoryReport';
import CustomerAnalytics from '../components/report/CustomerAnalytics';
import Dashboard from '../components/report/Dashboard';

const { TabPane } = Tabs;

const ReportsDashboardPage = () => {
    const [activeTab, setActiveTab] = useState('1');

    return (
        <div style={{ padding: '24px' }}>
            <Card title="Báo Cáo & Phân Tích" className="report-dashboard">
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    type="card"
                    size="large"
                    style={{ marginTop: '-16px' }}
                >
                    <TabPane tab="Tổng Quan" key="1">
                        <Dashboard />
                    </TabPane>
                    <TabPane tab="Báo Cáo Doanh Thu" key="2">
                        <RevenueReport />
                    </TabPane>
                    <TabPane tab="Báo Cáo Tồn Kho" key="3">
                        <InventoryReport />
                    </TabPane>
                    <TabPane tab="Phân Tích Khách Hàng" key="4">
                        <CustomerAnalytics />
                    </TabPane>
                </Tabs>
            </Card>
        </div>
    );
};

export default ReportsDashboardPage; 