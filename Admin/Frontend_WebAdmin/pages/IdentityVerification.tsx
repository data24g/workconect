import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';
import { UserVerification } from '../types';
import { getImageUrl, getInitialsAvatar, getPlaceholderImage } from '../utils/imageUtils';

const IdentityVerification: React.FC = () => {
  const [users, setUsers] = useState<UserVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserVerification | null>(null);
  const [selectedUserDetails, setSelectedUserDetails] = useState<UserVerification | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Lấy danh sách user chờ xác thực từ API đúng
      let pendingUsers = await adminApi.identityVerification.getPending();
      
      // Nếu API trả về wrapped response, unwrap nó
      if (pendingUsers && pendingUsers.data) {
        pendingUsers = pendingUsers.data;
      }
      
      // Nếu không có API riêng, fallback lấy tất cả và lọc
      if (!pendingUsers || !Array.isArray(pendingUsers)) {
        const allUsers = await adminApi.users.getAll();
        pendingUsers = allUsers.filter((u: any) => {
          const status = u.verificationStatus || 'NONE';
          return status === 'PENDING' || status === 'PENDING_APPROVAL';
        });
      }

      // Lọc theo tab
      let filtered = pendingUsers;
      if (filter !== 'PENDING') {
        filtered = filtered.filter((u: any) => 
          (u.verificationStatus || '').toUpperCase() === filter
        );
      }

      // Lọc theo search
      if (searchTerm) {
        filtered = filtered.filter((u: any) =>
          (u.fullName || u.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setUsers(filtered);
    } catch (error) {
      console.error('Error fetching users:', error);
      // Fallback: thử lấy tất cả users
      try {
        const allUsers = await adminApi.users.getAll();
        const filtered = allUsers.filter((u: any) => 
          (u.verificationStatus || 'NONE').toUpperCase() !== 'NONE'
        );
        setUsers(filtered);
      } catch (e) {
        console.error('Fallback also failed:', e);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch user details when clicking to view
  const handleViewUser = async (user: UserVerification) => {
    setSelectedUser(user);
    setSelectedUserDetails(null);
    try {
      const details = await adminApi.identityVerification.getById(user.id);
      setSelectedUserDetails(details);
    } catch (error) {
      console.error('Error fetching user details:', error);
      // Use the user data from list if API fails
      setSelectedUserDetails(user);
    }
  };

  // Merge selected user data with details (details take priority)
  const getDisplayUser = () => {
    if (!selectedUser) return null;
    return selectedUserDetails || selectedUser;
  };

  // Initial fetch
  useEffect(() => {
    fetchUsers();
  }, [filter, searchTerm]);

  const handleApprove = async (userId: string) => {
    if (!userId) return;
    if (!confirm('Xác nhận duyệt xác thực danh tính cho user này?')) return;
    
    setActionLoading(userId);
    try {
      await adminApi.identityVerification.approve(userId);
      alert('Đã duyệt xác thực thành công!');
      fetchUsers();
      setSelectedUser(null);
      setSelectedUserDetails(null);
    } catch (error) {
      console.error('Error approving:', error);
      alert('Lỗi khi duyệt xác thực');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId: string) => {
    if (!userId) return;
    const reason = prompt('Nhập lý do từ chối:');
    if (!reason) return;

    setActionLoading(userId);
    try {
      await adminApi.identityVerification.reject(userId, reason);
      alert('Đã từ chối xác thực!');
      fetchUsers();
      setSelectedUser(null);
      setSelectedUserDetails(null);
    } catch (error) {
      console.error('Error rejecting:', error);
      alert('Lỗi khi từ chối xác thực');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-amber-50 text-amber-600 ring-1 ring-amber-100">Chờ duyệt</span>;
      case 'APPROVED':
      case 'VERIFIED':
        return <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-green-50 text-green-600 ring-1 ring-green-100">Đã duyệt</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-red-50 text-red-600 ring-1 ring-red-100">Đã từ chối</span>;
      default:
        return <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-gray-50 text-gray-500 ring-1 ring-gray-100">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Xác thực danh tính (CCCD)</h1>
          <p className="text-sm text-slate-500 font-medium">Xác minh CCCD/CMND của người dùng để cấp dấu tích xác minh.</p>
        </div>

        <div className="relative">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input
            type="text"
            placeholder="Tìm theo tên, email..."
            className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl w-80 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
        {['PENDING', 'APPROVED', 'REJECTED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab as any)}
            className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${filter === tab
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            {tab === 'PENDING' ? 'Chờ duyệt' : 
             tab === 'APPROVED' ? 'Đã duyệt' : 'Đã từ chối'}
          </button>
        ))}
      </div>

      {/* User List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Người dùng</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vai trò</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Số điện thoại</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái CCCD</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngày gửi</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">Đang tải dữ liệu...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">Không có người dùng nào.</td></tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={getImageUrl(user.avatar, getInitialsAvatar(user.fullName || user.username || 'User'))} 
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                      <div>
                        <div className="text-sm font-bold text-slate-800">{user.fullName || user.username}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase ${
                      user.role === 'BUSINESS' || user.role === 'EMPLOYER' 
                        ? 'bg-purple-50 text-purple-600' 
                        : 'bg-blue-50 text-blue-600'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-600">
                    {user.phone || 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(user.verificationStatus || 'NONE')}
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-500">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleViewUser(user)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        title="Xem chi tiết"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      
                      {filter === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleApprove(user.id)}
                            disabled={actionLoading === user.id}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all disabled:opacity-50"
                            title="Duyệt"
                          >
                            {actionLoading === user.id ? <i className="fas fa-spinner animate-spin"></i> : <i className="fas fa-check"></i>}
                          </button>
                          <button
                            onClick={() => handleReject(user.id)}
                            disabled={actionLoading === user.id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                            title="Từ chối"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedUser && getDisplayUser() && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
            {/* Header - Similar to client page style */}
            <div className="bg-gradient-to-r from-[#4c42bd] to-[#6c5ce7] p-8 text-white relative">
              <button
                onClick={() => setSelectedUser(null)}
                className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-all"
              >
                <i className="fas fa-times"></i>
              </button>
              <div className="flex items-center gap-6">
                <img 
                  src={getImageUrl(getDisplayUser()?.avatar, getInitialsAvatar(getDisplayUser()?.fullName || getDisplayUser()?.username || 'User'))} 
                  className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-xl"
                />
                <div>
                  <h2 className="text-2xl font-black tracking-tight">{getDisplayUser()?.fullName || getDisplayUser()?.username}</h2>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="bg-white/20 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest leading-none block">
                      {getDisplayUser()?.role || 'USER'}
                    </span>
                    {getStatusBadge(getDisplayUser()?.verificationStatus || 'NONE')}
                    {getDisplayUser()?.verified && (
                      <span className="px-2 py-1 rounded-lg text-[10px] font-black uppercase bg-blue-500 text-white flex items-center gap-1">
                        <i className="fas fa-check-circle"></i> Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8">
              {/* Verification Status Badges */}
              <div className="mb-6 flex flex-wrap gap-3">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold ${getDisplayUser()?.emailVerified ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                  <i className={`fas ${getDisplayUser()?.emailVerified ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                  Email: {getDisplayUser()?.emailVerified ? 'Đã xác minh' : 'Chưa xác minh'}
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold ${getDisplayUser()?.phoneVerified ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                  <i className={`fas ${getDisplayUser()?.phoneVerified ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                  SĐT: {getDisplayUser()?.phoneVerified ? 'Đã xác minh' : 'Chưa xác minh'}
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold ${getDisplayUser()?.idCardVerified ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                  <i className={`fas ${getDisplayUser()?.idCardVerified ? 'fa-check-circle' : 'fa-clock'}`}></i>
                  CCCD: {getDisplayUser()?.idCardVerified ? 'Đã xác minh' : 'Chờ xác minh'}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Personal Info */}
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <i className="fas fa-user text-[#4c42bd]"></i> Thông tin cá nhân
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-500">Email:</span>
                        <span className="text-xs font-black text-slate-800">{getDisplayUser()?.email || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-500">Số điện thoại:</span>
                        <span className="text-xs font-black text-slate-800">{getDisplayUser()?.phone || 'Chưa cung cấp'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-500">Họ tên:</span>
                        <span className="text-xs font-black text-slate-800">{getDisplayUser()?.fullName || 'Chưa cung cấp'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-500">ID:</span>
                        <span className="text-xs font-mono text-slate-600">{getDisplayUser()?.id || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Business Info - Only show for BUSINESS/EMPLOYER roles */}
                  {(getDisplayUser()?.role === 'BUSINESS' || getDisplayUser()?.role === 'EMPLOYER') && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <i className="fas fa-building text-[#4c42bd]"></i> Thông tin doanh nghiệp
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                          <span className="text-xs font-bold text-slate-500">Tên công ty:</span>
                          <span className="text-xs font-black text-slate-800">{getDisplayUser()?.companyName || 'Chưa cung cấp'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                          <span className="text-xs font-bold text-slate-500">Mã số thuế (MST):</span>
                          <span className="text-xs font-mono font-black text-slate-800">{getDisplayUser()?.taxCode || 'Chưa cung cấp'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                          <span className="text-xs font-bold text-slate-500">Mã ĐKKD:</span>
                          <span className="text-xs font-mono font-black text-slate-800">{getDisplayUser()?.businessRegistrationCode || 'Chưa cung cấp'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                          <span className="text-xs font-bold text-slate-500">Người đại diện:</span>
                          <span className="text-xs font-black text-slate-800">{getDisplayUser()?.legalRepresentative || 'Chưa cung cấp'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-xs font-bold text-slate-500">Website:</span>
                          <span className="text-xs font-black text-slate-800">{getDisplayUser()?.website || 'Chưa cung cấp'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - CCCD Documents */}
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <i className="fas fa-id-card text-[#4c42bd]"></i> Giấy tờ CCCD/CMND
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Front of CCCD */}
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                        {getDisplayUser()?.idCardFrontImage ? (
                          <img src={getImageUrl(getDisplayUser()?.idCardFrontImage)} alt="CCCD mặt trước" className="w-full h-32 object-cover rounded-xl mb-2" />
                        ) : (
                          <>
                            <i className="fas fa-id-card text-3xl text-slate-300 mb-2"></i>
                            <p className="text-xs font-bold text-slate-500">Mặt trước CCCD</p>
                            <p className="text-[10px] text-slate-400 mt-1">Chưa có ảnh</p>
                          </>
                        )}
                      </div>
                      {/* Back of CCCD */}
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                        {getDisplayUser()?.idCardBackImage ? (
                          <img src={getImageUrl(getDisplayUser()?.idCardBackImage)} alt="CCCD mặt sau" className="w-full h-32 object-cover rounded-xl mb-2" />
                        ) : (
                          <>
                            <i className="fas fa-id-card text-3xl text-slate-300 mb-2"></i>
                            <p className="text-xs font-bold text-slate-500">Mặt sau CCCD</p>
                            <p className="text-[10px] text-slate-400 mt-1">Chưa có ảnh</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Notes Section */}
                  <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100">
                    <h4 className="text-xs font-black text-amber-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <i className="fas fa-info-circle"></i> Lưu ý kiểm tra
                    </h4>
                    <ul className="text-xs font-bold text-amber-800/80 space-y-2 leading-relaxed">
                      <li className="flex gap-2"><span className="text-amber-500">•</span> <span>Kiểm tra thông tin CCCD với cơ quan quản lý</span></li>
                      <li className="flex gap-2"><span className="text-amber-500">•</span> <span>Đối chiếu ảnh chân dung với ảnh CCCD</span></li>
                      <li className="flex gap-2"><span className="text-amber-500">•</span> <span>Xác minh thông tin tuổi, họ tên</span></li>
                      <li className="flex gap-2"><span className="text-amber-500">•</span> <span>Kiểm tra giấy tờ còn hạn sử dụng</span></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {filter === 'PENDING' && (
              <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
                <button
                  onClick={() => handleApprove(getDisplayUser()?.id || '')}
                  disabled={actionLoading === getDisplayUser()?.id}
                  className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-green-100 hover:bg-green-700 transition-all active:scale-95 flex items-center justify-center disabled:opacity-50"
                >
                  {actionLoading === getDisplayUser()?.id ? <i className="fas fa-spinner animate-spin"></i> : '✓ Duyệt xác thực'}
                </button>
                <button
                  onClick={() => handleReject(getDisplayUser()?.id || '')}
                  disabled={actionLoading === getDisplayUser()?.id}
                  className="flex-1 py-4 bg-white border border-red-200 text-red-600 rounded-2xl font-black text-sm hover:bg-red-50 transition-all active:scale-95 flex items-center justify-center disabled:opacity-50"
                >
                  {actionLoading === getDisplayUser()?.id ? <i className="fas fa-spinner animate-spin"></i> : '✕ Từ chối'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default IdentityVerification;

