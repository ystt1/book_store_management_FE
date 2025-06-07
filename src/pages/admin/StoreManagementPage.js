// src/pages/admin/StoreManagementPage.js
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import styles from './AdminPages.module.css'; // Tạo file CSS chung cho các trang admin
import storeService from '../../services/storeService'; // Tạo service này
import userService from '../../services/authService'; // Để lấy danh sách manager
import StoreTable from '../../components/Admin/Stores/StoreTable'; // Component mới
import StoreModal from '../../components/Admin/Stores/StoreModal'; // Component mới
import ConfirmModal from '../../components/Common/ConfirmModal';
import Pagination from '../../components/Common/Pagination';
import { FaPlus, FaSearch } from 'react-icons/fa';
import { AuthContext } from '../contexts/AuthContext';

const StoreManagementPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { currentUser } = useContext(AuthContext); // Để kiểm tra quyền nếu cần

    const [stores, setStores] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalStores, setTotalStores] = useState(0);
    const itemsPerPage = 10;

    // Search
    const [searchTerm, setSearchTerm] = useState('');

    // Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [currentStore, setCurrentStore] = useState(null);

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [itemToToggleActivity, setItemToToggleActivity] = useState({ id: null, name: '', isActive: false });

    // Data for forms
    const [managerOptions, setManagerOptions] = useState([]); // [{value: userId, label: 'Manager Name (username)'}]

    const fetchStores = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        const pageFromUrl = parseInt(searchParams.get('page')) || 1;
        const searchTermFromUrl = searchParams.get('searchTerm') || '';
        try {
            const params = {
                page: pageFromUrl,
                limit: itemsPerPage,
                ...(searchTermFromUrl && { searchTerm: searchTermFromUrl }),
                sortBy: 'name',
                sortOrder: 'asc'
            };
            const data = await storeService.getAllStores(params); // Gọi API lấy store
            setStores(data.stores || []);
            setTotalPages(data.totalPages || 0);
            setTotalStores(data.totalStores || 0);
            setCurrentPage(data.currentPage || 1);

            const newSearchParams = new URLSearchParams();
            Object.entries(params).forEach(([key,value]) => {
                if (value !== undefined && value !== '') newSearchParams.set(key, value);
            });
            if (newSearchParams.toString() !== searchParams.toString()) {
                setSearchParams(newSearchParams, {replace: true});
            }
        } catch (err) {
            setError(err.message || 'Không thể tải danh sách cửa hàng.');
        } finally {
            setIsLoading(false);
        }
    }, [itemsPerPage, searchParams, setSearchParams]);

    useEffect(() => {
        // Đồng bộ state từ URL
        setCurrentPage(parseInt(searchParams.get('page')) || 1);
        setSearchTerm(searchParams.get('searchTerm') || '');
        fetchStores();
    }, [searchParams, fetchStores]);
    


    useEffect(() => { // Fetch managers cho dropdown
        const loadManagers = async () => {
            try {
                // Giả sử userService.getUsersByRole('manager') trả về danh sách manager
                // Hoặc API /api/users?role=manager
                // Hoặc bạn có API riêng /api/stores/form-data/managers như đã làm
               const managers = await storeService.getManagersForForm(); // Hoặc userService.getManagersForStoreForm()
            setManagerOptions(managers || []);
            } catch (error) {
                console.error("Lỗi tải danh sách quản lý:", error);
            }
        };
        if (currentUser?.role === 'admin') { // Chỉ admin mới cần
            loadManagers();
        }
    }, [currentUser?.role]);


    const handlePageChange = (page) => { /* ... */ };
    const handleSearchChange = (e) => { /* ... */ };

    const openModal = (mode, store = null) => {
        setModalMode(mode);
        setCurrentStore(store ? {
            ...store,
            // Chuẩn bị manager_id cho Select nếu store.manager_id là object User
            manager_id: store.manager_id ? managerOptions.find(m => m.value === (store.manager_id._id || store.manager_id)) : null
        } : { name: '', address: '', phone: '', email: '', manager_id: null, is_active: true });
        setIsModalOpen(true);
    };
    const closeModal = () => { setIsModalOpen(false); setCurrentStore(null); };

    const handleSubmitStore = async (formData) => {
        setIsLoading(true);
        try {
            const dataToSubmit = {
                ...formData,
                manager_id: formData.manager_id ? formData.manager_id.value : null,
            };
            if (modalMode === 'add') {
                await storeService.createStore(dataToSubmit);
                alert('Tạo cửa hàng thành công!');
            } else {
                await storeService.updateStore(currentStore._id, dataToSubmit);
                alert('Cập nhật cửa hàng thành công!');
            }
            closeModal();
            fetchStores();
        } catch (err) { setError(err.message || 'Lỗi xử lý thông tin cửa hàng.'); }
        finally { setIsLoading(false); }
    };

    const handleToggleActivityClick = (storeId, storeName, currentIsActive) => {
        setItemToToggleActivity({ id: storeId, name: storeName, isActive: currentIsActive });
        setIsConfirmModalOpen(true);
    };

    const handleConfirmToggleActivity = async () => {
        if (!itemToToggleActivity.id) return;
        setIsLoading(true);
        try {
            await storeService.updateStore(itemToToggleActivity.id, { is_active: !itemToToggleActivity.isActive });
            alert(`Cửa hàng "${itemToToggleActivity.name}" đã được ${!itemToToggleActivity.isActive ? 'kích hoạt' : 'vô hiệu hóa'}.`);
            fetchStores();
        } catch (err) { setError(err.message || 'Lỗi thay đổi trạng thái cửa hàng.'); }
        finally {
            setIsLoading(false);
            setIsConfirmModalOpen(false);
            setItemToToggleActivity({ id: null, name: '', isActive: false });
        }
    };


    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <h1>Quản Lý Chuỗi Cửa Hàng</h1>
                <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => openModal('add')}>
                    <FaPlus /> Thêm Cửa Hàng
                </button>
            </div>

            <div className={styles.controlsBar}>
                <div className={styles.searchWrapper}>
                    <FaSearch className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Tìm cửa hàng (tên, địa chỉ, SĐT)..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className={styles.searchInput}
                    />
                </div>
                {/* Thêm filter theo trạng thái active/inactive nếu cần */}
            </div>

            {isLoading && <div className={styles.loadingOverlay}><div className={styles.loader}></div></div>}
            {error && <div className={styles.errorBanner}>{error}</div>}

            {!isLoading && stores.length > 0 && !error && (
                <StoreTable
                    stores={stores}
                    onEdit={openModal}
                    onToggleActivity={handleToggleActivityClick}
                />
            )}
            {!isLoading && stores.length === 0 && !error && (
                 <div className={styles.noResultsContainer}><p className={styles.noResults}>Không có cửa hàng nào.</p></div>
            )}

            {!isLoading && totalPages > 0 && stores.length > 0 && (
                <Pagination
                    currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange}
                    itemsPerPage={itemsPerPage} totalItems={totalStores}
                />
            )}

            <StoreModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSubmit={handleSubmitStore}
                currentStore={currentStore}
                mode={modalMode}
                managerOptions={managerOptions} // Truyền danh sách manager
            />
            <ConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirmToggleActivity}
                title={`Xác nhận ${itemToToggleActivity.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'} Cửa Hàng`}
                message={`Bạn có chắc muốn ${itemToToggleActivity.isActive ? 'vô hiệu hóa' : 'kích hoạt'} cửa hàng "${itemToToggleActivity.name}" không?`}
                confirmText={itemToToggleActivity.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                confirmButtonClass={itemToToggleActivity.isActive ? styles.btnDanger : styles.btnSuccess} // Thêm class cho nút confirm
            />
        </div>
    );
};
export default StoreManagementPage;