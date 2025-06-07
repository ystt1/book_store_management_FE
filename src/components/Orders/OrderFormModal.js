// src/components/Orders/OrderFormModal.js
import React, { useState, useEffect, useMemo } from 'react';
import Select from 'react-select'; // Dùng cho chọn khách hàng, tìm sản phẩm
import styles from './OrderFormModal.module.css';
import { FaTrash, FaPlus, FaMinus } from 'react-icons/fa';
import { Modal, Form, Input, InputNumber, Button, Space, Row, Col, Table, Tag, Typography } from 'antd';
import { message } from 'antd';

const { Text } = Typography;

// Dữ liệu mẫu (sẽ được thay bằng API calls hoặc props)


const OrderFormModal = ({
    isOpen,
    onClose,
    onSubmit,
    currentOrder,
    mode,
    customerOptions,
    onCustomerSearch,
    isLoadingCustomers,
    sampleProducts
}) => {
    const [form] = Form.useForm();
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [orderItems, setOrderItems] = useState([]); // [{product: {id, name, price, type, stock}, quantity: 1, subtotal: price}]
    const [productSearchTerm, setProductSearchTerm] = useState('');
    const [discount, setDiscount] = useState(0); // Theo % hoặc giá trị cố định
    const [taxRate, setTaxRate] = useState(10); // Giả sử thuế 10%
    console.log("sampleProducts",sampleProducts);
    
    useEffect(() => {
        if (isOpen && currentOrder && mode === 'edit') {
            // Tìm khách hàng tương ứng từ sampleCustomers (trong thực tế, currentOrder.customer sẽ là object)
            setSelectedCustomer(customerOptions.find(c => c.value === currentOrder.customer_id) || null);
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
        console.log("selectedOption",selectedOption);
        if (!selectedOption) return;
        
        const product = {
            id: selectedOption.value,
            type: selectedOption.type,
            name: selectedOption.name,
            price: selectedOption.price,
            stock: selectedOption.stock
        };
        
        const existingItemIndex = orderItems.findIndex(item => 
            item.product.id === product.id && 
            item.product.type === product.type
        );

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
                setOrderItems([...orderItems, { 
                    product, 
                    quantity: 1, 
                    subtotal: product.price 
                }]);
            } else {
                alert(`"${product.name}" đã hết hàng!`);
            }
        }
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

    const handleSubmit = (formValues) => {
        console.log("formValues",orderItems);
        if (orderItems.length === 0) {
            message.error("Vui lòng thêm ít nhất một sản phẩm vào đơn hàng!");
            return;
        }
        console.log("selectedCustomer",selectedCustomer);

        // Xây dựng payload (orderData) đúng chuẩn với backend schema
        const orderData = {
            // Thông tin khách hàng
            customer_id: selectedCustomer ? selectedCustomer.value : null,
            customer_name: selectedCustomer ? selectedCustomer.label : "Khách lẻ",
            customer_phone: selectedCustomer ? selectedCustomer.customer.phone : "N/A",
            customer_email: selectedCustomer ? selectedCustomer.customer.email : "",
            customer_address: selectedCustomer ? selectedCustomer.customer.address : "N/A",
            
            // Map items từ orderItems sang đúng cấu trúc backend yêu cầu
            items: orderItems.map(item => ({
                product_id: item.product.id,       // ID sản phẩm
                product_type: item.product.type,   // Loại sản phẩm
                price: item.product.price,         // Giá gốc
                product_name: item.product.name,   // Tên sản phẩm
                quantity: item.quantity            // Số lượng
            })),

            // Thông tin tài chính
            total_amount: totalAmount,
            subtotal_amount: subtotalAmount,
            discount_amount: discountAmount,
            tax_amount: taxAmount,
            discount_percentage: parseFloat(discount),
            tax_rate_percentage: parseFloat(taxRate),
            
            // Thông tin trạng thái
            status: 'pending',
            payment_method: 'cash',
            payment_status: 'pending',
            order_date: new Date().toISOString(),

            notes: formValues.notes || ''
        };
        
        // Thêm ID nếu là mode edit
        if (mode === 'edit' && currentOrder) {
            orderData.id = currentOrder._id;
        }

        console.log('Dữ liệu đơn hàng gửi đi:', orderData)
        
        onSubmit(orderData);
    };

    const columns = [
        {
            title: 'Sản phẩm',
            dataIndex: ['product', 'name'],
            key: 'name',
            width: '30%',
        },
        {
            title: 'Đơn giá',
            dataIndex: ['product', 'price'],
            key: 'price',
            width: '20%',
            render: (price) => (
                <Text>{price.toLocaleString()} VNĐ</Text>
            ),
        },
        {
            title: 'Số lượng',
            key: 'quantity',
            width: '25%',
            render: (_, record, index) => (
                <Space>
                    <Button 
                        icon={<FaMinus/>} 
                        onClick={() => handleQuantityChange(index, record.quantity - 1)}
                        disabled={record.quantity <= 1}
                        size="small"
                    />
                    <InputNumber
                        min={1}
                        max={record.product.stock}
                        value={record.quantity}
                        onChange={(value) => handleQuantityChange(index, value)}
                        style={{ width: 60 }}
                    />
                    <Button 
                        icon={<FaPlus/>} 
                        onClick={() => handleQuantityChange(index, record.quantity + 1)}
                        disabled={record.quantity >= record.product.stock}
                        size="small"
                    />
                </Space>
            ),
        },
        {
            title: 'Thành tiền',
            dataIndex: 'subtotal',
            key: 'subtotal',
            width: '15%',
            render: (subtotal) => (
                <Text strong>{subtotal.toLocaleString()} VNĐ</Text>
            ),
        },
        {
            title: '',
            key: 'action',
            width: '10%',
            render: (_, record, index) => (
                <Button
                    type="text"
                    danger
                    icon={<FaTrash />}
                    onClick={() => handleRemoveItem(index)}
                />
            ),
        },
    ];

    if (!isOpen) return null;

    return (
        <Modal
            title={mode === 'edit' ? 'Sửa đơn hàng' : 'Tạo đơn hàng mới'}
            open={isOpen}
            onCancel={onClose}
            footer={null}
            width={800}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={currentOrder}
            >
                <Form.Item
                    name="customer_id"
                    label="Khách hàng"
                    rules={[{ required: true, message: 'Vui lòng chọn khách hàng' }]}
                >
                    <Select
                        showSearch
                        onChange={(value) => {
                           
                            setSelectedCustomer(customerOptions.find(c => c.value === value.value) || null);
                            
                        }}
                        placeholder="Tìm kiếm khách hàng"
                        filterOption={false}
                        onSearch={onCustomerSearch}
                        loading={isLoadingCustomers}
                        options={customerOptions}
                        notFoundContent={isLoadingCustomers ? 'Đang tìm kiếm...' : 'Không tìm thấy khách hàng'}
                    />
                </Form.Item>

                <Form.Item label="Thêm sản phẩm">
                    <Select
                        options={sampleProducts}
                        value={null}
                        onChange={handleAddProduct}
                        placeholder="Tìm sản phẩm (sách, văn phòng phẩm)..."
                        classNamePrefix="react-select"
                        isSearchable={true}
                        isClearable={true}
                    />
                </Form.Item>

                {orderItems.length > 0 && (
                    <>
                        <Table
                            columns={columns}
                            dataSource={orderItems}
                            pagination={false}
                            rowKey={(record, index) => `${record.product.id}-${record.product.type}-${index}`}
                        />

                        <Row gutter={16} style={{ marginTop: 24 }}>
                            <Col span={12}>
                                <Form.Item label="Giảm giá (%)">
                                    <InputNumber
                                        value={discount}
                                        onChange={(value) => setDiscount(parseFloat(value) || 0)}
                                        min={0}
                                        max={100}
                                        style={{ width: '100%' }}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Thuế VAT (%)">
                                    <InputNumber
                                        value={taxRate}
                                        onChange={(value) => setTaxRate(parseFloat(value) || 0)}
                                        min={0}
                                        style={{ width: '100%' }}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row justify="end" style={{ marginTop: 24 }}>
                            <Col>
                                <Space direction="vertical" align="end">
                                    <Text>Tổng tiền hàng: {subtotalAmount.toLocaleString()} VNĐ</Text>
                                    <Text>Giảm giá: -{discountAmount.toLocaleString()} VNĐ</Text>
                                    <Text>Sau giảm giá: {amountAfterDiscount.toLocaleString()} VNĐ</Text>
                                    <Text>Thuế VAT: +{taxAmount.toLocaleString()} VNĐ</Text>
                                    <Text strong style={{ fontSize: '16px' }}>
                                        Thành tiền: {totalAmount.toLocaleString()} VNĐ
                                    </Text>
                                </Space>
                            </Col>
                        </Row>
                    </>
                )}

                <Form.Item>
                    <Space>
                        <Button type="primary" htmlType="submit">
                            {mode === 'edit' ? 'Cập nhật' : 'Tạo đơn hàng'}
                        </Button>
                        <Button onClick={onClose}>Hủy</Button>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default OrderFormModal;