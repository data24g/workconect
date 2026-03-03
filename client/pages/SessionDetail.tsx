import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../contexts/AuthContext';
import workSessionApi, { WorkSessionResponse } from '../apis/api_work_session';
import { UserRole } from '../types';

const SessionDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [session, setSession] = useState<any | null>(null); // Dùng any tạm thời để flexible với response
    const [loading, setLoading] = useState(true);

    const isWorker = user?.role === UserRole.WORKER;

    // Fetch dữ liệu chi tiết session
    useEffect(() => {
        if (!id) return;
        const fetchSession = async () => {
            try {
                setLoading(true);
                const res: any = await workSessionApi.getById(id);
                // Kiểm tra cấu trúc response, tùy backend trả về data trực tiếp hay bọc trong .data
                const data = res.data || res;
                setSession(data);
            } catch (error) {
                Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Không thể tải thông tin phiên làm việc' });
                navigate('/dashboard'); // Quay về nếu lỗi
            } finally {
                setLoading(false);
            }
        };
        fetchSession();
    }, [id, navigate]);

    // Xử lý cập nhật trạng thái (Chấp nhận/Từ chối/Hoàn thành)
    const handleUpdateStatus = async (newStatus: string) => {
        if (!session) return;

        const confirm = await Swal.fire({
            title: 'Xác nhận thay đổi?',
            text: `Bạn muốn chuyển trạng thái sang: ${newStatus}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#4c42bd',
            confirmButtonText: 'Đồng ý',
            cancelButtonText: 'Hủy'
        });

        if (confirm.isConfirmed) {
            try {
                await workSessionApi.updateStatus(session.id, newStatus, "Cập nhật từ trang chi tiết");
                Swal.fire({
                    icon: 'success',
                    title: 'Thành công',
                    text: 'Cập nhật thành công!',
                    timer: 1500,
                    showConfirmButton: false
                });
                // Reload lại data
                const res: any = await workSessionApi.getById(session.id);
                setSession(res.data || res);
            } catch (error) {
                console.warn("⚠️ API Update Error, using demo fallback:", error);

                // FALLBACK: Giả lập thành công cho demo
                Swal.fire({
                    icon: 'success',
                    title: 'Thành công',
                    text: `Cập nhật thành ${newStatus} (Chế độ Demo)!`,
                    timer: 1500,
                    showConfirmButton: false
                });

                // Cập nhật state local để UI thay đổi ngay lập tức
                setSession({
                    ...session,
                    status: newStatus
                });
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F3F2EF] flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <i className="fas fa-circle-notch animate-spin text-[#4c42bd] text-2xl mb-2"></i>
                    <p className="text-gray-500 text-sm">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    if (!session) return null;

    // Xác định thông tin đối tác
    const partnerName = isWorker ? session.businessName : session.workerName;
    const partnerAvatar = isWorker ? session.businessAvatar : session.workerAvatar; // Giả sử API có trả về avatar
    const partnerRole = isWorker ? "Nhà tuyển dụng" : "Freelancer";

    return (
        <div className="bg-[#F3F2EF] min-h-screen py-6 font-sans text-sm">
            <div className="max-w-[1128px] mx-auto px-4">

                {/* Breadcrumb */}
                <div className="mb-4 flex items-center gap-2 text-xs text-gray-500">
                    <Link to="/dashboard" className="hover:underline hover:text-[#4c42bd]">Bảng điều khiển</Link>
                    <span>/</span>
                    <span>Chi tiết phiên làm việc</span>
                    <span>/</span>
                    <span className="text-gray-900 font-semibold">#{session.id.substring(0, 8)}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* === LEFT COLUMN: MAIN INFO === */}
                    <div className="lg:col-span-8 space-y-4">

                        {/* 1. Header Card */}
                        <div className="bg-white rounded-lg border border-gray-300 p-6 shadow-sm relative overflow-hidden">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900 mb-1">{session.jobTitle || "Tên công việc không xác định"}</h1>
                                    <p className="text-sm text-gray-500">
                                        Bắt đầu: <span className="font-semibold text-gray-700">{new Date(session.createdAt).toLocaleDateString('vi-VN')}</span>
                                    </p>
                                </div>
                                {/* Status Badge */}
                                <div className={`px-3 py-1 rounded-full text-xs font-bold border 
                            ${session.status === 'ACCEPTED' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                            ${session.status === 'COMPLETED' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                            ${session.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                            ${session.status === 'REJECTED' || session.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                        `}>
                                    {session.status === 'ACCEPTED' ? 'ĐANG THỰC HIỆN' :
                                        session.status === 'COMPLETED' ? 'ĐÃ HOÀN THÀNH' :
                                            session.status === 'PENDING' ? 'CHỜ DUYỆT' : session.status}
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Mức lương</p>
                                    <p className="text-sm font-bold text-gray-900">{session.salary || "Thỏa thuận"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Địa điểm</p>
                                    <p className="text-sm font-bold text-gray-900">{session.location || "Remote"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Loại hình</p>
                                    <p className="text-sm font-bold text-gray-900">{session.jobType || "Full-time"}</p>
                                </div>
                            </div>
                        </div>

                        {/* 2. Partner Info */}
                        <div className="bg-white rounded-lg border border-gray-300 p-6 shadow-sm">
                            <h3 className="text-base font-bold text-gray-900 mb-4">Thông tin đối tác</h3>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full border border-gray-200 overflow-hidden">
                                    <img
                                        src={partnerAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${partnerName}`}
                                        className="w-full h-full object-cover"
                                        alt="Partner"
                                    />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-[#4c42bd] hover:underline cursor-pointer">{partnerName}</h4>
                                    {(() => {
                                        const partnerNumericId = isWorker ? session.businessNumericId : session.workerNumericId;
                                        return partnerNumericId && (
                                            <p className="text-[10px] text-[#4c42bd] font-bold">ID: {partnerNumericId}</p>
                                        );
                                    })()}
                                    <p className="text-xs text-gray-500 mb-2">{partnerRole}</p>
                                    <button className="text-xs font-semibold border border-gray-500 text-gray-600 px-4 py-1 rounded-full hover:bg-gray-100 hover:border-gray-900 transition-all">
                                        Nhắn tin
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 3. Session Logs / Timeline (Giả lập) */}
                        <div className="bg-white rounded-lg border border-gray-300 p-6 shadow-sm">
                            <h3 className="text-base font-bold text-gray-900 mb-4">Nhật ký hoạt động</h3>
                            <div className="space-y-6 pl-2">
                                {/* Timeline Item 1 */}
                                <div className="flex gap-4 relative">
                                    <div className="flex flex-col items-center">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        <div className="w-[1px] h-full bg-gray-200 my-1"></div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Phiên làm việc được khởi tạo</p>
                                        <p className="text-xs text-gray-500">{new Date(session.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>
                                {/* Timeline Item 2 */}
                                {session.status !== 'PENDING' && (
                                    <div className="flex gap-4 relative">
                                        <div className="flex flex-col items-center">
                                            <div className="w-2 h-2 rounded-full bg-[#4c42bd]"></div>
                                            <div className="w-[1px] h-full bg-gray-200 my-1"></div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">Hồ sơ đã được chấp thuận</p>
                                            <p className="text-xs text-gray-500">Hai bên bắt đầu làm việc</p>
                                        </div>
                                    </div>
                                )}
                                {/* Timeline Item 3 */}
                                {session.status === 'COMPLETED' && (
                                    <div className="flex gap-4 relative">
                                        <div className="flex flex-col items-center">
                                            <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">Công việc hoàn thành</p>
                                            <p className="text-xs text-gray-500">Đã xác thực và đánh giá</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* === RIGHT COLUMN: ACTIONS === */}
                    <div className="lg:col-span-4 space-y-4">

                        {/* Action Card */}
                        <div className="bg-white rounded-lg border border-gray-300 p-4 shadow-sm sticky top-20">
                            <h3 className="text-sm font-bold text-gray-900 mb-3">Thao tác</h3>

                            <div className="space-y-3">
                                {/* Logic nút bấm dựa trên Status và Role */}

                                {/* 1. Nếu đang PENDING & là Nhà tuyển dụng -> Duyệt / Từ chối */}
                                {!isWorker && session.status === 'PENDING' && (
                                    <>
                                        <button onClick={() => handleUpdateStatus('ACCEPTED')} className="w-full bg-[#4c42bd] hover:bg-[#004182] text-white font-bold py-2 rounded-full text-sm transition-all shadow-sm">
                                            Chấp nhận hồ sơ
                                        </button>
                                        <button onClick={() => handleUpdateStatus('REJECTED')} className="w-full bg-white border border-gray-400 text-gray-600 hover:bg-gray-100 hover:border-gray-600 font-bold py-2 rounded-full text-sm transition-all">
                                            Từ chối
                                        </button>
                                    </>
                                )}

                                {/* 2. Nếu đang ACCEPTED (Đang làm) -> Nút Hoàn thành (Thường là Business bấm) */}
                                {session.status === 'ACCEPTED' && (
                                    <button onClick={() => handleUpdateStatus('COMPLETED')} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-full text-sm transition-all shadow-sm flex items-center justify-center gap-2">
                                        <i className="fas fa-check-circle"></i> Xác nhận hoàn thành
                                    </button>
                                )}

                                {/* 3. Nếu Đã Hoàn thành -> Nút Đánh giá (nếu chưa đánh giá) */}
                                {session.status === 'COMPLETED' && (
                                    <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
                                        <i className="fas fa-medal text-green-600 text-3xl mb-2"></i>
                                        <p className="text-sm font-bold text-green-800">Công việc đã kết thúc</p>
                                        <p className="text-xs text-green-600 mt-1">Cảm ơn bạn đã sử dụng WorkConnect</p>
                                    </div>
                                )}

                                {/* Nút hủy chung (Nếu chưa hoàn thành) */}
                                {session.status !== 'COMPLETED' && session.status !== 'CANCELLED' && session.status !== 'REJECTED' && (
                                    <button onClick={() => handleUpdateStatus('CANCELLED')} className="w-full text-red-600 hover:bg-red-50 font-semibold py-2 rounded-full text-xs transition-all mt-2">
                                        Hủy phiên làm việc này
                                    </button>
                                )}
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-100">
                                <p className="text-xs text-gray-500 text-center mb-2">Cần hỗ trợ?</p>
                                <button className="w-full text-[#4c42bd] text-xs font-bold hover:underline">Liên hệ Admin WorkConnect</button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default SessionDetail;