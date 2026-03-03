
export interface SocialPostDTO {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    userTitle?: string;
    content: string;
    images?: string[];
    likes: number;
    comments: number;
    shares: number;
    createdAt: string;
    isLiked?: boolean;
}

export interface SocialCommentDTO {
    id: string;
    postId: string;
    userId: string;
    userName: string;
    userAvatar: string;
    content: string;
    createdAt: string;
}

// Mock Data
let MOCK_POSTS: SocialPostDTO[] = [
    {
        id: 'post-1',
        userId: 'user-1',
        userName: 'Nguyễn Văn A',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
        userTitle: 'Software Engineer at VinGroup',
        content: 'Hôm nay là một ngày tuyệt vời để bắt đầu dự án mới! 🚀 #coding #developer #newproject',
        images: ['https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80'],
        likes: 124,
        comments: 12,
        shares: 5,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        isLiked: false
    },
    {
        id: 'post-2',
        userId: 'biz-1',
        userName: 'FPT Software',
        userAvatar: 'https://cdn.haitrieu.com/wp-content/uploads/2022/01/Logo-FPT-Software.png',
        userTitle: 'Technology Company',
        content: 'Chúng tôi đang tìm kiếm những tài năng trẻ gia nhập đội ngũ AI Engineer. Ứng tuyển ngay hôm nay để nhận cơ hội làm việc tại Nhật Bản! 🇯🇵',
        likes: 856,
        comments: 45,
        shares: 120,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        isLiked: true
    },
    {
        id: 'post-3',
        userId: 'user-2',
        userName: 'Lê Thị B',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
        userTitle: 'HR Specialist',
        content: 'Chia sẻ kinh nghiệm phỏng vấn: Đừng chỉ trả lời câu hỏi, hãy kể một câu chuyện. Nhà tuyển dụng muốn thấy con người thật của bạn qua những trải nghiệm thực tế.',
        likes: 342,
        comments: 56,
        shares: 23,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        isLiked: false
    }
];

const socialApi = {
    getAllPosts: async (): Promise<SocialPostDTO[]> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        return [...MOCK_POSTS];
    },

    createPost: async (post: Omit<SocialPostDTO, 'id' | 'likes' | 'comments' | 'shares' | 'createdAt'>): Promise<SocialPostDTO> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const newPost: SocialPostDTO = {
            id: `post-${Date.now()}`,
            ...post,
            likes: 0,
            comments: 0,
            shares: 0,
            createdAt: new Date().toISOString(),
            isLiked: false
        };
        MOCK_POSTS.unshift(newPost);
        return newPost;
    },

    deletePost: async (id: string): Promise<boolean> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        MOCK_POSTS = MOCK_POSTS.filter(p => p.id !== id);
        return true;
    },

    toggleLike: async (id: string): Promise<boolean> => {
        await new Promise(resolve => setTimeout(resolve, 200));
        const post = MOCK_POSTS.find(p => p.id === id);
        if (post) {
            post.isLiked = !post.isLiked;
            post.likes += post.isLiked ? 1 : -1;
            return true;
        }
        return false;
    }
};

export default socialApi;
