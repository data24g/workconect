import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import Swal from 'sweetalert2';
import userApi from '../apis/api_user';

const EditProfile: React.FC = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState({
        fullName: user?.fullName || user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        dob: user?.dob || '',
        gender: user?.gender || 'Nam',
        location: user?.location || 'Hà Nội',
        address: user?.address || '',
        bio: user?.bio || '',
        title: user?.title || '',
        industry: user?.industry || '',
        description: user?.description || '',
    });

    const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
    const [coverPreview, setCoverPreview] = useState(user?.coverPhoto || '');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi',
                    text: 'Kích thước ảnh không được vượt quá 5MB!'
                });
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                if (type === 'avatar') setAvatarPreview(reader.result as string);
                else setCoverPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Validate fullName
        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Họ và tên không được để trống';
        } else if (formData.fullName.trim().length < 2) {
            newErrors.fullName = 'Họ và tên phải có ít nhất 2 ký tự';
        } else if (formData.fullName.trim().length > 100) {
            newErrors.fullName = 'Họ và tên không được vượt quá 100 ký tự';
        }

        // Validate phone (Vietnam phone number format)
        if (formData.phone) {
            const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
            if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
                newErrors.phone = 'Số điện thoại không hợp lệ (VD: 0912345678 hoặc +84912345678)';
            }
        }

        // Validate date of birth
        if (formData.dob) {
            const dob = new Date(formData.dob);
            const today = new Date();
            const age = today.getFullYear() - dob.getFullYear();

            if (age < 16) {
                newErrors.dob = 'Bạn phải ít nhất 16 tuổi';
            } else if (age > 100) {
                newErrors.dob = 'Ngày sinh không hợp lệ';
            }
        }

        // Validate bio length
        if (formData.bio && formData.bio.length > 500) {
            newErrors.bio = 'Giới thiệu không được vượt quá 500 ký tự';
        }

        // Validate title length
        if (formData.title && formData.title.length > 100) {
            newErrors.title = 'Chức danh không được vượt quá 100 ký tự';
        }

        // Validate description length
        if (formData.description && formData.description.length > 5000) {
            newErrors.description = 'Mô tả không được vượt quá 5000 ký tự';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        // Validate form before submitting
        if (!validateForm()) {
            Swal.fire({
                icon: 'error',
                title: 'Thông tin chưa hợp lệ',
                html: Object.values(errors).map(err => `• ${err}`).join('<br/>'),
                confirmButtonColor: '#4c42bd'
            });
            return;
        }

        setIsSaving(true);
        Swal.fire({
            title: 'Đang lưu thay đổi...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const updatedData = {
                ...formData,
                avatar: avatarPreview,
                coverPhoto: coverPreview,
            };

            const responseUser = await userApi.update(user.id, updatedData);

            if (responseUser) {
                updateUser(responseUser);
                await Swal.fire({
                    icon: 'success',
                    title: 'Thành công',
                    text: 'Hồ sơ đã được cập nhật!',
                    timer: 2000,
                    showConfirmButton: false
                });
                navigate('/profile');
            }
        } catch (error) {
            console.error("Update failed:", error);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Lỗi khi lưu thông tin.'
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (!user) return null;

    return (
        <div className="bg-[#F4F2EE] h-screen overflow-hidden font-sans text-sm flex flex-col">
            {/* STICKY HEADER - Fixed at top of screen */}
            <div className="w-full bg-[#F4F2EE] pt-6 pb-2 shrink-0">
                <div className="max-w-[1128px] mx-auto px-4">
                    <div className="bg-white p-1 border border-gray-200 rounded-3xl shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={() => navigate('/profile')}
                                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                            >
                                <i className="fas fa-arrow-left"></i>
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 leading-tight">Thiết lập hồ sơ</h1>
                                <p className="text-[11px] text-gray-500 font-medium tracking-wide italic">Tăng mức độ chuyên nghiệp để kết nối cơ hội mới</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => navigate('/profile')}
                                className="px-6 py-2.5 text-gray-500 font-bold rounded-full hover:bg-gray-100 transition-colors"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                type="submit"
                                form="edit-profile-form"
                                disabled={isSaving}
                                className="px-10 py-2.5 mr-2 bg-[#4c42bd] text-white font-bold rounded-full hover:bg-[#3a32a0] transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
                            >
                                {isSaving ? 'Đang lưu...' : 'Lưu tất cả'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT AREA - Fixed screen layout */}
            <div className="flex-1 overflow-hidden">
                <div className="max-w-[1128px] mx-auto px-4 h-full">
                    <form id="edit-profile-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">

                        {/* LEFT COLUMN: Fixed Image section */}
                        <div className="lg:col-span-4 h-full pt-4 shrink-0">
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-fit mb-6">
                                <div className="p-5 border-b border-gray-100 bg-gray-50/30">
                                    <h3 className="font-bold text-gray-800 flex items-center gap-2 uppercase tracking-wider text-xs">
                                        <i className="fas fa-camera text-indigo-500 text-sm"></i>
                                        Hình ảnh định danh
                                    </h3>
                                </div>

                                <div className="p-8 space-y-10">
                                    {/* Avatar Section */}
                                    <div className="flex flex-col items-center">
                                        <div className="w-full flex justify-between items-center mb-4">
                                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Ảnh đại diện</span>
                                            <button
                                                type="button"
                                                onClick={() => avatarInputRef.current?.click()}
                                                className="text-[#4c42bd] text-[10px] font-black hover:underline uppercase"
                                            >
                                                Thay đổi
                                            </button>
                                        </div>
                                        <div
                                            className="w-40 h-40 rounded-full border-[6px] border-indigo-50 bg-white relative group cursor-pointer overflow-hidden shadow-md flex items-center justify-center"
                                            onClick={() => avatarInputRef.current?.click()}
                                        >
                                            <img
                                                src={avatarPreview || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.username}`}
                                                className="w-full h-full object-cover transition-all group-hover:scale-110 group-hover:brightness-90"
                                                alt="Avatar"
                                            />
                                            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 text-white">
                                                <i className="fas fa-camera text-2xl mb-1"></i>
                                                <span className="text-[10px] font-bold uppercase">Cập nhật</span>
                                            </div>
                                        </div>
                                        <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'avatar')} />
                                    </div>

                                    {/* Cover Section */}
                                    <div className="pt-8 border-t border-gray-100">
                                        <div className="w-full flex justify-between items-center mb-4">
                                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Ảnh bìa hồ sơ</span>
                                            <button
                                                type="button"
                                                onClick={() => coverInputRef.current?.click()}
                                                className="text-[#4c42bd] text-[10px] font-black hover:underline uppercase"
                                            >
                                                Thay đổi
                                            </button>
                                        </div>
                                        <div
                                            className="w-full h-32 rounded-xl bg-gray-50 relative group cursor-pointer overflow-hidden border-2 border-dashed border-gray-200 flex items-center justify-center shadow-inner"
                                            onClick={() => coverInputRef.current?.click()}
                                        >
                                            {coverPreview ? (
                                                <img src={coverPreview} className="w-full h-full object-cover" alt="Cover" />
                                            ) : (
                                                <div className="text-center text-gray-300">
                                                    <i className="fas fa-image text-2xl mb-1 mt-2 block"></i>
                                                    <p className="text-[9px] font-bold">Kích thước 4:1</p>
                                                </div>
                                            )}
                                        </div>
                                        <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'cover')} />
                                    </div>
                                </div>
                            </div>

                            {/* Tip section */}
                            <div className="bg-indigo-600 rounded-xl p-2 text-white shadow-lg overflow-hidden relative">
                                <i className="fas fa-lightbulb absolute -right-4 -bottom-4 text-8xl opacity-10 rotate-12"></i>
                                <h4 className="font-bold mb-1 pl-2 flex items-center gap-1 text-[10px]">
                                    <i className="fas fa-magic"></i>
                                    Mẹo nhỏ
                                </h4>
                                <p className="pl-2 text-[9px] leading-relaxed opacity-90 font-medium">
                                    Hồ sơ đầy đủ thông tin giúp bạn tăng tỷ lệ kết nối thành công lên 40%. Đừng quên cập nhật các dự án mới nhất!
                                </p>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Only this part scrolls */}
                        <div className="lg:col-span-8 h-full pt-4 flex flex-col min-h-0">
                            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar space-y-6 pb-24">
                                {/* Section 1: Intro */}
                                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 space-y-6">
                                    <div className="flex items-center gap-3 border-b border-gray-50 pb-5">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
                                            <i className="fas fa-user-edit text-lg"></i>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-800 uppercase tracking-wider text-xs">Thông tin định danh</h3>
                                            <p className="text-[10px] text-gray-400 font-medium">Cung cấp tên và chức danh chính xác để người khác dễ dàng nhận diện</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-7 mt-2">
                                        <div className="space-y-1.5 md:col-span-1">
                                            <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-tighter">Họ và tên <span className="text-red-500">*</span></label>
                                            <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} required
                                                className={`w-full p-3.5 bg-gray-50 border rounded-xl outline-none focus:bg-white transition-all font-semibold text-gray-800 shadow-inner ${errors.fullName ? 'border-red-500 focus:border-red-500' : 'border-transparent focus:border-[#4c42bd]'}`} />
                                            {errors.fullName && <p className="text-red-500 text-[10px] mt-1 ml-1 font-medium">{errors.fullName}</p>}
                                        </div>
                                        <div className="space-y-1.5 md:col-span-1">
                                            <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-tighter">Chức danh hiển thị</label>
                                            <input type="text" name="title" value={formData.title} onChange={handleInputChange}
                                                className={`w-full p-3.5 bg-gray-50 border rounded-xl outline-none focus:bg-white transition-all font-semibold text-gray-800 shadow-inner ${errors.title ? 'border-red-500 focus:border-red-500' : 'border-transparent focus:border-[#4c42bd]'}`}
                                                placeholder="VD: Senior Web Developer..." />
                                            {errors.title && <p className="text-red-500 text-[10px] mt-1 ml-1 font-medium">{errors.title}</p>}
                                        </div>
                                        <div className="space-y-1.5 md:col-span-2">
                                            <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-tighter">Khẩu hiệu / Giới thiệu ngắn (Bio)</label>
                                            <textarea name="bio" value={formData.bio} onChange={handleInputChange} rows={2}
                                                className={`w-full p-3.5 bg-gray-50 border rounded-xl outline-none focus:bg-white transition-all font-semibold text-gray-800 shadow-inner resize-none text-sm ${errors.bio ? 'border-red-500 focus:border-red-500' : 'border-transparent focus:border-[#4c42bd]'}`}
                                                placeholder="Tóm tắt ngắn gọn về bạn..." />
                                            {errors.bio && <p className="text-red-500 text-[10px] mt-1 ml-1 font-medium">{errors.bio}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Contact & Personal */}
                                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 space-y-6">
                                    <div className="flex items-center gap-3 border-b border-gray-50 pb-5">
                                        <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-sm">
                                            <i className="fas fa-address-book text-lg"></i>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-800 uppercase tracking-wider text-xs">Liên hệ & Cá nhân</h3>
                                            <p className="text-[10px] text-gray-400 font-medium">Bảo mật thông tin liên lạc của bạn</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-7 mt-2">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-tighter">Email liên hệ</label>
                                            <input type="email" value={formData.email} disabled className="w-full p-3.5 bg-gray-100 border-transparent text-gray-400 rounded-xl cursor-not-allowed font-medium shadow-inner" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-tighter">Số điện thoại</label>
                                            <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                                                className={`w-full p-3.5 bg-gray-50 border rounded-xl outline-none focus:bg-white transition-all font-semibold text-gray-800 shadow-inner ${errors.phone ? 'border-red-500 focus:border-red-500' : 'border-transparent focus:border-[#4c42bd]'}`}
                                                placeholder="VD: 0912345678" />
                                            {errors.phone && <p className="text-red-500 text-[10px] mt-1 ml-1 font-medium">{errors.phone}</p>}
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-tighter">Ngày sinh</label>
                                            <input type="date" name="dob" value={formData.dob} onChange={handleInputChange}
                                                className={`w-full p-3.5 bg-gray-50 border rounded-xl outline-none focus:bg-white transition-all font-semibold text-gray-800 shadow-inner px-4 ${errors.dob ? 'border-red-500 focus:border-red-500' : 'border-transparent focus:border-[#4c42bd]'}`} />
                                            {errors.dob && <p className="text-red-500 text-[10px] mt-1 ml-1 font-medium">{errors.dob}</p>}
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-tighter">Giới tính</label>
                                            <div className="flex gap-3">
                                                {['Nam', 'Nữ', 'Khác'].map((g) => (
                                                    <label key={g} className="flex-1 flex items-center justify-center gap-2 p-3 bg-white border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-all has-[:checked]:bg-[#4c42bd] has-[:checked]:text-white">
                                                        <input type="radio" name="gender" value={g} checked={formData.gender === g} onChange={handleInputChange} className="hidden" />
                                                        <span className="text-xs font-bold">{g}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-tighter">Thành phố làm việc</label>
                                            <select name="location" value={formData.location} onChange={handleInputChange}
                                                className="w-full p-3.5 bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-[#4c42bd] transition-all font-semibold text-gray-800 shadow-inner appearance-none px-4">
                                                <option value="Hà Nội">Hà Nội</option>
                                                <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                                                <option value="Đà Nẵng">Đà Nẵng</option>
                                                <option value="Cần Thơ">Cần Thơ</option>
                                                <option value="Hải Phòng">Hải Phòng</option>
                                                <option value="Remote">Remote (Làm việc từ xa)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-tighter">Địa chỉ thường trú</label>
                                            <input type="text" name="address" value={formData.address} onChange={handleInputChange}
                                                className="w-full p-3.5 bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-[#4c42bd] transition-all font-semibold text-gray-800 shadow-inner"
                                                placeholder="Tên đường, phường, quận..." />
                                        </div>
                                    </div>
                                </div>

                                {/* Section 3: Professional/Business Info */}
                                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 space-y-6">
                                    <div className="flex items-center gap-3 border-b border-gray-50 pb-5">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
                                            <i className="fas fa-briefcase text-lg"></i>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-800 uppercase tracking-wider text-xs">
                                                {user.role === UserRole.BUSINESS ? 'Thông tin Nhà tuyển dụng' : 'Chi tiết kinh nghiệm'}
                                            </h3>
                                            <p className="text-[10px] text-gray-400 font-medium">Mô tả chi tiết năng lực và các dự án quan trọng</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6 mt-2">
                                        {user.role === UserRole.BUSINESS && (
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-tighter">Lĩnh vực hoạt động</label>
                                                <input type="text" name="industry" value={formData.industry} onChange={handleInputChange}
                                                    className="w-full p-3.5 bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-[#4c42bd] transition-all font-semibold text-gray-800 shadow-inner" />
                                            </div>
                                        )}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-tighter">Tóm tắt quá trình & Dự án</label>
                                            <textarea name="description" value={formData.description} onChange={handleInputChange} rows={12}
                                                className={`w-full p-4 bg-gray-50 border rounded-xl outline-none focus:bg-white transition-all font-semibold text-gray-800 shadow-inner resize-none text-sm leading-relaxed ${errors.description ? 'border-red-500 focus:border-red-500' : 'border-transparent focus:border-[#4c42bd]'}`}
                                                placeholder="Kể chi tiết hơn về các dự án bạn đã thực hiện..." />
                                            {errors.description && <p className="text-red-500 text-[10px] mt-1 ml-1 font-medium">{errors.description}</p>}
                                        </div>
                                    </div>

                                    <div className="pt-8 flex justify-center border-t border-gray-50 mt-4">
                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className="px-24 py-4 bg-[#4c42bd] text-white font-black rounded-full hover:bg-[#3a32a0] transition-all shadow-xl shadow-indigo-100 uppercase tracking-[0.2em] text-[10px]"
                                        >
                                            Hoàn tất tất cả thay đổi
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditProfile;
