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

const userApi = {
    getById: async (id: string) => {
        const response = await apiClient.get(`/users/${id}`);
        return response.data;
    },
    update: async (id: string, updates: any) => {
        const response = await apiClient.put(`/users/${id}`, updates);
        return response.data;
    },
    verify: async (id: string, data: any) => {
        const response = await apiClient.post(`/users/${id}/verify`, data);
        return response.data;
    }

};

export default userApi;

