
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import socialApi, { SocialPostDTO } from '../apis/api_social';
import Swal from 'sweetalert2';
import { formatTimeAgo } from '../pages/Home';

interface SocialFeedProps {
    allowPost?: boolean;
}

const SocialFeed: React.FC<SocialFeedProps> = ({ allowPost = true }) => {
    const { user } = useAuth();
    const [posts, setPosts] = useState<SocialPostDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [newPostContent, setNewPostContent] = useState('');
    const [isPosting, setIsPosting] = useState(false);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const data = await socialApi.getAllPosts();
            setPosts(data);
        } catch (error) {
            console.error("Failed to fetch posts", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePostSubmit = async () => {
        if (!newPostContent.trim()) return;
        if (!user) {
            Swal.fire({ icon: 'warning', title: 'Bạn cần đăng nhập', text: 'Vui lòng đăng nhập để đăng bài.' });
            return;
        }

        setIsPosting(true);
        try {
            const newPost = await socialApi.createPost({
                userId: user.id || 'guest',
                userName: user.fullName || user.name || 'Anonymous',
                userAvatar: user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`,
                userTitle: user.title || (user.role === 'BUSINESS' ? 'Nhà tuyển dụng' : 'Thành viên'),
                content: newPostContent
            });
            setPosts([newPost, ...posts]);
            setNewPostContent('');
            Swal.fire({
                icon: 'success',
                title: 'Đăng bài thành công',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 1500
            });
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Không thể đăng bài viết.' });
        } finally {
            setIsPosting(false);
        }
    };

    const handleLike = async (postId: string) => {
        if (!user) return;
        try {
            setPosts(prev => prev.map(p =>
                p.id === postId
                    ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
                    : p
            ));
            await socialApi.toggleLike(postId);
        } catch (error) {
            console.error("Like failed", error);
        }
    };

    return (
        <div className="space-y-4">
            {/* Compose Post Box */}
            {allowPost && user && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                    <div className="flex gap-3 mb-3">
                        <img
                            src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                            className="w-10 h-10 rounded-full border border-gray-100"
                            alt="avatar"
                        />
                        <textarea
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            placeholder="Bạn đang nghĩ gì?"
                            className="flex-grow bg-[#f3f6f9] rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 resize-none h-20"
                        />
                    </div>
                    <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                        <div className="flex gap-4">
                            <button className="flex items-center gap-1.5 text-gray-500 hover:text-blue-500 text-xs font-bold transition-colors">
                                <i className="fas fa-image text-green-500 text-sm"></i> Ảnh/Video
                            </button>
                            <button className="flex items-center gap-1.5 text-gray-500 hover:text-blue-500 text-xs font-bold transition-colors">
                                <i className="fas fa-briefcase text-blue-500 text-sm"></i> Công việc
                            </button>
                            <button className="flex items-center gap-1.5 text-gray-500 hover:text-blue-500 text-xs font-bold transition-colors">
                                <i className="far fa-smile text-amber-500 text-sm"></i> Cảm xúc
                            </button>
                        </div>
                        <button
                            onClick={handlePostSubmit}
                            disabled={!newPostContent.trim() || isPosting}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold text-white transition-all shadow-sm ${newPostContent.trim() ? 'bg-[#4c42bd] hover:bg-[#3e34a5]' : 'bg-gray-300 cursor-not-allowed'}`}
                        >
                            {isPosting ? <i className="fas fa-spinner fa-spin"></i> : 'Đăng bài'}
                        </button>
                    </div>
                </div>
            )}

            {/* Feed List */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2].map(i => (
                        <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 h-40 animate-pulse">
                            <div className="flex gap-3">
                                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                                </div>
                            </div>
                            <div className="mt-4 space-y-2">
                                <div className="h-3 bg-gray-200 rounded w-full"></div>
                                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                posts.map(post => (
                    <div key={post.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                        {/* Post Header */}
                        <div className="p-4 flex gap-3">
                            <img src={post.userAvatar} className="w-10 h-10 rounded-full border border-gray-100 object-cover" alt="avatar" />
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-sm text-gray-900 hover:underline cursor-pointer truncate">{post.userName}</h3>
                                        <p className="text-[11px] text-gray-500 truncate">{post.userTitle}</p>
                                    </div>
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <i className="fas fa-ellipsis-h text-xs"></i>
                                    </button>
                                </div>
                                <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                                    {formatTimeAgo(post.createdAt)} • <i className="fas fa-globe-asia text-[8px]"></i>
                                </p>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="px-4 pb-2">
                            <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed mb-3">
                                {post.content}
                            </p>
                        </div>

                        {post.images && post.images.length > 0 && (
                            <div className="w-full">
                                <img src={post.images[0]} className="w-full object-cover max-h-[400px]" alt="post-img" />
                            </div>
                        )}

                        {/* Interaction Stats */}
                        <div className="px-4 py-2 flex items-center justify-between border-b border-gray-50 text-[11px] text-gray-500">
                            <div className="flex items-center gap-1">
                                <div className="flex -space-x-1">
                                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center border border-white z-20"><i className="fas fa-thumbs-up text-[8px] text-white"></i></div>
                                    <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center border border-white z-10"><i className="fas fa-heart text-[8px] text-white"></i></div>
                                </div>
                                <span className="hover:underline hover:text-blue-600 cursor-pointer ml-1">{post.likes}</span>
                            </div>
                            <div className="flex gap-3">
                                <span className="hover:underline cursor-pointer">{post.comments} bình luận</span>
                                <span className="hover:underline cursor-pointer">{post.shares} chia sẻ</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-4 px-2 py-1">
                            <button
                                onClick={() => handleLike(post.id)}
                                className={`flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-50 transition-colors group ${post.isLiked ? 'text-blue-600' : 'text-gray-600'}`}
                            >
                                <i className={`${post.isLiked ? 'fas' : 'far'} fa-thumbs-up text-sm group-hover:scale-110 transition-transform`}></i>
                                <span className="text-xs font-bold">Thích</span>
                            </button>
                            <button className="flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-600 group">
                                <i className="far fa-comment-alt text-sm group-hover:scale-110 transition-transform"></i>
                                <span className="text-xs font-bold">Bình luận</span>
                            </button>
                            <button className="flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-600 group">
                                <i className="fas fa-retweet text-sm group-hover:scale-110 transition-transform"></i>
                                <span className="text-xs font-bold">Đăng lại</span>
                            </button>
                            <button className="flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-600 group">
                                <i className="far fa-paper-plane text-sm group-hover:scale-110 transition-transform"></i>
                                <span className="text-xs font-bold">Gửi</span>
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default SocialFeed;
