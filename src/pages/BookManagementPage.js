// src/pages/BookManagementPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import styles from './BookManagementPage.module.css';
import Pagination from '../components/Common/Pagination';
import BookModal from '../components/Books/BookModal';
import ConfirmModal from '../components/Books/ConfirmModal';
import BookDetailsView from '../components/Books/BookDetailsView';
import bookService from '../services/bookService';
import { FaPlus, FaSearch, FaFilter, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { 
  Table, Button, Input, Space, Modal, Form,
  message, Popconfirm, Tag, Tooltip,
  Card, Row, Col, Statistic, Typography, Divider, Upload, Select
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, BookOutlined,
  ShoppingCartOutlined, DollarOutlined, TagsOutlined, SearchOutlined, LoadingOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;
const { Option } = Select;

// Thêm custom hook debounce
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

const BookManagementPage = () => {
    const { storeId } = useParams();
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    // Cập nhật state filters
    const [filters, setFilters] = useState({
        searchTerm: searchParams.get('searchTerm') || '',
        category: searchParams.get('category') ? {
            value: searchParams.get('category'),
            label: ''
        } : null,
        supplier: searchParams.get('supplier') ? {
            value: searchParams.get('supplier'),
            label: ''
        } : null,
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        minStock: searchParams.get('minStock') || '',
        sortBy: searchParams.get('sortBy') || 'created_at',
        sortOrder: searchParams.get('sortOrder') || 'desc'
    });

    // Áp dụng debounce cho filters
    const debouncedFilters = useDebounce(filters, 500);

    // State cho advanced filters
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    const [books, setBooks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalBooks, setTotalBooks] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(parseInt(searchParams.get('limit')) || 10);

    const [sortField, setSortField] = useState(searchParams.get('sortBy') || 'created_at');
    const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'desc');

    const [searchTerm, setSearchTerm] = useState(searchParams.get('searchTerm') || '');
    const [filterCategories, setFilterCategories] = useState([]);
    const [filterSupplier, setFilterSupplier] = useState(null);
    const [filterMinPrice, setFilterMinPrice] = useState(searchParams.get('minPrice') || '');
    const [filterMaxPrice, setFilterMaxPrice] = useState(searchParams.get('maxPrice') || '');
    const [filterMinStock, setFilterMinStock] = useState(searchParams.get('minStock') || '');

    const [categoryDropdownOptions, setCategoryDropdownOptions] = useState([]);
    const [supplierDropdownOptions, setSupplierDropdownOptions] = useState([]);
    const [publisherDropdownOptions, setPublisherDropdownOptions] = useState([]);

    const [isBookModalOpen, setIsBookModalOpen] = useState(false);
    const [bookModalMode, setBookModalMode] = useState('create');
    const [currentBookData, setCurrentBookData] = useState(null);
    const [selectedBookForDetails, setSelectedBookForDetails] = useState(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [bookIdToDelete, setBookIdToDelete] = useState(null);

    const [statistics, setStatistics] = useState({
        totalBooks: 0,
        totalValue: 0,
        lowStock: 0
    });

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [form] = Form.useForm();
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [publishers, setPublishers] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [imageFile, setImageFile] = useState(null);

    const fetchBooks = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const params = {
                page: currentPage,
                limit: itemsPerPage,
                sortBy: debouncedFilters.sortBy,
                sortOrder: debouncedFilters.sortOrder,
            };

            // Thêm các filter nếu có
            if (debouncedFilters.searchTerm) {
                params.searchTerm = debouncedFilters.searchTerm;
            }
            if (debouncedFilters.category?.value) {
                params.category = debouncedFilters.category.value;
            }
            if (debouncedFilters.supplier?.value) {
                params.supplier = debouncedFilters.supplier.value;
            }
            if (debouncedFilters.minPrice) {
                params.minPrice = debouncedFilters.minPrice;
            }
            if (debouncedFilters.maxPrice) {
                params.maxPrice = debouncedFilters.maxPrice;
            }
            if (debouncedFilters.minStock) {
                params.minStock = debouncedFilters.minStock;
            }

            // Cập nhật URL với các tham số tìm kiếm
            const newSearchParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    newSearchParams.set(key, value.toString());
                }
            });
            setSearchParams(newSearchParams, { replace: true });

            // Gọi API với các tham số đã được lọc
            const data = await bookService.getAllBooks(storeId, params);
            setBooks(data.books);
            setTotalPages(data.totalPages);
            setTotalBooks(data.totalBooks);
            calculateStatistics(data.books);
        } catch (err) {
            console.error("Error fetching books:", err);
            setError(err.message || "Không thể tải danh sách sách.");
            setBooks([]);
            setTotalPages(0);
            setTotalBooks(0);
            setStatistics({ totalBooks: 0, totalValue: 0, lowStock: 0 });
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, itemsPerPage, debouncedFilters, storeId, setSearchParams]);

    // Thêm effect để theo dõi thay đổi của debouncedFilters
    useEffect(() => {
        if (currentPage === 1) {
            fetchBooks();
        } else {
            setCurrentPage(1);
        }
    }, [debouncedFilters, currentPage, fetchBooks]);

    useEffect(() => {
        const fetchAllDropdownData = async () => {
            if (!storeId) return;
            try {
                const [categoriesRes, suppliersRes, publishersRes] = await Promise.all([
                    bookService.getCategoriesForForm(storeId),
                    bookService.getSuppliersForForm(storeId),
                    bookService.getPublishersForForm(storeId),
                ]);

                console.log('Categories Response:', categoriesRes);
                console.log('Suppliers Response:', suppliersRes);
                console.log('Publishers Response:', publishersRes);

                const transformData = (data) => {
                    if (Array.isArray(data) && data.every(item => 'value' in item && 'label' in item)) {
                        return data;
                    }
                    if (data?.data && Array.isArray(data.data) && data.data.every(item => '_id' in item && 'name' in item)) {
                        return data.data.map(item => ({
                            value: item._id,
                            label: item.name
                        }));
                    }
                    if (Array.isArray(data) && data.every(item => '_id' in item && 'name' in item)) {
                        return data.map(item => ({
                            value: item._id,
                            label: item.name
                        }));
                    }
                    console.warn('Unexpected data format for dropdown:', data);
                    return [];
                };

                const categories = transformData(categoriesRes);
                const suppliers = transformData(suppliersRes);
                const publishers = transformData(publishersRes);

                console.log('Transformed Categories:', categories);
                console.log('Transformed Suppliers:', suppliers);
                console.log('Transformed Publishers:', publishers);

                setCategoryDropdownOptions(categories);
                setSupplierDropdownOptions(suppliers);
                setPublisherDropdownOptions(publishers);

                const categoryValuesFromUrl = searchParams.getAll('category');
                if (categoryValuesFromUrl.length > 0 && categories.length > 0) {
                    const selectedCats = categories.filter(opt => categoryValuesFromUrl.includes(opt.value.toString()));
                    if(selectedCats.length > 0) setFilterCategories(selectedCats);
                }

                const supplierValueFromUrl = searchParams.get('supplier');
                if (supplierValueFromUrl && suppliers.length > 0) {
                    const selectedSupplier = suppliers.find(opt => opt.value.toString() === supplierValueFromUrl) || null;
                    if(selectedSupplier) setFilterSupplier(selectedSupplier);
                }
            } catch (err) {
                console.error("Lỗi khi tải dữ liệu dropdown:", err);
                message.error("Không thể tải dữ liệu cho bộ lọc và form.");
                setCategoryDropdownOptions([]);
                setSupplierDropdownOptions([]);
                setPublisherDropdownOptions([]);
            }
        };
        fetchAllDropdownData();
    }, [storeId, searchParams]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const openBookModal = (mode, book = null) => {
        setBookModalMode(mode);
        if (mode === 'edit' && book) {
            const initialFormData = {
                category_id: book.categories?.[0]?.value || book.categories?.[0]?._id || undefined,
                publisher_id: book.publisher_id?.value || book.publisher_id?._id || book.publisher_id || undefined,
                supplier_id: book.supplier_id?.value || book.supplier_id?._id || book.supplier_id || undefined,
                imagePreview: book.image || null,
                image: book.image ? [{ uid: '-1', name: 'existing_image.png', status: 'done', url: book.image }] : [],
                title: book.title || '',
                author: book.author || '',
                description: book.description || '',
                stock_quantity: book.stock_quantity || 0,
                price: book.price || 0,
            };
            form.setFieldsValue(initialFormData);
            setSelectedBook(book);
        } else {
            form.resetFields();
            setSelectedBook(null);
            form.setFieldsValue({
                stock_quantity: 0,
                price: 0,
                image: [],
                imagePreview: null,
            });
        }
        setModalVisible(true);
    };

    const closeBookModal = () => {
        setIsBookModalOpen(false);
        setCurrentBookData(null);
    };

    const handleImageUpload = (info) => {
        console.log('Upload event:', info);
        
        if (info.file.status === 'uploading') {
            setLoading(true);
            return;
        }
        
        const file = info.file.originFileObj;
        if (file) {
            try {
                const reader = new FileReader();
                reader.onload = () => {
                    setImageUrl(reader.result);
                    setImageFile(file);  // Lưu file gốc để submit
                    setLoading(false);
                };
                reader.onerror = () => {
                    console.error('Error reading file');
                    message.error('Có lỗi khi đọc file');
                    setLoading(false);
                };
                reader.readAsDataURL(file);
            } catch (error) {
                console.error('Error handling image:', error);
                message.error('Có lỗi khi xử lý hình ảnh');
                setLoading(false);
            }
        } else {
            setImageUrl('');
            setImageFile(null);
            setLoading(false);
        }
    };

    const handleSubmit = async (values) => {
        setIsLoading(true);
        try {
            let imageUrl = null;
            
            // Upload hình ảnh trước nếu có
            if (imageFile) {
                console.log('Uploading image file:', imageFile);
                const uploadResult = await bookService.uploadImage(storeId, imageFile);
                imageUrl = uploadResult.imageUrl;
                console.log('Image uploaded successfully:', imageUrl);
            }

            const formData = new FormData();
            
            // Thêm các trường thông tin cơ bản
            formData.append('title', values.title || '');
            formData.append('author', values.author || '');
            formData.append('description', values.description || '');
            formData.append('price', values.price || 0);
            formData.append('stock_quantity', values.stock_quantity || 0);
            
            // Thêm các trường ID
            if (values.category_id) {
                formData.append('categories[]', values.category_id);
            }
            if (values.publisher_id) {
                formData.append('publisher_id', values.publisher_id);
            }
            if (values.supplier_id) {
                formData.append('supplier_id', values.supplier_id);
            }
            
            // Thêm URL hình ảnh đã upload
            if (imageUrl) {
                formData.append('image', imageUrl);
            }

            let response;
            if (selectedBook) {
                response = await bookService.updateBook(storeId, selectedBook._id, formData);
                console.log('Update response:', response);
                message.success('Cập nhật sách thành công');
            } else {
                response = await bookService.createBook(storeId, formData);
                console.log('Create response:', response);
                message.success('Thêm sách mới thành công');
            }

            handleCancel();
            fetchBooks();
        } catch (error) {
            console.error('Lỗi khi lưu sách:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra';
            message.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteBookClick = (bookId) => {
        setBookIdToDelete(bookId);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmDeleteBook = async () => {
        setIsLoading(true);
        setError(null);
        setSuccess(null);
        try {
            await bookService.deleteBook(storeId, bookIdToDelete);
            setSuccess('Xóa sách thành công!');
            fetchBooks();
        } catch (error) {
            console.error('Lỗi khi xóa sách:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi xóa sách.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
            setIsConfirmModalOpen(false);
            setBookIdToDelete(null);
        }
    };

    const openEditBookModalFromDetails = (book) => {
        setSelectedBookForDetails(null); 
        setSelectedBook(book);
        const initialFormData = {
            category_id: book.categories?.[0]?.value || book.categories?.[0]?._id || undefined,
            publisher_id: book.publisher_id?.value || book.publisher_id?._id || book.publisher_id || undefined,
            supplier_id: book.supplier_id?.value || book.supplier_id?._id || book.supplier_id || undefined,
            imagePreview: book.image || null,
            image: book.image ? [{ uid: '-1', name: 'existing_image.png', status: 'done', url: book.image }] : [],
            title: book.title || '',
            author: book.author || '',
            description: book.description || '',
            stock_quantity: book.stock_quantity || 0,
            price: book.price || 0,
        };
        form.setFieldsValue(initialFormData);
        setModalVisible(true);
    };
    
    const handleSort = (field) => {
        const order = (sortField === field && sortOrder === 'asc') ? 'desc' : 'asc';
        setSortField(field);
        setSortOrder(order);
        setCurrentPage(1); 
    };

    const calculateStatistics = (bookList) => {
        const stats = {
            totalBooks: bookList.length,
            totalValue: bookList.reduce((sum, book) => sum + (book.price || 0) * (book.stock_quantity || 0), 0),
            lowStock: bookList.filter(book => (book.stock_quantity || 0) < 10).length
        };
        setStatistics(stats);
    };

    const handleDelete = async (id) => {
        setIsLoading(true);
        try {
            await bookService.deleteBook(storeId, id);
            message.success('Xóa sách thành công');
            fetchBooks();
        } catch (error) {
            console.error('Lỗi khi xóa sách:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi xóa sách';
            message.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (record) => {
        setSelectedBook(record);
        const initialFormData = {
            category_id: record.categories?.[0]?.value || record.categories?.[0]?._id || undefined,
            publisher_id: record.publisher_id?.value || record.publisher_id?._id || record.publisher_id || undefined,
            supplier_id: record.supplier_id?.value || record.supplier_id?._id || record.supplier_id || undefined,
            imagePreview: record.image || null,
            image: record.image ? [{ uid: '-1', name: 'existing_image.png', status: 'done', url: record.image }] : [],
            title: record.title || '',
            author: record.author || '',
            description: record.description || '',
            stock_quantity: record.stock_quantity || 0,
            price: record.price || 0,
        };
        form.setFieldsValue(initialFormData);
        setModalVisible(true);
    };

    const handleView = (record) => {
        setSelectedBookForDetails(record);
    };

    const handleCancel = () => {
        form.resetFields();
        setSelectedBook(null);
        setModalVisible(false);
        setImageUrl('');
        setImageFile(null);
    };

    const columns = [
        {
            title: 'Hình ảnh',
            dataIndex: 'image',
            key: 'image',
            width: 100,
            render: (image) => (
                <div className={styles.imageContainer}>
                    <img
                        src={image ? `${process.env.REACT_APP_API_URL}${image}` : 'https://via.placeholder.com/150x220.png?text=No+Image'}
                        alt="book cover"
                        className={styles.bookImage}
                       
                    />
                </div>
            ),
        },
        {
            title: 'Tên sách',
            dataIndex: 'title',
            key: 'title',
            width: 200,
            render: (text, record) => (
                <Tooltip title={text}>
                    <Text className={styles.bookTitle} onClick={() => handleView(record)}>
                        {text}
                    </Text>
                </Tooltip>
            ),
        },
        {
            title: 'Tác giả',
            dataIndex: 'author',
            key: 'author',
            width: 150,
            render: (text) => (
                <Tooltip title={text || 'N/A'}>
                    <div className={styles.authorCell}>{text || 'N/A'}</div>
                </Tooltip>
            )
        },
        {
            title: 'Danh mục',
            dataIndex: 'categories',
            key: 'categories',
            width: 150,
            render: (categories) => (
                <Space size={[0, 8]} wrap>
                    {categories?.map(category => (
                        <Tag key={category._id || category.value} color="blue">
                            {category.name || category.label}
                        </Tag>
                    ))}
                </Space>
            ),
        },
        {
            title: 'NXB',
            dataIndex: ['publisher_id', 'name'],
            key: 'publisher',
            width: 150,
            render: (name, record) => (
                <Tag color="purple">
                    {record.publisher_id?.name || record.publisher_id?.label || name || record.publisher_id || 'N/A'}
                </Tag>
            )
        },
        {
            title: 'NCC',
            dataIndex: ['supplier_id', 'name'],
            key: 'supplier',
            width: 150,
            render: (name, record) => (
                <Tag color="orange">
                    {record.supplier_id?.name || record.supplier_id?.label || name || record.supplier_id || 'N/A'}
                </Tag>
            )
        },
        {
            title: 'Tồn kho',
            dataIndex: 'stock_quantity',
            key: 'stock_quantity',
            width: 100,
            render: (quantity) => (
                <Tag color={quantity < 10 ? 'red' : quantity < 30 ? 'orange' : 'green'} className={styles.stockCell}>
                    {quantity}
                </Tag>
            ),
        },
        {
            title: 'Giá bán',
            dataIndex: 'price',
            key: 'price',
            width: 120,
            render: (price) => (
                <Text className={styles.priceCell}>
                    {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                    }).format(price)}
                </Text>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            fixed: 'right',
            width: 150,
            render: (_, record) => (
                <Space size="small" className={styles.actionsCell}>
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            className={`${styles.btnAction} ${styles.btnView}`}
                            onClick={() => handleView(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            className={`${styles.btnAction} ${styles.btnEdit}`}
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            className={`${styles.btnAction} ${styles.btnDelete}`}
                            onClick={() => handleDelete(record._id)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className={styles.container}>
            <Row gutter={[16, 16]} className={styles.statsRow}>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Tổng số sách"
                            value={statistics.totalBooks}
                            prefix={<BookOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Tổng giá trị"
                            value={statistics.totalValue}
                            prefix={<DollarOutlined />}
                            formatter={(value) => new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                            }).format(value)}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Sách sắp hết hàng"
                            value={statistics.lowStock}
                            prefix={<TagsOutlined />}
                            valueStyle={{ color: statistics.lowStock > 0 ? '#cf1322' : '#3f8600' }} 
                        />
                    </Card>
                </Col>
            </Row>

            <Divider />

            <Card>
                <div className={styles.tableHeader}>
                    
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Row gutter={[16, 16]} align="middle" justify="space-between">
                            <Col xs={24} sm={16} md={12} lg={8}>
                                <Input
                                    placeholder="Tìm kiếm theo tên sách, tác giả..."
                                    prefix={<SearchOutlined />}
                                    value={filters.searchTerm}
                                    onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                                    style={{ width: '100%' }}
                                />
                            </Col>
                            <Col xs={24} sm={8} md={12} lg={16} style={{ textAlign: 'right' }}>
                                <Space>
                                    <Button
                                        icon={showAdvancedFilters ? <FaChevronUp /> : <FaChevronDown />}
                                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                    >
                                        Bộ lọc nâng cao
                                    </Button>
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        onClick={() => {
                                            setSelectedBook(null);
                                            form.resetFields();
                                            form.setFieldsValue({
                                                stock_quantity: 0,
                                                price: 0,
                                                imagePreview: null,
                                                image: [],
                                            });
                                            setModalVisible(true);
                                        }}
                                    >
                                        Thêm sách mới
                                    </Button>
                                </Space>
                            </Col>
                        </Row>

                        {showAdvancedFilters && (
                            <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
                                <Col xs={24} sm={12} md={8} lg={6}>
                                    <Form.Item label="Danh mục">
                                        <Select
                                            placeholder="Chọn danh mục"
                                            value={filters.category}
                                            onChange={(value, option) => setFilters(prev => ({
                                                ...prev,
                                                category: option ? { value: option.value, label: option.label } : null
                                            }))}
                                            allowClear
                                            options={categoryDropdownOptions}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} md={8} lg={6}>
                                    <Form.Item label="Nhà cung cấp">
                                        <Select
                                            placeholder="Chọn nhà cung cấp"
                                            value={filters.supplier}
                                            onChange={(value, option) => setFilters(prev => ({
                                                ...prev,
                                                supplier: option ? { value: option.value, label: option.label } : null
                                            }))}
                                            allowClear
                                            options={supplierDropdownOptions}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} md={8} lg={6}>
                                    <Form.Item label="Giá">
                                        <Space>
                                            <Input
                                                placeholder="Từ"
                                                type="number"
                                                value={filters.minPrice}
                                                onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                                                style={{ width: '100px' }}
                                            />
                                            <Input
                                                placeholder="Đến"
                                                type="number"
                                                value={filters.maxPrice}
                                                onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                                                style={{ width: '100px' }}
                                            />
                                        </Space>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} md={8} lg={6}>
                                    <Form.Item label="Tồn kho tối thiểu">
                                        <Input
                                            placeholder="Nhập số lượng"
                                            type="number"
                                            value={filters.minStock}
                                            onChange={(e) => setFilters(prev => ({ ...prev, minStock: e.target.value }))}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        )}
                    </Space>
                </div>

                <Table
                    columns={columns}
                    dataSource={books.filter(book => 
                        (book.title?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
                        (book.author?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
                        (book._id?.toLowerCase() || '').includes(searchText.toLowerCase()) 
                    )}
                    rowKey="_id"
                    loading={isLoading}
                    scroll={{ x: 1200 }} 
                    pagination={{
                        current: currentPage,
                        pageSize: itemsPerPage,
                        total: totalBooks,
                        onChange: handlePageChange,
                        showSizeChanger: true,
                        onShowSizeChange: (current, size) => setItemsPerPage(size),
                        showTotal: (total) => `Tổng số ${total} sách`
                    }}
                />
            </Card>

            <Modal
                title={selectedBook ? 'Chỉnh sửa sách' : 'Thêm sách mới'}
                open={modalVisible}
                onCancel={handleCancel}
                footer={null}
                width={800}
                destroyOnClose={true}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        stock_quantity: 0,
                        price: 0,
                        category_id: selectedBook?.categories?.[0]?.value || selectedBook?.categories?.[0]?._id || undefined,
                        publisher_id: selectedBook?.publisher_id?.value || selectedBook?.publisher_id?._id || selectedBook?.publisher_id || undefined,
                        supplier_id: selectedBook?.supplier_id?.value || selectedBook?.supplier_id?._id || selectedBook?.supplier_id || undefined,
                        title: selectedBook?.title || '',
                        author: selectedBook?.author || '',
                        description: selectedBook?.description || '',
                        stock_quantity: selectedBook?.stock_quantity || 0,
                        price: selectedBook?.price || 0,
                    }}
                >
                    <Row gutter={16}>
                        <Col span={16}>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="title"
                                        label="Tên sách"
                                        rules={[{ required: true, message: 'Vui lòng nhập tên sách' }]} 
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="author"
                                        label="Tác giả"
                                        rules={[{ required: true, message: 'Vui lòng nhập tác giả' }]} 
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="category_id"
                                        label="Danh mục"
                                        rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]} 
                                    >
                                        <Select 
                                            placeholder="Chọn danh mục" 
                                            loading={isLoading}
                                            showSearch
                                            optionFilterProp="children"
                                            filterOption={(input, option) =>
                                                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                                            }
                                            options={categoryDropdownOptions}
                                        >
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="publisher_id"
                                        label="Nhà xuất bản"
                                        rules={[{ required: true, message: 'Vui lòng chọn nhà xuất bản' }]} 
                                    >
                                        <Select 
                                            placeholder="Chọn nhà xuất bản" 
                                            loading={isLoading}
                                            showSearch
                                            optionFilterProp="children"
                                            filterOption={(input, option) =>
                                                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                                            }
                                            options={publisherDropdownOptions}
                                        >
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="supplier_id"
                                        label="Nhà cung cấp"
                                    >
                                        <Select 
                                            placeholder="Chọn nhà cung cấp" 
                                            loading={isLoading}
                                            showSearch
                                            optionFilterProp="children"
                                            filterOption={(input, option) =>
                                                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                                            }
                                            options={supplierDropdownOptions}
                                        >
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="stock_quantity"
                                        label="Số lượng"
                                        rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]} 
                                    >
                                        <Input type="number" min={0} />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="price"
                                        label="Giá bán"
                                        rules={[{ required: true, message: 'Vui lòng nhập giá bán' }]} 
                                    >
                                        <Input type="number" min={0} />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="description"
                                        label="Mô tả"
                                    >
                                        <Input.TextArea rows={4} />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label="Hình ảnh"
                                name="image"
                            >
                                <Upload
                                    name="image"
                                    listType="picture-card"
                                    className="avatar-uploader"
                                    showUploadList={false}
                                    customRequest={({ file, onSuccess }) => {
                                        setTimeout(() => {
                                            onSuccess("ok");
                                        }, 0);
                                    }}
                                    beforeUpload={(file) => {
                                        const isImage = file.type.startsWith('image/');
                                        if (!isImage) {
                                            message.error('Bạn chỉ có thể tải lên file hình ảnh!');
                                            return false;
                                        }
                                        const isLt2M = file.size / 1024 / 1024 < 2;
                                        if (!isLt2M) {
                                            message.error('Hình ảnh phải nhỏ hơn 2MB!');
                                            return false;
                                        }
                                        return true;
                                    }}
                                    onChange={handleImageUpload}
                                    accept="image/*"
                                >
                                    {imageUrl ? (
                                        <img
                                            src={imageUrl}
                                            alt="avatar"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : selectedBook?.image ? (
                                        <img
                                            src={`${process.env.REACT_APP_API_URL}${selectedBook.image}`}
                                            alt="current"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div>
                                            {loading ? <LoadingOutlined /> : <PlusOutlined />}
                                            <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                                        </div>
                                    )}
                                </Upload>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit" loading={isLoading} disabled={isLoading}>
                                {selectedBook ? 'Cập nhật' : 'Thêm mới'}
                            </Button>
                            <Button onClick={handleCancel} disabled={isLoading}>Hủy</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {selectedBookForDetails && (
                <BookDetailsView
                    book={selectedBookForDetails}
                    onClose={() => setSelectedBookForDetails(null)}
                    onEdit={openEditBookModalFromDetails}
                />
            )}

            {isConfirmModalOpen && (
                <ConfirmModal
                    isOpen={isConfirmModalOpen}
                    onClose={() => setIsConfirmModalOpen(false)}
                    onConfirm={handleConfirmDeleteBook}
                    title="Xác nhận xóa Sách"
                    message={`Bạn có chắc chắn muốn xóa sách "${books.find(b => b._id === bookIdToDelete)?.title || bookIdToDelete}" không?`}
                    isLoading={isLoading}
                />
            )}
        </div>
    );
};

export default BookManagementPage;