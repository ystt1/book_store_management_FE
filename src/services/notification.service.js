import axios from 'axios';
import { API_URL } from '../config';

const NOTIFICATION_URL = `${API_URL}/notifications`;

export const notificationService = {
    // Create a new notification (admin only)
    createNotification: async (notificationData) => {
        const response = await axios.post(NOTIFICATION_URL, notificationData);
        return response.data;
    },

    // Get notifications for current user
    getUserNotifications: async () => {
        const response = await axios.get(`${NOTIFICATION_URL}/user`);
        return response.data;
    },

    // Mark notification as read
    markAsRead: async (notificationId) => {
        const response = await axios.put(`${NOTIFICATION_URL}/${notificationId}/read`);
        return response.data;
    },

    // Get all notifications (admin only)
    getAllNotifications: async () => {
        const response = await axios.get(NOTIFICATION_URL);
        return response.data;
    }
}; 