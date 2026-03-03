import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { UserRole } from '../types';
import Swal from 'sweetalert2';
import { useAuth } from '../contexts/AuthContext';
import { JobResponse, JobType } from '../apis/api_job';
import { WorkerPostResponse } from '../apis/api_work_session';
import { FollowedCompaniesContext } from './Companies'; // Adjust the path if necessary to point to the correct Companies.tsx location

import { mockWorkerSuggestions, mockCompanySuggestions } from '../mockData';
import userApi from '../apis/api_user';
import workerAdApi from '../apis/api_worker_ad';
import jobApi from '../apis/api_job';
import suggestionApi, { SuggestionDTO } from '../apis/api_suggestion';
import workSessionApi from '../apis/api_work_session';
import DetailedInfo from '../components/DetailedInfo';
import followApi from '../apis/api_follow';
import UserSuggestions from '../components/UserSuggestions';



// Mock jobs từ file trước


const formatTimeAgo = (date: string) => {
  const now = new Date();
  const posted = new Date(date);
  const diff = now.getTime() - posted.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days} ngày trước`;
  if (hours > 0) return `${hours} giờ trước`;
  return `${minutes} phút trước`;
};

const formatJobType = (type: JobType) => {
  switch (type) {
    case JobType.FULL_TIME: return 'Toàn thời gian';
    case JobType.PART_TIME: return 'Bán thời gian';
    case JobType.FREELANCE: return 'Freelance';
    case JobType.CONTRACT: return 'Hợp đồng';
    case JobType.INTERNSHIP: return 'Thực tập';
    default: return 'Khác';
  }
};

const FastProcessing: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { followedIds, followCompany, unfollowCompany } = useContext(FollowedCompaniesContext);

  const companyId = id || '0';

  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<JobResponse[]>([]);
  const [isBusiness, setIsBusiness] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(followedIds.includes(companyId));
  const [workHistory, setWorkHistory] = useState<any[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);


  useEffect(() => {
    // Update isFollowing when followedIds changes
    setIsFollowing(followedIds.includes(companyId));
  }, [followedIds, companyId]);

  useEffect(() => {
    if (authLoading || !id) return;

    const fetchProfileData = async () => {
      try {
        setLoading(true);
        let userData: any = null;
        let actualUserId = id;
        let actualIsBusiness = true;

        // 1. Try getting as User first
        try {
          userData = await userApi.getById(id!);
          if (userData) {
            actualUserId = userData.id;
            actualIsBusiness = userData.role === UserRole.BUSINESS;
            setIsBusiness(actualIsBusiness);
            setProfile({
              ...userData,
              name: userData.fullName || userData.name || userData.username,
              avatar: userData.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${userData.username}`,
              address: userData.location || 'N/A',
              description: userData.bio || userData.description || (actualIsBusiness ? 'Nhà tuyển dụng chưa có giới thiệu.' : 'Freelancer chưa có giới thiệu.'),
              verified: userData.verified || userData.idCardStatus === 'VERIFIED',
              numericId: userData.numericId
            });

            if (actualIsBusiness) {
              const jobsRes = await jobApi.getByBusiness(id!);
              if (jobsRes.success === 200) setPosts(jobsRes.data);
            }
          }
        } catch (e) {
          console.log("Not a direct user ID, checking WorkerAd...");
        }

        // 2. If not a direct user, try getting as WorkerAd
        if (!userData) {
          try {
            const ad = await workerAdApi.getById(id!);
            if (ad) {
              const workerUser = await userApi.getById(ad.workerId);
              actualUserId = workerUser.id;
              actualIsBusiness = false;
              setIsBusiness(false);
              setProfile({
                ...workerUser,
                name: workerUser.fullName || workerUser.name || workerUser.username,
                avatar: ad.avatar || workerUser.avatar,
                address: ad.location,
                description: ad.description || workerUser.bio,
                verified: ad.verified,
                numericId: workerUser.numericId
              });
            } else {
              setProfile(null);
            }
          } catch (e) {
            console.error("WorkerAd fetch failed:", e);
            setProfile(null);
          }
        }

        // 3. Fetch Work History using the actual user ID found
        if (actualUserId) {
          try {
            const sessionRes = !actualIsBusiness
              ? await workSessionApi.getByWorker(actualUserId)
              : await workSessionApi.getByBusiness(actualUserId);

            const apiSessions = Array.isArray(sessionRes.data) ? sessionRes.data : [];
            setWorkHistory(apiSessions.filter((item: any) => item.status === 'COMPLETED'));
          } catch (sessionErr) {
            console.error("Failed to fetch work history:", sessionErr);
            setWorkHistory([]);
          }
        }

        // 4. (Suggestions removed from local state, handled by component)

        // 5. Fetch Follow Stats
        try {
          const followers = await followApi.getFollowers(actualUserId);
          const following = await followApi.getFollowing(actualUserId);
          setFollowersCount(followers.length);
          setFollowingCount(following.length);
        } catch (e) {
          console.error("Failed to fetch follow stats:", e);
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [id, authLoading]);


  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><i className="fas fa-circle-notch fa-spin text-3xl text-[#4c42bd]"></i></div>;
  if (!profile) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-400 font-bold flex-col gap-4">
    <i className="fas fa-user-slash text-5xl opacity-20"></i>
    Không tìm thấy thông tin hồ sơ
  </div>;


  const toggleFollow = async () => {
    if (!user) return Swal.fire('Thông báo', 'Vui lòng đăng nhập để thực hiện hành động này', 'info');

    try {
      if (isFollowing) {
        await unfollowCompany(companyId);
        setFollowersCount(prev => Math.max(0, prev - 1));
        Swal.fire({ toast: true, position: 'top-end', icon: 'info', title: 'Đã hủy theo dõi', showConfirmButton: false, timer: 1500 });
      } else {
        await followCompany(companyId);
        setFollowersCount(prev => prev + 1);
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Đã theo dõi', showConfirmButton: false, timer: 1500 });
      }
    } catch (error) {
      console.error("Follow action failed:", error);
      Swal.fire('Lỗi', 'Không thể thực hiện hành động này', 'error');
    }
  };

  const handleViewJob = (job: JobResponse) => {
    navigate('/jobs', { state: { searchTerm: job.title, location: 'Tất cả địa điểm' } });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5 text-[10px]">
        {[1, 2, 3, 4, 5].map((star) => (
          <i key={star} className={`${star <= Math.round(rating) ? 'fas text-amber-600' : 'far text-gray-400'} fa-star`}></i>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-[#F3F2EF] min-h-screen py-6 font-sans">
      <div className="max-w-[1128px] mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT COLUMN (MAIN PROFILE) */}
          <div className="lg:col-span-9 space-y-4">

            {/* Profile Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-[#4c42bd] to-[#6a5acd] relative">
                <div className="absolute -bottom-16 left-4 w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-md p-1">
                  <img
                    src={profile.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.username || 'User'}`}
                    className="w-full h-full rounded-full object-cover border border-gray-100"
                    alt="avatar"
                  />
                </div>
              </div>
              <div className="pt-16 px-4 pb-4">
                <div className="ml-3">
                  <h1 className="text-2xl font-black text-gray-900 leading-tight">
                    {profile.fullName || profile.name || profile.username || 'Người dùng'}
                  </h1>
                  {profile.numericId && (
                    <p className="text-xs text-[#4c42bd] font-bold mt-1">ID: {profile.numericId}</p>
                  )}
                  <p className="text-sm text-gray-600 font-medium mt-1">
                    {profile.role === UserRole.BUSINESS ? (profile.industry || 'Nhà tuyển dụng') : (profile.title || profile.role || 'Thành viên')}
                    {profile.address && profile.address !== 'N/A' && ` • ${profile.address}`}
                  </p>
                  {profile.verified && (
                    <div className="flex items-center gap-1 mt-1">
                      <i className="fas fa-check-circle text-blue-500 text-xs"></i>
                      <span className="text-xs text-blue-500 font-medium">Đã xác thực</span>
                    </div>
                  )}
                </div>


                <div className="mt-4 flex justify-between items-center">
                  <div className="flex gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1 group cursor-pointer" title="Lượt theo dõi hồ sơ này">
                      <i className="fas fa-users text-[10px] text-gray-400 group-hover:text-[#4c42bd]"></i>
                      <span className="font-bold text-gray-700">{followersCount}</span>
                      <span className="text-gray-500">Người theo dõi</span>
                    </div>
                    <div className="flex items-center gap-1 group cursor-pointer" title="Hồ sơ này đang theo dõi">
                      <i className="fas fa-user-friends text-[10px] text-gray-400 group-hover:text-[#4c42bd]"></i>
                      <span className="font-bold text-gray-700">{followingCount}</span>
                      <span className="text-gray-500">Đang theo dõi</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {user && (
                      <button
                        onClick={toggleFollow}
                        className={`border rounded-full px-5 py-1.5 font-bold ${isFollowing ? 'border-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-[#4c42be] text-white hover:bg-[#004182]'
                          }`}
                      >
                        {isFollowing ? 'Đang theo dõi' : (isBusiness ? 'Theo dõi' : 'Theo dõi')}
                      </button>
                    )}
                    <button
                      onClick={() => navigate(`/messages/${profile.id}`)}
                      className="border border-[#4c42be] text-[#4c42be] px-5 py-1.5 rounded-full font-bold hover:bg-blue-50 transition-all"
                    >
                      Nhắn tin
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION THÔNG TIN CHI TIẾT */}
            <DetailedInfo
              profile={profile}
              isBusiness={isBusiness}
              showDetails={showDetails}
              onToggle={() => setShowDetails(!showDetails)}
            />

            {/* About Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-4">
              <h2 className="text-xl font-bold mb-3">Giới thiệu</h2>
              <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-line">
                {isBusiness ? profile.description : (profile.bio || profile.description)}
              </p>
            </div>

            {/* Experience / Jobs Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{isBusiness ? 'Vị trí đang tuyển' : 'Kinh nghiệm làm việc'}</h2>
              </div>

              <div className="space-y-6">
                {isBusiness ? (
                  posts.length > 0 ? (
                    posts.map((job: JobResponse) => {
                      const reqList = job.requirements ? job.requirements.split(',').map(r => r.trim()) : [];
                      return (
                        <div key={job.id} className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden">
                          <div className="p-4 flex items-start gap-4">
                            <img src={job.businessAvatar} className="w-12 h-12 rounded border border-gray-200 shrink-0" alt="Company Logo" />
                            <div className="flex-grow">
                              <span onClick={() => handleViewJob(job)} className="text-sm font-bold text-[#4c42bd] hover:underline cursor-pointer">{job.title}</span>
                              <p className="text-xs text-gray-700 mt-0.5">{job.businessName}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{job.location} • {formatJobType(job.type)}</p>
                              <p className="text-xs text-gray-400 mt-1">Đăng {formatTimeAgo(job.postedAt)}</p>
                              <div className="flex flex-wrap gap-2 mt-2 mb-3">
                                {reqList.slice(0, 3).map((tag, idx) => (
                                  <span key={idx} className="bg-gray-100 text-gray-600 text-[10px] font-semibold px-2 py-1 rounded-sm">
                                    {tag}
                                  </span>
                                ))}
                                {reqList.length > 3 && <span className="text-[10px] text-gray-400 self-center">+{reqList.length - 3}</span>}
                              </div>
                            </div>
                            {job.businessRating && job.businessRating > 0 && (
                              <div className="flex items-center gap-1 text-xs bg-amber-50 px-2 py-1 rounded border border-amber-100" title="Điểm uy tín Nhà tuyển dụng">
                                <span className="font-bold text-amber-700">{job.businessRating.toFixed(1)}</span>
                                <i className="fas fa-star text-amber-500 text-[10px]"></i>
                              </div>
                            )}
                          </div>
                          <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-end gap-4">
                            {user?.role !== UserRole.BUSINESS && (
                              <button
                                onClick={() => handleViewJob(job)}
                                className="text-xs font-bold px-4 py-1.5 rounded-full border border-[#4c42bd] text-[#4c42bd] hover:bg-[#4c42bd] hover:text-white cursor-pointer"
                              >
                                Xem
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-300 border-dashed shadow-sm">
                      <i className="fas fa-briefcase text-gray-300 text-4xl mb-3"></i>
                      <p className="text-base text-gray-700 font-medium mb-2">Chưa có vị trí tuyển dụng nào</p>
                      <p className="text-xs text-gray-500 mb-4">Nhà tuyển dụng chưa đăng tuyển vị trí nào</p>
                    </div>
                  )
                ) : (
                  workHistory.length > 0 ? (
                    <div className="space-y-6">
                      {workHistory.map((job, index) => (
                        <div key={index} className="flex gap-4 group">
                          <div className="w-12 h-12 bg-white border border-gray-200 rounded p-1 shrink-0 shadow-sm overflow-hidden">
                            <img
                              src={(isBusiness ? job.workerAvatar : job.businessAvatar) || `https://api.dicebear.com/7.x/initials/svg?seed=${isBusiness ? job.workerName : job.businessName}`}
                              className="w-full h-full object-cover"
                              alt="Partner"
                              onError={(e) => { (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${isBusiness ? job.workerName : job.businessName}`; }}
                            />
                          </div>
                          <div className="flex-grow border-b border-gray-100 pb-4 group-last:border-0">
                            <h3 className="text-sm font-bold text-gray-900 hover:text-[#4c42bd] transition-colors cursor-pointer">{job.jobTitle}</h3>
                            <p className="text-xs text-gray-800">
                              {isBusiness ? job.workerName : job.businessName}
                              <span className="text-gray-500 font-normal"> · Toàn thời gian</span>
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {new Date(job.createdAt).toLocaleDateString()} - Hiện tại · Hà Nội
                            </p>

                            <div className="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-100 relative">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[11px] font-bold text-gray-600 uppercase tracking-tight">Phản hồi từ đối tác:</span>
                                {renderStars(isBusiness ? job.businessRating : job.workerRating)}
                              </div>
                              <p className="text-xs text-gray-700 italic leading-relaxed">
                                "{isBusiness ? job.businessComment : job.workerComment}"
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-300 border-dashed shadow-sm">
                      <i className="fas fa-briefcase text-gray-300 text-4xl mb-3"></i>
                      <p className="text-base text-gray-700 font-medium mb-2">Chưa có kinh nghiệm ghi nhận</p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (SIDEBAR) */}
          <div className="lg:col-span-3 space-y-4">
            {/* Language/URL Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm divide-y divide-gray-100">
              <div className="pb-3 flex justify-between items-center">
                <span className="text-sm font-bold">Ngôn ngữ hồ sơ</span>
                <span className="text-xs text-gray-500 font-bold">Tiếng Việt</span>
              </div>
              <div className="pt-3 flex justify-between items-center">
                <span className="text-sm font-bold">URL công khai</span>
                <span className="text-[10px] text-blue-600 hover:underline cursor-pointer truncate ml-4" onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  Swal.fire({
                    icon: 'success',
                    title: 'Đã sao chép',
                    text: 'Đã sao chép liên kết vào bộ nhớ tạm',
                    timer: 1000,
                    showConfirmButton: false
                  });
                }}>
                  workconnect.vn/profile/{profile.username || id}
                </span>
              </div>

            </div>

            {/* People also viewed */}
            <UserSuggestions
              title={isBusiness ? 'Nhà tuyển dụng tương tự' : 'Các hồ sơ gợi ý'}
              limit={5}
              excludeId={id}
              type={isBusiness ? 'COMPANY' : 'USER'}
              context={{ viewerIndustry: profile.industry || profile.description }}
            />

            {/* Footer mini */}
            <div className="text-center px-4 sticky top-6">
              <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-gray-500">
                <span className="hover:underline cursor-pointer">Giới thiệu</span>
                <span className="hover:underline cursor-pointer">Trợ giúp</span>
                <span className="hover:underline cursor-pointer">Quyền riêng tư</span>
              </div>
              <p className="text-xs mt-3">WorkConnect © 2024</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FastProcessing;