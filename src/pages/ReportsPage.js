// src/pages/ReportsPage.js
import React, { useState, useEffect, useCallback } from 'react';
import styles from './ReportsPage.module.css';
import ReportCard from '../components/Reports/ReportCard';
import RevenueChart from '../components/Reports/RevenueChart';
import TopProductsList from '../components/Reports/TopProductsList';     // << IMPORT
import InventorySummary from '../components/Reports/InventorySummary';   // << IMPORT
       // << IMPORT
import Select from 'react-select';
import reportService from '../services/reportService';
// ... (timePeriodOptions, yearOptions, monthOptions, quarterOptions giữ nguyên) ...
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
    const [selectedPeriodType, setSelectedPeriodType] = useState(timePeriodOptions[2]);
    const [selectedYear, setSelectedYear] = useState(yearOptions[0]);
    const [selectedMonth, setSelectedMonth] = useState(monthOptions[new Date().getMonth()]);
    const [selectedQuarter, setSelectedQuarter] = useState(quarterOptions[Math.floor(new Date().getMonth() / 3)]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    // === States cho Báo cáo Doanh thu ===
    const [revenueReport, setRevenueReport] = useState({
        summary: { totalRevenue: 0, totalOrders: 0, averageOrderValue: 0 },
        detailsForChart: { labels: [], values: [] },
        timePeriodApplied: {}
    });
    const [isLoadingRevenue, setIsLoadingRevenue] = useState(false);
    const [errorRevenue, setErrorRevenue] = useState(null);

    // === States cho Sản phẩm bán chạy ===
    const [topProductsData, setTopProductsData] = useState([]);
    const [isLoadingTopProducts, setIsLoadingTopProducts] = useState(false);
    const [errorTopProducts, setErrorTopProducts] = useState(null);
    const [topNProducts, setTopNProducts] = useState(10); // State cho số lượng top N

    // === States cho Tồn kho ===
    const [inventoryData, setInventoryData] = useState({ totalItems: 0, overallStockQuantity: 0, lowStockItems: [] });
    const [isLoadingInventory, setIsLoadingInventory] = useState(false);
    const [errorInventory, setErrorInventory] = useState(null);
    const [lowStockThreshold, setLowStockThreshold] = useState(10); // Ngưỡng tồn kho thấp

    // === States cho Lương Nhân viên ===
    
    const [isLoadingSalary, setIsLoadingSalary] = useState(false);
    const [errorSalary, setErrorSalary] = useState(null);


    // Hàm tạo params chung cho API call
    const getCommonApiParams = useCallback(() => {
        const params = {
            periodType: selectedPeriodType.value,
            year: selectedPeriodType.value !== 'custom' ? selectedYear.value : undefined, // Chỉ gửi year nếu không phải custom
            ...(selectedPeriodType.value === 'monthly' && { month: selectedMonth.value }),
            ...(selectedPeriodType.value === 'quarterly' && { quarter: selectedQuarter.value }),
            ...(selectedPeriodType.value === 'daily' && { date: selectedDate }),
            ...(selectedPeriodType.value === 'weekly' && { year: selectedYear.value, month: selectedMonth.value /* BE cần xử lý weekly */ }),
            ...(selectedPeriodType.value === 'custom' && customStartDate && customEndDate && { startDate: customStartDate, endDate: customEndDate }),
            // storeId: currentUser.storeId (nếu cần)
        };
        Object.keys(params).forEach(key => (params[key] === undefined || params[key] === null || params[key] === '') && delete params[key]);
        return params;
    }, [selectedPeriodType, selectedYear, selectedMonth, selectedQuarter, selectedDate, customStartDate, customEndDate]);


    // Hàm fetch dữ liệu doanh thu
    const fetchRevenueData = useCallback(async () => {
        setIsLoadingRevenue(true); setErrorRevenue(null);
        const params = getCommonApiParams();
        if (selectedPeriodType.value === 'custom' && (!params.startDate || !params.endDate)) { setIsLoadingRevenue(false); return; }
        try {
            const data = await reportService.getRevenueReport(params);
            setRevenueReport({ /* ... set data ... */ });
        } catch (err) { setErrorRevenue(err.message); /* ... reset data ... */ }
        finally { setIsLoadingRevenue(false); }
    }, [getCommonApiParams, selectedPeriodType.value]); // Thêm selectedPeriodType.value để re-run đúng

    // Hàm fetch Sản phẩm bán chạy
    const fetchTopProductsData = useCallback(async () => {
        setIsLoadingTopProducts(true); setErrorTopProducts(null);
        const params = { ...getCommonApiParams(), topN: topNProducts };
        if (selectedPeriodType.value === 'custom' && (!params.startDate || !params.endDate)) { setIsLoadingTopProducts(false); return; }
        try {
            const data = await reportService.getTopSellingProductsReport(params);
            setTopProductsData(data || []);
        } catch (err) { setErrorTopProducts(err.message); setTopProductsData([]); }
        finally { setIsLoadingTopProducts(false); }
    }, [getCommonApiParams, topNProducts, selectedPeriodType.value]);

    // Hàm fetch Tồn kho
    const fetchInventoryData = useCallback(async () => {
        setIsLoadingInventory(true); setErrorInventory(null);
        const params = { lowStockThreshold: lowStockThreshold /*, storeId nếu có */ };
        try {
            const data = await reportService.getInventoryReport(params);
            setInventoryData(data || { totalItems: 0, overallStockQuantity: 0, lowStockItems: [] });
        } catch (err) { setErrorInventory(err.message); /* ... reset data ... */ }
        finally { setIsLoadingInventory(false); }
    }, [lowStockThreshold]); // Tồn kho không phụ thuộc thời gian trong ví dụ này

    // Hàm fetch Lương
   


    // Gọi fetch tất cả dữ liệu khi các bộ chọn thời gian chính thay đổi
    const handleFetchAllReports = () => {
        // Kiểm tra điều kiện trước khi fetch cho từng loại
        if (!(selectedPeriodType.value === 'custom' && (!customStartDate || !customEndDate))) {
            fetchRevenueData();
            fetchTopProductsData();
          
        }
        fetchInventoryData(); // Tồn kho có thể không phụ thuộc thời gian chính
    };

    useEffect(() => {
        handleFetchAllReports();
    }, [selectedPeriodType, selectedYear, selectedMonth, selectedQuarter, selectedDate, customStartDate, customEndDate, topNProducts, lowStockThreshold]);
    // Không đưa các hàm fetch vào đây nữa để tránh vòng lặp, chúng sẽ được gọi bởi handleFetchAllReports


    const renderTimePeriodSelectors = () => { /* ... giữ nguyên ... */ };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}><h1>Trang Báo Cáo</h1></div>

            <div className={styles.globalTimeFilter}>
                <h3>Chọn Khoảng Thời Gian Xem Báo Cáo:</h3>
                {renderTimePeriodSelectors()}
                {/* Nút Xem Báo Cáo giờ sẽ gọi handleFetchAllReports */}
                <button onClick={handleFetchAllReports} disabled={isLoadingRevenue || isLoadingTopProducts || isLoadingInventory || isLoadingSalary} className={styles.applyFilterButton}>
                    Xem Tất Cả Báo Cáo
                </button>
            </div>

            {/* Hiển thị lỗi chung nếu có */}
            {errorRevenue && <div className={styles.errorBanner}>{errorRevenue}</div>}
            {errorTopProducts && <div className={styles.errorBanner}>{errorTopProducts}</div>}
            {errorInventory && <div className={styles.errorBanner}>{errorInventory}</div>}
            {errorSalary && <div className={styles.errorBanner}>{errorSalary}</div>}


            <div className={styles.reportsGrid}>
                <ReportCard title="Báo Cáo Doanh Thu" isLoading={isLoadingRevenue} onRefresh={fetchRevenueData}
                    extraHeaderContent={!isLoadingRevenue && revenueReport.summary && (
                        <div className={styles.summaryMetrics}>
                            <span>Tổng DT: <strong>{revenueReport.summary.totalRevenue?.toLocaleString('vi-VN')} VNĐ</strong></span>
                            <span>Tổng ĐH: <strong>{revenueReport.summary.totalOrders}</strong></span>
                        </div>
                    )}>
                    {revenueReport.detailsForChart?.labels?.length > 0 ? (
                        <RevenueChart chartData={revenueReport.detailsForChart} timePeriodLabel={selectedPeriodType.label}/>
                    ) : !isLoadingRevenue && <p className={styles.noDataChart}>Không có dữ liệu doanh thu chi tiết.</p>}
                </ReportCard>

                <ReportCard title={`Top ${topNProducts} Sản Phẩm Bán Chạy`} isLoading={isLoadingTopProducts} onRefresh={fetchTopProductsData}
                    extraHeaderContent={
                        <div className={styles.topNSelector}>
                            <label htmlFor="topN">Hiển thị Top:</label>
                            <select id="topN" value={topNProducts} onChange={(e) => setTopNProducts(parseInt(e.target.value))}>
                                <option value="5">5</option>
                                <option value="10">10</option>
                                <option value="20">20</option>
                            </select>
                        </div>
                    }>
                    <TopProductsList products={topProductsData} />
                </ReportCard>

                <ReportCard title="Báo Cáo Tồn Kho" isLoading={isLoadingInventory} onRefresh={fetchInventoryData}
                    extraHeaderContent={
                        <div className={styles.lowStockSelector}>
                            <label htmlFor="lowStock">Ngưỡng sắp hết hàng:</label>
                            <input type="number" id="lowStock" value={lowStockThreshold} min="1" onChange={(e) => setLowStockThreshold(parseInt(e.target.value) || 1)} style={{width: '70px', marginLeft: '5px'}}/>
                        </div>
                    }>
                    <InventorySummary inventoryData={inventoryData} />
                </ReportCard>

            
            </div>
        </div>
    );
};

export default ReportsPage;