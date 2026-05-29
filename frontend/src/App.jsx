import { useState, useEffect } from 'react';
import axios from 'axios';
// Nhập khẩu các mảnh ghép Lego từ thư mục components
import CourseForm from './components/CourseForm';
import CourseCard from './components/CourseCard';
import StudentPortal from './components/StudentPortal';
import RegistrationManager from './components/RegistrationManager';
import AuthPortal from './components/AuthPortal';
import TeacherPortal from './components/TeacherPortal';
import ClassroomManager from './components/ClassroomManager';
import StudentDashboard from './components/StudentDashboard';
import ProfilePage from './components/ProfilePage';
import AdminAccountsManager from './components/AdminAccountsManager';

function App() {
  // Quản lý trạng thái Đăng nhập hệ thống (localStorage)
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  // Trạng thái hiển thị Modal Đăng nhập/Đăng ký
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Phân hệ hiển thị: 
  // - 'student': Landing Page công khai dành cho tất cả học viên
  // - 'dashboard': Dashboard cá nhân phụ thuộc vào Vai trò đăng nhập (Học viên, Giáo viên, Admin)
  const [portalMode, setPortalMode] = useState('student');

  // Tab con trong trang Admin: 'courses' (Khóa học), 'registrations' (Đăng ký học), 'classrooms' (Quản lý lớp đào tạo)
  const [adminTab, setAdminTab] = useState('courses');

  // Trạng thái hiển thị Trang Hồ Sơ cá nhân
  const [showProfile, setShowProfile] = useState(false);

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Trạng thái Form nhập liệu Khóa học của Admin
  const initialForm = { 
    title: '', 
    description: '', 
    level: 'Beginner', 
    category: 'IELTS', 
    price: '', 
    thumbnailUrl: '',
    suitableFor: '',
    outputGoals: '',
    duration: '',
    commitment: '',
    learningMethod: '',
    syllabus: ''
  };
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  // Trạng thái tìm kiếm & bộ lọc khóa học của Admin
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('');
  const [category, setCategory] = useState('');

  // Cơ chế Debounce tìm kiếm khóa học của Admin
  useEffect(() => {
    if (portalMode === 'dashboard' && currentUser?.role === 'ADMIN' && adminTab === 'courses') {
      const delayDebounceFn = setTimeout(() => {
        fetchCourses();
      }, 250);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [search, level, category, portalMode, adminTab, currentUser]);

  // Hàm gọi API lấy danh sách khóa học có truyền tham số lọc
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/api/courses', {
        params: {
          search: search || null,
          level: level || null,
          category: category || null
        }
      });
      setCourses(response.data);
    } catch (error) {
      console.error("Lỗi kết nối Backend:", error);
    } finally {
      setLoading(false);
    }
  };

  // Submit tạo mới hoặc cập nhật khóa học của Admin
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://localhost:8080/api/courses/${editingId}`, formData);
        alert("🎉 Đã cập nhật khóa học thành công!");
      } else {
        await axios.post('http://localhost:8080/api/courses', formData);
        alert("✨ Đã thêm khóa học mới thành công!");
      }
      setFormData(initialForm);
      setEditingId(null);
      fetchCourses();
    } catch (error) {
      alert("❌ Có lỗi xảy ra khi lưu khóa học!");
    }
  };

  // Xóa mềm khóa học của Admin
  const handleDelete = async (id) => {
    if (!window.confirm("⚠️ Bạn có chắc chắn muốn xóa khóa học này không?")) return;
    try {
      await axios.delete(`http://localhost:8080/api/courses/${id}`);
      fetchCourses();
    } catch (error) {
      alert("❌ Không thể xóa khóa học này.");
    }
  };

  // Cập nhật giá trị nhập trong các input của form khóa học
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Khi click Sửa khóa học
  const handleEditClick = (course) => {
    setEditingId(course.id);
    setFormData({ 
      title: course.title, 
      description: course.description, 
      level: course.level, 
      category: course.category, 
      price: course.price,
      thumbnailUrl: course.thumbnailUrl || '',
      suitableFor: course.suitableFor || '',
      outputGoals: course.outputGoals || '',
      duration: course.duration || '',
      commitment: course.commitment || '',
      learningMethod: course.learningMethod || '',
      syllabus: course.syllabus || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Hủy chế độ sửa
  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(initialForm);
  };

  // Reset toàn bộ bộ lọc Admin
  const handleClearFilters = () => {
    setSearch('');
    setLevel('');
    setCategory('');
  };

  // Nạp danh sách khóa học lần đầu cho Admin
  useEffect(() => {
    if (portalMode === 'dashboard' && currentUser?.role === 'ADMIN' && adminTab === 'courses') {
      fetchCourses();
    }
  }, [portalMode, adminTab, currentUser]);

  // Xử lý khi Đăng nhập thành công
  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    // Tự động chuyển thẳng vào Dashboard cá nhân theo role vừa đăng nhập
    setPortalMode('dashboard');
  };

  // Xử lý khi Đăng xuất
  const handleLogout = () => {
    localStorage.removeItem('user');
    setCurrentUser(null);
    setPortalMode('student'); // Quay về trang học viên công khai
    setShowProfile(false); // Đóng trang cá nhân nếu đang mở
    alert("👋 Đã đăng xuất tài khoản thành công!");
  };

  // Trả về nhãn chữ hiển thị cho nút Dashboard theo vai trò người dùng
  const getDashboardNavLabel = (role) => {
    switch (role) {
      case 'ADMIN': return '⚙️ Hệ Thống Quản Trị';
      case 'TEACHER': return '👨‍🏫 Cổng Giảng Dạy';
      default: return '📖 Cổng Học Tập';
    }
  };

  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen font-sans">
      
      {/* 1. THANH STICKY HEADER ĐIỀU HƯỚNG SPA & AUTHENTICATION */}
      <nav className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/60 shadow-sm px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* LOGO TRUNG TÂM */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setPortalMode('student'); setShowProfile(false); }}>
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-orange-500/10">
            E
          </div>
          <div>
            <span className="text-lg font-black text-slate-800 tracking-tight">EduEnglish</span>
            <span className="text-[10px] block font-extrabold text-orange-500 -mt-1 tracking-wider uppercase">Trung tâm Anh ngữ</span>
          </div>
        </div>

        {/* CÁC NÚT ĐIỀU HƯỚNG SPA PHÂN HỆ CHÍNH */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/20 items-center gap-1">
          <button 
            onClick={() => { setPortalMode('student'); setShowProfile(false); }}
            className={`px-5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              portalMode === 'student' && !showProfile
                ? 'bg-white text-orange-600 shadow-md shadow-slate-200/50'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            🎓 Trang Chủ Học Viên
          </button>
          
          {/* Nút Dashboard chỉ hiển thị khi đã đăng nhập */}
          {currentUser && (
            <button 
              onClick={() => { setPortalMode('dashboard'); setShowProfile(false); }}
              className={`px-5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                portalMode === 'dashboard' && !showProfile
                  ? 'bg-white text-orange-600 shadow-md shadow-slate-200/50'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {getDashboardNavLabel(currentUser.role)}
            </button>
          )}
        </div>

        {/* KHU VỰC THÔNG TIN TÀI KHOẢN & ĐĂNG NHẬP / ĐĂNG XUẤT */}
        <div className="flex items-center gap-3 shrink-0">
          {currentUser ? (
            // GIAO DIỆN KHI ĐÃ ĐĂNG NHẬP (HIỂN THỊ PILL PROFILE & ĐĂNG XUẤT)
            <div className="flex items-center gap-3 bg-slate-100/60 p-1.5 pr-3 rounded-2xl border border-slate-200/40 shadow-inner">
              {currentUser.avatarUrl ? (
                <img 
                  src={currentUser.avatarUrl} 
                  alt="Avatar" 
                  className="w-8 h-8 rounded-xl object-cover shadow"
                />
              ) : (
                <span className="w-8 h-8 rounded-xl bg-orange-500 text-white font-black text-xs flex items-center justify-center shadow">
                  {currentUser.fullName.charAt(0)}
                </span>
              )}
              <div className="hidden md:block text-left">
                <p className="text-xs font-black text-slate-800 leading-tight">{currentUser.fullName}</p>
                <span className="text-[9px] font-bold text-orange-500 uppercase tracking-widest leading-none">{currentUser.role}</span>
              </div>
              
              <button 
                onClick={() => setShowProfile(true)}
                className="ml-2 text-xs font-bold text-orange-600 hover:text-orange-800 bg-none border-none cursor-pointer flex items-center gap-0.5"
                title="Xem hồ sơ cá nhân"
              >
                👤 Hồ Sơ
              </button>
              
              <span className="text-slate-350 text-xs">|</span>
              
              <button 
                onClick={handleLogout}
                className="text-xs font-bold text-red-500 hover:text-red-700 bg-none border-none cursor-pointer"
                title="Đăng xuất tài khoản"
              >
                🚪 Đăng xuất
              </button>
            </div>
          ) : (
            // GIAO DIỆN CHƯA ĐĂNG NHẬP (NÚT ĐĂNG NHẬP SANG TRỌNG)
            <button 
              onClick={() => setShowAuthModal(true)}
              className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow shadow-orange-500/10 cursor-pointer border-none flex items-center gap-2"
            >
              🔐 Thành Viên Đăng Nhập
            </button>
          )}
        </div>
      </nav>

      {/* 2. HIỂN THỊ CHI TIẾT CÁC GIAO DIỆN THEO PHÂN HỆ */}
      {showProfile ? (
        <ProfilePage
          user={currentUser}
          onProfileUpdate={(updatedUser) => {
            const newUser = { ...currentUser, ...updatedUser };
            setCurrentUser(newUser);
            localStorage.setItem('user', JSON.stringify(newUser));
          }}
          onClose={() => setShowProfile(false)}
          onAccountDeleted={() => {
            localStorage.removeItem('user');
            setCurrentUser(null);
            setShowProfile(false);
            setPortalMode('student');
            alert('❌ Tài khoản của bạn đã được xóa.');
          }}
        />
      ) : portalMode === 'student' ? (
        // GIAO DIỆN TRANG CHỦ PUBLIC LANDING PAGE CHO HỌC VIÊN
        <StudentPortal />
      ) : (
        // GIAO DIỆN DASHBOARD CỦA TỪNG VAI TRÒ (ĐÃ ĐĂNG NHẬP)
        <div className="pb-20">
          
          {/* DASHBOARD HỌC VIÊN (STUDENT) */}
          {currentUser?.role === 'STUDENT' && (
            <StudentDashboard user={currentUser} />
          )}

          {/* DASHBOARD GIÁO VIÊN (TEACHER) */}
          {currentUser?.role === 'TEACHER' && (
            <TeacherPortal user={currentUser} />
          )}

          {/* DASHBOARD QUẢN TRỊ VIÊN (ADMIN) */}
          {currentUser?.role === 'ADMIN' && (
            <div>
              {/* HEADER CHUYÊN BIỆT CHO TRANG ADMIN */}
              <header className="py-8 text-center max-w-5xl mx-auto px-4 animate-fade-in">
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                  Quản Trị Hệ Thống EduEnglish
                </h1>
                <p className="text-slate-400 text-xs mt-1.5 font-bold uppercase tracking-wider">
                  Control Panel & Lead Management
                </p>
                
                {/* THANH SUB-TAB BÊN TRONG TRANG ADMIN (GỒM 4 TABS) */}
                <div className="flex justify-center gap-4 mt-6 border-b border-slate-200/60 max-w-2xl mx-auto pb-3 font-semibold flex-wrap">
                  <button 
                    onClick={() => setAdminTab('courses')}
                    className={`pb-1 px-4 text-sm font-extrabold border-b-2 transition-all cursor-pointer ${
                      adminTab === 'courses'
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    📚 Quản Lý Khóa Học
                  </button>
                  
                  <button 
                    onClick={() => setAdminTab('registrations')}
                    className={`pb-1 px-4 text-sm font-extrabold border-b-2 transition-all cursor-pointer ${
                      adminTab === 'registrations'
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    📞 Hồ Sơ Tư Vấn
                  </button>

                  <button 
                    onClick={() => setAdminTab('classrooms')}
                    className={`pb-1 px-4 text-sm font-extrabold border-b-2 transition-all cursor-pointer ${
                      adminTab === 'classrooms'
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    🏫 Quản Lý Lớp Học
                  </button>

                  <button 
                    onClick={() => setAdminTab('accounts')}
                    className={`pb-1 px-4 text-sm font-extrabold border-b-2 transition-all cursor-pointer ${
                      adminTab === 'accounts'
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    👨‍🏫 Quản Lý Giáo Viên
                  </button>
                </div>
              </header>

              {/* NỘI DUNG TỪNG TAB TRONG ADMIN */}
              <div className="px-4">
                {adminTab === 'courses' && (
                  // TAB 1: QUẢN LÝ KHÓA HỌC (CRUD)
                  <>
                    <CourseForm 
                      formData={formData} 
                      onChange={handleInputChange} 
                      onSubmit={handleSubmit} 
                      editingId={editingId} 
                      onCancel={handleCancelEdit} 
                    />

                    {/* BỘ LỌC TÌM KIẾM CHO ADMIN */}
                    <div className="max-w-5xl mx-auto mb-8">
                      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-end">
                        <div className="w-full md:flex-1 flex flex-col gap-1.5">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tìm kiếm (Admin)</span>
                          <input 
                            type="text" 
                            placeholder="Tìm tên hoặc mô tả khóa học..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm text-slate-800 placeholder-slate-400 bg-slate-50/50"
                          />
                        </div>

                        <div className="w-full sm:w-1/2 md:w-48 flex flex-col gap-1.5">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cấp độ</span>
                          <select 
                            value={level} 
                            onChange={(e) => setLevel(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-sm text-slate-700 bg-slate-50/50 font-medium cursor-pointer"
                          >
                            <option value="">Tất cả Cấp độ</option>
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                          </select>
                        </div>

                        <div className="w-full sm:w-1/2 md:w-48 flex flex-col gap-1.5">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Danh mục</span>
                          <select 
                            value={category} 
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-sm text-slate-700 bg-slate-50/50 font-medium cursor-pointer"
                          >
                            <option value="">Tất cả Danh mục</option>
                            <option value="IELTS">IELTS</option>
                            <option value="TOEIC">TOEIC</option>
                            <option value="Giao tiếp">Giao tiếp</option>
                          </select>
                        </div>

                        {(search || level || category) && (
                          <button 
                            onClick={handleClearFilters}
                            className="w-full sm:w-auto px-4 py-2.5 text-sm font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-xl transition-all cursor-pointer border border-orange-100 text-center flex items-center justify-center"
                          >
                            🔄 Reset
                          </button>
                        )}
                      </div>
                    </div>

                    {/* DANH SÁCH LƯỚI KHÓA HỌC DÀNH CHO ADMIN */}
                    <main className="max-w-5xl mx-auto">
                      <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-3">
                        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                          📚 Danh Sách Khóa Học Đang Mở 
                          <span className="px-2.5 py-0.5 bg-slate-200/60 rounded-full text-xs font-bold text-slate-600">
                            {courses.length}
                          </span>
                        </h2>
                      </div>
                      
                      {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-3">
                          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                          <p className="text-sm font-semibold text-slate-400">Đang đồng bộ dữ liệu...</p>
                        </div>
                      ) : courses.length === 0 ? (
                        <div className="py-20 bg-white rounded-3xl border border-slate-100 shadow-sm text-center max-w-lg mx-auto px-6">
                          <p className="text-4xl">🎓</p>
                          <h3 className="text-base font-bold text-slate-700 mt-2">Chưa có khóa học nào hoạt động</h3>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {courses.map((course) => (
                            <CourseCard 
                              key={course.id} 
                              course={course} 
                              onEdit={handleEditClick} 
                              onDelete={handleDelete} 
                            />
                          ))}
                        </div>
                      )}
                    </main>
                  </>
                )}

                {adminTab === 'registrations' && (
                  // TAB 2: QUẢN LÝ HỒ SƠ ĐĂNG KÝ HỌC VIÊN
                  <RegistrationManager />
                )}

                {adminTab === 'classrooms' && (
                  // TAB 3: QUẢN LÝ LỚP HỌC & ĐÀO TẠO ĐỘNG (LMS)
                  <ClassroomManager />
                )}

                {adminTab === 'accounts' && (
                  // TAB 4: QUẢN LÝ GIÁO VIÊN
                  <AdminAccountsManager />
                )}
              </div>
            </div>
          )}

        </div>
      )}

      {/* 3. MODAL ĐĂNG NHẬP HỆ THỐNG */}
      {showAuthModal && (
        <AuthPortal 
          onLoginSuccess={handleLoginSuccess}
          onClose={() => setShowAuthModal(false)}
        />
      )}

    </div>
  );
}

export default App;