import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [view, setView] = useState<'main' | 'password' | 'profile' | 'verification'>('main');

    // Initial position: Bottom Right
    const [position, setPosition] = useState({
        x: window.innerWidth - 420,
        y: window.innerHeight - 620
    });

    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const modalRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (modalRef.current && (e.target as HTMLElement).closest('.draggable-header')) {
            setIsDragging(true);
            const rect = modalRef.current.getBoundingClientRect();
            setDragOffset({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
        }
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragOffset.x,
                y: e.clientY - dragOffset.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    if (!isOpen) return null;

    const renderContent = () => {
        switch (view) {
            case 'password':
                return (
                    <div className="space-y-4 animate-fadeIn">
                        <button onClick={() => setView('main')} className="text-[#4c42bd] text-xs font-bold flex items-center gap-1 hover:underline mb-2">
                            <i className="fas fa-arrow-left"></i> Quay lại
                        </button>
                        <h3 className="text-base font-bold text-gray-900">Thay đổi mật khẩu</h3>
                        <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                            <p>Để đảm bảo an toàn, chúng tôi khuyên bạn nên đổi mật khẩu định kỳ 6 tháng một lần.</p>
                            <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-2">
                                <div className="flex gap-2">
                                    <span className="bg-blue-100 text-blue-600 w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-bold">1</span>
                                    <p>Vào <strong>Cài đặt & Quyền riêng tư</strong> từ menu tài khoản.</p>
                                </div>
                                <div className="flex gap-2">
                                    <span className="bg-blue-100 text-blue-600 w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-bold">2</span>
                                    <p>Chọn mục <strong>Đăng nhập & Bảo mật</strong>.</p>
                                </div>
                                <div className="flex gap-2">
                                    <span className="bg-blue-100 text-blue-600 w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-bold">3</span>
                                    <p>Nhấp vào <strong>Thay đổi mật khẩu</strong> và nhập mật khẩu mới.</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/settings')}
                            className="w-full bg-[#4c42bd] text-white py-2 rounded-lg font-bold text-sm shadow-md hover:bg-[#3a32a0] transition-colors"
                        >
                            Đi tới Cài đặt ngay
                        </button>
                    </div>
                );
            case 'profile':
                return (
                    <div className="space-y-4 animate-fadeIn">
                        <button onClick={() => setView('main')} className="text-[#4c42bd] text-xs font-bold flex items-center gap-1 hover:underline mb-2">
                            <i className="fas fa-arrow-left"></i> Quay lại
                        </button>
                        <h3 className="text-base font-bold text-gray-900">Chỉnh sửa hồ sơ</h3>
                        <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                            <p>Một hồ sơ đầy đủ sẽ giúp bạn tăng 40% cơ hội nhận được công việc hoặc ứng viên phù hợp.</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Cập nhật ảnh đại diện chuyên nghiệp.</li>
                                <li>Bổ sung kỹ năng thực tế.</li>
                                <li>Ghi chi tiết lịch sử làm việc.</li>
                            </ul>
                        </div>
                        <button
                            onClick={() => navigate('/profile')}
                            className="w-full bg-[#4c42bd] text-white py-2 rounded-lg font-bold text-sm shadow-md hover:bg-[#3a32a0] transition-colors"
                        >
                            Chỉnh sửa hồ sơ của tôi
                        </button>
                    </div>
                );
            case 'verification':
                return (
                    <div className="space-y-4 animate-fadeIn">
                        <button onClick={() => setView('main')} className="text-[#4c42bd] text-xs font-bold flex items-center gap-1 hover:underline mb-2">
                            <i className="fas fa-arrow-left"></i> Quay lại
                        </button>
                        <h3 className="text-base font-bold text-gray-900">Xác thực tài khoản</h3>
                        <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                            <p>Xác thực giúp tài khoản của bạn uy tín hơn và tăng khả năng kết nối thành công.</p>
                            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                                <p className="text-amber-800 text-xs font-semibold mb-2">Bạn cần chuẩn bị:</p>
                                <ul className="list-disc pl-5 text-amber-900 text-[11px] space-y-1">
                                    <li>Ảnh chụp mặt trước CCCD/CMND.</li>
                                    <li>Ảnh chụp mặt sau CCCD/CMND.</li>
                                    <li>Một tấm ảnh chân dung rõ mặt.</li>
                                </ul>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/verification')}
                            className="w-full bg-[#4c42bd] text-white py-2 rounded-lg font-bold text-sm shadow-md hover:bg-[#3a32a0] transition-colors"
                        >
                            Đến trang xác thực
                        </button>
                    </div>
                );
            default:
                return (
                    <>
                        {/* Search */}
                        <div className="relative mb-6">
                            <input
                                type="text"
                                placeholder="Bạn cần giúp gì?"
                                className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:border-[#4c42bd] focus:ring-1 focus:ring-[#4c42bd] outline-none shadow-sm"
                            />
                            <i className="fas fa-search absolute left-3 top-2.5 text-gray-400"></i>
                        </div>

                        {/* Recommended Actions */}
                        <div className="mb-6">
                            <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 px-1">Gợi ý cho bạn</h3>
                            <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100 shadow-sm">
                                <button onClick={() => setView('password')} className="w-full text-left px-4 py-3 hover:bg-gray-50 flex justify-between items-center group transition-colors">
                                    <span className="text-sm text-gray-700 font-medium group-hover:text-[#4c42bd]">Thay đổi mật khẩu</span>
                                    <i className="fas fa-chevron-right text-xs text-gray-400 group-hover:translate-x-1 transition-transform"></i>
                                </button>
                                <button onClick={() => setView('profile')} className="w-full text-left px-4 py-3 hover:bg-gray-50 flex justify-between items-center group transition-colors">
                                    <span className="text-sm text-gray-700 font-medium group-hover:text-[#4c42bd]">Chỉnh sửa hồ sơ</span>
                                    <i className="fas fa-chevron-right text-xs text-gray-400 group-hover:translate-x-1 transition-transform"></i>
                                </button>
                                <button onClick={() => setView('verification')} className="w-full text-left px-4 py-3 hover:bg-gray-50 flex justify-between items-center group transition-colors">
                                    <span className="text-sm text-gray-700 font-medium group-hover:text-[#4c42bd]">Xác thực tài khoản</span>
                                    <i className="fas fa-chevron-right text-xs text-gray-400 group-hover:translate-x-1 transition-transform"></i>
                                </button>
                            </div>
                        </div>

                        {/* Popular Topics */}
                        <div className="mb-4">
                            <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 px-1">Chủ đề phổ biến</h3>
                            <div className="space-y-2">
                                <button onClick={() => navigate('/help-center')} className="w-full text-left text-sm text-[#4c42bd] font-semibold hover:underline bg-white p-3 rounded border border-gray-200 hover:border-[#4c42bd]/30 transition-colors flex justify-between items-center group">
                                    <span>Làm thế nào để xác thực tài khoản?</span>
                                    <i className="fas fa-external-link-alt text-[10px] opacity-0 group-hover:opacity-100"></i>
                                </button>
                                <button onClick={() => navigate('/help-center')} className="w-full text-left text-sm text-[#4c42bd] font-semibold hover:underline bg-white p-3 rounded border border-gray-200 hover:border-[#4c42bd]/30 transition-colors flex justify-between items-center group">
                                    <span>Chính sách bảo vệ người dùng</span>
                                    <i className="fas fa-external-link-alt text-[10px] opacity-0 group-hover:opacity-100"></i>
                                </button>
                            </div>
                        </div>
                    </>
                );
        }
    };

    return (
        <div className="fixed inset-0 z-[110] pointer-events-none">
            <div
                ref={modalRef}
                style={{ left: position.x, top: position.y }}
                className="pointer-events-auto fixed bg-white w-full sm:w-[400px] h-[500px] sm:h-auto sm:max-h-[600px] rounded-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden border border-gray-200"
                onMouseDown={handleMouseDown}
            >
                {/* Header - Now draggable cursor */}
                <div className="draggable-header bg-[#4c42bd] text-white p-4 flex justify-between items-center shrink-0 cursor-move select-none shadow-md">
                    <h2 className="font-bold text-sm flex items-center gap-2">
                        <i className="fas fa-question-circle"></i>
                        Trợ giúp WorkConnect
                    </h2>
                    <div className="flex gap-2 pointer-events-auto" onMouseDown={(e) => e.stopPropagation()}>
                        {view !== 'main' && (
                            <button onClick={() => setView('main')} className="hover:bg-white/20 rounded-full p-1.5 transition-colors">
                                <i className="fas fa-home text-sm"></i>
                            </button>
                        )}
                        <button onClick={onClose} className="hover:bg-white/20 rounded-full p-1.5 transition-colors">
                            <i className="fas fa-times text-lg"></i>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-grow overflow-y-auto p-4 bg-gray-50 custom-scrollbar" onMouseDown={(e) => e.stopPropagation()}>
                    {renderContent()}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 bg-white shrink-0 text-center" onMouseDown={(e) => e.stopPropagation()}>
                    <button
                        onClick={() => {
                            onClose();
                            navigate('/help-center');
                        }}
                        className="text-sm font-bold text-[#4c42bd] hover:bg-blue-50 py-2.5 rounded-lg border border-transparent hover:border-blue-100 transition-all flex items-center justify-center gap-2 w-full"
                    >
                        <i className="fas fa-external-link-alt"></i> Truy cập Trung tâm trợ giúp
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HelpModal;
