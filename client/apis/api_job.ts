import axios from 'axios';

// Kh?p v?i JobType.java
export enum JobType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  FREELANCE = 'FREELANCE',
  CONTRACT = 'CONTRACT',
  INTERNSHIP = 'INTERNSHIP'
}

// Kh?p v?i JobStatus.java
export enum JobStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
}

export interface JobRequestDTO {
  businessId: string;
  requirements: string;
  title: string;
  salary: string;
  location: string;
  type: JobType;
  description: string;
  industry: string; // Added industry field
  minRating?: number;
}

export interface JobResponse extends JobRequestDTO {
  id: string;
  postedAt: string;
  status: JobStatus;
  // Các field m? r?ng t? Service
  businessName?: string;
  businessAvatar?: string;
  businessNumericId?: number;
  businessRating?: number;
  businessRatingCount?: number;
  verified?: boolean;
}

// Kh?p v?i ResponseObject.java c?a Backend
export interface ResponseObject<T> {
  success: number; // class ResponseObject(int code, ...)
  data: T;
  message: string;
}

const apiClient = axios.create({
  baseURL: 'https://apituyendung.deepcode.vn/api',
  // baseURL: 'https://apituyendung.deepcode.vn/api',
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const jobApi = {
  getAll: async (): Promise<ResponseObject<JobResponse[]>> => {
    const response = await apiClient.get<ResponseObject<JobResponse[]>>('/jobs');
    return response.data;
  },
  getById: async (id: string): Promise<ResponseObject<JobResponse>> => {
    const response = await apiClient.get<ResponseObject<JobResponse>>(`/jobs/${id}`);
    return response.data;
  },
  getByBusiness: async (businessId: string): Promise<ResponseObject<JobResponse[]>> => {
    const response = await apiClient.get<ResponseObject<JobResponse[]>>(`/jobs/business/${businessId}`);
    return response.data;
  },

  create: async (data: JobRequestDTO): Promise<ResponseObject<JobResponse>> => {
    const response = await apiClient.post<ResponseObject<JobResponse>>('/jobs', data);
    return response.data;
  },
  update: async (id: string, data: JobRequestDTO): Promise<ResponseObject<JobResponse>> => {
    const response = await apiClient.put<ResponseObject<JobResponse>>(`/jobs/${id}`, data);
    return response.data;
  },
  updateStatus: async (id: string, status: JobStatus): Promise<ResponseObject<JobResponse>> => {
    const response = await apiClient.put<ResponseObject<JobResponse>>(`/jobs/${id}/status`, null, {
      params: { status }
    });
    return response.data;
  },
  delete: async (id: string): Promise<ResponseObject<null>> => {
    const response = await apiClient.delete<ResponseObject<null>>(`/jobs/${id}`);
    return response.data;
  }
};

export default jobApi;

