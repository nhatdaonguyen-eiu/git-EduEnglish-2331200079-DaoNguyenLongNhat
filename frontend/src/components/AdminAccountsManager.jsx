import { useState, useEffect } from 'react';
import axios from 'axios';

// Component Quản lý Tài khoản Giáo viên dành riêng cho Admin
function AdminAccountsManager() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Trạng thái form tạo giáo viên
  const initialForm = {
    username: '',
    password: '',
    fullName: '',
    email: '',
    phone: ''
  };
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  // Lấy danh sách giáo viên
  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:8080/api/auth/teachers');
      setTeachers(res.data);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách giáo viên:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Tạo tài khoản giáo viên mới
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    if (!formData.username || !formData.password || !formData.fullName || !formData.email) {
      alert('⚠️ Vui lòng điền đầy đủ các trường thông tin bắt buộc (*)');
      return;
    }

    if (formData.password.length < 6) {
      alert('⚠️ Mật khẩu của giáo viên phải có tối thiểu 6 ký tự!');
      return;
    }

    try {
      setSubmitting(true);
      await axios.post('http://localhost:8080/api/auth/create-teacher', formData);
      alert('🎉 Đã tạo tài khoản Giáo viên mới thành công!');
      setFormData(initialForm);
      fetchTeachers();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Không thể tạo tài khoản';
      alert(`❌ Lỗi: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-8 animate-fade-in">
      
      {/* KHU VỰC TẠO TÀI KHOẢN MỚI */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 relative overflow-hidden">
        {/* Decorative background blur */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2 relative z-10">
          👨‍🏫 Cấp Tài Khoản Giáo Viên Mới
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 relative z-10">
          {/* Tên đăng nhập */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Tên đăng nhập <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Ví dụ: teacher_david"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm text-slate-800 placeholder-slate-400 bg-slate-50/50 transition-all"
              required
            />
          </div>

          {/* Mật khẩu */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Mật khẩu ban đầu <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm text-slate-800 placeholder-slate-400 bg-slate-50/50 transition-all"
              required
            />
          </div>

          {/* Họ và tên */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Ví dụ: David Harrison"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm text-slate-800 placeholder-slate-400 bg-slate-50/50 transition-all"
              required
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Địa chỉ Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="david@eduenglish.edu.vn"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm text-slate-800 placeholder-slate-400 bg-slate-50/50 transition-all"
              required
            />
          </div>

          {/* Số điện thoại */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Số điện thoại
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Ví dụ: 0901 234 567"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm text-slate-800 placeholder-slate-400 bg-slate-50/50 transition-all"
            />
          </div>

          {/* Nút submit */}
          <div className="flex items-end">
            <button
              type="submit"
              disabled={submitting}
              className="w-full px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-black rounded-xl shadow-lg shadow-orange-500/10 cursor-pointer border-none transition-all disabled:opacity-50 flex items-center justify-center gap-2 h-[41px]"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Đang xử lý...
                </>
              ) : (
                '➕ Tạo Tài Khoản'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* DANH SÁCH GIÁO VIÊN HIỆN CÓ */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
            👨‍🏫 Danh Sách Giảng Viên Đang Hoạt Động
            <span className="px-2.5 py-0.5 bg-slate-100 rounded-full text-xs font-bold text-slate-500">
              {teachers.length}
            </span>
          </h2>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-semibold text-slate-400">Đang đồng bộ dữ liệu giảng viên...</p>
          </div>
        ) : teachers.length === 0 ? (
          <div className="py-12 text-center text-slate-400 font-medium">
            Chưa có giảng viên nào trong hệ thống.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teachers.map((teacher) => (
              <div 
                key={teacher.id} 
                className="p-5 rounded-2xl border border-slate-100 bg-slate-50/30 flex items-center gap-4 hover:border-orange-500/20 hover:bg-slate-50 transition-all shadow-sm"
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-600/10 flex items-center justify-center text-orange-600 overflow-hidden border border-orange-500/10 shrink-0">
                  {teacher.avatarUrl ? (
                    <img 
                      src={teacher.avatarUrl} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-black uppercase select-none">
                      {teacher.fullName.charAt(0)}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-black text-slate-800 truncate">{teacher.fullName}</h3>
                  <p className="text-xs font-bold text-slate-400 mt-0.5 truncate">@{teacher.username}</p>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-2 text-[11px] font-bold text-slate-500">
                    <span className="flex items-center gap-1">
                      📧 {teacher.email}
                    </span>
                    {teacher.phone && (
                      <span className="flex items-center gap-1">
                        📱 {teacher.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default AdminAccountsManager;
