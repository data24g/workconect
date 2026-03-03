import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';
import { getImageUrl, getInitialsAvatar } from '../utils/imageUtils';

// Types for Business data from backend
interface Business {
  id: string; // Backend uses 'id'
  name: string;
  logo?: string;
  avatar?: string;
  description?: string;
  industry: string;
  location: string;
  scale: string;
  established: string;
  website: string;
  verifyStatus: 'PENDING' | 'VERIFIED' | 'DENIED';
  rating: number;
  email: string;
  taxCode?: string;
  submittedAt?: string;
  createdAt?: string;
  documents?: {
    businessLicense?: string;
    taxCode?: string;
    bankAccount?: string;
    ownerIdCard?: string;
  };
}

const BusinessVerification: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBiz, setSelectedBiz] = useState<Business | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [filter, setFilter] = useState<'PENDING' | 'REJECTED'>('PENDING');

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      console.log('📡 Fetching businesses from backend...');
      const data = await adminApi.businesses.getAll();
      console.log('📥 Raw data received from API:', data);

      let bizList = [];
      if (Array.isArray(data)) {
        bizList = data;
      } else if (data && Array.isArray(data.data)) {
        bizList = data.data;
      } else if (data && Array.isArray(data.value)) {
        bizList = data.value;
      }

      console.log('📋 Processed list of businesses:', bizList);
      setBusinesses(bizList);
    } catch (error) {
      console.error('❌ Error fetching businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, newStatus: 'VERIFIED' | 'DENIED') => {
    try {
      setActionLoading(id);
      console.log(`📤 Updating business ${id} to ${newStatus}`);

      // Backend expects 'REJECTED' for 'DENIED' in verify endpoint
      const apiStatus = newStatus === 'DENIED' ? 'REJECTED' : 'VERIFIED';

      await adminApi.businesses.verify(id, apiStatus, 'Duyệt bởi Admin');
      console.log('✅ Business status updated successfully on backend');

      // Update local state
      setBusinesses(prev => prev.map(item =>
        item.id === id ? { ...item, verifyStatus: newStatus } : item
      ));
      setSelectedBiz(null);
    } catch (error) {
      console.error('❌ Error updating business:', error);
      alert('Có lỗi xảy ra khi cập nhật trạng thái. Vui lòng thử lại.');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
          <p className="mt-4 text-slate-600 font-bold">Đang tải dữ liệu doanh nghiệp...</p>
        </div>
      </div>
    );
  }

  const filteredBusinesses = businesses.filter(b => {
    const status = (b.verifyStatus || (b as any).verificationStatus || '').toString().toUpperCase();
    return status === filter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight lowercase first-letter:uppercase">Xác thực doanh nghiệp</h1>
          <p className="text-sm text-slate-500 font-medium">Đối soát Mã số thuế (MST) và Giấy phép kinh doanh để cấp Huy hiệu Xác minh.</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setFilter('PENDING')}
            className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${filter === 'PENDING'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            Chờ duyệt ({businesses.filter(b => (b.verifyStatus || (b as any).verificationStatus || '').toUpperCase() === 'PENDING').length})
          </button>
          <button
            onClick={() => setFilter('REJECTED')}
            className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${filter === 'REJECTED'
                ? 'bg-white text-red-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            Đã từ chối ({businesses.filter(b => (b.verifyStatus || (b as any).verificationStatus || '').toUpperCase() === 'REJECTED').length})
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredBusinesses.map(biz => (
          <div key={biz.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-6 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50/50 transition-all group">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl border flex items-center justify-center font-black text-lg transition-all overflow-hidden bg-white">
                  {biz.logo || biz.avatar ? (
                    <img src={getImageUrl(biz.logo || biz.avatar, getInitialsAvatar(biz.name))} alt={biz.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className={filter === 'REJECTED'
                    ? 'bg-red-50 border-red-100 text-red-500 group-hover:bg-red-600 group-hover:text-white'
                    : 'bg-slate-50 border-slate-100 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white'
                  }>{biz.name?.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800 tracking-tight">{biz.name}</h3>
                  <div className="flex gap-2">
                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-tighter">{biz.industry}</p>
                    {filter === 'REJECTED' && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded text-[9px] font-black uppercase">Đã từ chối</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-50">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Mã số thuế</p>
                  <p className="text-sm font-mono font-black text-slate-700">{biz.taxCode || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Ngày gửi yêu cầu</p>
                  <p className="text-sm font-black text-slate-700">
                    {biz.createdAt ? new Date(biz.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 lg:w-48 justify-center">
              <button
                onClick={() => setSelectedBiz(biz)}
                disabled={actionLoading === biz.id}
                className="flex-1 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black hover:bg-indigo-100 transition-all flex items-center justify-center"
              >
                <i className="fas fa-eye mr-2"></i> Xem chi tiết
              </button>

              {/* Only show Approve/Reject buttons for PENDING, or Re-Approve for REJECTED */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleAction(biz.id, 'VERIFIED')}
                  disabled={actionLoading === biz.id}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all active:scale-95 flex items-center justify-center disabled:opacity-50 ${filter === 'REJECTED'
                      ? 'bg-white border border-green-200 text-green-600 hover:bg-green-50'
                      : 'bg-green-600 text-white shadow-lg shadow-green-100 hover:bg-green-700'
                    }`}
                >
                  {actionLoading === biz.id ? <i className="fas fa-spinner animate-spin"></i> : (filter === 'REJECTED' ? 'Duyệt lại' : 'Duyệt')}
                </button>

                {filter === 'PENDING' && (
                  <button
                    onClick={() => handleAction(biz.id, 'DENIED')}
                    disabled={actionLoading === biz.id}
                    className="flex-1 py-2.5 bg-white border border-red-100 text-red-600 rounded-xl text-xs font-black hover:bg-red-50 transition-all active:scale-95 flex items-center justify-center disabled:opacity-50"
                  >
                    {actionLoading === biz.id ? <i className="fas fa-spinner animate-spin"></i> : 'Từ chối'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredBusinesses.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${filter === 'REJECTED' ? 'bg-red-50' : 'bg-green-50'}`}>
              <i className={`fas ${filter === 'REJECTED' ? 'fa-ban text-red-500' : 'fa-check-circle text-green-500'} text-2xl`}></i>
            </div>
            <p className="text-slate-500 font-black">{filter === 'REJECTED' ? 'Không có doanh nghiệp bị từ chối.' : 'Tất cả doanh nghiệp đã được xử lý xong.'}</p>
          </div>
        )}
      </div>

      {/* Modal Chi tiết Doanh nghiệp */}
      {selectedBiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-8 text-white relative">
              <button
                onClick={() => setSelectedBiz(null)}
                className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-all"
              >
                <i className="fas fa-times"></i>
              </button>
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-indigo-600 text-3xl font-black shadow-xl overflow-hidden">
                  {selectedBiz.logo || selectedBiz.avatar ? (
                    <img src={getImageUrl(selectedBiz.logo || selectedBiz.avatar, getInitialsAvatar(selectedBiz.name))} alt={selectedBiz.name} className="w-full h-full object-cover" />
                  ) : (
                    selectedBiz.name?.charAt(0)
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight">{selectedBiz.name}</h2>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="bg-white/20 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest leading-none block">{selectedBiz.industry}</span>
                    <span className="flex items-center gap-1 text-amber-300 font-black text-xs">
                      <i className="fas fa-star"></i> {selectedBiz.rating || '0.0'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Thông tin pháp lý</label>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-500 text-nowrap mr-4">Mã số thuế:</span>
                      <span className="text-xs font-black text-slate-800">{selectedBiz.taxCode || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-500">Quy mô:</span>
                      <span className="text-xs font-black text-slate-800">{selectedBiz.scale || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-500">Năm thành lập:</span>
                      <span className="text-xs font-black text-slate-800">{selectedBiz.established || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Liên hệ</label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                        <i className="fas fa-globe text-indigo-500 text-[10px]"></i>
                      </div>
                      {selectedBiz.website || 'N/A'}
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                        <i className="fas fa-envelope text-indigo-500 text-[10px]"></i>
                      </div>
                      {selectedBiz.email || 'N/A'}
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-700 leading-relaxed">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                        <i className="fas fa-location-dot text-indigo-500 text-[10px]"></i>
                      </div>
                      {selectedBiz.location || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Mô tả doanh nghiệp</label>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">{selectedBiz.description || 'Không có mô tả chi tiết từ doanh nghiệp.'}</p>
                  </div>
                </div>

                <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 border-dashed">
                  <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <i className="fas fa-circle-info"></i> Lưu ý đối soát
                  </h4>
                  <ul className="text-[11px] font-bold text-amber-800/80 space-y-2 leading-relaxed">
                    <li className="flex gap-2"><span>•</span> <span>Kiểm tra kỹ thông tin MST và GPKD trên hệ thống quốc gia.</span></li>
                    <li className="flex gap-2"><span>•</span> <span>Đối chiếu tên công ty và địa chỉ trụ sở chính.</span></li>
                    <li className="flex gap-2"><span>•</span> <span>Xác thực độ tin cậy của website doanh nghiệp.</span></li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
              <button
                onClick={() => handleAction(selectedBiz.id, 'VERIFIED')}
                disabled={actionLoading === selectedBiz.id}
                className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-green-100 hover:bg-green-700 transition-all active:scale-95 flex items-center justify-center disabled:opacity-50"
              >
                {actionLoading === selectedBiz.id ? <i className="fas fa-spinner animate-spin"></i> : 'Xác nhận & Cấp huy hiệu'}
              </button>
              <button
                onClick={() => handleAction(selectedBiz.id, 'DENIED')}
                disabled={actionLoading === selectedBiz.id}
                className="flex-1 py-4 bg-white border border-red-200 text-red-600 rounded-2xl font-black text-sm hover:bg-red-50 transition-all active:scale-95 flex items-center justify-center disabled:opacity-50"
              >
                {actionLoading === selectedBiz.id ? <i className="fas fa-spinner animate-spin"></i> : 'Từ chối yêu cầu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessVerification;
