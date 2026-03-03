import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import Swal from 'sweetalert2';
import SidebarProfile from '../components/SidebarProfile';

const SettingsPage: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Settings state
    const [darkMode, setDarkMode] = useState(false);
    const [emailNotif, setEmailNotif] = useState(true);
    const [sound, setSound] = useState(true);
    const [autoPlay, setAutoPlay] = useState(true);
    const [profileVisibility, setProfileVisibility] = useState('public');

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (!user) return null;

    // Helper component for a Settings Section
    const SettingsSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
        <section className="border-b border-gray-100 last:border-0 py-4 first:pt-0">
            <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">{title}</h3>
            <div className="space-y-1">
                {children}
            </div>
        </section>
    );

    // Helper component for a Setting Item (Row)
    const SettingItem = ({
        label,
        desc,
        action
    }: {
        label: string,
        desc?: string,
        action: React.ReactNode
    }) => (
        <div className="flex items-center justify-between py-2 hover:bg-gray-50 -mx-2 px-2 rounded transition-colors group">
            <div className="flex-grow pr-4 min-w-0">
                <p className="text-sm font-semibold text-gray-800 group-hover:text-[#4c42bd] transition-colors truncate">{label}</p>
                {desc && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1 sm:line-clamp-none">{desc}</p>}
            </div>
            <div className="shrink-0">
                {action}
            </div>
        </div>
    );

    // Toggle Switch Component
    const Toggle = ({ checked, onChange }: { checked: boolean, onChange: (val: boolean) => void }) => (
        <button
            type="button"
            className={`w-10 h-5 rounded-full relative transition-colors ${checked ? 'bg-[#4c42bd]' : 'bg-gray-300'}`}
            onClick={() => onChange(!checked)}
        >
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${checked ? 'left-[22px]' : 'left-0.5'}`}></span>
        </button>
    );

    return (
        <div className="bg-[#F3F2EF] min-h-screen py-6 font-sans text-sm">
            <div className="max-w-[1128px] mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                    {/* LEFT SIDEBAR (Consistent with Verification Page) */}
                    <div className="md:col-span-3">
                        <SidebarProfile
                            user={user}
                            isWorker={user.role === UserRole.WORKER}
                            repScore={user.rating || 0}
                        />
                    </div>

                    {/* MAIN CONTENT (Settings) */}
                    <div className="md:col-span-9">
                        <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden">
                            {/* Header */}
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900">Cài đặt & Quyền riêng tư</h1>
                                    <p className="text-gray-500 mt-1">Quản lý tài khoản và trải nghiệm của bạn trên WorkConnect.</p>
                                </div>
                                <i className="fas fa-cog text-3xl text-gray-300"></i>
                            </div>

                            <div className="p-6">
                                {/* 1. Account Preferences */}
                                <SettingsSection title="Tùy chọn tài khoản">
                                    <SettingItem
                                        label="Thông tin cá nhân"
                                        desc="Tên, địa chỉ và thông tin liên hệ của bạn"
                                        action={<button onClick={() => navigate('/profile')} className="text-xs font-bold text-gray-500 hover:text-[#4c42bd]">Chỉnh sửa</button>}
                                    />
                                    <SettingItem
                                        label="Hiển thị chế độ tối"
                                        desc="Điều chỉnh giao diện sáng/tối để bảo vệ mắt"
                                        action={<Toggle checked={darkMode} onChange={setDarkMode} />}
                                    />
                                    <SettingItem
                                        label="Ngôn ngữ"
                                        desc="Chọn ngôn ngữ bạn muốn sử dụng"
                                        action={
                                            <select className="text-xs border border-gray-300 rounded p-1 outline-none text-gray-600 bg-white">
                                                <option>Tiếng Việt</option>
                                                <option>English</option>
                                            </select>
                                        }
                                    />
                                </SettingsSection>

                                {/* 2. Privacy & Visibility */}
                                <SettingsSection title="Quyền riêng tư & Hiển thị">
                                    <SettingItem
                                        label="Ai có thể thấy hồ sơ của bạn?"
                                        desc="Kiểm soát cách người khác tìm thấy bạn"
                                        action={
                                            <select
                                                value={profileVisibility}
                                                onChange={(e) => setProfileVisibility(e.target.value)}
                                                className="text-xs border border-gray-300 rounded p-1 outline-none text-gray-600 bg-white"
                                            >
                                                <option value="public">Công khai (Mọi người)</option>
                                                <option value="connections">Chỉ kết nối</option>
                                                <option value="private">Chỉ mình tôi</option>
                                            </select>
                                        }
                                    />
                                    <SettingItem
                                        label="Trạng thái hoạt động"
                                        desc="Cho phép người khác biết khi nào bạn online"
                                        action={<Toggle checked={true} onChange={() => { }} />}
                                    />
                                    <SettingItem
                                        label="Chia sẻ dữ liệu với đối tác"
                                        desc="Cho phép đối tác xem dữ liệu ẩn danh của bạn"
                                        action={<Toggle checked={false} onChange={() => { }} />}
                                    />
                                </SettingsSection>

                                {/* 3. Notifications */}
                                <SettingsSection title="Thông báo">
                                    <SettingItem
                                        label="Thông báo qua Email"
                                        desc="Nhận email về việc làm mới, tin nhắn, và cập nhật"
                                        action={<Toggle checked={emailNotif} onChange={setEmailNotif} />}
                                    />
                                    <SettingItem
                                        label="Âm thanh thông báo"
                                        desc="Phát âm thanh khi có thông báo mới trên web"
                                        action={<Toggle checked={sound} onChange={setSound} />}
                                    />
                                </SettingsSection>

                                {/* 4. General Preferences */}
                                <SettingsSection title="Tùy chọn chung">
                                    <SettingItem
                                        label="Tự động phát video"
                                        desc="Video sẽ tự động phát khi lướt bản tin"
                                        action={<Toggle checked={autoPlay} onChange={setAutoPlay} />}
                                    />
                                </SettingsSection>

                                {/* 5. Account Management */}
                                <SettingsSection title="Quản lý tài khoản">
                                    <SettingItem
                                        label="Đăng xuất tài khoản"
                                        desc="Đăng xuất khỏi tất cả các thiết bị"
                                        action={<button onClick={handleLogout} className="text-xs font-bold text-gray-600 hover:text-black">Đăng xuất</button>}
                                    />
                                    <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-lg">
                                        <h4 className="text-sm font-bold text-red-800 mb-1">Đóng tài khoản</h4>
                                        <p className="text-xs text-red-600 mb-3">Hành động này sẽ xóa vĩnh viễn tài khoản và dữ liệu của bạn.</p>
                                        <button
                                            onClick={() => Swal.fire({ icon: 'warning', title: 'Đã khóa', text: 'Chức năng này đang bị khóa vì lý do an toàn.' })}
                                            className="px-4 py-1.5 border border-red-300 text-red-700 font-bold text-xs rounded-full hover:bg-red-100 transition-colors bg-white"
                                        >
                                            Tiếp tục đóng tài khoản
                                        </button>
                                    </div>
                                </SettingsSection>

                                <div className="mt-8 pt-4 border-t border-gray-100 text-center text-xs text-gray-400">
                                    <p>WorkConnect User Settings · Phiên bản 1.0.5</p>
                                </div>
                            </div>
                        </div>

                        {/* LinkedIn-style mini footer */}
                        <div className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-2 text-[11px] text-gray-500">
                            <span className="hover:underline cursor-pointer">Về chúng tôi</span>
                            <span className="hover:underline cursor-pointer">Trợ giúp</span>
                            <span className="hover:underline cursor-pointer">Điều khoản & Quyền riêng tư</span>
                            <span className="hover:underline cursor-pointer">Chính sách quảng cáo</span>
                            <span className="font-bold">WorkConnect © 2025</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
