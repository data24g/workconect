import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'https://apituyendung.deepcode.vn/api',
    // baseURL: 'https://apituyendung.deepcode.vn/api',
    headers: { 'Content-Type': 'application/json' },
});

// Interceptor to add token
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export interface Notification {
    id: string;
    userId: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    type: string;
}

const notificationApi = {
    getByUser: async (userId: string): Promise<Notification[]> => {
        const response = await apiClient.get<Notification[]>(`/notifications/${userId}`);
        return response.data;
    },
    markAsRead: async (id: string): Promise<void> => {
        await apiClient.put(`/notifications/${id}/read`);
    },
    markAllAsRead: async (userId: string): Promise<void> => {
        await apiClient.put(`/notifications/read-all/${userId}`);
    }
};

export default notificationApi;

