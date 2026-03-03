import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { Link } from 'react-router-dom';
import workSessionApi from '../apis/api_work_session';
import Swal from 'sweetalert2';
import axios from 'axios';
import { mockUsers, mockWorkSessions, getUserIdByName, mockWorkerSuggestions, mockCompanySuggestions, mockNotifications, mockSavedJobsList } from '../mockData';
import SidebarProfile from '../components/SidebarProfile';
import { useContext } from 'react';
import { FollowedCompaniesContext } from './Companies';
import notificationApi, { Notification } from '../apis/api_notification';
import UserSuggestions from '../components/UserSuggestions';


const Dashboard: React.FC = () => {
    const { user, updateUser } = useAuth();
    const { followedIds, followCompany, unfollowCompany } = useContext(FollowedCompaniesContext);
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const isWorker = user?.role === UserRole.WORKER;
    const useMock = false; // Tắt mock để dùng API thật

    // States for real data
    const [savedJobs, setSavedJobs] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);


    // Helper tính thời gian còn lại (24h thay vì 48h)
    const getTimeRemaining = (firstRatedAt?: string, updatedAt?: string) => {
        // Coi trọng firstRatedAt hơn, nếu không có thì dùng updatedAt
        const referenceTime = firstRatedAt || updatedAt;

        if (!referenceTime) return "24h 0m";

        const dateObj = new Date(referenceTime);
        // Nếu ngày không hợp lệ hoặc là ngày mặc định (Epoch 1970), cho phép sửa
        if (isNaN(dateObj.getTime()) || dateObj.getFullYear() <= 1970) {
            return "24h 0m";
        }

        const deadline = dateObj.getTime() + 24 * 60 * 60 * 1000;
        const now = new Date().getTime();
        const diff = deadline - now;

        if (diff <= 0) return null;

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };

    const fetchDashboardData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // Fetch multiple data in parallel
            const [sessionRes, notificationData] = await Promise.all([
                isWorker ? workSessionApi.getByWorker(user.id) : workSessionApi.getByBusiness(user.id),
                notificationApi.getByUser(user.id)
            ]);

            setSessions(Array.isArray(sessionRes.data) ? sessionRes.data : []);
            setNotifications(notificationData);
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
            // Fallback to empty if fails
        } finally {
            setLoading(false);
        }
    };

    const fetchUserInfo = async () => {
        if (!user) return;
        try {
            // const res = await axios.get(`https://apituyendung.deepcode.vn/api/auth/me`); // Use /me instead
            const res = await axios.get(`https://apituyendung.deepcode.vn/api/auth/me`);
            if (res.data) {
                updateUser(res.data);
            }
        } catch (error) {
            console.error("Không thể tải thông tin người dùng mới");
        }
    };

    useEffect(() => {
        fetchDashboardData();
        fetchUserInfo();
        window.addEventListener('focus', fetchDashboardData);
        return () => window.removeEventListener('focus', fetchDashboardData);
    }, [user?.id]);

    // Logic Popup Đánh giá lại
    const handleOpenRatingPopup = async (session: any) => {
        const isEdit = (isWorker ? session.businessRating > 0 : session.workerRating > 0);
        let currentRating = isWorker ? (session.businessRating || 0) : (session.workerRating || 0);
        const initialComment = isWorker ? (session.businessComment || "") : (session.workerComment || "");

        const { value: formValues } = await Swal.fire({
            title: isEdit ? 'Chỉnh sửa Đánh giá' : 'Xác thực & Đánh giá',
            html: `
        <p class="text-sm text-slate-500 mb-6">Đánh giá của bạn giúp cộng đồng minh bạch hơn.</p>
        <div class="mb-6">
          <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 text-center">Mức độ hài lòng</p>
          <div id="star-rating-container" class="flex justify-center gap-3 text-3xl">
            ${[1, 2, 3, 4, 5].map(num => `
              <i class="${num <= currentRating ? 'fas text-amber-400' : 'far text-slate-200'} fa-star cursor-pointer hover:scale-110 transition-all" data-value="${num}"></i>
            `).join('')}
          </div>
        </div>
        <div class="text-left">
           <label class="text-xs font-bold text-slate-900 mb-2 block">Nhận xét chi tiết</label>
           <textarea id="swal-comment" class="w-full p-4 border border-slate-100 rounded-2xl bg-slate-50 text-sm h-32 focus:ring-2 focus:ring-indigo-500 outline-none transition-all">${initialComment}</textarea>
        </div>
      `,
            didOpen: () => {
                const stars = document.querySelectorAll('#star-rating-container i');
                stars.forEach(star => {
                    star.addEventListener('click', (e: any) => {
                        currentRating = parseInt(e.currentTarget.dataset.value);
                        stars.forEach((s: any, index) => {
                            if (index < currentRating) {
                                s.classList.replace('far', 'fas');
                                s.classList.replace('text-slate-200', 'text-amber-400');
                            } else {
                                s.classList.replace('fas', 'far');
                                s.classList.replace('text-amber-400', 'text-slate-200');
                            }
                        });
                    });
                });
            },
            showCancelButton: true,
            confirmButtonText: isEdit ? 'CẬP NHẬT ĐÁNH GIÁ' : 'HOÀN TẤT XÁC THỰC',
            preConfirm: () => {
                const comment = (document.getElementById('swal-comment') as HTMLTextAreaElement).value;
                if (currentRating === 0) { Swal.showValidationMessage('Vui lòng chọn số sao!'); }
                return { rating: currentRating, comment: comment };
            }
        });

        if (formValues) {
            Swal.fire({
                title: isEdit ? 'Đang cập nhật đánh giá...' : 'Đang gửi xác thực...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            try {
                const res = await workSessionApi.completeSession(session.id, formValues.rating, formValues.comment);
                if (res && (res.success === 200 || res.status === 200 || res.data)) {
                    await fetchDashboardData();
                    try {
                        // const userRes = await axios.get(`https://apituyendung.deepcode.vn/api/auth/me`);
                        const userRes = await axios.get(`https://apituyendung.deepcode.vn/api/auth/me`);
                        if (userRes.data) {
                            updateUser(userRes.data);
                        }
                    } catch (e) {
                        console.error("Lỗi cập nhật Profile sau đánh giá");
                    }
                    Swal.fire({ icon: 'success', title: 'Thành công', text: 'Xác thực & Cập nhật điểm uy tín thành công!', confirmButtonColor: '#4c42bd' });
                }
            } catch (error) {
                Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Lỗi khi gửi dữ liệu', confirmButtonColor: '#ef4444' });
            }
        }
    };

    // Hàm xác nhận hoàn thành (Chỉ cập nhật Status sang COMPLETED)
    const handleConfirmComplete = async (sessionId: string) => {
        const confirm = await Swal.fire({
            title: 'Xác nhận hoàn thành?',
            text: 'Bạn muốn đánh dấu công việc này là đã hoàn thành?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#4c42bd',
            confirmButtonText: 'Đồng ý',
            cancelButtonText: 'Hủy'
        });

        if (confirm.isConfirmed) {
            try {
                Swal.fire({ title: 'Đang xử lý...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });
                const res = await workSessionApi.updateStatus(sessionId, 'COMPLETED', "Xác nhận hoàn thành từ Dashboard");
                if (res.success === 200 || res.status === 200 || res.data) {
                    await fetchDashboardData();
                    Swal.fire({ icon: 'success', title: 'Thành công', text: 'Đã xác nhận hoàn thành công việc!', timer: 1500, showConfirmButton: false });
                }
            } catch (error) {
                Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Không thể cập nhật trạng thái' });
            }
        }
    };

    const showHistory = (history: any[]) => {
        const historyHtml = history.slice().reverse().map((entry, index) => `
      <div class="border-b border-gray-200 pb-3 mb-3">
        <p class="text-xs text-gray-500 mb-1">${new Date(entry.timestamp).toLocaleString('vi-VN')}</p>
        <div class="flex text-amber-500 text-sm gap-0.5 mb-1">
          ${[1, 2, 3, 4, 5].map(star => `<i class="${star <= entry.rating ? 'fas' : 'far'} fa-star"></i>`).join('')}
        </div>
        <p class="text-sm text-gray-700">"${entry.comment || 'Không có nhận xét'}"</p>
        <p class="text-xs text-gray-400 italic mt-1">
          ${entry.type === 'initial' ? 'Đánh giá ban đầu' :
                entry.type === 'edit' ? `Đã sửa lần ${entry.editCount}` :
                    `Đánh giá bổ sung lần ${entry.editCount}`}
        </p>
      </div>
    `).join('');

        Swal.fire({
            title: 'Lịch sử đánh giá',
            html: `<div class="max-h-96 overflow-y-auto">${historyHtml}</div>`,
            showConfirmButton: false,
            showCloseButton: true,
            customClass: { popup: 'rounded-lg' }
        });
    };

    const activeSessions = sessions.filter(s => {
        return s.status === 'ACCEPTED';
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const completedSessions = sessions.filter(s => s.status === 'COMPLETED')
        .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());

    const renderStars = (rating: number) => {
        const full = Math.floor(rating);
        const half = rating % 1 >= 0.5 ? 1 : 0;
        const empty = 5 - full - half;
        return (
            <div className="flex text-amber-500 text-xs gap-0.5">
                {[...Array(full)].map((_, i) => <i key={`full-${i}`} className="fas fa-star"></i>)}
                {half === 1 && <i className="fas fa-star-half-alt"></i>}
                {[...Array(empty)].map((_, i) => <i key={`empty-${i}`} className="far fa-star"></i>)}
            </div>
        );
    };

    const recentActivities = [...completedSessions]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 3)
        .map(s => `${s.jobTitle} với ${isWorker ? s.businessName : s.workerName}`);

    const isBusiness = user?.role === UserRole.BUSINESS;

    const toggleFollowUser = (userId: string, name: string) => {
        const isFollowing = followedIds.includes(userId);
        if (isFollowing) {
            unfollowCompany(userId);
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'info',
                title: 'Đã hủy theo dõi',
                text: `Đã bỏ theo dõi ${name}`,
                timer: 1500,
                showConfirmButton: false
            });
        } else {
            followCompany(userId);
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Thành công',
                text: `Đã theo dõi ${name}`,
                timer: 1500,
                showConfirmButton: false
            });
        }
    };

    return (
        <div className="bg-[#F3F2EF] min-h-screen py-6 font-sans text-sm">
            <div className="max-w-[1128px] mx-auto px-0 sm:px-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                    {/* === LEFT SIDEBAR: IDENTITY === */}
                    <div className="md:col-span-3">
                        <SidebarProfile
                            user={user}
                            isWorker={isWorker}
                            repScore={user?.rating || 0}
                            recentActivities={recentActivities}
                        />
                    </div>

                    {/* === MAIN COLUMN: FEED === */}
                    <div className="md:col-span-6 space-y-4">

                        <div className="flex items-center justify-between px-1">
                            <div className="h-[1px] bg-gray-300 flex-grow"></div>
                            <span className="text-xs text-gray-500 px-2 flex items-center gap-1">Hoạt động đang diễn ra <span className="text-gray-900 font-bold">({activeSessions.length})</span></span>
                            <div className="h-[1px] bg-gray-300 flex-grow"></div>
                        </div>

                        {/* Active Sessions List */}
                        {activeSessions.length > 0 ? (
                            activeSessions.map(session => (
                                <div key={session.id} className="bg-white rounded-lg border border-gray-300 p-4 shadow-sm">
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-3">
                                            {(() => {
                                                const partnerAvatar = isWorker ? session.businessAvatar : session.workerAvatar;
                                                const partnerName = isWorker ? session.businessName : session.workerName;
                                                const avatar = partnerAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${partnerName}`;
                                                return (
                                                    <img src={avatar} className="w-10 h-10 rounded-full border border-gray-100 object-cover shrink-0" alt="" />
                                                );
                                            })()}
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                                    Đang làm việc • {new Date(session.createdAt).toLocaleDateString('vi-VN')}
                                                </p>
                                                <h3 className="text-sm font-bold text-gray-900">{session.jobTitle}</h3>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    Đối tác: {(() => {
                                                        const partnerName = isWorker ? session.businessName : session.workerName;
                                                        const partnerId = isWorker ? session.businessId : session.workerId;
                                                        const partnerNumericId = isWorker ? session.businessNumericId : session.workerNumericId;
                                                        return (
                                                            <span className="inline-block align-top">
                                                                {partnerId ? (
                                                                    <Link to={`/fast-processing/${partnerId}`} className="font-semibold text-[#4c42bd] hover:underline cursor-pointer">
                                                                        {partnerName}
                                                                    </Link>
                                                                ) : (
                                                                    <span className="font-semibold text-[#4c42bd]">{partnerName}</span>
                                                                )}
                                                                {partnerNumericId && (
                                                                    <span className="block text-[10px] text-[#4c42bd] font-bold">ID: {partnerNumericId}</span>
                                                                )}
                                                            </span>
                                                        );
                                                    })()}
                                                </p>
                                            </div>
                                        </div>
                                        <Link to={`/sessions/${session.id}`} className="text-[#4c42bd] text-sm font-bold hover:underline">Chi tiết</Link>
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                                        <span className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded font-semibold border border-amber-100">Đang thực hiện</span>
                                        {!isWorker && (
                                            <button onClick={() => handleConfirmComplete(session.id)} className="text-xs font-bold text-white bg-emerald-600 px-4 py-1.5 rounded-full hover:bg-emerald-700 transition-all flex items-center gap-2">
                                                <i className="fas fa-check-circle"></i> Xác nhận hoàn thành
                                            </button>
                                        )}
                                        {isWorker && (
                                            <span className="text-[10px] text-gray-400 italic">Đang trong quá trình làm việc</span>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 bg-white rounded-lg border border-gray-300 border-dashed">
                                <i className="fas fa-clipboard-list text-gray-300 text-3xl mb-2"></i>
                                <p className="text-sm text-gray-500 font-medium">Chưa có công việc nào đang diễn ra.</p>
                            </div>
                        )}

                        <div className="flex items-center justify-between px-1 pt-2">
                            <div className="h-[1px] bg-gray-300 flex-grow"></div>
                            <span className="text-xs text-gray-500 px-2">Lịch sử đánh giá ({completedSessions.length})</span>
                            <div className="h-[1px] bg-gray-300 flex-grow"></div>
                        </div>

                        {/* Completed Sessions Feed */}
                        {completedSessions.map(session => {
                            const partnerName = (isWorker ? session.businessName : session.workerName) || 'Người dùng';
                            const partnerId = isWorker ? session.businessId : session.workerId;
                            const partnerAvatar = (isWorker ? session.businessAvatar : session.workerAvatar) || `https://api.dicebear.com/7.x/initials/svg?seed=${partnerName}`;

                            const myRating = isWorker ? session.businessRating : session.workerRating;
                            const partnerRating = isWorker ? session.workerRating : session.businessRating;
                            const partnerComment = isWorker ? session.workerComment : session.businessComment;
                            const myComment = isWorker ? session.businessComment : session.workerComment;

                            const myHistory = isWorker ? session.workerToBusinessHistory : session.businessToWorkerHistory;
                            const partnerHistory = isWorker ? session.businessToWorkerHistory : session.workerToBusinessHistory;

                            const hasEdits = myHistory && myHistory.length > 1;
                            const partnerHasEdits = partnerHistory && partnerHistory.length > 1;

                            // Bổ sung: Nếu không có mảng history nhưng updatedAt khác firstRatedAt (nếu có), ta có thể coi là đã sửa.
                            // Tuy nhiên để chắc chắn và hiển thị nhãn, ta sẽ ưu tiên kiểm tra hasEdits.

                            const timeRemaining = getTimeRemaining(session.firstRatedAt, session.updatedAt);
                            const canEdit = timeRemaining !== null;

                            return (
                                <div key={session.id} className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden">
                                    <div className="p-3 flex items-start gap-3">
                                        <img
                                            src={partnerAvatar}
                                            className="w-10 h-10 rounded-full border border-gray-200 object-cover"
                                            alt={partnerName}
                                            onError={(e) => { (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${partnerName}`; }}
                                        />
                                        <div className="flex-grow">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">
                                                        {partnerId ? (
                                                            <Link to={`/fast-processing/${partnerId}`} className="hover:underline">
                                                                {partnerName}
                                                            </Link>
                                                        ) : (
                                                            partnerName
                                                        )}{' '}
                                                        <span className="text-gray-500 font-normal">đã đánh giá bạn</span>
                                                    </p>
                                                    {(() => {
                                                        const partnerNumericId = isWorker ? session.businessNumericId : session.workerNumericId;
                                                        return partnerNumericId && (
                                                            <p className="text-[10px] text-[#4c42bd] font-bold">ID: {partnerNumericId}</p>
                                                        );
                                                    })()}
                                                    <p className="text-xs text-gray-500">{session.jobTitle}</p>
                                                </div>
                                                <span className="text-xs text-gray-400">
                                                    {session.updatedAt && !isNaN(new Date(session.updatedAt).getTime())
                                                        ? new Date(session.updatedAt).toLocaleDateString('vi-VN')
                                                        : 'Vừa xong'}
                                                </span>
                                            </div>

                                            <div className="mt-2 text-sm text-gray-800 bg-gray-50 p-3 rounded border border-gray-200">
                                                <div className="flex items-center gap-2">
                                                    {renderStars(partnerRating || 0)}
                                                    {partnerHasEdits ? (
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase border ${(partnerHistory && partnerHistory[partnerHistory.length - 1]?.type === 'edit')
                                                                ? 'bg-blue-50 text-blue-600 border-blue-100'
                                                                : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                                                                }`}>
                                                                {(partnerHistory && partnerHistory[partnerHistory.length - 1]?.type === 'edit') ? 'Đã sửa' : 'Đánh giá bổ sung'}
                                                            </span>
                                                            <button onClick={() => showHistory(partnerHistory)} className="text-[10px] text-blue-600 hover:underline italic">
                                                                Lịch sử ({partnerHistory.length - 1} lần)
                                                            </button>
                                                        </div>
                                                    ) : (partnerRating > 0 && (
                                                        <span className="text-[8px] text-gray-400 italic opacity-60">Đây là bản đánh giá gốc (chưa sửa)</span>
                                                    ))}
                                                </div>
                                                <p className="mt-1 text-gray-700">"{partnerComment || "Không có lời nhắn"}"</p>
                                            </div>

                                            <div className="mt-3 pl-3 border-l-2 border-gray-200">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="text-xs text-gray-500">Phản hồi của bạn:</p>
                                                    {myRating === 0 ? (
                                                        <button onClick={() => handleOpenRatingPopup(session)} className="text-xs font-bold text-white bg-[#4c42bd] px-4 py-1 rounded-full hover:bg-[#3b3299] transition-all">
                                                            Đánh giá ngay
                                                        </button>
                                                    ) : canEdit ? (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-bold border border-amber-100">
                                                                Còn {timeRemaining} để sửa
                                                            </span>
                                                            <button onClick={() => handleOpenRatingPopup(session)} className="text-gray-400 hover:text-[#4c42bd] px-2 py-1 rounded hover:bg-gray-100 transition-colors flex items-center gap-1">
                                                                <i className="fas fa-pencil-alt text-[10px]"></i> Sửa
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] text-gray-400 italic bg-gray-100 px-2 py-0.5 rounded">Đã chốt đánh giá</span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-600 flex items-center gap-2">
                                                    {renderStars(myRating || 0)}
                                                    {hasEdits ? (
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase border ${(myHistory && myHistory[myHistory.length - 1]?.type === 'edit')
                                                                ? 'bg-blue-50 text-blue-600 border-blue-100'
                                                                : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                                                                }`}>
                                                                {(myHistory && myHistory[myHistory.length - 1]?.type === 'edit') ? 'Đã sửa' : 'Đánh giá bổ sung'}
                                                            </span>
                                                            <button onClick={() => showHistory(myHistory)} className="text-[10px] text-blue-600 hover:underline italic">
                                                                Lịch sử ({myHistory.length - 1} lần)
                                                            </button>
                                                        </div>
                                                    ) : (myRating > 0 && (
                                                        <span className="text-[8px] text-gray-400 italic opacity-60">Đây là bản đánh giá gốc (chưa sửa)</span>
                                                    ))}
                                                </div>
                                                <p className="italic mt-0.5">"{myComment || "Bạn chưa viết nhận xét"}"</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* === RIGHT SIDEBAR: SUGGESTIONS === */}
                    <div className="md:col-span-3 space-y-4 hidden md:block">
                        <UserSuggestions
                            title="Gợi ý kết nối"
                            limit={5}
                            context={{ viewerIndustry: user?.industry || user?.description }}
                        />

                        <div className="text-center px-4">
                            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-[11px] text-gray-500">
                                <Link to="/about" className="hover:text-[#4c42bd] hover:underline">Về chúng tôi</Link>
                                <Link to="/help" className="hover:text-[#4c42bd] hover:underline">Trợ giúp</Link>
                                <Link to="/privacy" className="hover:text-[#4c42bd] hover:underline">Quyền riêng tư & Điều khoản</Link>
                                <Link to="/ads" className="hover:text-[#4c42bd] hover:underline">Quảng cáo</Link>
                                <Link to="/jobs" className="hover:text-[#4c42bd] hover:underline">Việc làm</Link>
                                <Link to="/companies" className="hover:text-[#4c42bd] hover:underline">Công ty</Link>
                                <Link to="/resources" className="hover:text-[#4c42bd] hover:underline">Tài nguyên</Link>
                                <Link to="/profile" className="hover:text-[#4c42bd] hover:underline">Hồ sơ</Link>
                            </div>
                            <div className="mt-2 flex items-center justify-center gap-1">
                                <span className="font-bold text-[#4c42bd] text-xs">WorkConnect</span>
                                <p className="text-[11px] text-gray-500">Corporation © 2025</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Dashboard;
