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

export interface SuggestionDTO {
    id: string;
    name: string;
    avatar: string;
    role: string;
    mutualConnections: number;
    type: 'USER' | 'COMPANY';
    numericId?: number;
}

const suggestionApi = {
    getSuggestions: async (userId: string): Promise<SuggestionDTO[]> => {
        const response = await apiClient.get<SuggestionDTO[]>(`/suggestions/${userId}`);
        return response.data;
    }
};

export default suggestionApi;

