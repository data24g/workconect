import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const MyJobs: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'active' | 'closed'>('active');

    // Mock data - tin tìm việc của worker
    const myJobPosts = [
        {
            id: '1',
            title: 'Tìm việc ReactJS Developer - 2 năm kinh nghiệm',
            type: 'FULL_TIME',
            location: 'Hà Nội',
            salary: '15-20 triệu',
            description: 'Tôi có 2 năm kinh nghiệm làm ReactJS, tìm công ty uy tín để phát triển',
            skills: 'ReactJS, TypeScript, Node.js, MongoDB',
            postedAt: '2026-01-01T00:00:00Z',
            status: 'OPEN',
            viewCount: 45,
            applicationCount: 3
        },
    ];

    const activePosts = myJobPosts.filter(p => p.status === 'OPEN');
    const closedPosts = myJobPosts.filter(p => p.status === 'CLOSED');

    return (
        <div className="bg-[#F3F2EF] min-h-screen py-6">
            <div className="max-w-5xl mx-auto px-4">

                {/* Header */}
                <div className="bg-white rounded-lg border border-gray-300 p-6 mb-4 shadow-sm">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Tin tìm việc của tôi</h1>
                            <p className="text-sm text-gray-500 mt-1">Quản lý các tin đăng tìm việc của bạn</p>
                        </div>
                        <button
                            onClick={() => navigate('/jobs/post')}
                            className="px-6 py-2.5 bg-[#4c42bd] text-white font-bold rounded-full hover:bg-[#004182] transition-colors shadow-sm flex items-center gap-2"
                        >
                            <i className="fas fa-plus"></i>
                            Đăng tin tìm việc mới
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden">
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('active')}
                            className={`flex-1 py-3 px-4 font-semibold text-sm transition-colors ${activeTab === 'active'
                                    ? 'text-[#4c42bd] border-b-2 border-[#4c42bd] bg-blue-50'
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            Đang mở ({activePosts.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('closed')}
                            className={`flex-1 py-3 px-4 font-semibold text-sm transition-colors ${activeTab === 'closed'
                                    ? 'text-[#4c42bd] border-b-2 border-[#4c42bd] bg-blue-50'
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            Đã đóng ({closedPosts.length})
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {activeTab === 'active' && activePosts.length === 0 && (
                            <div className="text-center py-12">
                                <i className="fas fa-briefcase text-6xl text-gray-300 mb-4"></i>
                                <p className="text-gray-500 mb-4">Bạn chưa có tin tìm việc nào</p>
                                <button
                                    onClick={() => navigate('/jobs/post')}
                                    className="px-6 py-2 bg-[#4c42bd] text-white font-bold rounded-full hover:bg-[#004182] transition-colors"
                                >
                                    Đăng tin ngay
                                </button>
                            </div>
                        )}

                        {activeTab === 'active' && activePosts.map(post => (
                            <div key={post.id} className="border border-gray-300 rounded-lg p-5 mb-4 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start">
                                    <div className="flex-grow">
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">{post.title}</h3>
                                        <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-3">
                                            <span className="flex items-center gap-1">
                                                <i className="fas fa-briefcase text-xs"></i>
                                                {post.type}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <i className="fas fa-map-marker-alt text-xs"></i>
                                                {post.location}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <i className="fas fa-money-bill-wave text-xs"></i>
                                                {post.salary}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-700 mb-3 line-clamp-2">{post.description}</p>
                                        <div className="flex gap-4 text-xs text-gray-500">
                                            <span><i className="fas fa-eye"></i> {post.viewCount} lượt xem</span>
                                            <span><i className="fas fa-envelope"></i> {post.applicationCount} ứng tuyển</span>
                                            <span><i className="fas fa-clock"></i> {new Date(post.postedAt).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 ml-4">
                                        <button
                                            onClick={() => navigate(`/jobs/post/${post.id}`)}
                                            className="px-4 py-1.5 border border-[#4c42bd] text-[#4c42bd] font-semibold text-sm rounded-full hover:bg-blue-50 transition-colors"
                                        >
                                            Chỉnh sửa
                                        </button>
                                        <button className="px-4 py-1.5 border border-gray-400 text-gray-600 font-semibold text-sm rounded-full hover:bg-gray-100 transition-colors">
                                            Đóng tin
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {activeTab === 'closed' && closedPosts.length === 0 && (
                            <div className="text-center py-12">
                                <i className="fas fa-archive text-6xl text-gray-300 mb-4"></i>
                                <p className="text-gray-500">Không có tin đã đóng</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyJobs;
