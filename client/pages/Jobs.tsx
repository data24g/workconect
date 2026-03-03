import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';

// Import API và Types
import jobApi, { JobResponse, JobType } from '../apis/api_job';
import workSessionApi, { WorkSessionResponse } from '../apis/api_work_session';
import { useAuth } from '../contexts/AuthContext';
import { useSaved } from '../contexts/SavedContext';
import { locationsData } from '../mockData';
import { rankJobListings, calculateJobMatchPercentage } from '../utils/ranking';

// Get unique provinces
const provinces = Object.keys(locationsData);

// --- HELPERS (Giữ nguyên logic) ---
const formatTimeAgo = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " năm trước";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " tháng trước";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " ngày trước";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " giờ trước";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " phút trước";
  return "Vừa xong";
};

const formatJobType = (type: JobType) => {
  const map: Record<string, string> = {
    FULL_TIME: 'Toàn thời gian',
    PART_TIME: 'Bán thời gian',
    CONTRACT: 'Hợp đồng',
    INTERNSHIP: 'Thực tập',
    FREELANCE: 'Freelance'
  };
  return map[type] || type;
};

// Helper để parse min salary từ string (ví dụ: '15-25 triệu' -> 15)
const parseMinSalary = (salary: string): number => {
  const match = salary.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
};

const Jobs: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // --- STATE MANAGEMENT ---
  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [provinceFilter, setProvinceFilter] = useState('Tất cả địa điểm');
  const [districtFilter, setDistrictFilter] = useState('');

  // Dropdown States
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Refs for click outside
  const provinceRef = React.useRef<HTMLDivElement>(null);
  const districtRef = React.useRef<HTMLDivElement>(null);
  const sortRef = React.useRef<HTMLDivElement>(null);
  const [typeFilters, setTypeFilters] = useState<JobType[]>([]);
  const [minRatingFilter, setMinRatingFilter] = useState(0);
  const [minSalaryFilter, setMinSalaryFilter] = useState(0);
  const [maxSalaryFilter, setMaxSalaryFilter] = useState(100); // Giả sử max 100 triệu
  const [sortBy, setSortBy] = useState<'newest' | 'relevant' | 'salaryHigh' | 'salaryLow'>('relevant');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Ví dụ: 10 công việc mỗi trang

  const [appliedWorkSessions, setAppliedWorkSessions] = useState<Record<string, WorkSessionResponse>>({});
  const { isJobSaved, saveJob, unsaveJob } = useSaved();
  const [selectedJob, setSelectedJob] = useState<JobResponse | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // --- EFFECT: NHẬN DỮ LIỆU TỪ TRANG HOME ---
  useEffect(() => {
    if (location.state) {
      const { searchTerm: initialSearch, location: initialLoc } = location.state as any;
      if (initialSearch) setSearchTerm(initialSearch);
      if (initialLoc) {
        // Giả sử initialLoc là 'Tỉnh - Quận', split để set
        const [prov, dist] = initialLoc.split(' - ');
        setProvinceFilter(prov || 'Tất cả địa điểm');
        setDistrictFilter(dist || '');
      }
    }
  }, [location.state]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (provinceRef.current && !provinceRef.current.contains(event.target as Node)) setShowProvinceDropdown(false);
      if (districtRef.current && !districtRef.current.contains(event.target as Node)) setShowDistrictDropdown(false);
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) setShowSortDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openBusinessProfile = (businessId: string) => {
    // Thêm dấu / ở đầu để điều hướng tuyệt đối từ root
    navigate(`/fast-processing/${businessId}`);
  };

  // --- LOGIC XỬ LÝ (Giữ nguyên logic cũ) ---
  const handleApplyClick = async (job: JobResponse) => {
    if (!user) {
      Swal.fire({
        title: 'Chưa đăng nhập',
        text: "Bạn cần đăng nhập để ứng tuyển công việc này.",
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#4c42bd',
        confirmButtonText: 'Đăng nhập ngay',
        cancelButtonText: 'Để sau',
        customClass: { popup: 'rounded-lg' }
      }).then((res) => { if (res.isConfirmed) navigate('/login'); });
      return;
    }

    if (user.role === 'BUSINESS') {
      Swal.fire({
        icon: 'warning',
        title: 'Thông báo',
        text: 'Tài khoản Nhà tuyển dụng không thể ứng tuyển!',
        timer: 2000
      });
      return;
    }

    const userRating = user.rating || 0;
    const requiredRating = job.minRating || 0;

    // Check rating condition
    if (requiredRating > 0 && userRating < requiredRating) {
      const warning = await Swal.fire({
        icon: 'warning',
        title: 'Cân nhắc ứng tuyển',
        text: "Số sao ntd yêu cầu lớn hơn số sao uy tín của bạn, khả năng được tuyển sẽ rất thấp, vẫn ứng tuyển?",
        showCancelButton: true,
        confirmButtonColor: '#f59e0b', // Amber
        cancelButtonColor: '#6b7280', // Gray
        confirmButtonText: 'Vẫn ứng tuyển',
        cancelButtonText: 'Hủy bỏ',
        customClass: { popup: 'rounded-lg' }
      });
      if (!warning.isConfirmed) return;
    }

    const confirmResult = await Swal.fire({
      title: 'Gửi hồ sơ?',
      text: `Bạn muốn ứng tuyển vị trí "${job.title}" tại ${job.businessName || 'công ty'}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4c42bd',
      confirmButtonText: 'Gửi hồ sơ',
      cancelButtonText: 'Hủy',
      customClass: { popup: 'rounded-lg' }
    });

    if (confirmResult.isConfirmed) {
      Swal.fire({
        title: 'Đang gửi hồ sơ...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      try {
        const res = await workSessionApi.create({
          jobId: job.id,
          workerId: user.id,
          businessId: job.businessId
        });

        if (res && (res.success === 200)) {
          await Swal.fire({
            icon: 'success',
            title: 'Thành công',
            text: 'Đã gửi hồ sơ thành công!',
            timer: 1500,
            showConfirmButton: false
          });
          setAppliedWorkSessions(prev => ({
            ...prev,
            [job.id]: res.data
          }));
        } else {
          throw new Error("Phản hồi server không hợp lệ");
        }
      } catch (error: any) {
        console.error("Lỗi ứng tuyển:", error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Không thể gửi hồ sơ lúc này.'
        });
      }
    }
  };

  const handleSaveJobAction = (jobId: string) => {
    if (isJobSaved(jobId)) {
      unsaveJob(jobId);
      Swal.fire({
        icon: 'info',
        title: 'Đã bỏ lưu',
        text: 'Công việc đã được xóa khỏi danh sách lưu.',
        timer: 1500,
        showConfirmButton: false
      });
    } else {
      saveJob(jobId);
      Swal.fire({
        icon: 'success',
        title: 'Đã lưu công việc',
        text: 'Bạn có thể xem trong mục Đã lưu ở Dashboard.',
        confirmButtonColor: '#4c42bd',
        confirmButtonText: 'OK',
        customClass: { popup: 'rounded-lg' }
      });
    }
  };

  const handleViewRejectReason = (reason?: string) => {
    Swal.fire({
      title: 'Phản hồi từ nhà tuyển dụng',
      text: reason || "Không có lý do cụ thể.",
      icon: 'info',
      confirmButtonText: 'Đóng',
      confirmButtonColor: '#4c42bd',
      customClass: { popup: 'rounded-lg' }
    });
  };

  const handleViewJobDetail = (job: JobResponse) => {
    setSelectedJob(job);
    setShowDetailModal(true);
  };

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch từ API thật
        const jobRes = await jobApi.getAll();
        if (jobRes.success === 200) {
          const jobData = jobRes.data;
          setJobs(jobData.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()));
        } else {
          setError('Không thể lấy danh sách công việc.');
        }

        if (user && user.role !== 'BUSINESS') {
          try {
            const historyRes = await workSessionApi.getByWorker(user.id);
            if (historyRes && historyRes.success === 200 && Array.isArray(historyRes.data)) {
              const sessionsMap: Record<string, WorkSessionResponse> = {};
              historyRes.data.forEach((session: WorkSessionResponse) => {
                sessionsMap[session.jobId] = session;
              });
              setAppliedWorkSessions(sessionsMap);
            }
          } catch (e) {
            console.warn("Lỗi lấy lịch sử ứng tuyển");
          }
        }
      } catch (err) {
        console.error("Fetch jobs error:", err);
        setError('Không thể tải dữ liệu việc làm. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Filter Logic
  const filteredJobs = jobs.filter(job => {
    if (job.status !== 'OPEN') return false;
    const searchTermLower = searchTerm.toLowerCase();
    const matchSearch =
      (job.title?.toLowerCase().includes(searchTermLower)) ||
      (job.requirements?.toLowerCase().includes(searchTermLower)) ||
      (job.businessName && job.businessName.toLowerCase().includes(searchTermLower));

    // Hierarchical location filter: Match if province matches and (district empty or matches)
    const jobLocationParts = job.location.split(' - ');
    const jobProvince = jobLocationParts[0] || '';
    const jobDistrict = jobLocationParts[1] || '';
    const matchLocation = provinceFilter === 'Tất cả địa điểm' ||
      (jobProvince === provinceFilter && (districtFilter === '' || jobDistrict === districtFilter));

    const matchType = !typeFilters.length || typeFilters.includes(job.type);

    const matchRating = (job.businessRating || 0) >= minRatingFilter;
    const matchMinSalary = minSalaryFilter === 0 || parseMinSalary(job.salary) >= minSalaryFilter;
    const matchMaxSalary = maxSalaryFilter === 100 || parseMinSalary(job.salary) <= maxSalaryFilter;

    return matchSearch && matchLocation && matchType && matchRating && matchMinSalary && matchMaxSalary;
  });

  // Apply Sorting / Ranking
  let sortedJobs = [...filteredJobs];
  if (sortBy === 'relevant') {
    // Mock premium check for demo
    const isPremiumBusiness = (id: string) => (parseInt(id.slice(-1)) || 0) % 4 === 0;
    sortedJobs = rankJobListings(filteredJobs, user, isPremiumBusiness);
  } else if (sortBy === 'newest') {
    sortedJobs.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
  } else if (sortBy === 'salaryHigh') {
    sortedJobs.sort((a, b) => parseMinSalary(b.salary) - parseMinSalary(a.salary));
  } else if (sortBy === 'salaryLow') {
    sortedJobs.sort((a, b) => parseMinSalary(a.salary) - parseMinSalary(b.salary));
  }

  // Calculate Pagination
  const totalPages = Math.ceil(sortedJobs.length / itemsPerPage);
  const paginatedJobs = sortedJobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (newPage: number | 'prev' | 'next') => {
    if (newPage === 'prev') {
      setCurrentPage(prev => Math.max(prev - 1, 1));
    } else if (newPage === 'next') {
      setCurrentPage(prev => Math.min(prev + 1, totalPages));
    } else {
      setCurrentPage(newPage as number);
    }
  };

  const handleTypeFilterChange = (type: JobType) => {
    setTypeFilters(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
    setCurrentPage(1);
  };

  // Reset district khi province thay đổi
  useEffect(() => {
    setDistrictFilter('');
    setCurrentPage(1);
  }, [provinceFilter]);

  return (
    <div className="bg-[#F3F2EF] min-h-screen font-sans pb-10">

      {/* 1. Search Section (Sticky) */}
      <div className="bg-white border-b border-gray-200 pt-4 pb-4 shadow-sm sticky top-[52px] z-30">
        <div className="max-w-[1128px] mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-4">

            <div className="flex flex-col md:flex-row flex-grow gap-3 w-full md:w-auto">
              <div className="flex-grow relative w-full">
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"></i>
                <input
                  type="text"
                  placeholder="Tìm kiếm theo chức danh, kỹ năng hoặc công ty"
                  className="w-full pl-10 pr-4 py-2 bg-[#eef3f8] border border-transparent focus:bg-white focus:border-gray-900 focus:ring-1 focus:ring-gray-900 rounded-md text-sm transition-all outline-none h-10"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <i className="fas fa-times-circle"></i>
                  </button>
                )}
              </div>

              <div className="flex gap-3 w-full md:w-auto">
                {/* Province Dropdown */}
                <div className="flex-1 md:w-64 relative shrink-0" ref={provinceRef}>
                  <div
                    className="w-full pl-9 pr-8 py-2 bg-[#eef3f8] border border-transparent rounded-md text-sm transition-all outline-none h-10 flex items-center cursor-pointer group"
                    onClick={() => setShowProvinceDropdown(!showProvinceDropdown)}
                  >
                    <i className="fas fa-map-marker-alt absolute left-3 text-gray-500 group-hover:text-[#4c42bd]"></i>
                    <span className="truncate flex-grow">{provinceFilter}</span>
                    <i className={`fas fa-chevron-down absolute right-3 text-[10px] text-gray-400 transition-transform ${showProvinceDropdown ? 'rotate-180 text-[#4c42bd]' : ''}`}></i>
                  </div>

                  {showProvinceDropdown && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                        {provinces.map(prov => (
                          <div
                            key={prov}
                            onClick={() => { setProvinceFilter(prov); setShowProvinceDropdown(false); }}
                            className={`px-4 py-2.5 text-sm font-semibold cursor-pointer transition-colors border-b last:border-none border-gray-50 ${provinceFilter === prov ? 'text-[#4c42bd] bg-indigo-50' : 'text-gray-600 hover:bg-gray-50'}`}
                          >
                            {prov}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* District Dropdown */}
                {provinceFilter !== 'Tất cả địa điểm' && locationsData[provinceFilter].length > 0 && (
                  <div className="flex-1 md:w-64 relative shrink-0" ref={districtRef}>
                    <div
                      className="w-full pl-9 pr-8 py-2 bg-[#eef3f8] border border-transparent rounded-md text-sm transition-all outline-none h-10 flex items-center cursor-pointer group"
                      onClick={() => setShowDistrictDropdown(!showDistrictDropdown)}
                    >
                      <i className="fas fa-map-pin absolute left-3 text-gray-500 group-hover:text-[#4c42bd]"></i>
                      <span className="truncate flex-grow">{districtFilter || 'Tất cả quận/huyện'}</span>
                      <i className={`fas fa-chevron-down absolute right-3 text-[10px] text-gray-400 transition-transform ${showDistrictDropdown ? 'rotate-180 text-[#4c42bd]' : ''}`}></i>
                    </div>

                    {showDistrictDropdown && (
                      <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
                          <div
                            onClick={() => { setDistrictFilter(''); setShowDistrictDropdown(false); setCurrentPage(1); }}
                            className={`px-4 py-2.5 text-sm font-semibold cursor-pointer transition-colors border-b border-gray-50 ${districtFilter === '' ? 'text-[#4c42bd] bg-indigo-50' : 'text-gray-600 hover:bg-gray-50'}`}
                          >
                            Tất cả quận/huyện
                          </div>
                          {locationsData[provinceFilter].map(dist => (
                            <div
                              key={dist}
                              onClick={() => { setDistrictFilter(dist); setShowDistrictDropdown(false); setCurrentPage(1); }}
                              className={`px-4 py-2.5 text-sm font-semibold cursor-pointer transition-colors border-b last:border-none border-gray-50 ${districtFilter === dist ? 'text-[#4c42bd] bg-indigo-50' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                              {dist}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1128px] mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

          {/* 2. Left Sidebar (Filters) */}
          {/* 2. Left Sidebar (Filters) */}
          <aside className="md:col-span-1 space-y-4">

            {/* Mobile Filter Toggle */}
            <div className="md:hidden mb-4">
              <button
                className="w-full bg-white border border-gray-300 py-3 px-4 rounded-lg font-bold text-gray-700 shadow-sm flex items-center justify-between"
                onClick={() => document.getElementById('mobile-filter-menu')?.classList.toggle('hidden')}
              >
                <div className="flex items-center gap-2">
                  <i className="fas fa-filter text-[#4c42bd]"></i>
                  <span>Bộ lọc tìm kiếm</span>
                </div>
                <i className="fas fa-chevron-down"></i>
              </button>
            </div>

            <div id="mobile-filter-menu" className="hidden md:block bg-white rounded-lg border border-gray-300 shadow-sm p-4 sticky top-36">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-gray-900">Bộ lọc</h3>
                {(searchTerm || provinceFilter !== 'Tất cả địa điểm' || districtFilter !== '' || typeFilters.length > 0 || minRatingFilter > 0 || minSalaryFilter > 0 || maxSalaryFilter < 100) && (
                  <button
                    onClick={() => { setSearchTerm(''); setProvinceFilter('Tất cả địa điểm'); setDistrictFilter(''); setTypeFilters([]); setMinRatingFilter(0); setMinSalaryFilter(0); setMaxSalaryFilter(100); setCurrentPage(1); }}
                    className="text-xs font-bold text-gray-500 hover:text-gray-900"
                  >
                    Xóa tất cả
                  </button>
                )}
              </div>

              {/* Job Type Filter */}
              <div className="mb-5">
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Loại công việc</h4>
                <div className="space-y-2">
                  {([JobType.FULL_TIME, JobType.PART_TIME, JobType.CONTRACT, JobType.FREELANCE, JobType.INTERNSHIP] as JobType[]).map(type => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-[#4c42bd] border-gray-300 rounded focus:ring-[#4c42bd]"
                        checked={typeFilters.includes(type)}
                        onChange={() => handleTypeFilterChange(type)}
                      />
                      <span className="text-sm text-gray-600 group-hover:text-gray-900">{formatJobType(type)}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div className="mb-5">
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Độ uy tín (Min)</h4>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  className="w-full accent-[#4c42bd] cursor-pointer"
                  value={minRatingFilter}
                  onChange={(e) => { setMinRatingFilter(parseFloat(e.target.value)); setCurrentPage(1); }}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0</span>
                  <span>5.0</span>
                </div>
              </div>

              {/* Salary Filter (Thêm đa dạng: min-max) */}
              <div className="mb-5">
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Mức lương (triệu)</h4>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Tối thiểu"
                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-[#4c42bd] focus:border-[#4c42bd]"
                    value={minSalaryFilter || ''}
                    onChange={(e) => { setMinSalaryFilter(parseInt(e.target.value) || 0); setCurrentPage(1); }}
                  />
                  <input
                    type="number"
                    placeholder="Tối đa"
                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-[#4c42bd] focus:border-[#4c42bd]"
                    value={maxSalaryFilter < 100 ? maxSalaryFilter : ''}
                    onChange={(e) => { setMaxSalaryFilter(parseInt(e.target.value) || 100); setCurrentPage(1); }}
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* 3. Main Content (Job List) */}
          <div className="md:col-span-3">
            {/* List Header */}
            <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-3 mb-4 flex justify-between items-center">
              <h2 className="text-sm text-gray-600">
                Hiển thị <span className="font-bold text-gray-900">{filteredJobs.length}</span> việc làm phù hợp
              </h2>
              <div className="flex items-center gap-2 relative group" ref={sortRef}>
                <span className="text-xs text-gray-500">Sắp xếp theo:</span>
                <div
                  className="flex items-center gap-1 cursor-pointer hover:text-[#4c42bd] transition-colors group"
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                >
                  <span className="text-xs font-bold text-gray-900">
                    {sortBy === 'newest' ? 'Mới nhất' : sortBy === 'relevant' ? 'Liên quan nhất' : sortBy === 'salaryHigh' ? 'Lương cao đến thấp' : 'Lương thấp đến cao'}
                  </span>
                  <i className={`fas fa-chevron-down text-[8px] text-gray-400 transition-transform ${showSortDropdown ? 'rotate-180 text-[#4c42bd]' : ''}`}></i>
                </div>

                {/* Custom Sort Dropdown Tooltip */}
                {showSortDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-2 border-b border-gray-50 bg-gray-50/50">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest px-2">Sắp xếp</p>
                    </div>
                    <div className="py-1">
                      {[
                        { val: 'newest', label: 'Mới nhất' },
                        { val: 'relevant', label: 'Liên quan nhất' },
                        { val: 'salaryHigh', label: 'Lương cao đến thấp' },
                        { val: 'salaryLow', label: 'Lương thấp đến cao' }
                      ].map((item) => (
                        <div
                          key={item.val}
                          onClick={() => { setSortBy(item.val as any); setShowSortDropdown(false); setCurrentPage(1); }}
                          className={`px-4 py-2 text-xs font-bold cursor-pointer transition-colors ${sortBy === item.val ? 'text-[#4c42bd] bg-indigo-50' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                          {item.label}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Error & Loading */}
            {error && <div className="text-red-600 text-center py-4 bg-red-50 rounded-lg border border-red-100">{error}</div>}

            {loading && (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white p-4 rounded-lg border border-gray-300 shadow-sm animate-pulse h-32"></div>
                ))}
              </div>
            )}

            {/* Job Cards List */}
            {!loading && !error && (
              <div className="space-y-3">
                {filteredJobs.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg border border-gray-300 border-dashed">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <i className="fas fa-search text-gray-400 text-2xl"></i>
                    </div>
                    <h3 className="text-gray-900 font-bold mb-1">Không tìm thấy công việc nào</h3>
                    <p className="text-gray-500 text-sm">Hãy thử thay đổi từ khóa hoặc bộ lọc của bạn.</p>
                    <button
                      onClick={() => { setSearchTerm(''); setProvinceFilter('Tất cả địa điểm'); setDistrictFilter(''); setTypeFilters([]); setMinRatingFilter(0); setMinSalaryFilter(0); setMaxSalaryFilter(100); setCurrentPage(1); }}
                      className="mt-3 px-4 py-1.5 border border-gray-300 rounded-full text-sm font-bold text-gray-600 hover:bg-gray-100"
                    >
                      Xóa bộ lọc
                    </button>
                  </div>
                ) : (
                  paginatedJobs.map(job => {
                    const session = appliedWorkSessions[job.id];
                    const isApplied = !!session;
                    const reqList = job.requirements ? job.requirements.split(',').map(r => r.trim()) : [];
                    const isSaved = isJobSaved(job.id);

                    return (
                      <div key={job.id} className="bg-white p-4 rounded-lg border border-gray-300 hover:shadow-md transition-shadow relative group flex gap-4">

                        {/* Logo */}
                        <div className="w-14 h-14 bg-white border border-gray-100 rounded flex-shrink-0 p-1 flex items-center justify-center">
                          <img
                            onClick={() => openBusinessProfile(job.businessId)}
                            src={job.businessAvatar}
                            className="w-12 h-12 rounded cursor-pointer hover:opacity-80"
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-grow min-w-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3
                                className="text-base font-bold text-[#4c42bd] hover:underline cursor-pointer leading-tight mb-0.5 line-clamp-1"
                                onClick={() => handleViewJobDetail(job)}
                              >
                                {job.title}
                              </h3>
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-xs text-gray-900 hover:underline cursor-pointer font-medium truncate max-w-[200px]">{job.businessName}</p>
                                {job.businessNumericId && (
                                  <p className="text-[10px] text-[#4c42bd] font-bold">ID: {job.businessNumericId}</p>
                                )}
                                {(job.businessRating !== undefined) && (
                                  <div className="flex items-center gap-1" title="Điểm uy tín Nhà tuyển dụng">
                                    {job.businessRating > 0 && job.businessRating <= 5 ? (
                                      <>
                                        <span className="text-[10px] font-bold text-amber-600">{job.businessRating.toFixed(1)}</span>
                                        <i className="fas fa-star text-[8px] text-amber-500"></i>
                                      </>
                                    ) : (
                                      <span className="text-[10px] text-gray-400 italic">Chưa có đánh giá</span>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                                <span>{job.location}</span>
                                <span className="mx-1">•</span>
                                <span className="text-green-700 font-bold bg-green-50 px-1.5 py-0.5 rounded border border-green-100">{job.salary}</span>
                                <span className="mx-1">•</span>
                                <span className="text-gray-400">{formatTimeAgo(job.postedAt)}</span>
                              </div>
                            </div>

                            {/* Match Percentage & Required Rating Badge */}
                            <div className="flex flex-col items-end gap-2">
                              {/* Match Percentage Badge - Only for Workers */}
                              {user && user.role !== 'BUSINESS' && (
                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-indigo-50 border border-indigo-100 shadow-sm transition-all hover:scale-105 group/match" title="Độ phù hợp dựa trên hồ sơ của bạn">
                                  <div className="flex flex-col items-end">
                                    <span className="text-[9px] font-bold text-gray-400 uppercase leading-none mb-0.5">Phù hợp</span>
                                    <span className={`text-sm font-black leading-none ${calculateJobMatchPercentage(job, user) >= 80 ? 'text-green-600' : calculateJobMatchPercentage(job, user) >= 50 ? 'text-indigo-600' : 'text-gray-500'}`}>
                                      {calculateJobMatchPercentage(job, user)}%
                                    </span>
                                  </div>
                                  <div className="w-8 h-8 rounded-full border-2 border-slate-100 flex items-center justify-center relative overflow-hidden bg-white">
                                    <div
                                      className={`absolute bottom-0 left-0 w-full transition-all duration-1000 ${calculateJobMatchPercentage(job, user) >= 80 ? 'bg-green-500' : 'bg-indigo-500'}`}
                                      style={{ height: `${calculateJobMatchPercentage(job, user)}%` }}
                                    ></div>
                                    <i className={`fas fa-bolt text-[10px] relative z-10 ${calculateJobMatchPercentage(job, user) >= 50 ? 'text-white' : 'text-slate-300'}`}></i>
                                  </div>
                                </div>
                              )}

                              <div className="flex items-center gap-1 text-xs bg-amber-50 text-amber-600 px-2 py-1 rounded border border-amber-100 shadow-sm" title="Yêu cầu điểm uy tín tối thiểu">
                                <span className="text-[10px] font-medium text-gray-500 uppercase">Sao yêu cầu:</span>
                                <span className="font-bold">{job.minRating || 0}</span>
                                <i className="fas fa-star text-[10px]"></i>
                              </div>
                            </div>
                          </div>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {reqList.slice(0, 3).map((tag, idx) => (
                              <span key={idx} className="bg-gray-100 text-gray-600 text-[10px] font-semibold px-2 py-1 rounded-sm">
                                {tag}
                              </span>
                            ))}
                            {reqList.length > 3 && <span className="text-[10px] text-gray-400 self-center">+{reqList.length - 3}</span>}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-3">
                            {isApplied ? (
                              session.status === 'REJECTED' ? (
                                <>
                                  <span className="text-red-600 text-xs font-bold flex items-center gap-1">
                                    <i className="fas fa-times-circle"></i> Hồ sơ bị từ chối
                                  </span>
                                  <button onClick={() => handleViewRejectReason(session.comment)} className="text-xs text-gray-500 hover:text-gray-900 underline">
                                    Xem lý do
                                  </button>
                                </>
                              ) : (
                                session.status === 'PENDING' ? (
                                  <span className="text-blue-600 text-xs font-bold flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                                    <i className="fas fa-paper-plane"></i> Đã nộp hồ sơ
                                  </span>
                                ) : (
                                  <span className="text-green-700 text-xs font-bold flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                                    <i className="fas fa-check-circle"></i> Đã được duyệt
                                  </span>
                                )
                              )
                            ) : (
                              <button
                                onClick={() => handleApplyClick(job)}
                                className="bg-[#4c42bd] hover:bg-[#3a32a0] text-white text-xs font-semibold px-3 py-1 rounded-full transition-colors flex items-center gap-1 shadow-sm whitespace-nowrap"
                              >
                                <span>Ứng tuyển</span>
                                <i className="fas fa-external-link-alt text-[8px]"></i>
                              </button>
                            )}
                            {user && (
                              <button
                                onClick={() => handleSaveJobAction(job.id)}
                                className="text-gray-500 hover:bg-gray-100 px-3 py-1 rounded-full text-xs font-semibold transition-colors flex items-center gap-1"
                              >
                                <i className={`${isSaved ? 'fas' : 'far'} fa-bookmark text-xs ${isSaved ? 'text-indigo-600' : ''}`}></i> {isSaved ? 'Đã lưu' : 'Lưu'}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Closed Overlay */}
                        {job.status !== 'OPEN' && (
                          <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-[1px] rounded-lg z-10 cursor-not-allowed">
                            <span className="bg-gray-800 text-white px-4 py-2 rounded-lg font-bold shadow-lg flex items-center gap-2">
                              <i className="fas fa-lock"></i> Đã đóng đơn
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Pagination */}
            {!loading && filteredJobs.length > 0 && (
              <div className="mt-6 flex justify-center pb-8">
                <button
                  onClick={() => handlePageChange('prev')}
                  disabled={currentPage === 1}
                  className="px-4 py-1.5 border border-gray-300 bg-white rounded-l-md hover:bg-gray-100 text-gray-600 font-bold text-sm disabled:opacity-50">Trước</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-1.5 border-t border-b border-gray-300 bg-white hover:bg-gray-100 font-bold text-sm ${currentPage === page ? 'text-gray-900' : 'text-gray-600'}`}>
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange('next')}
                  disabled={currentPage === totalPages}
                  className="px-4 py-1.5 border border-gray-300 bg-white rounded-r-md hover:bg-gray-100 text-gray-600 font-bold text-sm disabled:opacity-50">Sau</button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Job Detail Modal */}
      {showDetailModal && selectedJob && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4 transition-opacity" onClick={() => setShowDetailModal(false)}>
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-start justify-between z-10">
              <div className="flex gap-4 flex-1">
                <div className="w-16 h-16 bg-white border border-gray-100 rounded flex-shrink-0 p-1 flex items-center justify-center">
                  <img
                    src={selectedJob.businessAvatar}
                    alt={selectedJob.businessName}
                    className="w-14 h-14 rounded"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-gray-900 mb-1">{selectedJob.title}</h2>
                  <p className="text-sm text-gray-600 font-medium">{selectedJob.businessName}</p>
                  {selectedJob.businessNumericId && (
                    <p className="text-[10px] text-[#4c42bd] font-bold mb-2">ID: {selectedJob.businessNumericId}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <i className="fas fa-map-marker-alt"></i>
                      {selectedJob.location}
                    </span>
                    <span className="flex items-center gap-1 text-green-700 font-bold bg-green-50 px-2 py-1 rounded border border-green-100">
                      <i className="fas fa-money-bill-wave"></i>
                      {selectedJob.salary}
                    </span>
                    <span className="flex items-center gap-1">
                      <i className="fas fa-briefcase"></i>
                      {formatJobType(selectedJob.type)}
                    </span>
                    <span className="flex items-center gap-1">
                      <i className="fas fa-clock"></i>
                      {formatTimeAgo(selectedJob.postedAt)}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="ml-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Company Rating & Min Rating */}
              <div className="flex gap-4">
                {selectedJob.businessRating !== undefined && (
                  <div className="flex-1 bg-amber-50 border border-amber-100 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <i className="fas fa-building text-amber-600"></i>
                      <h4 className="text-xs font-bold text-gray-500 uppercase">Độ uy tín công ty</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedJob.businessRating > 0 && selectedJob.businessRating <= 5 ? (
                        <>
                          <span className="text-2xl font-bold text-amber-600">{selectedJob.businessRating.toFixed(1)}</span>
                          <i className="fas fa-star text-amber-500"></i>
                        </>
                      ) : (
                        <span className="text-sm text-gray-400 italic">Chưa có đánh giá</span>
                      )}
                    </div>
                  </div>
                )}
                <div className="flex-1 bg-indigo-50 border border-indigo-100 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <i className="fas fa-star text-indigo-600"></i>
                    <h4 className="text-xs font-bold text-gray-500 uppercase">Yêu cầu sao tối thiểu</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-indigo-600">{selectedJob.minRating || 0}</span>
                    <i className="fas fa-star text-amber-500"></i>
                  </div>
                </div>
              </div>

              {/* Job Description */}
              <div className="space-y-2">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <i className="fas fa-file-alt text-[#4c42bd]"></i>
                  Mô tả công việc
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {selectedJob.description || 'Không có mô tả'}
                  </p>
                </div>
              </div>

              {/* Requirements */}
              <div className="space-y-2">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <i className="fas fa-list-check text-[#4c42bd]"></i>
                  Yêu cầu ứng viên
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {selectedJob.requirements || 'Không có yêu cầu cụ thể'}
                  </p>
                </div>
              </div>

              {/* Skills/Tags */}
              {selectedJob.requirements && (
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <i className="fas fa-tags text-[#4c42bd]"></i>
                    Kỹ năng yêu cầu
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.requirements.split(',').map((tag, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-3">
              {(() => {
                const session = appliedWorkSessions[selectedJob.id];
                const isApplied = !!session;

                if (isApplied) {
                  if (session.status === 'REJECTED') {
                    return (
                      <>
                        <span className="flex items-center gap-2 text-red-600 text-sm font-bold">
                          <i className="fas fa-times-circle"></i> Hồ sơ bị từ chối
                        </span>
                        <button onClick={() => handleViewRejectReason(session.comment)} className="text-sm text-gray-500 hover:text-gray-900 underline">
                          Xem lý do
                        </button>
                      </>
                    );
                  } else if (session.status === 'PENDING') {
                    return (
                      <span className="flex items-center gap-2 text-blue-600 text-sm font-bold bg-blue-50 px-4 py-2 rounded-full border border-blue-200">
                        <i className="fas fa-paper-plane"></i> Đã nộp hồ sơ
                      </span>
                    );
                  } else {
                    return (
                      <span className="flex items-center gap-2 text-green-700 text-sm font-bold bg-green-50 px-4 py-2 rounded-full border border-green-200">
                        <i className="fas fa-check-circle"></i> Đã được duyệt
                      </span>
                    );
                  }
                }

                return (
                  <>
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        handleApplyClick(selectedJob);
                      }}
                      className="flex-1 bg-[#4c42bd] hover:bg-[#3a32a0] text-white font-bold py-3 px-6 rounded-full transition-colors shadow-md flex items-center justify-center gap-2"
                    >
                      <i className="fas fa-paper-plane"></i>
                      Ứng tuyển ngay
                    </button>
                    {user && (
                      <button
                        onClick={() => handleSaveJobAction(selectedJob.id)}
                        className="px-6 py-3 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors flex items-center gap-2"
                      >
                        <i className={`${isJobSaved(selectedJob.id) ? 'fas' : 'far'} fa-bookmark ${isJobSaved(selectedJob.id) ? 'text-indigo-600' : 'text-gray-600'}`}></i>
                        <span className="font-bold text-gray-700">{isJobSaved(selectedJob.id) ? 'Đã lưu' : 'Lưu'}</span>
                      </button>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Jobs;
