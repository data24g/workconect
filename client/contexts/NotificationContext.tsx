import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import { useAuth } from './AuthContext';
import notificationApi, { Notification } from '../apis/api_notification';

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    refreshNotifications: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const refreshNotifications = useCallback(async () => {
        if (!user?.id) return;
        try {
            // setLoading(true); // Don't block UI with loading state during polling
            const data = await notificationApi.getByUser(user.id);
            console.log("Fetched notifications:", data);

            setNotifications(prev => {
                // Check if new notifications arrived (simple length check)
                if (prev.length > 0 && data.length > prev.length) {
                    const newCount = data.length - prev.length;
                    // Assuming API returns sorted DESC (newest first)
                    // So the new items are at the beginning: index 0 to newCount-1
                    const newNotifs = data.slice(0, newCount);

                    newNotifs.forEach(n => {
                        const icon = n.type === 'FOLLOW' ? 'info' :
                            n.type === 'JOB_STATUS' ? 'success' : 'info';
                        Swal.fire({
                            toast: true,
                            position: 'bottom-start',
                            icon: icon,
                            title: n.message,
                            showConfirmButton: false,
                            timer: 4000
                        });
                    });
                }
                return data;
            });

            setUnreadCount(data.filter(n => !n.isRead).length);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        }
    }, [user?.id]);

    const markAsRead = async (id: string) => {
        try {
            await notificationApi.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
        }
    };

    const markAllAsRead = async () => {
        if (!user?.id) return;
        try {
            await notificationApi.markAllAsRead(user.id);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all notifications as read:", error);
        }
    };

    useEffect(() => {
        if (user) {
            refreshNotifications();
            // Optional: Set up polling
            const interval = setInterval(refreshNotifications, 30000); // 30 seconds
            return () => clearInterval(interval);
        } else {
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [user, refreshNotifications]);

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            loading,
            refreshNotifications,
            markAsRead,
            markAllAsRead
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
