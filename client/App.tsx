import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import { UserRole } from './types';
import { FollowedCompaniesProvider } from './pages/Companies';

// ... (other imports remain)
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import WorkSessionPage from './pages/WorkSession';
import Companies from './pages/Companies';
import CareerResources from './pages/CareerResources';
import PostJob from './pages/PostJob';
import Premium from './pages/Premium';
import SavedJobs from './pages/SavedJobs';
import MyJobs from './pages/MyJobs';
import Candidates from './pages/Candidates';
import RecruitmentManager from './pages/RecruitmentManager';
import WorkerManager from './pages/WorkerManager';
import Verification from './pages/Verification';
import Settings from './pages/Settings';
import Messages from './pages/Messages';
import FastProcessing from './pages/FastProcessing';
import HelpCenter from './pages/HelpCenter';
import Onboarding from './pages/Onboarding';
import EditProfile from './pages/EditProfile';
import { NotificationProvider } from './contexts/NotificationContext';
import Notifications from './pages/Notifications';
import { SavedProvider } from './contexts/SavedContext';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && user?.isNewUser && location.pathname !== '/onboarding') {
      navigate('/onboarding', { replace: true });
    }
  }, [user, isLoading, location.pathname, navigate]);

  return (
    <Layout>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/resources" element={<CareerResources />} />
        <Route path="/login" element={<Login />} />
        <Route path="/premium" element={<Premium />} />
        <Route path="/help-center" element={<HelpCenter />} />

        {/* Route Fast Processing (Trang xem chi tiết nhanh) */}
        <Route path="/fast-processing/:id" element={<FastProcessing />} />

        {/* Protected Routes - Yêu cầu Login chung */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:userId"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sessions/:id"
          element={
            <ProtectedRoute>
              <WorkSessionPage />
            </ProtectedRoute>
          }
        />

        {/* Tuyển dụng (Dành cho BUSINESS) */}
        <Route
          path="/recruitment"
          element={
            <ProtectedRoute allowedRoles={[UserRole.BUSINESS]}>
              <RecruitmentManager />
            </ProtectedRoute>
          }
        />

        {/* Tìm việc (Dành cho WORKER) */}
        <Route
          path="/worker-manager"
          element={
            <ProtectedRoute allowedRoles={[UserRole.WORKER]}>
              <WorkerManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-jobs"
          element={
            <ProtectedRoute allowedRoles={[UserRole.WORKER]}>
              <MyJobs />
            </ProtectedRoute>
          }
        />

        {/* Tìm ứng viên (Dành cho BUSINESS) */}
        <Route
          path="/candidates"
          element={
            <ProtectedRoute allowedRoles={[UserRole.BUSINESS]}>
              <Candidates />
            </ProtectedRoute>
          }
        />

        {/* Đăng tin & Lưu trữ (Dành cho cả 2 hoặc tùy Role cụ thể trong PostJob) */}
        <Route path="/jobs/post" element={
          <ProtectedRoute>
            <PostJob />
          </ProtectedRoute>
        } />
        <Route path="/jobs/post/:id" element={
          <ProtectedRoute>
            <PostJob />
          </ProtectedRoute>
        } />

        <Route path="/saved-jobs" element={
          <ProtectedRoute>
            <SavedJobs />
          </ProtectedRoute>
        } />

        <Route path="/verification" element={
          <ProtectedRoute>
            <Verification />
          </ProtectedRoute>
        } />

        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />

        <Route path="/onboarding" element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        } />

        <Route path="/edit-profile" element={
          <ProtectedRoute>
            <EditProfile />
          </ProtectedRoute>
        } />

        <Route path="/notifications" element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        } />

        <Route path="/messages" element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        } />

        <Route path="/messages/:id" element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        } />

        {/* 404 Route (Tùy chọn) */}

        <Route path="*" element={<div className="p-10 text-center">Trang không tồn tại</div>} />
      </Routes>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <SavedProvider>
          {/* Bọc thêm FollowedCompaniesProvider để quản lý state theo dõi toàn app */}
          <FollowedCompaniesProvider>
            <ScrollToTop />
            <AppContent />
          </FollowedCompaniesProvider>
        </SavedProvider>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;