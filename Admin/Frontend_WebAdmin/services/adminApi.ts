// Admin Web - API Service for Java Spring Boot Backend
import axios from 'axios';
import { User, Job } from '../types';

// ============================================
// ⚙️ AXIOS CONFIGURATION
// ============================================
// Java Spring Boot Backend chạy trên port 8080
const API_BASE = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8086/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ⚠️ SESSION-ONLY MODE: Token chỉ tồn tại trong tab hiện tại
// Khi refresh page hoặc đóng tab → mất session, phải login lại

// Interceptor để tự động thêm JWT token vào header (nếu có)
API_BASE.interceptors.request.use((config) => {
  // 🔒 Lấy token từ sessionStorage thay vì localStorage
  const token = sessionStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor để handle 401/403 errors
API_BASE.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401 or 403, clear session and redirect to login
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.error('🔒 Authentication failed, clearing session');
      sessionStorage.removeItem('admin_token');
      sessionStorage.removeItem('admin_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================
// 📦 API SERVICE
// ============================================
export const adminApi = {

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🔐 1. AUTHENTICATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  auth: {
    // Đăng nhập Admin
    adminLogin: async (identifier: string, password: string) => {
      const res = await API_BASE.post('/auth/admin-login', { identifier, password });
      return res.data; // { token, type, user }
    },

    // Lấy thông tin admin hiện tại
    getCurrentAdmin: async () => {
      const res = await API_BASE.get('/auth/me');
      return res.data;
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 👥 2. USER MANAGEMENT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  users: {
    // Lấy tất cả users
    getAll: async () => {
      const res = await API_BASE.get('/admin/users');
      return res.data.data || res.data; // Unwrap if needed
    },

    // Cập nhật thông tin user
    updateUser: async (userId: string, updates: any) => {
      const res = await API_BASE.put(`/admin/users/${userId}`, updates);
      return res.data.data || res.data;
    },

    // Cảnh báo user
    warnUser: async (userId: string) => {
      const res = await API_BASE.put(`/admin/users/${userId}/warn`);
      return res.data;
    },

    // Vô hiệu hóa user
    disableUser: async (userId: string) => {
      const res = await API_BASE.put(`/admin/users/${userId}/disable`);
      return res.data;
    },

    // Kích hoạt lại user
    activateUser: async (userId: string) => {
      const res = await API_BASE.put(`/admin/users/${userId}/activate`);
      return res.data;
    },

    // Cấm (ban) user
    banUser: async (userId: string) => {
      const res = await API_BASE.put(`/admin/users/${userId}/ban`);
      return res.data;
    },

    // Lấy chi tiết người ứng tuyển (Worker)
    getWorkerProfile: async (userId: string) => {
      const res = await API_BASE.get(`/admin/users/${userId}/worker-profile`);
      return res.data.data || res.data;
    },

    // Lấy hoạt động của user
    getActivities: async (userId: string) => {
      const res = await API_BASE.get(`/admin/users/${userId}/activities`);
      return res.data.data || res.data;
    }
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🏢 3. BUSINESS MANAGEMENT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  businesses: {
    // Lấy tất cả doanh nghiệp (từ Users với role BUSINESS)
    getAll: async () => {
      const res = await API_BASE.get('/admin/businesses');
      return res.data.data || res.data; // Unwrap if wrapped
    },

    // Lấy chi tiết 1 doanh nghiệp (KYC + Jobs + Activities)
    getById: async (businessId: string) => {
      const res = await API_BASE.get(`/admin/businesses/${businessId}/kyc`);
      return res.data.data || res.data;
    },

    // Duyệt hoặc Từ chối doanh nghiệp
    verify: async (businessId: string, status: 'VERIFIED' | 'REJECTED' | 'DENIED' | 'UNVERIFY', reason?: string) => {
      // Backend AdminBusinessController.java expects:
      // @PostMapping("/{id}/verify")
      // @RequestBody Map<String, String> request { status, reason }
      const res = await API_BASE.post(`/admin/businesses/${businessId}/verify`, {
        status,
        reason
      });
      return res.data;
    },

    // Hủy xác thực doanh nghiệp
    unverify: async (businessId: string, reason?: string) => {
      const res = await API_BASE.post(`/admin/businesses/${businessId}/verify`, {
        status: 'UNVERIFY',
        reason
      });
      return res.data.data || res.data; // Unwrap if wrapped, same as getById
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 💼 4. JOB MANAGEMENT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  jobs: {
    // Lấy tất cả công việc
    getAll: async (): Promise<Job[]> => {
      const res = await API_BASE.get('/admin/jobs');
      return res.data.data || res.data;
    },

    // Lấy chi tiết công việc
    getById: async (jobId: string) => {
      const res = await API_BASE.get(`/admin/jobs/${jobId}`);
      return res.data.data || res.data;
    },

    // Lấy công việc theo business
    getByBusiness: async (businessId: string) => {
      const res = await API_BASE.get(`/admin/jobs/business/${businessId}`);
      return res.data.data || res.data;
    },

    // Cập nhật công việc
    update: async (jobId: string, jobData: any) => {
      const res = await API_BASE.put(`/admin/jobs/${jobId}`, jobData);
      return res.data.data || res.data;
    },

    // Cập nhật trạng thái công việc
    updateStatus: async (jobId: string, status: string) => {
      const res = await API_BASE.put(`/admin/jobs/${jobId}/status`, null, {
        params: { status }
      });
      return res.data.data || res.data;
    },

    // Xóa công việc
    delete: async (jobId: string) => {
      const res = await API_BASE.delete(`/admin/jobs/${jobId}`);
      return res.data.data || res.data;
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📊 5. STATS & DASHBOARD
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  stats: {
    // Lấy thống kê tổng quan (Dashboard)
    getDashboard: async () => {
      const res = await API_BASE.get('/admin/stats/dashboard');
      return res.data;
    },

    // Lấy thống kê doanh thu/tăng trưởng
    getRevenue: async (months: number = 12) => {
      const res = await API_BASE.get('/admin/stats/revenue', {
        params: { months }
      });
      return res.data;
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📝 5. WORK SESSION MANAGEMENT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  workSessions: {
    // Lấy tất cả phiên làm việc
    getAll: async () => {
      const res = await API_BASE.get('/admin/work-sessions');
      return res.data.data || res.data;
    },

    // Lấy chi tiết phiên
    getById: async (sessionId: string) => {
      const res = await API_BASE.get(`/admin/work-sessions/${sessionId}`);
      return res.data.data || res.data;
    },

    // Lấy số lượng phiên
    getCount: async () => {
      const res = await API_BASE.get('/admin/work-sessions/count');
      return res.data.data || res.data;
    },

    // Lấy phiên theo công việc (quan trọng cho admin)
    getByJob: async (jobId: string) => {
      const res = await API_BASE.get(`/admin/work-sessions/job/${jobId}`);
      return res.data.data || res.data;
    },

    // Lấy phiên theo worker
    getByWorker: async (workerId: string) => {
      const res = await API_BASE.get(`/admin/work-sessions/worker/${workerId}`);
      return res.data.data || res.data;
    },

    // Lấy phiên theo business
    getByBusiness: async (businessId: string) => {
      const res = await API_BASE.get(`/admin/work-sessions/business/${businessId}`);
      return res.data.data || res.data;
    },

    // Cập nhật phiên
    update: async (sessionId: string, updates: any) => {
      const res = await API_BASE.put(`/admin/work-sessions/${sessionId}`, updates);
      return res.data.data || res.data;
    },

    // Cập nhật trạng thái
    updateStatus: async (sessionId: string, status: string, reason?: string) => {
      const res = await API_BASE.put(`/admin/work-sessions/${sessionId}/status`, null, {
        params: { status, reason }
      });
      return res.data.data || res.data;
    },

    // Xóa phiên
    delete: async (sessionId: string) => {
      const res = await API_BASE.delete(`/admin/work-sessions/${sessionId}`);
      return res.data.data || res.data;
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ⭐ 6. REVIEW MANAGEMENT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  reviews: {
    // Lấy tất cả đánh giá (chỉ admin)
    getAll: async () => {
      const res = await API_BASE.get('/admin/reviews');
      return res.data.data || res.data;
    },

    // Lấy đánh giá về 1 user
    getByUser: async (userId: string) => {
      const res = await API_BASE.get(`/admin/reviews/user/${userId}`);
      return res.data.data || res.data;
    },

    // Lấy đánh giá do 1 user viết
    getByAuthor: async (userId: string) => {
      const res = await API_BASE.get(`/admin/reviews/from/${userId}`);
      return res.data.data || res.data;
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🚨 7. REPORT MANAGEMENT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  reports: {
    // Lấy tất cả báo cáo (chỉ admin)
    getAll: async () => {
      const res = await API_BASE.get('/reports'); // Fixed: was /admin/reports
      return res.data.data || res.data;
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📰 8. ARTICLE/NEWS MANAGEMENT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  articles: {
    // Lấy tất cả bài viết
    getAll: async () => {
      const res = await API_BASE.get('/admin/news');
      return res.data.data || res.data;
    },

    // Lấy chi tiết bài viết
    getById: async (articleId: string) => {
      const res = await API_BASE.get(`/admin/news/${articleId}`);
      return res.data.data || res.data;
    },

    // Lấy bài viết theo menu
    getByMenu: async (menu: string) => {
      const res = await API_BASE.get('/admin/news/byMenu', {
        params: { menu }
      });
      return res.data.data || res.data;
    },

    // Tạo bài viết mới
    create: async (articleData: any) => {
      const res = await API_BASE.post('/admin/news', articleData);
      return res.data.data || res.data;
    },

    // Cập nhật bài viết
    update: async (articleId: string, articleData: any) => {
      const res = await API_BASE.put(`/admin/news/${articleId}`, articleData);
      return res.data.data || res.data;
    },

    // Xóa bài viết
    delete: async (articleId: string) => {
      const res = await API_BASE.delete(`/admin/news/${articleId}`);
      return res.data.data || res.data;
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🎨 9. BANNER MANAGEMENT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  banners: {
    // Lấy tất cả banner
    getAll: async () => {
      const res = await API_BASE.get('/admin/banners');
      return res.data.data || res.data;
    },

    // Lấy chi tiết banner
    getById: async (bannerId: string) => {
      const res = await API_BASE.get(`/admin/banners/${bannerId}`);
      return res.data.data || res.data;
    },

    // Lấy banner theo menu
    getByMenu: async (menu: string) => {
      const res = await API_BASE.get('/admin/banners/byMenu', {
        params: { menu }
      });
      return res.data.data || res.data;
    },

    // Tạo banner mới
    create: async (bannerData: any) => {
      const res = await API_BASE.post('/admin/banners', bannerData);
      return res.data.data || res.data;
    },

    // Cập nhật banner
    update: async (bannerId: string, bannerData: any) => {
      const res = await API_BASE.put(`/admin/banners/${bannerId}`, bannerData);
      return res.data.data || res.data;
    },

    // Xóa banner
    delete: async (bannerId: string) => {
      const res = await API_BASE.delete(`/admin/banners/${bannerId}`);
      return res.data.data || res.data;
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📜 10. ACTIVITY/AUDIT LOGS MANAGEMENT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  activities: {
    // Lấy tất cả hoạt động
    getAll: async () => {
      const res = await API_BASE.get('/admin/audit-logs');
      return res.data.data || res.data;
    },

    // Lấy hoạt động theo user
    getByUser: async (userId: string) => {
      const res = await API_BASE.get(`/admin/audit-logs/user/${userId}`);
      return res.data.data || res.data;
    },

    // Tạo log hoạt động mới
    create: async (activityData: any) => {
      const res = await API_BASE.post('/admin/activities', activityData);
      return res.data.data || res.data;
    },

    // Đếm tổng số hoạt động
    getCount: async () => {
      const res = await API_BASE.get('/admin/activities/count');
      return res.data.data || res.data;
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🔔 11. NOTIFICATION MANAGEMENT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  notifications: {
    // Lấy tất cả thông báo
    getAll: async () => {
      const res = await API_BASE.get('/admin/notifications');
      return res.data.data || res.data;
    },

    // Lấy thông báo chưa đọc
    getUnread: async () => {
      const res = await API_BASE.get('/admin/notifications/unread');
      return res.data.data || res.data;
    },

    // Đếm số lượng thông báo chưa đọc
    getUnreadCount: async () => {
      const res = await API_BASE.get('/admin/notifications/unread/count');
      return res.data.data || res.data;
    },

    // Đánh dấu một thông báo là đã đọc
    markAsRead: async (notificationId: string) => {
      const res = await API_BASE.put(`/admin/notifications/${notificationId}/read`);
      return res.data.data || res.data;
    },

    // Đánh dấu tất cả là đã đọc
    markAllAsRead: async () => {
      const res = await API_BASE.put('/admin/notifications/read-all');
      return res.data.data || res.data;
    },

    // Xóa một thông báo
    delete: async (notificationId: string) => {
      const res = await API_BASE.delete(`/admin/notifications/${notificationId}`);
      return res.data.data || res.data;
    },

    // Xóa tất cả thông báo đã đọc
    deleteAllRead: async () => {
      const res = await API_BASE.delete('/admin/notifications/read');
      return res.data.data || res.data;
    },

    // Tạo thông báo test
    createTest: async () => {
      const res = await API_BASE.post('/admin/notifications/test');
      return res.data.data || res.data;
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🪪 12. IDENTITY VERIFICATION (CCCD)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  identityVerification: {
    // Lấy danh sách user chờ xác thực
    getPending: async () => {
      const res = await API_BASE.get('/admin/verifications/pending');
      return res.data.data || res.data;
    },

    // Lấy chi tiết user theo ID
    getById: async (userId: string) => {
      const res = await API_BASE.get(`/admin/users/${userId}`);
      return res.data.data || res.data;
    },

    // Duyệt xác thực user
    approve: async (userId: string) => {
      const res = await API_BASE.post(`/admin/verifications/${userId}/approve`);
      return res.data;
    },

    // Từ chối xác thực user
    reject: async (userId: string, reason: string) => {
      const res = await API_BASE.post(`/admin/verifications/${userId}/reject`, { reason });
      return res.data;
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🖼️ 11. IMAGE MANAGEMENT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  images: {
    // Upload hình ảnh
    upload: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const res = await API_BASE.post('/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data.data; // Trả về image ID
    },

    // Lấy URL hình ảnh
    getUrl: (imageId: number) => {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://150.95.114.135:8090/api';
      return `${baseUrl}/images/${imageId}`;
    },
  },
};