import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import Swal from 'sweetalert2';
import userApi from '../apis/api_user';

const Onboarding: React.FC = () => {
    const { user, updateUser, logout } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: user?.fullName || user?.name || '',
        phone: user?.phone || '',
        dob: user?.dob || '',
        gender: user?.gender || 'Nam',
        location: user?.location || 'Hà Nội',
        industry: user?.industry || '',
        title: user?.title || '',
        skills: user?.skills ? user?.skills.join(', ') : '',
        bio: user?.bio || '',
        education: user?.education || '',
        experience: user?.description || '', // Using description for experience detail
        achievements: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateStep = () => {
        const newErrors: Record<string, string> = {};
        if (step === 1) {
            if (!formData.fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ tên';
            if (!formData.phone.trim()) newErrors.phone = 'Vui lòng nhập số điện thoại';
            if (!formData.dob) newErrors.dob = 'Vui lòng chọn ngày sinh';
        } else if (step === 2) {
            if (!formData.industry.trim()) newErrors.industry = 'Vui lòng chọn/nhập ngành nghề';
            if (!formData.title.trim()) newErrors.title = 'Vui lòng nhập vị trí công việc';
            if (!formData.skills.trim()) newErrors.skills = 'Vui lòng nhập ít nhất một kỹ năng';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep()) {
            if (step < 3) setStep(step + 1);
            else handleFinish();
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Thiếu thông tin',
                text: 'Vui lòng điền đầy đủ các thông tin bắt buộc.',
                timer: 2000,
                showConfirmButton: false
            });
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSkip = () => {
        Swal.fire({
            title: 'Hoàn tất thiết lập?',
            text: "Kinh nghiệm và thành tựu giúp hồ sơ chuyên nghiệp hơn, bạn có thể chỉnh sửa sau trong trang cá nhân.",
            icon: 'info',
            showCancelButton: true,
            confirmButtonColor: '#4c42bd',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Đồng ý, vào trang chủ',
            cancelButtonText: 'Tiếp tục điền'
        }).then(async (result) => {
            if (result.isConfirmed) {
                // Khi skip ở bước 3, thực chất là lưu lại các bước 1 & 2 đã điền
                handleFinish();
            }
        });
    };

    const handleFinish = async () => {
        if (!user) return;

        setIsLoading(true);
        try {
            const finalData = {
                ...formData,
                skills: formData.skills.split(',').map(s => s.trim()).filter(s => s !== ''),
                description: formData.experience + (formData.achievements ? `\n\nThành tựu:\n${formData.achievements}` : ''),
                isNewUser: false,
            };

            const updatedUser = await userApi.update(user.id, finalData);
            if (updatedUser) {
                updateUser(updatedUser);
                Swal.fire({
                    icon: 'success',
                    title: 'Chào mừng!',
                    text: 'Hồ sơ của bạn đã được thiết lập thành công.',
                    timer: 2000,
                    showConfirmButton: false
                });
                navigate('/profile');
            }
        } catch (error) {
            console.error("Onboarding update failed:", error);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Không thể lưu thông tin. Vui lòng thử lại sau.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return null;

    const renderStepIndicator = () => (
        <div className="flex items-center justify-center mb-10 space-x-4">
            {[1, 2, 3].map((i) => (
                <React.Fragment key={i}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${step >= i ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110' : 'bg-slate-100 text-slate-400'}`}>
                        {step > i ? <i className="fas fa-check"></i> : i}
                    </div>
                    {i < 3 && <div className={`w-12 h-1 bg-slate-100 rounded-full overflow-hidden`}>
                        <div className={`h-full bg-indigo-600 transition-all duration-500 ${step > i ? 'w-full' : 'w-0'}`}></div>
                    </div>}
                </React.Fragment>
            ))}
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
            <div className="max-w-3xl w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 transition-all duration-500">

                <div className="p-10 md:p-16">
                    <div className="flex justify-between items-start mb-2">
                        <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                                {step === 1 && 'Chào mừng bạn!'}
                                {step === 2 && 'Năng lực nghề nghiệp 💼'}
                                {step === 3 && 'Kinh nghiệm & Học vấn 🎓'}
                            </h1>
                            <p className="text-slate-500 font-medium">
                                {step === 1 && 'Hãy cho chúng tôi biết vài điều cơ bản về bạn.'}
                                {step === 2 && 'Điền thông tin chuyên môn để nhận gợi ý tốt nhất.'}
                                {step === 3 && 'Tăng sự tin cậy với kinh nghiệm thực tế (Không bắt buộc).'}
                            </p>
                        </div>
                        {step === 3 && (
                            <button
                                onClick={handleSkip}
                                className="text-xs font-bold text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors py-2 animate-in fade-in slide-in-from-top-1 duration-700"
                            >
                                Bỏ qua bước này
                            </button>
                        )}
                    </div>

                    {renderStepIndicator()}

                    <div className="min-h-[350px] animate-in fade-in zoom-in-95 duration-500">
                        {step === 1 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Họ và tên <span className="text-red-500">*</span></label>
                                    <input
                                        type="text" name="fullName" value={formData.fullName} onChange={handleInputChange}
                                        className={`w-full px-5 py-4 bg-slate-50 border ${errors.fullName ? 'border-red-400' : 'border-slate-200'} rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-semibold`}
                                        placeholder="Nguyễn Văn An"
                                    />
                                    {errors.fullName && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.fullName}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Số điện thoại <span className="text-red-500">*</span></label>
                                    <input
                                        type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                                        className={`w-full px-5 py-4 bg-slate-50 border ${errors.phone ? 'border-red-400' : 'border-slate-200'} rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-semibold`}
                                        placeholder="0987xxxxxx"
                                    />
                                    {errors.phone && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.phone}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Ngày sinh <span className="text-red-500">*</span></label>
                                    <input
                                        type="date" name="dob" value={formData.dob} onChange={handleInputChange}
                                        className={`w-full px-5 py-4 bg-slate-50 border ${errors.dob ? 'border-red-400' : 'border-slate-200'} rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-semibold`}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Giới tính</label>
                                    <select
                                        name="gender" value={formData.gender} onChange={handleInputChange}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-semibold appearance-none"
                                    >
                                        <option value="Nam">Nam</option>
                                        <option value="Nữ">Nữ</option>
                                        <option value="Khác">Khác</option>
                                    </select>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Địa điểm sống & làm việc</label>
                                    <select
                                        name="location" value={formData.location} onChange={handleInputChange}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-semibold"
                                    >
                                        <option value="Hà Nội">Hà Nội</option>
                                        <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                                        <option value="Đà Nẵng">Đà Nẵng</option>
                                        <option value="Cần Thơ">Cần Thơ</option>
                                        <option value="Hải Phòng">Hải Phòng</option>
                                        <option value="Remote">Làm việc từ xa (Remote)</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Ngành nghề hiện tại <span className="text-red-500">*</span></label>
                                    <input
                                        type="text" name="industry" value={formData.industry} onChange={handleInputChange}
                                        className={`w-full px-5 py-4 bg-slate-50 border ${errors.industry ? 'border-red-400' : 'border-slate-200'} rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-semibold`}
                                        placeholder="Ví dụ: Công nghệ thông tin, Xây dựng, Marketing..."
                                    />
                                    {errors.industry && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.industry}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Chức danh / Vị trí <span className="text-red-500">*</span></label>
                                    <input
                                        type="text" name="title" value={formData.title} onChange={handleInputChange}
                                        className={`w-full px-5 py-4 bg-slate-50 border ${errors.title ? 'border-red-400' : 'border-slate-200'} rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-semibold`}
                                        placeholder="Ví dụ: Kỹ sư phần mềm, Nhân viên kinh doanh..."
                                    />
                                    {errors.title && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.title}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Kỹ năng chính <span className="text-red-500">*</span></label>
                                    <input
                                        type="text" name="skills" value={formData.skills} onChange={handleInputChange}
                                        className={`w-full px-5 py-4 bg-slate-50 border ${errors.skills ? 'border-red-400' : 'border-slate-200'} rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-semibold`}
                                        placeholder="Cách nhau bằng dấu phẩy (Ví dụ: React, SQL, Giao tiếp...)"
                                    />
                                    {errors.skills && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.skills}</p>}
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Học vấn (Tùy chọn)</label>
                                        <textarea
                                            name="education" value={formData.education} onChange={handleInputChange} rows={3}
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-semibold resize-none"
                                            placeholder="Trường học, bằng cấp, chứng chỉ..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Thành tựu (Tùy chọn)</label>
                                        <textarea
                                            name="achievements" value={formData.achievements} onChange={handleInputChange} rows={3}
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-semibold resize-none"
                                            placeholder="Các giải thưởng, thành tích nổi bật..."
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Kinh nghiệm làm việc chi tiết (Tùy chọn)</label>
                                    <textarea
                                        name="experience" value={formData.experience} onChange={handleInputChange} rows={4}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-semibold resize-none"
                                        placeholder="Mô tả các công việc, dự án bạn đã từng tham gia..."
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-16 flex justify-between items-center">
                        <button
                            onClick={handleBack}
                            disabled={step === 1}
                            className={`flex items-center gap-2 px-8 py-4 font-bold text-slate-400 transition-all ${step === 1 ? 'opacity-0' : 'hover:text-slate-800'}`}
                        >
                            <i className="fas fa-arrow-left text-xs"></i> Quay lại
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={isLoading}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-12 py-4 rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3"
                        >
                            {isLoading ? (
                                <><i className="fas fa-spinner fa-spin"></i> Đang lưu...</>
                            ) : (
                                <>
                                    {step === 3 ? 'Hoàn tất hồ sơ' : 'Tiếp tục'}
                                    <i className={`fas ${step === 3 ? 'fa-check-circle' : 'fa-arrow-right'} text-sm`}></i>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="bg-slate-50 p-6 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-slate-50">
                    <button
                        onClick={logout}
                        className="text-[11px] text-slate-400 hover:text-indigo-600 font-bold uppercase tracking-[0.2em] transition-colors flex items-center gap-2"
                    >
                        <i className="fas fa-sign-out-alt"></i> Quay lại đăng nhập
                    </button>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em]">WorkConnect © 2026 • Chuyên nghiệp • Hiệu quả</p>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;

