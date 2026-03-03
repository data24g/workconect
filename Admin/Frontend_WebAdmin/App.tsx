
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BusinessVerification from './pages/BusinessVerification';
import IdentityVerification from './pages/IdentityVerification';
import UserManagement from './pages/UserManagement';
import ApplicantManagement from './pages/ApplicantManagement';
import BusinessManagement from './pages/BusinessManagement';
import NewsManagement from './pages/NewsManagement';
import ReviewModeration from './pages/ReviewModeration';
import JobModeration from './pages/JobModeration';
import SystemLogs from './pages/SystemLogs';
import SessionDisputes from './pages/SessionDisputes';
import ReportManagement from './pages/ReportManagement';
import Monetization from './pages/Monetization';
import SystemSettings from './pages/SystemSettings';
import JobManagement from './pages/JobManagement';

const PlaceholderPage: React.FC<{ name: string }> = ({ name }) => (
  <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center shadow-sm max-w-2xl mx-auto mt-10">
    <div className="bg-indigo-50 w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-inner">
      <i className="fas fa-hammer text-indigo-600 text-3xl"></i>
    </div>
    <h2 className="text-2xl font-black mb-3 text-slate-800 tracking-tight">{name}</h2>
    <p className="text-slate-500 font-medium mb-8 leading-relaxed">Module này thuộc phiên bản 2.0. Hiện tại dữ liệu đang được đồng bộ hóa từ máy chủ chính.</p>
    <button className="px-8 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-100 transition-all active:scale-95">Quay lại Dashboard</button>
  </div>
);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="audit" element={<SystemLogs />} />
          <Route path="applicants" element={<ApplicantManagement />} />
          <Route path="businesses" element={<BusinessManagement />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="verify" element={<BusinessVerification />} />
          <Route path="identity" element={<IdentityVerification />} />
          <Route path="jobs" element={<JobManagement />} />
          <Route path="news" element={<NewsManagement />} />
          <Route path="reports" element={<ReportManagement />} />

          {/* Full Version Routes */}
          <Route path="sessions" element={<SessionDisputes />} />
          <Route path="reviews" element={<ReviewModeration />} />
          <Route path="monetization" element={<Monetization />} />
          <Route path="fraud" element={<PlaceholderPage name="Chống gian lận & Hành vi" />} />
          <Route path="badges" element={<PlaceholderPage name="Hệ thống Huy hiệu & Trust" />} />
          <Route path="settings" element={<SystemSettings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
};

export default App;
