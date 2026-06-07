import React, { useState } from 'react';
import axios from 'axios';

function AuthPortal({ onLoginSuccess, onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  
  // Login form state
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  
  // Register form state
  const [registerForm, setRegisterForm] = useState({ username: '', password: '', fullName: '', email: '' });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm({ ...loginForm, [name]: value });
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterForm({ ...registerForm, [name]: value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', loginForm);
      // Lưu phiên đăng nhập vào localStorage
      localStorage.setItem('user', JSON.stringify(response.data));
      onLoginSuccess(response.data);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Tên đăng nhập hoặc mật khẩu không chính xác.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!registerForm.password || registerForm.password.length < 6) {
      setError('⚠️ Mật khẩu đăng ký phải có tối thiểu 6 ký tự.');
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:8080/api/auth/register', registerForm);
      setSuccessMsg('🎉 Đăng ký tài khoản học viên thành công! Bạn có thể đăng nhập ngay bây giờ.');
      setLoginForm({ username: registerForm.username, password: registerForm.password });
      setRegisterForm({ username: '', password: '', fullName: '', email: '' });
      setIsLogin(true); // Chuyển về màn hình đăng nhập
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Lỗi đăng ký tài khoản. Tên đăng nhập có thể đã tồn tại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden relative animate-slide-up flex flex-col">
        
        {/* Nút Đóng Modal */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold transition-all cursor-pointer shadow border-none text-sm z-10"
        >
          ✕
        </button>

        {/* Nội dung form */}
        <div className="p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="inline-flex w-12 h-12 bg-emerald-50 rounded-2xl items-center justify-center text-2xl text-emerald-600 mb-3 shadow-inner">
              🔑
            </div>
            <h2 className="text-2xl font-black text-slate-800">
              {isLogin ? "Đăng Nhập Hệ Thống" : "Đăng Ký Học Viên"}
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-semibold uppercase tracking-wider">
              {isLogin ? "EduEnglish Portal Login" : "Create Student Account"}
            </p>
          </div>

          {error && (
            <div className="p-3 mb-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
              ⚠️ {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3 mb-4 bg-green-50 border border-green-200 text-green-600 rounded-xl text-xs font-semibold">
              {successMsg}
            </div>
          )}

          {isLogin ? (
            // MÀN HÌNH ĐĂNG NHẬP
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Tên đăng nhập</label>
                <input 
                  type="text" 
                  name="username"
                  value={loginForm.username}
                  onChange={handleLoginChange}
                  placeholder="Nhập tên đăng nhập" 
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm font-semibold bg-slate-50/30"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Mật khẩu</label>
                <input 
                  type="password" 
                  name="password"
                  value={loginForm.password}
                  onChange={handleLoginChange}
                  placeholder="Nhập mật khẩu" 
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm font-semibold bg-slate-50/30"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 mt-2 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 rounded-xl shadow-lg shadow-emerald-500/10 cursor-pointer flex items-center justify-center gap-2 border-none"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "🔐 Đăng Nhập"
                )}
              </button>
            </form>
          ) : (
            // MÀN HÌNH ĐĂNG KÝ HỌC VIÊN
            <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Tên đăng nhập</label>
                <input 
                  type="text" 
                  name="username"
                  value={registerForm.username}
                  onChange={handleRegisterChange}
                  placeholder="Tạo tên đăng nhập độc nhất" 
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm font-semibold bg-slate-50/30"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Họ và tên học viên</label>
                <input 
                  type="text" 
                  name="fullName"
                  value={registerForm.fullName}
                  onChange={handleRegisterChange}
                  placeholder="Ví dụ: Trần Minh B" 
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm font-semibold bg-slate-50/30"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Địa chỉ Email</label>
                <input 
                  type="email" 
                  name="email"
                  value={registerForm.email}
                  onChange={handleRegisterChange}
                  placeholder="name@example.com" 
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm font-semibold bg-slate-50/30"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Mật khẩu</label>
                <input 
                  type="password" 
                  name="password"
                  value={registerForm.password}
                  onChange={handleRegisterChange}
                  placeholder="Tạo mật khẩu" 
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm font-semibold bg-slate-50/30"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 mt-2 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 rounded-xl shadow-lg shadow-emerald-500/10 cursor-pointer flex items-center justify-center gap-2 border-none"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "✓ Hoàn Tất Đăng Ký"
                )}
              </button>
            </form>
          )}

          {/* Chuyển đổi Đăng nhập / Đăng ký */}
          <div className="mt-6 text-center text-xs border-t border-slate-100 pt-4">
            {isLogin ? (
              <p className="text-slate-500 font-semibold">
                Bạn chưa có tài khoản?{" "}
                <button 
                  onClick={() => setIsLogin(false)}
                  className="text-emerald-605 font-bold hover:underline bg-none border-none cursor-pointer p-0"
                >
                  Đăng ký ngay học viên
                </button>
              </p>
            ) : (
              <p className="text-slate-500 font-semibold">
                Đã có tài khoản?{" "}
                <button 
                  onClick={() => setIsLogin(true)}
                  className="text-emerald-605 font-bold hover:underline bg-none border-none cursor-pointer p-0"
                >
                  Đăng nhập tại đây
                </button>
              </p>
            )}
          </div>
        </div>

        {/* HƯỚNG DẪN ĐĂNG NHẬP MẪU SIÊU TIỆN LỢI */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 text-[11px] leading-relaxed text-slate-500 font-semibold">
          <p className="font-extrabold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
            <span>💡</span> Gợi ý tài khoản demo:
          </p>
          <ul className="list-disc pl-4 flex flex-col gap-0.5">
            <li>Quản trị (Admin): <strong className="text-slate-700">admin / admin123</strong></li>
            <li>Giáo viên (Teacher): <strong className="text-slate-700">teacher / teacher123</strong></li>
            <li>Học viên (Student): <strong className="text-slate-700">student / student123</strong></li>
          </ul>
        </div>

      </div>
    </div>
  );
}

export default AuthPortal;
