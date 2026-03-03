import axios from 'axios';

export interface BusinessDTO {
    id: string;
    numericId?: number;
    name: string;
    logo: string;
    industry: string;
    location: string;
    scale: string;
    established: string;
    taxCode: string;
    description: string;
    rating: number;
    verifyStatus: 'VERIFIED' | 'PENDING';
}

const apiClient = axios.create({
    baseURL: 'https://apituyendung.deepcode.vn/api',
    // baseURL: 'https://apituyendung.deepcode.vn/api',
    headers: { 'Content-Type': 'application/json' },
});

const businessApi = {
    // Backend tr? v? List<Map> tr?c ti?p
    getAll: async (): Promise<BusinessDTO[]> => {
        const response = await apiClient.get<BusinessDTO[]>('/businesses');
        return response.data;
    },
    getById: async (id: string): Promise<BusinessDTO> => {
        const response = await apiClient.get<BusinessDTO>(`/businesses/${id}`);
        return response.data;
    }
};

export default businessApi;

