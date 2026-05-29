import { useState, useRef } from 'react';
import axios from 'axios';

// Trang quản lý Hồ sơ cá nhân — Premium Profile Management
function ProfilePage({ user, onProfileUpdate, onClose, onAccountDeleted }) {
  // Form state cho thông tin cá nhân
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatarUrl: user?.avatarUrl || '',
    specialty: user?.specialty || '',
    certificates: user?.certificates || '',
    experience: user?.experience || '',
    bio: user?.bio || '',
  });

  // Form state cho đổi mật khẩu
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  const fileInputRef = useRef(null);

  // Xử lý thay đổi input thông tin cá nhân
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Xử lý thay đổi input mật khẩu
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  // Upload ảnh đại diện
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadForm = new FormData();
    uploadForm.append('file', file);

    try {
      setUploading(true);
      const res = await axios.post('http://localhost:8080/api/upload', uploadForm, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFormData((prev) => ({ ...prev, avatarUrl: res.data.url }));
    } catch (err) {
      alert('❌ Không thể tải ảnh lên. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  // Lưu thay đổi hồ sơ
  const handleSave = async () => {
    // Validate mật khẩu mới nếu người dùng nhập
    if (passwordData.newPassword && passwordData.newPassword !== passwordData.confirmPassword) {
      alert('⚠️ Mật khẩu mới và xác nhận không khớp!');
      return;
    }

    if (!passwordData.currentPassword) {
      alert('⚠️ Vui lòng nhập mật khẩu hiện tại để xác nhận thay đổi.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        avatarUrl: formData.avatarUrl,
        specialty: formData.specialty || null,
        certificates: formData.certificates || null,
        experience: formData.experience || null,
        bio: formData.bio || null,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword || null,
      };

      const res = await axios.put(
        `http://localhost:8080/api/auth/profile/${user.id}`,
        payload
      );

      onProfileUpdate(res.data);
      alert('✅ Cập nhật hồ sơ thành công!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      let msg = 'Có lỗi xảy ra';
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          msg = err.response.data;
        } else if (err.response.data.message) {
          msg = err.response.data.message;
        } else {
          msg = JSON.stringify(err.response.data);
        }
      } else if (err.message) {
        msg = err.message;
      }
      alert(`❌ ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  // Xóa tài khoản
  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      alert('⚠️ Vui lòng nhập mật khẩu để xác nhận xóa tài khoản.');
      return;
    }

    try {
      setDeleting(true);
      await axios.delete(
        `http://localhost:8080/api/auth/profile/${user.id}?password=${encodeURIComponent(deletePassword)}`
      );
      setShowDeleteModal(false);
      onAccountDeleted();
    } catch (err) {
      let msg = 'Không thể xóa tài khoản';
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          msg = err.response.data;
        } else if (err.response.data.message) {
          msg = err.response.data.message;
        } else {
          msg = JSON.stringify(err.response.data);
        }
      } else if (err.message) {
        msg = err.message;
      }
      alert(`❌ ${msg}`);
    } finally {
      setDeleting(false);
    }
  };

  // Badge màu theo vai trò
  const roleBadge = (role) => {
    const styles = {
      ADMIN: 'from-red-500 to-orange-500 text-white',
      TEACHER: 'from-blue-500 to-cyan-500 text-white',
      STUDENT: 'from-green-500 to-emerald-500 text-white',
    };
    return styles[role] || styles.STUDENT;
  };

  return (
    <div className="animate-fade-in pb-10">
      {/* HERO BANNER */}
      <div className="relative overflow-hidden">
        <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-orange-950 py-16 px-4">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-56 h-56 bg-slate-500/10 rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-3xl mx-auto relative z-10">
            {/* Nút Quay lại */}
            <button
              onClick={onClose}
              className="mb-8 flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-all cursor-pointer bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/10"
            >
              ← Quay Lại Dashboard
            </button>

            {/* Avatar + Info */}
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="relative group">
                <div className="w-28 h-28 rounded-full ring-4 ring-orange-500/30 shadow-2xl shadow-orange-500/20 overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                  {formData.avatarUrl ? (
                    <img
                      src={formData.avatarUrl}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-black text-white select-none">
                      {user?.fullName?.charAt(0) || '?'}
                    </span>
                  )}
                </div>
                {/* Upload overlay */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute inset-0 w-28 h-28 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center cursor-pointer border-none"
                >
                  <span className="text-white text-xs font-bold text-center leading-tight">
                    {uploading ? '⏳' : '📷'}<br />
                    {uploading ? 'Đang tải...' : 'Đổi ảnh'}
                  </span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>

              {/* User Info */}
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {user?.fullName || 'Người dùng'}
                </h1>
                <p className="text-slate-400 text-sm font-medium mt-1">@{user?.username}</p>
                <span className={`inline-block mt-3 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-gradient-to-r ${roleBadge(user?.role)} shadow-lg`}>
                  {user?.role === 'ADMIN' ? '👑 Quản Trị Viên' : user?.role === 'TEACHER' ? '👨‍🏫 Giảng Viên' : '🎓 Học Viên'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FORM CONTENT */}
      <div className="max-w-3xl mx-auto px-4 -mt-6 relative z-20">

        {/* THÔNG TIN CÁ NHÂN */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8 mb-6">
          <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
            📋 Thông Tin Cá Nhân
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Username — read only */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                🔒 Tên đăng nhập
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={user?.username || ''}
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500 font-medium cursor-not-allowed"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 text-sm">🔒</span>
              </div>
            </div>

            {/* Role — read only */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                🏷️ Vai trò
              </label>
              <input
                type="text"
                value={user?.role || ''}
                disabled
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500 font-medium cursor-not-allowed"
              />
            </div>

            {/* Họ và tên */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                👤 Họ và tên
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Nhập họ và tên đầy đủ"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm text-slate-800 placeholder-slate-400 bg-slate-50/50 transition-all"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                📧 Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm text-slate-800 placeholder-slate-400 bg-slate-50/50 transition-all"
              />
            </div>

            {/* Số điện thoại */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                📱 Số điện thoại
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="0901 234 567"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm text-slate-800 placeholder-slate-400 bg-slate-50/50 transition-all"
              />
            </div>
          </div>
        </div>

        {/* THÔNG TIN HỌC THUẬT & GIẢNG DẠY (CHỈ DÀNH CHO GIÁO VIÊN) */}
        {user?.role === 'TEACHER' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8 mb-6">
            <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
              🎓 Hồ Sơ Giảng Dạy & Trình Độ Học Thuật
            </h2>

            <div className="flex flex-col gap-5">
              {/* Chuyên môn nổi bật */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  💼 Chuyên môn nổi bật
                </label>
                <input
                  type="text"
                  name="specialty"
                  value={formData.specialty || ''}
                  onChange={handleChange}
                  placeholder="Ví dụ: Chuyên Gia Luyện Thi IELTS Writing & Speaking"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm text-slate-800 placeholder-slate-400 bg-slate-50/50 transition-all font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Bằng cấp & Chứng chỉ */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    📜 Bằng cấp / Chứng chỉ tiêu biểu
                  </label>
                  <input
                    type="text"
                    name="certificates"
                    value={formData.certificates || ''}
                    onChange={handleChange}
                    placeholder="Ví dụ: IELTS 8.5, CELTA, Cambridge TKT"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm text-slate-800 placeholder-slate-400 bg-slate-50/50 transition-all font-semibold"
                  />
                </div>

                {/* Kinh nghiệm giảng dạy */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    🕒 Kinh nghiệm giảng dạy
                  </label>
                  <input
                    type="text"
                    name="experience"
                    value={formData.experience || ''}
                    onChange={handleChange}
                    placeholder="Ví dụ: 5+ năm giảng dạy tại trung tâm"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm text-slate-800 placeholder-slate-400 bg-slate-50/50 transition-all font-semibold"
                  />
                </div>
              </div>

              {/* Giới thiệu bản thân (Bio) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  📝 Lời tự giới thiệu ngắn (Bio)
                </label>
                <textarea
                  name="bio"
                  value={formData.bio || ''}
                  onChange={handleChange}
                  placeholder="Nhập tiểu sử ngắn gọn truyền cảm hứng học tập đến học viên..."
                  rows="3"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm text-slate-800 placeholder-slate-400 bg-slate-50/50 transition-all resize-none leading-relaxed font-medium"
                />
              </div>
            </div>
          </div>
        )}

        {/* ĐỔI MẬT KHẨU — Collapsible */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-6 overflow-hidden">
          <button
            onClick={() => setShowPasswordSection(!showPasswordSection)}
            className="w-full px-6 sm:px-8 py-5 flex items-center justify-between cursor-pointer bg-transparent border-none text-left"
          >
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
              🔐 Đổi Mật Khẩu
            </h2>
            <span className={`text-slate-400 text-lg transition-transform duration-300 ${showPasswordSection ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>

          {showPasswordSection && (
            <div className="px-6 sm:px-8 pb-6 space-y-4 border-t border-slate-100 pt-5">
              {/* Mật khẩu hiện tại */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  🔑 Mật khẩu hiện tại <span className="text-red-400">*</span>
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Nhập mật khẩu hiện tại"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm text-slate-800 placeholder-slate-400 bg-slate-50/50 transition-all"
                />
              </div>

              {/* Mật khẩu mới */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  🆕 Mật khẩu mới
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Nhập mật khẩu mới (để trống nếu không đổi)"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm text-slate-800 placeholder-slate-400 bg-slate-50/50 transition-all"
                />
              </div>

              {/* Xác nhận mật khẩu mới */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  ✅ Xác nhận mật khẩu mới
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Nhập lại mật khẩu mới"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm text-slate-800 placeholder-slate-400 bg-slate-50/50 transition-all"
                />
                {passwordData.newPassword && passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                  <p className="text-xs font-bold text-red-500 mt-1">⚠️ Mật khẩu xác nhận không khớp!</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Nếu password section ẩn, vẫn cần nhập current password để lưu */}
        {!showPasswordSection && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8 mb-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                🔑 Mật khẩu hiện tại <span className="text-red-400">*</span>
                <span className="text-slate-300 normal-case tracking-normal ml-1">(bắt buộc để lưu thay đổi)</span>
              </label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Nhập mật khẩu hiện tại để xác nhận"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm text-slate-800 placeholder-slate-400 bg-slate-50/50 transition-all"
              />
            </div>
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-black rounded-xl shadow-lg shadow-orange-500/20 cursor-pointer border-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Đang lưu...
              </>
            ) : (
              '💾 Lưu Thay Đổi'
            )}
          </button>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full sm:w-auto px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-black rounded-xl cursor-pointer border border-red-100 transition-all flex items-center justify-center gap-2"
          >
            🗑️ Xóa Tài Khoản
          </button>
        </div>
      </div>

      {/* MODAL XÁC NHẬN XÓA TÀI KHOẢN */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(false)}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fade-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">⚠️</span>
              </div>
              <h3 className="text-xl font-black text-slate-800">Xóa Tài Khoản Vĩnh Viễn?</h3>
              <p className="text-sm text-slate-500 mt-2">
                Hành động này không thể hoàn tác. Tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn.
              </p>
            </div>

            <div className="flex flex-col gap-3 mb-6">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Nhập mật khẩu để xác nhận
              </label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Mật khẩu hiện tại"
                className="w-full px-4 py-2.5 rounded-xl border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm text-slate-800 placeholder-slate-400 bg-red-50/30 transition-all"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setDeletePassword(''); }}
                className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer border-none transition-all"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 text-sm font-black text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl cursor-pointer border-none transition-all shadow-lg shadow-red-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Đang xóa...
                  </>
                ) : (
                  '🗑️ Xóa Vĩnh Viễn'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
