import React, { useState, useEffect } from 'react';

const modalStyle = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
    zIndex: 9999,
    maxHeight: '90vh',
    overflowY: 'auto',
    width: '90%',
    maxWidth: '600px'
};

const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 9998,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
};

const initialBookData = {
    name: '',
    author: '',
    description: '',
    price: '',
    quantity: '',
    categories: [],
    publisher: null,
    supplier: null,
    image: null,
    imagePreview: null
};

const BookModal = ({ isOpen, onClose, onSubmit, book, mode }) => {
    const [formData, setFormData] = useState(book || {
        name: '',
        author: '',
        description: '',
        price: '',
        quantity: '',
        categories: [],
        publisher: null,
        supplier: null,
        image: null,
        imagePreview: null
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (book) {
            setFormData(book);
        } else {
            setFormData({
                name: '',
                author: '',
                description: '',
                price: '',
                quantity: '',
                categories: [],
                publisher: null,
                supplier: null,
                image: null,
                imagePreview: null
            });
        }
        setErrors({});
    }, [book, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await onSubmit(formData);
            setFormData(initialBookData);
            onClose();
        } catch (error) {
            setErrors(error.response?.data?.errors || {});
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                image: file,
                imagePreview: URL.createObjectURL(file)
            }));
        }
    };

    const handleClose = () => {
        if (formData.imagePreview && !book?.image) {
            URL.revokeObjectURL(formData.imagePreview);
        }
        setFormData(initialBookData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                <h2 style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                    {mode === 'edit' ? 'Cập nhật sách' : 'Thêm sách mới'}
                </h2>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Tên sách:</label>
                        <input
                            type="text"
                            value={formData.name || ''}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #ddd',
                                borderRadius: '4px'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Tác giả:</label>
                        <input
                            type="text"
                            value={formData.author || ''}
                            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #ddd',
                                borderRadius: '4px'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Mô tả:</label>
                        <textarea
                            value={formData.description || ''}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                minHeight: '100px'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Giá:</label>
                        <input
                            type="number"
                            value={formData.price || ''}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #ddd',
                                borderRadius: '4px'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Số lượng:</label>
                        <input
                            type="number"
                            value={formData.quantity || ''}
                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #ddd',
                                borderRadius: '4px'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Hình ảnh:</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            style={{ marginBottom: '10px' }}
                        />
                        {formData.imagePreview && (
                            <div>
                                <img 
                                    src={formData.imagePreview} 
                                    alt="Preview" 
                                    style={{ maxWidth: '200px', marginTop: '10px' }}
                                />
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                        <button
                            type="button"
                            onClick={handleClose}
                            style={{
                                padding: '8px 16px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                backgroundColor: '#fff',
                                cursor: 'pointer'
                            }}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            style={{
                                padding: '8px 16px',
                                border: 'none',
                                borderRadius: '4px',
                                backgroundColor: '#1890ff',
                                color: '#fff',
                                cursor: 'pointer'
                            }}
                        >
                            {mode === 'edit' ? 'Cập nhật' : 'Thêm mới'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookModal; 