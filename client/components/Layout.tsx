import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { useNotifications } from '../contexts/NotificationContext';
import { formatTimeAgo } from '../pages/Home';


import HelpModal from './HelpModal';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setShowMobileMenu(false);
      }
    }

    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
    navigate('/');
  };

  const isBusiness = String(user?.role).toUpperCase() === UserRole.BUSINESS;

  // Helper check active link
  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };



  // Component MenuItem (Compact style)
  const MenuItem = ({ to, icon, label, active = false, onClick, className = '' }: { to?: string, icon: string, label: string, active?: boolean, onClick?: () => void, className?: string }) => {
    const content = (
      <div
        className={`relative flex flex-col items-center justify-center min-w-[40px] md:min-w-[50px] px-1 md:w-auto h-full transition-colors group ${className}
          ${active ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
        onClick={onClick}
      >
        <div className="relative flex items-center justify-center">
          <i className={`fas ${icon} text-lg mb-0 ${active ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-700'}`}></i>
          {label === 'Thông báo' && unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>
          )}
        </div>

        <span className={`text-[10px] hidden lg:block leading-tight mt-0.5 ${active ? 'font-semibold' : 'font-normal'}`}>
          {label}
        </span>
      </div>
    );

    return to ? <Link to={to} className={className}>{content}</Link> : content;
  };

  const isOnboarding = location.pathname === '/onboarding';

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F2EF] font-sans">

      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />

      {/* === HEADER COMPACT (Dynamic Height) === */}
      {!isOnboarding && (
        <header className={`bg-white border-b border-gray-200 sticky top-0 z-[120] flex items-center justify-center shadow-sm transition-all duration-300 ${scrolled ? 'h-[52px]' : 'h-[64px]'}`}>
          <nav className="w-full max-w-[1128px] px-0 sm:px-4 h-full flex items-center justify-between relative">

            {/* LEFT: LOGO CỦA BẠN (Đã bỏ Search Bar) */}
            <div className="flex items-center gap-3 pl-2 md:pl-0 transition-all duration-300">
              <Link to="/" className="flex items-center gap-1.5 text-indigo-700 hover:text-indigo-800 transition-colors no-underline">
                <i className={`fas fa-link transition-all duration-300 ${scrolled ? 'text-2xl' : 'text-3xl'}`}></i>
                <span className={`font-black tracking-tighter hidden lg:block leading-none transition-all duration-300 ${scrolled ? 'text-xl pt-0.5' : 'text-2xl pt-1'}`}>WORKCONNECT</span>
              </Link>
            </div>

            {/* CONTAINER MENU (Right Side mostly for User) */}
            <div className="flex items-center h-full ml-auto">

              {/* --- NHÓM 1: CÁC MỤC MENU CHÍNH (CĂN GIỮA TUYỆT ĐỐI) --- */}
              <div className="flex absolute left-1/2 -translate-x-1/2 h-full gap-1 sm:gap-4 md:gap-6 items-center justify-center z-10">

                {/* NORMAL MENU (> 320px) */}
                <div className="contents max-[320px]:hidden">
                  <MenuItem to="/" icon="fa-home" label="Trang chủ" active={isActive('/')} />
                  <MenuItem to="/companies" icon="fa-building" label="Công ty" active={isActive('/companies')} className="max-[340px]:hidden" />
                  <MenuItem to="/resources" icon="fa-book-open" label="Cẩm nang" active={isActive('/resources')} className="max-[360px]:hidden" />

                  {!isBusiness && (
                    <MenuItem to="/jobs" icon="fa-briefcase" label="Việc làm" active={isActive('/jobs')} />
                  )}

                  {isBusiness && (
                    <MenuItem to="/recruitment" icon="fa-user-tie" label="Tuyển dụng" active={isActive('/recruitment')} />
                  )}

                  {user?.role === 'WORKER' && (
                    <MenuItem
                      to="/worker-manager"
                      icon="fa-tasks"
                      label="Bài đăng"
                      active={isActive('/worker-manager')}
                    />
                  )}

                  {user && (
                    <MenuItem to="/dashboard" icon="fa-th" label="Bảng điều khiển" active={isActive('/dashboard')} />
                  )}
                </div>

                {/* OVERFLOW MENU (< 320px) */}
                <div className="hidden max-[320px]:block relative" ref={mobileMenuRef}>
                  <button
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                    className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <i className="fas fa-bars text-lg"></i>
                  </button>
                  {showMobileMenu && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 p-2 z-[100] animate-in fade-in zoom-in-95 duration-200">
                      <div className="flex flex-col gap-1">
                        <Link to="/" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg text-sm text-gray-700 font-medium">
                          <i className="fas fa-home w-5 text-center text-gray-400"></i> Trang chủ
                        </Link>
                        {!isBusiness && (
                          <Link to="/jobs" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg text-sm text-gray-700 font-medium">
                            <i className="fas fa-briefcase w-5 text-center text-gray-400"></i> Việc làm
                          </Link>
                        )}
                        {isBusiness && (
                          <Link to="/recruitment" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg text-sm text-gray-700 font-medium">
                            <i className="fas fa-user-tie w-5 text-center text-gray-400"></i> Tuyển dụng
                          </Link>
                        )}
                        <Link to="/companies" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg text-sm text-gray-700 font-medium">
                          <i className="fas fa-building w-5 text-center text-gray-400"></i> Công ty
                        </Link>
                        <Link to="/resources" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg text-sm text-gray-700 font-medium">
                          <i className="fas fa-book-open w-5 text-center text-gray-400"></i> Cẩm nang
                        </Link>
                        {user && (
                          <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg text-sm text-gray-700 font-medium">
                            <i className="fas fa-th w-5 text-center text-gray-400"></i> Bảng điều khiển
                          </Link>
                        )}
                        {user?.role === 'WORKER' && (
                          <Link to="/worker-manager" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg text-sm text-gray-700 font-medium">
                            <i className="fas fa-tasks w-5 text-center text-gray-400"></i> Bài đăng
                          </Link>
                        )}
                        {user && (
                          <Link to="/messages" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg text-sm text-gray-700 font-medium">
                            <i className="fas fa-comment-dots w-5 text-center text-gray-400"></i> Nhắn tin
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {/* --- NHÓM 2: USER & THÔNG BÁO (NẰM BÊN PHẢI) --- */}
              <div className="flex items-center h-full gap-1 md:gap-2 z-20">
                <div className="h-full border-l border-gray-200 mx-2 hidden md:block"></div>
                {/* Nhắn tin */}
                {user && (
                  <div className="hidden md:block h-full relative">
                    <MenuItem to="/messages" icon="fa-comment-dots" label="Nhắn tin" active={isActive('/messages')} />
                  </div>
                )}
                {/* Thông báo */}
                {user && (
                  <div className="hidden md:block h-full relative" ref={notificationRef}>
                    <MenuItem icon="fa-bell" label="Thông báo" onClick={() => setShowNotifications(!showNotifications)} />
                    {showNotifications && (
                      <div className="absolute top-[105%] right-0 w-80 bg-white rounded-lg shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.15)] py-2 z-[100]">
                        <h3 className="px-4 py-2 text-sm font-bold text-gray-900 border-b border-gray-100">Thông báo</h3>
                        <div className="max-h-80 overflow-y-auto">
                          {user && !user.verified && (
                            <Link
                              to="/verification"
                              className="px-4 py-3 bg-amber-50 hover:bg-amber-100 border-b border-amber-100 flex gap-3 items-start"
                              onClick={() => setShowNotifications(false)}
                            >
                              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                                <i className="fas fa-user-shield text-xs"></i>
                              </div>
                              <div>
                                <p className="text-[12px] font-bold text-amber-900">Xác thực hồ sơ ngay</p>
                                <p className="text-[10px] text-amber-700 leading-tight mt-0.5">Tăng độ uy tín và mở khóa đầy đủ tính năng tuyển dụng.</p>
                              </div>
                            </Link>
                          )}

                          {notifications.slice(0, 10).map(notif => (
                            <div
                              key={notif.id}
                              className={`px-4 py-3 hover:bg-gray-100 border-b border-gray-100 last:border-none cursor-pointer flex gap-3 ${notif.isRead ? 'bg-white' : 'bg-blue-50/50'}`}
                              onClick={() => {
                                if (!notif.isRead) markAsRead(notif.id);
                                setShowNotifications(false);
                                navigate('/notifications');
                              }}
                            >
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${notif.type === 'FOLLOW' ? 'bg-blue-100 text-blue-600' :
                                notif.type === 'RATING' ? 'bg-amber-100 text-amber-600' :
                                  notif.type === 'JOB_STATUS' ? 'bg-green-100 text-green-600' :
                                    'bg-gray-100 text-gray-500'
                                }`}>
                                <i className={`fas ${notif.type === 'FOLLOW' ? 'fa-user-plus' :
                                  notif.type === 'RATING' ? 'fa-star' :
                                    notif.type === 'JOB_STATUS' ? 'fa-briefcase' :
                                      'fa-bell'
                                  } text-xs`}></i>
                              </div>
                              <div>
                                <p className={`text-[13px] ${notif.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>{notif.message}</p>
                                <p className="text-[10px] text-gray-400 mt-1">{formatTimeAgo(notif.createdAt)}</p>
                              </div>
                            </div>
                          ))}
                          {notifications.length === 0 && (
                            <p className="text-center text-sm text-gray-500 py-4">Chưa có thông báo mới</p>
                          )}
                        </div>
                        <div className="border-t border-gray-100 pt-2 text-center">
                          <Link to="/notifications" className="text-xs font-bold text-[#4c42bd] hover:underline">Xem tất cả</Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* User Dropdown */}
                {user ? (
                  <div
                    ref={userMenuRef}
                    className={`relative h-full flex flex-col items-center justify-center min-w-[32px] md:w-auto cursor-pointer border-b-2 transition-colors px-1
                        ${showUserMenu ? 'border-gray-900' : 'border-transparent'}`}
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    title={user?.name || user?.fullName || user?.username}
                  >
                    <img
                      src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || user?.username}`}
                      className="w-8 h-8 mt-1 rounded-full object-cover border-2 border-[#232837]"
                      alt="Me"
                    />
                    <i className="fas fa-caret-down text-gray-500 text-[10px] hidden md:block"></i>
                    {/* Dropdown Menu */}
                    {showUserMenu && (
                      <div className="absolute top-[105%] right-0 w-80 bg-white rounded-lg shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.15)] py-2 z-[100]">
                        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                          <img src={user.avatar} className="w-12 h-12 rounded-full border border-gray-200" alt="Avatar" />
                          <div className="overflow-hidden flex-grow">
                            <p className="font-bold text-gray-900 text-sm truncate">{user.name || user.fullName || user.username}</p>
                            {user.numericId && (
                              <p className="text-[10px] text-[#4c42bd] font-bold">ID: {user.numericId}</p>
                            )}
                            <p className="text-xs text-gray-500 truncate">{isBusiness ? 'Nhà tuyển dụng' : 'Freelancer'}</p>
                          </div>
                          {/* Mobile Notification Icon inside Dropdown */}
                          <Link to="/notifications" className="md:hidden relative text-gray-500 hover:text-gray-900 p-1">
                            <i className="fas fa-bell text-lg"></i>
                            {unreadCount > 0 && (
                              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>
                            )}
                          </Link>
                        </div>
                        <div className="px-4 py-2 flex gap-2">
                          <Link to="/profile" className="flex-1 bg-[#4c42bd] text-white text-center py-1.5 rounded-full text-xs font-bold hover:bg-[#004182] transition-colors">
                            Xem hồ sơ
                          </Link>
                        </div>
                        <div className="border-t border-gray-100 mt-2 pt-2">
                          <h3 className="px-4 text-xs font-bold text-gray-900 uppercase tracking-wide mb-1">Tài khoản</h3>
                          <Link to="/premium" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-xs font-medium text-gray-600">
                            <i className="fas fa-crown text-amber-600 text-[10px]"></i>
                            <span>Thử 1 tháng Premium với ₫0</span>
                          </Link>
                          <Link to="/settings" className="block px-4 py-2 hover:bg-gray-100 text-xs font-medium text-gray-600">
                            Cài đặt & Quyền riêng tư
                          </Link>
                          <button
                            onClick={() => { setShowHelp(true); setShowUserMenu(false); }}
                            className="w-full text-left block px-4 py-2 hover:bg-gray-100 text-xs font-medium text-gray-600"
                          >
                            Trợ giúp
                          </button>
                        </div>
                        <div className="border-t border-gray-100 mt-2 pt-2">
                          <h3 className="px-4 text-xs font-bold text-gray-900 uppercase tracking-wide mb-1">Quản lý</h3>
                          <Link to="/dashboard" className="block px-4 py-2 hover:bg-gray-100 text-xs font-medium text-gray-600">
                            Bảng điều khiển
                          </Link>
                          {isBusiness ? (
                            <>
                              <Link to="/recruitment" className="block px-4 py-2 hover:bg-gray-100 text-xs font-medium text-gray-600">
                                Quản lý tin tuyển dụng
                              </Link>
                              <Link to="/saved-jobs" className="block px-4 py-2 hover:bg-gray-100 text-xs font-medium text-gray-600">
                                Mục đã lưu
                              </Link>
                              <Link to="/jobs/post" className="block px-4 py-2 hover:bg-gray-100 text-xs font-medium text-gray-600">
                                Đăng tin tuyển dụng
                              </Link>
                            </>
                          ) : (
                            <>
                              <Link to="/worker-manager" className="block px-4 py-2 hover:bg-gray-100 text-xs font-medium text-gray-600">
                                Bài đăng & Ứng tuyển
                              </Link>
                              <Link to="/saved-jobs" className="block px-4 py-2 hover:bg-gray-100 text-xs font-medium text-gray-600">
                                Việc làm đã lưu
                              </Link>
                            </>
                          )}
                        </div>
                        <div className="border-t border-gray-100 mt-2 pt-2">
                          <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-gray-100 text-xs font-medium text-gray-600">
                            Đăng xuất
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Chưa đăng nhập */
                  <div className="flex items-center gap-2 h-full pl-2">
                    <Link
                      to="/login"
                      className="px-4 py-1.5 text-xs font-bold text-indigo-700 border border-indigo-700 hover:bg-indigo-50 rounded-full transition-colors whitespace-nowrap"
                    >
                      Đăng nhập
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </nav>
        </header>
      )}

      <main className="flex-grow pt-3 pb-6">
        {children}
      </main>
    </div >
  );
};

export default Layout;
