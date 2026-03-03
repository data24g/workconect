import axios from 'axios';
import { User } from '../types';

const API_BASE_URL = 'https://apituyendung.deepcode.vn/api/follows';
// const API_BASE_URL = 'https://apituyendung.deepcode.vn/api/follows';

const followApi = {
    follow: async (followingId: string, followerId: string) => {
        const response = await axios.post(`${API_BASE_URL}/${followingId}`, null, {
            params: { followerId }
        });
        return response.data;
    },

    unfollow: async (followingId: string, followerId: string) => {
        const response = await axios.delete(`${API_BASE_URL}/${followingId}`, {
            params: { followerId }
        });
        return response.data;
    },

    getFollowers: async (userId: string): Promise<User[]> => {
        const response = await axios.get(`${API_BASE_URL}/${userId}/followers`);
        return response.data;
    },

    getFollowing: async (userId: string): Promise<User[]> => {
        const response = await axios.get(`${API_BASE_URL}/${userId}/following`);
        return response.data;
    },

    checkFollow: async (followerId: string, followingId: string): Promise<boolean> => {
        const response = await axios.get(`${API_BASE_URL}/check`, {
            params: { followerId, followingId }
        });
        return response.data;
    }
};

export default followApi;
