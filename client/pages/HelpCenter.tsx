import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const HelpCenter: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const categories = [
        { id: '1', title: 'Bắt đầu', icon: 'fa-rocket', description: 'Tìm hiểu các bước đầu tiên để sử dụng WorkConnect.' },
        { id: '2', title: 'Quản lý tài khoản', icon: 'fa-user-cog', description: 'Thay đổi thông tin, bảo mật và quyền riêng tư.' },
        { id: '3', title: 'Dành cho Người lao động', icon: 'fa-briefcase', description: 'Cách tìm việc, đăng tin và làm việc an toàn.' },
        { id: '4', title: 'Dành cho Nhà tuyển dụng', icon: 'fa-building', description: 'Đăng tin tuyển dụng và quản lý ứng viên.' },
        { id: '5', title: 'Thanh toán & Gói cước', icon: 'fa-credit-card', description: 'Thông tin về Premium và các phương thức thanh toán.' },
        { id: '6', title: 'An toàn & Bảo mật', icon: 'fa-shield-alt', description: 'Báo cáo vi phạm và bảo vệ thông tin cá nhân.' },
    ];

    const popularArticles = [
        'Làm thế nào để thay đổi mật khẩu?',
        'Cách xác thực tài khoản (CCCD/CMND)',
        'Tôi nên viết mô tả công việc như thế nào?',
        'Làm sao để nhận được nhiều lời mời làm việc hơn?',
        'Quy trình giải quyết tranh chấp',
        'Huỷ gói Premium như thế nào?'
    ];

    return (
        <div className="bg-[#F3F2EF] min-h-screen font-sans">
            {/* LinkedIn Style Blue Header */}
            <header className="bg-[#483cbc] text-white -mt-3 py-12 shadow-lg">
                <div className="max-w-[1128px] mx-auto px-4">
                    <nav className="mb-8 flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-2 text-2xl font-bold hover:opacity-80 transition-opacity">
                            <i className="fas fa-link"></i>
                            <span>WorkConnect HELP</span>
                        </Link>
                        <div className="flex gap-4 text-sm font-semibold">
                            <Link to="/" className="hover:underline">Về trang chủ</Link>
                            <Link to="/contact" className="hover:underline">Liên hệ hỗ trợ</Link>
                        </div>
                    </nav>
                    <div className="text-center max-w-2xl mx-auto">
                        <h1 className="text-4xl font-bold mb-8">Chúng tôi có thể giúp gì cho bạn?</h1>
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="Tìm kiếm hướng dẫn, mẹo và nhiều hơn nữa..."
                                className="w-full px-6 py-4 rounded-full text-gray-900 shadow-2xl outline-none focus:ring-4 focus:ring-blue-200 transition-all text-lg pl-14"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <i className="fas fa-search absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 text-xl group-focus-within:text-[#483cbc]"></i>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-[1128px] mx-auto px-4 py-12">
                {/* Categories Grid */}
                <section className="mb-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                        <span className="w-2 h-8 bg-[#483cbc] rounded-full"></span>
                        Khám phá theo chủ đề
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categories.map((cat) => (
                            <div key={cat.id} className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-xl transition-all cursor-pointer group hover:-translate-y-1">
                                <div className="w-14 h-14 bg-blue-50 text-[#483cbc] rounded-2xl flex items-center justify-center mb-4 transition-colors group-hover:bg-[#483cbc] group-hover:text-white">
                                    <i className={`fas ${cat.icon} text-2xl`}></i>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#483cbc] transition-colors">{cat.title}</h3>
                                <p className="text-gray-500 leading-relaxed">{cat.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Articles Section */}
                    <section className="lg:col-span-2">
                        <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                            <i className="fas fa-star text-amber-500"></i>
                            Được quan tâm nhất
                        </h2>
                        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 shadow-sm overflow-hidden">
                            {popularArticles.map((article, idx) => (
                                <Link
                                    key={idx}
                                    to="#"
                                    className="flex items-center justify-between p-6 hover:bg-blue-50 transition-colors group"
                                >
                                    <span className="text-gray-700 font-medium group-hover:text-[#483cbc] group-hover:pl-2 transition-all">{article}</span>
                                    <i className="fas fa-chevron-right text-gray-300 group-hover:text-[#483cbc]"></i>
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* Sidebar Support */}
                    <aside className="space-y-6">
                        <div className="bg-[#483cbc] text-white p-8 rounded-2xl shadow-lg relative overflow-hidden group">
                            <div className="relative z-10">
                                <h3 className="text-xl font-bold mb-4">Bạn vẫn cần hỗ trợ?</h3>
                                <p className="mb-6 opacity-90 text-sm leading-relaxed">Đội ngũ hỗ trợ của WorkConnect luôn sẵn sàng giúp đỡ bạn 24/7.</p>
                                <button className="w-full bg-white text-[#483cbc] py-3 rounded-full font-bold hover:bg-gray-100 transition-colors shadow-md">
                                    Mở Ticket Hỗ Trợ
                                </button>
                            </div>
                            <i className="fas fa-comments absolute -bottom-10 -right-10 text-9xl opacity-10 group-hover:scale-110 transition-transform"></i>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4 uppercase text-xs tracking-wider">Cộng đồng WorkConnect</h3>
                            <p className="text-gray-500 text-sm mb-4 leading-relaxed">Tham gia thảo luận và học hỏi kinh nghiệm từ các thành viên khác.</p>
                            <button className="text-[#483cbc] font-bold text-sm hover:underline flex items-center gap-2">
                                Truy cập diễn đàn <i className="fas fa-external-link-alt text-[10px]"></i>
                            </button>
                        </div>
                    </aside>
                </div>
            </main>

            <footer className="bg-white border-t border-gray-200 py-12 mt-12">
                <div className="max-w-[1128px] mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2 text-gray-400 font-bold">
                        <i className="fas fa-link"></i>
                        <span>WorkConnect © 2025</span>
                    </div>
                    <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-500 font-medium">
                        <Link to="#" className="hover:text-[#483cbc] hover:underline">Về chúng tôi</Link>
                        <Link to="#" className="hover:text-[#483cbc] hover:underline">Bảo mật & Điều khoản</Link>
                        <Link to="#" className="hover:text-[#483cbc] hover:underline">Cài đặt cookie</Link>
                        <Link to="#" className="hover:text-[#483cbc] hover:underline">Quản lý quảng cáo</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HelpCenter;
