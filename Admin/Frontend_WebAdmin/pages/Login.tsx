import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Loader2, Eye, EyeOff } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔐 Login attempt started...');
    console.log('📧 Email:', email);
    console.log('🔑 Password length:', password.length);

    setError('');
    setIsLoading(true);

    try {
      console.log('📤 Calling login API...');
      await login(email, password);
      console.log('✅ Login successful, navigating to:', from);
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('❌ Login failed:', err);
      console.error('Error message:', err.message);
      console.error('Error response:', err.response?.data);
      setError(err.message || 'Email hoặc mật khẩu không đúng');
    } finally {
      console.log('🏁 Login attempt finished');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Branding */}
      <div className="hidden w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <span className="text-lg font-bold text-white">W</span>
          </div>
          <span className="text-xl font-bold text-white">WorkConnect</span>
        </div>

        <div className="space-y-6">
          <h1 className="text-5xl font-black leading-tight text-white">
            Quản lý nền tảng<br />
            <span className="text-yellow-300">tuyển dụng thông minh</span>
          </h1>
          <p className="text-xl text-white/90 font-medium">
            Xác thực hồ sơ • Đánh giá 2 chiều • Kết nối việc làm
          </p>

          {/* Decorative Elements */}
          <div className="relative mt-12">
            <div className="absolute -left-4 top-0 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
            <div className="absolute -right-8 bottom-0 h-40 w-40 rounded-full bg-yellow-300/20 blur-3xl"></div>
          </div>
        </div>

        <p className="text-sm text-white/70">
          © 2024 WorkConnect. All rights reserved.
        </p>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex w-full items-center justify-center bg-gray-50 p-8 lg:w-1/2">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="flex items-center justify-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
              <span className="text-lg font-bold text-white">W</span>
            </div>
            <span className="text-xl font-bold text-gray-900">WorkConnect</span>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-black text-gray-900">Đăng nhập Admin</h2>
            <p className="text-gray-600 font-medium">
              Nhập thông tin để truy cập bảng điều khiển
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="animate-pulse rounded-lg border-2 border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">
                ⚠️ {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@workconnect.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                'Đăng nhập'
              )}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4">
            <p className="text-sm font-bold text-blue-900 mb-2">🔐 Demo Credentials:</p>
            <p className="text-sm text-blue-800">
              Email: <code className="rounded bg-white px-2 py-1 font-mono text-xs font-semibold">admin@gmail.com</code>
            </p>
            <p className="text-sm text-blue-800 mt-1">
              Password: <code className="rounded bg-white px-2 py-1 font-mono text-xs font-semibold">123456</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
