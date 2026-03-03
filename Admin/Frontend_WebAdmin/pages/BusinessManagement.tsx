import React, { useEffect, useState } from 'react';
import { adminApi } from '../services/adminApi';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { getImageUrl, getInitialsAvatar } from '../utils/imageUtils';

export default function BusinessManagement() {
    const [businesses, setBusinesses] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBusiness, setSelectedBusiness] = useState<any>(null);
    const [showDetail, setShowDetail] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState<any>(null);
    const [showActivityDetail, setShowActivityDetail] = useState(false);

    const fetchBusinesses = async () => {
        setLoading(true);
        try {
            const allBiz = await adminApi.businesses.getAll();
            let result = allBiz;
            if (searchTerm) {
                result = allBiz.filter((b: any) =>
                    (b.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (b.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (b.taxCode || '').toLowerCase().includes(searchTerm.toLowerCase())
                );
            }
            setBusinesses(result);
        } catch (error) {
            console.error('Error fetching businesses:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBusinesses();
    }, [searchTerm]);

    const handleViewDetail = async (id: string) => {
        try {
            const detail = await adminApi.businesses.getById(id);
            setSelectedBusiness(detail);
            setShowDetail(true);
        } catch (error) {
            alert("Không thể tải chi tiết doanh nghiệp");
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
            fetchBusinesses();
            if (selectedBusiness?.id === userId) {
                const detail = await adminApi.businesses.getById(userId);
                setSelectedBusiness(detail);
            }
        } catch (error) {
            alert("Lỗi thực hiện hành động");
        }
    };


    const handleUnverifyBusiness = async (businessId: string) => {
        const reason = prompt("Nhập lý do hủy xác thực (tùy chọn):");
        if (reason === null) return; // User clicked cancel

        if (!confirm(`Xác nhận hủy xác thực doanh nghiệp này?`)) return;

        try {
            // 1. Call unverify API
            const response = await adminApi.businesses.unverify(businessId, reason || undefined);
            console.log('Unverify response:', response);

            // 2. CLOSE modal immediately (don't keep stale data)
            setShowDetail(false);
            setSelectedBusiness(null);

            // 3. Wait for backend to complete save
            await new Promise(resolve => setTimeout(resolve, 800));

            // 4. Force clear state and refetch
            setBusinesses([]); // Clear first to force re-render
            await fetchBusinesses();

            console.log('Unverify completed and list refreshed');
            alert("✅ Đã hủy xác thực doanh nghiệp! Kiểm tra danh sách.");
        } catch (error) {
            console.error('Error unverifying business:', error);
            alert("❌ Lỗi khi hủy xác thực doanh nghiệp");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Quản lý Doanh nghiệp</h1>
                    <p className="text-sm text-slate-500 font-medium">Theo dõi hoạt động và quản lý thông tin các đối tác tuyển dụng.</p>
                </div>
                <div className="relative">
                    <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input
                        type="text"
                        placeholder="Tìm tên, MST, email..."
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
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Doanh nghiệp</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Ngành nghề</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Xác thực</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">MST</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan={5} className="py-20 text-center text-slate-400 font-medium">Đang tải dữ liệu...</td></tr>
                        ) : businesses.length === 0 ? (
                            <tr><td colSpan={5} className="py-20 text-center text-slate-400 font-medium">Không tìm thấy doanh nghiệp nào</td></tr>
                        ) : businesses.map((biz) => (
                            <tr key={biz.id} className="hover:bg-slate-50/80 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={getImageUrl(biz.logo, getInitialsAvatar(biz.name))}
                                            className="w-10 h-10 rounded-xl object-cover shadow-sm"
                                        />
                                        <div>
                                            <div className="font-bold text-slate-800 text-sm">{biz.name}</div>
                                            <div className="text-xs text-slate-500">{biz.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-xs font-bold text-slate-600">{biz.industry || 'N/A'}</div>
                                    <div className="text-[10px] text-slate-400">{biz.location || 'Chưa cập nhật địa chỉ'}</div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {biz.verified ? (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-black uppercase ring-1 ring-green-100">
                                            <i className="fas fa-check-circle"></i> Đã xác thực
                                        </span>
                                    ) : (biz.verifyStatus === 'REJECTED' || (biz as any).verificationStatus === 'REJECTED') ? (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-600 rounded-lg text-[10px] font-black uppercase ring-1 ring-red-100">
                                            <i className="fas fa-ban"></i> Đã từ chối
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black uppercase ring-1 ring-amber-100">
                                            <i className="fas fa-clock"></i> Chờ duyệt
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-xs font-mono font-bold text-slate-500">
                                    {biz.taxCode || 'N/A'}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleViewDetail(biz.id)}
                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all font-bold text-xs"
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
            {showDetail && selectedBusiness && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col animate-scale-in">
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-white">
                            <div className="flex items-center gap-4">
                                <img
                                    src={getImageUrl(selectedBusiness.avatar, getInitialsAvatar(selectedBusiness.name))}
                                    className="w-16 h-16 rounded-2xl shadow-lg border-2 border-white"
                                />
                                <div>
                                    <h2 className="text-xl font-black text-slate-800">{selectedBusiness.name}</h2>
                                    <p className="text-sm text-slate-500 font-medium">{selectedBusiness.industry} • MST: {selectedBusiness.taxCode || 'Chưa cung cấp'}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowDetail(false)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 transition-all">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            <div className="grid grid-cols-4 gap-8">
                                {/* Left Column: Business Info */}
                                <div className="space-y-6">
                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Hồ sơ năng lực</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 mb-1">Quy mô</p>
                                                <p className="text-sm font-bold text-slate-700">{selectedBusiness.scale || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 mb-1">Năm thành lập</p>
                                                <p className="text-sm font-bold text-slate-700">{selectedBusiness.established || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 mb-1">Giới thiệu</p>
                                                <p className="text-xs text-slate-600 leading-relaxed italic line-clamp-4">{selectedBusiness.bio || 'Chưa có giới thiệu'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Trạng thái xác thực</h3>
                                        <div className={`p-4 rounded-xl text-center border ${selectedBusiness.verified
                                                ? 'bg-green-50 border-green-100 text-green-700'
                                                : (selectedBusiness.verifyStatus === 'REJECTED' || selectedBusiness.verificationStatus === 'REJECTED')
                                                    ? 'bg-red-50 border-red-100 text-red-700'
                                                    : 'bg-amber-50 border-amber-100 text-amber-700'
                                            }`}>
                                            <i className={`fas ${selectedBusiness.verified
                                                    ? 'fa-certificate'
                                                    : (selectedBusiness.verifyStatus === 'REJECTED' || selectedBusiness.verificationStatus === 'REJECTED')
                                                        ? 'fa-ban'
                                                        : 'fa-hourglass-half'
                                                } text-2xl mb-2`}></i>
                                            <p className="text-xs font-black uppercase tracking-tight">
                                                {selectedBusiness.verified
                                                    ? 'Đã được duyệt'
                                                    : (selectedBusiness.verifyStatus === 'REJECTED' || selectedBusiness.verificationStatus === 'REJECTED')
                                                        ? 'Đã từ chối'
                                                        : 'Đang chờ duyệt'}
                                            </p>
                                        </div>

                                        {/* Unverify button for verified businesses */}
                                        {selectedBusiness.verified && (
                                            <button
                                                onClick={() => handleUnverifyBusiness(selectedBusiness.id)}
                                                className="w-full mt-3 py-2.5 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                                            >
                                                <i className="fas fa-times-circle"></i>
                                                Hủy xác thực
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Middle Column: Jobs posted */}
                                <div className="col-span-2 space-y-6">
                                    <div>
                                        <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
                                            <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
                                            Tin tuyển dụng đã đăng ({selectedBusiness.jobs?.length || 0})
                                        </h3>
                                        <div className="space-y-3">
                                            {selectedBusiness.jobs?.length > 0 ? (
                                                selectedBusiness.jobs.map((job: any) => (
                                                    <div key={job.id} className="p-4 bg-white border border-slate-100 rounded-2xl hover:shadow-md transition-all group">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h4 className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{job.title}</h4>
                                                                <p className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                                                                    <span className="flex items-center gap-1"><i className="fas fa-map-marker-alt"></i> {job.location}</span>
                                                                    <span className="flex items-center gap-1 text-green-600 font-bold"><i className="fas fa-money-bill-wave"></i> {job.salary}</span>
                                                                </p>
                                                            </div>
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${job.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                                                                }`}>
                                                                {job.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="py-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                                    <p className="text-sm font-bold text-slate-400">Chưa có tin đăng nào</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Work History */}
                                    <div className="mt-8">
                                        <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
                                            <div className="w-1.5 h-6 bg-green-600 rounded-full"></div>
                                            Lịch sử người lao động ({selectedBusiness.workSessions?.length || 0})
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            {selectedBusiness.workSessions?.length > 0 ? (
                                                selectedBusiness.workSessions.map((session: any) => (
                                                    <div key={session.id} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h4 className="font-bold text-slate-800 text-xs">{session.jobTitle}</h4>
                                                            <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded text-[9px] font-black">{session.status}</span>
                                                        </div>
                                                        <div className="text-[10px] text-slate-500 font-bold">
                                                            Worker: {session.workerName}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="col-span-2 py-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                                    <p className="text-xs font-bold text-slate-400">Chưa có dữ liệu làm việc</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Activity History */}
                                <div className="space-y-6">
                                    <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
                                        <div className="w-1.5 h-6 bg-purple-600 rounded-full"></div>
                                        Nhật ký hoạt động
                                    </h3>
                                    <div className="relative border-l-2 border-slate-100 ml-3 pl-6 space-y-8">
                                        {selectedBusiness.activities?.length > 0 ? (
                                            selectedBusiness.activities.map((act: any) => (
                                                <div
                                                    key={act.id}
                                                    className="relative cursor-pointer group hover:bg-slate-50 -m-2 p-2 rounded-xl transition-all"
                                                    onClick={() => {
                                                        setSelectedActivity(act);
                                                        setShowActivityDetail(true);
                                                    }}
                                                >
                                                    <div className="absolute -left-[31px] top-2 w-4 h-4 rounded-full bg-white border-4 border-purple-500 shadow-sm group-hover:scale-125 transition-transform"></div>
                                                    <div className="text-xs font-bold text-slate-800 group-hover:text-purple-600 transition-colors">{act.details}</div>
                                                    <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase flex items-center gap-2">
                                                        {format(new Date(act.timestamp), 'HH:mm - dd/MM')}
                                                        <i className="fas fa-chevron-right opacity-0 group-hover:opacity-100 transition-opacity text-purple-400"></i>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-xs italic text-slate-400">Không có dữ liệu</p>
                                        )}
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
                        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-purple-50 to-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600 text-xl">
                                        <i className="fas fa-clock-rotate-left"></i>
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
                                        <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-black uppercase tracking-wider">
                                            {selectedActivity.action}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 mb-1">Mô tả chi tiết</p>
                                        <p className="text-sm font-medium text-slate-700 leading-relaxed">{selectedActivity.details}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 mb-1">Thời gian thực hiện</p>
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
                                        Hoạt động diễn ra ngày {format(new Date(selectedActivity.timestamp), 'dd/MM/yyyy')}
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
