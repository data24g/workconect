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

export interface ProposalDTO {
    id: string;
    adId: string;
    businessId: string;
    businessName: string;
    businessAvatar: string;
    businessNumericId?: number;
    message: string;
    status: string;
    sentAt: string;
}


const proposalApi = {
    getByWorker: async (workerId: string): Promise<ProposalDTO[]> => {
        const response = await apiClient.get<ProposalDTO[]>(`/proposals/worker/${workerId}`);
        return response.data;
    },
    getByAd: async (adId: string): Promise<ProposalDTO[]> => {
        const response = await apiClient.get<ProposalDTO[]>(`/proposals/ad/${adId}`);
        return response.data;
    },
    getByBusiness: async (businessId: string): Promise<ProposalDTO[]> => {
        const response = await apiClient.get<ProposalDTO[]>(`/proposals/business/${businessId}`);
        return response.data;
    },

    create: async (adId: string, businessId: string, message: string): Promise<void> => {
        await apiClient.post('/proposals', null, {
            params: { adId, businessId, message }
        });
    },

    updateStatus: async (id: string, status: string): Promise<void> => {
        await apiClient.put(`/proposals/${id}/status`, null, {
            params: { status }
        });
    }
};


export default proposalApi;

