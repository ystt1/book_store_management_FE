// src/pages/ReportsPage.js
import React, { useState, useEffect, useCallback } from 'react';
import styles from './ReportsPage.module.css';
import ReportCard from '../components/Reports/ReportCard';
import RevenueChart from '../components/Reports/RevenueChart';
// Import các component biểu đồ khác khi bạn tạo chúng
// import TopProductsChart from '../../components/Reports/TopProductsChart';
// import InventoryStatusDisplay from '../../components/Reports/InventoryStatusDisplay';
// import SalaryReportDisplay from '../../components/Reports/SalaryReportDisplay';
import Select from 'react-select'; // Cho bộ chọn thời gian

const timePeriodOptions = [
    { value: 'daily', label: 'Theo Ngày' },
    { value: 'weekly', label: 'Theo Tuần' },
    { value: 'monthly', label: 'Theo Tháng' },
    { value: 'quarterly', label: 'Theo Quý' },
    { value: 'yearly', label: 'Theo Năm' },
];

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 10 }, (_, i) => ({ value: currentYear - i, label: (currentYear - i).toString() }));
const monthOptions = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `Tháng ${i + 1}` }));
const quarterOptions = [
    { value: 1, label: 'Quý 1' }, { value: 2, label: 'Quý 2' },
    { value: 3, label: 'Quý 3' }, { value: 4, label: 'Quý 4' },
];


const ReportsPage = () => {
    // === State chung cho bộ chọn thời gian ===
    const [selectedPeriodType, setSelectedPeriodType] = useState(timePeriodOptions[2]); // Mặc định theo tháng
    const [selectedYear, setSelectedYear] = useState(yearOptions[0]);
    const [selectedMonth, setSelectedMonth] = useState(monthOptions[new Date().getMonth()]); // Tháng hiện tại
    const [selectedQuarter, setSelectedQuarter] = useState(quarterOptions[Math.floor(new Date().getMonth() / 3)]); // Quý hiện tại
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Ngày hiện tại

    // === States cho Báo cáo Doanh thu ===
    const [revenueData, setRevenueData] = useState({ labels: [], values: [] });
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [isLoadingRevenue, setIsLoadingRevenue] = useState(false);

    // === States cho Sản phẩm bán chạy ===
    const [topProductsData, setTopProductsData] = useState([]); // [{name: 'Sản phẩm A', quantity: 100}]
    const [isLoadingTopProducts, setIsLoadingTopProducts] = useState(false);

    // === States cho Tồn kho ===
    const [inventoryData, setInventoryData] = useState({ totalItems: 0, lowStockItems: [] });
    const [isLoadingInventory, setIsLoadingInventory] = useState(false);

    // === States cho Lương Nhân viên ===
    const [salaryReportData, setSalaryReportData] = useState({ totalSalary: 0, details: [] });
    const [isLoadingSalary, setIsLoadingSalary] = useState(false);


    // Hàm fetch dữ liệu chung (ví dụ)
    const fetchDataForReport = useCallback(async (reportType) => {
        const params = {
            periodType: selectedPeriodType.value,
            year: selectedYear.value,
            month: selectedPeriodType.value === 'monthly' || selectedPeriodType.value === 'daily' || selectedPeriodType.value === 'weekly' ? selectedMonth.value : undefined,
            quarter: selectedPeriodType.value === 'quarterly' ? selectedQuarter.value : undefined,
            date: selectedPeriodType.value === 'daily' ? selectedDate : undefined,
        };
        console.log(`Fetching ${reportType} with params:`, params);

        // --- MÔ PHỎNG API CALL ---
        await new Promise(resolve => setTimeout(resolve, 1000)); // Giả lập độ trễ
        if (reportType === 'revenue') {
            setIsLoadingRevenue(true);
            // Dữ liệu mẫu cho doanh thu
            const mockLabels = selectedPeriodType.value === 'monthly'
                ? ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4']
                : (selectedPeriodType.value === 'yearly'
                    ? monthOptions.map(m => m.label.split(' ')[1]) // Chỉ lấy số tháng
                    : ['Điểm dữ liệu 1', 'Điểm 2', 'Điểm 3', 'Điểm 4', 'Điểm 5']);
            const mockValues = mockLabels.map(() => Math.floor(Math.random() * 50000000) + 10000000);
            setRevenueData({ labels: mockLabels, values: mockValues });
            setTotalRevenue(mockValues.reduce((sum, val) => sum + val, 0));
            setIsLoadingRevenue(false);
        } else if (reportType === 'topProducts') {
            setIsLoadingTopProducts(true);
            setTopProductsData([
                { name: 'Sách ReactJS', quantity: Math.floor(Math.random() * 100) + 20 },
                { name: 'Bút bi Thiên Long', quantity: Math.floor(Math.random() * 200) + 50 },
                { name: 'Vở Campus', quantity: Math.floor(Math.random() * 150) + 30 },
                { name: 'Sách Node.js', quantity: Math.floor(Math.random() * 80) + 10 },
            ].sort((a,b) => b.quantity - a.quantity));
            setIsLoadingTopProducts(false);
        } else if (reportType === 'inventory') {
            setIsLoadingInventory(true);
            setInventoryData({
                totalItems: Math.floor(Math.random() * 1000) + 500,
                lowStockItems: [
                    {name: 'Sách C++', stock: Math.floor(Math.random()*5)+1},
                    {name: 'Giấy A4 Double A', stock: Math.floor(Math.random()*10)+3}
                ]
            });
            setIsLoadingInventory(false);
        } else if (reportType === 'salary') {
            setIsLoadingSalary(true);
            setSalaryReportData({
                totalSalary: Math.floor(Math.random() * 200000000) + 50000000,
                details: [
                    {name: 'Nguyễn Văn An', salary: 8000000},
                    {name: 'Trần Thị Bình', salary: 15000000}
                ]
            });
            setIsLoadingSalary(false);
        }
        // --- KẾT THÚC MÔ PHỎNG ---
        // Trong thực tế, bạn sẽ gọi API dựa trên reportType và params
        // Ví dụ: const response = await fetch(`/api/reports/${reportType}?year=${params.year}&month=${params.month}...`);
        // const data = await response.json();
        // set....(data);
    }, [selectedPeriodType, selectedYear, selectedMonth, selectedQuarter, selectedDate]);

    // Gọi fetch dữ liệu khi các bộ chọn thời gian thay đổi
    useEffect(() => {
        fetchDataForReport('revenue');
        fetchDataForReport('topProducts');
        fetchDataForReport('inventory');
        fetchDataForReport('salary');
    }, [fetchDataForReport]); // fetchDataForReport đã được memoized bởi useCallback


    const renderTimePeriodSelectors = () => (
        <div className={styles.timeSelectors}>
            <Select
                options={timePeriodOptions}
                value={selectedPeriodType}
                onChange={setSelectedPeriodType}
                className={`${styles.timeSelect} react-select-container-report`}
                classNamePrefix="react-select-report"
            />
            <Select
                options={yearOptions}
                value={selectedYear}
                onChange={setSelectedYear}
                className={`${styles.timeSelect} react-select-container-report`}
                classNamePrefix="react-select-report"
            />
            {(selectedPeriodType.value === 'monthly' || selectedPeriodType.value === 'daily' || selectedPeriodType.value === 'weekly') && (
                <Select
                    options={monthOptions}
                    value={selectedMonth}
                    onChange={setSelectedMonth}
                    className={`${styles.timeSelect} react-select-container-report`}
                    classNamePrefix="react-select-report"
                />
            )}
            {selectedPeriodType.value === 'quarterly' && (
                <Select
                    options={quarterOptions}
                    value={selectedQuarter}
                    onChange={setSelectedQuarter}
                    className={`${styles.timeSelect} react-select-container-report`}
                    classNamePrefix="react-select-report"
                />
            )}
            {selectedPeriodType.value === 'daily' && (
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className={styles.dateInput}
                />
            )}
        </div>
    );

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <h1>Trang Báo Cáo Tổng Hợp</h1>
                {/* Nút Export tổng có thể đặt ở đây */}
            </div>

            <div className={styles.globalTimeFilter}>
                <h3>Chọn Khoảng Thời Gian Xem Báo Cáo:</h3>
                {renderTimePeriodSelectors()}
            </div>

            <div className={styles.reportsGrid}>
                <ReportCard title="Báo Cáo Doanh Thu" isLoading={isLoadingRevenue} onRefresh={() => fetchDataForReport('revenue')} extraHeaderContent={<span>Tổng: {totalRevenue.toLocaleString('vi-VN')} VNĐ</span>}>
                    <RevenueChart chartData={revenueData} timePeriodLabel={selectedPeriodType.label} />
                </ReportCard>

                <ReportCard title="Sản Phẩm Bán Chạy" isLoading={isLoadingTopProducts} onRefresh={() => fetchDataForReport('topProducts')}>
                    {/* Thay thế bằng TopProductsChart và hiển thị dữ liệu topProductsData */}
                    <ul className={styles.topProductList}>
                        {topProductsData.map(p => <li key={p.name}><span>{p.name}</span> <span>{p.quantity} đã bán</span></li>)}
                    </ul>
                </ReportCard>

                <ReportCard title="Báo Cáo Tồn Kho" isLoading={isLoadingInventory} onRefresh={() => fetchDataForReport('inventory')}>
                    {/* Thay thế bằng InventoryStatusDisplay */}
                    <p>Tổng số loại sản phẩm trong kho: {inventoryData.totalItems}</p>
                    <h4>Sản phẩm sắp hết hàng:</h4>
                    <ul>
                        {inventoryData.lowStockItems.map(item => <li key={item.name}>{item.name} (còn {item.stock})</li>)}
                    </ul>
                </ReportCard>

                <ReportCard title="Báo Cáo Lương Nhân Viên" isLoading={isLoadingSalary} onRefresh={() => fetchDataForReport('salary')}>
                    {/* Thay thế bằng SalaryReportDisplay */}
                    <p>Tổng chi phí lương kỳ này: {salaryReportData.totalSalary.toLocaleString('vi-VN')} VNĐ</p>
                    <h4>Chi tiết :</h4>
                    <ul>
                        {salaryReportData.details.map(emp => <li key={emp.name}>{emp.name}: {emp.salary.toLocaleString('vi-VN')} VNĐ</li>)}
                    </ul>
                </ReportCard>
            </div>
        </div>
    );
};

export default ReportsPage;