import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types'; // Đảm bảo bạn có enum UserRole { WORKER, BUSINESS }
import Swal from 'sweetalert2';

const Login: React.FC = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Thêm state cho tên
  const [role, setRole] = useState<UserRole>(UserRole.WORKER); // Mặc định là Worker
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, register } = useAuth(); // register được định nghĩa trong AuthContext
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLoginView) {
        const success = await login(email, password);
        if (success) {
          // Lấy user vừa login thành công (giả sử mockData đã cập nhật)
          const storedUser = localStorage.getItem('wc_user');
          const userData = storedUser ? JSON.parse(storedUser) : null;

          Swal.fire({
            icon: 'success',
            title: 'Thành công',
            text: 'Đăng nhập thành công!',
            timer: 800,
            showConfirmButton: false
          });
          console.log("User data from localStorage in Login (JSON):", JSON.stringify(userData, null, 2));
          if (userData?.isNewUser || userData?.newUser) {
            console.log("Redirecting to onboarding");
            navigate('/onboarding', { replace: true });
          } else {
            console.log("Redirecting to home");
            navigate('/', { replace: true });
          }
        } else {
          setError('Email hoặc mật khẩu không chính xác.');
        }
      } else {
        // 👇 Gửi Role và các thông tin đăng ký
        const success = await register(name, email, password, role);
        if (success) {
          Swal.fire({
            icon: 'success',
            title: 'Thành công',
            text: 'Đăng ký thành công! Mời bạn đăng nhập.',
            timer: 1500,
            showConfirmButton: false
          });
          setIsLoginView(true); // Chuyển về màn hình đăng nhập
          // Reset form sau khi đăng ký thành công
          setName('');
          setEmail('');
          setPassword('');
        }
        // Lưu ý: Không cần đặt setError ở đây nếu AuthContext đã xử lý lỗi.
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Lỗi kết nối hệ thống.' });
    } finally {
      setIsLoading(false);
    }
  };

  const fillCredentials = (type: 'worker' | 'business') => {
    if (type === 'worker') {
      setEmail('an.nguyen@example.com'); // Mock worker account
      setPassword('demo123');
    } else {
      setEmail('hr@techsolutions.vn'); // Mock business account
      setPassword('demo123');
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full animate-in fade-in zoom-in duration-300">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
          {/* View Toggles */}
          <div className="flex border-b border-slate-100">
            <button
              onClick={() => setIsLoginView(true)}
              className={`flex-1 py-5 font-bold text-sm uppercase tracking-widest transition-all ${isLoginView ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Đăng nhập
            </button>
            <button
              onClick={() => setIsLoginView(false)}
              className={`flex-1 py-5 font-bold text-sm uppercase tracking-widest transition-all ${!isLoginView ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Đăng ký
            </button>
          </div>

          <div className="p-8 md:p-10">
            {/* Form Nội dung */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLoginView && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Họ và tên</label>
                    <input
                      type="text" required
                      value={name} onChange={(e) => setName(e.target.value)}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>

                  {/* Chọn vai trò */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Bạn là ai?</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setRole(UserRole.WORKER)}
                        className={`py-3 rounded-xl text-xs font-bold transition-all border ${role === UserRole.WORKER ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-500 border-slate-200'}`}
                      >
                        NGƯỜI LAO ĐỘNG
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole(UserRole.BUSINESS)}
                        className={`py-3 rounded-xl text-xs font-bold transition-all border ${role === UserRole.BUSINESS ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-500 border-slate-200'}`}
                      >
                        NHÀ TUYỂN DỤNG
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Email & Password (Giữ nguyên giao diện của bạn) */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Email</label>
                <input
                  type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="example@gmail.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Mật khẩu</label>
                <input
                  type="password" required value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit" disabled={isLoading}
                className="w-full bg-indigo-700 hover:bg-indigo-800 text-white font-black py-4 rounded-xl shadow-lg uppercase tracking-widest text-sm disabled:opacity-50"
              >
                {isLoading ? 'Đang xử lý...' : (isLoginView ? 'Đăng nhập' : 'Tạo tài khoản')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;