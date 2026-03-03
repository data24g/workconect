import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import Swal from 'sweetalert2';

const Premium: React.FC = () => {
    const { user, updateUser } = useAuth();
    const isWorker = user?.role === UserRole.WORKER;

    const handleUpgrade = (plan: string) => {
        if (!user) {
            Swal.fire({
                icon: 'warning',
                title: 'Yêu cầu đăng nhập',
                text: 'Vui lòng đăng nhập để nâng cấp Premium.',
                confirmButtonColor: '#4c42bd'
            });
            return;
        }

        Swal.fire({
            title: 'Kích hoạt Premium Demo?',
            text: `Bạn muốn trải nghiệm tính năng ${plan} ngay bây giờ? Tài khoản của bạn sẽ nhận được huy hiệu Golden và ưu tiên hiển thị.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#4c42bd',
            cancelButtonColor: '#6e7881',
            confirmButtonText: 'Kích hoạt ngay',
            cancelButtonText: 'Để sau'
        }).then((result) => {
            if (result.isConfirmed) {
                const updatedUser = { ...user, isPremium: true };
                updateUser(updatedUser);
                Swal.fire({
                    icon: 'success',
                    title: 'Đã nâng cấp Premium!',
                    text: 'Tài khoản của bạn hiện đã là thành viên Premium. Các bài đăng của bạn sẽ được ưu tiên hiển thị.',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        });
    };

    return (
        <div className="bg-[#F3F2EF] min-h-screen py-8 font-sans">
            <div className="max-w-[1128px] mx-auto px-4">

                {/* Header Section */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                        Nâng tầm sự nghiệp với <span className="text-amber-600">Premium</span>
                    </h1>
                    {user?.isPremium && (
                        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full text-sm font-bold border border-amber-200 mb-4 animate-bounce">
                            <i className="fas fa-crown"></i> Bạn đang là thành viên Premium
                        </div>
                    )}
                    <p className="text-gray-500 text-sm max-w-2xl mx-auto">
                        Mở khóa các tính năng độc quyền giúp bạn nổi bật, kết nối nhanh hơn và xây dựng uy tín nghề nghiệp vững chắc trên nền tảng xác thực.
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8">

                    {/* Worker Plan */}
                    <div className={`bg-white rounded-xl border shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-amber-200/50 hover:-translate-y-1 group ${isWorker ? 'border-amber-400 ring-1 ring-amber-400' : 'border-gray-200 hover:border-amber-300'}`}>
                        {isWorker && (
                            <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-600 to-amber-400 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider z-10 shadow-sm">
                                Khuyên dùng
                            </div>
                        )}
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center text-xl">
                                    <i className="fas fa-user-tie"></i>
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Gói Cá Nhân</h2>
                                    <p className="text-xs text-gray-500">Dành cho Người lao động & Freelancer</p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <span className="text-3xl font-bold text-gray-900">199.000₫</span>
                                <span className="text-xs text-gray-500 font-medium"> / tháng</span>
                            </div>

                            <button
                                onClick={() => isWorker && handleUpgrade('Gói Cá Nhân')}
                                className={`w-full py-3 rounded-full font-black text-sm transition-all border shadow-md active:scale-[0.98] ${isWorker ? 'bg-gradient-to-r from-[#4c42bd] to-[#3a32a0] text-white border-transparent hover:shadow-indigo-200 hover:brightness-110' : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'}`}>
                                {user?.isPremium && isWorker ? 'Đã kích hoạt' : (isWorker ? 'Dùng thử miễn phí 1 tháng' : 'Dành cho Freelancer')}
                            </button>

                            <div className="mt-6 space-y-3">
                                {[
                                    'Hồ sơ nổi bật (Golden Badge)',
                                    'Xác thực CV Điện tử vĩnh viễn',
                                    'Skill Badges Độc quyền',
                                    'Ưu tiên ứng tuyển top đầu'
                                ].map((feat, i) => (
                                    <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                        <i className="fas fa-check text-green-600 mt-1"></i>
                                        <span>{feat}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Business Plan */}
                    <div className={`bg-white rounded-xl border shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-amber-200/50 hover:-translate-y-1 group ${!isWorker ? 'border-amber-400 ring-1 ring-amber-400' : 'border-gray-200 hover:border-amber-300'}`}>
                        {!isWorker && (
                            <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-600 to-amber-400 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider z-10 shadow-sm">
                                Nhà tuyển dụng
                            </div>
                        )}
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-blue-50 text-[#4c42bd] rounded-lg flex items-center justify-center text-xl">
                                    <i className="fas fa-building"></i>
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Gói Nhà Tuyển Dụng</h2>
                                    <p className="text-xs text-gray-500">Dành cho Nhà tuyển dụng & Startups</p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <span className="text-3xl font-bold text-gray-900">999.000₫</span>
                                <span className="text-xs text-gray-500 font-medium"> / tháng</span>
                            </div>

                            <button
                                onClick={() => !isWorker && handleUpgrade('Gói Nhà Tuyển Dụng')}
                                className={`w-full py-3 rounded-full font-black text-sm transition-all border shadow-md active:scale-[0.98] ${!isWorker ? 'bg-gradient-to-r from-[#4c42bd] to-[#3a32a0] text-white border-transparent hover:shadow-indigo-200 hover:brightness-110' : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'}`}>
                                {user?.isPremium && !isWorker ? 'Đã kích hoạt' : (!isWorker ? 'Nâng cấp Nhà tuyển dụng' : 'Dành cho Nhà tuyển dụng')}
                            </button>

                            <div className="mt-6 space-y-3">
                                {[
                                    'Đăng tin ưu tiên (Top Listing)',
                                    'Xem lịch sử đánh giá chi tiết ứng viên',
                                    'Gửi Offer trực tiếp không giới hạn',
                                    'Trang thương hiệu Verified Plus'
                                ].map((feat, i) => (
                                    <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                        <i className="fas fa-check text-green-600 mt-1"></i>
                                        <span>{feat}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feature Comparison Table */}
                {!user?.isPremium && (
                    <div className="bg-white rounded-lg border border-gray-300 shadow-sm max-w-4xl mx-auto overflow-hidden mt-8">
                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="text-sm font-bold text-gray-900">So sánh tính năng chi tiết</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm min-w-[500px]">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="px-4 py-3 font-semibold text-gray-500 w-1/2">Tính năng</th>
                                        <th className="px-4 py-3 font-bold text-gray-700 text-center">Miễn phí</th>
                                        <th className="px-4 py-3 font-bold text-amber-600 text-center bg-amber-50">Premium</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {[
                                        { name: 'Xác thực lịch sử làm việc', free: true, prem: true },
                                        { name: 'Đánh giá 2 chiều', free: true, prem: true },
                                        { name: 'Hồ sơ nổi bật (Vị trí ưu tiên)', free: false, prem: true },
                                        { name: 'Xem chi tiết ứng viên/Nhà tuyển dụng', free: false, prem: true },
                                        { name: 'Huy hiệu xác thực uy tín', free: false, prem: true },
                                        { name: 'Hỗ trợ ưu tiên 24/7', free: false, prem: true }
                                    ].map((row, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 text-gray-700">{row.name}</td>
                                            <td className="px-4 py-3 text-center text-gray-400">
                                                {row.free ? <i className="fas fa-check text-green-600"></i> : <i className="fas fa-minus"></i>}
                                            </td>
                                            <td className="px-4 py-3 text-center bg-amber-50/50">
                                                <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                                                    <i className="fas fa-check text-xs"></i>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Trust Footer */}
                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-500 font-medium">
                        <i className="fas fa-lock mr-1"></i> Thanh toán an toàn & bảo mật. Hủy bất kỳ lúc nào.
                    </p>
                </div>

            </div>
        </div>
    );
};

export default Premium;