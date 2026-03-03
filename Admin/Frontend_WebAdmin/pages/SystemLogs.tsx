import React, { useEffect, useState } from 'react';
import { adminApi } from '../services/adminApi';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface Activity {
  id: string;
  userId: string;
  action: string;
  details: string;
  timestamp: string;
}

const SystemLogs: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const [allActivities, count] = await Promise.all([
        adminApi.activities.getAll(),
        adminApi.activities.getCount()
      ]);

      setActivities(Array.isArray(allActivities) ? allActivities : []);
      setTotalCount(typeof count === 'number' ? count : 0);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const getActionBadgeColor = (action: string) => {
    if (action?.includes('LOGIN')) return 'bg-green-100 text-green-700 border-green-200';
    if (action?.includes('UPDATE')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (action?.includes('DELETE') || action?.includes('BAN')) return 'bg-red-100 text-red-700 border-red-200';
    if (action?.includes('CREATE') || action?.includes('POST')) return 'bg-purple-100 text-purple-700 border-purple-200';
    if (action?.includes('VERIFY') || action?.includes('APPROVE')) return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const filteredActivities = searchTerm
    ? activities.filter(act =>
      act.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.userId?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : activities;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Nhật ký truy vết (Audit Logs)</h1>
          <p className="text-sm text-slate-500 font-medium tracking-tight">
            Mọi hoạt động của người dùng đều được ghi lại và <span className="text-red-600 font-black italic">Không thể xóa</span>.
          </p>
          <p className="text-xs text-slate-400 font-bold mt-1">
            Tổng số: <span className="text-indigo-600">{totalCount.toLocaleString()}</span> hoạt động được ghi nhận
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
            <input
              type="text"
              placeholder="Tìm kiếm hoạt động..."
              className="pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none w-80 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600 text-sm font-bold border border-indigo-100 flex items-center gap-2 shadow-sm">
            <i className="fas fa-lock"></i>
            <span>Dữ liệu đã được niêm phong</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">
              <i className="fas fa-list"></i>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-800">{totalCount.toLocaleString()}</div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tổng hoạt động</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center text-xl">
              <i className="fas fa-user-check"></i>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-800">{activities.filter(a => a.action?.includes('LOGIN')).length}</div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đăng nhập</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl">
              <i className="fas fa-pen-to-square"></i>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-800">{activities.filter(a => a.action?.includes('UPDATE')).length}</div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cập nhật</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl">
              <i className="fas fa-plus-circle"></i>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-800">{activities.filter(a => a.action?.includes('CREATE') || a.action?.includes('POST')).length}</div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tạo mới</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Thời gian</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">User ID</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hành động</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Chi tiết</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Loại</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-20 text-center">
                  <i className="fas fa-spinner fa-spin text-2xl text-purple-600 mb-2"></i>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Đang tải nhật ký...</p>
                </td>
              </tr>
            ) : filteredActivities.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center">
                      <i className="fas fa-inbox text-2xl text-slate-300"></i>
                    </div>
                    <p className="text-sm font-bold text-slate-400">
                      {searchTerm ? 'Không tìm thấy hoạt động nào' : 'Chưa có hoạt động nào được ghi nhận'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredActivities.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 text-[11px] font-mono text-slate-500 font-bold">
                    {format(new Date(log.timestamp), 'HH:mm:ss\ndd/MM/yyyy', { locale: vi })}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                      {log.userId?.substring(0, 8)}...
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-black text-slate-800">{log.action}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs font-medium text-slate-600 tracking-tight line-clamp-2 max-w-md">
                      {log.details}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase border ${getActionBadgeColor(log.action)}`}>
                      {log.action?.split('_')[0]}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filteredActivities.length > 0 && (
        <div className="flex justify-center">
          <button
            onClick={fetchActivities}
            className="text-xs font-black text-slate-400 hover:text-indigo-600 transition-colors py-4 flex items-center gap-2 hover:gap-3 transition-all"
          >
            <i className="fas fa-rotate"></i> Làm mới dữ liệu
          </button>
        </div>
      )}
    </div>
  );
};

export default SystemLogs;
