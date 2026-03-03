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

export enum WorkerAdStatus {
    OPEN = 'OPEN',
    CLOSED = 'CLOSED',
    PENDING = 'PENDING'
}

export interface WorkerAd {
    id?: string;
    workerId: string;
    numericId?: number;
    fullName: string;
    avatar: string;
    title: string;
    description: string;
    skills: string[];

    location: string;
    expectedSalary: string;
    status: WorkerAdStatus;
    verified: boolean;
    createdAt?: string;
}

const workerAdApi = {
    getAll: async (): Promise<WorkerAd[]> => {
        const response = await apiClient.get<WorkerAd[]>('/worker-ads');
        return response.data;
    },
    getByWorker: async (workerId: string): Promise<WorkerAd[]> => {
        const response = await apiClient.get<WorkerAd[]>(`/worker-ads/worker/${workerId}`);
        return response.data;
    },
    getById: async (id: string): Promise<WorkerAd> => {
        const response = await apiClient.get<WorkerAd>(`/worker-ads/${id}`);
        return response.data;
    },
    create: async (ad: WorkerAd): Promise<WorkerAd> => {
        const response = await apiClient.post<WorkerAd>('/worker-ads', ad);
        return response.data;
    },
    update: async (id: string, ad: WorkerAd): Promise<WorkerAd> => {
        const response = await apiClient.put<WorkerAd>(`/worker-ads/${id}`, ad);
        return response.data;
    },
    updateStatus: async (id: string, status: WorkerAdStatus): Promise<void> => {
        await apiClient.put(`/worker-ads/${id}/status`, null, { params: { status } });
    },
    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/worker-ads/${id}`);
    }

};

export default workerAdApi;

