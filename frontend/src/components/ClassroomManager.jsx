import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ClassroomManager() {
  const [classrooms, setClassrooms] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);

  // Form states
  const [newClass, setNewClass] = useState({ 
    className: '', 
    courseId: '', 
    teacherId: '', 
    schedule: '',
    semester: 'Học kỳ 1 - 2026',
    tuitionFee: ''
  });
  const [enrollment, setEnrollment] = useState({ classId: '', studentId: '' });

  // Sub-tabs: 'list' (Danh sách & Tạo lớp), 'enroll' (Xếp lớp học viên), 'tuition' (Quản lý học phí)
  const [subTab, setSubTab] = useState('list');
  const [loading, setLoading] = useState(true);
  
  // Trạng thái xem danh sách học viên lớp cụ thể
  const [inspectClass, setInspectClass] = useState(null);
  const [inspectedStudents, setInspectedStudents] = useState([]);
  const [loadingInspect, setLoadingInspect] = useState(false);

  // --- NEW TUITION STATISTICS STATES ---
  const [tuitionStats, setTuitionStats] = useState(null);
  const [statsClassId, setStatsClassId] = useState('');
  const [statsSemester, setStatsSemester] = useState('');
  const [manualPayEnrollmentId, setManualPayEnrollmentId] = useState(null);
  const [manualPayAmount, setManualPayAmount] = useState('');
  const [manualPayMethod, setManualPayMethod] = useState('CASH');
  const [manualPayNote, setManualPayNote] = useState('');
  const [loadingStats, setLoadingStats] = useState(false);
  const [activeTuitionSubTab, setActiveTuitionSubTab] = useState('unpaid');

  // --- NEW PAYMENT GATEWAY CUSTOMIZATION STATES ---
  const [paymentConfigs, setPaymentConfigs] = useState([]);
  const [editingConfigId, setEditingConfigId] = useState(null);
  const [editConfigForm, setEditConfigForm] = useState({
    gatewayName: '',
    accountNumber: '',
    accountName: '',
    syntaxTemplate: '',
    qrUrl: '',
    isActive: true
  });
  const [uploadingQr, setUploadingQr] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [classRes, teacherRes, studentRes, courseRes, configsRes] = await Promise.all([
        axios.get('http://localhost:8080/api/classrooms'),
        axios.get('http://localhost:8080/api/auth/teachers'),
        axios.get('http://localhost:8080/api/auth/students'),
        axios.get('http://localhost:8080/api/courses'),
        axios.get('http://localhost:8080/api/payment-configs')
      ]);

      setClassrooms(classRes.data);
      setTeachers(teacherRes.data);
      setStudents(studentRes.data);
      setCourses(courseRes.data);
      setPaymentConfigs(configsRes.data);
      
      // Khởi tạo giá trị mặc định cho dropdown
      if (courseRes.data.length > 0 && teacherRes.data.length > 0) {
        setNewClass({
          className: '',
          courseId: courseRes.data[0].id.toString(),
          teacherId: teacherRes.data[0].id.toString(),
          schedule: 'Thứ 2, 4, 6 | 19:30 - 21:00',
          semester: 'Học kỳ 1 - 2026',
          tuitionFee: courseRes.data[0].price ? courseRes.data[0].price.toString() : ''
        });
      }
      
      if (classRes.data.length > 0 && studentRes.data.length > 0) {
        setEnrollment({
          classId: classRes.data[0].id.toString(),
          studentId: studentRes.data[0].id.toString()
        });
      }
    } catch (err) {
      console.error("Lỗi tải thông tin lớp học:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClassSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        className: newClass.className,
        courseId: parseInt(newClass.courseId),
        teacherId: parseInt(newClass.teacherId),
        schedule: newClass.schedule,
        semester: newClass.semester,
        tuitionFee: newClass.tuitionFee ? parseFloat(newClass.tuitionFee) : 0
      };

      const response = await axios.post('http://localhost:8080/api/classrooms', payload);
      alert("🎉 Tạo lớp học mới thành công!");
      
      // Cập nhật lại UI
      setClassrooms([...classrooms, response.data]);
      setNewClass({ 
        ...newClass, 
        className: '',
        tuitionFee: response.data.tuitionFee ? response.data.tuitionFee.toString() : ''
      });
      
      // Đồng bộ hóa danh sách lớp trong form xếp lớp
      if (classrooms.length === 0) {
        setEnrollment(prev => ({ ...prev, classId: response.data.id.toString() }));
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Có lỗi xảy ra khi tạo lớp học!");
    }
  };

  const handleEnrollSubmit = async (e) => {
    e.preventDefault();
    try {
      const classId = parseInt(enrollment.classId);
      const studentId = parseInt(enrollment.studentId);
      
      await axios.post(`http://localhost:8080/api/classrooms/${classId}/enroll/${studentId}`);
      alert("🎉 Xếp lớp học viên thành công!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Có lỗi xảy ra khi gán học viên vào lớp!");
    }
  };

  // --- NEW TUITION MANAGEMENT HELPER FUNCTIONS ---
  const fetchTuitionStats = async () => {
    try {
      setLoadingStats(true);
      const params = {};
      if (statsClassId) params.classId = parseInt(statsClassId);
      if (statsSemester) params.semester = statsSemester;
      
      const res = await axios.get('http://localhost:8080/api/payments/stats', { params });
      setTuitionStats(res.data);
    } catch (err) {
      console.error("Lỗi lấy báo cáo học phí:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleConfirmManualPay = async (e) => {
    e.preventDefault();
    if (!manualPayEnrollmentId) return;
    try {
      setLoadingStats(true);
      await axios.post('http://localhost:8080/api/payments/cash-pay', null, {
        params: {
          enrollmentId: parseInt(manualPayEnrollmentId),
          amount: parseFloat(manualPayAmount),
          method: manualPayMethod,
          note: manualPayNote || 'Thu học phí trực tiếp tại quầy / chuyển khoản ngân hàng đối chiếu thủ công.'
        }
      });
      alert('🎉 Đã ghi nhận thanh toán học phí thành công!');
      setManualPayEnrollmentId(null);
      setManualPayAmount('');
      setManualPayNote('');
      fetchTuitionStats();
    } catch (err) {
      console.error("Lỗi khi đóng học phí thủ công:", err);
      alert('❌ Không thể cập nhật trạng thái đóng học phí.');
    } finally {
      setLoadingStats(false);
    }
  };

  const handleApproveTuition = async (paymentId, studentName, method) => {
    if (!window.confirm(`Bạn có chắc chắn muốn phê duyệt giao dịch đóng học phí của học viên ${studentName} qua ${method}?`)) {
      return;
    }
    try {
      setLoadingStats(true);
      await axios.post(`http://localhost:8080/api/payments/confirm-success/${paymentId}`);
      alert(`🎉 Đã phê duyệt thành công giao dịch học phí cho học viên ${studentName}!`);
      fetchTuitionStats();
    } catch (err) {
      console.error("Lỗi phê duyệt giao dịch:", err);
      alert("❌ Phê duyệt thất bại. Vui lòng thử lại.");
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (subTab === 'tuition') {
      fetchTuitionStats();
    } else if (subTab === 'paymentConfig') {
      fetchPaymentConfigs();
    }
  }, [subTab, statsClassId, statsSemester]);

  // --- NEW PAYMENT GATEWAY MANAGEMENT HANDLERS ---
  const fetchPaymentConfigs = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/payment-configs');
      setPaymentConfigs(res.data);
    } catch (err) {
      console.error("Lỗi lấy cấu hình cổng thanh toán:", err);
    }
  };

  const handleEditConfigClick = (cfg) => {
    setEditingConfigId(cfg.id);
    setEditConfigForm({
      gatewayName: cfg.gatewayName,
      accountNumber: cfg.accountNumber,
      accountName: cfg.accountName,
      syntaxTemplate: cfg.syntaxTemplate,
      qrUrl: cfg.qrUrl || '',
      isActive: cfg.isActive
    });
  };

  const handleQrUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploadingQr(true);
      const data = new FormData();
      data.append('file', file);
      const res = await axios.post('http://localhost:8080/api/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setEditConfigForm(prev => ({ ...prev, qrUrl: res.data.url }));
      alert('✓ Đã upload ảnh QR thành công!');
    } catch (err) {
      console.error("Lỗi upload QR:", err);
      alert('❌ Upload thất bại: ' + (err.response?.data?.error || err.message));
    } finally {
      setUploadingQr(false);
    }
  };

  const handleConfigSubmit = async (e) => {
    e.preventDefault();
    if (!editingConfigId) return;
    try {
      await axios.put(`http://localhost:8080/api/payment-configs/${editingConfigId}`, editConfigForm);
      alert('🎉 Đã cập nhật cấu hình cổng thành công!');
      setEditingConfigId(null);
      fetchPaymentConfigs();
    } catch (err) {
      console.error("Lỗi cập nhật cấu hình:", err);
      alert('❌ Cập nhật thất bại.');
    }
  };

  const formatVND = (value) => {
    if (!value) return '0 đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // Xem danh sách học viên trong 1 lớp học
  const handleInspectClass = async (classroom) => {
    setInspectClass(classroom);
    setLoadingInspect(true);
    try {
      const response = await axios.get(`http://localhost:8080/api/classrooms/${classroom.id}/students`);
      setInspectedStudents(response.data);
    } catch (err) {
      console.error("Lỗi lấy danh sách học viên lớp:", err);
      alert("Không thể lấy danh sách học viên.");
    } finally {
      setLoadingInspect(false);
    }
  };

  const semestersList = Array.from(new Set(classrooms.map(c => c.semester).filter(Boolean)));

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-5xl mx-auto shadow-sm border border-slate-100 animate-fade-in flex flex-col">
      
      {/* HEADER & TABS CON */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 border-b border-slate-100 pb-4 gap-4">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
          🏫 Phân Hệ Quản Lý Lớp Học & Đào Tạo
        </h2>
        
        <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200/20 shrink-0">
          <button 
            onClick={() => setSubTab('list')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              subTab === 'list'
                ? 'bg-white text-orange-600 shadow shadow-slate-200/50'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            🏫 Danh Sách & Tạo Lớp
          </button>
          
          <button 
            onClick={() => setSubTab('enroll')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              subTab === 'enroll'
                ? 'bg-white text-orange-600 shadow shadow-slate-200/50'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            👤 Xếp Lớp Học Viên
          </button>

          <button 
            onClick={() => setSubTab('tuition')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              subTab === 'tuition'
                ? 'bg-white text-orange-600 shadow shadow-slate-200/50'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            📊 Quản Lý Học Phí
          </button>

          <button 
            onClick={() => setSubTab('paymentConfig')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              subTab === 'paymentConfig'
                ? 'bg-white text-orange-600 shadow shadow-slate-200/50'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            ⚙️ Cấu Hình Thanh Toán
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-slate-400 font-semibold">Đang lấy dữ liệu quản trị lớp...</span>
        </div>
      ) : (
        <div>
          {subTab === 'list' && (
            // TAB 1: DANH SÁCH & TẠO LỚP MỚI
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* FORM TẠO LỚP HỌC MỚI (CHIẾM 1 PHẦN) */}
              <div className="lg:col-span-1 bg-slate-50/50 border border-slate-100 rounded-2xl p-5 h-fit">
                <h3 className="text-base font-black text-slate-800 mb-4 flex items-center gap-1.5">
                  ✨ Tạo Lớp Học Mới
                </h3>
                
                {courses.length === 0 || teachers.length === 0 ? (
                  <p className="text-xs text-red-500 font-semibold leading-relaxed">
                    ⚠️ Hệ thống cần có ít nhất 1 khóa học hoạt động và 1 giáo viên để có thể tạo được lớp học.
                  </p>
                ) : (
                  <form onSubmit={handleClassSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tên lớp học</label>
                      <input 
                        type="text" 
                        placeholder="Ví dụ: IELTS-70-C1" 
                        required
                        value={newClass.className}
                        onChange={(e) => setNewClass({ ...newClass, className: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-xs font-semibold bg-white"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Môn / Khóa học</label>
                      <select 
                        value={newClass.courseId}
                        onChange={(e) => {
                          const selectedCourse = courses.find(c => c.id.toString() === e.target.value);
                          setNewClass({ 
                            ...newClass, 
                            courseId: e.target.value,
                            tuitionFee: selectedCourse?.price ? selectedCourse.price.toString() : '' 
                          });
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none text-xs font-semibold bg-white cursor-pointer"
                      >
                        {courses.map(course => (
                          <option key={course.id} value={course.id}>{course.title} - [{course.category}]</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Giáo viên phụ trách</label>
                      <select 
                        value={newClass.teacherId}
                        onChange={(e) => setNewClass({ ...newClass, teacherId: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none text-xs font-semibold bg-white cursor-pointer"
                      >
                        {teachers.map(teacher => (
                          <option key={teacher.id} value={teacher.id}>{teacher.fullName}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lịch dạy học</label>
                      <input 
                        type="text" 
                        placeholder="Ví dụ: Thứ 2, 4, 6 | 19:30 - 21:00" 
                        required
                        value={newClass.schedule}
                        onChange={(e) => setNewClass({ ...newClass, schedule: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-xs font-semibold bg-white"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Học kỳ (Semester)</label>
                      <input 
                        type="text" 
                        placeholder="Ví dụ: Học kỳ 1 - 2026" 
                        required
                        value={newClass.semester}
                        onChange={(e) => setNewClass({ ...newClass, semester: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-xs font-semibold bg-white"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Học phí lớp học (VND)</label>
                      <input 
                        type="number" 
                        placeholder="Ví dụ: 3000000" 
                        required
                        value={newClass.tuitionFee}
                        onChange={(e) => setNewClass({ ...newClass, tuitionFee: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-xs font-semibold bg-white"
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="w-full py-2.5 px-4 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl shadow shadow-orange-500/10 cursor-pointer border-none mt-2"
                    >
                      💾 Tạo lớp học
                    </button>
                  </form>
                )}
              </div>

              {/* LƯỚI DANH SÁCH LỚP HỌC (CHIẾM 2 PHẦN) */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                <h3 className="text-base font-black text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                  🏫 Lớp học đang hoạt động ({classrooms.length})
                </h3>

                {classrooms.length === 0 ? (
                  <div className="py-16 text-center text-slate-400 text-sm font-semibold">
                    Chưa có lớp học nào được tạo.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {classrooms.map(cls => (
                      <div key={cls.id} className="bg-white rounded-2xl border border-slate-150 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                        <div>
                          <p className="font-extrabold text-slate-800 text-base">{cls.className}</p>
                          <span className="inline-block text-[9px] font-bold text-orange-500 bg-orange-50 border border-orange-100/50 px-2 py-0.5 rounded mt-1.5">
                            {cls.courseTitle}
                          </span>
                          <p className="text-[10px] text-slate-500 font-bold mt-3">
                            👨‍🏫 GV: <strong className="text-slate-700">{cls.teacherName || "Chưa phân công"}</strong>
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold mt-1.5">
                            🕒 Lịch: {cls.schedule}
                          </p>
                        </div>
                        
                        <div className="mt-4 pt-3 border-t border-slate-100 text-right">
                          <button 
                            onClick={() => handleInspectClass(cls)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 font-bold rounded-lg text-xs cursor-pointer border border-slate-200/30"
                          >
                            👥 Học viên lớp
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {subTab === 'enroll' && (
            // TAB 2: XẾP LỚP HỌC VIÊN
            <div className="max-w-md mx-auto p-5 border border-slate-100 rounded-3xl bg-slate-50/50">
              <h3 className="text-base font-black text-slate-800 mb-2 text-center">
                👤 Xếp Học Viên Vào Lớp
              </h3>
              <p className="text-xs text-slate-400 text-center mb-6 max-w-xs mx-auto font-medium">
                Chọn một lớp học đang tuyển sinh và liên kết học viên (STUDENT) tương ứng vào lớp học.
              </p>

              {classrooms.length === 0 || students.length === 0 ? (
                <p className="text-xs text-red-500 text-center font-bold">
                  ⚠️ Hệ thống cần có ít nhất 1 lớp học hoạt động và 1 tài khoản học viên để thực hiện xếp lớp.
                </p>
              ) : (
                <form onSubmit={handleEnrollSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lớp học tiếp nhận</label>
                    <select 
                      value={enrollment.classId}
                      onChange={(e) => setEnrollment({ ...enrollment, classId: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-xs font-semibold bg-white cursor-pointer"
                    >
                      {classrooms.map(cls => (
                        <option key={cls.id} value={cls.id}>{cls.className} - [{cls.courseTitle}]</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Học viên được gán</label>
                    <select 
                      value={enrollment.studentId}
                      onChange={(e) => setEnrollment({ ...enrollment, studentId: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-xs font-semibold bg-white cursor-pointer"
                    >
                      {students.map(std => (
                        <option key={std.id} value={std.id}>{std.fullName} - [{std.username}]</option>
                      ))}
                    </select>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full py-3 px-5 text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl shadow-lg shadow-orange-500/10 cursor-pointer border-none mt-2 active:scale-[0.98] transition-all"
                  >
                    ✓ Xếp vào lớp
                  </button>
                </form>
              )}
            </div>
          )}

          {subTab === 'tuition' && (
            // TAB 3: QUẢN LÝ HỌC PHÍ & BÁO CÁO DOANH THU
            <div className="flex flex-col gap-6 animate-slide-up">
              
              {/* FILTERS & STATS SUMMARY */}
              <div className="flex flex-col md:flex-row gap-4 justify-between items-end border-b border-slate-100 pb-5">
                <div className="w-full md:flex-1 flex flex-col sm:flex-row gap-4">
                  
                  {/* Filter by class */}
                  <div className="flex-1 flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lọc theo Lớp Học</span>
                    <select
                      value={statsClassId}
                      onChange={(e) => setStatsClassId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-xs font-semibold bg-slate-50/50 cursor-pointer"
                    >
                      <option value="">Tất cả các lớp học</option>
                      {classrooms.map(c => (
                        <option key={c.id} value={c.id}>{c.className}</option>
                      ))}
                    </select>
                  </div>

                  {/* Filter by semester */}
                  <div className="flex-1 flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lọc theo Học kỳ</span>
                    <select
                      value={statsSemester}
                      onChange={(e) => setStatsSemester(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-xs font-semibold bg-slate-50/50 cursor-pointer"
                    >
                      <option value="">Tất cả học kỳ</option>
                      {semestersList.map((sem, idx) => (
                        <option key={idx} value={sem}>{sem}</option>
                      ))}
                      {semestersList.length === 0 && <option value="Học kỳ 1 - 2026">Học kỳ 1 - 2026</option>}
                    </select>
                  </div>
                </div>

                {/* Reset button if filtered */}
                {(statsClassId || statsSemester) && (
                  <button
                    onClick={() => {
                      setStatsClassId('');
                      setStatsSemester('');
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-xl transition-all cursor-pointer border border-orange-100 text-center"
                  >
                    🔄 Xóa bộ lọc
                  </button>
                )}
              </div>

              {/* STATS OVERVIEW CARDS */}
              {tuitionStats && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-200 p-5 rounded-2xl flex flex-col justify-between shadow-sm">
                    <span className="text-[10px] text-orange-600 font-black uppercase tracking-wider">Doanh thu học phí thực tế</span>
                    <h3 className="text-2xl font-black text-slate-800 mt-2">{formatVND(tuitionStats.totalRevenue)}</h3>
                    <p className="text-[10px] text-slate-400 font-semibold mt-1">Tổng cộng số tiền học viên đã đóng</p>
                  </div>

                  <div className="bg-green-50/30 border border-green-200 p-5 rounded-2xl flex flex-col justify-between shadow-sm">
                    <span className="text-[10px] text-green-700 font-black uppercase tracking-wider">Giao dịch hoàn thành (PAID)</span>
                    <h3 className="text-2xl font-black text-slate-800 mt-2">{tuitionStats.totalPaidCount} lượt</h3>
                    <p className="text-[10px] text-slate-400 font-semibold mt-1">Học viên đã đóng đủ học phí</p>
                  </div>

                  <div className="bg-red-50/20 border border-red-200 p-5 rounded-2xl flex flex-col justify-between shadow-sm">
                    <span className="text-[10px] text-red-600 font-black uppercase tracking-wider">Hóa đơn chưa thanh toán (PENDING)</span>
                    <h3 className="text-2xl font-black text-slate-800 mt-2">{tuitionStats.totalPendingCount} lượt</h3>
                    <p className="text-[10px] text-slate-400 font-semibold mt-1">Lượt đăng ký lớp đang nợ học phí</p>
                  </div>
                </div>
              )}

              {/* LISTS OF PAID/UNPAID RECORDS */}
              {tuitionStats && (
                <div className="bg-white border border-slate-150 rounded-3xl overflow-hidden flex flex-col mt-4">
                  {/* Selector tabs */}
                  <div className="flex bg-slate-50 border-b border-slate-150 p-1">
                    <button
                      onClick={() => setActiveTuitionSubTab('unpaid')}
                      className={`flex-1 py-3 text-xs font-black rounded-2xl transition-all cursor-pointer ${
                        activeTuitionSubTab === 'unpaid'
                          ? 'bg-white text-orange-600 shadow-sm border border-slate-200/50'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      ⚠️ Chưa Nộp Học Phí ({tuitionStats.totalPendingCount})
                    </button>
                    <button
                      onClick={() => setActiveTuitionSubTab('paid')}
                      className={`flex-1 py-3 text-xs font-black rounded-2xl transition-all cursor-pointer ${
                        activeTuitionSubTab === 'paid'
                          ? 'bg-white text-orange-600 shadow-sm border border-slate-200/50'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      ✓ Đã Nộp Học Phí ({tuitionStats.totalPaidCount})
                    </button>
                  </div>

                  <div className="p-5">
                    {/* SUBTAB 1: UNPAID/PENDING STUDENTS */}
                    {activeTuitionSubTab === 'unpaid' && (
                      <div className="flex flex-col gap-4 animate-fade-in">
                        {tuitionStats.pendingRecords.length === 0 ? (
                          <div className="py-12 text-center text-slate-400 text-xs font-semibold italic">Không có học viên nợ học phí nào.</div>
                        ) : (
                          <div className="flex flex-col gap-3">
                            {tuitionStats.pendingRecords.map((rec, i) => (
                              <div key={i} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-150 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-grow">
                                  <div className="flex items-center gap-2 text-left">
                                    <h4 className="font-extrabold text-sm text-slate-800">{rec.studentName}</h4>
                                    {rec.paymentStatus === 'PENDING_APPROVAL' ? (
                                      <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-600 text-[9px] font-black uppercase animate-pulse">
                                        Chờ duyệt ({rec.paymentMethod})
                                      </span>
                                    ) : rec.paymentStatus === 'PENDING' ? (
                                      <span className="px-2 py-0.5 rounded bg-orange-50 border border-orange-200 text-orange-600 text-[9px] font-black uppercase">
                                        Đã mở cổng (Chưa đóng)
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded bg-red-50 border border-red-150 text-red-600 text-[9px] font-black uppercase">
                                        Chưa đóng
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-slate-400 font-semibold">{rec.studentEmail} • Lớp: <strong>{rec.className}</strong></p>
                                  <p className="text-[10px] text-slate-450 mt-1">Cú pháp CK: <code className="text-orange-500 font-bold bg-white border border-slate-200 px-1.5 py-0.5 rounded">{rec.transferSyntax}</code></p>
                                </div>

                                <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end">
                                  <div className="text-right">
                                    <span className="text-xs text-slate-400 font-bold">Cần đóng:</span>
                                    <p className="font-black text-sm text-orange-600">{formatVND(rec.tuitionFee)}</p>
                                  </div>
                                  
                                  {manualPayEnrollmentId === rec.enrollmentId ? (
                                    <form onSubmit={handleConfirmManualPay} className="bg-white p-3 rounded-xl border border-slate-200 shadow flex flex-col gap-2 animate-fade-in w-64 text-left">
                                      <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold">
                                        <span>THU THỦ CÔNG</span>
                                        <button type="button" onClick={() => setManualPayEnrollmentId(null)} className="text-red-500 hover:text-red-700 bg-none border-none cursor-pointer">Hủy</button>
                                      </div>
                                      <input
                                        type="number"
                                        placeholder="Số tiền thu..."
                                        required
                                        value={manualPayAmount}
                                        onChange={(e) => setManualPayAmount(e.target.value)}
                                        className="w-full p-2 border border-slate-200 rounded text-xs"
                                      />
                                      <select
                                        value={manualPayMethod}
                                        onChange={(e) => setManualPayMethod(e.target.value)}
                                        className="w-full p-2 border border-slate-200 rounded text-xs"
                                      >
                                        <option value="CASH">Tiền mặt (CASH)</option>
                                        <option value="BANK_TRANSFER">Chuyển khoản tay (BANK_TRANSFER)</option>
                                      </select>
                                      <input
                                        type="text"
                                        placeholder="Ghi chú (Không bắt buộc)..."
                                        value={manualPayNote}
                                        onChange={(e) => setManualPayNote(e.target.value)}
                                        className="w-full p-2 border border-slate-200 rounded text-xs"
                                      />
                                      <button type="submit" className="w-full py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded text-xs font-bold border-none cursor-pointer">Xác nhận nộp ✓</button>
                                    </form>
                                  ) : (
                                    <div className="flex gap-2">
                                      {rec.paymentStatus === 'PENDING_APPROVAL' && (
                                        <button
                                          onClick={() => handleApproveTuition(rec.paymentId, rec.studentName, rec.paymentMethod)}
                                          className="px-4 py-2 bg-green-600 hover:bg-green-750 text-white font-black rounded-xl text-xs transition-all shadow shadow-green-500/10 cursor-pointer border-none"
                                        >
                                          Phê duyệt giao dịch ✓
                                        </button>
                                      )}
                                      <button
                                        onClick={() => {
                                          setManualPayEnrollmentId(rec.enrollmentId);
                                          setManualPayAmount(rec.tuitionFee.toString());
                                          setManualPayMethod(rec.paymentMethod || 'BANK_TRANSFER');
                                        }}
                                        className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-all cursor-pointer border-none"
                                      >
                                        Thu thủ công 💵
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* SUBTAB 2: PAID RECORDS */}
                    {activeTuitionSubTab === 'paid' && (
                      <div className="flex flex-col gap-4 animate-fade-in">
                        {tuitionStats.paidRecords.length === 0 ? (
                          <div className="py-12 text-center text-slate-400 text-xs font-semibold italic">Chưa có giao dịch đóng học phí nào thành công.</div>
                        ) : (
                          <div className="flex flex-col gap-3">
                            {tuitionStats.paidRecords.map((pay) => (
                              <div key={pay.id} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-extrabold text-sm text-slate-800">{pay.studentName}</h4>
                                    <span className="px-2 py-0.5 rounded bg-green-50 border border-green-100 text-green-700 text-[9px] font-black uppercase">{pay.method}</span>
                                  </div>
                                  <p className="text-[10px] text-slate-400 font-semibold">{pay.studentEmail} • Lớp: <strong>{pay.className}</strong></p>
                                  <p className="text-[9px] text-slate-450 mt-0.5">Ngày nộp: {new Date(pay.paymentDate).toLocaleString('vi-VN')} • Mã ĐH: {pay.orderId}</p>
                                </div>

                                <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
                                  <div className="sm:text-right">
                                    <span className="text-[10px] text-slate-400 font-bold">Số tiền:</span>
                                    <p className="font-black text-sm text-green-700">{formatVND(pay.amount)}</p>
                                  </div>
                                  
                                  <a
                                    href={`http://localhost:8080${pay.invoiceUrl}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-extrabold rounded-xl text-xs transition-all shadow-sm cursor-pointer"
                                  >
                                    Xem Hóa Đơn 📄
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {subTab === 'paymentConfig' && (
            // TAB 4: CẤU HÌNH CỔNG THANH TOÁN
            <div className="flex flex-col gap-6 animate-slide-up text-left">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-black text-slate-800">⚙️ Thiết Lập Tài Khoản & Cú Pháp Các Cổng</h3>
                <p className="text-xs text-slate-400 font-semibold mt-1">Quản lý và cập nhật thông số tài khoản ngân hàng, số điện thoại ví, cú pháp động hoặc ảnh QR tĩnh cho trung tâm.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* LIST OF CONFIGS CARD */}
                <div className="flex flex-col gap-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Danh sách các cổng đang chạy</h4>
                  {paymentConfigs.map(cfg => (
                    <div 
                      key={cfg.id} 
                      className={`p-5 rounded-2xl border transition-all flex justify-between items-center bg-white hover:shadow-sm ${
                        editingConfigId === cfg.id ? 'border-orange-500 shadow-sm' : 'border-slate-150'
                      }`}
                    >
                      <div className="flex-grow pr-4">
                        <div className="flex items-center gap-2">
                          <h5 className="font-extrabold text-sm text-slate-800">{cfg.gatewayName}</h5>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                            cfg.isActive 
                              ? 'bg-green-50 text-green-700 border border-green-150' 
                              : 'bg-slate-50 text-slate-400 border border-slate-200'
                          }`}>
                            {cfg.isActive ? 'Kích hoạt' : 'Tạm tắt'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-450 mt-1 font-semibold">Khóa cổng: <code className="bg-slate-50 px-1 rounded font-bold text-slate-700">{cfg.gatewayKey}</code></p>
                        <p className="text-[11px] text-slate-500 mt-2">Mã số/STK: <strong>{cfg.accountNumber}</strong></p>
                        <p className="text-[11px] text-slate-500">Chủ tài khoản: <strong>{cfg.accountName}</strong></p>
                        <p className="text-[11px] text-slate-500">Cú pháp: <code className="text-orange-600 bg-orange-50/50 px-1.5 py-0.5 rounded font-bold text-[10px]">{cfg.syntaxTemplate}</code></p>
                        {cfg.qrUrl && (
                          <div className="mt-2.5 flex items-center gap-1.5">
                            <span className="text-[10px] text-green-600 font-bold border border-green-150 rounded px-2 py-0.5 bg-green-50/20">Ảnh QR tĩnh: Có</span>
                            <a href={cfg.qrUrl} target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 font-bold underline hover:text-blue-700">Xem ảnh</a>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleEditConfigClick(cfg)}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 font-extrabold rounded-xl text-[11px] transition-all cursor-pointer border border-slate-200/50 whitespace-nowrap"
                      >
                        Chỉnh sửa ⚙️
                      </button>
                    </div>
                  ))}
                </div>

                {/* EDIT CONFIG FORM CARD */}
                <div className="bg-slate-50/50 border border-slate-100 rounded-3xl p-6 h-fit">
                  <h4 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-1.5">
                    ⚙️ Soạn Thảo Cấu Hình Cổng
                  </h4>

                  {!editingConfigId ? (
                    <div className="py-12 text-center text-slate-400 text-xs font-semibold italic bg-white rounded-2xl border border-slate-100 shadow-inner">
                      Vui lòng chọn một cổng thanh toán bên cạnh để chỉnh sửa thông số.
                    </div>
                  ) : (
                    <form onSubmit={handleConfigSubmit} className="flex flex-col gap-4 animate-fade-in text-xs font-semibold text-slate-650">
                      
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tên cổng / Tên ngân hàng hiển thị</label>
                        <input
                          type="text"
                          required
                          value={editConfigForm.gatewayName}
                          onChange={(e) => setEditConfigForm({ ...editConfigForm, gatewayName: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-xs font-semibold bg-white"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Số tài khoản / Số điện thoại ví</label>
                        <input
                          type="text"
                          required
                          value={editConfigForm.accountNumber}
                          onChange={(e) => setEditConfigForm({ ...editConfigForm, accountNumber: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-xs font-semibold bg-white"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Họ tên chủ tài khoản thụ hưởng</label>
                        <input
                          type="text"
                          required
                          value={editConfigForm.accountName}
                          onChange={(e) => setEditConfigForm({ ...editConfigForm, accountName: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-xs font-semibold bg-white"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mẫu cú pháp chuyển khoản (Syntax Template)</label>
                        <input
                          type="text"
                          required
                          value={editConfigForm.syntaxTemplate}
                          onChange={(e) => setEditConfigForm({ ...editConfigForm, syntaxTemplate: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-xs font-semibold bg-white font-mono"
                        />
                        <span className="text-[9px] text-slate-400 italic mt-0.5 leading-normal block">
                          * Lưu ý: Giữ nguyên các biến <code>{'{studentId}'}</code> và <code>{'{classId}'}</code> để hệ thống tự động chèn ID học sinh và ID lớp.
                        </span>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tải lên QR thanh toán tĩnh (Tùy chọn)</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleQrUpload}
                            className="text-xs text-slate-500 flex-1 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-none file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                          />
                          {uploadingQr && <span className="text-[10px] text-slate-400">Đang tải...</span>}
                        </div>
                        {editConfigForm.qrUrl && (
                          <div className="mt-2 p-2 bg-white rounded-lg border border-slate-200 flex justify-between items-center gap-2">
                            <span className="text-[10px] text-slate-500 truncate flex-1">{editConfigForm.qrUrl}</span>
                            <button
                              type="button"
                              onClick={() => setEditConfigForm({ ...editConfigForm, qrUrl: '' })}
                              className="text-red-500 hover:text-red-700 text-[10px] font-bold bg-none border-none cursor-pointer"
                            >
                              Gỡ bỏ
                            </button>
                          </div>
                        )}
                        <span className="text-[9px] text-slate-400 italic mt-0.5 leading-normal block">
                          * Theo Phương án A: Nếu để trống ô này, hệ thống sẽ tự động sinh mã QR động chứa sẵn số tiền học phí và nội dung giao dịch.
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="checkbox"
                          id="isActiveConfig"
                          checked={editConfigForm.isActive}
                          onChange={(e) => setEditConfigForm({ ...editConfigForm, isActive: e.target.checked })}
                          className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500/20 cursor-pointer"
                        />
                        <label htmlFor="isActiveConfig" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                          Kích hoạt hoạt động cổng này
                        </label>
                      </div>

                      <div className="flex gap-3 mt-4 pt-3 border-t border-slate-200/60">
                        <button
                          type="submit"
                          className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs shadow cursor-pointer border-none"
                        >
                          ✓ Lưu Thiết Lập
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingConfigId(null)}
                          className="px-4 py-3 bg-white hover:bg-slate-100 text-slate-500 border border-slate-200 font-bold rounded-xl text-xs cursor-pointer"
                        >
                          Hủy
                        </button>
                      </div>

                    </form>
                  )}
                </div>

              </div>

            </div>
          )}
        </div>
      )}

      {/* POPUP XEM HỌC VIÊN LỚP CỦA ADMIN */}
      {inspectClass && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-lg w-full border border-slate-100 animate-slide-up flex flex-col max-h-[80vh]">
            
            <div className="p-5 border-b border-slate-100 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-lg font-black text-slate-800">Lớp: {inspectClass.className}</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">{inspectClass.courseTitle}</p>
              </div>
              <button 
                onClick={() => setInspectClass(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold cursor-pointer border-none"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-grow">
              {loadingInspect ? (
                <div className="py-10 text-center flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-3 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs text-slate-400">Đang lấy danh sách học viên...</span>
                </div>
              ) : inspectedStudents.length === 0 ? (
                <p className="text-center text-slate-400 py-10 font-semibold text-xs leading-relaxed">
                  Lớp học này chưa có học viên nào tham gia.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Danh sách học viên lớp ({inspectedStudents.length}):
                  </h4>
                  {inspectedStudents.map(std => (
                    <div key={std.studentId} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <p className="font-extrabold text-xs text-slate-800">{std.studentName}</p>
                        <p className="text-[10px] text-slate-400 font-semibold">{std.studentEmail}</p>
                      </div>
                      
                      {std.grade !== null ? (
                        <span className="px-2 py-0.5 text-[10px] font-black rounded-md bg-green-50 text-green-700 border border-green-200">
                          {std.grade} / 10
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 text-slate-400">
                          Chưa thi
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 text-right shrink-0">
              <button 
                onClick={() => setInspectClass(null)}
                className="px-6 py-2.5 bg-white hover:bg-slate-100 text-slate-600 font-bold rounded-xl border border-slate-200 text-xs cursor-pointer shadow-sm"
              >
                Đóng lại
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default ClassroomManager;
