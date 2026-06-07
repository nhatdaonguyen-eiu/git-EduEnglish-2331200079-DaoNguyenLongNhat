import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function StudentPortal({ onNavigate }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // No search/filter states needed here anymore (moved to standalone Courses page)

  // Trạng thái biểu mẫu đăng ký
  const initialRegForm = { fullName: '', phoneNumber: '', email: '', courseId: '', notes: '' };
  const [regForm, setRegForm] = useState(initialRegForm);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [regError, setRegError] = useState('');

  // Trạng thái Modal chi tiết khóa học
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Trạng thái Đội ngũ Giảng viên
  const [teachers, setTeachers] = useState([]);
  const [teachersLoading, setTeachersLoading] = useState(true);

  // Trạng thái Hệ thống Blog SEO
  const [blogs, setBlogs] = useState([]);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [selectedBlog, setSelectedBlog] = useState(null);

  const fetchActiveTeachers = async () => {
    try {
      setTeachersLoading(true);
      const res = await axios.get('http://localhost:8080/api/auth/teachers');
      setTeachers(res.data);
    } catch (err) {
      console.error("Lỗi lấy danh sách giáo viên:", err);
    } finally {
      setTeachersLoading(false);
    }
  };

  const fetchActiveBlogs = async () => {
    try {
      setBlogsLoading(true);
      const res = await axios.get('http://localhost:8080/api/blogs');
      setBlogs(res.data);
    } catch (err) {
      console.error("Lỗi lấy danh sách bài viết:", err);
    } finally {
      setBlogsLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveTeachers();
    fetchActiveBlogs();
  }, []);

  const regFormRef = useRef(null);

  useEffect(() => {
    fetchActiveCourses();
  }, []);

  const fetchActiveCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/api/courses');
      setCourses(response.data);
    } catch (error) {
      console.error("Lỗi lấy danh sách khóa học:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRegForm({ ...regForm, [name]: value });
  };

  // Cuộn mượt mà lên Form đăng ký tư vấn nổi ở Hero và auto-fill khóa học tương ứng
  const handleRegisterClick = (courseId) => {
    setRegForm(prev => ({ ...prev, courseId: courseId || '' }));
    setSelectedCourse(null); // Đóng modal chi tiết nếu đang mở
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRegSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setRegError('');
    setSuccess(false);

    try {
      const payload = {
        fullName: regForm.fullName,
        phoneNumber: regForm.phoneNumber,
        email: regForm.email,
        courseId: regForm.courseId ? parseInt(regForm.courseId) : null,
        notes: regForm.notes
      };

      await axios.post('http://localhost:8080/api/registrations', payload);
      setSuccess(true);
      setRegForm(initialRegForm);
    } catch (err) {
      console.error("Lỗi đăng ký tư vấn:", err);
      setRegError(
        err.response?.data?.message || 
        err.response?.data?.error || 
        'Có lỗi xảy ra trong quá trình đăng ký. Vui lòng kiểm tra lại thông tin.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-24 text-slate-800">
      
      {/* 1. HERO SECTION HOÀNH TRÁNG KÈM MOCKUP TRỰC QUAN */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 text-white py-16 px-6 sm:px-12 md:py-24">
        {/* Họa tiết nền mờ ảo */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -translate-y-12 translate-x-12"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl translate-y-12 -translate-x-12"></div>

        <div className="max-w-6xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* CỘT TRÁI: THÔNG ĐIỆP CHÍNH */}
          <div className="lg:col-span-7 text-left space-y-6">
            <span className="inline-flex px-3 py-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-full tracking-wider uppercase">
              🚀 Kiến Tạo Tương Lai Của Bạn
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Chinh Phục Tiếng Anh <br />
              <span className="bg-gradient-to-r from-emerald-400 via-emerald-350 to-amber-305 bg-clip-text text-transparent">
                Vươn Ra Thế Giới
              </span>
            </h1>
            <p className="text-slate-350 text-xs sm:text-sm md:text-base leading-relaxed font-medium max-w-xl">
              EduEnglish mang đến các chương trình đào tạo tiếng Anh chuẩn học thuật quốc tế (IELTS, TOEIC, Giao tiếp) giúp bạn tự tin mở khóa các cơ hội sự nghiệp toàn cầu.
            </p>
            
            <div className="pt-2 flex flex-wrap gap-4">
              <button 
                onClick={() => {
                  regFormRef.current?.scrollIntoView({ behavior: 'smooth' });
                  const nameInput = document.querySelector('input[name="fullName"]');
                  if (nameInput) nameInput.focus();
                }}
                className="px-6 py-3 bg-amber-400 hover:bg-amber-500 text-emerald-955 font-black rounded-xl shadow-lg shadow-amber-400/20 transition-all hover:scale-[1.02] active:scale-[0.98] text-center text-xs cursor-pointer border-none"
              >
                ⚡ Đăng Ký Tư Vấn Lộ Trình
              </button>
              <a 
                href="#courses-section"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('courses-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-lg shadow-emerald-700/20 transition-all hover:scale-[1.02] active:scale-[0.98] text-center text-xs cursor-pointer border border-emerald-500/30"
              >
                📚 Khám Phá Khóa Học
              </a>
            </div>

            {/* Quick stats badges */}
            <div className="pt-6 border-t border-emerald-900/50 grid grid-cols-3 gap-4">
              <div>
                <p className="text-xl md:text-2xl font-black text-white">10,000+</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Học viên tin chọn</p>
              </div>
              <div>
                <p className="text-xl md:text-2xl font-black text-white">98.5%</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Đạt mục tiêu đầu ra</p>
              </div>
              <div>
                <p className="text-xl md:text-2xl font-black text-white">150+</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Giáo viên bản xứ</p>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: FORM ĐĂNG KÝ TƯ VẤN HỌC TẬP SANG TRỌNG */}
          <div ref={regFormRef} className="lg:col-span-5 animate-fade-in">
            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-6 sm:p-8 rounded-3xl shadow-2xl text-left relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-emerald-500/10 rounded-full blur-xl pointer-events-none"></div>
              
              <h3 className="text-lg font-black text-white mb-1 flex items-center gap-2">
                ⚡ Đăng Ký Tư Vấn Học Tập
              </h3>
              <p className="text-[10px] text-slate-400 font-semibold mb-6">
                Nhận ngay lộ trình cá nhân hóa & ưu đãi học phí mới nhất.
              </p>

              {success ? (
                <div className="text-center py-8 flex flex-col items-center gap-4 bg-emerald-950/40 rounded-2xl border border-emerald-900/50 p-6 animate-fade-in text-white">
                  <div className="w-12 h-12 rounded-full bg-emerald-900/60 border border-emerald-500/30 flex items-center justify-center text-2xl text-emerald-450 shadow-inner">
                    ✓
                  </div>
                  <h4 className="text-base font-black">Gửi yêu cầu thành công!</h4>
                  <p className="text-slate-300 text-xs leading-relaxed max-w-xs mx-auto font-medium">
                    Cảm ơn bạn đã quan tâm. Đội ngũ tư vấn viên sẽ liên hệ với bạn trong vòng 24 giờ tới.
                  </p>
                  <button 
                    type="button"
                    onClick={() => setSuccess(false)}
                    className="mt-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition-all cursor-pointer shadow-md border-none"
                  >
                    Đăng ký tiếp
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRegSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Họ và tên học viên *</label>
                    <input 
                      type="text" 
                      name="fullName" 
                      value={regForm.fullName} 
                      onChange={handleInputChange} 
                      placeholder="Ví dụ: Nguyễn Văn A" 
                      required 
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs bg-slate-950/50 text-white placeholder-slate-650 font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Số điện thoại *</label>
                      <input 
                        type="tel" 
                        name="phoneNumber" 
                        value={regForm.phoneNumber} 
                        onChange={handleInputChange} 
                        placeholder="Ví dụ: 0987654321" 
                        required 
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs bg-slate-950/50 text-white placeholder-slate-650 font-semibold"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Địa chỉ Email *</label>
                      <input 
                        type="email" 
                        name="email" 
                        value={regForm.email} 
                        onChange={handleInputChange} 
                        placeholder="Ví dụ: name@gmail.com" 
                        required 
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs bg-slate-950/50 text-white placeholder-slate-650 font-semibold"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Khóa học quan tâm</label>
                    <select 
                      name="courseId" 
                      value={regForm.courseId} 
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs bg-slate-950/50 text-slate-300 font-semibold cursor-pointer"
                    >
                      <option value="" className="bg-slate-900 text-white">Tư vấn chung (Chưa chọn khóa học)</option>
                      {courses.map(course => (
                        <option key={course.id} value={course.id} className="bg-slate-900 text-white">{course.title} - [{course.category}]</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Lời nhắn gửi trung tâm</label>
                    <textarea 
                      name="notes" 
                      value={regForm.notes || ''} 
                      onChange={handleInputChange} 
                      placeholder="Ghi chú mục tiêu học tập (ví dụ: cần đạt IELTS 6.5 để ra trường)..." 
                      rows="2" 
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs bg-slate-950/50 text-white placeholder-slate-655 font-semibold resize-none leading-relaxed"
                    />
                  </div>

                  {regError && (
                    <p className="text-[10px] font-semibold text-red-400">⚠️ {regError}</p>
                  )}

                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full py-3 px-6 mt-2 text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/25 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 border-none"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Đang gửi yêu cầu...
                      </>
                    ) : (
                      "✓ Hoàn Tất Đăng Ký Tư Vấn"
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. THANH THỐNG KÊ ẤN TƯỢNG */}
      <section className="max-w-5xl mx-auto px-4 -mt-10 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xl">
          <div className="flex items-center gap-4 border-b md:border-b-0 md:border-r border-slate-100 pb-5 md:pb-0 md:pr-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-2xl font-bold">
              👨‍🎓
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800">10,000+</p>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Học viên tin tưởng</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 border-b md:border-b-0 md:border-r border-slate-100 py-5 md:py-0 md:px-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-2xl font-bold">
              🏆
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800">98.5%</p>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Học viên đạt mục tiêu</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 pt-5 md:pt-0 md:pl-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-2xl font-bold">
              🌍
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800">150+</p>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Giáo viên đạt chuẩn bản xứ</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. KHU VỰC KHÓA HỌC DÀNH CHO HỌC VIÊN (COURSE CATALOG) */}
      <section id="courses-section" className="max-w-5xl mx-auto px-4 mt-20">
        <div className="text-center mb-10">
          <span className="inline-flex px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-250/30 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm mb-2">
            Chương Trình Đào Tạo
          </span>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Khóa Học Nổi Bật</h2>
          <p className="text-slate-450 text-xs sm:text-sm font-semibold mt-1.5 max-w-xl mx-auto leading-relaxed">
            Nâng tầm kỹ năng Anh ngữ với các chương trình học nổi bật chất lượng cao, thiết kế tối ưu cho học viên.
          </p>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-emerald-700 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-400 font-bold">Đang tải danh sách khóa học...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8 max-w-md mx-auto shadow-sm">
            <p className="text-4xl">📚</p>
            <h3 className="text-sm font-bold text-slate-700 mt-3">Chưa có khóa học nào</h3>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {courses.slice(0, 3).map((course, idx) => {
                const defaultImage = 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600&auto=format&fit=crop&q=60';
                const cardTag = idx === 0 ? 'Bán chạy' : idx === 2 ? 'Mới' : null;

                return (
                  <div key={course.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 border border-slate-100 flex flex-col group h-full">
                    <div className="relative h-40 w-full overflow-hidden bg-slate-100 shrink-0">
                      <img 
                        src={course.thumbnailUrl || defaultImage} 
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {cardTag && (
                        <span className={`absolute top-3 left-3 px-2 py-0.5 text-[8px] font-black text-white rounded-md shadow-sm uppercase tracking-wider ${
                          cardTag === 'Bán chạy' ? 'bg-[#10b981]' : 'bg-[#f59e0b]'
                        }`}>
                          {cardTag}
                        </span>
                      )}
                    </div>

                    <div className="p-4 flex-grow flex flex-col justify-between text-left">
                      <div>
                        <p className="text-[9px] text-slate-400 font-bold flex items-center gap-1 uppercase">
                          <span className="text-emerald-700">● {course.level}</span>
                          <span>•</span>
                          <span>{course.duration || '12 tuần'}</span>
                          <span>•</span>
                          <span>{course.lessonsCount || '30 bài giảng'}</span>
                        </p>
                        <h3 
                          onClick={() => setSelectedCourse(course)}
                          className="text-xs sm:text-sm font-black text-slate-800 line-clamp-2 mt-2 hover:text-emerald-800 transition-colors leading-snug cursor-pointer" 
                          title={course.title}
                        >
                          {course.title}
                        </h3>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <div className="flex flex-col">
                          <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">HỌC PHÍ</span>
                          <span className="text-xs sm:text-sm font-black text-slate-700">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.price)}
                          </span>
                        </div>
                        <button 
                          onClick={() => handleRegisterClick(course.id)}
                          className="px-3.5 py-2 bg-[#064e3b] hover:bg-[#047857] text-white text-[10px] font-black rounded-lg transition-all shadow-sm active:scale-95 border-none cursor-pointer"
                        >
                          Đăng ký
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center mt-12">
              <button 
                onClick={() => onNavigate('courses-portal', '/courses')}
                className="px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-[0.98] transition-all cursor-pointer border-none flex items-center gap-2"
              >
                Xem Toàn Bộ Khóa Học ➔
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 🧭 ĐỘI NGŨ GIẢNG VIÊN SÁNG GIÁ (FACULTY SHOWCASE) */}
      <section id="faculty-section" className="max-w-5xl mx-auto px-4 mt-24">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-emerald-650 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
            Chất lượng đào tạo hàng đầu
          </span>
          <h2 className="text-3xl font-black text-slate-800 mt-3">Đội Ngũ Giảng Viên Sáng Giá</h2>
          <p className="text-slate-500 text-sm mt-2 max-w-lg mx-auto">
            Gặp gỡ những chuyên gia Anh ngữ tài năng, tận tâm với trình độ chuyên môn cao và phương pháp giảng dạy truyền cảm hứng.
          </p>
        </div>

        {teachersLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-emerald-650 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-400 font-semibold">Đang kết nối đội ngũ giảng viên...</p>
          </div>
        ) : teachers.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-100 p-8 max-w-md mx-auto shadow-sm">
            <p className="text-3xl">👨‍🏫</p>
            <h3 className="text-sm font-bold text-slate-700 mt-2">EduEnglish Faculty</h3>
            <p className="text-xs text-slate-400 mt-1">Đội ngũ giảng viên quốc tế sẽ sớm cập nhật đầy đủ hồ sơ trực tuyến.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teachers.map((teacher) => {
              const defaultAvatar = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80';
              return (
                <div 
                  key={teacher.id} 
                  className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 border border-slate-100/80 flex flex-col group p-6 relative"
                >
                  {/* Decorative background aura */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-colors"></div>

                  <div className="flex items-center gap-4 border-b border-slate-100 pb-4 mb-4">
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-2xl overflow-hidden shadow border border-slate-200/60 bg-slate-50 shrink-0">
                      {teacher.avatarUrl ? (
                        <img 
                          src={teacher.avatarUrl} 
                          alt={teacher.fullName} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center text-white font-black text-xl select-none">
                          {teacher.fullName.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div className="text-left min-w-0">
                      <h3 className="text-base font-black text-slate-800 truncate group-hover:text-emerald-705 transition-colors duration-200">{teacher.fullName}</h3>
                      <p className="text-[10px] font-black text-emerald-650 bg-emerald-50 border border-emerald-100/60 px-2 py-0.5 rounded inline-block uppercase tracking-wider mt-1 truncate max-w-full">
                        {teacher.specialty || "Giảng viên Anh ngữ"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 flex-grow text-left text-xs font-semibold leading-relaxed">
                    {/* Kinh nghiệm */}
                    <div className="flex items-center gap-2 text-slate-500">
                      <span className="text-sm shrink-0">🕒</span>
                      <p className="truncate text-slate-600">{teacher.experience || "Nhiều năm kinh nghiệm giảng dạy"}</p>
                    </div>

                    {/* Bằng cấp */}
                    <div className="flex items-center gap-2 text-slate-500">
                      <span className="text-sm shrink-0">📜</span>
                      <p className="truncate text-slate-700 font-extrabold">{teacher.certificates || "Đầy đủ chứng chỉ sư phạm quốc tế"}</p>
                    </div>

                    {/* Lời giới thiệu ngắn */}
                    <div className="pt-2 border-t border-slate-50 text-slate-400 font-medium text-[11px] leading-relaxed line-clamp-3">
                      "{teacher.bio || "Phương pháp giảng dạy sinh động giúp học viên hứng thú học tập và đạt kết quả tối đa."}"
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 📰 CẨM NANG HỌC TIẾNG ANH (SEO BLOG GRID) */}
      <section className="max-w-5xl mx-auto px-4 mt-24">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-emerald-650 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
            Cẩm nang & Bí quyết học tốt
          </span>
          <h2 className="text-3xl font-black text-slate-800 mt-3">Kinh Nghiệm Học Tiếng Anh</h2>
          <p className="text-slate-500 text-sm mt-2 max-w-lg mx-auto">
            Khám phá các bài chia sẻ kinh nghiệm tự học IELTS, lộ trình ôn luyện thi TOEIC và mẹo giao tiếp tiếng Anh trôi chảy từ chuyên gia.
          </p>
        </div>

        {blogsLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-emerald-650 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-400 font-semibold">Đang cập nhật các bài viết hay nhất...</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-100 p-8 max-w-md mx-auto shadow-sm">
            <p className="text-3xl">📰</p>
            <h3 className="text-sm font-bold text-slate-700 mt-2">EduEnglish Handbook</h3>
            <p className="text-xs text-slate-400 mt-1">Các bài viết chia sẻ tri thức bổ ích sẽ sớm được xuất bản.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => {
              const defaultThumb = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400';
              return (
                <div 
                  key={blog.id} 
                  className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 border border-slate-100/80 flex flex-col group h-full cursor-pointer text-left"
                  onClick={() => setSelectedBlog(blog)}
                >
                  {/* Banner */}
                  <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                    <img 
                      src={blog.thumbnailUrl || defaultThumb} 
                      alt={blog.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 px-3 py-1 text-[10px] font-black text-white bg-slate-900/60 rounded-full backdrop-blur-sm">
                      📖 Cẩm nang
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-5 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-slate-800 line-clamp-2 leading-snug group-hover:text-emerald-705 transition-colors" title={blog.title}>
                        {blog.title}
                      </h3>
                      <p className="text-slate-500 text-[11px] font-semibold mt-2 line-clamp-3 leading-relaxed">
                        {blog.summary ? blog.summary.replace(/<[^>]*>/g, '') : ''}
                      </p>
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100 text-[11px] font-bold text-emerald-650">
                      <span>Đọc bài viết ➔</span>
                      <span className="text-slate-400 font-medium">
                        {new Date(blog.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>



      {/* 5. MODAL CHI TIẾT KHÓA HỌC SANG TRỌNG (HIGH-END ROADMAP SHOWCASE) */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-2xl w-full border border-slate-100 animate-slide-up flex flex-col max-h-[92vh]">
            
            {/* Header / Ảnh bìa popup */}
            <div className="relative h-56 bg-slate-100 overflow-hidden shrink-0">
              <img 
                src={selectedCourse.thumbnailUrl || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600&auto=format&fit=crop&q=60'} 
                alt={selectedCourse.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
              
              <button 
                onClick={() => setSelectedCourse(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center font-bold transition-all cursor-pointer border-none shadow-md text-sm z-10"
              >
                ✕
              </button>
              
              <div className="absolute bottom-4 left-5 right-5 text-left">
                <span className="inline-block px-3 py-1 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow">
                  {selectedCourse.category} • {selectedCourse.level} Level
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-1.5 drop-shadow-sm">{selectedCourse.title}</h3>
              </div>
            </div>

            {/* Nội dung chi tiết lộ trình */}
            <div className="p-6 sm:p-8 overflow-y-auto flex-grow space-y-6">
              
              {/* Tóm tắt nhanh & Thời lượng học */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/40 flex items-start gap-3">
                  <span className="text-xl">🕒</span>
                  <div>
                    <h4 className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Thời lượng khóa học</h4>
                    <p className="text-sm font-black text-slate-800 mt-0.5">{selectedCourse.duration || "Chưa thiết lập"}</p>
                  </div>
                </div>

                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/40 flex items-start gap-3">
                  <span className="text-xl">👥</span>
                  <div>
                    <h4 className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Đối tượng phù hợp</h4>
                    <p className="text-sm font-black text-slate-800 mt-0.5 line-clamp-2" title={selectedCourse.suitableFor}>{selectedCourse.suitableFor || "Học viên mong muốn nâng cao trình độ"}</p>
                  </div>
                </div>
              </div>

              {/* MÔ TẢ KHÓA HỌC */}
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Giới thiệu khóa học
                </h4>
                <p className="text-slate-655 text-sm mt-1.5 leading-relaxed font-medium">
                  {selectedCourse.description || "Khóa học được thiết kế đặc thù nhằm nâng cao toàn diện năng lực tiếng Anh của học viên trong thời gian tối ưu."}
                </p>
              </div>

              {/* MỤC TIÊU & PHƯƠNG PHÁP & CAM KẾT (GRID 3 CỘT) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60 flex flex-col justify-between">
                  <div>
                    <h5 className="text-[10px] font-black text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                      <span>🎯</span> Mục tiêu đầu ra
                    </h5>
                    <p className="text-xs text-slate-500 mt-1.5 font-semibold leading-relaxed">
                      {selectedCourse.outputGoals || "Đạt chuẩn cam kết đầu ra theo lộ trình quốc tế."}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60 flex flex-col justify-between">
                  <div>
                    <h5 className="text-[10px] font-black text-indigo-600 uppercase tracking-wider flex items-center gap-1">
                      <span>🧠</span> Phương pháp học
                    </h5>
                    <p className="text-xs text-slate-500 mt-1.5 font-semibold leading-relaxed">
                      {selectedCourse.learningMethod || "Phản xạ giao tiếp năng động kết hợp tương tác trực quan."}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60 flex flex-col justify-between">
                  <div>
                    <h5 className="text-[10px] font-black text-amber-600 uppercase tracking-wider flex items-center gap-1">
                      <span>🤝</span> Cam kết đào tạo
                    </h5>
                    <p className="text-xs text-slate-500 mt-1.5 font-semibold leading-relaxed">
                      {selectedCourse.commitment || "Cam kết hỗ trợ học viên đạt mục tiêu đầu ra cam đoan."}
                    </p>
                  </div>
                </div>
              </div>

              {/* LỘ TRÌNH & GIÁO TRÌNH CHI TIẾT */}
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Giáo trình & Lộ trình đào tạo chi tiết
                </h4>
                <div className="bg-slate-50 border border-slate-150 p-5 rounded-2xl font-mono text-xs leading-relaxed text-slate-700 whitespace-pre-line max-h-56 overflow-y-auto">
                  {selectedCourse.syllabus || "Tuần 1: Củng cố nền tảng phát âm chuẩn\nTuần 2: Mở rộng từ vựng giao tiếp cốt lõi\nTuần 3: Chiến thuật làm bài & Luyện đề thực tế"}
                </div>
              </div>

              {/* HỌC PHÍ & TRẠNG THÁI KHAI GIẢNG */}
              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-150 shrink-0">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Học phí trọn khóa ưu đãi</p>
                  <p className="text-xl font-black text-emerald-650 mt-0.5">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedCourse.price)}
                  </p>
                </div>
                <span className="text-[10px] text-green-600 font-extrabold bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
                  💚 Đang mở cổng đăng ký
                </span>
              </div>

            </div>

            {/* Footer popup */}
            <div className="p-4 sm:px-6 bg-slate-50 border-t border-slate-100 flex gap-3 shrink-0">
              <button 
                onClick={() => setSelectedCourse(null)}
                className="flex-1 py-3 bg-white hover:bg-slate-100 text-slate-600 font-bold rounded-xl transition-all text-xs border border-slate-200 cursor-pointer"
              >
                Quay lại
              </button>
              <button 
                onClick={() => {
                  setSelectedCourse(null);
                  handleRegisterClick(selectedCourse.id);
                }}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 text-xs cursor-pointer border-none"
              >
                📝 Đăng ký học ngay
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 6. MODAL ĐỌC BÀI VIẾT BLOG SEO CHUẨN GOOGLE (HIGH-END ARTICLE READER) */}
      {selectedBlog && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-3xl w-full border border-slate-100 animate-slide-up flex flex-col max-h-[94vh]">
            
            {/* Header / Banner ảnh bìa sắc nét */}
            <div className="relative h-60 bg-slate-100 overflow-hidden shrink-0">
              <img 
                src={selectedBlog.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'} 
                alt={selectedBlog.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/35 to-transparent"></div>
              
              <button 
                onClick={() => setSelectedBlog(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center font-bold transition-all cursor-pointer border-none shadow-md text-sm z-10"
              >
                ✕
              </button>
              
              <div className="absolute bottom-5 left-6 right-6 text-left">
                <span className="inline-block px-3 py-1 bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow mb-2.5">
                  📰 Cẩm Nang Tri Thức
                </span>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight drop-shadow-md">
                  {selectedBlog.title}
                </h1>
              </div>
            </div>

            {/* Nội dung bài viết SEO */}
            <div className="p-6 sm:p-8 overflow-y-auto flex-grow space-y-6 text-left">
              
              {/* 🎯 Khung Trả Lời Nhanh Trực Diện (Summary Box - Featured Snippet Booster) */}
              <div className="bg-orange-50/60 border border-orange-100/50 p-5 rounded-2xl relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-orange-500/5 rounded-full pointer-events-none"></div>
                <h3 className="text-xs font-black text-orange-600 uppercase tracking-widest flex items-center gap-1.5">
                  🎯 Tóm tắt câu trả lời nhanh
                </h3>
                <div 
                  className="text-sm font-bold text-slate-700 mt-2 leading-relaxed prose prose-orange max-w-none text-left"
                  dangerouslySetInnerHTML={{ __html: selectedBlog.summary }}
                />
              </div>

              {/* 📖 Thân bài phân cấp H2/H3 */}
              <div 
                className="prose prose-slate max-w-none text-slate-600 text-sm leading-relaxed font-medium space-y-4 
                  prose-headings:text-slate-800 prose-headings:font-black prose-headings:tracking-tight
                  prose-h2:text-lg prose-h2:border-l-4 prose-h2:border-orange-500 prose-h2:pl-3 prose-h2:pt-2
                  prose-h3:text-sm prose-h3:text-orange-600 prose-h3:font-extrabold"
                dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
              />

              {/* 🙋 FAQs Accordion (Featured Snippets FAQ Section) */}
              {selectedBlog.faq && (() => {
                try {
                  const faqs = JSON.parse(selectedBlog.faq);
                  if (faqs.length === 0) return null;
                  return (
                    <div className="border-t border-slate-100 pt-6 space-y-4">
                      <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                        🙋 Có Thể Bạn Quan Tâm (FAQs)
                      </h3>
                      <div className="space-y-3">
                        {faqs.map((faq, index) => (
                          <div key={index} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-2">
                            <h4 className="text-xs font-black text-slate-800 flex items-start gap-1">
                              <span className="text-emerald-600 shrink-0">Q:</span>
                              <span dangerouslySetInnerHTML={{ __html: faq.q }} />
                            </h4>
                            <div 
                              className="text-xs text-slate-500 font-semibold leading-relaxed pl-4 border-l border-slate-200 prose prose-slate max-w-none text-left"
                              dangerouslySetInnerHTML={{ __html: faq.a }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                } catch (e) {
                  return null;
                }
              })()}

              {/* 📣 Hộp Kêu Gọi Hành Động Mềm Mại (Soft CTA Box) */}
              {selectedBlog.ctaText && (
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 mt-8">
                  <div className="text-left">
                    <h4 className="text-xs font-black text-slate-800 font-bold">Muốn đạt mục tiêu đột phá?</h4>
                    <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Chúng tôi hỗ trợ kiểm tra năng lực & lên lộ trình cá nhân hóa miễn phí.</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedBlog(null);
                      // Scroll to target link
                      const link = selectedBlog.ctaLink || '#register-section';
                      if (link.startsWith('#')) {
                        const target = document.getElementById(link.substring(1)) || regFormRef.current;
                        target?.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        window.open(link, '_blank');
                      }
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 cursor-pointer border-none flex items-center justify-center shrink-0"
                  >
                    🚀 {selectedBlog.ctaText}
                  </button>
                </div>
              )}

            </div>

            {/* Footer popup */}
            <div className="p-4 sm:px-6 bg-slate-50 border-t border-slate-100 flex gap-3 shrink-0">
              <button 
                onClick={() => setSelectedBlog(null)}
                className="w-full py-3 bg-white hover:bg-slate-100 text-slate-600 font-bold rounded-xl transition-all text-xs border border-slate-200 cursor-pointer"
              >
                Đóng bài viết
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default StudentPortal;
