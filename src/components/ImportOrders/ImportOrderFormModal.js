// src/components/ImportOrders/ImportOrderFormModal.js
import React, { useState, useEffect, useMemo } from "react";
import Select from "react-select";
import styles from "./ImportOrderFormModal.module.css";
import { FaTrash } from "react-icons/fa"; // Giữ lại FaTrash, bỏ FaPlus, FaMinus nếu không dùng trực tiếp ở đây

const ImportOrderFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  currentImportOrder,
  mode,
  sampleSuppliers = [],
  sampleBooks = [], // Danh sách sách: [{ id, name, price (giá bán lẻ đề xuất) }]
  sampleStationery = [], // Danh sách VPP: [{ id, name, price (giá bán lẻ đề xuất) }]
}) => {
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  // items: [{ product: {id, name, type, original_price}, quantity: 1, import_price: 0, subtotal: 0 }]
  const [importItems, setImportItems] = useState([]);
  const [productSearchTerm, setProductSearchTerm] = useState(""); // State cho inputValue của Select tìm sản phẩm
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [notes, setNotes] = useState("");

  // Kết hợp sách và VPP vào một mảng để tìm kiếm, thêm trường 'type' và 'original_price'
  const allSearchableProducts = useMemo(() => {
    const booksWithType = sampleBooks.map((b) => ({
      ...b,
      id: b.id || b._id,
      type: "book",
      original_price: b.price,
    }));
    const stationeryWithType = sampleStationery.map((s) => ({
      ...s,
      id: s.id || s._id,
      type: "stationery",
      original_price: s.price,
    }));
    return [...booksWithType, ...stationeryWithType];
  }, [sampleBooks, sampleStationery]);

  useEffect(() => {
    if (isOpen) {
      if (currentImportOrder && mode === "edit") {
        console.log(currentImportOrder);
        setSelectedSupplier(currentImportOrder.supplier_id);
        const items =
          currentImportOrder.items
            ?.map((apiItem) => {
              
              // Tìm sản phẩm gốc từ allSearchableProducts để có đầy đủ thông tin
              const productDetails = allSearchableProducts.find(
                (p) =>
                  p.id === apiItem.product_id && p.type === apiItem.product_type
              );
             
              return productDetails
                ? {
                    product: productDetails, // product object này đã có id, name, type, original_price
                    quantity: apiItem.quantity,
                    import_price: apiItem.unit_price, // Giá nhập từ đơn hàng đã lưu
                    subtotal: apiItem.unit_price * apiItem.quantity,
                  }
                : null;
            })
            .filter(Boolean) || [];
        setImportItems(items);
        setExpectedDeliveryDate(
          currentImportOrder.expected_delivery_date
            ? currentImportOrder.expected_delivery_date.split("T")[0]
            : ""
        );
        setNotes(currentImportOrder.notes || "");
      } else {
        // Chế độ thêm mới
        setSelectedSupplier(null);
        setImportItems([]);
        setProductSearchTerm("");
        setExpectedDeliveryDate("");
        setNotes("");
      }
    }
  }, [
    isOpen,
    currentImportOrder,
    mode,
    sampleSuppliers,
    allSearchableProducts,
  ]); // allSearchableProducts là dependency

  const handleProductSearchOptions = (inputValue) => {
    if (!inputValue || inputValue.length < 1) {
      // Có thể cho tìm từ 1 ký tự
      // Trả về một phần danh sách ban đầu hoặc không có gì
      return allSearchableProducts.slice(0, 15).map((p) => ({
        // Giới hạn số lượng hiển thị ban đầu
        value: `${p.type}-${p.id}`,
        label: `${p.name} (${p.type === "book" ? "Sách" : "VPP"}) - Giá bán: ${
          p.original_price?.toLocaleString("vi-VN") || "N/A"
        }`,
        product: p,
      }));
    }
    return allSearchableProducts
      .filter((p) => p.name.toLowerCase().includes(inputValue.toLowerCase()))
      .map((p) => ({
        value: `${p.type}-${p.id}`, // Value unique để Select phân biệt
        label: `${p.name} (${p.type === "book" ? "Sách" : "VPP"}) - Giá bán: ${
          p.original_price?.toLocaleString("vi-VN") || "N/A"
        }`,
        product: p,
      }));
  };

  const handleAddProduct = (selectedOption) => {
    if (!selectedOption || !selectedOption.product) return;
    const productToAdd = selectedOption.product; // productToAdd đã có id, name, type, original_price

    const existingItemIndex = importItems.findIndex(
      (item) =>
        item.product.id === productToAdd.id &&
        item.product.type === productToAdd.type
    );

    if (existingItemIndex > -1) {
      // Sản phẩm đã có, tăng số lượng
      const updatedItems = [...importItems];
      updatedItems[existingItemIndex].quantity += 1;
      updatedItems[existingItemIndex].subtotal =
        updatedItems[existingItemIndex].import_price *
        updatedItems[existingItemIndex].quantity;
      setImportItems(updatedItems);
    } else {
      // Thêm sản phẩm mới
      setImportItems([
        ...importItems,
        {
          product: productToAdd,
          quantity: 1,
          import_price: productToAdd.original_price || 0, // Gợi ý giá nhập bằng giá bán lẻ
          subtotal: productToAdd.original_price || 0,
        },
      ]);
    }
    setProductSearchTerm(""); // Reset input của Select tìm kiếm sản phẩm
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...importItems];
    const item = updatedItems[index];
    if (field === "quantity") {
      item.quantity = Math.max(1, parseInt(value, 10) || 1);
    } else if (field === "import_price") {
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
      alert("Vui lòng thêm ít nhất một sản phẩm vào đơn nhập!");
      return;
    }

    const importOrderData = {

      supplier_id: selectedSupplier.value,
      items: importItems.map((item) => ({
        product_id: item.product.id, // ID của sách hoặc VPP
        product_type: item.product.type, // 'book' hoặc 'stationery'
        // product_name_cache không cần gửi, BE sẽ tự lấy khi tạo đơn
        quantity: item.quantity,
        unit_price: item.import_price,
        // Giá nhập
        // subtotal không cần gửi, BE sẽ tự tính toán khi lưu
      })),
      // total_amount không cần gửi, BE sẽ tự tính toán
      expected_delivery_date: expectedDeliveryDate || null,
      notes: notes,
      // status sẽ được BE đặt mặc định là 'pending_approval' khi tạo mới
    };

    if (mode === "edit" && currentImportOrder) {
      importOrderData.id = currentImportOrder._id;
      importOrderData.status = currentImportOrder.status; // Giữ lại status hiện tại khi sửa, trừ khi có logic thay đổi
    }
    onSubmit(importOrderData);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3 className={styles.title}>
          {mode === "add" ? "Tạo Đơn Nhập Hàng Mới" : "Chỉnh Sửa Đơn Nhập Hàng"}
        </h3>
        <form onSubmit={handleSubmit} className={styles.importOrderForm}>
          {/* Supplier and Expected Date inputs */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="supplier">Nhà Cung Cấp (*):</label>
              <Select
                id="supplier"
                options={sampleSuppliers} // Danh sách NCC từ props
                value={selectedSupplier}
                onChange={setSelectedSupplier}
                placeholder="Chọn nhà cung cấp..."
                isClearable
                className="react-select-container"
                classNamePrefix="react-select"
                required // react-select không hỗ trợ prop này, cần validate riêng trong handleSubmit
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

          {/* Thêm Sản phẩm (Sách/VPP) */}
          <div className={styles.formSection}>
            <h4>Thêm Sản phẩm</h4>
            <Select
              options={handleProductSearchOptions(productSearchTerm)}
              onInputChange={(value, { action }) => {
                if (action === "input-change") setProductSearchTerm(value);
                // Nếu muốn xóa search term khi select mờ đi (blur), thêm logic ở đây
              }}
              inputValue={productSearchTerm}
              onChange={(selectedOption, { action }) => {
                if (action === "select-option") {
                  handleAddProduct(selectedOption);
                  setProductSearchTerm(""); // Xóa input sau khi chọn
                }
              }}
              placeholder="Tìm sản phẩm theo tên (Sách hoặc VPP)..."
              classNamePrefix="react-select"
              className="react-select-container"
              value={null} // Luôn reset Select sau khi chọn
              noOptionsMessage={() =>
                productSearchTerm.length < 1
                  ? "Gõ để tìm sản phẩm..."
                  : "Không tìm thấy sản phẩm"
              }
              filterOption={() => true} // Tắt filter mặc định của react-select, vì options đã được filter bởi handleProductSearchOptions
            />
          </div>

          {/* Chi tiết Sản Phẩm Nhập */}
          {importItems.length > 0 && (
            <div className={styles.formSection}>
              <h4>Chi tiết Sản Phẩm Nhập</h4>
              <div className={styles.importItemsTableContainer}>
                <table className={styles.importItemsTable}>
                  <thead>
                    <tr>
                      <th>Sản phẩm</th>
                      <th>Loại</th>
                      <th className={styles.numberHeader}>Số lượng</th>
                      <th className={styles.numberHeader}>Đơn giá nhập</th>
                      <th className={styles.numberHeader}>Thành tiền</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {importItems.map((item, index) => (
                      <tr
                        key={`${item.product.type}-${item.product.id}-${index}`}
                      >
                        {" "}
                        {/* Key duy nhất */}
                        <td>{item.product.name}</td>
                        <td className={styles.productTypeCell}>
                          {item.product.type === "book" ? "Sách" : "VPP"}
                        </td>
                        <td>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "quantity",
                                e.target.value
                              )
                            }
                            className={styles.itemInput}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={item.import_price}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "import_price",
                                e.target.value
                              )
                            }
                            className={styles.itemInput}
                          />
                        </td>
                        <td className={styles.priceCell}>
                          {item.subtotal.toLocaleString("vi-VN")}
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className={styles.removeItemBtn}
                            title="Xóa"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Notes, Summary, Actions */}
          <div className={styles.formGroup}>
            <label htmlFor="notes">Ghi chú:</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="3"
              className={styles.textareaField}
            />
          </div>

          <div className={`${styles.formSection} ${styles.summarySection}`}>
            <div className={`${styles.summaryRow} ${styles.totalRow}`}>
              <span>Tổng tiền đơn nhập:</span>
              <span>{totalAmount.toLocaleString("vi-VN")} VNĐ</span>
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="submit"
              className={`${styles.btn} ${styles.btnSubmit}`}
            >
              {mode === "add" ? "Tạo Đơn Nhập" : "Cập Nhật"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`${styles.btn} ${styles.btnCancel}`}
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

ImportOrderFormModal.defaultProps = {
  sampleSuppliers: [],
  sampleBooks: [],
  sampleStationery: [],
};

export default ImportOrderFormModal;
