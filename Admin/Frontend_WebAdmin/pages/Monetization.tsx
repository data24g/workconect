
import React, { useState } from 'react';
import { ServicePackage } from '../types';

const MOCK_PACKAGES: ServicePackage[] = [
  { id: 'P-01', name: 'Nhà tuyển dụng Premium', target: 'EMPLOYER', price: 500000, activeUsers: 142, status: 'ACTIVE' },
  { id: 'P-02', name: 'Người làm Verified+', target: 'WORKER', price: 99000, activeUsers: 856, status: 'ACTIVE' },
  { id: 'P-03', name: 'Gói Doanh nghiệp lớn', target: 'EMPLOYER', price: 2500000, activeUsers: 12, status: 'ACTIVE' },
];

const Monetization: React.FC = () => {
  const [packages, setPackages] = useState(MOCK_PACKAGES);
  const [editingPackage, setEditingPackage] = useState<ServicePackage | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic lưu cập nhật
    setEditingPackage(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Kinh doanh & Gói dịch vụ</h1>
          <p className="text-sm text-slate-500 font-medium">Quản lý các nguồn doanh thu và cấu hình gói thành viên cao cấp.</p>
        </div>
        <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-xs font-black border border-emerald-100 shadow-sm flex items-center gap-2">
          <i className="fas fa-sack-dollar"></i>
          Doanh thu tháng này: 124,500,000đ
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map(pkg => (
          <div key={pkg.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-500">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-125 transition-all duration-700">
              <i className="fas fa-credit-card text-8xl"></i>
            </div>
            <div className="flex justify-between items-start mb-6">
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest ${pkg.target === 'EMPLOYER' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {pkg.target === 'EMPLOYER' ? 'Doanh nghiệp' : 'Người lao động'}
              </span>
              <span className="text-[10px] font-black text-slate-300 font-mono italic"># {pkg.id}</span>
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2 leading-tight">{pkg.name}</h3>
            <p className="text-2xl font-black text-indigo-600 mb-6">{pkg.price.toLocaleString()}đ<span className="text-[10px] text-slate-400 font-bold uppercase ml-1"> / Tháng</span></p>
            
            <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl mb-6 border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                <i className="fas fa-users"></i>
              </div>
              <div>
                <p className="text-sm font-black text-slate-800 leading-none">{pkg.activeUsers}</p>
                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">Đang sử dụng gói</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setEditingPackage(pkg)}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
              >
                Sửa cấu hình
              </button>
              <button className="px-4 py-3 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all">
                <i className="fas fa-ban"></i>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Chỉnh sửa Gói */}
      {editingPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-indigo-600 p-6 text-white">
              <h2 className="text-xl font-black tracking-tight">Cấu hình: {editingPackage.name}</h2>
              <p className="text-xs text-indigo-100 mt-1 font-bold uppercase tracking-widest italic">Mọi thay đổi sẽ áp dụng từ chu kỳ thanh toán tiếp theo</p>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-6">
               <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Tên hiển thị</label>
                    <input type="text" defaultValue={editingPackage.name} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 font-bold" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Giá gói (VNĐ/Tháng)</label>
                    <input type="number" defaultValue={editingPackage.price} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 font-bold" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <p className="text-xs font-black text-slate-800">Trạng thái mở bán</p>
                      <p className="text-[10px] text-slate-400 font-bold">Người dùng có thể đăng ký mới</p>
                    </div>
                    <div className="w-12 h-6 bg-green-500 rounded-full relative">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
               </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditingPackage(null)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-black hover:bg-slate-200 transition-all">Hủy bỏ</button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">Lưu thay đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Monetization;
