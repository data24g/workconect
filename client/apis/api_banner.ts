import axios from 'axios';

export interface Banner {
    id: string;
    title: string;
    subtitle: string;
    imageUrl: string; // Kh?p v?i filter imageUrl trong Java
    link: string;
    menu: string;
    active: boolean;
    displayOrder: number;
}

const apiClient = axios.create({
    baseURL: 'https://apituyendung.deepcode.vn/api',
    // baseURL: 'https://apituyendung.deepcode.vn/api',
    headers: { 'Content-Type': 'application/json' },
});

const bannerApi = {
    getByMenu: async (menu: string = 'homepage'): Promise<Banner[]> => {
        const response = await apiClient.get<Banner[]>(`/admin/banners/byMenu`, {
            params: { menu }
        });
        return response.data;
    }
};

export default bannerApi;

