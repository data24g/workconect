import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

import jobApi, { JobResponse, JobType } from '../apis/api_job';
import workerAdApi, { WorkerAd } from '../apis/api_worker_ad';
import UserSuggestions from '../components/UserSuggestions';
import { useSaved } from '../contexts/SavedContext';
import Swal from 'sweetalert2';

const SavedJobs: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { savedJobIds, savedWorkerIds, unsaveJob, unsaveWorker } = useSaved();
  const [savedJobs, setSavedJobs] = useState<JobResponse[]>([]);
  const [savedWorkers, setSavedWorkers] = useState<WorkerAd[]>([]);
  const [loading, setLoading] = useState(true);

  const isBusiness = user?.role === 'BUSINESS';

  const fetchSavedItems = async () => {
    setLoading(true);
    try {
      // Fetch all jobs and filter
      const allJobs = await jobApi.getAll();
      if (allJobs.success === 200) {
        const filteredJobs = allJobs.data.filter(job => savedJobIds.includes(job.id));
        setSavedJobs(filteredJobs);
      }

      // Fetch all worker ads and filter
      const allWorkers = await workerAdApi.getAll();
      if (Array.isArray(allWorkers)) {
        const filteredWorkers = allWorkers.filter(worker => worker.id && savedWorkerIds.includes(worker.id));
        setSavedWorkers(filteredWorkers);
      }
    } catch (error) {
      console.error('Không thể tải các mục đã lưu', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedItems();
  }, [savedJobIds, savedWorkerIds]);

  // Hàm bỏ lưu việc làm
  const handleUnsaveJob = (id: string) => {
    unsaveJob(id);
    Swal.fire({
      icon: 'info',
      title: 'Đã hủy',
      text: 'Đã bỏ lưu việc làm',
      timer: 1500,
      showConfirmButton: false
    });
  };

  // Hàm bỏ lưu người lao động
  const handleUnsaveWorker = (id: string) => {
    unsaveWorker(id);
    Swal.fire({
      icon: 'info',
      title: 'Đã hủy',
      text: 'Đã bỏ lưu người lao động',
      timer: 1500,
      showConfirmButton: false
    });
  };

  // Hàm mở profile Nhà tuyển dụng/người lao động
  const openProfile = (id: string) => {
    navigate(`/fast-processing/${id}`);
  };

  // Hàm để chuyển hướng đến trang Jobs và focus vào công việc cụ thể
  const handleViewJob = (job: any) => {
    navigate('/jobs', { state: { jobId: job.id, searchTerm: job.title, location: job.location } });
  };

  const handleSendProposal = (worker: any) => {
    Swal.fire({
      title: 'Soạn lời mời làm việc',
      html: `
        <div class="text-left">
          <label class="text-xs font-bold text-gray-500">Gửi đến: ${worker.fullName}</label>
          <textarea id="proposal-msg" class="w-full mt-2 p-3 border rounded-lg text-sm h-32 focus:ring-2 focus:ring-[#4c42bd] outline-none" placeholder="Hãy mô tả ngắn gọn công việc, thời gian và mức lương bạn đề xuất..."></textarea>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Gửi đề xuất',
      confirmButtonColor: '#4c42bd',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: 'success',
          title: 'Thành công',
          text: 'Đã gửi đề xuất tuyển dụng thành công!',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };

  // Helper formatTimeAgo (copy từ Jobs)
  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " năm trước";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " tháng trước";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " ngày trước";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " giờ trước";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " phút trước";
    return "Vừa xong";
  };

  // Helper formatJobType (copy từ Jobs)
  const formatJobType = (type: string) => {
    const map: Record<string, string> = {
      FULL_TIME: 'Toàn thời gian',
      PART_TIME: 'Bán thời gian',
      CONTRACT: 'Hợp đồng',
      INTERNSHIP: 'Thực tập',
      FREELANCE: 'Freelance'
    };
    return map[type] || type;
  };

  return (
    <div className="bg-[#F3F2EF] min-h-screen py-6 font-sans text-sm">
      <div className="max-w-[1128px] mx-auto px-0 sm:px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* === LEFT SIDEBAR: IDENTITY === */}
          <div className="md:col-span-3 space-y-2">
            <div className="bg-white rounded-lg border border-gray-300 overflow-hidden relative pb-4 shadow-sm">
              <div className="h-14 bg-gradient-to-r from-slate-600 to-slate-500 relative"></div>
              <div className="px-3 text-center relative">
                <Link to="/profile">
                  <div className="w-16 h-16 mx-auto -mt-8 bg-white p-1 rounded-full border border-gray-200 cursor-pointer hover:opacity-90 shadow-sm">
                    <img
                      src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`}
                      className="w-full h-full rounded-full object-cover"
                      alt="avatar"
                    />
                  </div>
                </Link>
                <div className="mt-3 mb-2">
                  <Link to="/profile">
                    <h2 className="text-base font-bold text-gray-900 hover:underline cursor-pointer leading-tight">
                      {user?.fullName || user?.name || user?.username}
                    </h2>
                  </Link>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">{user?.bio || "Freelancer"}</p>
                  <p className="text-[10px] text-gray-400 mt-1 flex items-center justify-center gap-1">
                    <i className="fas fa-map-marker-alt"></i> Hà Nội, Việt Nam
                  </p>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-2 px-0 pb-2">
                <div className="flex justify-between items-center text-xs font-semibold text-gray-500 hover:bg-gray-100 px-3 py-1.5 cursor-pointer transition-colors">
                  <span>Điểm uy tín</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[#4c42bd] font-bold text-sm">{user?.rating?.toFixed(1) || '0.0'}</span>
                    <div className="flex text-amber-500 text-xs gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className={`${i < Math.floor(user?.rating || 0) ? 'fas' : 'far'} fa-star`}></i>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold text-gray-500 hover:bg-gray-100 px-3 py-1.5 cursor-pointer transition-colors">
                  <span>Lượt xem hồ sơ</span>
                  <span className="text-[#4c42bd] font-bold text-sm">12</span>
                </div>
              </div>
              <div className="border-t border-gray-200 p-3 hover:bg-gray-100 cursor-pointer transition-colors text-left group">
                <Link to="/premium" className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-amber-100 text-amber-600 flex items-center justify-center"><i className="fas fa-crown text-[8px]"></i></div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 group-hover:underline">Truy cập công cụ độc quyền</span>
                    <span className="text-xs font-bold text-gray-900 decoration-dotted group-hover:text-[#f5945c]">Dùng thử Premium miễn phí</span>
                  </div>
                </Link>
              </div>
              <Link
                to="/saved-jobs"
                className="block border-t border-gray-200 p-3 hover:bg-gray-100 cursor-pointer transition-colors text-left flex items-center gap-2 text-xs font-bold text-gray-700"
              >
                <i className="fas fa-bookmark text-gray-400"></i>
                <span>Mục đã lưu</span>
              </Link>
            </div>
            <div className="bg-white rounded-lg border border-gray-300 p-3 shadow-sm sticky top-20 hidden md:block">
              <p className="text-xs font-bold text-gray-900 mb-2">Gần đây</p>
              <div className="space-y-1">
                {savedJobs.slice(0, 3).map((job, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-gray-500 hover:bg-gray-100 p-1.5 rounded cursor-pointer font-semibold truncate">
                    <i className="fas fa-users text-gray-400 text-[10px]"></i> {job.title}
                  </div>
                ))}
                {savedJobs.length === 0 && <p className="text-xs text-gray-400">Chưa có hoạt động gần đây</p>}
              </div>
              <div className="mt-3 pt-2 border-t border-gray-100 text-center">
                <span className="text-xs font-bold text-gray-500 hover:text-gray-900 cursor-pointer">Khám phá thêm</span>
              </div>
            </div>
          </div>
          {/* MAIN COLUMN: SAVED LIST */}
          <div className="md:col-span-6 space-y-4">
            <div className="bg-white rounded-lg border border-gray-300 p-4 shadow-sm flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">
                {isBusiness ? `Người lao động đã lưu (${savedWorkers.length})` : `Việc làm đã lưu (${savedJobs.length})`}
              </h2>
            </div>
            {loading ? (
              <div className="text-center py-8 bg-white rounded-lg border border-gray-300 shadow-sm">
                <i className="fas fa-spinner fa-spin text-gray-400 text-3xl mb-2"></i>
                <p className="text-sm text-gray-500">Đang tải...</p>
              </div>
            ) : isBusiness ? (
              savedWorkers.length > 0 ? (
                savedWorkers.map(worker => (
                  <div key={worker.id} className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden">
                    <div className="p-4 flex flex-col sm:flex-row items-start gap-4">
                      <img
                        src={worker.avatar}
                        className="w-14 h-14 rounded-full border border-gray-200 shrink-0 cursor-pointer hover:opacity-80 object-cover"
                        alt={worker.fullName}
                        onClick={() => openProfile(worker.id)}
                      />
                      <div className="flex-grow min-w-0 w-full">
                        <div className="flex justify-between items-start">
                          <div>
                            <span onClick={() => openProfile(worker.id)} className="text-sm font-bold text-[#4c42bd] hover:underline cursor-pointer block">{worker.fullName}</span>
                            <p className="text-xs font-bold text-gray-700 mt-0.5">{worker.title}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                            <div className="flex items-center gap-1 text-xs bg-amber-50 px-2 py-1 rounded border border-amber-100">
                              <span className="font-bold text-amber-700">{worker.rating}</span>
                              <i className="fas fa-star text-amber-500 text-[10px]"></i>
                            </div>
                            {worker.verified && (
                              <span className="bg-blue-50 text-[#4c42bd] text-[10px] px-2 py-0.5 rounded border border-blue-100 font-bold whitespace-nowrap">Xác minh</span>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{worker.location} • {worker.expectedSalary}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {worker.skills?.slice(0, 3).map((s: string) => (
                            <span key={s} className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-full font-medium">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-gray-200 px-4 py-3 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 sm:gap-4">
                      <button
                        onClick={() => worker.id && handleUnsaveWorker(worker.id)}
                        className="w-full sm:w-auto text-xs font-semibold text-gray-500 hover:text-red-600 flex items-center justify-center sm:justify-start gap-1 py-1.5"
                      >
                        <i className="fas fa-bookmark"></i> Bỏ lưu
                      </button>
                      <button
                        onClick={() => handleSendProposal(worker)}
                        className="w-full sm:w-auto text-xs font-bold px-4 py-2 rounded-full bg-[#4c42bd] text-white hover:bg-[#004182] transition-colors shadow-sm flex items-center justify-center gap-1"
                      >
                        <i className="fas fa-paper-plane mr-1 text-[10px]"></i> Gửi lời mời
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-300 border-dashed shadow-sm">
                  <i className="fas fa-bookmark text-gray-300 text-4xl mb-3"></i>
                  <p className="text-base text-gray-700 font-medium mb-2">Chưa có người lao động nào được lưu</p>
                  <p className="text-xs text-gray-500 mb-4">Hãy khám phá các hồ sơ phù hợp ở Trang chủ</p>
                  <Link to="/" className="text-sm font-bold text-[#4c42bd] hover:underline">Về Trang chủ</Link>
                </div>
              )
            ) : savedJobs.length > 0 ? (
              savedJobs.map(job => {
                const reqList = job.requirements ? job.requirements.split(',').map(r => r.trim()) : [];
                return (
                  <div key={job.id} className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden">
                    <div className="p-4 flex flex-col sm:flex-row items-start gap-4">
                      <img
                        src={job.businessAvatar}
                        className="w-12 h-12 rounded border border-gray-200 shrink-0 cursor-pointer hover:opacity-80 object-cover"
                        alt="Company Logo"
                        onClick={() => openProfile(job.businessId)}
                      />
                      <div className="flex-grow min-w-0 w-full">
                        <div className="flex justify-between items-start">
                          <span onClick={() => handleViewJob(job)} className="text-sm font-bold text-[#4c42bd] hover:underline cursor-pointer block">{job.title}</span>
                          {job.businessRating && job.businessRating > 0 && (
                            <div className="flex items-center gap-1 text-xs bg-amber-50 px-2 py-1 rounded border border-amber-100 shrink-0 ml-2" title="Điểm uy tín Nhà tuyển dụng">
                              <span className="font-bold text-amber-700">{job.businessRating.toFixed(1)}</span>
                              <i className="fas fa-star text-amber-500 text-[10px]"></i>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-700 mt-0.5">{job.businessName}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{job.location} • {formatJobType(job.type)}</p>
                        <p className="text-xs text-gray-400 mt-1">Đăng {formatTimeAgo(job.postedAt)}</p>
                        <div className="flex flex-wrap gap-2 mt-2 mb-1">
                          {reqList.slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="bg-gray-100 text-gray-600 text-[10px] font-semibold px-2 py-1 rounded-sm">
                              {tag}
                            </span>
                          ))}
                          {reqList.length > 3 && <span className="text-[10px] text-gray-400 self-center">+{reqList.length - 3}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-gray-200 px-4 py-3 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 sm:gap-4">
                      <button
                        onClick={() => handleUnsaveJob(job.id)}
                        className="w-full sm:w-auto text-xs font-semibold text-gray-500 hover:text-red-600 flex items-center justify-center sm:justify-start gap-1 py-1.5"
                      >
                        <i className="fas fa-bookmark"></i> Bỏ lưu
                      </button>
                      <button
                        onClick={() => handleViewJob(job)}
                        className="w-full sm:w-auto text-xs font-bold px-4 py-2 rounded-full border border-[#4c42bd] text-[#4c42bd] hover:bg-[#4c42bd] hover:text-white cursor-pointer flex items-center justify-center transition-colors"
                      >
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-300 border-dashed shadow-sm">
                <i className="fas fa-bookmark text-gray-300 text-4xl mb-3"></i>
                <p className="text-base text-gray-700 font-medium mb-2">Chưa có việc làm nào được lưu</p>
                <p className="text-xs text-gray-500 mb-4">Khám phá và lưu các vị trí phù hợp với bạn</p>
                <Link to="/jobs" className="text-sm font-bold text-[#4c42bd] hover:underline">Tìm việc làm ngay</Link>
              </div>
            )}
          </div>
          {/* === RIGHT SIDEBAR: SUGGESTIONS === */}
          <div className="md:col-span-3 space-y-4 hidden md:block">
            <UserSuggestions limit={4} />
            <div className="text-center px-4">
              <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-[11px] text-gray-500">
                <Link to="/about" className="hover:text-[#4c42bd] hover:underline">Về chúng tôi</Link>
                <Link to="/help" className="hover:text-[#4c42bd] hover:underline">Trợ giúp</Link>
                <Link to="/privacy" className="hover:text-[#4c42bd] hover:underline">Quyền riêng tư & Điều khoản</Link>
                <Link to="/ads" className="hover:text-[#4c42bd] hover:underline">Quảng cáo</Link>
                <Link to="/jobs" className="hover:text-[#4c42bd] hover:underline">Việc làm</Link>
                <Link to="/companies" className="hover:text-[#4c42bd] hover:underline">Công ty</Link>
                <Link to="/resources" className="hover:text-[#4c42bd] hover:underline">Tài nguyên</Link>
                <Link to="/profile" className="hover:text-[#4c42bd] hover:underline">Hồ sơ</Link>
              </div>
              <div className="mt-2 flex items-center justify-center gap-1">
                <span className="font-bold text-[#4c42bd] text-xs">WorkConnect</span>
                <p className="text-[11px] text-gray-500">Corporation © 2025</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavedJobs;