// src/components/Orders/OrderFormModal.js
import React, { useState, useEffect, useMemo } from 'react';
import Select from 'react-select'; // Dùng cho chọn khách hàng, tìm sản phẩm
import styles from './OrderFormModal.module.css';
import { FaTrash, FaPlus, FaMinus } from 'react-icons/fa';

// Dữ liệu mẫu (sẽ được thay bằng API calls hoặc props)
const sampleCustomers = [
    { value: 'CUS001', label: 'Nguyễn Văn An - 0901234567' },
    { value: 'CUS002', label: 'Trần Thị Bình - 0912345678' },
];
// sampleProducts sẽ kết hợp sách và văn phòng phẩm
const sampleProducts = [
    { id: 'B001', name: 'Sách ReactJS Toàn Tập', type: 'book', price: 220000, stock: 50 },
    { id: 'B002', name: 'Lập Trình Với Node.js', type: 'book', price: 150000, stock: 30 },
    { id: 'S001', name: 'Bút bi Thiên Long', type: 'stationery', price: 5000, stock: 1000 },
    { id: 'S002', name: 'Vở kẻ ngang Campus', type: 'stationery', price: 12000, stock: 500 },
];


const OrderFormModal = ({ isOpen, onClose, onSubmit, currentOrder, mode }) => {
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [orderItems, setOrderItems] = useState([]); // [{product: {id, name, price, type, stock}, quantity: 1, subtotal: price}]
    const [productSearchTerm, setProductSearchTerm] = useState('');
    const [discount, setDiscount] = useState(0); // Theo % hoặc giá trị cố định
    const [taxRate, setTaxRate] = useState(10); // Giả sử thuế 10%

    useEffect(() => {
        if (isOpen && currentOrder && mode === 'edit') {
            // Tìm khách hàng tương ứng từ sampleCustomers (trong thực tế, currentOrder.customer sẽ là object)
            setSelectedCustomer(sampleCustomers.find(c => c.value === currentOrder.customer_id) || null);
            // Map order_items từ API sang định dạng của orderItems state
            const items = currentOrder.items?.map(apiItem => {
                const product = sampleProducts.find(p => p.id === apiItem.product_id && p.type === apiItem.product_type);
                return product ? { product, quantity: apiItem.quantity, subtotal: product.price * apiItem.quantity } : null;
            }).filter(Boolean) || [];
            setOrderItems(items);
            setDiscount(currentOrder.discount || 0);
            setTaxRate(currentOrder.tax_rate || 10);
        } else if (isOpen && mode === 'add') {
            setSelectedCustomer(null);
            setOrderItems([]);
            setProductSearchTerm('');
            setDiscount(0);
            setTaxRate(10);
        }
    }, [isOpen, currentOrder, mode]);

    const handleProductSearch = (inputValue) => {
        // Logic tìm kiếm sản phẩm (có thể gọi API nếu danh sách lớn)
        // Hiện tại chỉ filter từ sampleProducts
        return sampleProducts.filter(p =>
            p.name.toLowerCase().includes(inputValue.toLowerCase())
        ).map(p => ({ value: p.id, label: `${p.name} (${p.price.toLocaleString()} VNĐ) - Tồn: ${p.stock}`, product: p }));
    };

    const handleAddProduct = (selectedOption) => {
        if (!selectedOption || !selectedOption.product) return;
        const product = selectedOption.product;
        const existingItemIndex = orderItems.findIndex(item => item.product.id === product.id && item.product.type === product.type);

        if (existingItemIndex > -1) {
            // Tăng số lượng nếu sản phẩm đã có và còn tồn kho
            const updatedItems = [...orderItems];
            if (updatedItems[existingItemIndex].quantity < product.stock) {
                updatedItems[existingItemIndex].quantity += 1;
                updatedItems[existingItemIndex].subtotal = product.price * updatedItems[existingItemIndex].quantity;
                setOrderItems(updatedItems);
            } else {
                alert(`Số lượng tồn kho của "${product.name}" không đủ!`);
            }
        } else {
            // Thêm sản phẩm mới nếu còn tồn kho
            if (product.stock > 0) {
                setOrderItems([...orderItems, { product, quantity: 1, subtotal: product.price }]);
            } else {
                alert(`"${product.name}" đã hết hàng!`);
            }
        }
        setProductSearchTerm(''); // Reset ô tìm kiếm
    };

    const handleQuantityChange = (index, newQuantity) => {
        const updatedItems = [...orderItems];
        const item = updatedItems[index];
        const product = item.product;
        const quantity = parseInt(newQuantity, 10);

        if (quantity > 0 && quantity <= product.stock) {
            item.quantity = quantity;
            item.subtotal = product.price * quantity;
            setOrderItems(updatedItems);
        } else if (quantity > product.stock) {
            alert(`Số lượng tồn kho của "${product.name}" không đủ (còn ${product.stock})!`);
            // Giữ lại số lượng tối đa có thể
            item.quantity = product.stock;
            item.subtotal = product.price * product.stock;
            setOrderItems(updatedItems);
        }
    };

    const handleRemoveItem = (index) => {
        setOrderItems(orderItems.filter((_, i) => i !== index));
    };

    const subtotalAmount = useMemo(() => {
        return orderItems.reduce((sum, item) => sum + item.subtotal, 0);
    }, [orderItems]);

    const discountAmount = useMemo(() => {
        // Giả sử discount là %
        return (subtotalAmount * discount) / 100;
    }, [subtotalAmount, discount]);

    const amountAfterDiscount = subtotalAmount - discountAmount;

    const taxAmount = useMemo(() => {
        return (amountAfterDiscount * taxRate) / 100;
    }, [amountAfterDiscount, taxRate]);

    const totalAmount = amountAfterDiscount + taxAmount;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedCustomer) {
            alert("Vui lòng chọn khách hàng!");
            return;
        }
        if (orderItems.length === 0) {
            alert("Vui lòng thêm ít nhất một sản phẩm vào đơn hàng!");
            return;
        }

        const orderData = {
            customer_id: selectedCustomer.value,
            items: orderItems.map(item => ({
                product_id: item.product.id,
                product_type: item.product.type, // 'book' or 'stationery'
                quantity: item.quantity,
                unit_price: item.product.price,
            })),
            subtotal_amount: subtotalAmount,
            discount_percentage: parseFloat(discount), // Gửi % nếu backend cần
            discount_amount: discountAmount,
            tax_rate_percentage: parseFloat(taxRate), // Gửi %
            tax_amount: taxAmount,
            total_amount: totalAmount,
            order_date: new Date().toISOString(), // Ngày hiện tại
            status: 'pending', // Trạng thái ban đầu
        };
        if (mode === 'edit' && currentOrder) {
            orderData.id = currentOrder.id; // Thêm id cho đơn hàng sửa
        }
        onSubmit(orderData);
    };


    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h3 className={styles.title}>{mode === 'add' ? 'Tạo Đơn Hàng Mới' : 'Chỉnh Sửa Đơn Hàng'}</h3>
                <form onSubmit={handleSubmit} className={styles.orderForm}>
                    <div className={styles.formSection}>
                        <h4>Thông tin Khách hàng</h4>
                        <Select
                            options={sampleCustomers}
                            value={selectedCustomer}
                            onChange={setSelectedCustomer}
                            placeholder="Chọn hoặc tìm khách hàng..."
                            isClearable
                            classNamePrefix="react-select"
                            className={`${styles.customerSelect} react-select-container`}
                        />
                    </div>

                    <div className={styles.formSection}>
                        <h4>Thêm Sản phẩm</h4>
                        <Select
                            options={sampleProducts.filter(p => p.name.toLowerCase().includes(productSearchTerm.toLowerCase())) // Chỉ filter khi gõ
                                .map(p => ({ value: p.id, label: `${p.name} (${p.price.toLocaleString()} VNĐ) - Tồn: ${p.stock}`, product: p }))
                            }
                            onInputChange={(value) => setProductSearchTerm(value)}
                            inputValue={productSearchTerm}
                            onChange={handleAddProduct}
                            placeholder="Tìm sản phẩm (sách, văn phòng phẩm)..."
                            classNamePrefix="react-select"
                            className={`${styles.productSelect} react-select-container`}
                            value={null} // Reset select sau khi chọn
                        />
                    </div>

                    {orderItems.length > 0 && (
                        <div className={styles.formSection}>
                            <h4>Chi tiết Đơn hàng</h4>
                            <div className={styles.orderItemsTableContainer}>
                                <table className={styles.orderItemsTable}>
                                    <thead>
                                        <tr>
                                            <th>Sản phẩm</th>
                                            <th>Đơn giá</th>
                                            <th className={styles.quantityHeader}>Số lượng</th>
                                            <th>Thành tiền</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orderItems.map((item, index) => (
                                            <tr key={`${item.product.id}-${item.product.type}-${index}`}>
                                                <td>{item.product.name}</td>
                                                <td className={styles.priceCell}>{item.product.price.toLocaleString()}</td>
                                                <td className={styles.quantityCell}>
                                                    <button type="button" onClick={() => handleQuantityChange(index, item.quantity - 1)} disabled={item.quantity <= 1} className={styles.quantityBtn}><FaMinus/></button>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max={item.product.stock}
                                                        value={item.quantity}
                                                        onChange={(e) => handleQuantityChange(index, e.target.value)}
                                                        className={styles.quantityInput}
                                                    />
                                                    <button type="button" onClick={() => handleQuantityChange(index, item.quantity + 1)} disabled={item.quantity >= item.product.stock} className={styles.quantityBtn}><FaPlus/></button>
                                                </td>
                                                <td className={styles.priceCell}>{item.subtotal.toLocaleString()}</td>
                                                <td>
                                                    <button type="button" onClick={() => handleRemoveItem(index)} className={styles.removeItemBtn} title="Xóa sản phẩm"><FaTrash /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    <div className={`${styles.formSection} ${styles.summarySection}`}>
                        <h4>Tổng kết Đơn hàng</h4>
                        <div className={styles.summaryRow}><span>Tổng tiền hàng:</span> <span>{subtotalAmount.toLocaleString()} VNĐ</span></div>
                        <div className={styles.summaryRowInput}>
                            <label htmlFor="discount">Giảm giá (%):</label>
                            <input type="number" id="discount" value={discount} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} min="0" max="100" className={styles.summaryInput} />
                            <span>(-{discountAmount.toLocaleString()} VNĐ)</span>
                        </div>
                         <div className={styles.summaryRow}><span>Sau giảm giá:</span> <span>{amountAfterDiscount.toLocaleString()} VNĐ</span></div>
                        <div className={styles.summaryRowInput}>
                            <label htmlFor="taxRate">Thuế VAT (%):</label>
                             <input type="number" id="taxRate" value={taxRate} onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)} min="0" className={styles.summaryInput} />
                            <span>(+{taxAmount.toLocaleString()} VNĐ)</span>
                        </div>
                        <hr className={styles.summaryDivider}/>
                        <div className={`${styles.summaryRow} ${styles.totalRow}`}><span>Thành tiền:</span> <span>{totalAmount.toLocaleString()} VNĐ</span></div>
                    </div>


                    <div className={styles.actions}>
                        <button type="submit" className={`${styles.btn} ${styles.btnSubmit}`}>
                            {mode === 'add' ? 'Tạo Đơn Hàng' : 'Cập Nhật Đơn Hàng'}
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

export default OrderFormModal;