// admin-web/src/pages/UserManagement.tsx
import { useEffect, useState } from 'react';
import { adminApi } from '../services/adminApi';
import { User } from '../types';
import { getImageUrl, getInitialsAvatar } from '../utils/imageUtils';

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // Bộ lọc
  const [filterRole, setFilterRole] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Hàm load dữ liệu từ API
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Lấy danh sách users từ API mới
      const allUsers = await adminApi.users.getAll();

      // Convert users sang User format để hiển thị
      const formattedUsers: User[] = allUsers.map((u: any) => ({
        id: u.id,
        name: u.username || u.fullName || 'Không có tên',
        email: u.email || 'N/A',
        role: u.role || 'WORKER',
        status: u.status || 'ACTIVE',
        verified: u.verified || false,
        avatar: u.avatar,
        reportCount: u.reportCount || 0
      }));

      // Filter theo role và search
      let filtered = formattedUsers;

      if (filterRole !== 'ALL') {
        filtered = filtered.filter(u => u.role === filterRole);
      }

      if (searchTerm) {
        filtered = filtered.filter(u =>
          u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setUsers(filtered);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert("Không tải được danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  // Gọi API khi filter hoặc search thay đổi
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300); // Debounce search 300ms
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterRole, searchTerm]);

  // Xử lý hành động Block/Warn/Unlock/Ban
  const handleStatusChange = async (userId: string, action: 'WARN' | 'DISABLE' | 'ACTIVATE' | 'BAN') => {
    const actionNames = {
      WARN: 'Cảnh báo',
      DISABLE: 'Vô hiệu hóa',
      ACTIVATE: 'Kích hoạt',
      BAN: 'Cấm'
    };

    if (!confirm(`Bạn có chắc muốn ${actionNames[action]} người dùng này?`)) return;

    try {
      // Sử dụng API mới
      switch (action) {
        case 'WARN':
          await adminApi.users.warnUser(userId);
          break;
        case 'DISABLE':
          await adminApi.users.disableUser(userId);
          break;
        case 'ACTIVATE':
          await adminApi.users.activateUser(userId);
          break;
        case 'BAN':
          await adminApi.users.banUser(userId);
          break;
      }

      alert(`Đã ${actionNames[action].toLowerCase()} thành công!`);
      fetchUsers(); // Tải lại danh sách sau khi update xong
    } catch (error) {
      console.error('Error updating user status:', error);
      alert("Lỗi cập nhật trạng thái");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Quản lý người dùng</h1>

        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Tìm tên hoặc email..."
            className="px-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 border rounded-lg bg-white"
          >
            <option value="ALL">Tất cả vai trò</option>
            <option value="WORKER">Người tìm việc</option>
            <option value="EMPLOYER">Nhà tuyển dụng</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-600">Người dùng</th>
              <th className="px-6 py-4 font-semibold text-slate-600">Vai trò</th>
              <th className="px-6 py-4 font-semibold text-slate-600">Trạng thái</th>
              <th className="px-6 py-4 font-semibold text-slate-600">Báo cáo</th>
              <th className="px-6 py-4 text-right font-semibold text-slate-600">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={5} className="p-4 text-center">Đang tải...</td></tr>
            ) : users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 group transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center">
                      {user.avatar ? (
                        <img src={getImageUrl(user.avatar, getInitialsAvatar(user.name))} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-indigo-600 font-bold">{user.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">{user.name}</div>
                      <div className="text-sm text-slate-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${String(user.role) === 'EMPLOYER' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      user.status === 'BLOCKED' ? 'bg-red-100 text-red-800' :
                        user.status === 'WARNED' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'}`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {user.reportCount && user.reportCount > 0 ? (
                    <span className="text-red-500 font-bold">{user.reportCount} 🚩</span>
                  ) : (
                    <span className="text-slate-400">0</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Nút Cảnh báo */}
                    <button
                      onClick={() => handleStatusChange(user.id, 'WARN')}
                      title="Cảnh báo"
                      className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all">
                      <i className="fas fa-exclamation-triangle"></i> Warn
                    </button>

                    {/* Nút Block / Unlock */}
                    {user.status === 'BLOCKED' ? (
                      <button
                        onClick={() => handleStatusChange(user.id, 'ACTIVATE')}
                        title="Mở khóa"
                        className="p-2 text-slate-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-all">
                        <i className="fas fa-unlock"></i> Unlock
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStatusChange(user.id, 'DISABLE')}
                        title="Khóa tài khoản"
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                        <i className="fas fa-user-slash"></i> Block
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}