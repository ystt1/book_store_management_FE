// src/components/ImportOrders/ImportOrderFormModal.js
import React, { useState, useEffect, useMemo } from 'react';
import Select from 'react-select';
import styles from './ImportOrderFormModal.module.css'; // Tạo file CSS mới
import { FaTrash, FaPlus, FaMinus } from 'react-icons/fa';

// Dữ liệu mẫu (sẽ được thay bằng API calls hoặc props)
// sampleSuppliers từ BookManagementPage hoặc fetch riêng
// sampleBooks (chỉ sách) từ BookManagementPage hoặc fetch riêng

const ImportOrderFormModal = ({
    isOpen,
    onClose,
    onSubmit,
    currentImportOrder,
    mode,
    sampleSuppliers = [],
    sampleBooks = [] // Chỉ sách
}) => {
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [importItems, setImportItems] = useState([]); // [{book: {id, name, current_price}, quantity: 1, import_price: 0, subtotal: 0}]
    const [bookSearchTerm, setBookSearchTerm] = useState('');
    const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (isOpen && currentImportOrder && mode === 'edit') {
            setSelectedSupplier(sampleSuppliers.find(s => s.value === currentImportOrder.supplier_id) || null);
            const items = currentImportOrder.items?.map(apiItem => {
                const book = sampleBooks.find(b => b.id === apiItem.book_id);
                return book ? {
                    book,
                    quantity: apiItem.quantity,
                    import_price: apiItem.unit_price, // Giá nhập
                    subtotal: apiItem.unit_price * apiItem.quantity
                } : null;
            }).filter(Boolean) || [];
            setImportItems(items);
            setExpectedDeliveryDate(currentImportOrder.expected_delivery_date ? currentImportOrder.expected_delivery_date.split('T')[0] : '');
            setNotes(currentImportOrder.notes || '');
        } else if (isOpen && mode === 'add') {
            setSelectedSupplier(null);
            setImportItems([]);
            setBookSearchTerm('');
            setExpectedDeliveryDate('');
            setNotes('');
        }
    }, [isOpen, currentImportOrder, mode, sampleSuppliers, sampleBooks]);

    const handleBookSearch = (inputValue) => {
        return sampleBooks.filter(b =>
            b.name.toLowerCase().includes(inputValue.toLowerCase())
        ).map(b => ({ value: b.id, label: `${b.name} (Giá hiện tại: ${b.price?.toLocaleString()})`, book: b }));
    };

    const handleAddBook = (selectedOption) => {
        if (!selectedOption || !selectedOption.book) return;
        const book = selectedOption.book;
        const existingItemIndex = importItems.findIndex(item => item.book.id === book.id);

        if (existingItemIndex > -1) {
            const updatedItems = [...importItems];
            updatedItems[existingItemIndex].quantity += 1;
            updatedItems[existingItemIndex].subtotal = updatedItems[existingItemIndex].import_price * updatedItems[existingItemIndex].quantity;
            setImportItems(updatedItems);
        } else {
            setImportItems([...importItems, { book, quantity: 1, import_price: book.price || 0, subtotal: book.price || 0 }]); // Lấy giá bán hiện tại làm giá nhập gợi ý
        }
        setBookSearchTerm('');
    };

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...importItems];
        const item = updatedItems[index];
        if (field === 'quantity') {
            item.quantity = Math.max(1, parseInt(value, 10) || 1); // Số lượng ít nhất là 1
        } else if (field === 'import_price') {
            item.import_price = parseFloat(value) || 0;
        }
        item.subtotal = item.import_price * item.quantity;
        setImportItems(updatedItems);
    };

    const handleRemoveItem = (index) => {
        setImportItems(importItems.filter((_, i) => i !== index));
    };

    const totalAmount = useMemo(() => {
        return importItems.reduce((sum, item) => sum + item.subtotal, 0);
    }, [importItems]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedSupplier) {
            alert("Vui lòng chọn nhà cung cấp!");
            return;
        }
        if (importItems.length === 0) {
            alert("Vui lòng thêm ít nhất một sách vào đơn nhập!");
            return;
        }

        const importOrderData = {
            supplier_id: selectedSupplier.value,
            items: importItems.map(item => ({
                book_id: item.book.id,
                quantity: item.quantity,
                unit_price: item.import_price, // Giá nhập
            })),
            total_amount: totalAmount,
            expected_delivery_date: expectedDeliveryDate || null,
            notes: notes,
            status: 'pending_approval', // Trạng thái ban đầu
            // created_by: currentUserId, // Lấy từ context hoặc Redux
            import_date: new Date().toISOString(), // Ngày tạo đơn
        };
        if (mode === 'edit' && currentImportOrder) {
            importOrderData.id = currentImportOrder.id;
        }
        onSubmit(importOrderData);
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h3 className={styles.title}>{mode === 'add' ? 'Tạo Đơn Nhập Hàng Mới' : 'Chỉnh Sửa Đơn Nhập Hàng'}</h3>
                <form onSubmit={handleSubmit} className={styles.importOrderForm}>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="supplier">Nhà Cung Cấp (*):</label>
                            <Select
                                id="supplier"
                                options={sampleSuppliers}
                                value={selectedSupplier}
                                onChange={setSelectedSupplier}
                                placeholder="Chọn nhà cung cấp..."
                                isClearable
                                classNamePrefix="react-select"
                                className="react-select-container" // Class chung
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="expectedDeliveryDate">Ngày dự kiến nhận:</label>
                            <input
                                type="date"
                                id="expectedDeliveryDate"
                                value={expectedDeliveryDate}
                                onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                                className={styles.inputField}
                            />
                        </div>
                    </div>


                    <div className={styles.formSection}>
                        <h4>Thêm Sách vào Đơn Nhập</h4>
                        <Select
                            options={sampleBooks.filter(b => b.name.toLowerCase().includes(bookSearchTerm.toLowerCase()))
                                .map(b => ({ value: b.id, label: `${b.name} (Giá hiện tại: ${b.price?.toLocaleString()})`, book: b }))
                            }
                            onInputChange={(value) => setBookSearchTerm(value)}
                            inputValue={bookSearchTerm}
                            onChange={handleAddBook}
                            placeholder="Tìm sách..."
                            classNamePrefix="react-select"
                            className="react-select-container"
                            value={null}
                        />
                    </div>

                    {importItems.length > 0 && (
                        <div className={styles.formSection}>
                            <h4>Chi tiết Sách Nhập</h4>
                            <div className={styles.importItemsTableContainer}>
                                <table className={styles.importItemsTable}>
                                    <thead>
                                        <tr>
                                            <th>Sách</th>
                                            <th className={styles.numberHeader}>Số lượng</th>
                                            <th className={styles.numberHeader}>Đơn giá nhập</th>
                                            <th className={styles.numberHeader}>Thành tiền</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {importItems.map((item, index) => (
                                            <tr key={item.book.id}>
                                                <td>{item.book.name}</td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                        className={styles.itemInput}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="1000"
                                                        value={item.import_price}
                                                        onChange={(e) => handleItemChange(index, 'import_price', e.target.value)}
                                                        className={styles.itemInput}
                                                    />
                                                </td>
                                                <td className={styles.priceCell}>{item.subtotal.toLocaleString()}</td>
                                                <td>
                                                    <button type="button" onClick={() => handleRemoveItem(index)} className={styles.removeItemBtn} title="Xóa sách"><FaTrash /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                     <div className={styles.formGroup}>
                        <label htmlFor="notes">Ghi chú:</label>
                        <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows="3" className={styles.textareaField} />
                    </div>


                    <div className={`${styles.formSection} ${styles.summarySection}`}>
                        <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                            <span>Tổng tiền đơn nhập:</span>
                            <span>{totalAmount.toLocaleString()} VNĐ</span>
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <button type="submit" className={`${styles.btn} ${styles.btnSubmit}`}>
                            {mode === 'add' ? 'Tạo Đơn Nhập' : 'Cập Nhật'}
                        </button>
                        <button type="button" onClick={onClose} className={`${styles.btn} ${styles.btnCancel}`}>
                            Hủy
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ImportOrderFormModal;