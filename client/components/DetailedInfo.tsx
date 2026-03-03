import React from 'react';
import { User, UserRole } from '../types';

interface DetailedInfoProps {
    profile: any; // Using any to accommodate varies DTOs if necessary, but ideally User
    isBusiness: boolean;
    showDetails: boolean;
    onToggle?: () => void;
    isCard?: boolean; // Whether to wrap in a card style or just return the content
}

const DetailedInfo: React.FC<DetailedInfoProps> = ({ profile, isBusiness, showDetails, onToggle, isCard = true }) => {
    const content = (
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-10">
            <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {isBusiness ? 'Ngày thành lập' : 'Ngày sinh'}
                </p>
                <div className="flex items-center gap-2">
                    <i className="far fa-calendar-alt text-gray-400"></i>
                    <p className="font-semibold text-gray-700">{profile.dob || 'Chưa cập nhật'}</p>
                </div>
            </div>

            {!isBusiness && (
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Giới tính</p>
                    <div className="flex items-center gap-2">
                        <i className="fas fa-venus-mars text-gray-400"></i>
                        <p className="font-semibold text-gray-700">{profile.gender || 'Chưa cập nhật'}</p>
                    </div>
                </div>
            )}

            <div className="md:col-span-2 space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Địa chỉ</p>
                <div className="flex items-center gap-2">
                    <i className="fas fa-home text-gray-400"></i>
                    <p className="font-semibold text-gray-700">{profile.address || profile.location || 'Chưa cập nhật'}</p>
                </div>
            </div>

            <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Số điện thoại</p>
                <div className="flex items-center gap-2">
                    <i className="fas fa-phone-alt text-gray-400"></i>
                    <p className="font-semibold text-gray-700">{profile.phone || 'Chưa cập nhật'}</p>
                </div>
            </div>

            <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email liên hệ</p>
                <div className="flex items-center gap-2">
                    <i className="far fa-envelope text-gray-400"></i>
                    <p className="font-semibold text-gray-700">{profile.email}</p>
                </div>
            </div>

            {isBusiness && (
                <>
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mã số thuế</p>
                        <div className="flex items-center gap-2">
                            <i className="fas fa-file-invoice-dollar text-gray-400"></i>
                            <p className="font-semibold text-gray-700">{profile.taxCode || 'Chưa cập nhật'}</p>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Quy mô Nhà tuyển dụng</p>
                        <div className="flex items-center gap-2">
                            <i className="fas fa-users-cog text-gray-400"></i>
                            <p className="font-semibold text-gray-700">{profile.scale || 'Chưa cập nhật'}</p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );

    if (!isCard) return content;

    return (
        <div className="bg-white rounded-lg border border-gray-300 overflow-hidden mb-2 shadow-sm">
            {onToggle && (
                <button
                    onClick={onToggle}
                    className="w-full px-5 py-4 flex justify-between items-center bg-white hover:bg-gray-50 transition-colors group"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-[#4c42bd] flex items-center justify-center">
                            <i className="fas fa-info-circle"></i>
                        </div>
                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Thông tin chi tiết</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400 font-bold group-hover:text-gray-600 transition-colors">
                            {showDetails ? 'Thu gọn' : 'Xem thêm'}
                        </span>
                        <i className={`fas fa-chevron-${showDetails ? 'up' : 'down'} text-gray-400 transition-transform duration-300`}></i>
                    </div>
                </button>
            )}

            <div className={`transition-all duration-300 ease-in-out border-t border-gray-100 ${showDetails ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                {content}
            </div>
        </div>
    );
};

export default DetailedInfo;
