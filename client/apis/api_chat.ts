import axios from 'axios';
import { User } from '../types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'https://apituyendung.deepcode.vn/api';

export interface MessageDTO {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    timestamp: string;
    isRead: boolean;
    lastSeen?: string;
}

export interface ConversationDTO {
    id: string;
    participant: User;
    lastMessage: string;
    lastTimestamp: string;
    unreadCount: number;
}

const chatApi = {
    // Current backend might not have these endpoints yet. 
    // These are placeholders for the user to implement on their server.

    getConversations: async (userId: string): Promise<ConversationDTO[]> => {
        // Fallback to empty if not implemented
        try {
            const res = await axios.get(`${API_BASE_URL}/chat/conversations/${userId}`);
            return res.data;
        } catch (e) {
            console.warn("Chat API not implemented on server yet. Using local storage fallback.");
            const localData = localStorage.getItem(`conversations_${userId}`);
            let convs = localData ? JSON.parse(localData) : [];

            // Add some random activity simulation
            return convs.map((c: any) => ({
                ...c,
                participant: {
                    ...c.participant,
                    lastSeen: c.participant.lastSeen || new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24).toISOString()
                }
            }));
        }
    },

    getMessages: async (chatId: string, currentUserId?: string): Promise<MessageDTO[]> => {
        try {
            const url = currentUserId
                ? `${API_BASE_URL}/chat/messages/${chatId}?userId=${currentUserId}`
                : `${API_BASE_URL}/chat/messages/${chatId}`;
            const res = await axios.get(url);
            return res.data;
        } catch (e) {
            const localData = localStorage.getItem(`messages_${chatId}`);
            return localData ? JSON.parse(localData) : [];
        }
    },

    sendMessage: async (message: Partial<MessageDTO>): Promise<MessageDTO> => {
        try {
            const res = await axios.post(`${API_BASE_URL}/chat/messages`, message);
            return res.data;
        } catch (e) {
            // Local storage simulation
            const newMessage = {
                ...message,
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                isRead: true
            } as MessageDTO;

            // This is just for demonstration if API fails
            return newMessage;
        }
    },

    getActiveStatus: (lastSeen?: string): { status: 'online' | 'offline', label: string } => {
        if (!lastSeen) return { status: 'offline', label: 'Không rõ' };
        const seenDate = new Date(lastSeen);
        const diff = Date.now() - seenDate.getTime();
        const minutes = Math.floor(diff / 60000);

        if (minutes < 5) return { status: 'online', label: 'Đang hoạt động' };
        if (minutes < 60) return { status: 'offline', label: `Hoạt động ${minutes} phút trước` };
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return { status: 'offline', label: `Hoạt động ${hours} giờ trước` };
        return { status: 'offline', label: `Hoạt động ${Math.floor(hours / 24)} ngày trước` };
    }
};

export default chatApi;
