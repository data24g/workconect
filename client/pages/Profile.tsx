import React, { useEffect, useState, useContext } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole, User } from '../types';
import axios from 'axios';
import Swal from 'sweetalert2';
import workSessionApi from '../apis/api_work_session';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { mockFollowers, mockUsers } from '../mockData';
import { FollowedCompaniesContext } from './Companies';
import UserSuggestions from '../components/UserSuggestions';
import userApi from '../apis/api_user';
import followApi from '../apis/api_follow';
import DetailedInfo from '../components/DetailedInfo';


// Redundant MOCK_FOLLOWERS removed as it is now imported from mockData

const Profile: React.FC = () => {
    const { user: currentUser, updateUser } = useAuth();
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();

    const [profileUser, setProfileUser] = useState<User | null>(null);
    const [workHistory, setWorkHistory] = useState<any[]>([]);
    const [followersList, setFollowersList] = useState<User[]>([]);
    const [followingList, setFollowingList] = useState<User[]>([]);
    const { followedIds, followCompany, unfollowCompany, allCompanies } = useContext(FollowedCompaniesContext);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [modalTab, setModalTab] = useState<'following' | 'followers'>('following');
    const [isLoading, setIsLoading] = useState(true);
    const [showDetails, setShowDetails] = useState(false);


    const isOwnProfile = !userId || userId === currentUser?.id;
    const isWorker = profileUser?.role === UserRole.WORKER;
    const isBusiness = profileUser?.role === UserRole.BUSINESS;
    const isEnterprise = 'accountType' in (profileUser ?? {}) ? (profileUser as any).accountType === 'enterprise' : false;

    // Tính toán mức độ hoàn thiện hồ sơ (Cập nhật logic dựa trên xác thực mới)
    const profileCompletion = calculateProfileCompletion(profileUser);

    // Giả sử token lưu trong localStorage sau login
    const token = localStorage.getItem('token');

    // Education Modal State
    const [isEducationModalOpen, setIsEducationModalOpen] = useState(false);
    const [educationForm, setEducationForm] = useState({ school: '', degree: '', startYear: '', endYear: '' });

    // Skill Modal State
    const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
    const [skillForm, setSkillForm] = useState({ name: '', image: '' }); // Image in Base64

    // --- LẤY DỮ LIỆU TỰ ĐỘNG KHI CÓ THAY ĐỔI FOLLOW ---
    useEffect(() => {
        const refreshFollowStats = async () => {
            if (userId || currentUser?.id) {
                const targetId = userId || currentUser?.id;
                try {
                    const [userRes, followersRes, followingRes] = await Promise.all([
                        userApi.getById(targetId!),
                        followApi.getFollowers(targetId!),
                        followApi.getFollowing(targetId!)
                    ]);

                    if (userRes) setProfileUser(userRes);
                    setFollowersList(followersRes || []);
                    setFollowingList(followingRes || []);
                } catch (error) {
                    console.error("Failed to refresh follow stats:", error);
                }
            }
        };
        refreshFollowStats();
    }, [followedIds, userId, currentUser?.id, profileUser?.id]);

    // --- LẤY DỮ LIỆU TỪ API HOẶC MOCK DATA ---
    useEffect(() => {
        const fetchProfileData = async () => {
            const targetId = userId || currentUser?.id;
            if (!targetId) return;

            setIsLoading(true);
            try {
                // 1. Fetch User Profile
                // const res = await axios.get(`https://apituyendung.deepcode.vn/api/users/${targetId}`);
                const res = await axios.get(`https://apituyendung.deepcode.vn/api/users/${targetId}`);
                const userToSet = res.data;
                setProfileUser(userToSet);


                if (userToSet) {
                    // 2. Fetch Work History
                    const sessionRes = await (userToSet.role === UserRole.WORKER
                        ? workSessionApi.getByWorker(targetId)
                        : workSessionApi.getByBusiness(targetId));

                    const apiSessions = Array.isArray(sessionRes.data) ? sessionRes.data : [];
                    setWorkHistory(apiSessions.filter((item: any) => item.status === 'COMPLETED'));
                }
            } catch (error) {
                console.error("Failed to fetch profile data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfileData();
    }, [userId, currentUser, navigate]);

    if (!profileUser) return null;

    // --- HELPER: CHUYỂN FILE SANG BASE64 ---
    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    // --- HELPER: TÍNH TOÁN PROFILE COMPLETION (Dựa trên xác thực mới) ---
    function calculateProfileCompletion(user: User | null): number {
        if (!user) return 0;
        let completion = 0;
        if ('emailVerified' in user && (user as any).emailVerified) completion += 20;
        if ('phoneVerified' in user && (user as any).phoneVerified) completion += 20;
        if ('idCardVerified' in user && (user as any).idCardVerified) completion += 20;
        if (user.bio) completion += 10;
        if (user.avatar) completion += 10;
        if (user.role === UserRole.BUSINESS) {
            if ('accountType' in user && (user as any).accountType === 'enterprise') {
                if ('companyName' in user && (user as any).companyName) completion += 10;
                if ('taxCode' in user && (user as any).taxCode) completion += 10;
                if ('businessRegistrationCode' in user && (user as any).businessRegistrationCode) completion += 10;
                if ('legalRepresentative' in user && (user as any).legalRepresentative) completion += 10;
            } else {
                if ('socialLinks' in user && (user as any).socialLinks?.length) completion += 5;
                if ('depositVerified' in user && (user as any).depositVerified) completion += 5;
            }
        } else {
            completion += 10; // Worker thêm điểm cơ bản
        }
        return Math.min(completion, 100);
    }

    // --- LOGIC EDIT PROFILE ---
    const handleEditProfile = () => {
        if (!isOwnProfile) return;
        navigate('/edit-profile');
    };

    // --- LOGIC XÁC THỰC MỚI (CCCD, SĐT, EMAIL CHO CẢ 2 ROLE) ---
    // --- LOGIC XÁC THỰC MỚI (CCCD, SĐT, EMAIL CHO CẢ 2 ROLE) ---
    const handleVerifyIdentity = () => {
        if (!isOwnProfile) return;
        navigate('/verification');
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
        <div className="bg-[#F4F2EE] min-h-screen py-4 font-sans text-sm text-[#191919]">
            <div className="max-w-[1128px] mx-auto px-0 sm:px-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

                    {/* === LEFT COLUMN === */}
                    <div className="lg:col-span-9 space-y-2">

                        {/* 1. IDENTITY CARD */}
                        <div className="bg-white rounded-lg border border-gray-300 relative overflow-hidden mb-2 shadow-sm">
                            <div className="h-32 md:h-44 w-full bg-[#A0B4B7] relative">
                                {profileUser.coverPhoto ? (
                                    <img src={profileUser.coverPhoto} className="w-full h-full object-cover" alt="Cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-r from-indigo-100 to-blue-200"></div>
                                )}
                                {isOwnProfile && (
                                    <button onClick={handleEditProfile} className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#4c42bd] hover:bg-gray-50 transition-colors shadow-sm">
                                        <i className="fas fa-camera text-sm"></i>
                                    </button>
                                )}
                            </div>
                            <div className="px-5 pb-5 relative">
                                <div className="absolute -top-12 md:-top-16 left-5">
                                    <div className={`w-24 h-24 md:w-32 md:h-32 rounded-full border-[4px] border-white bg-white relative group ${isOwnProfile ? 'cursor-pointer' : ''}`}>
                                        <img
                                            src={profileUser?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${profileUser?.username}`}
                                            className="w-full h-full rounded-full object-cover"
                                            alt="Avatar"
                                            {...(isOwnProfile ? { onClick: handleEditProfile } : {})}
                                        />
                                        {isOwnProfile && (
                                            <div onClick={handleEditProfile} className="absolute inset-0 bg-black/10 rounded-full opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                                <i className="fas fa-camera text-white text-xl"></i>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end pt-3 min-h-[44px]">
                                    {isOwnProfile && (
                                        <button onClick={handleEditProfile} className="w-8 h-8 hover:bg-gray-100 rounded-full flex items-center justify-center text-gray-600 transition-colors">
                                            <i className="fas fa-pen text-sm"></i>
                                        </button>
                                    )}
                                </div>

                                <div className="mt-6 md:mt-8 flex flex-col md:flex-row justify-between items-start">
                                    <div className="w-full md:max-w-[75%]">
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h1 className="text-xl font-bold text-gray-900 leading-tight">
                                                    {profileUser.fullName || profileUser.name || profileUser.username || 'Người dùng'}
                                                </h1>
                                                {profileUser.verified ? (
                                                    <span className="bg-blue-50 text-[#4c42bd] text-[10px] px-1.5 py-0.5 rounded border border-blue-200 flex items-center gap-1 font-bold">
                                                        <i className="fas fa-check-circle"></i> Đã xác thực
                                                    </span>
                                                ) : (profileUser as any).verificationStatus === 'PENDING' ? (
                                                    <span className="bg-amber-50 text-amber-600 text-[10px] px-1.5 py-0.5 rounded border border-amber-200 flex items-center gap-1 font-bold">
                                                        <i className="fas fa-clock"></i> Đang chờ xác thực
                                                    </span>
                                                ) : (profileUser as any).verificationStatus === 'REJECTED' ? (
                                                    <span className="bg-red-50 text-red-600 text-[10px] px-1.5 py-0.5 rounded border border-red-200 flex items-center gap-1 font-bold">
                                                        <i className="fas fa-times-circle"></i> Xác thực bị từ chối
                                                    </span>
                                                ) : null}
                                            </div>
                                            {profileUser.numericId && (
                                                <p className="text-xs text-[#4c42bd] font-bold mt-1">ID: {profileUser.numericId}</p>
                                            )}
                                        </div>

                                        <p className="text-sm text-gray-900 mt-1 font-semibold">
                                            {profileUser.title || (profileUser.role === UserRole.BUSINESS ? (profileUser.industry || 'Nhà tuyển dụng') : 'Chuyên gia tự do')}
                                        </p>

                                        {profileUser.bio && (
                                            <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                                                {profileUser.bio}
                                            </p>
                                        )}

                                        <div className="flex gap-4 mt-3 pb-2">
                                            <button
                                                onClick={() => { setModalTab('following'); setIsModalOpen(true); }}
                                                className="hover:underline flex gap-1 items-center"
                                            >
                                                <span className="font-bold text-sm text-gray-900">{followingList.length}</span>
                                                <span className="text-gray-500 text-sm">Đang theo dõi</span>
                                            </button>

                                            <button
                                                onClick={() => { setModalTab('followers'); setIsModalOpen(true); }}
                                                className="hover:underline flex gap-1 items-center"
                                            >
                                                <span className="font-bold text-sm text-gray-900">{followersList.length}</span>
                                                <span className="text-gray-500 text-sm">Người theo dõi</span>
                                            </button>
                                        </div>

                                        <div className="text-xs text-gray-500 mt-1 flex flex-wrap items-center gap-1">
                                            <i className="fas fa-map-marker-alt text-gray-400"></i>
                                            <span className="font-medium">{profileUser.location || 'Chưa cập nhật địa điểm'}</span>
                                            <span className="text-[#4c42bd] font-bold cursor-pointer hover:underline border-l border-gray-300 ml-2 pl-2">Thông tin liên hệ</span>
                                        </div>
                                        <div className="mt-2 flex items-center gap-1.5 text-[#4c42bd] font-bold text-xs">
                                            <span className="text-amber-600">{profileUser.rating?.toFixed(1) || '0.0'}</span>
                                            {renderStars(profileUser.rating || 0)}
                                            <span className="hover:underline cursor-pointer">({profileUser.ratingCount || 0} đánh giá)</span>
                                        </div>
                                    </div>
                                    <div className="hidden sm:flex items-center gap-2 mt-1">
                                        <div className="w-8 h-8 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                                            <i className="fas fa-building text-gray-500 text-xs"></i>
                                        </div>
                                        <span className="text-sm font-semibold text-gray-900 hover:underline cursor-pointer">WorkConnect</span>
                                    </div>
                                </div>

                                {isOwnProfile ? (
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        <button className="px-5 py-1.5 bg-[#4c42bd] text-white font-bold text-sm rounded-full hover:bg-[#3a32a0] transition-colors shadow-md">Sẵn sàng làm việc</button>
                                        <button className="px-5 py-1.5 border-2 border-[#4c42bd] text-[#4c42bd] font-bold text-sm rounded-full hover:bg-[#4c42bd]/10 transition-colors">Thêm mục hồ sơ</button>
                                        <button className="px-4 py-1.5 border border-gray-500 text-gray-600 font-bold text-sm rounded-full hover:bg-gray-100 transition-colors">Khác</button>
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        <button
                                            onClick={() => followedIds.includes(profileUser.id) ? unfollowCompany(profileUser.id) : followCompany(profileUser.id)}
                                            className={`px-6 py-1.5 rounded-full font-bold text-sm transition-all shadow-md flex items-center gap-2 ${followedIds.includes(profileUser.id)
                                                ? 'bg-gray-100 text-gray-500 border border-gray-300 hover:bg-gray-200'
                                                : 'bg-[#4c42bd] text-white hover:bg-[#3a32a0]'
                                                }`}
                                        >
                                            <i className={`fas ${followedIds.includes(profileUser.id) ? 'fa-check' : 'fa-user-plus'}`}></i>
                                            {followedIds.includes(profileUser.id) ? 'Đang theo dõi' : 'Theo dõi'}
                                        </button>
                                        <button className="px-6 py-1.5 border-2 border-[#4c42bd] text-[#4c42bd] font-bold text-sm rounded-full hover:bg-blue-50 transition-colors flex items-center gap-2">
                                            <i className="fas fa-paper-plane"></i> Nhắn tin
                                        </button>
                                        <button className="px-4 py-1.5 border border-gray-500 text-gray-600 font-bold text-sm rounded-full hover:bg-gray-100 transition-colors">Xem thêm</button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* SECTION THÔNG TIN CHI TIẾT */}
                        <DetailedInfo
                            profile={profileUser}
                            isBusiness={isBusiness}
                            showDetails={showDetails}
                            onToggle={() => setShowDetails(!showDetails)}
                        />



                        {/* SECTION XÁC THỰC (Cho cả Worker và Business chưa verify) */}
                        {isOwnProfile && !profileUser.verified && (
                            <div className="bg-gradient-to-r from-[#4c42bd]/5 to-transparent rounded-lg border border-[#4c42bd]/20 p-5 mb-2 shadow-sm border-l-4 border-l-[#4c42bd]">
                                <h2 className="text-lg font-bold text-gray-900 mb-1">
                                    {(profileUser as any).verificationStatus === 'PENDING' ? 'Hồ sơ đang được xem xét' :
                                        (profileUser as any).verificationStatus === 'REJECTED' ? 'Xác thực lại tài khoản' : 'Xác thực tài khoản ngay'}
                                </h2>
                                <p className="text-sm text-gray-600 mb-4">
                                    {(profileUser as any).verificationStatus === 'PENDING' ? 'Chúng tôi đang kiểm tra thông tin của bạn. Việc này thường mất 24-48h.' :
                                        (profileUser as any).verificationStatus === 'REJECTED' ? 'Yêu cầu trước đó bị từ chối. Vui lòng cập nhật đầy đủ thông tin.' :
                                            'Hồ sơ đã xác thực nhận được nhiều lời mời làm việc hơn 40%.'}
                                </p>
                                {(profileUser as any).verificationStatus !== 'PENDING' && (
                                    <button
                                        onClick={handleVerifyIdentity}
                                        className="px-6 py-2 bg-[#4c42bd] text-white font-bold rounded-full text-sm hover:bg-[#3a32a0] transition-transform active:scale-95 shadow-md flex items-center gap-2"
                                    >
                                        <i className="fas fa-user-shield"></i> {(profileUser as any).verificationStatus === 'REJECTED' ? 'Thử lại' : 'Bắt đầu xác thực'}
                                    </button>
                                )}
                            </div>
                        )}

                        {/* SECTION GIỚI THIỆU (ABOUT) */}
                        <div className="bg-white rounded-lg border border-gray-300 p-5 mb-2 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-900">Giới thiệu</h2>
                                {isOwnProfile && (
                                    <button onClick={handleEditProfile} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors">
                                        <i className="fas fa-pen text-sm"></i>
                                    </button>
                                )}
                            </div>
                            <div className="text-sm text-gray-800 space-y-3 leading-relaxed">
                                {profileUser.description ? (
                                    <div className="whitespace-pre-line">
                                        {profileUser.description}
                                    </div>
                                ) : (
                                    <div className="py-4 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                        <p className="text-gray-500 mb-2">Bạn chưa thêm mô tả chi tiết về bản thân/Nhà tuyển dụng.</p>
                                        {isOwnProfile && (
                                            <button onClick={handleEditProfile} className="text-[#4c42bd] font-bold hover:underline">Thêm giới thiệu ngay</button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 2. SUGGESTED (LEVEL BAR TỰ ĐỘNG) */}
                        {isOwnProfile && (
                            <div className="bg-white rounded-lg border border-gray-300 p-5 mb-2 shadow-sm">
                                <h2 className="text-lg font-bold text-gray-900 mb-1">Gợi ý cho bạn</h2>
                                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                                    <i className="fas fa-eye-slash"></i>
                                    <span>Chỉ mình bạn thấy</span>
                                </div>

                                <div className="mb-4">
                                    <div className="flex items-center justify-between text-xs font-semibold text-gray-700 mb-1">
                                        <span>Mức độ hoàn thiện: {profileCompletion >= 80 ? 'Chuyên nghiệp' : 'Trung cấp'}</span>
                                        <span>{Math.floor(profileCompletion / 10)}/10 bước</span>
                                    </div>
                                    <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                                        <div
                                            className="bg-[#4c42bd] h-full transition-all duration-1000 ease-out rounded-full"
                                            style={{ width: `${profileCompletion}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {!profileUser.verified && (
                                        <div onClick={handleVerifyIdentity} className="border border-gray-200 rounded-lg p-3 flex gap-3 cursor-pointer hover:bg-gray-50 transition-colors">
                                            <div className="w-10 h-10 bg-blue-50 rounded flex items-center justify-center text-[#4c42bd]"><i className="fas fa-id-card"></i></div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">Xác thực danh tính</p>
                                                <p className="text-xs text-gray-500">Tăng uy tín trong mắt khách hàng</p>
                                            </div>
                                        </div>
                                    )}
                                    {!isBusiness && (
                                        <div className="border border-gray-200 rounded-lg p-3 flex gap-3 cursor-pointer hover:bg-gray-50 transition-colors">
                                            <div className="w-10 h-10 bg-gray-50 rounded flex items-center justify-center text-gray-500"><i className="fas fa-briefcase"></i></div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">Thêm kinh nghiệm</p>
                                                <p className="text-xs text-gray-500">Thu hút nhiều cơ hội mới</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 4. RESOURCES */}
                        <div className="bg-white rounded-lg border border-gray-300 p-5 mb-2 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-900 mb-1">Tài nguyên</h2>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                                <i className="fas fa-eye-slash"></i>
                                <span>Riêng tư với bạn</span>
                            </div>
                            <div className="space-y-4">
                                <div className="flex gap-3 border-b border-gray-100 pb-3 cursor-pointer hover:bg-gray-50 -mx-2 px-2 rounded">
                                    <i className="fas fa-satellite-dish text-gray-800 mt-1"></i>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 flex items-center gap-1">
                                            Chế độ nhà sáng tạo <span className="bg-green-100 text-green-700 text-[10px] px-1 rounded uppercase">Off</span>
                                        </p>
                                        <p className="text-xs text-gray-500">Được phát hiện, hiển thị nội dung trên hồ sơ của bạn và quyền truy cập vào các công cụ sáng tạo.</p>
                                    </div>
                                </div>
                                <div className="flex gap-3 cursor-pointer hover:bg-gray-50 -mx-2 px-2 rounded">
                                    <i className="fas fa-user-friends text-gray-800 mt-1"></i>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Mạng lưới của tôi</p>
                                        <p className="text-xs text-gray-500">Xem và quản lý các kết nối và sở thích của bạn.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-3 pt-2 border-t border-gray-100 text-center">
                                <button className="text-sm font-bold text-gray-600 hover:text-gray-900 flex items-center justify-center gap-1 w-full py-1">
                                    Hiển thị tất cả tài nguyên (5) <i className="fas fa-arrow-right"></i>
                                </button>
                            </div>
                        </div>

                        {/* 5. FOLLOWED COMPANIES (Mới thêm) */}
                        {isOwnProfile && (
                            <div className="bg-white rounded-lg border border-gray-300 p-5 mb-2 shadow-sm">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Đang theo dõi</h2>
                                {followedIds.length === 0 ? (
                                    <div className="text-center py-4">
                                        <p className="text-sm text-gray-500 mb-2">Bạn chưa theo dõi công ty nào.</p>
                                        <button
                                            onClick={() => navigate('/companies')}
                                            className="px-4 py-1 border border-[#4c42bd] text-[#4c42bd] rounded-full text-sm font-bold hover:bg-blue-50"
                                        >
                                            Khám phá công ty
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                                        {followingList.map((followedUser) => (
                                            <div
                                                key={followedUser.id}
                                                className="border border-gray-200 rounded-lg p-3 flex gap-3 items-center hover:bg-gray-50 transition-colors cursor-pointer"
                                                onClick={() => navigate(`/fast-processing/${followedUser.id}`)}
                                            >
                                                <img
                                                    src={followedUser.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${followedUser.name}`}
                                                    alt={followedUser.fullName || followedUser.name || 'User'}
                                                    className="w-10 h-10 rounded object-contain border border-gray-200"
                                                />
                                                <div className="min-w-0 flex-grow">
                                                    <p className="text-sm font-bold text-gray-900 hover:underline truncate">{followedUser.fullName || followedUser.name || 'Người dùng'}</p>
                                                    <p className="text-xs text-gray-500 truncate">
                                                        {followedUser.role === UserRole.BUSINESS ? (followedUser.industry || 'Nhà tuyển dụng') : (followedUser.role)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="mt-4 pt-2 border-t border-gray-100 text-center">
                                    <button
                                        onClick={() => navigate('/companies')}
                                        className="text-sm font-bold text-gray-600 hover:text-gray-900 flex items-center justify-center gap-1 w-full py-1"
                                    >
                                        Xem thêm công ty <i className="fas fa-arrow-right"></i>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* 6. EXPERIENCE */}
                        <div className="bg-white rounded-lg border border-gray-300 p-5 mb-2 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-900">{isBusiness ? 'Lịch sử đánh giá nhà tuyển dụng' : 'Kinh nghiệm làm việc'}</h2>
                                {isOwnProfile && (<div className="flex gap-3 text-gray-500">
                                    <i className="fas fa-plus cursor-pointer hover:bg-gray-100 p-2 rounded-full transition-colors"></i>
                                    <i className="fas fa-pen cursor-pointer hover:bg-gray-100 p-2 rounded-full transition-colors"></i>
                                </div>)}
                            </div>

                            {workHistory.length === 0 ? (
                                <div className="flex gap-3 items-center p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-200 shadow-sm">
                                        <i className="fas fa-briefcase text-gray-400"></i>
                                    </div>
                                    <p className="text-sm text-gray-500">Chưa có lịch sử làm việc được ghi nhận.</p>
                                </div>
                            ) : (
                                <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {workHistory.map((job, index) => {
                                        return (
                                            <div key={index} className="flex gap-4 group">
                                                <div className="w-12 h-12 bg-white border border-gray-200 rounded p-1 shrink-0 shadow-sm overflow-hidden">
                                                    <img
                                                        src={(profileUser.role === UserRole.WORKER ? job.businessAvatar : job.workerAvatar) || `https://api.dicebear.com/7.x/initials/svg?seed=${profileUser.role === UserRole.WORKER ? job.businessName : job.workerName}`}
                                                        className="w-full h-full object-cover"
                                                        alt="Partner"
                                                        onError={(e) => { (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${profileUser.role === UserRole.WORKER ? job.businessName : job.workerName}`; }}
                                                    />
                                                </div>
                                                <div className="flex-grow border-b border-gray-100 pb-4 group-last:border-0">
                                                    <h3 className="text-sm font-bold text-gray-900 hover:text-[#4c42bd] transition-colors cursor-pointer">{job.jobTitle}</h3>
                                                    <p className="text-xs text-gray-800">
                                                        {profileUser.role === UserRole.WORKER ? job.businessName : job.workerName}
                                                        <span className="text-gray-500 font-normal"> · Toàn thời gian</span>
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        {new Date(job.createdAt).toLocaleDateString()} - Hiện tại · Hà Nội
                                                    </p>

                                                    <div className="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-100 relative">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-[11px] font-bold text-gray-600 uppercase tracking-tight">Phản hồi từ đối tác:</span>
                                                            {renderStars(profileUser.role === UserRole.WORKER ? job.workerRating : job.businessRating)}
                                                        </div>
                                                        <p className="text-xs text-gray-700 italic leading-relaxed">
                                                            "{profileUser.role === UserRole.WORKER ? job.workerComment : job.businessComment}"
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* 7. EDUCATION */}
                        {!isBusiness && (
                            <div className="bg-white rounded-lg border border-gray-300 p-5 mb-2 shadow-sm">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold text-gray-900">Học vấn</h2>
                                    {isOwnProfile && (
                                        <div className="flex gap-3 text-gray-500">
                                            <i
                                                className="fas fa-plus cursor-pointer hover:bg-gray-100 p-2 rounded-full"
                                                onClick={() => {
                                                    setEducationForm({ school: '', degree: '', startYear: '', endYear: '' });
                                                    setIsEducationModalOpen(true);
                                                }}
                                            ></i>
                                        </div>
                                    )}
                                </div>

                                {(() => {
                                    let eduList: any[] = [];
                                    try {
                                        if (profileUser.education) {
                                            if (profileUser.education.startsWith('[')) {
                                                eduList = JSON.parse(profileUser.education);
                                            } else {
                                                eduList = [{ school: profileUser.education }];
                                            }
                                        }
                                    } catch (e) {
                                        eduList = profileUser.education ? [{ school: profileUser.education }] : [];
                                    }

                                    if (eduList.length === 0) {
                                        return <p className="text-sm text-gray-500">Chưa có thông tin học vấn.</p>;
                                    }

                                    return (
                                        <div className="space-y-4">
                                            {eduList.map((edu, idx) => (
                                                <div key={idx} className="flex gap-4 group relative">
                                                    <div className="w-12 h-12 bg-gray-50 border border-gray-200 rounded flex items-center justify-center shrink-0">
                                                        <i className="fas fa-university text-gray-400 text-xl"></i>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-bold text-gray-900">{edu.school || "Trường học"}</h3>
                                                        <p className="text-xs text-gray-900">{edu.degree || ""}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {edu.startYear ? `${edu.startYear} - ${edu.endYear || 'Hiện tại'}` : ''}
                                                        </p>
                                                    </div>
                                                    {isOwnProfile && (
                                                        <button
                                                            className="absolute right-0 top-0 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={async () => {
                                                                // Delete logic
                                                                const newList = eduList.filter((_, i) => i !== idx);
                                                                try {
                                                                    await userApi.update(profileUser.id, { education: JSON.stringify(newList) });
                                                                    setProfileUser({ ...profileUser, education: JSON.stringify(newList) });
                                                                    Swal.fire({ toast: true, position: 'bottom-start', icon: 'success', title: 'Đã xóa', showConfirmButton: false, timer: 1500 });
                                                                } catch (e) {
                                                                    console.error(e);
                                                                }
                                                            }}
                                                        >
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })()}
                            </div>
                        )}

                        {/* 8. SKILLS */}
                        {!isBusiness && (
                            <div className="bg-white rounded-lg border border-gray-300 p-5 mb-2 shadow-sm">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold text-gray-900">Kỹ năng & Chứng chỉ</h2>
                                    {isOwnProfile && (
                                        <div className="flex gap-3 text-gray-500 items-center">
                                            <i
                                                className="fas fa-plus cursor-pointer hover:bg-gray-100 p-2 rounded-full"
                                                onClick={() => {
                                                    setSkillForm({ name: '', image: '' });
                                                    setIsSkillModalOpen(true);
                                                }}
                                            ></i>
                                        </div>
                                    )}
                                </div>

                                {(() => {
                                    let certs: any[] = [];
                                    try {
                                        if (profileUser.certifications) {
                                            certs = JSON.parse(profileUser.certifications);
                                        } else if (profileUser.skills && profileUser.skills.length > 0) {
                                            // Fallback for legacy skills
                                            certs = profileUser.skills.map((s: string) => ({ name: s, image: '' }));
                                        }
                                    } catch {
                                        certs = [];
                                    }

                                    if (certs.length === 0) {
                                        return (
                                            <div className="text-center py-4">
                                                <p className="text-sm text-gray-500 mb-2">Chưa thêm kỹ năng.</p>
                                                {isOwnProfile && <button onClick={() => setIsSkillModalOpen(true)} className="px-4 py-1 border border-gray-500 rounded-full text-sm font-bold text-gray-600 hover:bg-gray-50">Thêm ngay</button>}
                                            </div>
                                        );
                                    }

                                    return (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {certs.map((cert, idx) => (
                                                <div key={idx} className="flex items-start gap-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 group">
                                                    <div
                                                        className="w-16 h-12 bg-gray-100 rounded overflow-hidden cursor-pointer border border-gray-200 shrink-0 relative"
                                                        onClick={() => {
                                                            if (cert.image) {
                                                                Swal.fire({
                                                                    imageUrl: cert.image,
                                                                    imageAlt: cert.name,
                                                                    showConfirmButton: false,
                                                                    showCloseButton: true,
                                                                    width: 'auto'
                                                                });
                                                            }
                                                        }}
                                                    >
                                                        {cert.image ? (
                                                            <img src={cert.image} className="w-full h-full object-cover" alt={cert.name} />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                                <i className="fas fa-certificate"></i>
                                                            </div>
                                                        )}
                                                        {cert.image && (
                                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                                <i className="fas fa-eye text-white text-xs"></i>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-grow min-w-0">
                                                        <h4 className="font-bold text-gray-900 text-sm truncate" title={cert.name}>{cert.name}</h4>
                                                        <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                                                            {cert.image ? <><i className="fas fa-check-circle"></i> Đã xác thực</> : <span className="text-gray-400 italic">Chưa xác thực</span>}
                                                        </p>
                                                    </div>
                                                    {isOwnProfile && (
                                                        <button
                                                            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={async () => {
                                                                const newCerts = certs.filter((_, i) => i !== idx);
                                                                const newSkills = newCerts.map((c: any) => c.name);

                                                                try {
                                                                    await userApi.update(profileUser.id, {
                                                                        certifications: JSON.stringify(newCerts),
                                                                        skills: newSkills // Sync legacy list
                                                                    });
                                                                    setProfileUser({
                                                                        ...profileUser,
                                                                        certifications: JSON.stringify(newCerts),
                                                                        skills: newSkills
                                                                    });
                                                                    Swal.fire({ toast: true, position: 'bottom-start', icon: 'success', title: 'Đã xóa', showConfirmButton: false, timer: 1500 });
                                                                } catch (e) {
                                                                    console.error(e);
                                                                }
                                                            }}
                                                        >
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })()}
                                <div className="mt-2 pt-2 border-t border-gray-100 text-center">
                                    <button className="text-sm font-bold text-gray-600 hover:text-gray-900 flex items-center justify-center gap-1 w-full py-1">
                                        Hiển thị tất cả <i className="fas fa-arrow-right"></i>
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* === RIGHT COLUMN (SIDEBAR) === */}
                    <div className="lg:col-span-3 space-y-2">
                        <div className="bg-white rounded-lg border border-gray-300 p-4 shadow-sm flex flex-col gap-3">
                            <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                                <div>
                                    <h3 className="text-xs font-bold text-gray-600">Ngôn ngữ</h3>
                                    <p className="text-xs text-gray-900">Tiếng Việt (Mặc định)</p>
                                </div>
                                {isOwnProfile && <i className="fas fa-pen text-gray-400 cursor-pointer text-xs hover:text-gray-900"></i>}
                            </div>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xs font-bold text-gray-600">Đường dẫn hồ sơ</h3>
                                    <p className="text-[10px] text-gray-500 truncate w-32">workconnect.vn/in/{profileUser.username}</p>
                                </div>
                                {isOwnProfile && <i className="fas fa-pen text-gray-400 cursor-pointer text-xs hover:text-gray-900"></i>}
                            </div>
                        </div>

                        {!currentUser?.isPremium && (
                            <div className="bg-white rounded-lg border border-gray-300 overflow-hidden shadow-sm top-4">
                                <div className="bg-gray-50 px-3 py-1 text-right">
                                    <span className="text-[10px] text-gray-400">Quảng cáo <i className="fas fa-info-circle ml-1"></i></span>
                                </div>
                                <div className="p-5 text-center">
                                    <p className="text-xs text-gray-600 mb-4">Nâng cấp lên <b>Premium</b> để thấy ai đã xem hồ sơ của bạn.</p>
                                    <div className="flex justify-center gap-2 mb-4">
                                        <img src={profileUser.avatar} className="w-14 h-14 rounded-full border-2 border-white shadow-md object-cover" alt="" />
                                        <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 text-2xl border-2 border-white shadow-md">
                                            <i className="fas fa-crown"></i>
                                        </div>
                                    </div>
                                    <Link to="/premium" className="block w-full">
                                        <button className="w-full py-1.5 rounded-full border border-[#4c42bd] text-[#4c42bd] font-bold text-xs hover:bg-blue-50 transition-all">Dùng thử miễn phí</button>
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Suggestions Section */}
                        <div className="md:col-span-4 space-y-4">
                            <UserSuggestions
                                title={profileUser.role === UserRole.BUSINESS ? 'Nhà tuyển dụng khác' : 'Những người bạn có thể biết'}
                                limit={5}
                                excludeId={profileUser.id}
                                context={{ viewerIndustry: profileUser.industry || profileUser.description }}
                            />
                        </div>
                    </div>
                </div>
            </div>
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
                        {/* Header Modal */}
                        <div className="flex items-center justify-between p-4 border-b">
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setModalTab('following')}
                                    className={`pb-2 font-bold text-sm transition-all ${modalTab === 'following' ? 'border-b-2 border-[#4c42bd] text-[#4c42bd]' : 'text-gray-500'}`}
                                >
                                    Đang theo dõi
                                </button>
                                <button
                                    onClick={() => setModalTab('followers')}
                                    className={`pb-2 font-bold text-sm transition-all ${modalTab === 'followers' ? 'border-b-2 border-[#4c42bd] text-[#4c42bd]' : 'text-gray-500'}`}
                                >
                                    Người theo dõi
                                </button>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-black">
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>

                        {/* List Content */}
                        <div className="flex-grow overflow-y-auto p-2">
                            {modalTab === 'following' ? (
                                followingList.length > 0 ? (
                                    followingList.map(person => {
                                        const isFollowing = followedIds.includes(person.id);
                                        return (
                                            <div key={person.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                                                <div
                                                    className="flex gap-3 items-center cursor-pointer"
                                                    onClick={() => navigate(`/fast-processing/${person.id}`)}
                                                >
                                                    <img
                                                        src={person.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${person.name}`}
                                                        className="w-10 h-10 rounded-lg border object-contain bg-white"
                                                        alt=""
                                                    />
                                                    <div>
                                                        <p className="font-bold text-sm leading-tight hover:text-[#4c42bd]">{person.fullName || person.name || person.username || 'Người dùng'}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {person.role === UserRole.BUSINESS ? (person.industry || 'Nhà tuyển dụng') : (person.title || person.role || 'Người lao động')}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => unfollowCompany(person.id)}
                                                    className="px-4 py-1 rounded-full border border-gray-300 text-xs font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                                                >
                                                    Đang theo dõi
                                                </button>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-8 text-gray-500 text-sm">Chưa theo dõi ai.</div>
                                )

                            ) : (
                                followersList.length > 0 ? (
                                    followersList.map(person => {
                                        const isFollowing = followedIds.includes(person.id);
                                        return (
                                            <div key={person.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                                                <div
                                                    className="flex gap-3 items-center cursor-pointer"
                                                    onClick={() => navigate(`/fast-processing/${person.id}`)}
                                                >
                                                    <img
                                                        src={person.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${person.name}`}
                                                        className="w-10 h-10 rounded-full border object-cover"
                                                        alt=""
                                                    />
                                                    <div>
                                                        <p className="font-bold text-sm leading-tight hover:text-[#4c42bd]">{person.fullName || person.name || person.username || 'Người dùng'}</p>
                                                        <p className="text-xs text-gray-500">{person.title || person.role || 'Người lao động'}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => isFollowing ? unfollowCompany(person.id) : followCompany(person.id)}
                                                    className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${isFollowing
                                                        ? 'border border-gray-300 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                                                        : 'bg-[#4c42bd] text-white hover:bg-gray-800'
                                                        }`}
                                                >
                                                    {isFollowing ? 'Đang theo dõi' : 'Theo dõi lại'}
                                                </button>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-8 text-gray-500 text-sm">Chưa có người theo dõi.</div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* EDUCATION MODAL */}
            {isEducationModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative animate-fade-in-up">
                        <button
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-900"
                            onClick={() => setIsEducationModalOpen(false)}
                        >
                            <i className="fas fa-times text-xl"></i>
                        </button>
                        <h3 className="text-xl font-bold mb-4 text-gray-900">Thêm học vấn</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Trường học / Tổ chức (*)</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-[#4c42bd] focus:ring-1 focus:ring-[#4c42bd] outline-none"
                                    value={educationForm.school}
                                    onChange={e => setEducationForm({ ...educationForm, school: e.target.value })}
                                    placeholder="VD: Đại học Harvard"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bằng cấp / Ngành học</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-[#4c42bd] focus:ring-1 focus:ring-[#4c42bd] outline-none"
                                    value={educationForm.degree}
                                    onChange={e => setEducationForm({ ...educationForm, degree: e.target.value })}
                                    placeholder="VD: Cử nhân Công nghệ thông tin"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Năm bắt đầu</label>
                                    <div className="relative">
                                        <select
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-[#4c42bd] focus:ring-1 focus:ring-[#4c42bd] outline-none appearance-none bg-white"
                                            value={educationForm.startYear}
                                            onChange={e => setEducationForm({ ...educationForm, startYear: e.target.value })}
                                        >
                                            <option value="">Chọn năm</option>
                                            {Array.from({ length: 60 }, (_, i) => new Date().getFullYear() - i + 1).map(year => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                            <i className="fas fa-chevron-down text-xs"></i>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Năm kết thúc</label>
                                    <div className="relative">
                                        <select
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-[#4c42bd] focus:ring-1 focus:ring-[#4c42bd] outline-none appearance-none bg-white"
                                            value={educationForm.endYear}
                                            onChange={e => setEducationForm({ ...educationForm, endYear: e.target.value })}
                                        >
                                            <option value="">Hiện tại</option>
                                            {Array.from({ length: 67 }, (_, i) => new Date().getFullYear() - i + 7).map(year => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                            <i className="fas fa-chevron-down text-xs"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button
                                className="w-full bg-[#4c42bd] text-white py-2.5 rounded-lg font-bold hover:bg-[#3b3299] transition-colors mt-2 shadow-md hover:shadow-lg"
                                onClick={async () => {
                                    if (!educationForm.school.trim()) return Swal.fire('Lỗi', 'Vui lòng nhập tên trường', 'error');

                                    const currentYear = new Date().getFullYear();
                                    const minYear = 1900;
                                    const start = parseInt(educationForm.startYear);
                                    const end = parseInt(educationForm.endYear);

                                    // Validate Start Year
                                    if (educationForm.startYear) {
                                        if (isNaN(start) || start < minYear || start > currentYear + 1) {
                                            return Swal.fire('Lỗi', 'Năm bắt đầu không hợp lệ', 'error');
                                        }
                                    }

                                    // Validate End Year
                                    if (educationForm.endYear) {
                                        if (isNaN(end) || end < minYear || end > currentYear + 7) { // Allow future graduation
                                            return Swal.fire('Lỗi', 'Năm kết thúc không hợp lệ', 'error');
                                        }
                                        if (educationForm.startYear && end < start) {
                                            return Swal.fire('Lỗi', 'Năm kết thúc phải sau năm bắt đầu', 'error');
                                        }
                                    }

                                    try {
                                        let currentList = [];
                                        try {
                                            if (profileUser.education) {
                                                currentList = profileUser.education.startsWith('[') ? JSON.parse(profileUser.education) : [{ school: profileUser.education }];
                                            }
                                        } catch {
                                            currentList = [];
                                        }

                                        const newList = [...currentList, educationForm];
                                        const jsonString = JSON.stringify(newList);

                                        await userApi.update(profileUser.id, { education: jsonString });
                                        setProfileUser({ ...profileUser, education: jsonString });
                                        setIsEducationModalOpen(false);
                                        Swal.fire({ toast: true, position: 'bottom-start', icon: 'success', title: 'Đã thêm học vấn', showConfirmButton: false, timer: 1500 });
                                    } catch (e) {
                                        console.error(e);
                                        Swal.fire('Lỗi', 'Không thể lưu thông tin', 'error');
                                    }
                                }}
                            >
                                Lưu thay đổi
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* SKILL MODAL */}
            {isSkillModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative animate-fade-in-up">
                        <button
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-900"
                            onClick={() => setIsSkillModalOpen(false)}
                        >
                            <i className="fas fa-times text-xl"></i>
                        </button>
                        <h3 className="text-xl font-bold mb-4 text-gray-900">Thêm kỹ năng / Chứng chỉ</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tên kỹ năng (*)</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-[#4c42bd] focus:ring-1 focus:ring-[#4c42bd] outline-none"
                                    value={skillForm.name}
                                    onChange={e => setSkillForm({ ...skillForm, name: e.target.value })}
                                    placeholder="VD: Java, IELTS, Chứng chỉ PMP..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh xác thực / Bằng cấp</label>
                                <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center">
                                    {skillForm.image ? (
                                        <div className="relative inline-block">
                                            <img src={skillForm.image} alt="Preview" className="h-32 object-contain rounded" />
                                            <button
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                                                onClick={() => setSkillForm({ ...skillForm, image: '' })}
                                            >
                                                <i className="fas fa-times"></i>
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                id="skill-proof-upload"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            setSkillForm({ ...skillForm, image: reader.result as string });
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                            <label htmlFor="skill-proof-upload" className="cursor-pointer flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-[#4c42bd]">
                                                <i className="fas fa-camera text-2xl"></i>
                                                <span className="text-xs">Chụp ảnh hoặc tải lên</span>
                                            </label>
                                        </>
                                    )}
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1 italic">* Hình ảnh giúp tăng độ uy tín cho kỹ năng của bạn.</p>
                            </div>

                            <button
                                className="w-full bg-[#4c42bd] text-white py-2.5 rounded-lg font-bold hover:bg-[#3b3299] transition-colors mt-2 shadow-md hover:shadow-lg"
                                onClick={async () => {
                                    if (!skillForm.name.trim()) return Swal.fire('Lỗi', 'Vui lòng nhập tên kỹ năng', 'error');

                                    try {
                                        let currentCerts = [];
                                        try {
                                            if (profileUser.certifications) {
                                                currentCerts = JSON.parse(profileUser.certifications);
                                            } else if (profileUser.skills && profileUser.skills.length > 0) {
                                                currentCerts = profileUser.skills.map((s: string) => ({ name: s, image: '' }));
                                            }
                                        } catch {
                                            currentCerts = [];
                                        }

                                        const newCerts = [...currentCerts, skillForm];
                                        // Sync simple skills list for search/compatibility
                                        const newSkills = newCerts.map((c: any) => c.name);

                                        await userApi.update(profileUser.id, {
                                            certifications: JSON.stringify(newCerts),
                                            skills: newSkills
                                        });

                                        setProfileUser({
                                            ...profileUser,
                                            certifications: JSON.stringify(newCerts),
                                            skills: newSkills
                                        });

                                        setIsSkillModalOpen(false);
                                        Swal.fire({ toast: true, position: 'bottom-start', icon: 'success', title: 'Đã thêm kỹ năng', showConfirmButton: false, timer: 1500 });
                                    } catch (e) {
                                        console.error(e);
                                        Swal.fire('Lỗi', 'Không thể lưu thông tin', 'error');
                                    }
                                }}
                            >
                                Lưu thay đổi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
