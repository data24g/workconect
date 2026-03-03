import React, { useEffect, useState } from 'react';
import { adminApi } from '../services/adminApi';
import { Job } from '../types';
import { getImageUrl, getInitialsAvatar } from '../utils/imageUtils';

export default function JobManagement() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'OPEN' | 'REJECTED' | 'HIDDEN' | 'COMPLETED'>('ALL');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await adminApi.jobs.getAll();

      let filtered = data;

      // Filter by search term
      if (searchTerm) {
        filtered = filtered.filter(job =>
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (job.businessName && job.businessName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (job.companyName && job.companyName.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      // Filter by status tab
      if (filterStatus !== 'ALL') {
        filtered = filtered.filter(job => job.status === filterStatus);
      }

      setJobs(filtered);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, filterStatus]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    if (!confirm(`Xác nhận chuyển trạng thái sang ${newStatus}?`)) return;

    try {
      await adminApi.jobs.updateStatus(id, newStatus);

      // Update local state
      setJobs(jobs.map(j => j.id === id ? { ...j, status: newStatus as any } : j));

      if (selectedJob?.id === id) {
        setSelectedJob(prev => prev ? { ...prev, status: newStatus as any } : null);
      }

      alert('Cập nhật trạng thái thành công!');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Lỗi cập nhật trạng thái');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa vĩnh viễn bản tin này không?')) return;
    try {
      await adminApi.jobs.delete(id);
      setJobs(jobs.filter(j => j.id !== id));
      if (selectedJob?.id === id) setSelectedJob(null);
      alert('Đã xóa bản tin thành công!');
    } catch (error) {
      alert('Lỗi khi xóa bản tin');
      console.error(error);
    }
  };

  const formatSalary = (salary: any) => {
    const num = Number(salary);
    if (isNaN(num)) return salary || 'Thỏa thuận';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
      case 'ACTIVE':
        return <span className="px-2.5 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase bg-green-50 text-green-600 ring-1 ring-green-100">Đang đăng</span>;
      case 'PENDING':
        return <span className="px-2.5 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase bg-amber-50 text-amber-600 ring-1 ring-amber-100">Chờ duyệt</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase bg-red-50 text-red-600 ring-1 ring-red-100">Bị từ chối</span>;
      case 'HIDDEN':
      case 'CLOSED':
      case 'SCAM':
        return <span className="px-2.5 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase bg-slate-100 text-slate-500 ring-1 ring-slate-200">Đã đóng / Ẩn</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase bg-blue-50 text-blue-600 ring-1 ring-blue-100">Hoàn thành</span>;
      default:
        return <span className="px-2.5 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase bg-gray-100 text-gray-500">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Quản lý Tin tuyển dụng</h1>
          <p className="text-sm text-slate-500 font-medium">Theo dõi và quản lý trạng thái các bài đăng tuyển dụng trên hệ thống.</p>
        </div>

        <div className="relative">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input
            type="text"
            placeholder="Tìm theo tiêu đề, doanh nghiệp..."
            className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl w-80 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
        {['ALL', 'OPEN', 'REJECTED', 'HIDDEN', 'COMPLETED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterStatus(tab as any)}
            className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${filterStatus === tab
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            {tab === 'ALL' ? 'Tất cả' :
              tab === 'OPEN' ? 'Đang đăng' :
                tab === 'REJECTED' ? 'Bị từ chối' :
                  tab === 'HIDDEN' ? 'Đã đóng / Ẩn' : 'Hoàn thành'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiêu đề & Doanh nghiệp</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mức lương</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngày đăng</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">Đang tải dữ liệu...</td></tr>
            ) : jobs.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">Không tìm thấy tin tuyển dụng nào.</td></tr>
            ) : (
              jobs.map((job) => (
                <tr key={job.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xs overflow-hidden">
                        {job.businessAvatar ? (
                          <img src={getImageUrl(job.businessAvatar, getInitialsAvatar(job.businessName || 'Company'))} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          (job.businessName || '?').charAt(0)
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-black text-slate-800 line-clamp-1">{job.title}</div>
                        <div className="text-xs font-bold text-slate-500 line-clamp-1">{job.businessName || job.companyName || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-black text-indigo-600">{formatSalary(job.salary)}</span>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-500">
                    {job.postedAt ? new Date(job.postedAt).toLocaleDateString('vi-VN') : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(job.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setSelectedJob(job)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Xem chi tiết">
                        <i className="fas fa-eye"></i>
                      </button>

                      {job.status !== 'OPEN' && (
                        <button
                          onClick={() => handleUpdateStatus(job.id, 'OPEN')}
                          className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all" title="Mở lại tin">
                          <i className="fas fa-play"></i>
                        </button>
                      )}

                      {(job.status === 'OPEN' || job.status === 'PENDING') && (
                        <button
                          onClick={() => handleUpdateStatus(job.id, 'HIDDEN')}
                          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all" title="Đóng tin">
                          <i className="fas fa-stop"></i>
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(job.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Xóa vĩnh viễn">
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-white/20 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-start">
              <div className="flex gap-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xl overflow-hidden shadow-inner">
                  {selectedJob.businessAvatar ? (
                    <img src={getImageUrl(selectedJob.businessAvatar, getInitialsAvatar(selectedJob.businessName || 'Company'))} className="w-full h-full object-cover" />
                  ) : (
                    (selectedJob.businessName || '?').charAt(0)
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800 leading-tight">{selectedJob.title}</h2>
                  <p className="text-sm font-bold text-indigo-600 mt-1">{selectedJob.businessName || selectedJob.companyName || 'N/A'}</p>
                </div>
              </div>
              <button onClick={() => setSelectedJob(null)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-8 py-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mức lương</p>
                  <p className="text-sm font-black text-slate-800">{formatSalary(selectedJob.salary)}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Trạng thái</p>
                  <div>{getStatusBadge(selectedJob.status)}</div>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Mô tả công việc</p>
                <div className="text-sm text-slate-600 leading-relaxed font-medium whitespace-pre-wrap bg-slate-50/50 p-4 rounded-2xl border border-slate-50">
                  {selectedJob.description || 'Không có mô tả.'}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Yêu cầu</p>
                <div className="text-sm text-slate-600 leading-relaxed font-medium whitespace-pre-wrap bg-slate-50/50 p-4 rounded-2xl border border-slate-50">
                  {selectedJob.requirements || 'Không có yêu cầu cụ thể.'}
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex gap-3 justify-end">
              {selectedJob.status !== 'OPEN' && (
                <button
                  onClick={() => handleUpdateStatus(selectedJob.id, 'OPEN')}
                  className="px-6 py-2.5 bg-green-600 text-white rounded-xl text-xs font-black shadow-lg shadow-green-100 hover:bg-green-700 transition-all flex items-center gap-2">
                  <i className="fas fa-play"></i> Mở lại tin
                </button>
              )}

              {(selectedJob.status === 'OPEN' || selectedJob.status === 'PENDING') && (
                <button
                  onClick={() => handleUpdateStatus(selectedJob.id, 'HIDDEN')}
                  className="px-6 py-2.5 bg-amber-500 text-white rounded-xl text-xs font-black shadow-lg shadow-amber-100 hover:bg-amber-600 transition-all flex items-center gap-2">
                  <i className="fas fa-stop"></i> Đóng tin
                </button>
              )}

              <button
                onClick={() => handleDelete(selectedJob.id)}
                className="px-6 py-2.5 bg-red-50 text-red-600 rounded-xl text-xs font-black hover:bg-red-100 transition-all flex items-center gap-2">
                <i className="fas fa-trash-alt"></i> Xóa vĩnh viễn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
