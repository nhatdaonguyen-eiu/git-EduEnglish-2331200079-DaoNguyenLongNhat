import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, Search, ArrowRight, X, Sparkles, ChevronRight, Compass, ArrowLeft } from 'lucide-react';

function CoursesPortal({ onNavigate, onBackToHome }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter State
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('');
  const [category, setCategory] = useState('');

  // Course Details Modal State
  const [selectedCourse, setSelectedCourse] = useState(null);

  const handleOpenCourse = (course, skipPushHistory = false) => {
    setSelectedCourse(course);
    if (!skipPushHistory) {
      window.history.pushState({ modal: 'course-detail', courseId: course.id }, '', `/courses?courseId=${course.id}`);
    }
  };

  const handleCloseCourse = () => {
    setSelectedCourse(null);
    if (window.location.search.includes('courseId=')) {
      window.history.back();
    }
  };

  // Sync state from query parameters on mount or when courses list changes, and listen for popstate
  useEffect(() => {
    const checkUrlParams = () => {
      const params = new URLSearchParams(window.location.search);
      const courseId = params.get('courseId');
      if (courseId) {
        const found = courses.find(c => c.id === parseInt(courseId));
        if (found) {
          setSelectedCourse(found);
        }
      } else {
        setSelectedCourse(null);
      }
    };

    checkUrlParams();

    window.addEventListener('popstate', checkUrlParams);
    return () => window.removeEventListener('popstate', checkUrlParams);
  }, [courses]);

  // Debounce API calls for searching and filtering
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCourses();
    }, 250);
    return () => clearTimeout(delayDebounceFn);
  }, [search, level, category]);

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
      console.error("Lỗi lấy danh sách khóa học:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = (courseId) => {
    setSelectedCourse(null);
    onNavigate('register-consultation', `/register-consultation?courseId=${courseId}`);
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-24 text-slate-800 animate-fade-in">
      
      {/* Pinned Back Button for mobile and desktop accessibility */}
      <div className="max-w-5xl mx-auto px-4 pt-6 pb-2 text-left">
        <button 
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-black text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 active:scale-95 rounded-xl transition-all duration-200 cursor-pointer border border-emerald-250/30 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại trang chủ
        </button>
      </div>

      {/* 1. HERO TITLE HEADER */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 text-white py-12 px-6 sm:px-12 text-center">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto relative z-10 space-y-4">
          <span className="inline-flex px-3 py-1 bg-emerald-500/15 text-emerald-450 border border-emerald-500/20 text-xs font-bold rounded-full tracking-wider uppercase">
            🎓 Hệ Thống Học Thuật Uy Tín
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Kho Tàng Khóa Học Tiếng Anh
          </h1>
          <p className="text-emerald-200 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed font-semibold">
            Tìm kiếm lộ trình học tập tối ưu với bộ lọc chuyên sâu. Kết nối trực tiếp đến các chương trình IELTS, TOEIC và tiếng Anh giao tiếp chuẩn quốc tế.
          </p>
        </div>
      </section>

      {/* 2. SEARCH BAR & MAIN ACTIONS */}
      <div className="max-w-5xl mx-auto px-4 -mt-6 relative z-20">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-lg flex gap-2">
          <div className="relative flex-grow">
            <input 
              type="text" 
              placeholder="Tìm tên khóa học hoặc kỹ năng bạn mong muốn..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-700 text-xs font-semibold bg-slate-50/50"
            />
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
          </div>
          <button 
            onClick={fetchCourses}
            className="px-6 py-3 bg-[#064e3b] hover:bg-[#047857] text-white text-xs font-black rounded-xl transition-all cursor-pointer border-none shadow"
          >
            Tìm Ngay
          </button>
        </div>
      </div>

      {/* 3. FILTERS & GRID LAYOUT */}
      <section className="max-w-5xl mx-auto px-4 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
          
          {/* Left filter options */}
          <div className="md:col-span-1 flex flex-col gap-6">
            
            {/* Level Selector */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Trình độ</h4>
              <div className="flex flex-col gap-3 text-xs font-bold text-slate-650">
                {['Beginner', 'Intermediate', 'Advanced'].map(lvl => (
                  <label key={lvl} className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={level === lvl}
                      onChange={() => setLevel(level === lvl ? '' : lvl)}
                      className="w-4 h-4 rounded border-slate-200 text-emerald-700 focus:ring-emerald-500/20 cursor-pointer"
                    />
                    <span>{lvl}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Category selection tags */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Phân loại</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: '', label: 'Tất cả' },
                  { key: 'IELTS', label: 'IELTS' },
                  { key: 'TOEIC', label: 'TOEIC' },
                  { key: 'Giao tiếp', label: 'Giao tiếp' }
                ].map(cat => (
                  <button
                    key={cat.key}
                    onClick={() => setCategory(cat.key)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-black transition-all border cursor-pointer ${
                      category === cat.key
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-250/30 shadow-sm'
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bot roadmap suggestion card */}
            <div className="bg-gradient-to-br from-emerald-400/90 to-emerald-300 p-5 rounded-2xl border border-emerald-300 shadow-sm flex flex-col gap-3 relative overflow-hidden text-emerald-950 shadow-emerald-500/5">
              <div className="w-9 h-9 rounded-xl bg-white/30 flex items-center justify-center text-sm">✨</div>
              <h5 className="font-extrabold text-xs mt-1">Gợi ý lộ trình</h5>
              <p className="text-[10px] font-bold leading-normal">Để AI của chúng tôi giúp bạn lựa chọn lộ trình tiếng Anh tối ưu nhất.</p>
              <button 
                onClick={() => {
                  const event = new CustomEvent('toggleChatbot');
                  window.dispatchEvent(event);
                }}
                className="w-full py-2 bg-[#064e3b] hover:bg-[#047857] text-white text-[10px] font-black rounded-lg cursor-pointer border-none shadow transition-all mt-1.5"
              >
                Trò chuyện với AI
              </button>
            </div>

          </div>

          {/* Right courses list grid */}
          <div className="md:col-span-3">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-3 border-emerald-700 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-slate-400 font-bold">Đang tìm các khóa học phù hợp...</p>
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8 max-w-md mx-auto shadow-sm">
                <p className="text-4xl">📚</p>
                <h3 className="text-sm font-bold text-slate-700 mt-3">Chưa có khóa học nào khớp bộ lọc</h3>
                <p className="text-xs text-slate-405 mt-1 font-semibold">Vui lòng điều chỉnh từ khóa hoặc bộ lọc của bạn.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course, idx) => {
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
                            onClick={() => handleOpenCourse(course)}
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
            )}
          </div>

        </div>
      </section>

      {/* 4. MODAL CHI TIẾT KHÓA HỌC SANG TRỌNG (HIGH-END ROADMAP SHOWCASE) */}
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
                onClick={handleCloseCourse}
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
                onClick={handleCloseCourse}
                className="flex-1 py-3 bg-white hover:bg-slate-100 text-slate-600 font-bold rounded-xl transition-all text-xs border border-slate-200 cursor-pointer"
              >
                Quay lại
              </button>
              <button 
                onClick={() => handleRegisterClick(selectedCourse.id)}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 text-xs cursor-pointer border-none"
              >
                📝 Đăng ký học ngay
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default CoursesPortal;
