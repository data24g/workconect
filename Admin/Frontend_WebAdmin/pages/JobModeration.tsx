
import React, { useState } from 'react';
import { Job } from '../types';

const MOCK_JOBS: Job[] = [
  { id: 'J-001', employerId: 'E1', employerName: 'Cửa hàng tiện lợi 24h', title: 'Nhân viên bán hàng ca tối (19h-23h)', status: 'ACTIVE', reportCount: 0, createdAt: '25/10/2023' },
  { id: 'J-002', employerId: 'E2', employerName: 'Giao hàng Nhanh', title: 'Tài xế xe tải bằng C lương cao 30tr', status: 'SPAM', reportCount: 15, createdAt: '24/10/2023' },
  { id: 'J-003', employerId: 'E3', employerName: 'Quán Cafe X', title: 'Phục vụ bàn part-time cuối tuần', status: 'HIDDEN', reportCount: 2, createdAt: '23/10/2023' },
  { id: 'J-004', employerId: 'E4', employerName: 'Nhà sách ABC', title: 'Nhân viên kiểm kho thời vụ', status: 'COMPLETED', reportCount: 0, createdAt: '20/10/2023' },
  { id: 'J-005', employerId: 'E5', employerName: 'Shop Quần áo', title: 'Mẫu ảnh chụp lookbook', status: 'ACTIVE', reportCount: 5, createdAt: '26/10/2023' },
];

type TabType = 'ALL' | 'REPORTED' | 'CLOSED';

const JobModeration: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('ALL');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const filteredJobs = MOCK_JOBS.filter(job => {
    if (activeTab === 'REPORTED') return job.reportCount > 0 || job.status === 'SPAM';
    if (activeTab === 'CLOSED') return job.status === 'COMPLETED' || job.status === 'HIDDEN';
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-black text-slate-800">Điều phối công việc (Jobs)</h1>
        <p className="text-sm text-slate-500 font-medium">Kiểm soát nội dung đăng tuyển, ngăn chặn spam và lừa đảo.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <i className="fas fa-briefcase text-xl"></i>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Đang hiển thị</p>
            <p className="text-xl font-black text-slate-800">2,841</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
            <i className="fas fa-triangle-exclamation text-xl"></i>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Spam bị chặn</p>
            <p className="text-xl font-black text-slate-800">124</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <i className="fas fa-flag text-xl"></i>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Bị báo cáo</p>
            <p className="text-xl font-black text-slate-800">18</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex p-1 bg-white rounded-xl border border-slate-200 gap-1 shadow-sm">
             <button onClick={() => setActiveTab('ALL')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'ALL' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>Tất cả</button>
             <button onClick={() => setActiveTab('REPORTED')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'REPORTED' ? 'bg-red-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>Bị báo cáo</button>
             <button onClick={() => setActiveTab('CLOSED')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'CLOSED' ? 'bg-slate-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>Đã đóng</button>
          </div>
        </div>
        
        <div className="divide-y divide-slate-100">
          {filteredJobs.length > 0 ? filteredJobs.map(job => (
            <div key={job.id} className="p-6 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:bg-slate-50/50 transition-colors group">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-sm font-bold text-slate-800 truncate">{job.title}</h3>
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${
                    job.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                    job.status === 'SPAM' ? 'bg-red-100 text-red-700' : 
                    job.status === 'HIDDEN' ? 'bg-slate-100 text-slate-600' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {job.status === 'ACTIVE' ? 'Đang mở' : job.status === 'SPAM' ? 'Spam' : job.status === 'HIDDEN' ? 'Đã ẩn' : 'Hoàn thành'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold">
                  <span className="flex items-center gap-1 font-black text-indigo-600">{job.employerName}</span>
                  <span className="text-slate-200">•</span>
                  <span>{job.createdAt}</span>
                  {job.reportCount > 0 && (
                    <span className="text-red-500 font-black tracking-tight ml-2">
                      <i className="fas fa-triangle-exclamation mr-1"></i> {job.reportCount} BÁO CÁO
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => setSelectedJob(job)}
                  className="px-4 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-black hover:bg-slate-50 transition-all"
                >Xem nội dung</button>
                {job.status === 'ACTIVE' && (
                  <button className="px-4 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded-lg text-xs font-black hover:bg-red-100 transition-all">Gỡ tin</button>
                )}
              </div>
            </div>
          )) : (
            <div className="p-12 text-center text-slate-400 font-bold italic">Không có dữ liệu.</div>
          )}
        </div>
      </div>

      {/* Modal Chi tiết Công việc */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300 max-h-[90vh] flex flex-col">
            <div className="bg-slate-800 p-8 text-white relative shrink-0">
              <button onClick={() => setSelectedJob(null)} className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center hover:bg-white/20 rounded-full transition-all">
                <i className="fas fa-times"></i>
              </button>
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-indigo-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest italic">Hồ sơ công việc #{selectedJob.id}</span>
                {selectedJob.reportCount > 0 && <span className="bg-red-500 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest"><i className="fas fa-warning"></i> Đang bị tố cáo</span>}
              </div>
              <h2 className="text-2xl font-black leading-tight tracking-tight">{selectedJob.title}</h2>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Thù lao thỏa thuận</p>
                  <p className="text-xl font-black text-indigo-600">35,000đ<span className="text-xs text-slate-400 ml-1">/ Giờ</span></p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Địa điểm</p>
                  <p className="text-xs font-black text-slate-800 leading-relaxed truncate"><i className="fas fa-location-dot mr-1 text-slate-300"></i> Quận 1, TP. HCM</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nhà tuyển dụng</p>
                  <p className="text-xs font-black text-slate-800 truncate"><i className="fas fa-building mr-1 text-slate-300"></i> {selectedJob.employerName}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-black text-slate-800 mb-3 flex items-center gap-2">
                    <i className="fas fa-file-lines text-indigo-600"></i> Mô tả công việc
                  </h4>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed italic border-l-4 border-slate-100 pl-4 bg-slate-50/50 py-2 rounded-r-xl">
                    Hệ thống sẽ cập nhật chi tiết từ database: "Chào bạn, chúng tôi đang cần tuyển nhân viên trực quầy thu ngân cho ca tối từ 19h đến 23h. Yêu cầu nhanh nhẹn, trung thực, có thể làm xoay ca cuối tuần. Ưu tiên sinh viên đang theo học tại các trường lân cận..."
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-black text-slate-800 mb-3 flex items-center gap-2">
                    <i className="fas fa-list-check text-indigo-600"></i> Yêu cầu ứng viên
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-600 p-3 bg-white border border-slate-100 rounded-xl">
                      <i className="fas fa-check-circle text-green-500"></i> Có xe máy cá nhân
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-600 p-3 bg-white border border-slate-100 rounded-xl">
                      <i className="fas fa-check-circle text-green-500"></i> Độ tuổi: 18 - 25
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-600 p-3 bg-white border border-slate-100 rounded-xl">
                      <i className="fas fa-check-circle text-green-500"></i> Có kinh nghiệm cơ bản
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-600 p-3 bg-white border border-slate-100 rounded-xl">
                      <i className="fas fa-check-circle text-green-500"></i> Sức khỏe tốt
                    </div>
                  </div>
                </div>

                {selectedJob.reportCount > 0 && (
                   <div className="p-6 bg-red-50 rounded-2xl border border-red-100">
                      <h4 className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <i className="fas fa-triangle-exclamation"></i> Lịch sử báo cáo vi phạm
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-start text-[11px] font-bold text-red-800 bg-white/50 p-3 rounded-xl">
                          <span>"Nội dung sai sự thật, không có cửa hàng ở đây"</span>
                          <span className="text-red-400">10/10/2023</span>
                        </div>
                        <div className="flex justify-between items-start text-[11px] font-bold text-red-800 bg-white/50 p-3 rounded-xl">
                          <span>"Yêu cầu đóng phí cọc chân rết"</span>
                          <span className="text-red-400">09/10/2023</span>
                        </div>
                      </div>
                   </div>
                )}
              </div>
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4 shrink-0">
               <button 
                 className="flex-1 py-4 bg-slate-800 text-white rounded-2xl font-black text-sm hover:bg-slate-900 transition-all active:scale-95"
                 onClick={() => setSelectedJob(null)}
               >
                 Đóng cửa sổ
               </button>
               <button className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-red-100 hover:bg-red-700 transition-all active:scale-95">
                 Gỡ tin vĩnh viễn
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobModeration;
