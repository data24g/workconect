import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import Swal from 'sweetalert2';
import SidebarProfile from '../components/SidebarProfile';
import userApi from '../apis/api_user';

const VerificationPage: React.FC = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();

    const isBusiness = user?.role === UserRole.BUSINESS;
    const isEnterprise = (user as any)?.accountType === 'enterprise';

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        email: user?.email || '',
        phone: (user as any)?.phone || '',
        companyName: (user as any)?.companyName || '',
        taxCode: (user as any)?.taxCode || '',
        businessRegCode: (user as any)?.businessRegistrationCode || '',
        legalRepresentative: (user as any)?.legalRepresentative || '',
    });

    const [previewFront, setPreviewFront] = useState<string | null>(null);
    const [previewBack, setPreviewBack] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                if (side === 'front') {
                    setPreviewFront(reader.result as string);
                } else {
                    setPreviewBack(reader.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        Swal.fire({
            title: 'Đang gửi hồ sơ xác thực...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            // Real API call
            await userApi.verify(user.id, formData);

            const updatedUser = {
                ...user,
                ...formData,
                verificationStatus: 'PENDING', // Locally show pending
            };

            updateUser(updatedUser);
            await Swal.fire({
                icon: 'success',
                title: 'Hồ sơ đã được gửi',
                text: 'Hồ sơ xác thực của bạn đã được gửi và đang chờ Admin phê duyệt!',
                timer: 3000,
                showConfirmButton: true
            });
            navigate('/profile');
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Có lỗi xảy ra, vui lòng thử lại.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) return null;

    return (
        <div className="bg-[#F3F2EF] min-h-screen py-6 font-sans text-sm">
            <div className="max-w-[1128px] mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                    {/* LEFT SIDEBAR */}
                    <div className="md:col-span-3">
                        <SidebarProfile
                            user={user}
                            isWorker={user.role === UserRole.WORKER}
                            repScore={user.rating || 0}
                        />
                    </div>

                    {/* MAIN CONTENT */}
                    <div className="md:col-span-9">
                        <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900">Xác thực danh tính</h1>
                                    <p className="text-gray-500 mt-1">Hoàn thành các bước dưới đây để nhận dấu tích xanh tài khoản uy tín.</p>
                                </div>
                                <i className="fas fa-user-shield text-3xl text-[#4c42bd] opacity-20"></i>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 mb-5 space-y-8">
                                {/* Basic Info */}
                                <section className="space-y-4">
                                    <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                                        <span className="w-6 h-6 bg-[#4c42bd] text-white rounded-full flex items-center justify-center text-[10px]">1</span>
                                        Thông tin cơ bản
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-700">Email xác thực</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                    className="flex-grow p-2 border border-gray-300 rounded outline-none focus:ring-1 focus:ring-[#4c42bd]"
                                                    placeholder="example@gmail.com"
                                                />
                                                <button type="button" className="px-3 py-1 bg-gray-100 text-gray-600 rounded font-bold text-xs hover:bg-gray-200">Gửi mã</button>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-700">Số điện thoại</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="tel"
                                                    value={formData.phone}
                                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                    className="flex-grow p-2 border border-gray-300 rounded outline-none focus:ring-1 focus:ring-[#4c42bd]"
                                                    placeholder="098xxxxxxxx"
                                                />
                                                <button type="button" className="px-3 py-1 bg-gray-100 text-gray-600 rounded font-bold text-xs hover:bg-gray-200">Gửi OTP</button>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Identity Document */}
                                <section className="space-y-4">
                                    <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                                        <span className="w-6 h-6 bg-[#4c42bd] text-white rounded-full flex items-center justify-center text-[10px]">2</span>
                                        Giấy tờ tùy thân (CCCD/CMND)
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {/* Mặt trước */}
                                            <div
                                                className="h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors group relative overflow-hidden"
                                                onClick={() => document.getElementById('cccd-front')?.click()}
                                            >
                                                <input
                                                    type="file"
                                                    id="cccd-front"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={(e) => handleFileChange(e, 'front')}
                                                />
                                                {previewFront ? (
                                                    <img src={previewFront} className="w-full h-full object-cover" alt="CCCD Mặt trước" />
                                                ) : (
                                                    <>
                                                        <i className="fas fa-id-card text-2xl text-gray-300 group-hover:text-[#4c42bd] transition-colors mb-2"></i>
                                                        <p className="text-[10px] font-bold text-gray-600">CCCD Mặt trước</p>
                                                    </>
                                                )}
                                                {previewFront && (
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <span className="text-white text-[10px] font-bold">Thay đổi</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Mặt sau */}
                                            <div
                                                className="h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors group relative overflow-hidden"
                                                onClick={() => document.getElementById('cccd-back')?.click()}
                                            >
                                                <input
                                                    type="file"
                                                    id="cccd-back"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={(e) => handleFileChange(e, 'back')}
                                                />
                                                {previewBack ? (
                                                    <img src={previewBack} className="w-full h-full object-cover" alt="CCCD Mặt sau" />
                                                ) : (
                                                    <>
                                                        <i className="fas fa-id-card text-2xl text-gray-300 group-hover:text-[#4c42bd] transition-colors mb-2"></i>
                                                        <p className="text-[10px] font-bold text-gray-600">CCCD Mặt sau</p>
                                                    </>
                                                )}
                                                {previewBack && (
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <span className="text-white text-[10px] font-bold">Thay đổi</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-3 bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                                            <h4 className="text-xs font-bold text-[#4c42bd] flex items-center gap-1">
                                                <i className="fas fa-info-circle"></i> Lưu ý khi chụp ảnh:
                                            </h4>
                                            <ul className="text-[11px] text-gray-600 space-y-2">
                                                <li className="flex gap-2"><i className="fas fa-check text-green-500 pt-0.5"></i> Ảnh chụp rõ nét, không bị lóa hoặc mất góc.</li>
                                                <li className="flex gap-2"><i className="fas fa-check text-green-500 pt-0.5"></i> Giấy tờ còn hạn sử dụng, không bị rách nát.</li>
                                                <li className="flex gap-2"><i className="fas fa-check text-green-500 pt-0.5"></i> Ảnh chụp nguyên gốc, không qua chỉnh sửa.</li>
                                            </ul>
                                        </div>
                                    </div>
                                </section>

                                {/* Business Info (Recruiters only) */}
                                {isBusiness && (
                                    <section className="space-y-4 pt-4 border-t border-gray-100">
                                        <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                                            <span className="w-6 h-6 bg-[#4c42bd] text-white rounded-full flex items-center justify-center text-[10px]">3</span>
                                            Thông tin Nhà tuyển dụng & Pháp lý
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-gray-700">Tên công ty / Cơ sở kinh doanh *</label>
                                                <input
                                                    type="text" required
                                                    value={formData.companyName}
                                                    onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                                                    className="w-full p-2 border border-gray-300 rounded outline-none focus:ring-1 focus:ring-[#4c42bd]"
                                                    placeholder="VD: Công ty TNHH WorkConnect Việt Nam"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-gray-700">Mã số thuế *</label>
                                                <input
                                                    type="text" required
                                                    value={formData.taxCode}
                                                    onChange={e => setFormData({ ...formData, taxCode: e.target.value })}
                                                    className="w-full p-2 border border-gray-300 rounded outline-none focus:ring-1 focus:ring-[#4c42bd]"
                                                    placeholder="Nhập mã số thuế Nhà tuyển dụng"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-gray-700">Mã Số ĐKKD *</label>
                                                <input
                                                    type="text" required
                                                    value={formData.businessRegCode}
                                                    onChange={e => setFormData({ ...formData, businessRegCode: e.target.value })}
                                                    className="w-full p-2 border border-gray-300 rounded outline-none focus:ring-1 focus:ring-[#4c42bd]"
                                                    placeholder="Nhập số giấy phép kinh doanh"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-gray-700">Người đại diện pháp luật *</label>
                                                <input
                                                    type="text" required
                                                    value={formData.legalRepresentative}
                                                    onChange={e => setFormData({ ...formData, legalRepresentative: e.target.value })}
                                                    className="w-full p-2 border border-gray-300 rounded outline-none focus:ring-1 focus:ring-[#4c42bd]"
                                                    placeholder="Họ và tên người đứng tên pháp lý"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-gray-700">Website doanh nghiệp</label>
                                                <input
                                                    type="text"
                                                    value={(formData as any).website || ''}
                                                    onChange={e => setFormData({ ...formData, website: e.target.value } as any)}
                                                    className="w-full p-2 border border-gray-300 rounded outline-none focus:ring-1 focus:ring-[#4c42bd]"
                                                    placeholder="https://..."
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1 mt-4">
                                            <label className="text-xs font-bold text-gray-700">Ảnh/File Giấy phép kinh doanh *</label>
                                            <div className="h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors group">
                                                <input type="file" className="hidden" id="license-input" accept="image/*,.pdf" />
                                                <div className="text-center" onClick={() => document.getElementById('license-input')?.click()}>
                                                    <i className="fas fa-file-contract text-2xl text-gray-300 group-hover:text-[#4c42bd] mb-2"></i>
                                                    <p className="text-[11px] font-bold text-gray-600">Tải lên bản gốc GPKD hoặc PDF chứng thực</p>
                                                    <p className="text-[10px] text-gray-400">Yêu cầu ảnh rõ nét, không mờ nhòe</p>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                )}

                                <div className="pt-6 flex justify-end gap-3 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => navigate('/profile')}
                                        className="px-6 py-2 border border-gray-300 text-gray-600 font-bold rounded-full hover:bg-gray-50 transition-colors"
                                    >
                                        Hủy bỏ
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-8 py-2 bg-[#4c42bd] text-white font-bold rounded-full hover:bg-[#3a32a0] transition-colors shadow-md disabled:opacity-50"
                                    >
                                        {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu xác thực'}
                                    </button>
                                </div>
                            </form>
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

export default VerificationPage;
