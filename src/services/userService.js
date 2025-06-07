import axios from 'axios';
import { API_URL } from '../config';
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

const userService = {

    
    getAllUsers: async () => {
        try {
            const response = await axios.get(
                `${API_URL}/employees/admin/employees`,
                getAuthHeader()
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    getUserById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/employees/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Không thể lấy thông tin người dùng');
        }
    },

    createUser: async (userData) => {
        try {
            // Validate role
            const validRoles = ['admin', 'manager', 'staff'];
            if (!validRoles.includes(userData.role)) {
                throw new Error('Role không hợp lệ. Role phải là một trong các giá trị: admin, manager, staff');
            }

            // Validate storeId for non-admin roles
            if (userData.role !== 'admin' && !userData.storeId) {
                throw new Error('Nhân viên phải thuộc về một cửa hàng');
            }

            const response = await axios.post(`${API_URL}/employees`, {
                username: userData.username,
                password: userData.password,
                full_name_user: userData.full_name_user,
                email_user: userData.email_user,
                phone: userData.phone,
                role: userData.role,
                storeId: userData.storeId, // Lưu storeId cho nhân viên
                isActive: true
            });

            // Sau khi tạo thành công, lấy lại danh sách nhân viên
            const updatedList = await userService.getAllUsers();
            return {
                ...response.data,
                updatedList
            };
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Không thể tạo người dùng');
        }
    },

    updateUser: async (id, userData) => {
        try {
            // Validate role if it's being updated
            if (userData.role) {
                const validRoles = ['admin', 'manager', 'staff'];
                if (!validRoles.includes(userData.role)) {
                    throw new Error('Role không hợp lệ. Role phải là một trong các giá trị: admin, manager, staff');
                }
            }

            console.log('Updating user with data:', userData);
            const response = await axios.put(`${API_URL}/employees/${id}`, {
                full_name_user: userData.full_name_user,
                email_user: userData.email_user,
                phone_employee: userData.phone
            });

            console.log('Update response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error updating user:', error.response?.data || error);
            throw new Error(error.response?.data?.message || 'Không thể cập nhật người dùng');
        }
    },

    deleteUser: async (id) => {
        try {
            const response = await axios.delete(`${API_URL}/employees/${id}`);
            // Sau khi xóa thành công, lấy lại danh sách nhân viên
            const updatedList = await userService.getAllUsers();
            return {
                ...response.data,
                updatedList
            };
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Không thể xóa người dùng');
        }
    },

    changePassword: async (id, passwordData) => {
        try {
            const response = await axios.post(`${API_URL}/employees/${id}/change-password`, passwordData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Không thể thay đổi mật khẩu');
        }
    },

    // Thêm hàm mới để lấy danh sách nhân viên theo cửa hàng
    getUsersByStore: async (storeId) => {
        try {
            const response = await axios.get(`${API_URL}/employees?storeId=${storeId}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Không thể lấy danh sách nhân viên của cửa hàng');
        }
    },

    resetPassword: async (userId) => {
        try {
            const response = await axios.post(`${API_URL}/employees/${userId}/change-password`, {
                newPassword: '123456'
            });
            return response.data;
        } catch (error) {
            console.error('Error resetting password:', error.response?.data || error);
            throw new Error(error.response?.data?.message || 'Không thể đặt lại mật khẩu');
        }
    },

    // Profile
    getProfile: async () => {
        try {
            const response = await axios.get(
                `${API_URL}/users/profile`,
                getAuthHeader()
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    updateProfile: async (profileData) => {
        try {
            const response = await axios.put(
                `${API_URL}/users/profile`,
                profileData,
                getAuthHeader()
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    changePassword: async (passwordData) => {
        try {
            const response = await axios.put(
                `${API_URL}/users/profile/password`,
                passwordData,
                getAuthHeader()
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    updateAvatar: async (formData) => {
        try {
            const response = await axios.post(
                `${API_URL}/users/profile/avatar`,
                formData,
                {
                    ...getAuthHeader(),
                    headers: {
                        ...getAuthHeader().headers,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
};

export default userService; 