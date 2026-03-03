import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import jobApi, { JobType, JobStatus as BusinessJobStatus } from '../apis/api_job';
import workerAdApi, { WorkerAdStatus as WorkerJobStatus } from '../apis/api_worker_ad';
import Swal from 'sweetalert2';
import { locationsData } from '../mockData';
import SidebarProfile from '../components/SidebarProfile';


const provinces = Object.keys(locationsData);

const PostJob: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { id } = useParams();
    const isEditMode = Boolean(id);

    // Kiểm tra role
    const isWorker = user?.role === 'WORKER';

    // Character limits
    const MAX_DESCRIPTION_LENGTH = 2000;
    const MAX_REQUIREMENTS_LENGTH = 1000;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '', type: JobType.FULL_TIME, province: 'Hồ Chí Minh', district: '',
        salary: '', description: '', requirements: '', minRating: '4.0',
        // Các trường hỗ trợ nhập liệu lương
        salaryType: 'range' as 'range' | 'fixed' | 'negotiable',
        minSalary: '',
        maxSalary: ''
    });

    const parseSalaryString = (salaryStr: string) => {
        if (!salaryStr || salaryStr === 'Thỏa thuận') return { type: 'negotiable' as const, min: '', max: '' };
        const clean = salaryStr.replace(/ triệu/g, '').trim();
        if (clean.includes('-')) {
            const [min, max] = clean.split('-').map(s => s.trim());
            return { type: 'range' as const, min, max };
        }
        return { type: 'fixed' as const, min: clean, max: '' };
    };

    const [errors, setErrors] = useState<Record<string, string>>({});

    // --- LOGIC FETCH DATA (Bổ sung fallback mock data) ---
    useEffect(() => {
        if (isEditMode && id) {
            const fetchJobDetail = async () => {
                try {
                    if (isWorker) {
                        const ad = await workerAdApi.getById(id); // Giả sử có getById trong workerAdApi
                        if (ad) {
                            const [prov, dist] = ad.location.split(' - ');
                            const sData = parseSalaryString(ad.expectedSalary || '');
                            setFormData({
                                title: ad.title || '',
                                type: (ad as any).type || JobType.FULL_TIME,
                                province: prov || 'Hồ Chí Minh',
                                district: dist || '',
                                salary: ad.expectedSalary || '',
                                description: ad.description || '',
                                requirements: ad.skills?.join(', ') || '',

                                minRating: '4.0',
                                salaryType: sData.type,
                                minSalary: sData.min,
                                maxSalary: sData.max
                            });
                        }
                    } else {
                        const res = await jobApi.getById(id);
                        const jobData = res.data;
                        if (jobData) {
                            const [prov, dist] = jobData.location.split(' - ');
                            const sData = parseSalaryString(jobData.salary || '');
                            setFormData({
                                title: jobData.title || '',
                                type: jobData.type || JobType.FULL_TIME,
                                province: prov || 'Hồ Chí Minh',
                                district: dist || '',
                                salary: jobData.salary || '',
                                description: jobData.description || '',
                                requirements: jobData.requirements || '',
                                minRating: jobData.minRating ? jobData.minRating.toString() : '4.0',
                                salaryType: sData.type,
                                minSalary: sData.min,
                                maxSalary: sData.max
                            });
                        }
                    }
                } catch (error) {
                    console.error("Failed to fetch detail:", error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Lỗi',
                        text: 'Không tìm thấy dữ liệu tin đăng',
                        confirmButtonColor: '#ef4444'
                    });
                }
            };
            fetchJobDetail();
        }
    }, [id, isEditMode, isWorker]);


    // Validation function
    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.title.trim()) newErrors.title = isWorker ? 'Tiêu đề không được để trống' : 'Chức danh không được để trống';

        // Mức lương validation
        if (formData.salaryType !== 'negotiable') {
            if (!formData.minSalary) {
                newErrors.salary = 'Vui lòng nhập mức lương';
            } else if (formData.salaryType === 'range') {
                if (!formData.maxSalary) {
                    newErrors.salary = 'Vui lòng nhập mức lương tối đa';
                } else if (parseFloat(formData.minSalary) > parseFloat(formData.maxSalary)) {
                    newErrors.salary = 'Lương tối thiểu không được lớn hơn lương tối đa';
                }
            }
        }

        if (!formData.description.trim()) newErrors.description = 'Mô tả không được để trống';
        else if (formData.description.length > MAX_DESCRIPTION_LENGTH) newErrors.description = `Mô tả không được vượt quá ${MAX_DESCRIPTION_LENGTH} ký tự`;

        if (!formData.requirements.trim()) newErrors.requirements = isWorker ? 'Kỹ năng không được để trống' : 'Yêu cầu không được để trống';
        else if (formData.requirements.length > MAX_REQUIREMENTS_LENGTH) newErrors.requirements = `Yêu cầu không được vượt quá ${MAX_REQUIREMENTS_LENGTH} ký tự`;

        if (formData.province === 'Tất cả địa điểm' || !formData.province) newErrors.province = 'Vui lòng chọn tỉnh/thành';

        // Mức lương: Cho phép dạng text tự do nhưng thông báo nếu trống
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !user.id) return;
        if (!validateForm()) {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Vui lòng kiểm tra các trường bắt buộc',
                confirmButtonColor: '#ef4444'
            });
            return;
        }

        setIsSubmitting(true);
        Swal.fire({
            title: 'Đang xử lý...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // Format lại chuỗi lương trước khi lưu
        let finalSalary = '';
        if (formData.salaryType === 'negotiable') {
            finalSalary = 'Thỏa thuận';
        } else if (formData.salaryType === 'fixed') {
            finalSalary = `${formData.minSalary} triệu`;
        } else {
            finalSalary = `${formData.minSalary} - ${formData.maxSalary} triệu`;
        }

        try {
            if (user?.role === 'WORKER') {
                const adData = {
                    workerId: user.id,
                    fullName: user.fullName || user.name || '',
                    avatar: user.avatar || '',
                    title: formData.title,
                    description: formData.description,
                    skills: formData.requirements.split(',').map(s => s.trim()),

                    location: `${formData.province}${formData.district ? ' - ' + formData.district : ''}`,
                    expectedSalary: finalSalary,
                    status: WorkerJobStatus.OPEN,
                    verified: user.verified || false
                };

                if (isEditMode) {
                    await workerAdApi.update(id!, adData);
                } else {
                    await workerAdApi.create(adData);
                }


                await Swal.fire({
                    icon: 'success',
                    title: isEditMode ? 'Cập nhật thành công!' : 'Đăng tin thành công!',
                    text: 'Tin của bạn đã được lưu vào hệ thống.',
                    confirmButtonColor: '#4c42bd',
                    timer: 2000
                });
                navigate('/worker-manager');
            } else {
                const jobRequest = {
                    businessId: user.id,
                    title: formData.title,
                    requirements: formData.requirements,
                    salary: finalSalary,
                    location: `${formData.province}${formData.district ? ' - ' + formData.district : ''}`,
                    type: formData.type,
                    description: formData.description,
                    minRating: parseFloat(formData.minRating)
                };

                if (isEditMode) {
                    await jobApi.update(id!, jobRequest);
                } else {
                    await jobApi.create(jobRequest);
                }

                await Swal.fire({
                    icon: 'success',
                    title: isEditMode ? 'Cập nhật thành công!' : 'Đăng tin tuyển dụng thành công!',
                    text: 'Tin tuyển dụng của bạn đã được đăng tải.',
                    confirmButtonColor: '#4c42bd',
                    timer: 2000
                });
                navigate('/recruitment');
            }


        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Có lỗi xảy ra khi lưu tin',
                confirmButtonColor: '#ef4444'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Reset district khi province thay đổi
    useEffect(() => {
        setFormData(prev => ({ ...prev, district: '' }));
    }, [formData.province]);

    // --- GIAO DIỆN MỚI ---
    return (
        <div className="bg-[#F3F2EF] min-h-screen py-6 font-sans text-sm">
            <div className="max-w-[1128px] mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                    {/* LEFT SIDEBAR */}
                    <div className="md:col-span-3">
                        <SidebarProfile
                            user={user}
                            isWorker={isWorker}
                            repScore={user?.rating || 0}
                        />

                        {/* Tip Box */}
                        <div className="mt-4 bg-white rounded-lg border border-gray-300 p-4 shadow-sm">
                            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                <i className="fas fa-lightbulb text-amber-500"></i>
                                Mẹo nhỏ
                            </h4>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                {isWorker
                                    ? "Một tiêu đề thu hút và mô tả kỹ năng chi tiết giúp bạn nhanh chóng lọt vào mắt xanh của nhà tuyển dụng."
                                    : "Mẫu tin tuyển dụng chuyên nghiệp thường bao gồm đầy đủ Trách nhiệm, Yêu cầu và Quyền lợi để ứng viên dễ dàng ứng tuyển."
                                }
                            </p>
                        </div>
                    </div>

                    {/* MAIN CONTENT */}
                    <div className="md:col-span-9">
                        <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden">
                            {/* Header Section */}
                            <div className="p-4 md:p-6 border-b border-gray-100 flex items-center justify-between bg-white">
                                <div>
                                    <h1 className="text-lg md:text-xl font-bold text-gray-900">
                                        {isEditMode ? 'Cập nhật nội dung tin' : (isWorker ? 'Đăng tin tìm việc làm' : 'Đăng tin tuyển dụng mới')}
                                    </h1>
                                    <p className="text-xs md:text-sm text-gray-500 mt-1">
                                        {isEditMode
                                            ? "Cập nhật các thông tin mới nhất để thu hút ứng viên."
                                            : "Chia sẻ cơ hội nghề nghiệp đến với hàng ngàn người lao động."}
                                    </p>
                                </div>
                                <div className="hidden sm:flex w-12 h-12 bg-indigo-50 rounded-full items-center justify-center text-[#4c42bd]">
                                    <i className={`fas ${isWorker ? 'fa-bullhorn' : 'fa-briefcase'} text-xl`}></i>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-8">
                                {/* Step 1: Basic Info */}
                                <section className="space-y-4">
                                    <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                                        <span className="w-6 h-6 bg-[#4c42bd] text-white rounded-full flex items-center justify-center text-[10px]">1</span>
                                        Thông tin cơ bản
                                    </h2>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            {isWorker ? 'Tiêu đề tin đăng' : 'Chức danh tuyển dụng'} <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text" required
                                            className="w-full p-2.5 border border-gray-300 rounded outline-none focus:ring-1 focus:ring-[#4c42bd] focus:border-[#4c42bd] transition-all bg-gray-50/30"
                                            placeholder={isWorker ? 'VD: Tìm việc ReactJS Developer - 2 năm kinh nghiệm' : 'VD: Senior Frontend Developer (ReactJS)'}
                                            value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        />
                                        {errors.title && <p className="text-red-500 text-[10px] mt-1 italic font-medium">{errors.title}</p>}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Hình thức làm việc</label>
                                            <select
                                                className="w-full p-2.5 border border-gray-300 rounded outline-none focus:ring-1 focus:ring-[#4c42bd] bg-white cursor-pointer"
                                                value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as JobType })}
                                            >
                                                <option value={JobType.FULL_TIME}>Toàn thời gian (Full-time)</option>
                                                <option value={JobType.PART_TIME}>Bán thời gian (Part-time)</option>
                                                <option value={JobType.FREELANCE}>Tự do (Freelance)</option>
                                                <option value={JobType.CONTRACT}>Hợp đồng (Contract)</option>
                                                <option value={JobType.INTERNSHIP}>Thực tập (Internship)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                                                {isWorker ? 'Lương mong muốn' : 'Mức lương dự kiến'} <span className="text-red-500">*</span>
                                            </label>
                                            <div className="space-y-4">
                                                <div className="flex flex-wrap gap-2">
                                                    {[
                                                        { id: 'range', label: 'Khoảng lương', icon: 'fa-arrows-alt-h' },
                                                        { id: 'fixed', label: 'Cố định', icon: 'fa-thumbtack' },
                                                        { id: 'negotiable', label: 'Thỏa thuận', icon: 'fa-handshake' }
                                                    ].map(item => (
                                                        <button
                                                            key={item.id}
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, salaryType: item.id as any })}
                                                            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold transition-all border ${formData.salaryType === item.id
                                                                ? 'bg-[#4c42bd] text-white border-[#4c42bd] shadow-sm'
                                                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                                                }`}
                                                        >
                                                            <i className={`fas ${item.icon} text-[10px]`}></i>
                                                            {item.label}
                                                        </button>
                                                    ))}
                                                </div>

                                                {formData.salaryType !== 'negotiable' && (
                                                    <div className="flex items-center gap-3 animate-fadeIn">
                                                        <div className="relative flex-1 group">
                                                            <input
                                                                type="number"
                                                                step="0.1"
                                                                min="0"
                                                                placeholder={formData.salaryType === 'range' ? "Thấp nhất" : "Mức lương"}
                                                                className="w-full p-2.5 pl-8 pr-12 border border-gray-300 rounded outline-none focus:ring-1 focus:ring-[#4c42bd] bg-white transition-all"
                                                                value={formData.minSalary}
                                                                onChange={e => setFormData({ ...formData, minSalary: e.target.value })}
                                                            />
                                                            <i className="fas fa-money-bill-wave absolute left-2.5 top-3.5 text-gray-400 group-focus-within:text-[#4c42bd] transition-colors"></i>
                                                            <span className="absolute right-3 top-2.5 text-[10px] font-bold text-gray-400 uppercase">Triệu</span>
                                                        </div>

                                                        {formData.salaryType === 'range' && (
                                                            <>
                                                                <div className="w-2 h-[1px] bg-gray-300"></div>
                                                                <div className="relative flex-1 group">
                                                                    <input
                                                                        type="number"
                                                                        step="0.1"
                                                                        min="0"
                                                                        placeholder="Cao nhất"
                                                                        className="w-full p-2.5 pl-8 pr-12 border border-gray-300 rounded outline-none focus:ring-1 focus:ring-[#4c42bd] bg-white transition-all"
                                                                        value={formData.maxSalary}
                                                                        onChange={e => setFormData({ ...formData, maxSalary: e.target.value })}
                                                                    />
                                                                    <i className="fas fa-money-bill-wave absolute left-2.5 top-3.5 text-gray-400 group-focus-within:text-[#4c42bd] transition-colors"></i>
                                                                    <span className="absolute right-3 top-2.5 text-[10px] font-bold text-gray-400 uppercase">Triệu</span>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                                {errors.salary && <p className="text-red-500 text-[10px] mt-1 italic font-medium">{errors.salary}</p>}
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Step 2: Location & Requirements */}
                                <section className="space-y-4 pt-4 border-t border-gray-50">
                                    <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                                        <span className="w-6 h-6 bg-[#4c42bd] text-white rounded-full flex items-center justify-center text-[10px]">2</span>
                                        Vị trí & Điều kiện
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Tỉnh / Thành phố <span className="text-red-500">*</span></label>
                                            <div className="relative">
                                                <select
                                                    className="w-full p-2.5 pl-8 border border-gray-300 rounded outline-none focus:ring-1 focus:ring-[#4c42bd] bg-white cursor-pointer"
                                                    value={formData.province} onChange={e => setFormData({ ...formData, province: e.target.value })}
                                                >
                                                    {provinces.map(prov => (
                                                        <option key={prov} value={prov}>{prov}</option>
                                                    ))}
                                                </select>
                                                <i className="fas fa-map-marker-alt absolute left-2.5 top-3.5 text-gray-400"></i>
                                            </div>
                                            {errors.province && <p className="text-red-500 text-[10px] mt-1 italic font-medium">{errors.province}</p>}
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Quận / Huyện</label>
                                            <select
                                                className="w-full p-2.5 border border-gray-300 rounded outline-none focus:ring-1 focus:ring-[#4c42bd] bg-white cursor-pointer disabled:bg-gray-100"
                                                value={formData.district} onChange={e => setFormData({ ...formData, district: e.target.value })}
                                                disabled={!locationsData[formData.province] || locationsData[formData.province].length === 0}
                                            >
                                                <option value="">Tất cả quận/huyện</option>
                                                {locationsData[formData.province]?.map(dist => (
                                                    <option key={dist} value={dist}>{dist}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-2">
                                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Yêu cầu điểm uy tín tối thiểu</label>
                                        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                            <input
                                                type="range" min="0" max="5.0" step="0.5"
                                                className="flex-grow h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#4c42bd]"
                                                value={formData.minRating} onChange={e => setFormData({ ...formData, minRating: e.target.value })}
                                            />
                                            <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full border border-[#4c42bd] shadow-sm">
                                                <span className="font-bold text-[#4c42bd]">{formData.minRating}</span>
                                                <i className="fas fa-star text-amber-500 text-[10px]"></i>
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-gray-500 italic">Chỉ những thành viên có điểm uy tín cao hơn mức này mới có thể ứng tuyển.</p>
                                    </div>
                                </section>

                                {/* Step 3: Details */}
                                <section className="space-y-4 pt-4 border-t border-gray-50">
                                    <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                                        <span className="w-6 h-6 bg-[#4c42bd] text-white rounded-full flex items-center justify-center text-[10px]">3</span>
                                        Mô tả chi tiết
                                    </h2>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            {isWorker ? 'Giới thiệu & Lịch sử công việc' : 'Mô tả công việc & Trách nhiệm'} <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            required rows={7}
                                            maxLength={MAX_DESCRIPTION_LENGTH}
                                            className="w-full p-3 border border-gray-300 rounded outline-none focus:ring-1 focus:ring-[#4c42bd] resize-y bg-gray-50/30"
                                            placeholder={isWorker ? 'VD: Tôi có 3 năm kinh nghiệm trong lĩnh vực phục vụ nhà hàng, đã từng làm việc tại...' : 'Nêu rõ các đầu việc chính, môi trường làm việc...'}
                                            value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        ></textarea>
                                        <div className="flex justify-between items-center">
                                            {errors.description && <p className="text-red-500 text-[10px] mt-1 italic font-medium">{errors.description}</p>}
                                            <p className={`text-[10px] mt-1 ml-auto ${formData.description.length > MAX_DESCRIPTION_LENGTH * 0.9
                                                    ? 'text-red-500 font-bold'
                                                    : formData.description.length > MAX_DESCRIPTION_LENGTH * 0.7
                                                        ? 'text-amber-500 font-medium'
                                                        : 'text-gray-400'
                                                }`}>
                                                {formData.description.length}/{MAX_DESCRIPTION_LENGTH} ký tự
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            {isWorker ? 'Kỹ năng chuyên môn' : 'Yêu cầu ứng viên'} <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            required rows={4}
                                            maxLength={MAX_REQUIREMENTS_LENGTH}
                                            className="w-full p-3 border border-gray-300 rounded outline-none focus:ring-1 focus:ring-[#4c42bd] resize-y bg-gray-50/30"
                                            placeholder={isWorker ? 'VD: Giao tiếp tốt, sử dụng máy tính cơ bản, sức khỏe tốt...' : 'VD: Có kinh nghiệm tương đương, thái độ chuyên nghiệp, sẵn sàng tăng ca...'}
                                            value={formData.requirements} onChange={e => setFormData({ ...formData, requirements: e.target.value })}
                                        ></textarea>
                                        <div className="flex justify-between items-center">
                                            {errors.requirements && <p className="text-red-500 text-[10px] mt-1 italic font-medium">{errors.requirements}</p>}
                                            <p className={`text-[10px] mt-1 ml-auto ${formData.requirements.length > MAX_REQUIREMENTS_LENGTH * 0.9
                                                    ? 'text-red-500 font-bold'
                                                    : formData.requirements.length > MAX_REQUIREMENTS_LENGTH * 0.7
                                                        ? 'text-amber-500 font-medium'
                                                        : 'text-gray-400'
                                                }`}>
                                                {formData.requirements.length}/{MAX_REQUIREMENTS_LENGTH} ký tự
                                            </p>
                                        </div>
                                    </div>
                                </section>

                                {/* Footer Actions */}
                                <div className="pt-8 flex flex-col-reverse md:flex-row justify-end gap-3 md:gap-4 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => navigate(isWorker ? '/dashboard' : '/recruitment')}
                                        className="w-full md:w-auto px-8 py-2.5 border border-gray-300 text-gray-600 font-bold rounded-full hover:bg-gray-50 transition-all active:scale-95 text-center"
                                    >
                                        Hủy bỏ
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full md:w-auto px-10 py-2.5 bg-[#4c42bd] text-white font-bold rounded-full hover:bg-[#3a32a0] transition-all shadow-md disabled:opacity-50 active:scale-95 text-center flex justify-center items-center"
                                    >
                                        {isSubmitting ? (
                                            <span className="flex items-center gap-2">
                                                <i className="fas fa-circle-notch fa-spin"></i>
                                                Đang xử lý
                                            </span>
                                        ) : (isEditMode ? 'Lưu thay đổi' : 'Hoàn tất & Đăng tin')}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* LinkedIn-style mini footer */}
                        <div className="mt-8 flex flex-wrap justify-center gap-x-4 gap-y-2 text-[11px] text-gray-500 mb-10">
                            <span className="hover:underline cursor-pointer">Chính sách đăng tin</span>
                            <span className="hover:underline cursor-pointer">Hướng dẫn bảo mật</span>
                            <span className="hover:underline cursor-pointer">Hỗ trợ 24/7</span>
                            <span className="font-bold text-gray-400">WorkConnect © 2025</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostJob;