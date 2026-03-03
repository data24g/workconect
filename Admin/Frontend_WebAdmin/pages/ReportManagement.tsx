
import React, { useState, useEffect } from 'react';
import { Report, ReportStatus } from '../types';
import { adminApi } from '../services/adminApi';

const ReportManagement: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch reports from API
  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await adminApi.reports.getAll();
      // Convert data từ backend sang Report format nếu cần
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setReports([]); // Set empty nếu lỗi
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = (report: Report) => {
    setSelectedReport(report);
  };

  const closeHandling = () => {
    setSelectedReport(null);
  };

  const updateStatus = async (id: string, newStatus: ReportStatus) => {
    // TODO: Backend cần API để update report status
    // Tạm thời update local state
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    closeHandling();
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Báo cáo & Khiếu nại</h1>
          <p className="text-sm text-slate-500 font-medium tracking-tight">Trung tâm điều hành và xử lý vi phạm quy định cộng đồng.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Loại</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Đối tượng bị tố cáo</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Lý do báo cáo</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reports.map(report => (
              <tr key={report.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-tight ${report.type === 'USER' ? 'bg-blue-50 text-blue-600' :
                      report.type === 'JOB' ? 'bg-amber-50 text-amber-600' : 'bg-purple-50 text-purple-600'
                    }`}>
                    {report.type === 'USER' ? 'Người dùng' : report.type === 'JOB' ? 'Công việc' : 'Đánh giá'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-bold text-slate-800 tracking-tight">{report.targetId}</span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-xs font-bold text-slate-600 line-clamp-1">{report.reason}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${report.status === ReportStatus.OPEN ? 'bg-red-500' :
                        report.status === ReportStatus.INVESTIGATING ? 'bg-amber-500' : 'bg-green-500'
                      }`}></span>
                    <span className="text-[10px] font-black text-slate-800 uppercase">
                      {report.status === ReportStatus.OPEN ? 'Chờ xử lý' : report.status === ReportStatus.INVESTIGATING ? 'Đang điều tra' : 'Đã giải quyết'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleProcess(report)}
                    className="text-[11px] font-black text-indigo-600 hover:text-indigo-800 underline transition-all"
                  >Xử lý ngay</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Xử lý Báo cáo */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black tracking-tight">Xử lý Báo cáo #{selectedReport.id}</h2>
                <p className="text-xs text-indigo-100 mt-1 font-bold uppercase tracking-widest">Loại: {selectedReport.type}</p>
              </div>
              <button onClick={closeHandling} className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-full">
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Chi tiết khiếu nại</label>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-sm font-medium text-slate-700 leading-relaxed italic">
                  "{selectedReport.reason}"
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Ghi chú nội bộ</label>
                <textarea
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 h-24 transition-all"
                  placeholder="Nhập kết luận điều tra hoặc ghi chú xử lý..."
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4">
                <button
                  onClick={() => updateStatus(selectedReport.id, ReportStatus.INVESTIGATING)}
                  className="py-3 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-xs font-black hover:bg-amber-100 transition-all"
                >
                  <i className="fas fa-magnifying-glass mr-2"></i> Đang điều tra
                </button>
                <button
                  onClick={() => updateStatus(selectedReport.id, ReportStatus.RESOLVED)}
                  className="py-3 bg-green-600 text-white rounded-xl text-xs font-black shadow-lg shadow-green-100 hover:bg-green-700 transition-all"
                >
                  <i className="fas fa-check-circle mr-2"></i> Giải quyết xong
                </button>
                <button className="col-span-2 py-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-black hover:bg-red-100 transition-all">
                  <i className="fas fa-ban mr-2"></i> Khóa vĩnh viễn đối tượng bị tố cáo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportManagement;
