// src/pages/EmployeeManagementPage.js
import React, { useState, useEffect, useMemo, useCallback, useContext } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import styles from './EmployeeManagementPage.module.css';
import EmployeeTable from '../components/Employees/EmployeeTable';
import EmployeeModal from '../components/Employees/EmployeeModal';
import SalaryPaymentModal from '../components/Employees/SalaryPaymentModal';
import SalaryHistoryModal from '../components/Employees/SalaryHistoryModal';
import ConfirmModal from '../components/Common/ConfirmModal';
import Pagination from '../components/Common/Pagination';
import Select from 'react-select'; // Cho filter theo vai trò, cửa hàng
import employeeService from '../services/employeeService';
import { AuthContext } from '../contexts/AuthContext';
import { FaPlus, FaSearch, FaFilter, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { Space, Button, Modal, Form, Input, message, Select as AntSelect, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';

const { Option } = AntSelect;

const roleOptionsForFilter = [
    { value: 'staff', label: 'Nhân viên' },
    { value: 'manager', label: 'Quản lý' },
    // { value: 'admin', label: 'Quản trị viên' }, // Admin thường không hiện trong danh sách NV thông thường
];

const initialEmployeeFormForModal = {
    username: '', email_user: '', password: '', full_name_user: '', role: null,
    phone_employee: '', position: '', base_salary: '', store_id: null
};
// roleOptions cho EmployeeModal đã được định nghĩa bên trong nó

const EmployeeManagementPage = () => {
    const { storeId } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const { currentUser } = useAuth();

    const [employees, setEmployees] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalEmployees, setTotalEmployees] = useState(0);
    const itemsPerPage = 10;

    // Filter
    const [searchTerm, setSearchTerm] = useState('');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [filterRole, setFilterRole] = useState(null);
    const [filterStore, setFilterStore] = useState(null); // Nếu admin xem và muốn lọc theo cửa hàng

    // Data cho dropdown
    const [storeOptions, setStoreOptions] = useState([]); // Danh sách cửa hàng cho filter (nếu admin)

    // Modals
    const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
    const [employeeModalMode, setEmployeeModalMode] = useState('add');
    const [currentEmployee, setCurrentEmployee] = useState(null); // Cho sửa NV và thanh toán/xem lịch sử lương

    const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
    // employeeToPay sẽ là currentEmployee

    const [isSalaryHistoryModalOpen, setIsSalaryHistoryModalOpen] = useState(false);
    const [salaryHistory, setSalaryHistory] = useState([]);
    // Thêm state cho pagination của SalaryHistory nếu cần
    // const [historyCurrentPage, setHistoryCurrentPage] = useState(1);
    // const [historyTotalPages, setHistoryTotalPages] = useState(0);
    // const historyItemsPerPage = 5;


    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState({ id: null, name: '' });

    const [modalVisible, setModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingId, setEditingId] = useState(null);

    const columns = [
        {
            title: 'Tên đăng nhập',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: 'Họ và tên',
            dataIndex: 'full_name_user',
            key: 'full_name_user',
        },
        {
            title: 'Email',
            dataIndex: 'email_user',
            key: 'email_user',
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone_employee',
            key: 'phone_employee',
        },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            render: (role) => {
                switch (role) {
                    case 'admin':
                        return 'Quản trị viên';
                    case 'manager':
                        return 'Quản lý';
                    case 'staff':
                        return 'Nhân viên';
                    default:
                        return role;
                }
            },
        },
        {
            title: 'Chức vụ',
            dataIndex: 'position',
            key: 'position',
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa nhân viên này?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Có"
                        cancelText="Không"
                    >
                        <Button
                            type="primary"
                            danger
                            icon={<DeleteOutlined />}
                        >
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const fetchEmployees = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        const pageFromUrl = parseInt(searchParams.get('page')) || 1;
        const searchTermFromUrl = searchParams.get('searchTerm') || '';
        const roleFromUrl = searchParams.get('role') || '';

        try {
            const params = {
                page: pageFromUrl,
                limit: itemsPerPage,
                storeId: storeId, // Thêm storeId vào params để lọc theo cửa hàng
                ...(searchTermFromUrl && { searchTerm: searchTermFromUrl }),
                ...(roleFromUrl && { role: roleFromUrl }),
            };
            Object.keys(params).forEach(key => (params[key] === undefined || params[key] === '') && delete params[key]);

            console.log('Fetching employees with params:', params);
            const response = await employeeService.getAllEmployees(storeId, params);
            console.log('Raw API Response:', response);

            // Kiểm tra và xử lý dữ liệu
            if (!response || !response.employees) {
                console.error('Invalid response format:', response);
                setError('Dữ liệu nhận được không đúng định dạng');
                return;
            }

            // Log dữ liệu trước khi set state
            console.log('Setting employees data:', response.employees);

            // Set state với dữ liệu đã xử lý
            setEmployees(response.employees);
            setTotalPages(response.totalPages || 0);
            setTotalEmployees(response.totalEmployees || 0);
            setCurrentPage(response.currentPage || 1);

            // Cập nhật URL params
            const newSearchParams = new URLSearchParams();
            Object.entries(params).forEach(([key,value]) => {
                if (value !== undefined && value !== '') newSearchParams.set(key, value);
            });
            if (newSearchParams.toString() !== searchParams.toString()) {
                setSearchParams(newSearchParams, {replace: true});
            }

        } catch (err) {
            console.error('Error fetching employees:', err);
            setError(err.message || 'Không thể tải danh sách nhân viên.');
        } finally {
            setIsLoading(false);
        }
    }, [itemsPerPage, searchParams, setSearchParams, storeId]);

    // Thêm useEffect để log khi employees state thay đổi
    useEffect(() => {
        console.log('Employees state updated:', employees);
    }, [employees]);

    const handlePageChange = (page) => setCurrentPage(page);

    useEffect(() => {
        if (currentUser?.role === 'admin') { // Chỉ admin mới cần load danh sách store để filter
            employeeService.getStoresForForm()
                .then(setStoreOptions)
                .catch(err => console.error("Lỗi tải danh sách cửa hàng cho filter:", err));
        }
        // Đồng bộ state filter từ URL
        const roleValFromUrl = searchParams.get('role');
        setFilterRole(roleOptionsForFilter.find(opt => opt.value === roleValFromUrl) || null);

        const storeValFromUrl = searchParams.get('storeId');
        // Chỉ setFilterStore nếu storeOptions đã tải và người dùng là admin
        if (currentUser?.role === 'admin' && storeOptions.length > 0) {
            setFilterStore(storeOptions.find(opt => opt.value === storeValFromUrl) || null);
        } else if (currentUser?.role !== 'admin') {
            setFilterStore(null); // Manager/staff không filter theo store này
        }
        // Các filter khác đã được init từ searchParams trong useState
    }, [searchParams, currentUser?.role, storeOptions.length]); // Thêm storeOptions.length

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]); // fetchEmployees đã useCallback

     const handleFilterChange = (filterName, value) => {
        const newParams = new URLSearchParams(searchParams);

        // Xử lý giá trị từ react-select
        if (value && typeof value === 'object' && value.value !== undefined) {
            newParams.set(filterName, value.value);
        } else if (value && typeof value === 'string' && value.trim() !== '') {
            newParams.set(filterName, value.trim());
        } else {
            newParams.delete(filterName); // Xóa param nếu value rỗng hoặc null
        }

        newParams.set('page', '1'); // Luôn quay về trang 1 khi có filter mới
        setSearchParams(newParams);
        // useEffect lắng nghe searchParams sẽ tự động cập nhật state và gọi fetchEmployees
    };
    const resetAdvancedFilters = () => {
        // Giữ lại searchTerm chính nếu có
        const newParams = new URLSearchParams();
        const currentSearchTerm = searchParams.get('searchTerm');
        if (currentSearchTerm) {
            newParams.set('searchTerm', currentSearchTerm);
        }
        newParams.set('page', '1');
        setSearchParams(newParams);

        // Reset state của các filter nâng cao (UI sẽ tự cập nhật theo useEffect)
        // setFilterRole(null);
        // setFilterStore(null);
        // Nếu bạn không muốn đợi useEffect, có thể set trực tiếp ở đây và gọi fetch
        // Ví dụ:
        // setFilterRole(null);
        // setFilterStore(null);
        // fetchEmployees(1, { searchTerm: currentSearchTerm }); // Gọi fetch với filter đã reset
    };
    const openEmployeeModal = (mode, employee = null) => {
        setEmployeeModalMode(mode);
        if (mode === 'edit' && employee) {
            // Chuẩn bị dữ liệu cho form sửa
            // employee từ API có thể cần map lại cho Select (role, store_id)
            const storeForEmployee = employee.store_id // store_id từ Employee đã được populate là object Store
                ? storeOptions.find(opt => opt.value === (employee.store_id._id || employee.store_id.id || employee.store_id)) // Tìm trong storeOptions
                : null;

            setCurrentEmployee({
                ...initialEmployeeFormForModal, // Bắt đầu với form chuẩn
                id: employee._id || employee.id, // ID của Employee document
                user_id: employee.user_id_obj?._id || employee.user_id_obj?.id, // ID của User document
                username: employee.username || '',
                email_user: employee.email_user || '',
                full_name_user: employee.full_name_user || '',
                role: employee.user_id_obj?.role ? roleOptionsForFilter.find(r => r.value === employee.user_id_obj.role) : null, // role là object {value, label}
                phone_employee: employee.phone_employee || '',
                position: employee.position || '',
                base_salary: employee.base_salary || '',
                store_id: storeForEmployee, // store_id là object {value, label} cho Select
                // Không set password ở đây, trường password trong modal sẽ riêng
            });
            console.log("Opening Edit Modal with employee:", employee, "and storeOptions:", storeOptions, "selected store:", storeForEmployee);
        } else { // Chế độ 'add'
            setCurrentEmployee(initialEmployeeFormForModal); // Reset về form rỗng
            console.log("Opening Add Modal");
        }
        setIsEmployeeModalOpen(true);
    };
    const closeEmployeeModal = () => {
        setIsEmployeeModalOpen(false);
        setCurrentEmployee(null); // Reset để không bị "nhớ" dữ liệu
        // Không cần reset employeeModalMode vì nó sẽ được set lại khi mở
    };


    const handleSubmitEmployee = async (formDataFromModal) => {
        setIsLoading(true);
        try {
            // Thêm storeId vào formData khi tạo nhân viên
            const employeeData = {
                ...formDataFromModal,
                storeId: storeId // Thêm storeId từ useParams
            };
           
            if (employeeModalMode === 'add') {
                await employeeService.createEmployee(storeId, employeeData);
                alert('Thêm nhân viên thành công!');
            } else {
                await employeeService.updateEmployee(storeId, currentEmployee.id, employeeData);
                alert('Cập nhật nhân viên thành công!');
            }
            closeEmployeeModal();
            fetchEmployees(); // Fetch lại
        } catch (err) { setError(err.message || 'Lỗi xử lý thông tin nhân viên.'); }
        finally { setIsLoading(false); }
    };

   const handleDeleteClick = (employeeId, employeeName) => {
        console.log("Request to delete employee:", employeeId, employeeName);
        setItemToDelete({ id: employeeId, name: employeeName || `ID: ${employeeId}` }); // Lưu cả ID và tên
        setIsConfirmModalOpen(true);
    };
   const handleConfirmDelete = async () => {
        if (!itemToDelete.id) {
            console.error("No employee ID to delete.");
            setIsConfirmModalOpen(false); // Đóng modal nếu không có ID
            return;
        }

        setIsLoading(true); // Hiển thị loading trong khi xóa
        setError(null);

        try {
            await employeeService.deleteEmployee(storeId, itemToDelete.id);
            alert(`Nhân viên "${itemToDelete.name}" đã được xóa thành công!`);

            setIsConfirmModalOpen(false); // Đóng modal xác nhận

            // Sau khi xóa, fetch lại dữ liệu.
            // Cần tính toán lại trang hiện tại để tránh ở lại trang trống.
            const currentTotalAfterDelete = totalEmployees - 1; // Giả sử xóa thành công 1 item
            let pageToFetch = currentPage;

            if (employees.length === 1 && currentPage > 1) {
                // Nếu xóa item cuối cùng của trang hiện tại (và không phải trang 1)
                pageToFetch = currentPage - 1;
            } else if (currentTotalAfterDelete <= 0) {
                pageToFetch = 1; // Nếu không còn nhân viên nào, về trang 1
            }
            // Cập nhật URL và fetch lại
            const newParams = new URLSearchParams(searchParams);
            newParams.set('page', pageToFetch.toString());
            // Không cần set lại các filter khác vì chúng vẫn giữ nguyên
            setSearchParams(newParams);
            // useEffect lắng nghe searchParams sẽ tự động gọi fetchEmployees
            // Hoặc bạn có thể gọi fetchEmployees trực tiếp ở đây nếu không muốn phụ thuộc useEffect:
            // fetchEmployees(pageToFetch, {searchTerm, role: filterRole?.value, storeId: filterStore?.value, ...});


        } catch (err) {
            console.error("Lỗi khi xóa nhân viên:", err);
            setError(err.message || 'Lỗi khi xóa nhân viên. Vui lòng thử lại.');
            setIsConfirmModalOpen(false); // Vẫn đóng modal khi có lỗi
        } finally {
            setIsLoading(false);
            setItemToDelete({ id: null, name: '' }); // Reset item cần xóa
        }
    };


    const openSalaryModal = (employee) => {
        setCurrentEmployee(employee); // employee này sẽ là employeeToPay
        setIsSalaryModalOpen(true);
    };
    const handleProcessSalary = async (paymentData) => {
        setIsLoading(true);
        try {
            await employeeService.paySalary(storeId, paymentData.employeeId, paymentData);
            alert(`Thanh toán lương cho ${currentEmployee?.full_name_user || currentEmployee?.id} thành công.`);
            setIsSalaryModalOpen(false);
            // Không cần fetch lại danh sách nhân viên, nhưng có thể muốn fetch lại lịch sử lương nếu đang xem
        } catch (err) { setError(err.message || 'Lỗi khi thanh toán lương.'); }
        finally { setIsLoading(false); }
    };

    const openSalaryHistoryModal = async (employee) => {
        setCurrentEmployee(employee);
        setIsLoading(true); // Loading cho lịch sử lương
        try {
            const historyData = await employeeService.getSalaryHistory(storeId, employee.id, { page: 1, limit: 100 }); // Lấy nhiều cho modal
            setSalaryHistory(historyData.history || []);
            // setHistoryCurrentPage(historyData.currentPage || 1);
            // setHistoryTotalPages(historyData.totalPages || 0);
            setIsSalaryHistoryModalOpen(true);
        } catch (err) { setError(err.message || "Lỗi tải lịch sử lương."); }
        finally { setIsLoading(false); }
    };

    const handleEdit = (record) => {
        setEditingId(record.id);
        form.setFieldsValue(record);
        setModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            await employeeService.deleteEmployee(storeId, id);
            message.success('Xóa nhân viên thành công');
            fetchEmployees();
        } catch (error) {
            message.error('Lỗi khi xóa nhân viên');
        }
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            if (editingId) {
                await employeeService.updateEmployee(storeId, editingId, values);
                message.success('Cập nhật nhân viên thành công');
            } else {
                await employeeService.createEmployee(storeId, values);
                message.success('Thêm nhân viên thành công');
            }
            setModalVisible(false);
            form.resetFields();
            setEditingId(null);
            fetchEmployees();
        } catch (error) {
            console.error('Validate Failed:', error);
        }
    };

    const handleModalCancel = () => {
        setModalVisible(false);
        form.resetFields();
        setEditingId(null);
    };

    // --- JSX ---
    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <h1>Quản Lý Nhân Viên</h1>
            </div>
            <div className={styles.controlsBar}>
                <div className={styles.searchWrapper}>
                    <FaSearch className={styles.searchIcon} />
                    <input type="text" placeholder="Tìm nhân viên..." value={searchTerm}
                           onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                           className={styles.searchInput} />
                </div>
                { (currentUser?.role === 'admin' || currentUser?.role === 'manager') &&
                    <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => openEmployeeModal('add')}>
                        <FaPlus /> Thêm Nhân Viên
                    </button>
                }
                 <button onClick={() => setShowAdvancedFilters(!showAdvancedFilters)} className={`${styles.btn} ${styles.btnToggleFilter}`} style={{marginLeft: currentUser?.role === 'admin' || currentUser?.role === 'manager' ? '15px' : 'auto'}}>
                    <FaFilter /> Lọc {showAdvancedFilters ? <FaChevronUp /> : <FaChevronDown />}
                </button>
            </div>

            {showAdvancedFilters && (
                <div className={`${styles.advancedFilterBar} ${showAdvancedFilters ? styles.open : ''}`}>
                    <h4 className={styles.advancedFilterTitle}>Lọc nhân viên:</h4>
                    <div className={styles.filterGrid}>
                        <Select 
                            options={roleOptionsForFilter}
                            value={filterRole}
                            onChange={(val) => handleFilterChange('role', val)}
                            placeholder="Theo vai trò"
                            isClearable
                            className={`${styles.filterControl} react-select-container`}
                            classNamePrefix="react-select"
                        />
                        {currentUser?.role === 'admin' && (
                            <Select
                                options={storeOptions}
                                value={filterStore}
                                onChange={(val) => handleFilterChange('storeId', val)}
                                placeholder="Theo cửa hàng"
                                isClearable
                                className={`${styles.filterControl} react-select-container`}
                                classNamePrefix="react-select"
                            />
                        )}
                    </div>
                </div>
            )}

            {isLoading && <div className={styles.loadingOverlay}><div className={styles.loader}></div></div>}
            {error && <div className={styles.errorBanner}>{error}</div>}

            {/* Employee Table */}
            {!isLoading && employees && employees.length > 0 && !error && (
                <>
                    <div style={{display: 'none'}}>
                        {console.log('Data being passed to EmployeeTable:', employees)}
                    </div>
                    <EmployeeTable
                        employees={employees}
                        onEdit={(emp) => {
                            console.log('Editing employee:', emp);
                            openEmployeeModal('edit', emp);
                        }}
                        onDelete={(empId) => {
                            console.log('Deleting employee:', empId);
                            const emp = employees.find(e => e._id === empId);
                            handleDeleteClick(empId, emp?.user_id?.fullName);
                        }}
                        onPaySalary={(emp) => {
                            console.log('Paying salary for employee:', emp);
                            openSalaryModal(emp);
                        }}
                        onViewSalaryHistory={(emp) => {
                            console.log('Viewing salary history for employee:', emp);
                            openSalaryHistoryModal(emp);
                        }}
                    />
                </>
            )}
            {!isLoading && employees.length === 0 && !error && (
                 <div className={styles.noResultsContainer}><p className={styles.noResults}>Không có nhân viên nào.</p></div>
            )}

            {!isLoading && totalPages > 0 && employees.length > 0 && (
                <Pagination
                    currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange}
                    itemsPerPage={itemsPerPage} totalItems={totalEmployees}
                />
            )}

            <EmployeeModal
                isOpen={isEmployeeModalOpen}
                onClose={closeEmployeeModal}
                onSubmit={handleSubmitEmployee}
                currentEmployee={currentEmployee}
                mode={employeeModalMode}
                // storeOptions={storeOptions} // Truyền storeOptions nếu modal cần (ví dụ admin chọn store cho NV)
            />
            {currentEmployee && isSalaryModalOpen && (
                <SalaryPaymentModal
                    isOpen={isSalaryModalOpen}
                    onClose={() => setIsSalaryModalOpen(false)}
                    employee={currentEmployee} // currentEmployee đã được set khi mở modal
                    onProcessPayment={handleProcessSalary}
                />
            )}
            {currentEmployee && isSalaryHistoryModalOpen && (
                <SalaryHistoryModal
                    isOpen={isSalaryHistoryModalOpen}
                    onClose={() => setIsSalaryHistoryModalOpen(false)}
                    employee={currentEmployee}
                    salaryHistory={salaryHistory}
                    // Props cho pagination của lịch sử lương nếu có
                />
            )}
            <ConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Xác nhận xóa Nhân Viên"
                message={`Bạn có chắc chắn muốn xóa nhân viên "${itemToDelete.name}" không?`}
            />

            <Modal
                title={editingId ? 'Sửa Nhân Viên' : 'Thêm Nhân Viên'}
                open={modalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="name"
                        label="Tên"
                        rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email!' },
                            { type: 'email', message: 'Email không hợp lệ!' }
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="role"
                        label="Vai trò"
                        rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
                    >
                        <AntSelect>
                            <Option value="manager">Quản lý</Option>
                            <Option value="staff">Nhân viên</Option>
                        </AntSelect>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default EmployeeManagementPage;