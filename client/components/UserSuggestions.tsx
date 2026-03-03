import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FollowedCompaniesContext } from '../pages/Companies';
import suggestionApi, { SuggestionDTO } from '../apis/api_suggestion';
import Swal from 'sweetalert2';
import { rankSuggestions, RankingContext, rankSuggestionsWithReason } from '../utils/ranking';

interface UserSuggestionsProps {
    title?: string;
    limit?: number;
    excludeId?: string;
    type?: 'USER' | 'COMPANY';
    className?: string;
    context?: RankingContext;
}

const UserSuggestions: React.FC<UserSuggestionsProps> = ({
    title = 'Gợi ý kết nối',
    limit = 4,
    excludeId,
    type,
    className = '',
    context
}) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { followedIds, followCompany, unfollowCompany } = useContext(FollowedCompaniesContext);

    // State stores wrapped items with reasons
    const [suggestions, setSuggestions] = useState<{ item: SuggestionDTO, reason: string }[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!user?.id) return;
            setLoading(true);
            try {
                // Fetch raw data
                const data = await suggestionApi.getSuggestions(user.id);

                // Basic filtering (User ID, 'admin')
                let filtered = data.filter(p => p.id !== user.id && p.name.toLowerCase() !== 'admin');

                // Apply Ranking Algorithm V2 with Reasons
                // Note: We use rankSuggestionsWithReason directly here to get the 'reason' string
                // We also pass 'filterFollowed: true' implicitly if we want sidebar behavior (usually yes)
                // But let's allow it to be configurable via context if needed, defaulting to true for Dashboard

                const rankContext = {
                    ...context,
                    excludeId,
                    targetType: type,
                    // If dashboard or generally "Suggestions", we likely want to filter out followed users
                    // Let's default to filtering followed users unless stated otherwise
                    filterFollowed: true
                };

                const ranked = rankSuggestionsWithReason(
                    filtered,
                    user,
                    followedIds,
                    rankContext
                );

                setSuggestions(ranked.slice(0, limit));
            } catch (error) {
                console.error("Failed to fetch suggestions:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSuggestions();
        // Add followedIds to dependency to trigger re-ranking immediately on follow/unfollow
    }, [user?.id, excludeId, type, limit, followedIds]);

    const handleFollowToggle = async (person: SuggestionDTO) => {
        const isFollowing = followedIds.includes(person.id);
        try {
            if (isFollowing) {
                await unfollowCompany(person.id);
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'info',
                    title: `Đã bỏ theo dõi ${(person as any).fullName || person.name || (person as any).username || 'Người dùng'}`,
                    showConfirmButton: false,
                    timer: 1500
                });
            } else {
                await followCompany(person.id);
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: `Đã theo dõi ${(person as any).fullName || person.name || (person as any).username || 'Người dùng'}`,
                    showConfirmButton: false,
                    timer: 1500
                });
            }
        } catch (error) {
            console.error("Follow action failed:", error);
        }
    };

    if (loading && suggestions.length === 0) {
        return (
            <div className={`bg-white rounded-lg border border-gray-300 p-4 shadow-sm ${className}`}>
                <div className="flex animate-pulse space-x-4">
                    <div className="flex-1 space-y-4 py-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="space-y-3">
                            <div className="h-10 bg-gray-200 rounded"></div>
                            <div className="h-10 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (suggestions.length === 0) return null;

    return (
        <div className={`bg-white rounded-lg border border-gray-300 p-4 shadow-sm ${className}`}>
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
                <i className="fas fa-info-circle text-gray-400 text-xs cursor-pointer" title="Gợi ý dựa trên hồ sơ và hoạt động của bạn"></i>
            </div>
            <div className="max-h-[400px] overflow-y-auto pr-1 custom-scrollbar space-y-4">
                {suggestions.map(({ item: person, reason }) => {
                    const isFollowing = followedIds.includes(person.id);
                    // Double check if we filtered correctly, though the ranker handles it.
                    if (isFollowing) return null; // Extra safety if re-render is slow or logic changes

                    return (
                        <div key={person.id} className="flex items-start gap-3 group">
                            <div
                                className="w-10 h-10 rounded-full border border-gray-100 bg-gray-50 object-cover cursor-pointer shrink-0 overflow-hidden relative"
                                onClick={() => navigate(`/fast-processing/${person.id}`)}
                            >
                                <img
                                    src={person.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${(person as any).fullName || person.name || (person as any).username || 'User'}`}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                    alt={(person as any).fullName || person.name || (person as any).username || 'User'}
                                />
                            </div>
                            <div className="min-w-0 flex-grow">
                                <p
                                    className="text-sm font-bold text-gray-900 truncate hover:text-[#4c42bd] hover:underline cursor-pointer"
                                    onClick={() => navigate(`/fast-processing/${person.id}`)}
                                >
                                    {(person as any).fullName || person.name || (person as any).username || 'Người dùng'}
                                </p>

                                {/* REASON BADGE
                                <p className="text-[10px] text-gray-500 line-clamp-1 flex items-center gap-1">
                                    <i className="fas fa-lightbulb text-amber-400 text-[8px]"></i> {reason}
                                </p> */}

                                <p className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">{person.role || (person.type === 'COMPANY' ? 'Công ty' : 'Thành viên')}</p>

                                <button
                                    onClick={() => handleFollowToggle(person)}
                                    className={`mt-2 px-3 py-1 rounded-full border text-xs font-semibold transition-all flex items-center justify-center gap-1 w-full text-[#4c42bd] border-[#4c42bd] hover:bg-indigo-50 hover:border-indigo-700`}
                                >
                                    <i className="fas fa-plus"></i> Theo dõi
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="mt-4 pt-2 border-t border-gray-100">
                <button className="text-sm font-bold text-gray-500 hover:text-gray-900 flex items-center gap-1 w-full justify-center">
                    Xem tất cả gợi ý <i className="fas fa-arrow-right text-[10px]"></i>
                </button>
            </div>
        </div>
    );
};

export default UserSuggestions;
