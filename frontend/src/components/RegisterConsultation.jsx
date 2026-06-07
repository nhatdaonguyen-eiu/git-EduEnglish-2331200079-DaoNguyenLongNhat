import { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, Sparkles, BookOpen, User, Phone, Mail, FileText, CheckCircle } from 'lucide-react';

function RegisterConsultation({ onBackToHome }) {
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    courseId: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Fetch active courses on mount for selector dropdown
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoadingCourses(true);
        const response = await axios.get('http://localhost:8080/api/courses');
        setCourses(response.data);
        
        // Parse courseId query parameter if present
        const params = new URLSearchParams(window.location.search);
        const preselectedCourseId = params.get('courseId');
        if (preselectedCourseId) {
          setFormData(prev => ({ ...prev, courseId: preselectedCourseId }));
        }
      } catch (err) {
        console.error('Lỗi lấy danh sách khóa học cho form:', err);
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      const payload = {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        courseId: formData.courseId ? parseInt(formData.courseId) : null,
        notes: formData.notes,
        source: 'Website'
      };

      await axios.post('http://localhost:8080/api/registrations', payload);
      setSuccess(true);
      setFormData({ fullName: '', phoneNumber: '', email: '', courseId: '', notes: '' });
    } catch (err) {
      console.error('Lỗi gửi hồ sơ tư vấn:', err);
      setError(
        err.response?.data?.message || 
        err.response?.data?.error || 
        'Có lỗi xảy ra trong quá trình gửi yêu cầu. Vui lòng liên lạc lại sau hoặc liên hệ Hotline.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-700/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-xl w-full space-y-6 relative z-10 text-left">
        {/* Back Button */}
        <button 
          onClick={onBackToHome}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-black text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 active:scale-95 rounded-xl transition-all duration-200 cursor-pointer border border-emerald-250/30 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại trang chủ
        </button>

        {/* Form Container Card */}
        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xl overflow-hidden">
          {/* Header Banner */}
          <div className="bg-emerald-950 p-6 sm:p-8 text-white relative overflow-hidden text-center flex flex-col items-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-800/10 rounded-full blur-xl pointer-events-none"></div>
            <span className="px-3 py-1 bg-emerald-900 text-amber-400 border border-emerald-800 text-[10px] font-black uppercase tracking-widest rounded-full shadow-inner flex items-center gap-1.5 w-fit">
              <Sparkles className="w-3.5 h-3.5" /> Đồng hành cùng EduEnglish
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-3 text-white">
              Đăng Ký Tư Vấn Lộ Trình Học
            </h1>
            <p className="text-emerald-250 text-xs mt-1.5 max-w-sm leading-relaxed font-semibold">
              Hãy cung cấp thông tin để chúng tôi liên hệ xây dựng lộ trình học tập cá nhân hóa và cung cấp mức học phí ưu đãi nhất cho bạn.
            </p>
          </div>

          {/* Body Content */}
          <div className="p-6 sm:p-8">
            {success ? (
              <div className="py-8 text-center flex flex-col items-center gap-4 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center text-3xl shadow-sm">
                  <CheckCircle className="w-10 h-10 text-emerald-600" />
                </div>
                <h3 className="text-lg font-black text-slate-800">Gửi Yêu Cầu Thành Công!</h3>
                <p className="text-slate-500 text-xs leading-relaxed max-w-sm font-semibold">
                  Hệ thống đã tiếp nhận thông tin của bạn. Đội ngũ tư vấn học thuật của EduEnglish sẽ trực tiếp liên hệ lại với bạn qua số điện thoại đã cung cấp trong vòng 24 giờ.
                </p>
                <div className="flex gap-3 mt-4 w-full justify-center">
                  <button 
                    onClick={() => setSuccess(false)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-xl transition-all cursor-pointer border border-slate-200"
                  >
                    Đăng Ký Thêm
                  </button>
                  <button 
                    onClick={onBackToHome}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow transition-all cursor-pointer border-none"
                  >
                    Quay về Trang Chủ
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Full name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-slate-650 uppercase tracking-wide flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-600" /> Họ tên đầy đủ *
                  </label>
                  <input 
                    type="text" 
                    name="fullName" 
                    value={formData.fullName} 
                    onChange={handleInputChange} 
                    placeholder="Nhập họ và tên của bạn" 
                    required 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm font-semibold bg-slate-50/50 text-slate-800"
                  />
                </div>

                {/* Phone & Email row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-black text-slate-650 uppercase tracking-wide flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" /> Số điện thoại *
                    </label>
                    <input 
                      type="tel" 
                      name="phoneNumber" 
                      value={formData.phoneNumber} 
                      onChange={handleInputChange} 
                      placeholder="Nhập số điện thoại" 
                      required 
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm font-semibold bg-slate-50/50 text-slate-800"
                    />
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-black text-slate-650 uppercase tracking-wide flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-emerald-600" /> Địa chỉ Email *
                    </label>
                    <input 
                      type="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleInputChange} 
                      placeholder="Nhập địa chỉ email" 
                      required 
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm font-semibold bg-slate-50/50 text-slate-800"
                    />
                  </div>
                </div>

                {/* Target Course */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-slate-650 uppercase tracking-wide flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-600" /> Khóa học quan tâm
                  </label>
                  <select 
                    name="courseId" 
                    value={formData.courseId} 
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm font-semibold bg-slate-50/50 text-slate-700 cursor-pointer"
                  >
                    <option value="">Chọn khóa học bạn quan tâm (Không bắt buộc)</option>
                    {loadingCourses ? (
                      <option disabled>Đang tải danh sách khóa học...</option>
                    ) : (
                      courses.map(course => (
                        <option key={course.id} value={course.id}>
                          {course.title} ({course.level} - Chuyên môn {course.category})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Notes */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-slate-650 uppercase tracking-wide flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-600" /> Ghi chú hoặc câu hỏi
                  </label>
                  <textarea 
                    name="notes" 
                    value={formData.notes} 
                    onChange={handleInputChange} 
                    placeholder="Mục tiêu học tập của bạn, ca học mong muốn, hay câu hỏi cần giải đáp..." 
                    rows="3" 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm font-semibold bg-slate-50/50 text-slate-800 resize-none leading-relaxed"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200 animate-pulse">
                    ⚠️ {error}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full py-3 px-6 mt-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-black rounded-xl transition-all cursor-pointer border-none shadow-lg shadow-emerald-700/10 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang xử lý thông tin...
                    </>
                  ) : (
                    "✓ Gửi Yêu Cầu Tư Vấn Lộ Trình"
                  )}
                </button>

              </form>
            )}
          </div>
        </div>

        {/* Security standard notice */}
        <p className="text-[10px] text-slate-400 font-semibold text-center mt-2 leading-relaxed">
          🔒 Cam kết bảo mật thông tin 100%. Thông tin của bạn chỉ sử dụng cho mục đích tư vấn học tập tại EduEnglish.
        </p>
      </div>
    </div>
  );
}

export default RegisterConsultation;
