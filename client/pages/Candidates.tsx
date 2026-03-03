import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Swal from 'sweetalert2';
import workerAdApi from '../apis/api_worker_ad';
import jobApi from '../apis/api_job';
import proposalApi from '../apis/api_proposal';
import { UserRole } from '../types';
import SidebarProfile from '../components/SidebarProfile';
import { useSaved } from '../contexts/SavedContext';
import { calculateWorkerScore } from '../utils/ranking';
import { formatTimeAgo } from './Home';

const Candidates: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [workerAds, setWorkerAds] = useState<any[]>([]);
    const [jobs, setJobs] = useState<any[]>([]);
    const [sentProposalAdIds, setSentProposalAdIds] = useState<string[]>([]);
    const [workerSearchTerm, setWorkerSearchTerm] = useState('');
    const [location, setLocation] = useState('Tất cả địa điểm');
    const { isWorkerSaved, saveWorker, unsaveWorker } = useSaved();
    const [selectedWorker, setSelectedWorker] = useState<any>(null);
    const [showWorkerDetailModal, setShowWorkerDetailModal] = useState(false);

    const isBusiness = user && user.role === UserRole.BUSINESS;

    useEffect(() => {
        if (user && !isBusiness) {
            navigate('/');
        }
    }, [user, isBusiness, navigate]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [workerAdData, jobRes] = await Promise.all([
                    workerAdApi.getAll(),
                    jobApi.getAll()
                ]);

                if (Array.isArray(workerAdData)) {
                    // Mock ranking logic if needed, or just use raw data
                    setWorkerAds(workerAdData);
                }
                if (jobRes.success === 200 && Array.isArray(jobRes.data)) {
                    setJobs(jobRes.data);
                }
            } catch (error) {
                console.error('Failed to fetch data', error);
            }
        };
        fetchData();
    }, []);

    // Fetch sent proposals for business
    useEffect(() => {
        const fetchSentProposals = async () => {
            if (user?.id) {
                try {
                    const sent = await proposalApi.getByBusiness(user.id);
                    setSentProposalAdIds(sent.map(p => p.adId));
                } catch (error) {
                    console.error("Failed to fetch sent proposals:", error);
                }
            }
        };

        if (isBusiness) fetchSentProposals();
    }, [isBusiness, user?.id]);

    const openWorkerProfile = (workerId: string) => {
        navigate(`/fast-processing/${workerId}`);
    };

    const handleViewWorkerDetail = (worker: any) => {
        setSelectedWorker(worker);
        setShowWorkerDetailModal(true);
    };

    const handleSendProposal = async (worker: any) => {
        if (!user) return;

        const { value: message } = await Swal.fire({
            title: 'Soạn lời mời làm việc',
            input: 'textarea',
            inputLabel: `Gửi đến: ${worker.fullName}`,
            inputPlaceholder: 'Hãy mô tả ngắn gọn công việc, thời gian và mức lương bạn đề xuất...',
            inputAttributes: {
                'aria-label': 'Type your message here'
            },
            showCancelButton: true,
            confirmButtonText: 'Gửi đề xuất',
            confirmButtonColor: '#4c42bd',
            cancelButtonText: 'Hủy'
        });

        if (message) {
            try {
                await proposalApi.create(worker.id, user.id, message);
                setSentProposalAdIds(prev => [...prev, worker.id]);
                Swal.fire({
                    icon: 'success',
                    title: 'Thành công',
                    text: 'Đã gửi đề xuất tuyển dụng thành công!',
                    timer: 1500,
                    showConfirmButton: false
                });
            } catch (error: any) {
                const errorMsg = error.response?.data?.message || error.message || 'Lỗi gửi đề xuất';
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi',
                    text: errorMsg
                });
            }
        }
    };

    return (
        <div className="bg-[#F3F2EF] min-h-screen font-sans py-6">
            <div className="max-w-[1128px] mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

                    {/* LEFT SIDEBAR */}
                    <div className="hidden lg:block lg:col-span-3">
                        <SidebarProfile
                            user={user}
                            isWorker={false}
                            repScore={user?.rating || 0}
                            recentActivities={jobs.slice(0, 3).map(j => `Xem ${j.title}`)}
                        />
                    </div>

                    {/* CENTER FEED */}
                    <div className="lg:col-span-9 flex flex-col">
                        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4 shadow-sm flex items-center justify-between">
                            <h1 className="text-xl font-bold text-gray-900">Tìm kiếm ứng viên</h1>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Tìm theo kỹ năng, tên..."
                                    className="pl-9 pr-4 py-2 bg-[#f3f6f9] border border-transparent focus:border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-gray-300 outline-none w-64"
                                    value={workerSearchTerm}
                                    onChange={(e) => setWorkerSearchTerm(e.target.value)}
                                />
                                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {workerAds
                                .filter(w => {
                                    const matchSearch = w.title.toLowerCase().includes(workerSearchTerm.toLowerCase()) ||
                                        w.fullName.toLowerCase().includes(workerSearchTerm.toLowerCase()) ||
                                        w.skills.some((s: string) => s.toLowerCase().includes(workerSearchTerm.toLowerCase()));
                                    const matchLocation = location === 'Tất cả địa điểm' || w.location.includes(location);
                                    return matchSearch && matchLocation;
                                })
                                .sort((a, b) => {
                                    const scoreA = calculateWorkerScore(a, user, isWorkerSaved(a.id), sentProposalAdIds.includes(a.id));
                                    const scoreB = calculateWorkerScore(b, user, isWorkerSaved(b.id), sentProposalAdIds.includes(b.id));
                                    return scoreB - scoreA;
                                })
                                .map(worker => (
                                    <div key={worker.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleViewWorkerDetail(worker)}>

                                        {/* Header */}
                                        <div className="p-3 flex items-start gap-3 border-b border-gray-50">
                                            <img
                                                src={worker.avatar}
                                                className="w-12 h-12 rounded-full cursor-pointer border border-gray-100"
                                                onClick={(e) => { e.stopPropagation(); openWorkerProfile(worker.id); }}
                                                alt={worker.fullName}
                                            />
                                            <div className="flex-grow">
                                                <div className="flex items-center gap-1">
                                                    <h3 className="font-bold text-sm text-gray-900 hover:text-[#0a66c2] hover:underline cursor-pointer leading-tight"
                                                        onClick={(e) => { e.stopPropagation(); openWorkerProfile(worker.id); }}>
                                                        {worker.fullName || 'Người dùng'}
                                                    </h3>
                                                    {worker.verified && <i className="fas fa-check-circle text-[#0a66c2] text-[10px]" title="Đã xác minh"></i>}
                                                </div>
                                                <p className="text-[11px] text-gray-500 line-clamp-1">{worker.title}</p>
                                                <p className="text-[10px] text-gray-400 flex items-center gap-1">
                                                    {worker.createdAt ? formatTimeAgo(worker.createdAt) : 'Vừa xong'} • <i className="fas fa-globe text-[8px]"></i>
                                                </p>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-3">
                                            <h4 className="font-bold text-sm text-gray-900 mb-2">{worker.title}</h4>
                                            <p className="text-xs text-gray-600 mb-3 line-clamp-3 leading-relaxed">
                                                {worker.description || worker.bio || 'Không có mô tả'}
                                            </p>
                                            <div className="flex flex-wrap gap-1.5 mb-3">
                                                {worker.skills.slice(0, 4).map((s: string) => (
                                                    <span key={s} className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-full font-medium">{s}</span>
                                                ))}
                                            </div>
                                            <div className="flex items-center gap-3 text-[11px] text-gray-500 bg-gray-50 p-2 rounded-lg">
                                                <span className="flex items-center gap-1"><i className="fas fa-map-marker-alt text-gray-400"></i> {worker.location}</span>
                                                <span className="text-gray-300">|</span>
                                                <span className="flex items-center gap-1"><i className="fas fa-money-bill-wave text-green-500"></i> <b className="text-green-700">{worker.expectedSalary}</b></span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="px-3 py-2 border-t border-gray-100 flex gap-2 bg-white">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (isWorkerSaved(worker.id)) {
                                                        unsaveWorker(worker.id);
                                                    } else {
                                                        saveWorker(worker.id);
                                                    }
                                                }}
                                                className={`flex-1 text-[11px] font-bold px-3 py-1.5 rounded-full border transition-colors flex items-center justify-center gap-1 ${isWorkerSaved(worker.id)
                                                    ? 'bg-amber-50 text-amber-600 border-amber-200 shadow-inner'
                                                    : 'text-gray-600 hover:bg-gray-100 border-gray-300 shadow-sm'
                                                    }`}
                                            >
                                                <i className={`${isWorkerSaved(worker.id) ? 'fas' : 'far'} fa-bookmark`}></i> {isWorkerSaved(worker.id) ? 'Đã lưu' : 'Lưu'}
                                            </button>

                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleSendProposal(worker); }}
                                                disabled={sentProposalAdIds.includes(worker.id)}
                                                className={`flex-1 text-[11px] font-bold px-3 py-1.5 rounded-full transition-colors flex items-center justify-center gap-1 shadow-sm
                        ${sentProposalAdIds.includes(worker.id)
                                                        ? 'bg-gray-100 text-gray-400 cursor-default border border-gray-200'
                                                        : 'text-white bg-[#4c42bd] hover:bg-[#004182]'
                                                    }`}
                                            >
                                                <i className={sentProposalAdIds.includes(worker.id) ? "fas fa-check" : "fas fa-paper-plane"}></i>
                                                {sentProposalAdIds.includes(worker.id) ? 'Đã mời' : 'Gửi lời mời'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Worker Detail Modal */}
            {showWorkerDetailModal && selectedWorker && (
                <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4 transition-opacity" onClick={() => setShowWorkerDetailModal(false)}>
                    <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all" onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-start justify-between z-10">
                            <div className="flex gap-4 flex-1">
                                <div className="w-16 h-16 bg-white border border-gray-100 rounded-full flex-shrink-0 p-1 flex items-center justify-center">
                                    <img
                                        src={selectedWorker.avatar}
                                        alt={selectedWorker.fullName}
                                        className="w-14 h-14 rounded-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-xl font-bold text-gray-900 mb-1">{selectedWorker.fullName}</h2>
                                    <p className="text-sm text-gray-600 font-medium mb-2">{selectedWorker.title}</p>
                                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <i className="fas fa-map-marker-alt"></i>
                                            {selectedWorker.location}
                                        </span>
                                        <span className="flex items-center gap-1 text-green-700 font-bold bg-green-50 px-2 py-1 rounded border border-green-100">
                                            <i className="fas fa-money-bill-wave"></i>
                                            {selectedWorker.expectedSalary}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setShowWorkerDetailModal(false)} className="ml-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
                                <i className="fas fa-times text-lg"></i>
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2"><i className="fas fa-user-circle text-[#4c42bd]"></i> Giới thiệu & Kinh nghiệm</h3>
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedWorker.description || 'Chưa có mô tả'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-3">
                            <button
                                onClick={() => {
                                    setShowWorkerDetailModal(false);
                                    handleSendProposal(selectedWorker);
                                }}
                                disabled={sentProposalAdIds.includes(selectedWorker.id)}
                                className={`flex-1 font-bold py-3 px-6 rounded-full transition-colors shadow-md flex items-center justify-center gap-2 ${sentProposalAdIds.includes(selectedWorker.id)
                                    ? 'bg-gray-100 text-gray-400 cursor-default border border-gray-200'
                                    : 'bg-[#4c42bd] hover:bg-[#3a32a0] text-white'
                                    }`}
                            >
                                <i className={sentProposalAdIds.includes(selectedWorker.id) ? "fas fa-check" : "fas fa-paper-plane"}></i>
                                {sentProposalAdIds.includes(selectedWorker.id) ? 'Đã gửi lời mời' : 'Gửi lời mời làm việc'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Candidates;
