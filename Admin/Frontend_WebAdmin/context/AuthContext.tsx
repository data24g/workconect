
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { adminApi } from '../services/adminApi';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string | number | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🔐 RESTORE SESSION MODE: Check sessionStorage on mount
  // Giúp duy trì đăng nhập khi refresh trang (F5)
  // Nhưng sẽ mất khi tắt trình duyệt/tab (đặc tính của sessionStorage)
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = sessionStorage.getItem('admin_token');
      const storedUser = sessionStorage.getItem('admin_user');

      if (storedToken && storedUser) {
        try {
          console.log('🔄 Restoring session from sessionStorage...');
          setToken(storedToken);
          setUser(JSON.parse(storedUser));

          // Optional: Verify token freshness
          // await adminApi.auth.getCurrentAdmin();
        } catch (error) {
          console.error('❌ Failed to restore session:', error);
          sessionStorage.removeItem('admin_token');
          sessionStorage.removeItem('admin_user');
        }
      } else {
        console.log('ℹ️ No session found in sessionStorage');
      }
      setIsLoading(false);
    };

    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    console.log('🔐 AuthContext: Starting login...');
    console.log('📧 Email:', email);
    setIsLoading(true);
    try {
      console.log('📡 Calling API: /api/auth/admin-login');
      // Sử dụng API mới từ Java backend
      const response = await adminApi.auth.adminLogin(email, password);
      console.log('📥 Response:', response);

      // Response structure từ Java backend:
      // { token: string, type: "Bearer", user: {...} }
      if (!response.token || !response.user) {
        throw new Error('Invalid response from server');
      }

      // ✅ LƯU TOKEN VÀ USER VÀO SESSIONSTORAGE
      // SessionStorage sẽ được bảo toàn khi REFRESH trang
      // Nhưng sẽ bị xóa khi ĐÓNG TAB/BROWSER
      console.log('✅ Login successful - Session saved');
      sessionStorage.setItem('admin_token', response.token);
      sessionStorage.setItem('admin_user', JSON.stringify(response.user));

      setToken(response.token);
      setUser(response.user);
    } catch (error: any) {
      console.error('❌ Login error:', error);
      console.error('🔍 Error details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
      // Xử lý error message từ backend
      if (error.response?.data) {
        const errorMsg = typeof error.response.data === 'string'
          ? error.response.data
          : JSON.stringify(error.response.data);
        throw new Error(errorMsg);
      }
      throw new Error(error.message || 'Email hoặc mật khẩu không đúng');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('🔒 Logging out - Clearing session storage');
    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_user');
    setToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
    token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
