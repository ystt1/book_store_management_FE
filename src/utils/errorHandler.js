export const handleApiError = (error) => {
    if (error.response) {
        // Server trả về response với status code nằm ngoài range 2xx
        const errorMessage = error.response.data?.message || 'Có lỗi xảy ra từ server';
        throw new Error(errorMessage);
    } else if (error.request) {
        // Request được gửi nhưng không nhận được response
        throw new Error('Không thể kết nối đến server');
    } else {
        // Có lỗi khi setting up request
        throw new Error('Có lỗi xảy ra khi gửi yêu cầu');
    }
}; 