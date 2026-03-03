import React, { useEffect, useState } from 'react';
import { adminApi } from '../services/adminApi';
import { User } from '../types';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { getImageUrl, getInitialsAvatar } from '../utils/imageUtils';

export default function ApplicantManagement() {
    const [applicants, setApplicants] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
    const [showDetail, setShowDetail] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState<any>(null);
    const [showActivityDetail, setShowActivityDetail] = useState(false);

    const fetchApplicants = async () => {
        setLoading(true);
        try {
            // Get users with WORKER role
            const allUsers = await adminApi.users.getAll();
            const filtered = allUsers.filter((u: any) =>
                String(u.role).includes('WORKER') || String(u.role) === 'USER'
            );

            let result = filtered;
            if (searchTerm) {
                result = filtered.filter((u: any) =>
                    (u.fullName || u.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
                );
            }
            setApplicants(result);
        } catch (error) {
            console.error('Error fetching applicants:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplicants();
    }, [searchTerm]);

    const handleViewDetail = async (id: string) => {
        try {
            const detail = await adminApi.users.getWorkerProfile(id);
            // Fetch work sessions for this worker using the direct endpoint
            const workerSessions = await adminApi.workSessions.getByWorker(id);

            setSelectedApplicant({ ...detail, workHistory: workerSessions });
            setShowDetail(true);
        } catch (error) {
            console.error('Error fetching details:', error);
            alert("Không thể tải chi tiết người ứng tuyển");
        }
    };

    const handleStatusChange = async (userId: string, action: 'WARN' | 'DISABLE' | 'ACTIVATE' | 'BAN') => {
        if (!confirm(`Xác nhận thực hiện hành động này?`)) return;
        try {
            if (action === 'WARN') await adminApi.users.warnUser(userId);
            else if (action === 'DISABLE') await adminApi.users.disableUser(userId);
            else if (action === 'ACTIVATE') await adminApi.users.activateUser(userId);
            else if (action === 'BAN') await adminApi.users.banUser(userId);

            alert("Thành công!");
            fetchApplicants();
            if (selectedApplicant?.id === userId) {
                const detail = await adminApi.users.getWorkerProfile(userId);
                setSelectedApplicant(detail);
            }
        } catch (error) {
            alert("Lỗi thực hiện hành động");
        }
    };

    const handleViewActivityDetail = (activity: any) => {
        setSelectedActivity(activity);
        setShowActivityDetail(true);
    };

    const getActivityIcon = (action: string) => {
        if (action?.includes('APPLY')) return 'fa-paper-plane';
        if (action?.includes('LOGIN')) return 'fa-key';
        if (action?.includes('UPDATE')) return 'fa-user-pen';
        if (action?.includes('JOB')) return 'fa-briefcase';
        if (action?.includes('REVIEW')) return 'fa-star';
        if (action?.includes('MESSAGE')) return 'fa-message';
        return 'fa-bolt';
    };

    const getActivityColor = (action: string) => {
        if (action?.includes('APPLY')) return 'blue';
        if (action?.includes('LOGIN')) return 'green';
        if (action?.includes('UPDATE')) return 'purple';
        if (action?.includes('JOB')) return 'orange';
        if (action?.includes('REVIEW')) return 'amber';
        if (action?.includes('MESSAGE')) return 'indigo';
        return 'slate';
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Quản lý Người ứng tuyển</h1>
                    <p className="text-sm text-slate-500 font-medium">Danh sách các cá nhân đang tìm kiếm việc làm trên hệ thống.</p>
                </div>
                <div className="relative">
                    <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input
                        type="text"
                        placeholder="Tìm theo tên, email..."
                        className="pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none w-80 shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Họ tên / Email</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Trạng thái</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Độ uy tín</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Ngày tham gia</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan={5} className="py-20 text-center text-slate-400 font-medium">Đang tải dữ liệu...</td></tr>
                        ) : applicants.length === 0 ? (
                            <tr><td colSpan={5} className="py-20 text-center text-slate-400 font-medium">Không tìm thấy người ứng tuyển nào</td></tr>
                        ) : applicants.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={getImageUrl(user.avatar, getInitialsAvatar(user.fullName || user.username || 'User'))}
                                            className="w-10 h-10 rounded-xl object-cover shadow-sm"
                                        />
                                        <div>
                                            <div className="font-bold text-slate-800 text-sm">{user.fullName || user.username}</div>
                                            <div className="text-xs text-slate-500">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${user.status === 'ACTIVE' ? 'bg-green-50 text-green-600 border border-green-100' :
                                        user.status === 'BLOCKED' ? 'bg-red-50 text-red-600 border border-red-100' :
                                            'bg-amber-50 text-amber-600 border border-amber-100'
                                        }`}>
                                        {user.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold ring-1 ring-indigo-100">
                                        <i className="fas fa-star text-[10px]"></i>
                                        {user.credibilityScore || 100}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-xs font-medium text-slate-500 uppercase">
                                    {user.createdAt ? format(new Date(user.createdAt), 'dd MMM yyyy', { locale: vi }) : 'N/A'}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleViewDetail(user.id)}
                                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-all font-bold text-xs"
                                    >
                                        Xem chi tiết
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Detail Modal */}
            {showDetail && selectedApplicant && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-scale-in">
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-purple-50 to-white">
                            <div className="flex items-center gap-4">
                                <img
                                    src={getImageUrl(selectedApplicant.avatar, getInitialsAvatar(selectedApplicant.fullName || selectedApplicant.username || 'User'))}
                                    className="w-16 h-16 rounded-2xl shadow-lg border-2 border-white"
                                />
                                <div>
                                    <h2 className="text-xl font-black text-slate-800">{selectedApplicant.fullName || selectedApplicant.username}</h2>
                                    <p className="text-sm text-slate-500 font-medium">{selectedApplicant.email} • ID: {selectedApplicant.id}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowDetail(false)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 transition-all">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            <div className="grid grid-cols-3 gap-8">
                                {/* Left Column: Stats & Info */}
                                <div className="space-y-6">
                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Thông tin cơ bản</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 mb-1">Số điện thoại</p>
                                                <p className="text-sm font-bold text-slate-700">{selectedApplicant.phone || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 mb-1">Địa chỉ</p>
                                                <p className="text-sm font-bold text-slate-700">{selectedApplicant.location || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 mb-1">Kỹ năng</p>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {selectedApplicant.skills?.map((s: string, i: number) => (
                                                        <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-600">{s}</span>
                                                    )) || <span className="text-xs italic text-slate-400">Chưa cập nhật</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-indigo-600 p-6 rounded-2xl text-white shadow-lg shadow-indigo-200">
                                        <h3 className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mb-4">Hành động quản trị</h3>
                                        <div className="flex flex-col gap-2">
                                            {selectedApplicant.status !== 'ACTIVE' && (
                                                <button onClick={() => handleStatusChange(selectedApplicant.id, 'ACTIVATE')} className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2">
                                                    <i className="fas fa-check-circle"></i> Kích hoạt lại
                                                </button>
                                            )}
                                            <button onClick={() => handleStatusChange(selectedApplicant.id, 'WARN')} className="w-full py-2 bg-amber-400/20 hover:bg-amber-400/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2">
                                                <i className="fas fa-exclamation-triangle"></i> Cảnh báo
                                            </button>
                                            {selectedApplicant.status !== 'BLOCKED' && (
                                                <button onClick={() => handleStatusChange(selectedApplicant.id, 'DISABLE')} className="w-full py-2 bg-red-400/20 hover:bg-red-400/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 text-red-100">
                                                    <i className="fas fa-user-slash"></i> Khóa tài khoản
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Activities & History */}
                                <div className="col-span-2 space-y-8">
                                    {/* Work History */}
                                    <div>
                                        <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
                                            <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
                                            Lịch sử công việc đã làm ({selectedApplicant.workHistory?.length || 0})
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            {selectedApplicant.workHistory?.length > 0 ? (
                                                selectedApplicant.workHistory.map((session: any) => (
                                                    <div key={session.id} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h4 className="font-bold text-slate-800 text-xs">{session.jobTitle}</h4>
                                                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[9px] font-black">{session.status}</span>
                                                        </div>
                                                        <div className="text-[10px] text-slate-500 flex justify-between">
                                                            <span>Tại: {session.businessName}</span>
                                                            <span className="font-bold text-indigo-600">{session.paymentAmount?.toLocaleString()}đ</span>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="col-span-2 py-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                                    <p className="text-xs font-bold text-slate-400">Chưa có lịch sử làm việc</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Activities */}
                                    <div>
                                        <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
                                            <div className="w-1.5 h-6 bg-purple-600 rounded-full"></div>
                                            Nhật ký hoạt động chi tiết
                                        </h3>
                                        <div className="space-y-3">
                                            {selectedApplicant.activities?.length > 0 ? (
                                                selectedApplicant.activities.map((act: any) => {
                                                    const color = getActivityColor(act.action);
                                                    return (
                                                        <div
                                                            key={act.id}
                                                            onClick={() => handleViewActivityDetail(act)}
                                                            className="flex gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-purple-200 cursor-pointer group"
                                                        >
                                                            <div className={`w-10 h-10 rounded-xl bg-${color}-100 flex items-center justify-center text-${color}-600 shrink-0 group-hover:scale-110 transition-transform`}>
                                                                <i className={`fas ${getActivityIcon(act.action)}`}></i>
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="text-sm font-bold text-slate-800">{act.details}</div>
                                                                <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                                                                    {act.action} • {format(new Date(act.timestamp), 'HH:mm - dd/MM/yyyy')}
                                                                </div>
                                                            </div>
                                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <i className="fas fa-chevron-right text-purple-400"></i>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="py-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                                    <p className="text-sm font-bold text-slate-400">Không có lịch sử hoạt động</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Activity Detail Modal */}
            {showActivityDetail && selectedActivity && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-scale-in">
                        {/* Header */}
                        <div className={`p-6 border-b border-slate-100 bg-gradient-to-r from-${getActivityColor(selectedActivity.action)}-50 to-white`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-2xl bg-${getActivityColor(selectedActivity.action)}-100 flex items-center justify-center text-${getActivityColor(selectedActivity.action)}-600 text-xl`}>
                                        <i className={`fas ${getActivityIcon(selectedActivity.action)}`}></i>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-slate-800">Chi tiết hoạt động</h2>
                                        <p className="text-sm text-slate-500 font-medium">{selectedActivity.action}</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowActivityDetail(false)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 transition-all">
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-8 space-y-6">
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Thông tin chi tiết</h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 mb-1">ID Hoạt động</p>
                                        <p className="text-sm font-mono font-bold text-slate-700">{selectedActivity.id}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 mb-1">Loại hành động</p>
                                        <span className={`inline-block px-3 py-1 bg-${getActivityColor(selectedActivity.action)}-100 text-${getActivityColor(selectedActivity.action)}-700 rounded-lg text-xs font-black uppercase tracking-wider`}>
                                            {selectedActivity.action}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 mb-1">Mô tả</p>
                                        <p className="text-sm font-medium text-slate-700 leading-relaxed">{selectedActivity.details}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 mb-1">Thời gian</p>
                                        <p className="text-sm font-bold text-slate-700">
                                            {format(new Date(selectedActivity.timestamp), 'HH:mm:ss - EEEE, dd MMMM yyyy', { locale: vi })}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 mb-1">User ID</p>
                                        <p className="text-sm font-mono font-bold text-slate-700">{selectedActivity.userId}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Timeline indicator */}
                            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-2xl border border-purple-100">
                                <div className="flex items-center justify-center gap-3 text-sm font-bold text-slate-600">
                                    <i className="fas fa-clock text-purple-600"></i>
                                    <span>
                                        Đã diễn ra {format(new Date(selectedActivity.timestamp), 'dd/MM/yyyy')}
                                        {' • '}
                                        Cách đây {Math.floor((Date.now() - new Date(selectedActivity.timestamp).getTime()) / (1000 * 60 * 60 * 24))} ngày
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
