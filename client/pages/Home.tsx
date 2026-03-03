import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Swal from 'sweetalert2';
import { getUserIdByName, mockWorkerSuggestions, mockCompanySuggestions, mockWorkerAds, mockHomeSlides } from '../mockData';
import bannerApi, { Banner } from '../apis/api_banner';
import jobApi, { JobResponse } from '../apis/api_job';
import businessApi, { BusinessDTO } from '../apis/api_business';
import { UserRole } from '../types';
import SidebarProfile from '../components/SidebarProfile';
import { FollowedCompaniesContext } from './Companies';
import { useContext } from 'react';
import { useSaved } from '../contexts/SavedContext';
import workerAdApi, { WorkerAd } from '../apis/api_worker_ad';
import proposalApi from '../apis/api_proposal';
import { rankHomeFeed, rankJobListings, calculateWorkerScore, calculateJobMatchPercentage } from '../utils/ranking';
import UserSuggestions from '../components/UserSuggestions';
import SocialFeed from '../components/SocialFeed';




export const formatTimeAgo = (dateString: string) => {

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

const formatJobType = (type: string) => {
  const map: Record<string, string> = {
    FULL_TIME: 'Toàn thời gian',
    PART_TIME: 'Bán thời gian',
    CONTRACT: 'Hợp đồng',
    INTERNSHIP: 'Thực tập',
    FREELANCE: 'Freelance'
  };
  return map[type] || type;
};

const Home: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [slides, setSlides] = useState<Banner[]>([]);
  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [workerAds, setWorkerAds] = useState<any[]>([]);
  const [businesses, setBusinesses] = useState<BusinessDTO[]>([]);
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  const [sentProposalAdIds, setSentProposalAdIds] = useState<string[]>([]);
  const [jobsCountMap, setJobsCountMap] = useState<Record<string, number>>({});

  const [currentSlide, setCurrentSlide] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('Tất cả địa điểm');
  const [searchType, setSearchType] = useState<'jobs' | 'companies' | 'workers'>('jobs');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const typeDropdownRef = React.useRef<HTMLDivElement>(null);
  const locationDropdownRef = React.useRef<HTMLDivElement>(null);

  const locations = ['Tất cả địa điểm', 'Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Remote'];

  const isWorker = user && user.role !== UserRole.BUSINESS;
  const isBusiness = user && user.role === UserRole.BUSINESS;

  // Set default search type based on role
  useEffect(() => {
    if (isBusiness) {
      setSearchType('workers');
    } else {
      setSearchType('jobs');
    }
  }, [isBusiness]);

  // Context cho theo dõi Nhà tuyển dụng
  const { followedIds, followCompany, unfollowCompany } = useContext(FollowedCompaniesContext);
  const { isWorkerSaved, saveWorker, unsaveWorker } = useSaved();

  // Trạng thái theo dõi gợi ý kết nối dùng chung Context
  // const { followedIds, followCompany, unfollowCompany } = useContext(FollowedCompaniesContext); // This line is already there, no need to duplicate.

  // Fetch original data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingContent(true);
        // Gọi đồng thời các API để tối ưu tốc độ
        const [bannerData, jobRes, businessData, workerAdData] = await Promise.all([
          bannerApi.getByMenu('homepage'),
          jobApi.getAll(),
          businessApi.getAll(),
          workerAdApi.getAll()
        ]);

        if (bannerData && bannerData.length > 0) {
          setSlides(bannerData);
        } else {
          // Fallback to mock data if API returns no banners
          setSlides(mockHomeSlides.map((s, i) => ({
            id: `mock-${i}`,
            title: s.title,
            subtitle: s.subtitle,
            imageUrl: s.image,
            link: s.link,
            menu: 'homepage',
            active: true,
            displayOrder: i
          })));
        }

        // --- APPLY RANKING ALGORITHM ---
        if (jobRes.success === 200 && Array.isArray(jobRes.data)) {
          // Identify premium businesses (mocking some for demo)
          const premiumBusinessIds = businessData
            .filter(b => b.verifyStatus === 'VERIFIED' && (b.numericId || 0) % 3 === 0)
            .map(b => b.id);

          // Jobs page style ranking for Home feed when viewing as Worker
          const rankedJobs = rankJobListings(
            jobRes.data,
            user,
            (id) => premiumBusinessIds.includes(id) || (user?.id === id && user?.isPremium === true)
          );
          setJobs(rankedJobs);
        }

        if (Array.isArray(workerAdData)) {
          // Identify premium workers (mocking some for demo)
          const premiumWorkerIds = workerAdData
            .filter((_, idx) => idx % 5 === 0)
            .map(ad => ad.workerId);

          const rankedWorkerAds = rankHomeFeed(
            workerAdData,
            user?.id,
            followedIds,
            (id) => premiumWorkerIds.includes(id) || (user?.id === id && user?.isPremium === true),
            { viewerIndustry: user?.industry || user?.description }
          );
          setWorkerAds(rankedWorkerAds);
        }

        setBusinesses(businessData);

        // Calculate jobs count for each business (only OPEN jobs)
        const jobCounts: Record<string, number> = {};
        if (jobRes.success === 200 && Array.isArray(jobRes.data)) {
          jobRes.data.forEach((job: JobResponse) => {
            if (job.status === 'OPEN') {
              jobCounts[job.businessId] = (jobCounts[job.businessId] || 0) + 1;
            }
          });
        }
        setJobsCountMap(jobCounts);
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setIsLoadingContent(false);
      }
    };
    fetchData();
  }, [user?.role]);

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides]);

  // Fetch sent proposals for business


  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node)) {
        setShowTypeDropdown(false);
      }
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target as Node)) {
        setShowLocationDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update suggestions based on searchTerm and searchType
  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const term = searchTerm.toLowerCase();
    let results: any[] = [];

    if (searchType === 'jobs') {
      results = jobs
        .filter(j => j.title.toLowerCase().includes(term) || j.businessName?.toLowerCase().includes(term) || j.businessNumericId?.toString().includes(term))
        .slice(0, 5)
        .map(j => ({ id: j.id, text: j.title, sub: `@${j.businessNumericId} • ${j.businessName}`, type: 'job', icon: 'fa-briefcase' }));
    } else if (searchType === 'companies') {
      results = businesses
        .filter(c => c.name.toLowerCase().includes(term) || c.industry?.toLowerCase().includes(term) || c.numericId?.toString().includes(term))
        .slice(0, 5)
        .map(c => ({ id: c.id, text: c.name, sub: `@${c.numericId} • ${c.industry}`, type: 'company', icon: 'fa-building' }));
    } else if (searchType === 'workers') {
      results = businesses
        .filter(u => (u.role === UserRole.WORKER) && (u.name.toLowerCase().includes(term) || u.title?.toLowerCase().includes(term) || u.numericId?.toString().includes(term)))
        .slice(0, 5)
        .map(u => ({ id: u.id, text: u.name, sub: `@${u.numericId} • ${u.title}`, type: 'worker', icon: 'fa-user-tie' }));
    }

    setSuggestions(results);
  }, [searchTerm, searchType]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % (slides.length || 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + (slides.length || 1)) % (slides.length || 1));

  // --- Chức năng Tìm kiếm ---
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Chú ý',
        text: 'Vui lòng nhập từ khóa tìm kiếm',
        timer: 2000
      });
      return;
    }

    if (searchType === 'workers') {
      const term = searchTerm.toLowerCase().replace('id: ', '').trim();

      // 1. Search in worker ads
      const adMatch = workerAds.find(ad =>
        ad.workerName?.toLowerCase().includes(term) ||
        ad.title?.toLowerCase().includes(term) ||
        ad.workerNumericId?.toString() === term
      );

      if (adMatch) {
        navigate(`/fast-processing/${adMatch.workerId}`);
        setShowSuggestions(false);
        return;
      }

      // 2. Search in businesses (if they are workers)
      const directMatch = businesses.find((u: any) =>
        (u.role === UserRole.WORKER || u.industry === 'Freelancer') &&
        (u.name.toLowerCase().includes(term) || u.numericId?.toString() === term)
      );

      if (directMatch) {
        navigate(`/fast-processing/${directMatch.id}`);
        setShowSuggestions(false);
        return;
      }

      // 3. If still no match, but it's a numeric ID, we can try to find it in suggestions again
      const numericMatch = suggestions.find(s => s.type === 'worker' && s.sub.includes(`@${term}`));
      if (numericMatch) {
        navigate(`/fast-processing/${numericMatch.id}`);
        setShowSuggestions(false);
        return;
      }

      // If no match at all, provide real feedback
      if (isBusiness) {
        navigate('/candidates');
      } else {
        Swal.fire({
          icon: 'info',
          title: 'Kết quả tìm kiếm',
          text: `Không tìm thấy ứng viên "${searchTerm}" trong danh sách mạng lưới hiện tại.`,
          confirmButtonColor: '#4c42bd'
        });
      }
      return;
    } else if (searchType === 'companies') {
      navigate('/companies', { state: { searchTerm } });
    } else {
      // Mặc định là tìm việc làm
      navigate('/jobs', { state: { searchTerm, location } });
    }
    setShowSuggestions(false);
  };

  const handleSelectSuggestion = (s: any) => {
    setSearchTerm(s.text);
    setShowSuggestions(false);
    if (s.type === 'job') {
      navigate('/jobs', { state: { searchTerm: s.text } });
    } else if (s.type === 'company') {
      navigate(`/fast-processing/${s.id}`);
    } else if (s.type === 'worker') {
      navigate(`/fast-processing/${s.id}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // --- Chức năng Click Category ---
  const handleCategoryClick = (category: string) => {
    navigate('/jobs', { state: { searchTerm: category, location: 'Tất cả địa điểm' } });
  };

  // --- Chức năng Click Job Card ---
  const handleJobClick = (jobTitle: string) => {
    navigate('/jobs', { state: { searchTerm: jobTitle, location: 'Tất cả địa điểm' } });
  };

  // --- Chức năng Click Company (Link to Profile) ---
  const handleCompanyClick = (companyId: number | string) => {
    navigate(`/fast-processing/${companyId}`);
  };

  // Helper để parse min salary từ string (ví dụ: '15-25 triệu' -> 15)
  const parseMinSalary = (salary: string): number => {
    const match = salary.match(/^(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  };

  // 1. Việc làm phù hợp nhất (Match >= 80% hoặc top match)
  // 1. Việc làm phù hợp nhất (Sắp xếp theo % phù hợp cao nhất)
  const highMatchJobs = user ? jobs
    .map(j => ({ ...j, match: calculateJobMatchPercentage(j, user) }))
    // Sort strictly by match percentage descending
    .sort((a, b) => b.match - a.match)
    .slice(0, 4) : [];

  // 2. Việc làm lương cao nhất
  const highSalaryJobs = [...jobs]
    .sort((a, b) => parseMinSalary(b.salary) - parseMinSalary(a.salary))
    .slice(0, 4);

  // 3. Công ty 5 sao (Rating >= 4.5)
  const topRatedCompanies = businesses
    .filter(b => b.rating >= 4.5)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4);

  // 4. Công ty tiềm năng (Premium/Verified + Có tương tác tốt) - Exclude top rated to avoid duplication
  const potentialCompanies = businesses
    .filter(b => (b.verifyStatus === 'VERIFIED' || b.rating > 4.0) && !topRatedCompanies.some(t => t.id === b.id))
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 4);

  // Chọn top companies (ví dụ: top 8 công ty đầu tiên để đều lưới 4 cột)
  const topCompanies = businesses.slice(0, 8);

  // Chọn top jobs (ví dụ: top 6 jobs sau khi đã rank)
  const topJobs = jobs.slice(0, 6);


  const renderStars = (rating: number) => {
    // Guard against invalid ratings
    const validRating = Math.max(0, Math.min(5, isNaN(rating) ? 0 : rating));
    const full = Math.floor(validRating);
    const half = (validRating % 1) >= 0.5 ? 1 : 0;
    const empty = Math.max(0, 5 - full - half);

    return (
      <div className="flex text-amber-500 text-xs gap-0.5">
        {[...Array(full)].map((_, i) => <i key={`full-${i}`} className="fas fa-star"></i>)}
        {half === 1 && <i className="fas fa-star-half-alt"></i>}
        {[...Array(empty)].map((_, i) => <i key={`empty-${i}`} className="far fa-star"></i>)}
      </div>
    );
  };

  return (
    <div className="bg-[#F3F2EF] min-h-screen font-sans -mt-3 flex flex-col">

      {/* === Banner Slider Section === */}
      <section className="relative w-full h-[300px] md:h-[350px] overflow-hidden bg-gray-900 group">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
          >
            <img
              src={slide.imageUrl}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            {/* Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.color} to-transparent flex items-center`}>
              <div className="max-w-[1128px] mx-auto px-4 w-full">
                <div className="max-w-xl text-white pl-4 md:pl-0">
                  <h2 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight leading-tight animate-in slide-in-from-bottom-4 duration-700">
                    {slide.title}
                  </h2>
                  <p className="text-base md:text-lg font-light mb-6 text-gray-100 animate-in slide-in-from-bottom-3 duration-700 delay-100">
                    {slide.subtitle}
                  </p>
                  {/* <button
                    onClick={() => navigate(slide.link)}
                    className="bg-[#4c42be] hover:bg-[#5328fe] text-white font-bold px-8 py-3 rounded-full transition-all shadow-lg hover:shadow-xl text-sm animate-in slide-in-from-bottom-2 duration-700 delay-200"
                  >
                    {slide.buttonText}
                  </button> */}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Slider Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-all z-10 backdrop-blur-sm opacity-0 group-hover:opacity-100"
        >
          <i className="fas fa-chevron-left"></i>
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-all z-10 backdrop-blur-sm opacity-0 group-hover:opacity-100"
        >
          <i className="fas fa-chevron-right"></i>
        </button>

        {/* Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-1.5 rounded-full transition-all ${i === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
                }`}
            />
          ))}
        </div>
      </section>

      {/* === GLOBAL Search Header === */}
      <section className="relative z-[60] -mt-8 px-4 mb-8">
        <div className="max-w-[1100px] mx-auto">
          <div className="bg-white p-2 rounded-2xl md:rounded-full shadow-lg border border-gray-200 flex flex-col md:flex-row gap-3 md:items-center">

            {/* Search Type Selector - Custom Dropdown */}
            <div className="w-full md:w-[15%] flex items-center px-4 bg-[#f8faff] rounded-full md:bg-transparent md:border-r border-gray-100 h-10 md:mt-1 md:ml-2 relative" ref={typeDropdownRef}>
              <div
                className="flex items-center w-full cursor-pointer group"
                onClick={() => setShowTypeDropdown(!showTypeDropdown)}
              >
                <i className="fas fa-filter text-[#4c42bd] mr-2 text-[10px] group-hover:scale-110 transition-transform"></i>
                <span className="text-gray-900 font-bold text-xs flex-grow truncate select-none">
                  {searchType === 'jobs' ? 'Việc làm' : searchType === 'companies' ? (isBusiness ? 'Nhà tuyển dụng' : 'Công ty') : 'Ứng viên'}
                </span>
                <i className={`fas fa-chevron-down text-[8px] text-gray-400 ml-1 transition-transform duration-300 ${showTypeDropdown ? 'rotate-180 text-[#4c42bd]' : ''}`}></i>
              </div>

              {/* Custom Type Dropdown Tooltip */}
              {showTypeDropdown && (
                <div className="absolute top-full left-0 w-full md:w-[180px] bg-white mt-3 rounded-xl shadow-2xl border border-gray-100 z-[110] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-2 border-b border-gray-50 bg-gray-50/50">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest px-2">Loại tìm kiếm</p>
                  </div>
                  <div className="py-1">
                    {!isBusiness && (
                      <div
                        onClick={() => { setSearchType('jobs'); setShowTypeDropdown(false); }}
                        className={`px-4 py-2 text-xs font-bold cursor-pointer flex items-center gap-2 transition-colors ${searchType === 'jobs' ? 'text-[#4c42bd] bg-indigo-50' : 'text-gray-600 hover:bg-gray-50'}`}
                      >
                        <i className="fas fa-briefcase w-4 text-center text-[10px]"></i> Việc làm
                      </div>
                    )}
                    <div
                      onClick={() => { setSearchType('companies'); setShowTypeDropdown(false); }}
                      className={`px-4 py-2 text-xs font-bold cursor-pointer flex items-center gap-2 transition-colors ${searchType === 'companies' ? 'text-[#4c42bd] bg-indigo-50' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      <i className="fas fa-building w-4 text-center text-[10px]"></i> {isBusiness ? 'Nhà tuyển dụng' : 'Công ty'}
                    </div>
                    <div
                      onClick={() => { setSearchType('workers'); setShowTypeDropdown(false); }}
                      className={`px-4 py-2 text-xs font-bold cursor-pointer flex items-center gap-2 transition-colors ${searchType === 'workers' ? 'text-[#4c42bd] bg-indigo-50' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      <i className="fas fa-user-tie w-4 text-center text-[10px]"></i> Ứng viên
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input with Suggestions */}
            <div className="w-full md:w-auto flex-grow flex items-center px-4 bg-[#f8faff] rounded-full md:bg-transparent md:border-r border-gray-100 h-10 md:mt-1 relative group">
              <i className="fas fa-search text-gray-400 mr-3 text-sm group-focus-within:text-[#4c42bd] transition-colors"></i>
              <input
                type="text"
                placeholder={searchType === 'jobs' ? "Tìm việc làm, vị trí..." : searchType === 'companies' ? "Tìm tên công ty, tập đoàn..." : "Tìm tên ứng viên, kỹ năng..."}
                className="w-full bg-transparent focus:outline-none text-gray-900 font-semibold placeholder:text-gray-400 text-sm"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(true);
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => setShowSuggestions(true)}
              />

              {/* Suggestions Tooltip */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-2.5 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Gợi ý tốt nhất</p>
                    <button onClick={() => setShowSuggestions(false)} className="text-[10px] text-gray-400 hover:text-red-500 mr-2">Đóng</button>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                    {suggestions.map((s, i) => (
                      <div
                        key={i}
                        onClick={() => handleSelectSuggestion(s)}
                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center gap-3 transition-colors border-b last:border-none border-gray-50 group/item"
                      >
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover/item:bg-[#4c42bd] group-hover/item:text-white transition-all flex-shrink-0">
                          <i className={`fas ${s.icon} text-xs`}></i>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{s.text}</p>
                          <p className="text-[11px] text-gray-500 truncate">{s.sub}</p>
                        </div>
                        <i className="fas fa-arrow-right text-[10px] text-gray-300 ml-auto mr-1 group-hover/item:text-[#4c42bd] group-hover/item:translate-x-1 transition-all"></i>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 sm:p-3 bg-gray-50/80 text-center">
                    <button onClick={handleSearch} className="text-[11px] font-bold text-[#4c42bd] hover:underline flex items-center justify-center gap-2 mx-auto">
                      <i className="fas fa-search-plus"></i> Xem tất cả kết quả cho "{searchTerm}"
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Location Selector - Custom Dropdown */}
            <div className="w-full md:w-1/4 flex items-center px-4 bg-[#f8faff] rounded-full md:bg-transparent h-10 md:mt-1 relative" ref={locationDropdownRef}>
              <div
                className="flex items-center w-full cursor-pointer group"
                onClick={() => setShowLocationDropdown(!showLocationDropdown)}
              >
                <i className="fas fa-map-marker-alt text-gray-400 mr-2 text-sm group-hover:text-[#4c42bd] transition-colors"></i>
                <span className="text-gray-900 font-medium text-sm flex-grow truncate select-none">
                  {location}
                </span>
                <i className={`fas fa-chevron-down text-[8px] text-gray-400 ml-1 transition-transform duration-300 ${showLocationDropdown ? 'rotate-180 text-[#4c42bd]' : ''}`}></i>
              </div>

              {/* Custom Location Dropdown Tooltip */}
              {showLocationDropdown && (
                <div className="absolute top-full md:right-0 md:left-auto left-0 w-full sm:w-[200px] bg-white mt-3 rounded-xl shadow-2xl border border-gray-100 z-[110] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-2 border-b border-gray-50 bg-gray-50/50">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest px-2">Khu vực</p>
                  </div>
                  <div className="py-1">
                    {locations.map((loc) => (
                      <div
                        key={loc}
                        onClick={() => { setLocation(loc); setShowLocationDropdown(false); }}
                        className={`px-4 py-2 text-xs font-bold cursor-pointer flex items-center gap-2 transition-colors ${location === loc ? 'text-[#4c42bd] bg-indigo-50' : 'text-gray-600 hover:bg-gray-50'}`}
                      >
                        <i className={`fas ${loc === 'Remote' ? 'fa-laptop' : 'fa-location-dot'} w-4 text-center text-[10px] ${location === loc ? 'text-[#4c42bd]' : 'text-gray-300'}`}></i>
                        {loc}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSearch}
              className="bg-[#4c42be] hover:shadow-lg hover:shadow-indigo-200 md:mt-1.5 md:mb-1.5 md:mr-2 text-white font-black px-8 h-10 md:h-9 w-full md:w-auto rounded-full transition-all shadow-md active:scale-95 whitespace-nowrap text-[11px] uppercase tracking-wider"
            >
              <i className="fas fa-search mr-2"></i> Tìm ngay
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-[1128px] mx-auto px-4 space-y-6 flex-grow">


        {/* === Social Feed & Content === */}
        <section className="bg-transparent">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

            {/* LEFT SIDEBAR - Only show when logged in */}
            {user && (
              <div className="hidden lg:block lg:col-span-3">
                <SidebarProfile
                  user={user}
                  isWorker={isWorker}
                  repScore={user?.rating || 0}
                  recentActivities={jobs.slice(0, 3).map(j => `Xem ${j.title}`)}
                />
              </div>
            )}

            {/* CENTER FEED */}
            <div className={`space-y-6 ${user ? 'lg:col-span-6' : 'lg:col-span-12'}`}>
              {/* For Workers: Keep Recommendations at top */}
              {isWorker && (
                <>
                  <div className="grid grid-cols-1 gap-6">
                    {/* RECOMMENDED JOBS */}
                    <section className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                          <i className="fas fa-sparkles text-[#0a66c2]"></i> Công việc phù hợp (%)
                        </h2>
                        <Link to="/jobs" className="text-xs font-bold text-[#0a66c2] hover:underline">Xem thêm</Link>
                      </div>
                      <div className="p-2 space-y-1">
                        {highMatchJobs.length > 0 ? highMatchJobs.map(job => (
                          <div key={job.id} onClick={() => handleJobClick(job.title)} className="group flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-200 relative">
                            <div className="w-12 h-12 bg-white border border-gray-200 rounded flex items-center justify-center p-1 flex-shrink-0 group-hover:shadow-sm transition-all">
                              <img src={job.businessAvatar} className="max-w-full max-h-full object-contain" alt="logo" />
                            </div>
                            <div className="flex-grow min-w-0">
                              <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#0a66c2] group-hover:underline transition-all line-clamp-1 pr-16">{job.title}</h3>
                              <p className="text-xs text-gray-600 truncate mb-1">{job.businessName}</p>
                              <p className="text-[10px] text-gray-500">{job.location}</p>
                            </div>
                            <div className="flex-shrink-0 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-indigo-50 border border-indigo-100 shadow-sm group/match ml-auto">
                              <div className="flex flex-col items-end">
                                <span className="text-[9px] font-bold text-gray-400 uppercase leading-none mb-0.5">Phù hợp</span>
                                <span className={`text-sm font-black leading-none ${(job as any).match >= 80 ? 'text-green-600' : (job as any).match >= 50 ? 'text-indigo-600' : 'text-gray-500'}`}>
                                  {(job as any).match}%
                                </span>
                              </div>
                              <div className="w-8 h-8 rounded-full border-2 border-slate-100 flex items-center justify-center relative overflow-hidden bg-white">
                                <div className={`absolute bottom-0 left-0 w-full transition-all duration-1000 ${(job as any).match >= 80 ? 'bg-green-500' : 'bg-indigo-500'}`} style={{ height: `${(job as any).match}%` }}></div>
                                <i className={`fas fa-bolt text-[10px] relative z-10 ${(job as any).match >= 50 ? 'text-white' : 'text-slate-300'}`}></i>
                              </div>
                            </div>
                          </div>
                        )) : (
                          <div className="text-center py-10 text-gray-400 text-xs italic bg-gray-50/50 rounded-lg m-2">Cập nhật hồ sơ để nhận gợi ý tốt nhất</div>
                        )}
                      </div>
                    </section>
                  </div>
                </>
              )}

              {/* SOCIAL FEED - Only show when logged in */}
              {user && <SocialFeed />}

            </div>

            {/* RIGHT SIDEBAR - Only show when logged in */}
            {user && (
              <div className="hidden lg:block lg:col-span-3">
                {isWorker && (
                  <div className="mb-4">
                    {/* High Salary Widget */}
                    <section className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                      <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-xs font-bold text-gray-900 flex items-center gap-2">
                          <i className="fas fa-money-bill-wave text-green-600"></i> Lương cao
                        </h2>
                      </div>
                      <div className="p-2 space-y-2">
                        {highSalaryJobs.slice(0, 3).map(job => (
                          <div key={job.id} onClick={() => handleJobClick(job.title)} className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer group">
                            <img src={job.businessAvatar} className="w-8 h-8 object-contain border border-gray-200 rounded" alt="logo" />
                            <div className="min-w-0">
                              <h3 className="text-xs font-bold text-gray-900 truncate group-hover:text-blue-600">{job.title}</h3>
                              <p className="text-[10px] font-bold text-green-600">{job.salary}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                )}

                <UserSuggestions
                  limit={5}
                  className="sticky top-20"
                  context={{ viewerIndustry: user?.industry }}
                />
              </div>
            )}

          </div>
        </section>


        {/* === Categories === */}
        {!isBusiness && (
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <i className="fas fa-layer-group text-purple-600"></i> Khám phá theo ngành nghề
            </h2>
            <div className="flex flex-wrap gap-3">
              {[
                { label: 'Kinh doanh', icon: 'fa-briefcase' },
                { label: 'Kế toán', icon: 'fa-calculator' },
                { label: 'Xây dựng', icon: 'fa-hard-hat' },
                { label: 'IT Phần mềm', icon: 'fa-laptop-code' },
                { label: 'Sản xuất', icon: 'fa-industry' },
                { label: 'Marketing', icon: 'fa-bullhorn' },
                { label: 'Nhân sự', icon: 'fa-users' },
                { label: 'Ngân hàng', icon: 'fa-university' },
                { label: 'Giáo dục', icon: 'fa-graduation-cap' },
                { label: 'Dịch vụ', icon: 'fa-concierge-bell' }
              ].map((cat, i) => (
                <div
                  key={i}
                  onClick={() => handleCategoryClick(cat.label)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full hover:bg-gray-50 hover:border-gray-400 cursor-pointer transition-all group bg-white shadow-sm hover:shadow"
                >
                  <i className={`fas ${cat.icon} text-gray-400 group-hover:text-[#4c42bd] transition-colors`}></i>
                  <span className="text-sm font-semibold text-gray-600 group-hover:text-gray-900">{cat.label}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* === Top Companies (Moved here) === */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <i className="fas fa-building text-[#4c42bd]"></i> Công ty hàng đầu
            </h2>
            <Link to="/companies" className="text-sm font-bold text-gray-500 hover:text-[#4c42bd] flex items-center gap-1 transition-colors">
              Xem tất cả <i className="fas fa-arrow-right text-xs"></i>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {topCompanies.map(company => (
              <div
                key={company.id}
                onClick={() => handleCompanyClick(company.id)}
                className="group relative bg-slate-50 border border-slate-100 rounded-2xl p-4 transition-all hover:bg-white hover:border-indigo-100 hover:shadow-xl cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-white rounded-xl border border-slate-100 p-2 flex shrink-0 items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <img src={company.logo} className="max-w-full max-h-full object-contain" alt="logo" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{company.name}</h3>
                    <div className="flex items-center gap-1 text-amber-500">
                      {renderStars(company.rating)}
                      <span className="text-[10px] font-bold text-amber-600">{company.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200/50">
                  <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">{jobsCountMap[company.id] || 0} JOBS</span>
                  <span className="text-[10px] font-bold text-slate-400 capitalize">{company.location}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* === Career Advice Section === */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <i className="fas fa-lightbulb text-yellow-500"></i> Tư vấn nghề nghiệp
            </h2>
            <Link to="/resources" className="text-sm font-bold text-gray-500 hover:text-[#4c42bd] flex items-center gap-1 transition-colors">
              Xem thêm <i className="fas fa-arrow-right text-xs"></i>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: 'Cách viết CV chuẩn ATS', img: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=400&q=80' },
              { title: 'Tâm lý nhân sự mid-career', img: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=400&q=80' },
              { title: 'Gen Z và môi trường công sở', img: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=400&q=80' },
              { title: 'Xu hướng tuyển dụng 2025', img: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=400&q=80' }
            ].map((post, i) => (
              <div key={i} className="group cursor-pointer" onClick={() => navigate('/resources')}>
                <div className="aspect-video rounded-lg overflow-hidden mb-2 border border-gray-100 shadow-sm">
                  <img src={post.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="blog" />
                </div>
                <h4 className="font-bold text-sm text-gray-900 line-clamp-2 group-hover:underline group-hover:text-[#4c42bd] leading-snug">
                  {post.title}
                </h4>
                <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                  <i className="far fa-clock"></i> 1 ngày trước
                </p>
              </div>
            ))}
          </div>
        </section>

      </div>
      {/* Footer */}
      <footer className="bg-[#2d277b] text-slate-200 py-16 -mb-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="mb-4 md:mb-0">
            <span className="text-2xl font-bold text-white tracking-tight flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white text-sm">
                <i className="fas fa-layer-group"></i>
              </div>
              WorkConnect
            </span>
            <p className="text-sm">Vietnam's #1 Job Marketplace.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">About Us</a></li>
              <li><a href="#" className="hover:text-white">How it Works</a></li>
              <li><a href="#" className="hover:text-white">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">Help Center</a></li>
              <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Connect</h4>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-white"><i className="fab fa-facebook fa-lg"></i></a>
              <a href="#" className="hover:text-white"><i className="fab fa-twitter fa-lg"></i></a>
              <a href="#" className="hover:text-white"><i className="fab fa-linkedin fa-lg"></i></a>
              <a href="#" className="hover:text-white"><i className="fab fa-instagram fa-lg"></i></a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-center text-sm">
          {/* Footer nhỏ gọn cho trang Guest */}
          {
            !user && (
              <footer className="py-3 border-t border-gray-200 mt-auto">
                <div className="max-w-[1128px] mx-auto px-4 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-1000 justify-center font-semibold">
                  <span className="flex items-center gap-1"><i className="fas fa-link"></i> WorkConnect © 2025</span>
                  <Link to="#" className="hover:text-[#4c42bd] hover:underline">Về chúng tôi</Link>
                  <Link to="#" className="hover:text-[#4c42bd] hover:underline">Quyền riêng tư</Link>
                </div>
              </footer>
            )
          }        
        </div>
      </footer>
    </div >
  );
};

export default Home;
