
import React, { useState } from 'react';

const SystemSettings: React.FC = () => {
  const [maintenance, setMaintenance] = useState(false);

  return (
    <div className="space-y-8 max-w-4xl animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Cấu hình hệ thống</h1>
        <p className="text-sm text-slate-500 font-medium">Điều chỉnh các ngưỡng cảnh báo và các quy tắc vận hành tự động.</p>
      </div>

      <div className="grid gap-6">
        {/* Anti-Fraud Thresholds */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
            <i className="fas fa-shield-halved text-indigo-600"></i> Ngưỡng bảo mật & Chống gian lận
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Rating Threshold (Cảnh báo)</label>
              <input type="number" step="0.1" defaultValue={3.5} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 font-bold" />
              <p className="text-[10px] text-slate-400 font-medium italic">Tài khoản xuống dưới mức này sẽ bị đưa vào danh sách theo dõi.</p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Report Limit (Tự động khóa)</label>
              <input type="number" defaultValue={5} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 font-bold" />
              <p className="text-[10px] text-slate-400 font-medium italic">Tài khoản nhận quá số báo cáo này sẽ bị khóa tạm thời 24h.</p>
            </div>
          </div>
        </div>

        {/* Global Controls */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
            <i className="fas fa-toggle-on text-indigo-600"></i> Điều khiển trạng thái hệ thống
          </h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div>
                <p className="text-sm font-black text-slate-800">Maintenance Mode (Bảo trì)</p>
                <p className="text-xs font-bold text-slate-400 mt-1">Ngắt kết nối người dùng thông thường để nâng cấp hệ thống.</p>
              </div>
              <button 
                onClick={() => setMaintenance(!maintenance)}
                className={`w-14 h-8 rounded-full transition-all relative ${maintenance ? 'bg-red-500' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${maintenance ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div>
                <p className="text-sm font-black text-slate-800">Cấp huy hiệu Top Worker tự động</p>
                <p className="text-xs font-bold text-slate-400 mt-1">Hệ thống sẽ tự tính toán dựa trên Rating và số Job hoàn thành.</p>
              </div>
              <button className="w-14 h-8 bg-indigo-600 rounded-full relative">
                <div className="absolute top-1 left-7 w-6 h-6 bg-white rounded-full"></div>
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-black hover:bg-slate-200 transition-all">Hủy thay đổi</button>
          <button className="px-8 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">Lưu cấu hình</button>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
