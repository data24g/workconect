
import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationPanel from './NotificationPanel';
import { getImageUrl, getInitialsAvatar } from '../utils/imageUtils';

const SidebarLink: React.FC<{ to: string, icon: string, label: string, active: boolean, badge?: number, isWarning?: boolean }> = ({ to, icon, label, active, badge, isWarning }) => (
  <Link
    to={to}
    className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${active ? 'bg-white/20 backdrop-blur-sm text-white shadow-lg border border-white/10' : 'text-purple-200 hover:bg-white/10 hover:text-white'
      }`}
  >
    <div className="flex items-center gap-3">
      <i className={`fas ${icon} w-5 text-center ${active ? 'text-white' : 'text-purple-300 group-hover:text-white'}`}></i>
      <span className="font-semibold text-sm whitespace-nowrap">{label}</span>
    </div>
    {badge && badge > 0 ? (
      <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${isWarning ? 'bg-red-500 text-white shadow-lg shadow-red-500/50 animate-pulse-slow' :
        active ? 'bg-white text-purple-700' :
          'bg-purple-600/50 text-white'
        }`}>
        {badge}
      </span>
    ) : null}
  </Link>
);

const Layout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const navigation = [
    {
      group: "Bàn làm việc",
      links: [
        { to: "/", icon: "fa-house", label: "Tổng quan" },
        { to: "/audit", icon: "fa-shield-halved", label: "Nhật ký hệ thống" },
      ]
    },
    {
      group: "MVP Quản trị",
      links: [
        { to: "/applicants", icon: "fa-user-tie", label: "Người ứng tuyển" },
        { to: "/identity", icon: "fa-id-card", label: "Xác thực CCCD" },
        { to: "/businesses", icon: "fa-building", label: "Doanh nghiệp" },
        { to: "/verify", icon: "fa-building-circle-check", label: "Duyệt doanh nghiệp", badge: 3 },
        { to: "/jobs", icon: "fa-briefcase", label: "Quản lý Công việc", badge: 12 },
        { to: "/news", icon: "fa-newspaper", label: "Quản lý Bài viết" },
        { to: "/reports", icon: "fa-flag", label: "Báo cáo vi phạm", badge: 5, isWarning: true },
      ]
    },
    {
      group: "Phiên bản đầy đủ",
      links: [
        { to: "/sessions", icon: "fa-clock-rotate-left", label: "Phiên làm việc", badge: 2 },
        { to: "/fraud", icon: "fa-mask", label: "Chống gian lận" },
        { to: "/monetization", icon: "fa-credit-card", label: "Gói dịch vụ" },
        { to: "/badges", icon: "fa-award", label: "Hệ thống uy tín" },
      ]
    },
    {
      group: "Cấu hình",
      links: [
        { to: "/settings", icon: "fa-gears", label: "Cài đặt" },
      ]
    }
  ];

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans selection:bg-purple-100 selection:text-purple-900">
      {/* Purple Gradient Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-20'} bg-gradient-to-b from-purple-700 via-purple-800 to-purple-900 transition-all duration-300 flex flex-col fixed h-full z-30 shadow-2xl`}>
        {/* Logo Section */}
        <div className="h-20 flex items-center gap-3 px-6 border-b border-purple-600/30 overflow-hidden">
          <div className="bg-white p-2.5 rounded-2xl shadow-lg shrink-0">
            <i className="fas fa-briefcase text-purple-700 text-xl"></i>
          </div>
          {isSidebarOpen && <span className="font-black text-2xl tracking-tight text-white">Work<span className="text-purple-300">Connect</span></span>}
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 custom-scrollbar">
          {navigation.map((section, idx) => (
            <div key={idx}>
              {isSidebarOpen && <h3 className="px-4 text-[10px] font-bold text-purple-300 uppercase tracking-[0.15em] mb-4 opacity-60">{section.group}</h3>}
              <div className="space-y-2">
                {section.links.map(link => (
                  <SidebarLink
                    key={link.to}
                    {...link}
                    active={location.pathname === link.to}
                    label={isSidebarOpen ? link.label : ""}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* User Profile Section */}
        <div className="p-4 border-t border-purple-600/30">
          <div className="flex items-center gap-3 bg-purple-600/30 backdrop-blur-sm p-3 rounded-2xl border border-purple-500/20 shadow-lg">
            <div className="relative">
              <img
                src={getImageUrl(user?.avatar, getInitialsAvatar(user?.name || 'Admin'))}
                className="w-10 h-10 rounded-xl ring-2 ring-white/20"
                alt="Admin"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-purple-800"></span>
            </div>
            {isSidebarOpen && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white truncate leading-none mb-1.5">{user?.name}</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold text-purple-200">Quản trị viên</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      <div className={`${isSidebarOpen ? 'ml-72' : 'ml-20'} flex-1 flex flex-col transition-all duration-300 min-w-0`}>
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-20 shadow-sm">
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="w-11 h-11 flex items-center justify-center hover:bg-gray-100 rounded-xl text-gray-600 transition-all hover:scale-105 active:scale-95">
            <i className={`fas ${isSidebarOpen ? 'fa-indent' : 'fa-outdent'}`}></i>
          </button>

          <div className="flex items-center gap-5">
            {/* Search Bar */}
            <div className="relative hidden md:block">
              <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all w-64"
              />
            </div>

            {/* Notifications */}
            <NotificationPanel />

            {/* Divider */}
            <div className="h-8 w-[1px] bg-gray-200 mx-1"></div>

            {/* Date Display */}
            <div className="bg-purple-50 text-purple-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm">
              <i className="fas fa-calendar-day"></i>
              <span>{new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        </header>

        <main className="p-8 flex-1 overflow-x-hidden bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
