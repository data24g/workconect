import React, { useState, useEffect, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { mockIndustries } from '../mockData';
import { UserRole } from '../types';
import businessApi, { BusinessDTO } from '../apis/api_business';
import followApi from '../apis/api_follow';
import jobApi, { JobResponse } from '../apis/api_job';


// Create a Context for followed companies to share across components
export const FollowedCompaniesContext = createContext<{
    followedIds: string[];
    followCompany: (id: string) => void;
    unfollowCompany: (id: string) => void;
    allCompanies: BusinessDTO[];
}>({
    followedIds: [],
    followCompany: () => { },
    unfollowCompany: () => { },
    allCompanies: [],
});


// Provider component to wrap your app (put this in your main App.tsx or index.tsx)
export const FollowedCompaniesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [followedIds, setFollowedIds] = useState<string[]>([]);
    const [allCompanies, setAllCompanies] = useState<BusinessDTO[]>([]);

    useEffect(() => {
        const fetchFollowing = async () => {
            if (user?.id) {
                try {
                    const following = await followApi.getFollowing(user.id);
                    setFollowedIds(following.map(u => u.id));
                } catch (error) {
                    console.error("Failed to fetch following list:", error);
                }
            }
        };
        fetchFollowing();
    }, [user?.id]);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const data = await businessApi.getAll();
                setAllCompanies(data);
            } catch (error) {
                console.error("Failed to fetch all companies in Provider:", error);
            }
        };
        fetchAll();
    }, []);

    const followCompany = async (id: string) => {
        if (!user?.id) return;
        try {
            await followApi.follow(id, user.id);
            setFollowedIds(prev => [...prev, id]);
        } catch (error) {
            console.error("Failed to follow:", error);
        }
    };

    const unfollowCompany = async (id: string) => {
        if (!user?.id) return;
        try {
            await followApi.unfollow(id, user.id);
            setFollowedIds(prev => prev.filter(fId => fId !== id));
        } catch (error) {
            console.error("Failed to unfollow:", error);
        }
    };

    return (
        <FollowedCompaniesContext.Provider value={{ followedIds, followCompany, unfollowCompany, allCompanies }}>
            {children}
        </FollowedCompaniesContext.Provider>
    );
};




const Companies: React.FC = () => {
    const navigate = useNavigate();
    const { followedIds, followCompany, unfollowCompany, allCompanies } = useContext(FollowedCompaniesContext);
    const { user } = useAuth();
    const isBusiness = user?.role === UserRole.BUSINESS;

    const [searchText, setSearchText] = useState('');
    const [industryFilter, setIndustryFilter] = useState('Tất cả');
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [jobsCountMap, setJobsCountMap] = useState<Record<string, number>>({});

    useEffect(() => {
        if (allCompanies.length === 0) {
            setIsLoading(true);
        } else {
            setIsLoading(false);
        }
    }, [allCompanies]);

    // Fetch jobs and calculate count
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const jobRes = await jobApi.getAll();
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
                console.error('Failed to fetch jobs:', error);
            }
        };
        fetchJobs();
    }, []);


    // Dropdown States
    const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);
    const industryRef = React.useRef<HTMLDivElement>(null);

    const itemsPerPage = 12; // 22 items / 2 pages = 11 items per page (even distribution)

    const handleViewJobs = (companyName: string) => {
        if (isBusiness) return;
        navigate('/jobs', { state: { searchTerm: companyName, location: 'Tất cả địa điểm' } });
    };

    const openBusinessProfile = (companyId: string) => {
        navigate(`/fast-processing/${companyId}`);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (industryRef.current && !industryRef.current.contains(event.target as Node)) {
                setShowIndustryDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // 🔍 Filter + Search - useMemo to stabilize calculations
    const filteredCompanies = React.useMemo(() => {
        return allCompanies.filter(company => {
            // Exclude current user from the list
            if (user?.id && company.id === user.id) return false;

            const matchName = company.name.toLowerCase().includes(searchText.toLowerCase()) ||
                company.numericId?.toString().includes(searchText.toLowerCase());
            const matchIndustry =
                industryFilter === 'Tất cả' ||
                company.industry.toLowerCase().includes(industryFilter.toLowerCase());

            return matchName && matchIndustry;
        });
    }, [allCompanies, searchText, industryFilter, user?.id]);


    const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
    const paginatedCompanies = filteredCompanies.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="bg-[#F3F2EF] min-h-screen py-6 font-sans">
            <div className="max-w-[1128px] mx-auto px-4">

                {/* 🔎 Search + Filter Bar */}
                <div className="bg-white border border-gray-300 rounded-lg p-3 -mt-2 mb-4 flex flex-col md:flex-row gap-3 items-center shadow-sm">

                    {/* Search */}
                    <input
                        type="text"
                        placeholder="Tìm kiếm công ty..."
                        value={searchText}
                        onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }}
                        className="w-full md:w-2/3 px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#4c42be]"
                    />

                    {/* Industry Filter - Custom Dropdown */}
                    <div className="relative w-full md:w-1/3" ref={industryRef}>
                        <div
                            className="w-full px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#4c42be] flex items-center justify-between cursor-pointer group bg-white h-10 transition-all"
                            onClick={() => setShowIndustryDropdown(!showIndustryDropdown)}
                        >
                            <span className="text-gray-900 font-medium truncate select-none">
                                {industryFilter === 'Tất cả' ? 'Tất cả ngành nghề' : industryFilter}
                            </span>
                            <i className={`fas fa-chevron-down text-gray-400 text-xs transition-transform duration-300 ${showIndustryDropdown ? 'rotate-180 text-[#4c42be]' : ''}`}></i>
                        </div>

                        {/* Custom Industry Dropdown Tooltip */}
                        {showIndustryDropdown && (
                            <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="p-2 border-b border-gray-50 bg-gray-50/50">
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest px-2">Ngành nghề</p>
                                </div>
                                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                    {mockIndustries.map(ind => (
                                        <div
                                            key={ind}
                                            onClick={() => { setIndustryFilter(ind); setShowIndustryDropdown(false); setCurrentPage(1); }}
                                            className={`px-4 py-2.5 text-xs font-bold cursor-pointer transition-colors border-b last:border-none border-gray-50 ${industryFilter === ind ? 'text-[#4c42bd] bg-indigo-50' : 'text-gray-600 hover:bg-gray-50'}`}
                                        >
                                            {ind}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Company Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {paginatedCompanies.map(company => {
                        const isFollowed = followedIds.includes(company.id);
                        return (
                            <div key={company.id} className="bg-white rounded-lg border border-gray-300 hover:shadow-md transition-shadow relative">
                                <div className="h-16 bg-gray-200 relative">
                                    <div
                                        className="absolute top-4 left-4 w-16 h-16 bg-white rounded border shadow flex items-center justify-center cursor-pointer hover:opacity-90 overflow-hidden"
                                        onClick={() => openBusinessProfile(company.id)}
                                    >
                                        <img src={company.avatar || company.logo} alt={company.name} className="w-full h-full object-cover" />
                                    </div>
                                </div>

                                <div className="pt-6 px-4 pb-4">
                                    <h3
                                        className="font-bold text-gray-900 line-clamp-1 cursor-pointer hover:text-[#4c42bd]"
                                        onClick={() => openBusinessProfile(company.id)}
                                    >
                                        {company.name}
                                    </h3>
                                    {company.numericId && (
                                        <p className="text-[10px] text-[#4c42bd] font-bold">ID: {company.numericId}</p>
                                    )}
                                    <p className="text-xs text-gray-500">{company.industry}</p>
                                    <p className="text-xs text-gray-400">{company.followers} theo dõi</p>

                                    <div className="flex justify-between border-t border-b py-3 my-3">
                                        {!isBusiness ? (
                                            <div onClick={() => handleViewJobs(company.name)} className="cursor-pointer">
                                                <p className="text-[10px] text-gray-500 font-bold">ĐANG TUYỂN</p>
                                                <p className="text-sm font-bold text-[#4c42bd]">{jobsCountMap[company.id] || 0} vị trí</p>
                                            </div>
                                        ) : (
                                            <div>
                                                <p className="text-[10px] text-gray-500 font-bold">ĐANG TUYỂN</p>
                                                <p className="text-sm font-bold text-[#4c42bd]">{jobsCountMap[company.id] || 0} vị trí</p>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-[10px] text-gray-500 font-bold">ĐÁNH GIÁ</p>
                                            <p className="text-sm font-bold">
                                                {company.rating && company.rating > 0 && company.rating <= 5 ? (
                                                    <>{company.rating.toFixed(1)} ⭐</>
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">Chưa có</span>
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        {user && (
                                            <button
                                                onClick={() => isFollowed ? unfollowCompany(company.id) : followCompany(company.id)}
                                                className={`flex-1 border rounded-full text-sm font-bold py-1 ${isFollowed
                                                    ? 'border-gray-400 text-gray-600 bg-gray-100 hover:bg-gray-200'
                                                    : 'border-[#4c42bd] text-[#4c42bd] hover:bg-blue-50'
                                                    }`}
                                            >
                                                {isFollowed ? 'Đang theo dõi' : '+ Theo dõi'}
                                            </button>
                                        )}
                                        {!isBusiness && (
                                            <button
                                                onClick={() => handleViewJobs(company.name)}
                                                className="flex-1 border border-gray-400 rounded-full text-sm font-bold py-1 hover:bg-gray-100"
                                            >
                                                Xem việc
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-6 flex justify-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                            <button
                                key={p}
                                onClick={() => setCurrentPage(p)}
                                className={`px-4 py-1.5 border rounded ${p === currentPage ? 'bg-gray-200 font-bold' : 'bg-white hover:bg-gray-100'
                                    }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div >
    );
};

export default Companies;