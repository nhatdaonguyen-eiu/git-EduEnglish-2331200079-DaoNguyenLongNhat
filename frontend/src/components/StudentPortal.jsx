import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function StudentPortal() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Trạng thái tìm kiếm & bộ lọc của học viên
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('');
  const [category, setCategory] = useState('');

  // Trạng thái biểu mẫu đăng ký
  const initialRegForm = { fullName: '', phoneNumber: '', email: '', courseId: '', notes: '' };
  const [regForm, setRegForm] = useState(initialRegForm);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [regError, setRegError] = useState('');

  // Trạng thái Modal chi tiết khóa học
  const [selectedCourse, setSelectedCourse] = useState(null);

  const regFormRef = useRef(null);

  // Debounce tìm kiếm khóa học
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchActiveCourses();
    }, 250);
    return () => clearTimeout(delayDebounceFn);
  }, [search, level, category]);

  const fetchActiveCourses = async () => {
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
      console.error("Lỗi lấy danh sách khóa học:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRegForm({ ...regForm, [name]: value });
  };

  // Cuộn mượt mà đến Form đăng ký và auto-fill khóa học tương ứng
  const handleRegisterClick = (courseId) => {
    setRegForm({ ...regForm, courseId: courseId || '' });
    setSelectedCourse(null); // Đóng modal chi tiết nếu đang mở
    regFormRef.current?.scrollIntoView({ behavior: 'smooth' });
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
      
      {/* 1. HERO SECTION HOÀNH TRÁNG */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-orange-950 text-white py-20 px-6 sm:px-12 md:py-28">
        {/* Họa tiết nền mờ ảo */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl -translate-y-12 translate-x-12"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl translate-y-12 -translate-x-12"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <span className="px-4 py-1.5 bg-orange-500/15 text-orange-400 border border-orange-500/20 text-xs font-bold rounded-full tracking-wider uppercase">
            🚀 Kiến Tạo Tương Lai Của Bạn
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mt-6 tracking-tight leading-tight">
            Chinh Phục Tiếng Anh <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 bg-clip-text text-transparent">
              Vươn Ra Thế Giới
            </span>
          </h1>
          <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto mt-6 leading-relaxed font-medium">
            EduEnglish mang đến các chương trình đào tạo tiếng Anh chuẩn quốc tế (IELTS, TOEIC, Giao tiếp) giúp bạn tự tin mở khóa các cơ hội sự nghiệp toàn cầu.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => handleRegisterClick('')}
              className="px-8 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              📅 Đăng Ký Học Thử Ngay
            </button>
            <a 
              href="#courses-section"
              className="px-8 py-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-200 font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] text-center"
            >
              🔍 Khám Phá Khóa Học
            </a>
          </div>
        </div>
      </section>

      {/* 2. THANH THỐNG KÊ ẤN TƯỢNG */}
      <section className="max-w-5xl mx-auto px-4 -mt-10 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xl">
          <div className="flex items-center gap-4 border-b md:border-b-0 md:border-r border-slate-100 pb-5 md:pb-0 md:pr-6">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center text-2xl font-bold">
              👨‍🎓
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800">10,000+</p>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Học viên tin tưởng</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 border-b md:border-b-0 md:border-r border-slate-100 py-5 md:py-0 md:px-6">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center text-2xl font-bold">
              🏆
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800">98.5%</p>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Học viên đạt mục tiêu</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 pt-5 md:pt-0 md:pl-6">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center text-2xl font-bold">
              🌍
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800">150+</p>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Giáo viên đạt chuẩn bản xứ</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. KHU VỰC KHÓA HỌC DÀNH CHO HỌC VIÊN */}
      <section id="courses-section" className="max-w-5xl mx-auto px-4 mt-20">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-orange-500 bg-orange-50 px-3 py-1 rounded-full uppercase tracking-wider">
            Danh mục đào tạo
          </span>
          <h2 className="text-3xl font-black text-slate-800 mt-3">Các Khóa Học Đang Mở Tuyển Sinh</h2>
          <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
            Học phí ưu đãi, giáo trình chuẩn hóa. Hãy chọn chương trình phù hợp nhất để đạt mục tiêu của bạn.
          </p>
        </div>

        {/* BỘ LỌC CỦA HỌC VIÊN */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-end mb-8">
          <div className="w-full md:flex-1 flex flex-col gap-1.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tìm kiếm</span>
            <input 
              type="text" 
              placeholder="Nhập tên khóa học bạn quan tâm..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm bg-slate-50/50"
            />
          </div>

          <div className="w-full sm:w-1/2 md:w-48 flex flex-col gap-1.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cấp độ</span>
            <select 
              value={level} 
              onChange={(e) => setLevel(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-sm bg-slate-50/50 font-medium cursor-pointer"
            >
              <option value="">Tất cả Trình độ</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div className="w-full sm:w-1/2 md:w-48 flex flex-col gap-1.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chứng chỉ</span>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-sm bg-slate-50/50 font-medium cursor-pointer"
            >
              <option value="">Tất cả Chương trình</option>
              <option value="IELTS">IELTS</option>
              <option value="TOEIC">TOEIC</option>
              <option value="Giao tiếp">Giao tiếp</option>
            </select>
          </div>
        </div>

        {/* LƯỚI KHÓA HỌC */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-slate-400 font-medium">Đang tìm các khóa học tốt nhất...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8 max-w-md mx-auto shadow-sm">
            <p className="text-4xl">📚</p>
            <h3 className="text-base font-bold text-slate-700 mt-3">Chưa tìm thấy khóa học phù hợp</h3>
            <p className="text-xs text-slate-400 mt-1">Vui lòng thay đổi từ khóa hoặc bộ lọc của bạn.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const defaultImage = 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600&auto=format&fit=crop&q=60';
              const getLvlBadge = (lvl) => {
                if (lvl === 'Advanced') return 'bg-red-50 text-red-700 border-red-100';
                if (lvl === 'Intermediate') return 'bg-blue-50 text-blue-700 border-blue-100';
                return 'bg-green-50 text-green-700 border-green-100';
              };

              return (
                <div key={course.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 border border-slate-100 flex flex-col group h-full">
                  <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                    <img 
                      src={course.thumbnailUrl || defaultImage} 
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 px-3 py-1 text-xs font-bold text-white bg-orange-500 rounded-full shadow-md">
                      {course.category}
                    </span>
                    <span className={`absolute top-3 right-3 px-3 py-1 text-xs font-bold rounded-full border shadow-md ${getLvlBadge(course.level)}`}>
                      {course.level}
                    </span>
                  </div>

                  <div className="p-5 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 line-clamp-1 group-hover:text-orange-500 transition-colors" title={course.title}>
                        {course.title}
                      </h3>
                      <p className="text-slate-500 text-sm mt-2 line-clamp-2 h-10 overflow-hidden leading-relaxed">
                        {course.description || "Chưa có mô tả chi tiết cho khóa học này."}
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between items-baseline mt-4 pt-3 border-t border-slate-100">
                        <span className="text-xs text-slate-400 font-medium">Học phí ưu đãi</span>
                        <span className="text-lg font-black text-orange-500">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.price)}
                        </span>
                      </div>
                      <div className="flex gap-3 mt-4">
                        <button 
                          onClick={() => setSelectedCourse(course)}
                          className="flex-grow py-2.5 px-3 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-800 rounded-xl transition-all flex items-center justify-center cursor-pointer border border-slate-200/40"
                        >
                          🔍 Lộ trình
                        </button>
                        <button 
                          onClick={() => handleRegisterClick(course.id)}
                          className="flex-grow py-2.5 px-3 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl transition-all shadow-md shadow-orange-500/5 hover:shadow-orange-500/10 cursor-pointer"
                        >
                          📝 Đăng ký
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. BIỂU MẪU ĐĂNG KÝ TƯ VẤN / HỌC THỬ (DƯỚI TRANG) */}
      <section ref={regFormRef} className="max-w-2xl mx-auto px-4 mt-24">
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-lg border border-slate-100 relative overflow-hidden">
          {/* Nhãn trang trí góc */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-xl"></div>
          
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800">Đăng Ký Tư Vấn & Nhận Học Bổng</h2>
            <p className="text-slate-400 text-sm mt-1.5 font-medium">
              Điền thông tin của bạn dưới đây, chuyên viên tư vấn sẽ liên hệ trong 24 giờ tới.
            </p>
          </div>

          {success ? (
            // GIAO DIỆN THÀNH CÔNG RỰC RỠ
            <div className="text-center py-10 flex flex-col items-center gap-4 bg-orange-50/50 rounded-2xl border border-orange-100/50 p-6 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-3xl text-green-600">
                ✓
              </div>
              <h3 className="text-xl font-bold text-slate-800">Đăng Ký Thành Công!</h3>
              <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed">
                Cảm ơn bạn đã lựa chọn **EduEnglish**. Đội ngũ học vụ sẽ sớm gọi điện tư vấn lộ trình và gửi tặng ưu đãi học phí cho bạn.
              </p>
              <button 
                onClick={() => setSuccess(false)}
                className="mt-4 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md"
              >
                Tiếp Tục Đăng Ký Khác
              </button>
            </div>
          ) : (
            // BIỂU MẪU CHÍNH
            <form onSubmit={handleRegSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Họ và tên học viên</label>
                <input 
                  type="text" 
                  name="fullName" 
                  value={regForm.fullName} 
                  onChange={handleInputChange} 
                  placeholder="Ví dụ: Nguyễn Văn A" 
                  required 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm bg-slate-50/20 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Số điện thoại</label>
                  <input 
                    type="tel" 
                    name="phoneNumber" 
                    value={regForm.phoneNumber} 
                    onChange={handleInputChange} 
                    placeholder="Ví dụ: 0987654321" 
                    required 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm bg-slate-50/20 font-medium"
                  />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Địa chỉ Email</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={regForm.email} 
                    onChange={handleInputChange} 
                    placeholder="Ví dụ: name@gmail.com" 
                    required 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm bg-slate-50/20 font-medium"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Khóa học quan tâm</label>
                <select 
                  name="courseId" 
                  value={regForm.courseId} 
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm bg-slate-50/20 text-slate-700 font-semibold cursor-pointer"
                >
                  <option value="">Tư vấn chung (Chưa chọn khóa học cụ thể)</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.title} - [{course.category}]</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lời nhắn gửi trung tâm</label>
                <textarea 
                  name="notes" 
                  value={regForm.notes || ''} 
                  onChange={handleInputChange} 
                  placeholder="Ghi chú mục tiêu học tập (ví dụ: cần đạt IELTS 6.5 để ra trường, học giao tiếp phục vụ công việc)..." 
                  rows="3" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm bg-slate-50/20 font-medium resize-none leading-relaxed"
                />
              </div>

              {regError && (
                <p className="text-xs font-semibold text-red-500">⚠️ {regError}</p>
              )}

              <button 
                type="submit" 
                disabled={submitting}
                className="w-full py-3.5 px-6 mt-2 text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl shadow-lg shadow-orange-500/10 hover:shadow-orange-500/25 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Đang gửi thông tin đăng ký...
                  </>
                ) : (
                  "✓ Hoàn Tất Đăng Ký Tư Vấn"
                )}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* 5. MODAL CHI TIẾT KHÓA HỌC SANG TRỌNG */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-lg w-full border border-slate-100 animate-slide-up flex flex-col max-h-[90vh]">
            
            {/* Header / Ảnh bìa popup */}
            <div className="relative h-48 bg-slate-100 overflow-hidden shrink-0">
              <img 
                src={selectedCourse.thumbnailUrl || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600&auto=format&fit=crop&q=60'} 
                alt={selectedCourse.title} 
                className="w-full h-full object-cover"
              />
              <button 
                onClick={() => setSelectedCourse(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center font-bold transition-all cursor-pointer border-none shadow-md text-sm"
              >
                ✕
              </button>
              <span className="absolute bottom-4 left-4 px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">
                {selectedCourse.category}
              </span>
            </div>

            {/* Nội dung chi tiết */}
            <div className="p-6 overflow-y-auto flex-grow leading-relaxed">
              <span className="text-[10px] font-black text-orange-500 bg-orange-50 border border-orange-100/50 px-2 py-0.5 rounded uppercase tracking-wider">
                {selectedCourse.level} Level
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-800 mt-2">{selectedCourse.title}</h3>
              
              <div className="mt-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lộ trình học tập chi tiết</h4>
                <p className="text-slate-600 text-sm mt-1.5 whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-100 font-medium">
                  {selectedCourse.description || "Trung tâm sẽ cung cấp lộ trình chi tiết khi tư vấn cụ thể."}
                </p>
              </div>

              <div className="mt-6 flex justify-between items-center bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Học phí trọn gói</p>
                  <p className="text-xl font-black text-orange-500 mt-0.5">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedCourse.price)}
                  </p>
                </div>
                <span className="text-[10px] text-green-600 font-extrabold bg-green-50 px-2.5 py-1 rounded-full border border-green-200/50">
                  🎉 Khai giảng sớm
                </span>
              </div>
            </div>

            {/* Footer popup */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3 shrink-0">
              <button 
                onClick={() => setSelectedCourse(null)}
                className="flex-1 py-3 bg-white hover:bg-slate-100 text-slate-600 font-bold rounded-xl transition-all text-xs border border-slate-200 cursor-pointer"
              >
                Đóng lại
              </button>
              <button 
                onClick={() => handleRegisterClick(selectedCourse.id)}
                className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-md shadow-orange-500/10 hover:shadow-orange-500/20 text-xs cursor-pointer"
              >
                📝 Đăng ký khóa học này
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default StudentPortal;
