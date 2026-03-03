import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import axios from 'axios';
import Swal from 'sweetalert2';

const API_URL = 'https://apituyendung.deepcode.vn/api/auth';
// const API_URL = 'https://apituyendung.deepcode.vn/api/auth';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ) => Promise<boolean>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ================= VALIDATION HELPERS ================= */

// Email hợp lệ
const isValidEmail = (email: string): boolean => {
  const regex =
    /^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
};


// Độ mạnh mật khẩu
const checkPasswordStrength = (password: string) => {
  let score = 0;

  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return 'weak';
  if (score === 3 || score === 4) return 'medium';
  return 'strong';
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /* ================= RESTORE SESSION ================= */
  useEffect(() => {
    const storedUser = localStorage.getItem('wc_user');
    const token = localStorage.getItem('token');

    if (storedUser && token) {
      const parsedUser = JSON.parse(storedUser);
      // Re-normalize stored user to ensure flag consistency
      const normalizedUser = {
        ...parsedUser,
        role: parsedUser.role ? parsedUser.role.toUpperCase() as UserRole : undefined,
        isNewUser: (parsedUser.isNewUser === true || parsedUser.newUser === true || String(parsedUser.isNewUser) === 'true' || String(parsedUser.newUser) === 'true') ||
          (!parsedUser.fullName && !parsedUser.phone && parsedUser.role !== 'ADMIN')
      } as User;

      setUser(normalizedUser);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setIsLoading(false);
  }, []);

  /* ================= LOGIN ================= */
  const login = async (email: string, password: string): Promise<boolean> => {
    // Validate email
    if (!isValidEmail(email)) {
      Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Email không hợp lệ' });
      return false;
    }

    if (!password) {
      Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Vui lòng nhập mật khẩu' });
      return false;
    }

    try {
      const response = await axios.post(`${API_URL}/login`, {
        identifier: email,
        password,
      });

      const { token, user: userData } = response.data;
      console.log("Raw user data from server:", userData);

      const normalizedUser: User = {
        ...userData,
        role: userData.role.toUpperCase() as UserRole,
        isNewUser: (userData.isNewUser === true ||
          userData.newUser === true ||
          String(userData.isNewUser) === 'true' ||
          String(userData.newUser) === 'true') ||
          (!userData.fullName && !userData.phone && userData.role !== 'ADMIN')
      };

      console.log("Normalized user object (JSON):", JSON.stringify(normalizedUser, null, 2));

      localStorage.setItem('token', token);
      localStorage.setItem('wc_user', JSON.stringify(normalizedUser));

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(normalizedUser);

      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data || 'Email hoặc mật khẩu không đúng';
      Swal.fire({ icon: 'error', title: 'Lỗi đăng nhập', text: errorMessage });
      return false;
    }

  };

  /* ================= REGISTER ================= */
  const register = async (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ): Promise<boolean> => {
    // ... (validation remains same)
    if (!name.trim()) { Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Vui lòng nhập họ tên' }); return false; }
    if (!isValidEmail(email)) { Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Email không hợp lệ' }); return false; }
    const strength = checkPasswordStrength(password);
    if (strength === 'weak') {
      Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Mật khẩu quá yếu (ít nhất 8 ký tự, có chữ hoa, số, ký tự đặc biệt)' });
      return false;
    }

    try {
      const response = await axios.post(`${API_URL}/register`, {
        username: name,
        email,
        password,
        role,
        phone: '',
        referrerCode: '',
      });

      if (response.status === 200 || response.status === 201) {
        Swal.fire({ icon: 'success', title: 'Thành công', text: 'Đăng ký thành công! Mời bạn đăng nhập.', timer: 3000 });
        return true;
      }

      return false;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data || 'Đăng ký thất bại';
      Swal.fire({ icon: 'error', title: 'Lỗi đăng ký', text: errorMessage });
      return false;
    }

  };

  /* ================= LOGOUT ================= */
  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('wc_user');
    delete axios.defaults.headers.common['Authorization'];
  };

  /* ================= UPDATE USER ================= */
  const updateUser = (updatedUser: User) => {
    const normalizedUser: User = {
      ...updatedUser,
      role: updatedUser.role ? updatedUser.role.toUpperCase() as UserRole : undefined,
      isNewUser: (updatedUser.isNewUser === true || updatedUser.newUser === true || String(updatedUser.isNewUser) === 'true' || String(updatedUser.newUser) === 'true') ||
        (!updatedUser.fullName && !updatedUser.phone && updatedUser.role !== 'ADMIN')
    } as User;

    setUser(normalizedUser);
    localStorage.setItem('wc_user', JSON.stringify(normalizedUser));

  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, updateUser, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
