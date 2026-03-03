
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import socialApi, { SocialPostDTO } from '../apis/api_social';
import Swal from 'sweetalert2';
import { formatTimeAgo } from '../pages/Home';

const MyPostManager: React.FC = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState<SocialPostDTO[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyPosts();
    }, [user]);

    const fetchMyPosts = async () => {
        if (!user) return;
        try {
            const allPosts = await socialApi.getAllPosts();
            // Filter posts by current user
            const myPosts = allPosts.filter(p => p.userId === user.id);
            setPosts(myPosts);
        } catch (error) {
            console.error("Failed to fetch posts", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (postId: string) => {
        const result = await Swal.fire({
            title: 'Xóa bài viết?',
            text: "Bạn không thể hoàn tác hành động này!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy'
        });

        if (result.isConfirmed) {
            try {
                await socialApi.deletePost(postId);
                setPosts(prev => prev.filter(p => p.id !== postId));
                Swal.fire('Đã xóa!', 'Bài viết đã được xóa.', 'success');
            } catch (error) {
                Swal.fire('Lỗi', 'Không thể xóa bài viết.', 'error');
            }
        }
    };

    if (loading) return <div>Đang tải...</div>;

    if (posts.length === 0) {
        return (
            <div className="text-center py-10 bg-white rounded-lg border border-gray-200">
                <p className="text-gray-500">Bạn chưa có bài đăng nào.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {posts.map(post => (
                <div key={post.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                            <img src={post.userAvatar} className="w-10 h-10 rounded-full border border-gray-100" alt="avatar" />
                            <div>
                                <h3 className="font-bold text-sm text-gray-900">{post.userName}</h3>
                                <p className="text-[10px] text-gray-500">{formatTimeAgo(post.createdAt)}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleDelete(post.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                            <i className="fas fa-trash"></i>
                        </button>
                    </div>
                    <p className="text-sm text-gray-800 mb-2">{post.content}</p>
                    {post.images && post.images.length > 0 && (
                        <img src={post.images[0]} className="w-full h-48 object-cover rounded-lg mb-2" alt="post-img" />
                    )}
                    <div className="flex gap-4 text-xs text-gray-500 border-t border-gray-100 pt-2">
                        <span><i className="fas fa-thumbs-up"></i> {post.likes}</span>
                        <span><i className="fas fa-comment"></i> {post.comments}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MyPostManager;
