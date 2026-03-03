import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { JobStatus } from '../apis/api_job';
import jobApi from '../apis/api_job';
import workSessionApi, { WorkSessionResponse } from '../apis/api_work_session';
import Swal from 'sweetalert2';
import SidebarProfile from '../components/SidebarProfile';
import UserSuggestions from '../components/UserSuggestions';

type ViewMode = 'feed' | 'applicants';

const RecruitmentManager: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // State
    const [jobs, setJobs] = useState<any[]>([]);
    const [applicantsData, setApplicantsData] = useState<Record<string, WorkSessionResponse[]>>({}); // Map jobId -> applicants
    const [loadingJobs, setLoadingJobs] = useState(false);

    // UI Navigation State
    const [viewMode, setViewMode] = useState<ViewMode>('feed');
    const [activeJobForApplicants, setActiveJobForApplicants] = useState<any>(null);

    // Giới hạn đăng tin dựa trên xác thực (mock)
    const getJobPostLimit = () => {
        if (!user?.verified) return 1;
        if (user.accountType === 'personal') return 5;
        return 20;
    };

    const jobLimit = getJobPostLimit();

    // ========================================================================
    // 1. LOGIC XỬ LÝ
    // ========================================================================

    const fetchCompanyJobs = async () => {
        if (!user) return;
        setLoadingJobs(true);
        try {
            const userBusinessId = user.id;
            const res = await jobApi.getByBusiness(userBusinessId);

            if (res.success === 200) {
                const jobData = res.data;

                // Fetch applicant counts for each job (or fetch all sessions for this business)
                const sessionsRes = await workSessionApi.getByBusiness(userBusinessId);
                const allSessions: WorkSessionResponse[] = (sessionsRes.success === 200) ? sessionsRes.data : [];

                const jobsWithDetails = jobData.map((job: any) => {
                    const sessions = allSessions.filter(s => s.jobId === job.id);
                    const isFinished = sessions.some((s: any) => s.status === 'COMPLETED');

                    return {
                        ...job,
                        isFinished,
                        applicantCount: sessions.length
                    };
                });

                const sortedJobs = jobsWithDetails.sort((a: any, b: any) =>
                    new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
                );

                // Set initial applicants data
                const initialApplicants: Record<string, WorkSessionResponse[]> = {};
                jobData.forEach((j: any) => {
                    initialApplicants[j.id] = allSessions.filter(s => s.jobId === j.id);
                });

                setApplicantsData(initialApplicants);
                setJobs(sortedJobs);
            }
        } catch (error: any) {
            console.error("Error fetching jobs:", error);
            const errorMsg = error.response?.data?.message || error.message || 'Lỗi tải danh sách công việc';
            Swal.fire({ icon: 'error', title: 'Lỗi', text: errorMsg });
        } finally {
            setLoadingJobs(false);
        }

    };

    useEffect(() => {
        fetchCompanyJobs();
    }, [user]);

    const checkHasApplicants = (jobId: string): boolean => {
        return (applicantsData[jobId]?.length || 0) > 0;
    };

    const handleDeleteJob = async (job: any) => {
        if (job.status === JobStatus.OPEN) {
            await Swal.fire({
                title: 'Hành động bị chặn',
                text: `Tin "${job.title}" đang hiển thị. Vui lòng nhấn "Tạm dừng" trước khi xóa.`,
                icon: 'error',
                confirmButtonText: 'Tôi hiểu'
            });
            return;
        }

        const hasCandidates = checkHasApplicants(job.id);
        if (hasCandidates && !job.isFinished) {
            const res = await Swal.fire({
                title: 'Lưu ý',
                text: `Tin này có hồ sơ ứng tuyển. Bạn vẫn muốn xóa chứ? Dữ liệu hồ sơ sẽ bị mất.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Vẫn xóa',
                cancelButtonText: 'Hủy'
            });
            if (!res.isConfirmed) return;
        }

        const result = await Swal.fire({
            title: 'Xóa tin tuyển dụng?',
            text: `Bạn sắp xóa vĩnh viễn: "${job.title}".`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Xóa ngay',
            cancelButtonText: 'Hủy'
        });

        if (result.isConfirmed) {
            try {
                const res = await jobApi.delete(job.id);
                if (res.success === 200) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Thành công',
                        text: 'Đã xóa tin tuyển dụng',
                        timer: 1500,
                        showConfirmButton: false
                    });
                    fetchCompanyJobs();
                } else {
                    throw new Error(res.message);
                }
            } catch (error: any) {
                Swal.fire({ icon: 'error', title: 'Lỗi', text: error.message || 'Lỗi khi xóa công việc' });
            }
        }
    };

    const handleEditJob = async (job: any) => {
        if (job.isFinished) {
            await Swal.fire({
                icon: 'warning',
                title: 'Đã hoàn thành',
                text: 'Công việc này đã kết thúc thực tế. Việc chỉnh sửa không được khuyến khích.',
            });
            return;
        }
        navigate(`/jobs/post/${job.id}`);
    };

    const handleToggleJobStatus = async (job: any) => {
        const isClosing = job.status === JobStatus.OPEN;

        if (isClosing) {
            const hasCandidates = checkHasApplicants(job.id);
            if (hasCandidates) {
                await Swal.fire({
                    title: 'Bị chặn',
                    text: `Không thể đóng tin "${job.title}" vì hiện đang có hồ sơ ứng tuyển cần xử lý.`,
                    icon: 'warning',
                    confirmButtonText: 'Đã hiểu'
                });
                return;
            }
        }

        if (!isClosing && job.isFinished) {
            Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Công việc đã hoàn thành, không thể mở lại tuyển dụng.' });
            return;
        }

        try {
            const newStatus = isClosing ? JobStatus.CLOSED : JobStatus.OPEN;
            const res = await jobApi.updateStatus(job.id, newStatus);

            if (res.success === 200) {
                Swal.fire({
                    icon: 'success',
                    title: 'Thành công',
                    text: isClosing ? "Đã tạm dừng nhận hồ sơ" : "Đã mở lại tin tuyển dụng",
                    timer: 1500,
                    showConfirmButton: false
                });
                fetchCompanyJobs();
            } else {
                throw new Error(res.message);
            }
        } catch (error: any) {
            Swal.fire({ icon: 'error', title: 'Lỗi', text: error.message || 'Lỗi cập nhật trạng thái' });
        }
    };

    const handleApplicantStatus = async (sessionId: string, status: 'ACCEPTED' | 'REJECTED', workerName: string, jobId: string) => {
        const isAccepting = status === 'ACCEPTED';
        let reason = "";
        if (!isAccepting) {
            const { value: text } = await Swal.fire({
                title: 'Lý do từ chối',
                input: 'textarea',
                inputPlaceholder: 'Nhập lý do...',
                showCancelButton: true,
                confirmButtonText: 'Gửi',
                confirmButtonColor: '#4c42bd'
            });
            if (text === undefined) return;
            reason = text || "Hồ sơ chưa phù hợp";
        }
        try {
            const res = await workSessionApi.updateStatus(sessionId, status, reason);
            if (res.success === 200) {
                Swal.fire({
                    icon: 'success',
                    title: 'Thành công',
                    text: isAccepting ? 'Đã chấp nhận!' : 'Đã từ chối.',
                    timer: 1500,
                    showConfirmButton: false
                });
                fetchCompanyJobs();
            } else {
                throw new Error(res.message);
            }
        } catch (error: any) {
            Swal.fire({ icon: 'error', title: 'Lỗi', text: error.message || 'Lỗi hệ thống' });
        }
    };

    const handlePostNewJob = () => {
        if (jobs.length >= jobLimit) {
            Swal.fire({
                icon: 'warning',
                title: 'Giới hạn',
                text: `Bạn chỉ được đăng tối đa ${jobLimit} tin. Vui lòng nâng cấp tài khoản.`
            });
            return;
        }
        navigate('/jobs/post');
    };

    const handleViewDetailApplicants = (job: any) => {
        setActiveJobForApplicants(job);
        setViewMode('applicants');
    };

    const handleBackToFeed = () => {
        setViewMode('feed');
        setActiveJobForApplicants(null);
    };

    const recentActivities = jobs.slice(0, 3).map(j => `Đã đăng: ${j.title}`);

    // ========================================================================
    // 2. RENDERING UI
    // ========================================================================

    // --- VIEW: FEED ---
    const renderFeed = () => {
        if (loadingJobs) {
            return (
                <div className="text-center py-12">
                    <i className="fas fa-circle-notch animate-spin text-gray-400 text-2xl"></i>
                </div>
            );
        }

        if (jobs.length === 0) {
            return (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                    <i className="fas fa-briefcase text-gray-300 text-5xl mb-4"></i>
                    <h3 className="text-gray-900 font-bold mb-2">Chưa có tin tuyển dụng nào</h3>
                    <p className="text-gray-500 mb-6">Hãy bắt đầu tìm kiếm nhân tài bằng cách đăng tin đầu tiên.</p>
                    <button onClick={handlePostNewJob} className="bg-[#4c42bd] text-white px-6 py-2 rounded-full font-bold hover:bg-[#3b3299] transition-colors shadow-sm">
                        Đăng tin ngay
                    </button>
                </div>
            );
        }

        return (
            <div className="space-y-3">
                {jobs.map((job) => {
                    const applicantCount = applicantsData[job.id]?.length || 0;
                    return (
                        <div key={job.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            {/* Card Header: Avatar & Status */}
                            <div className="px-4 pt-3 pb-2 flex items-start justify-between">
                                <div className="flex items-center gap-3 min-w-0">
                                    <img
                                        src={user?.avatar || job.businessAvatar || "https://api.dicebear.com/7.x/initials/svg?seed=Business"}
                                        className="w-9 h-9 rounded-lg object-cover border border-gray-100 p-0.5"
                                        alt="bz"
                                    />

                                    <div className="min-w-0">
                                        <h3 className="font-bold text-sm text-gray-900 truncate">
                                            {user?.fullName || "Nhà tuyển dụng của bạn"}
                                        </h3>
                                        {user?.numericId && (
                                            <p className="text-[10px] text-[#4c42bd] font-bold">ID: {user.numericId}</p>
                                        )}
                                        <p className="text-[10px] text-gray-400">
                                            {new Date(job.postedAt).toLocaleDateString('vi-VN')}
                                        </p>
                                    </div>
                                </div>
                                <div className="shrink-0">
                                    {job.status === JobStatus.OPEN ?
                                        <span className="text-[9px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-100 font-bold uppercase">Đang tuyển</span> :
                                        <span className="text-[9px] bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full border border-gray-200 font-bold uppercase">Đã đóng</span>
                                    }
                                </div>
                            </div>

                            {/* Job Title & Snippet */}
                            <div className="px-4 pb-2">
                                <h4 className="font-bold text-[15px] text-gray-900 mb-1 truncate">{job.title}</h4>
                                <p className="text-[12px] text-gray-500 line-clamp-1 leading-relaxed">
                                    {job.description}
                                </p>
                            </div>

                            {/* Info Strip: Now tighter */}
                            <div className="px-3 pb-3">
                                <div className="bg-gray-50 rounded-lg border border-gray-100 p-2.5 grid grid-cols-3 divide-x divide-gray-200">
                                    <div className="text-center px-1">
                                        <p className="text-[8px] uppercase font-bold text-gray-400 mb-0.5">Ngân sách</p>
                                        <p className="text-[10px] md:text-[11px] font-bold text-gray-700 truncate">{job.salary}</p>
                                    </div>
                                    <div className="text-center px-1">
                                        <p className="text-[8px] uppercase font-bold text-gray-400 mb-0.5">Địa điểm</p>
                                        <p className="text-[10px] md:text-[11px] font-bold text-gray-700 truncate">{job.location ? job.location.split(' - ')[0] : 'N/A'}</p>
                                    </div>

                                    <div className="text-center px-1">
                                        <p className="text-[8px] uppercase font-bold text-gray-400 mb-0.5">Ứng viên</p>
                                        <p className="text-[10px] md:text-[11px] font-bold text-gray-700">{applicantCount} hồ sơ</p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions Group: Slimmer py-2.5 */}
                            <div className="border-t border-gray-50 grid grid-cols-3 divide-x divide-gray-50">
                                <button
                                    onClick={() => handleToggleJobStatus(job)}
                                    className="py-2.5 text-[10px] font-bold text-gray-500 hover:bg-amber-50 hover:text-amber-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <i className={`fas ${job.status === JobStatus.OPEN ? 'fa-pause' : 'fa-play'}`}></i>
                                    {job.status === JobStatus.OPEN ? 'Tạm dừng' : 'Mở lại'}
                                </button>
                                <button
                                    onClick={() => handleEditJob(job)}
                                    className="py-2.5 text-[10px] font-bold text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <i className="fas fa-pen"></i>
                                    Sửa tin
                                </button>
                                <button
                                    onClick={() => handleDeleteJob(job)}
                                    className="py-2.5 text-[10px] font-bold text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <i className="fas fa-trash"></i>
                                    Xóa bài
                                </button>
                            </div>

                            {/* View Detail CTA: Sits tight at bottom */}
                            <div className="p-2 border-t border-gray-50 bg-gray-50/20">
                                <button
                                    onClick={() => handleViewDetailApplicants(job)}
                                    className="w-full py-2 rounded-lg bg-white border border-gray-200 text-[#4c42bd] text-[11px] font-bold shadow-sm hover:ring-1 hover:ring-indigo-300 transition-all active:scale-[0.99]"
                                >
                                    Xem chi tiết hồ sơ ứng viên <i className="fas fa-chevron-right ml-1 text-[8px]"></i>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    // --- VIEW: APPLICANTS DETAIL ---
    const renderApplicantsDetail = () => {
        const job = activeJobForApplicants;
        const applicants = applicantsData[job.id] || [];

        return (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full animate-in slide-in-from-right duration-300">
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleBackToFeed}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors shadow-sm"
                        >
                            <i className="fas fa-arrow-left text-xs"></i>
                        </button>
                        <div>
                            <h2 className="font-bold text-gray-900 text-sm">Hồ sơ ứng tuyển</h2>
                            <p className="text-[10px] text-gray-500">Tin: <span className="text-[#4c42bd] font-bold">{job.title}</span></p>
                        </div>
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto p-3 space-y-3 max-h-[600px]">
                    {applicants.length === 0 ? (
                        <div className="text-center py-20 flex flex-col items-center">
                            <i className="fas fa-users-slash text-gray-200 text-5xl mb-3"></i>
                            <p className="text-gray-400 text-xs font-medium">Chưa có ai ứng tuyển cho vị trí này.</p>
                        </div>
                    ) : (
                        applicants.map(app => (
                            <div key={app.id} className="p-3 rounded-lg border border-gray-100 flex items-center gap-3 hover:border-indigo-200 hover:bg-indigo-50/20 transition-all group">
                                <img
                                    src={app.workerAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${app.workerName || app.workerId}`}
                                    className="w-10 h-10 rounded-full object-cover border border-indigo-100 shadow-sm"
                                    alt="avatar"
                                />
                                <div className="flex-grow min-w-0">
                                    <div className="flex justify-between items-start">
                                        <div className="min-w-0">
                                            <h4 className="font-bold text-xs text-gray-900 truncate">{app.workerName || `Mã: ${app.workerId?.substring(0, 8)}`}</h4>
                                            {app.workerNumericId && (
                                                <p className="text-[9px] text-[#4c42bd] font-bold">ID: {app.workerNumericId}</p>
                                            )}
                                        </div>
                                        <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase border ${app.status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                            app.status === 'REJECTED' ? 'bg-red-50 text-red-600 border-red-100' :
                                                'bg-amber-50 text-amber-600 border-amber-100'
                                            }`}>
                                            {app.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[9px] text-gray-400 mt-1">
                                        <span>Ngày gửi: {new Date(app.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    {app.comment && (
                                        <div className="mt-1.5 text-[10px] text-gray-500 bg-white/40 p-1.5 rounded border border-gray-50 italic">
                                            "{app.comment}"
                                        </div>
                                    )}
                                </div>

                                {app.status === 'PENDING' && (
                                    <div className="flex gap-1.5">
                                        <button
                                            onClick={() => handleApplicantStatus(app.id, 'ACCEPTED', app.workerName || app.workerId, job.id)}
                                            className="w-8 h-8 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-all flex items-center justify-center shadow-sm"
                                        >
                                            <i className="fas fa-check text-[10px]"></i>
                                        </button>
                                        <button
                                            onClick={() => handleApplicantStatus(app.id, 'REJECTED', app.workerName || app.workerId, job.id)}
                                            className="w-8 h-8 rounded-full bg-red-500 text-white hover:bg-red-600 transition-all flex items-center justify-center shadow-sm"
                                        >
                                            <i className="fas fa-times text-[10px]"></i>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                <div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-end">
                    <button onClick={handleBackToFeed} className="text-[11px] font-bold text-gray-600 bg-white border border-gray-300 px-5 py-1.5 rounded-full hover:bg-gray-100 shadow-sm transition-all active:scale-95">
                        Quay về quản lý
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-[#F3F2EF] min-h-screen py-4 font-sans text-sm">
            <div className="max-w-[1128px] mx-auto px-0 sm:px-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">

                    {/* === LEFT SIDEBAR === */}
                    <div className="md:col-span-3">
                        <SidebarProfile
                            user={user}
                            isWorker={false}
                            repScore={user?.rating || 0}
                            recentActivities={recentActivities}
                        />
                    </div>

                    {/* === CENTER CONTENT === */}
                    <div className="md:col-span-6 space-y-3">

                        {viewMode === 'feed' ? (
                            <>
                                <div className="bg-white rounded-lg border border-gray-200 p-3.5 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'User'}`}
                                            className="w-10 h-10 rounded-full object-cover border border-gray-100 shadow-sm"
                                            alt="avatar"
                                        />
                                        <button
                                            onClick={handlePostNewJob}
                                            className="flex-grow bg-[#F3F2EF] hover:bg-gray-200 text-gray-500 px-4 py-2.5 rounded-full text-left font-semibold text-xs transition-all shadow-inner"
                                        >
                                            Bạn muốn tuyển vị trí nào hôm nay?
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between px-2">
                                    <div className="h-[1px] bg-gray-300 flex-grow"></div>
                                    <span className="text-[9px] text-gray-400 px-3 font-black uppercase tracking-widest">
                                        QUẢN LÝ TIN ĐĂNG
                                    </span>
                                    <div className="h-[1px] bg-gray-300 flex-grow"></div>
                                </div>

                                {renderFeed()}
                            </>
                        ) : (
                            renderApplicantsDetail()
                        )}

                    </div>

                    {/* === RIGHT SIDEBAR === */}
                    <div className="md:col-span-3 space-y-3 hidden md:block">
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                            <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Thông số nhanh</h3>
                                <i className="fas fa-chart-pie text-indigo-500 text-[10px]"></i>
                            </div>
                            <div className="p-4 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                        <i className="fas fa-briefcase text-xs"></i>
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-gray-500 font-bold uppercase">Tin đang mở</p>
                                        <p className="text-base font-black text-gray-900 leading-none">{jobs.filter(j => j.status === JobStatus.OPEN).length}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                                        <i className="fas fa-user-check text-xs"></i>
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-gray-500 font-bold uppercase">Tổng ứng viên</p>
                                        <p className="text-base font-black text-gray-900 leading-none">{Object.values(applicantsData).reduce((acc: number, curr: WorkSessionResponse[]) => acc + curr.length, 0)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-3.5 shadow-sm">
                            <h3 className="text-xs font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <i className="fas fa-lightbulb text-amber-500 text-[10px]"></i>
                                Ghi chú
                            </h3>
                            <div className="space-y-3">
                                <div className="flex gap-2.5 items-start">
                                    <div className="w-1 h-1 rounded-full bg-indigo-400 mt-1.5"></div>
                                    <p className="text-[10px] text-gray-500 leading-relaxed italic">Phản hồi ứng viên sớm để nâng cao danh tiếng.</p>
                                </div>
                                <div className="flex gap-2.5 items-start">
                                    <div className="w-1 h-1 rounded-full bg-emerald-400 mt-1.5"></div>
                                    <p className="text-[10px] text-gray-500 leading-relaxed italic">Tin có hình ảnh thu hút hơn 40% lượt xem.</p>
                                </div>
                            </div>
                        </div>

                        <UserSuggestions title="Ứng viên tiềm năng" type="USER" limit={4} />

                        <div className="text-center py-2">
                            <p className="text-[9px] text-gray-400">© 2024 WorkConnect Management</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default RecruitmentManager;