import axios from 'axios';

// Ð?nh nghia ki?u d? li?u tr? v? t? Backend
// (Ph?i kh?p v?i WorkSession.java)
export interface WorkSessionResponse {
    id: string;
    jobId: string;
    workerId: string;
    businessId: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
    createdAt: string;
    updatedAt?: string;
    comment?: string;

    // Rating & Comments
    workerRating?: number;
    businessRating?: number;
    workerComment?: string;
    businessComment?: string;
    workerRated?: boolean;
    businessRated?: boolean;
    firstRatedAt?: string;

    // History
    workerToBusinessHistory?: any[];
    businessToWorkerHistory?: any[];

    // Expanded details
    workerName?: string;
    businessName?: string;
    jobTitle?: string;
    workerAvatar?: string;
    businessAvatar?: string;
    workerNumericId?: number;
    businessNumericId?: number;
}

export interface WorkerPostResponse {
    id: string;
    workerId: string;
    title: string;
    requirements: string;
    salaryExpectation: string;
    location: string;
    type: any; // Ho?c JobType n?u dã import
    description: string;
    postedAt: string;
    status: string;
}

export interface WorkSessionRequest {
    jobId: string;
    workerId: string;
    businessId: string;
}

// C?u trúc Response chu?n b?c ngoài
export interface ResponseObject<T> {
    success: number; // ho?c string "200" tùy backend c?a b?n
    message: string;
    data: T;
}

// C?u hình Axios
const apiClient = axios.create({
    baseURL: 'https://apituyendung.deepcode.vn/api',
    // baseURL: 'https://apituyendung.deepcode.vn/api',
    headers: { 'Content-Type': 'application/json' },
});

// Interceptor: T? d?ng g?n Token vào m?i request
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Object ch?a các hàm g?i API
const workSessionApi = {
    // 1. ?ng tuy?n
    create: async (data: WorkSessionRequest): Promise<ResponseObject<WorkSessionResponse>> => {
        // Backend tr? v? ResponseObject, ta l?y .data d? tr? v? k?t qu? cu?i cùng
        const response = await apiClient.post<ResponseObject<WorkSessionResponse>>('/work-sessions', data);
        return response.data;
    },

    // 2. L?y danh sách ?ng viên theo Job (Dành cho Business)
    getByJob: async (jobId: string): Promise<ResponseObject<WorkSessionResponse[]>> => {
        // Endpoint này ph?i kh?p v?i hàm getByJobId ? Backend
        const response = await apiClient.get<ResponseObject<WorkSessionResponse[]>>(`/work-sessions/job/${jobId}`);
        return response.data;
    },

    // 3. Các hàm khác gi? nguyên (getByWorker, updateStatus)
    getByWorker: async (workerId: string) => {
        const response = await apiClient.get(`/work-sessions/worker/${workerId}`);
        return response.data;
    },

    // Tìm d?n hàm updateStatus và s?a thành:
    updateStatus: async (id: string, status: string, reason?: string) => {
        const response = await apiClient.put(`/work-sessions/${id}/status`, null, {
            params: {
                status: status,
                reason: reason // G?i lý do v? Backend qua Query Parameter
            }
        });
        return response.data;
    },

    getByBusiness: async (businessId: string) => {
        const response = await apiClient.get(`/work-sessions/business/${businessId}`);
        return response.data; // Tr? v? ResponseObject { success, data, message }
    },

    // ?? Thêm hàm getById d? trang WorkSessionPage ho?t d?ng
    getById: async (id: string) => {
        const response = await apiClient.get(`/work-sessions/${id}`);
        return response.data;
    },

    // Trong file src/apis/api_work_session.ts

    completeSession: async (id: string, rating: number, comment: string) => {
        // G?i phuong th?c PUT
        // Tham s? th? 2 là 'body' (d? null), tham s? th? 3 là 'config' ch?a params
        const response = await apiClient.put(`/work-sessions/${id}/complete`, null, {
            params: {
                rating: rating,
                comment: comment || "" // Ð?m b?o không g?i undefined
            }
        });
        return response.data;
    }
};

export default workSessionApi;

