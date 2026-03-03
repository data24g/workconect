import React, { useState, useEffect, useRef } from 'react';
import { adminApi } from '../services/adminApi';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    icon: string;
    color: string;
    relatedId?: string;
    relatedType?: string;
    actionUrl?: string;
    isRead: boolean;
    isImportant: boolean;
    createdAt: string;
}

interface NotificationPanelProps {
    onUnreadCountChange?: (count: number) => void;
}

export default function NotificationPanel({ onUnreadCountChange }: NotificationPanelProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
    const panelRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const [allNotifs, count] = await Promise.all([
                adminApi.notifications.getAll(),
                adminApi.notifications.getUnreadCount()
            ]);

            setNotifications(Array.isArray(allNotifs) ? allNotifs : []);
            setUnreadCount(typeof count === 'number' ? count : 0);
            onUnreadCountChange?.(typeof count === 'number' ? count : 0);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.isRead) {
            await adminApi.notifications.markAsRead(notification.id);
            fetchNotifications();
        }

        if (notification.actionUrl) {
            navigate(notification.actionUrl);
            setIsOpen(false);
        }
    };

    const handleMarkAllAsRead = async () => {
        await adminApi.notifications.markAllAsRead();
        fetchNotifications();
    };

    const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        await adminApi.notifications.delete(id);
        fetchNotifications();
    };

    const getColorClasses = (color: string) => {
        const colorMap: Record<string, { bg: string; text: string; border: string }> = {
            blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
            amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
            red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
            green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
            orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
            purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
        };
        return colorMap[color] || colorMap.blue;
    };

    const filteredNotifications = activeTab === 'all'
        ? notifications
        : notifications.filter(n => !n.isRead);

    return (
        <div className="relative" ref={panelRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-11 h-11 flex items-center justify-center hover:bg-gray-100 rounded-xl text-gray-600 relative transition-all"
            >
                <i className="fas fa-bell"></i>
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] font-black flex items-center justify-center border-2 border-white shadow-lg animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-14 w-[420px] bg-white rounded-3xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
                    {/* Header */}
                    <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-purple-50 to-pink-50">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                <i className="fas fa-bell text-purple-600"></i>
                                Thông báo
                            </h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="text-xs font-bold text-purple-600 hover:text-purple-800 transition-colors"
                                >
                                    Đánh dấu tất cả đã đọc
                                </button>
                            )}
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`flex-1 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'all'
                                        ? 'bg-white text-purple-700 shadow-md'
                                        : 'text-slate-500 hover:bg-white/50'
                                    }`}
                            >
                                Tất cả ({notifications.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('unread')}
                                className={`flex-1 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'unread'
                                        ? 'bg-white text-purple-700 shadow-md'
                                        : 'text-slate-500 hover:bg-white/50'
                                    }`}
                            >
                                Chưa đọc ({unreadCount})
                            </button>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                        {loading ? (
                            <div className="p-8 text-center">
                                <i className="fas fa-spinner fa-spin text-2xl text-purple-600 mb-2"></i>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Đang tải...</p>
                            </div>
                        ) : filteredNotifications.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 rounded-full bg-slate-50 mx-auto mb-4 flex items-center justify-center">
                                    <i className="fas fa-inbox text-2xl text-slate-300"></i>
                                </div>
                                <p className="text-sm font-bold text-slate-400">
                                    {activeTab === 'unread' ? 'Không có thông báo mới' : 'Chưa có thông báo nào'}
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {filteredNotifications.map(notification => {
                                    const colors = getColorClasses(notification.color);
                                    return (
                                        <div
                                            key={notification.id}
                                            onClick={() => handleNotificationClick(notification)}
                                            className={`p-4 hover:bg-slate-50 transition-all cursor-pointer relative group ${!notification.isRead ? 'bg-purple-50/30' : ''
                                                }`}
                                        >
                                            <div className="flex gap-3">
                                                <div className={`w-10 h-10 rounded-xl ${colors.bg} ${colors.text} flex items-center justify-center shrink-0 border ${colors.border}`}>
                                                    <i className={`fas ${notification.icon}`}></i>
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2 mb-1">
                                                        <h4 className={`text-sm font-black ${!notification.isRead ? 'text-slate-900' : 'text-slate-700'} line-clamp-1`}>
                                                            {notification.title}
                                                        </h4>
                                                        <button
                                                            onClick={(e) => handleDeleteNotification(notification.id, e)}
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600"
                                                        >
                                                            <i className="fas fa-times text-xs"></i>
                                                        </button>
                                                    </div>

                                                    <p className="text-xs text-slate-500 font-medium line-clamp-2 mb-2">
                                                        {notification.message}
                                                    </p>

                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: vi })}
                                                        </span>
                                                        {!notification.isRead && (
                                                            <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                                                        )}
                                                        {notification.isImportant && (
                                                            <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded text-[9px] font-black uppercase tracking-wider">
                                                                Quan trọng
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="p-4 border-t border-slate-100 bg-slate-50">
                            <button
                                onClick={() => {
                                    // Could navigate to a full notifications page
                                    setIsOpen(false);
                                }}
                                className="w-full text-center text-xs font-black text-purple-600 hover:text-purple-800 uppercase tracking-wider transition-colors"
                            >
                                Xem tất cả hoạt động
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
