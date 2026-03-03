import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import workerAdApi, { WorkerAd, WorkerAdStatus } from '../apis/api_worker_ad';
import proposalApi, { ProposalDTO } from '../apis/api_proposal';
import SidebarProfile from '../components/SidebarProfile';
import Swal from 'sweetalert2';
import UserSuggestions from '../components/UserSuggestions';

type ViewMode = 'feed' | 'proposals';

const WorkerManager: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myAds, setMyAds] = useState<WorkerAd[]>([]);
  const [proposals, setProposals] = useState<ProposalDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (user?.id) {
        try {
          setIsLoading(true);
          const [ads, props] = await Promise.all([
            workerAdApi.getByWorker(user.id),
            proposalApi.getByWorker(user.id)
          ]);
          setMyAds(ads);
          setProposals(props);
        } catch (error) {
          console.error("Failed to fetch data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchData();
  }, [user?.id]);

  // UI Navigation State
  const [viewMode, setViewMode] = useState<ViewMode>('feed');
  const [activeAdForProposals, setActiveAdForProposals] = useState<any>(null);

  // Filter sessions to simulate recent activities
  const recentActivities = myAds.slice(0, 3).map(ad => `Đã đăng tìm: ${ad.title}`);

  const handleCreatePost = () => {
    if (!user?.verified) {
      Swal.fire({
        title: 'Yêu cầu xác thực',
        text: 'Bạn cần xác thực danh tính (CCCD) để có thể đăng tin tìm việc.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Xác thực ngay',
        cancelButtonText: 'Để sau'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/profile');
        }
      });
      return;
    }
    navigate('/jobs/post');
  };

  const handleEdit = (id: string) => {
    navigate(`/jobs/post/${id}`);
  };

  const handleDelete = async (ad: any) => {
    if (ad.status === WorkerAdStatus.OPEN) {
      await Swal.fire({
        title: 'Hành động bị chặn',
        text: `Bài đăng "${ad.title}" đang hiển thị tìm việc. Vui lòng nhấn "Dừng" trước khi xóa.`,
        icon: 'error',
        confirmButtonText: 'Tôi hiểu'
      });
      return;
    }

    Swal.fire({
      title: 'Xóa bài đăng?',
      text: `Bạn sắp xóa vĩnh viễn: "${ad.title}".`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Xóa ngay',
      cancelButtonText: 'Hủy'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await workerAdApi.delete(ad.id);
          setMyAds(prev => prev.filter(item => item.id !== ad.id));
          Swal.fire({
            icon: 'success',
            title: 'Thành công',
            text: 'Đã xóa bài đăng',
            timer: 1500,
            showConfirmButton: false
          });
        } catch (error) {
          Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Không thể xóa bài đăng. Vui lòng thử lại.' });
        }
      }
    });
  };

  const handleToggleAdStatus = async (ad: WorkerAd) => {
    const isClosing = ad.status === WorkerAdStatus.OPEN;

    if (isClosing) {
      const hasProposals = getProposalCount(ad.id!) > 0;
      if (hasProposals) {
        await Swal.fire({
          title: 'Có lời mời chưa xử lý',
          text: `Bạn có ${getProposalCount(ad.id!)} lời mời chưa xử lý. Bạn có chắc muốn dừng tìm kiếm?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Vẫn dừng',
          cancelButtonText: 'Hủy'
        }).then(async (result) => {
          if (result.isConfirmed) {
            await updateAdStatus(ad.id!, isClosing);
          }
        });
        return;
      }
    }

    await updateAdStatus(ad.id!, isClosing);
  };

  const updateAdStatus = async (adId: string, isClosing: boolean) => {
    try {
      const newStatus = isClosing ? WorkerAdStatus.CLOSED : WorkerAdStatus.OPEN;
      await workerAdApi.updateStatus(adId, newStatus);

      Swal.fire({
        icon: 'success',
        title: 'Thành công',
        text: isClosing ? 'Đã dừng tìm kiếm' : 'Đã mở lại tìm kiếm',
        timer: 1500,
        showConfirmButton: false
      });

      // Refresh data
      if (user?.id) {
        const ads = await workerAdApi.getByWorker(user.id);
        setMyAds(ads);
      }
    } catch (error: any) {
      Swal.fire({ icon: 'error', title: 'Lỗi', text: error.message || 'Không thể cập nhật trạng thái' });
    }
  };

  const handleViewDetailProposals = (ad: any) => {
    setActiveAdForProposals(ad);
    setViewMode('proposals');
  };

  const handleBackToFeed = () => {
    setViewMode('feed');
    setActiveAdForProposals(null);
  };

  const getProposalCount = (jobId: string) => {
    return proposals.filter(p => p.adId === jobId).length;
  };

  const handleProposalStatus = async (proposalId: string, status: 'ACCEPTED' | 'REJECTED') => {
    const isAccepting = status === 'ACCEPTED';
    try {
      await proposalApi.updateStatus(proposalId, status);
      Swal.fire({
        icon: 'success',
        title: 'Thành công',
        text: isAccepting ? 'Đã chấp nhận lời mời làm việc!' : 'Đã từ chối lời mời.',
        timer: 1500,
        showConfirmButton: false
      });
      // Refresh data
      if (user?.id) {
        const props = await proposalApi.getByWorker(user.id);
        setProposals(props);
      }
    } catch (error: any) {
      Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Không thể cập nhật trạng thái hồ sơ.' });
    }
  };

  // --- VIEW: FEED ---
  const renderFeed = () => {
    if (myAds.length === 0) {
      return (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center shadow-sm">
          <i className="fas fa-clipboard-list text-gray-300 text-5xl mb-4"></i>
          <p className="text-gray-500 font-medium">Bạn chưa có bài đăng tìm việc nào.</p>
          <button
            onClick={handleCreatePost}
            className="mt-4 text-[#4c42bd] font-bold hover:underline"
          >
            Tạo bài đăng đầu tiên ngay
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {[...myAds].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).map((ad: any) => {
          const count = getProposalCount(ad.id);
          return (
            <div key={ad.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {/* Card Header */}
              <div className="px-4 pt-3 pb-2 flex items-start justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'User'}`}
                    className="w-9 h-9 rounded-lg object-cover border border-gray-100 p-0.5"
                    alt="avatar"
                  />
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-gray-900 truncate">
                      {user?.fullName || user?.name || 'Người dùng'}
                    </h3>
                    {user?.numericId && (
                      <p className="text-[10px] text-[#4c42bd] font-bold">ID: {user.numericId}</p>
                    )}
                    <p className="text-[10px] text-gray-400">
                      {ad.createdAt || 'Vừa xong'}
                    </p>
                  </div>
                </div>
                <div className="shrink-0">
                  {ad.status === WorkerAdStatus.OPEN ? (
                    <span className="text-[9px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-100 font-bold uppercase">Đang tìm</span>
                  ) : (
                    <span className="text-[9px] bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full border border-gray-200 font-bold uppercase">Đã dừng</span>
                  )}
                </div>
              </div>

              {/* Ad Title & Snippet */}
              <div className="px-4 pb-2">
                <h4 className="font-bold text-[15px] text-gray-900 mb-1 truncate">{ad.title}</h4>
                <p className="text-[12px] text-gray-500 line-clamp-1 leading-relaxed">
                  {ad.description}
                </p>
              </div>

              {/* Info Strip */}
              <div className="px-3 pb-3">
                <div className="bg-gray-50 rounded-lg border border-gray-100 p-2.5 grid grid-cols-3 divide-x divide-gray-200">
                  <div className="text-center px-1">
                    <p className="text-[8px] uppercase font-bold text-gray-400 mb-0.5">Lương mong muốn</p>
                    <p className="text-[10px] md:text-[11px] font-bold text-gray-700 truncate">{ad.expectedSalary}</p>
                  </div>

                  <div className="text-center px-1">
                    <p className="text-[8px] uppercase font-bold text-gray-400 mb-0.5">Khu vực</p>
                    <p className="text-[10px] md:text-[11px] font-bold text-gray-700 truncate">{ad.location}</p>
                  </div>
                  <div className="text-center px-1">
                    <p className="text-[8px] uppercase font-bold text-gray-400 mb-0.5">Lời mời</p>
                    <p className="text-[10px] md:text-[11px] font-bold text-gray-700">{count} lời mời</p>
                  </div>
                </div>
              </div>

              {/* Actions Group */}
              <div className="border-t border-gray-50 grid grid-cols-3 divide-x divide-gray-50">
                <button
                  onClick={() => handleToggleAdStatus(ad)}
                  className="py-2.5 text-[10px] font-bold text-gray-500 hover:bg-amber-50 hover:text-amber-600 transition-colors flex items-center justify-center gap-2"
                >
                  <i className={`fas ${ad.status === WorkerAdStatus.OPEN ? 'fa-pause' : 'fa-play'}`}></i>
                  {ad.status === WorkerAdStatus.OPEN ? 'Dừng' : 'Mở lại'}
                </button>
                <button
                  onClick={() => handleEdit(ad.id)}
                  className="py-2.5 text-[10px] font-bold text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
                >
                  <i className="fas fa-pen"></i>
                  Chỉnh sửa
                </button>
                <button
                  onClick={() => handleDelete(ad)}
                  className="py-2.5 text-[10px] font-bold text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center justify-center gap-2"
                >
                  <i className="fas fa-trash"></i>
                  Xóa bài
                </button>
              </div>

              {/* View Proposals CTA */}
              <div className="p-2 border-t border-gray-50 bg-gray-50/20">
                <button
                  onClick={() => handleViewDetailProposals(ad)}
                  className="w-full py-2 rounded-lg bg-white border border-gray-200 text-[#4c42bd] text-[11px] font-bold shadow-sm hover:ring-1 hover:ring-indigo-300 transition-all active:scale-[0.99]"
                >
                  Xem chi tiết các lời mời làm việc <i className="fas fa-chevron-right ml-1 text-[8px]"></i>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // --- VIEW: PROPOSALS DETAIL ---
  const renderProposalDetail = () => {
    const ad = activeAdForProposals;
    const adProposals = proposals.filter(p => p.adId === ad.id).sort((a, b) => new Date(b.sentAt || 0).getTime() - new Date(a.sentAt || 0).getTime());

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
              <h2 className="font-bold text-gray-900 text-sm">Lời mời làm việc</h2>
              <p className="text-[10px] text-gray-500">Bài đăng: <span className="text-[#4c42bd] font-bold">{ad.title}</span></p>
            </div>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto p-3 space-y-3 max-h-[600px]">
          {adProposals.length === 0 ? (
            <div className="text-center py-20 flex flex-col items-center">
              <i className="fas fa-envelope-open text-gray-200 text-5xl mb-3"></i>
              <p className="text-gray-400 text-xs font-medium">Chưa có công ty nào gửi lời mời cho bài đăng này.</p>
            </div>
          ) : (
            adProposals.map(p => (
              <div key={p.id} className="p-3 rounded-lg border border-gray-100 flex items-center gap-3 hover:border-indigo-200 hover:bg-indigo-50/20 transition-all group">
                <img
                  src={p.businessAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${p.businessName || 'Business'}`}
                  className="w-10 h-10 rounded-lg object-cover border border-indigo-100 shadow-sm"
                  alt="biz"
                />

                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-gray-900 truncate">{p.businessName}</h4>
                      {p.businessNumericId && (
                        <p className="text-[9px] text-[#4c42bd] font-bold">ID: {p.businessNumericId}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[8px] text-gray-400 font-bold">{p.sentAt ? new Date(p.sentAt).toLocaleString() : 'Vừa xong'}</span>
                      <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase border ${p.status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        p.status === 'REJECTED' ? 'bg-red-50 text-red-600 border-red-100' :
                          'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                        {p.status || 'PENDING'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-1.5 text-[10px] text-gray-500 bg-white/40 p-2 rounded border border-gray-50 italic">
                    "{p.message}"
                  </div>
                </div>
                {(p.status === 'PENDING' || !p.status) && (
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleProposalStatus(p.id, 'ACCEPTED')}
                      className="w-8 h-8 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-all flex items-center justify-center shadow-sm"
                    >
                      <i className="fas fa-check text-[10px]"></i>
                    </button>
                    <button
                      onClick={() => handleProposalStatus(p.id, 'REJECTED')}
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
            Quay về danh sách
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
              isWorker={true}
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
                      onClick={handleCreatePost}
                      className="flex-grow bg-[#F3F2EF] hover:bg-gray-200 text-gray-500 px-4 py-2.5 rounded-full text-left font-semibold text-xs transition-all shadow-inner"
                    >
                      Bạn đang tìm kiếm công việc gì?
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between px-2">
                  <div className="h-[1px] bg-gray-300 flex-grow"></div>
                  <span className="text-[9px] text-gray-400 px-3 font-black uppercase tracking-widest">
                    BÀI ĐĂNG CỦA TÔI
                  </span>
                  <div className="h-[1px] bg-gray-300 flex-grow"></div>
                </div>

                {renderFeed()}
              </>
            ) : (

              renderProposalDetail()
            )}
          </div>

          {/* === RIGHT SIDEBAR === */}
          <div className="md:col-span-3 space-y-3 hidden md:block">
            {/* Sync "Thông số nhanh" vibes */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Thông số nhanh</h3>
                <i className="fas fa-chart-line text-emerald-500 text-[10px]"></i>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <i className="fas fa-paper-plane text-xs"></i>
                  </div>
                  <div>
                    <p className="text-[9px] text-gray-500 font-bold uppercase">Tin đang tìm</p>
                    <p className="text-base font-black text-gray-900 leading-none">{myAds.length}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                    <i className="fas fa-envelope text-xs"></i>
                  </div>
                  <div>
                    <p className="text-[9px] text-gray-500 font-bold uppercase">Lời mời nhận được</p>
                    <p className="text-base font-black text-gray-900 leading-none">{proposals.length}</p>
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                <button className="w-full py-1.5 rounded-md bg-white border border-gray-200 text-[10px] font-bold text-[#4c42bd] hover:bg-indigo-50 transition-colors">
                  Xem lịch sử ứng tuyển
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <h3 className="text-xs font-bold text-gray-900 mb-3 flex items-center gap-2">
                <i className="fas fa-lightbulb text-amber-500 text-[10px]"></i>
                Mẹo cho bạn
              </h3>
              <div className="space-y-3">
                <div className="flex gap-2.5 items-start">
                  <div className="w-1 h-1 rounded-full bg-indigo-400 mt-1.5"></div>
                  <p className="text-[10px] text-gray-500 leading-relaxed italic">Hoàn thiện hồ sơ giúp bạn được ưu tiên đề xuất cho Nhà tuyển dụng.</p>
                </div>
                <div className="flex gap-2.5 items-start">
                  <div className="w-1 h-1 rounded-full bg-emerald-400 mt-1.5"></div>
                  <p className="text-[10px] text-gray-500 leading-relaxed italic">Tham gia các khóa đào tạo để nhận huy hiệu kỹ năng uy tín.</p>
                </div>
              </div>
            </div>

            <UserSuggestions title="Công ty có thể bạn quan tâm" type="COMPANY" limit={4} />

            <div className="text-center py-2">
              <p className="text-[9px] text-gray-400">© 2024 WorkConnect Worker Hub</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default WorkerManager;
