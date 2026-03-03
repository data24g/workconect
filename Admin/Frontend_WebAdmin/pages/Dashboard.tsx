// admin-web/src/pages/Dashboard.tsx
import { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { adminApi } from '../services/adminApi';
import { DashboardStats } from '../types';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Sử dụng API stats chuyên dụng của Backend
        const dashboardStats = await adminApi.stats.getDashboard();
        setStats(dashboardStats);
      } catch (error) {
        console.error("Lỗi kết nối Backend:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Mock data for charts
  const weeklyData = [
    { week: 'Week 01', jobs: 45, users: 23, applications: 67 },
    { week: 'Week 02', jobs: 52, users: 31, applications: 78 },
    { week: 'Week 03', jobs: 48, users: 28, applications: 71 },
    { week: 'Week 04', jobs: 61, users: 35, applications: 89 },
    { week: 'Week 05', jobs: 55, users: 42, applications: 95 },
    { week: 'Week 06', jobs: 58, users: 38, applications: 83 },
  ];

  const recentActivities = [
    { id: 1, type: 'verification', message: 'Doanh nghiệp TechCorp đã được duyệt', time: '5 phút trước', icon: 'fa-building-circle-check', color: 'text-green-600', bg: 'bg-green-50' },
    { id: 2, type: 'job', message: '3 việc làm mới được đăng', time: '12 phút trước', icon: 'fa-briefcase', color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 3, type: 'report', message: 'Báo cáo vi phạm #1234 cần xử lý', time: '28 phút trước', icon: 'fa-flag', color: 'text-red-600', bg: 'bg-red-50' },
    { id: 4, type: 'user', message: '15 người dùng mới đăng ký', time: '1 giờ trước', icon: 'fa-users', color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
        <i className="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
        <p className="text-red-600 font-semibold">Lỗi không tải được dữ liệu Server</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-800">Dashboard</h1>
          <p className="text-gray-500 mt-1">Chào mừng trở lại! Đây là tổng quan hệ thống của bạn.</p>
        </div>
        <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold shadow-lg shadow-purple-200 transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
          <i className="fas fa-download"></i>
          Xuất báo cáo
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card: Profile Viewed */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-700 p-6 rounded-2xl shadow-xl text-white card-hover relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-8 -mt-8"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                <i className="fas fa-users text-2xl"></i>
              </div>
            </div>
            <div className="text-sm font-medium opacity-90 mb-1">Tổng người dùng</div>
            <div className="text-4xl font-black mb-2">{stats.totalUsers.toLocaleString()}</div>
            <div className="text-xs opacity-75">Workers: {stats.totalWorkers} | Employers: {stats.totalEmployers}</div>
          </div>
        </div>

        {/* Card: Application Sent */}
        <div className="bg-gradient-to-br from-cyan-400 to-blue-500 p-6 rounded-2xl shadow-xl text-white card-hover relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-8 -mt-8"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                <i className="fas fa-briefcase text-2xl"></i>
              </div>
            </div>
            <div className="text-sm font-medium opacity-90 mb-1">Việc làm đang chạy</div>
            <div className="text-4xl font-black mb-2">{stats.activeJobs.toLocaleString()}</div>
            <div className="text-xs opacity-75 flex items-center gap-1">
              <i className="fas fa-arrow-up"></i>
              <span>+12% so với tháng trước</span>
            </div>
          </div>
        </div>

        {/* Card: Pending Verification */}
        <div className="bg-gradient-to-br from-green-400 to-emerald-600 p-6 rounded-2xl shadow-xl text-white card-hover relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-8 -mt-8"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                <i className="fas fa-building-circle-check text-2xl"></i>
              </div>
            </div>
            <div className="text-sm font-medium opacity-90 mb-1">Chờ duyệt</div>
            <div className="text-4xl font-black mb-2">{stats.pendingVerifications.toLocaleString()}</div>
            <div className="text-xs opacity-75">Doanh nghiệp cần xác minh</div>
          </div>
        </div>

        {/* Card: Reports */}
        <div className="bg-gradient-to-br from-orange-400 to-pink-500 p-6 rounded-2xl shadow-xl text-white card-hover relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-8 -mt-8"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                <i className="fas fa-flag text-2xl"></i>
              </div>
            </div>
            <div className="text-sm font-medium opacity-90 mb-1">Báo cáo vi phạm</div>
            <div className="text-4xl font-black mb-2">{stats.openReports.toLocaleString()}</div>
            <div className="text-xs opacity-75">/{stats.totalReports} tổng báo cáo</div>
          </div>
        </div>
      </div>

      {/* Charts & Activities Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Stats Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Thống kê theo tuần</h2>
              <p className="text-sm text-gray-500 mt-1">Tổng quan hoạt động 6 tuần gần đây</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-xs font-semibold text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                Week
              </button>
              <button className="px-3 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-50 rounded-lg transition-colors">
                Month
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="week" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="jobs" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 5 }} />
              <Line type="monotone" dataKey="users" stroke="#06b6d4" strokeWidth={3} dot={{ fill: '#06b6d4', r: 5 }} />
              <Line type="monotone" dataKey="applications" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Hoạt động gần đây</h2>
          <div className="space-y-4">
            {recentActivities.map(activity => (
              <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer">
                <div className={`${activity.bg} ${activity.color} w-10 h-10 rounded-xl flex items-center justify-center shrink-0`}>
                  <i className={`fas ${activity.icon}`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 leading-snug">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2.5 text-sm font-semibold text-purple-600 hover:bg-purple-50 rounded-xl transition-colors">
            Xem tất cả hoạt động →
          </button>
        </div>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* System Health */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Tình trạng hệ thống</h3>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse-slow"></div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Server Status</span>
              <span className="text-sm font-bold text-green-600">Online</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database</span>
              <span className="text-sm font-bold text-green-600">Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">API Response</span>
              <span className="text-sm font-bold text-blue-600">125ms</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Thao tác nhanh</h3>
          <div className="space-y-2">
            <button className="w-full px-4 py-2.5 bg-purple-50 text-purple-600 rounded-xl font-semibold text-sm hover:bg-purple-100 transition-colors flex items-center gap-2">
              <i className="fas fa-plus"></i>
              Tạo thông báo
            </button>
            <button className="w-full px-4 py-2.5 bg-blue-50 text-blue-600 rounded-xl font-semibold text-sm hover:bg-blue-100 transition-colors flex items-center gap-2">
              <i className="fas fa-user-plus"></i>
              Thêm admin
            </button>
            <button className="w-full px-4 py-2.5 bg-green-50 text-green-600 rounded-xl font-semibold text-sm hover:bg-green-100 transition-colors flex items-center gap-2">
              <i className="fas fa-sync"></i>
              Đồng bộ dữ liệu
            </button>
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Danh mục phổ biến</h3>
          <div className="space-y-3">
            {[
              { name: 'IT & Technology', count: 45, color: 'bg-purple-500' },
              { name: 'Marketing', count: 32, color: 'bg-blue-500' },
              { name: 'Design', count: 28, color: 'bg-green-500' },
              { name: 'Business', count: 21, color: 'bg-orange-500' }
            ].map((category, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className={`w-2 h-2 ${category.color} rounded-full`}></div>
                <span className="text-sm text-gray-700 flex-1">{category.name}</span>
                <span className="text-sm font-bold text-gray-800">{category.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}