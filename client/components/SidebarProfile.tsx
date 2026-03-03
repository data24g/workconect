import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserRole } from '../types';
import { FollowedCompaniesContext } from '../pages/Companies';
import followApi from '../apis/api_follow';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';

interface SidebarProfileProps {
    user: any;
    isWorker: boolean;
    recentActivities?: string[];
    repScore?: number;
}

const SidebarProfile: React.FC<SidebarProfileProps> = ({
    user,
    isWorker,
    recentActivities = [],
    repScore = 0,
}) => {
    const { followedIds } = useContext(FollowedCompaniesContext);
    const { user: currentUser } = useAuth();
    const [followersCount, setFollowersCount] = useState(0);

    useEffect(() => {
        const fetchStats = async () => {
            if (user?.id) {
                try {
                    const followers = await followApi.getFollowers(user.id);
                    setFollowersCount(followers.length);
                } catch (error) {
                    console.error("Failed to fetch sidebar profile stats:", error);
                }
            }
        };
        fetchStats();
    }, [user?.id]);

    // Combining company follows and potentially other follows here
    const followingCount = followedIds.length;

    const renderStars = (rating: number) => {
        const full = Math.floor(rating);
        const half = rating % 1 >= 0.5 ? 1 : 0;
        const empty = 5 - full - half;
        return (
            <div className="flex text-amber-500 text-[10px] gap-0.5">
                {[...Array(full)].map((_, i) => <i key={`full-${i}`} className="fas fa-star"></i>)}
                {half === 1 && <i className="fas fa-star-half-alt"></i>}
                {[...Array(empty)].map((_, i) => <i key={`empty-${i}`} className="far fa-star"></i>)}
            </div>
        );
    };

    return (
        <div className="bg-white rounded-xl border border-gray-300 shadow-sm h-[600px] flex flex-col sticky top-20 overflow-hidden">
            {/* Scrollable Content Container */}
            <div className="flex-grow overflow-y-auto custom-scrollbar">
                {/* Banner Section - Updated to support real cover photo */}
                <div className="h-20 shrink-0 relative overflow-hidden">
                    {user?.coverPhoto ? (
                        <img
                            src={user.coverPhoto}
                            className="w-full h-full object-cover transition-transform hover:scale-105 duration-700"
                            alt="Cover"
                        />
                    ) : (
                        <div className={`w-full h-full bg-gradient-to-r ${isWorker ? 'from-slate-600 to-slate-500' : 'from-[#4c42bd] to-[#3a32a0]'}`}></div>
                    )}
                    <div className="absolute inset-0 bg-black/10"></div>
                </div>

                {/* Profile Info Section */}
                <div className="px-3 text-center relative pb-2 shrink-0">
                    <Link to="/profile">
                        <div className="w-16 h-16 mx-auto -mt-8 bg-white p-1 rounded-full border border-gray-200 cursor-pointer hover:opacity-95 shadow-sm overflow-hidden transition-transform hover:scale-[1.02]">
                            <img
                                src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || user?.username || 'User'}`}
                                className="w-full h-full rounded-full object-cover"
                                alt="avatar"
                            />
                        </div>
                    </Link>
                    <div className="mt-2 mb-1 px-1">
                        <Link to="/profile">
                            <h2 className="text-sm font-bold text-gray-900 hover:underline cursor-pointer leading-tight">
                                {user?.fullName || user?.name || user?.username || 'Người dùng'}
                            </h2>
                            {user?.numericId && (
                                <p className="text-[10px] text-[#4c42bd] font-bold mt-0.5 tracking-tight">ID: {user.numericId}</p>
                            )}
                        </Link>
                        <p className="text-[10px] text-gray-500 mt-1 line-clamp-2 leading-snug">
                            {user?.bio || user?.description || (isWorker ? "Chuyên gia tự do / Freelancer" : "Đại diện Nhà tuyển dụng / Tuyển dụng")}
                        </p>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="border-t border-gray-100 shrink-0">
                    <div className="flex justify-between items-center text-[10px] font-semibold text-gray-500 hover:bg-gray-50 px-3 py-1.5 cursor-pointer transition-colors group border-b border-gray-50">
                        <span className="group-hover:text-gray-900 transition-colors">Uy tín</span>
                        <div className="flex items-center gap-1">
                            {repScore && repScore > 0 && repScore <= 5 ? (
                                <>
                                    <span className="text-[#4c42bd] font-bold">{repScore.toFixed(1)}</span>
                                    {renderStars(repScore)}
                                </>
                            ) : (
                                <>
                                    <span className="text-gray-400 font-bold">0.0</span>
                                    {renderStars(0)}
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 px-3 py-1.5 border-b border-gray-50 bg-slate-50/30">
                        <Link to="/profile" className="hover:underline flex gap-1 items-center">
                            <span className="font-bold text-[11px] text-gray-900">{followingCount}</span>
                            <span className="text-gray-500 text-[10px]">Đang theo dõi</span>
                        </Link>
                        <Link to="/profile" className="hover:underline flex gap-1 items-center">
                            <span className="font-bold text-[11px] text-gray-900">{followersCount}</span>
                            <span className="text-gray-500 text-[10px]">Người theo dõi</span>
                        </Link>
                    </div>
                </div>

                {/* Candidates Link (Business Only) */}
                {!isWorker && (
                    <Link
                        to="/candidates"
                        className="block px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors text-left flex items-center gap-3 text-[10px] font-bold text-gray-700 border-b border-gray-50 shrink-0"
                    >
                        <i className="fas fa-search text-blue-500 w-4 text-center"></i>
                        <span>Tìm ứng viên</span>
                    </Link>
                )}

                {/* Saved Items Link */}
                <Link
                    to="/saved-jobs"
                    className="block px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors text-left flex items-center gap-3 text-[10px] font-bold text-gray-700 border-b border-gray-50 shrink-0"
                >
                    <i className="fas fa-bookmark text-gray-400 w-4 text-center"></i>
                    <span>Mục đã lưu của tôi</span>
                </Link>

                {/* Premium Section */}
                {!currentUser?.isPremium && (
                    <div className="px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors text-left group bg-amber-50/10 border-b border-gray-50 shrink-0">
                        <Link to="/premium" className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded bg-amber-100 text-amber-600 flex items-center justify-center shadow-sm">
                                <i className="fas fa-crown text-[8px]"></i>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] text-gray-500 group-hover:underline">Tính năng độc quyền</span>
                                <span className="text-[10px] font-bold text-gray-900 group-hover:text-[#f5945c]">Gia hạn Premium</span>
                            </div>
                        </Link>
                    </div>
                )}

                {/* Recent / Activity Section - Merged into the same card */}
                <div className="px-3 py-2">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] mt-2 font-bold text-gray-900 uppercase tracking-tight">Hoạt động gần đây</p>
                        <i className="fas fa-history text-gray-300 text-[9px]"></i>
                    </div>
                    <div className="space-y-1">
                        {recentActivities.length > 0 ? (
                            recentActivities.map((activity, i) => (
                                <div key={i} className="group flex items-center gap-2 text-[10px] text-gray-500 hover:bg-gray-50 p-1.5 rounded cursor-pointer font-medium transition-all">
                                    <i className="fas fa-arrow-right text-gray-300 text-[7px] group-hover:text-gray-500"></i>
                                    <span className="truncate group-hover:text-gray-900">{activity}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-[10px] text-gray-400 italic py-2">Chưa có hoạt động mới</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Sticky Footer for the Sidebar Card */}
            <div className="shrink-0 px-3 py-2 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
                <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-gray-400 hover:text-[#4c42bd] cursor-pointer uppercase transition-colors">Nhóm & Sự kiện</span>
                    <i className="fas fa-plus text-gray-300 text-[9px] hover:text-gray-600 cursor-pointer"></i>
                </div>
            </div>
        </div>
    );
};

export default SidebarProfile;
