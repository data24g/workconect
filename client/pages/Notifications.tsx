import React from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { formatTimeAgo } from './Home';
import { Link } from 'react-router-dom';



const Notifications: React.FC = () => {
    const { user } = useAuth();
    const { notifications, markAsRead, markAllAsRead, loading } = useNotifications();


    const getIcon = (type: string) => {
        switch (type) {
            case 'JOB_APPLY': return <i className="fas fa-paper-plane text-blue-500"></i>;
            case 'JOB_STATUS': return <i className="fas fa-info-circle text-indigo-500"></i>;
            case 'PROPOSAL': return <i className="fas fa-envelope-open-text text-amber-500"></i>;
            case 'RATING': return <i className="fas fa-star text-yellow-500"></i>;
            case 'COMPLETED': return <i className="fas fa-check-circle text-emerald-500"></i>;
            case 'VERIFICATION': return <i className="fas fa-user-shield text-purple-500"></i>;
            default: return <i className="fas fa-bell text-gray-400"></i>;
        }
    };

    return (
        <div className="max-w-[1128px] mx-auto px-4 py-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Thông báo của bạn</h1>
                        <p className="text-xs text-gray-500 mt-1">Cập nhật những hoạt động mới nhất liên quan đến bạn</p>
                    </div>
                    <button
                        onClick={markAllAsRead}
                        className="text-xs font-bold text-[#4c42bd] hover:underline"
                    >
                        Đánh dấu tất cả là đã đọc
                    </button>
                </div>

                <div className="flex-grow">
                    {user && !user.verified && (
                        <div className="px-6 py-4 bg-amber-50 border-b border-amber-100 flex items-center justify-between">
                            <div className="flex gap-4 items-center">
                                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                                    <i className="fas fa-user-shield"></i>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-amber-900">Nâng cấp hồ sơ của bạn</p>
                                    <p className="text-xs text-amber-700">Tài khoản chưa được xác thực. Xác thực ngay để tăng tỷ lệ được nhận việc lên 80%.</p>
                                </div>
                            </div>
                            <Link
                                to="/verification"
                                className="px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-700 transition-colors"
                            >
                                Xác thực danh tính
                            </Link>
                        </div>
                    )}
                    {loading && notifications.length === 0 ? (

                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4c42bd]"></div>
                        </div>
                    ) : notifications.length > 0 ? (
                        <div className="divide-y divide-gray-50">
                            {notifications.map(notif => (
                                <div
                                    key={notif.id}
                                    className={`px-6 py-4 flex gap-4 transition-colors hover:bg-gray-50 cursor-pointer ${notif.isRead ? 'opacity-80' : 'bg-[#eef3f8]/30 border-l-4 border-l-[#4c42bd]'}`}
                                    onClick={() => !notif.isRead && markAsRead(notif.id)}
                                >
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 shrink-0">
                                        {getIcon(notif.type)}
                                    </div>
                                    <div className="flex-grow">
                                        <p className={`text-sm ${notif.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                                            {notif.message}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {formatTimeAgo(notif.createdAt)}
                                        </p>
                                    </div>
                                    {!notif.isRead && (
                                        <div className="w-2.5 h-2.5 bg-[#4c42bd] rounded-full mt-2"></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 text-center px-10">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <i className="fas fa-bell-slash text-2xl text-gray-300"></i>
                            </div>
                            <h3 className="text-base font-bold text-gray-900">Chưa có thông báo nào</h3>
                            <p className="text-sm text-gray-500 mt-2 max-w-xs">
                                Khi có hoạt động mới như được mời làm việc hoặc hoàn thành dự án, chúng tôi sẽ thông báo cho bạn tại đây.
                            </p>
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 text-center">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                        WorkConnect Notifications System
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Notifications;
