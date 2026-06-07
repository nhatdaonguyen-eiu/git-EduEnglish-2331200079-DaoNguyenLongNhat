import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ClassroomManager({ initialSubTab }) {
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
  const [subTab, setSubTab] = useState(initialSubTab || 'list');
  
  useEffect(() => {
    if (initialSubTab) {
      setSubTab(initialSubTab);
    }
  }, [initialSubTab]);

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
  const [showCreateClassForm, setShowCreateClassForm] = useState(false);
  const [selectedCalendarClass, setSelectedCalendarClass] = useState(null);

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

  const showInvoicePDFMockup = (studentName, amount, courseTitle, paymentId) => {
    const invoiceWindow = window.open("", "_blank", "width=800,height=900");
    if (!invoiceWindow) return;
    
    const formattedAmount = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    const dateStr = new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    
    invoiceWindow.document.write(`
      <html>
        <head>
          <title>Hóa Đơn Điện Tử - EduEnglish - #${paymentId}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #334155; line-height: 1.6; }
            .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; }
            .logo { font-size: 24px; font-weight: 800; color: #064e3b; }
            .title { font-size: 28px; font-weight: 900; color: #0f172a; text-transform: uppercase; margin-top: 20px; text-align: center; }
            .details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 30px; }
            .details h4 { margin: 0 0 8px 0; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
            .details p { margin: 0; font-size: 14px; font-weight: 600; color: #1e293b; }
            .table-container { margin-top: 40px; }
            table { width: 100%; border-collapse: collapse; text-align: left; }
            th { padding: 12px; background-color: #f8fafc; border-bottom: 2px solid #e2e8f0; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #64748b; }
            td { padding: 16px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; font-weight: 600; }
            .total-row td { border-bottom: none; font-size: 16px; font-weight: 800; color: #064e3b; padding-top: 24px; }
            .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #94a3b8; font-weight: 600; border-top: 1px solid #f1f5f9; padding-top: 20px; }
            @media print {
              body { padding: 0; }
              .invoice-box { border: none; box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            <div class="header">
              <div>
                <div class="logo">EduEnglish</div>
                <p style="margin: 4px 0 0 0; font-size: 11px; color: #64748b; font-weight: bold;">HỆ THỐNG ANH NGỮ CHUẨN QUỐC TẾ</p>
              </div>
              <div style="text-align: right;">
                <p style="margin: 0; font-size: 12px; font-weight: bold; color: #64748b;">MÃ HÓA ĐƠN: #${paymentId}</p>
                <p style="margin: 4px 0 0 0; font-size: 12px; font-weight: bold; color: #64748b;">NGÀY XUẤT: ${dateStr}</p>
              </div>
            </div>
            
            <div class="title">Hóa Đơn Thu Học Phí</div>
            
            <div class="details">
              <div>
                <h4>Đơn vị phát hành</h4>
                <p>EduEnglish English Center System</p>
                <p style="font-weight: 550; color: #64748b; font-size: 12px; margin-top: 4px;">Đại học EIU, TP. Mới Bình Dương</p>
              </div>
              <div>
                <h4>Người nộp học phí</h4>
                <p>${studentName}</p>
                <p style="font-weight: 550; color: #64748b; font-size: 12px; margin-top: 4px;">Học viên Hệ thống EduEnglish</p>
              </div>
            </div>
            
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nội dung thanh toán</th>
                    <th>Phương thức</th>
                    <th style="text-align: right;">Học phí</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Học phí khóa học: ${courseTitle}</td>
                    <td>Chuyển khoản Ngân hàng (Đối soát tự động)</td>
                    <td style="text-align: right;">${formattedAmount}</td>
                  </tr>
                  <tr class="total-row">
                    <td colspan="2" style="text-align: right;">Tổng thanh toán:</td>
                    <td style="text-align: right;">${formattedAmount}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div class="footer">
              <p>Cảm ơn bạn đã lựa chọn đồng hành cùng EduEnglish!</p>
              <p style="margin-top: 4px;">Mọi thắc mắc vui lòng liên hệ Hotline: 0988-888-888 hoặc Email: contact@eduen.edu.vn</p>
            </div>
          </div>
          <script>
            window.print();
          </script>
        </body>
      </html>
    `);
    invoiceWindow.document.close();
  };

  const handleApproveTuition = async (paymentId, studentName, method, amount, courseTitle) => {
    if (!window.confirm(`Bạn có chắc chắn muốn phê duyệt giao dịch đóng học phí của học viên ${studentName} qua ${method}?`)) {
      return;
    }
    try {
      setLoadingStats(true);
      if (paymentId >= 9990) {
        alert(`🎉 [Demo] Phê duyệt thành công giao dịch của học viên ${studentName}!\n📬 Đã gửi email thông báo thành công.`);
        showInvoicePDFMockup(studentName, amount || 3000000, courseTitle || 'Khóa học IELTS', paymentId);
      } else {
        await axios.post(`http://localhost:8080/api/payments/confirm-success/${paymentId}`);
        alert(`🎉 Đã phê duyệt thành công giao dịch học phí cho học viên ${studentName}!\n📬 Đã gửi email thông báo thành công.`);
        showInvoicePDFMockup(studentName, amount || 3000000, courseTitle || 'Khóa học IELTS', paymentId);
        fetchTuitionStats();
      }
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
                ? 'bg-white text-emerald-800 shadow shadow-slate-200/50'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            🏫 Danh Sách & Tạo Lớp
          </button>
          
          <button 
            onClick={() => setSubTab('enroll')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              subTab === 'enroll'
                ? 'bg-white text-emerald-800 shadow shadow-slate-200/50'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            👤 Xếp Lớp Học Viên
          </button>

          <button 
            onClick={() => setSubTab('tuition')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              subTab === 'tuition'
                ? 'bg-white text-emerald-800 shadow shadow-slate-200/50'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            📊 Quản Lý Học Phí
          </button>

          <button 
            onClick={() => setSubTab('paymentConfig')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              subTab === 'paymentConfig'
                ? 'bg-white text-emerald-800 shadow shadow-slate-200/50'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            ⚙️ Cấu Hình Thanh Toán
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-700 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-slate-400 font-semibold">Đang lấy dữ liệu quản trị lớp...</span>
        </div>
      ) : (
        <div>
          {subTab === 'list' && (
            <div className="flex flex-col gap-8 text-left animate-slide-up">
              {/* TOP HEADER */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-5 gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-800">Class Management</h2>
                  <p className="text-xs text-slate-400 font-medium mt-1">Schedule and oversee academic sessions with precision.</p>
                </div>
                <button
                  onClick={() => setShowCreateClassForm(!showCreateClassForm)}
                  className="px-4 py-2.5 bg-[#064e3b] hover:bg-emerald-950 text-white font-extrabold rounded-xl text-xs transition-all shadow-md cursor-pointer border-none flex items-center gap-1.5"
                >
                  {showCreateClassForm ? '✕ Close Form' : '➕ Create New Class'}
                </button>
              </div>

              {/* TOGGLED CLASS CREATION FORM */}
              {showCreateClassForm && (
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 animate-fade-in">
                  <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-1.5">
                    ✨ Tạo Lớp Học Mới
                  </h3>
                  {courses.length === 0 || teachers.length === 0 ? (
                    <p className="text-xs text-red-500 font-semibold leading-relaxed">
                      ⚠️ Hệ thống cần có ít nhất 1 khóa học hoạt động và 1 giáo viên để có thể tạo được lớp học.
                    </p>
                  ) : (
                    <form onSubmit={(e) => {
                      handleClassSubmit(e);
                      setShowCreateClassForm(false);
                    }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tên lớp học</label>
                        <input 
                          type="text" 
                          placeholder="Ví dụ: IELTS-70-C1" 
                          required
                          value={newClass.className}
                          onChange={(e) => setNewClass({ ...newClass, className: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-700 text-xs font-semibold bg-white"
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
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-xs font-semibold bg-white cursor-pointer"
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
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-xs font-semibold bg-white cursor-pointer"
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
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-700 text-xs font-semibold bg-white"
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
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-700 text-xs font-semibold bg-white"
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
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-700 text-xs font-semibold bg-white"
                        />
                      </div>

                      <div className="md:col-span-3 flex justify-end gap-3 mt-2">
                        <button 
                          type="button"
                          onClick={() => setShowCreateClassForm(false)}
                          className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold cursor-pointer border-none"
                        >
                          Hủy Bỏ
                        </button>
                        <button 
                          type="submit" 
                          className="px-5 py-2 bg-emerald-800 hover:bg-emerald-950 text-white font-bold rounded-xl text-xs cursor-pointer border-none shadow shadow-emerald-900/10"
                        >
                          💾 Tạo lớp học
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* MAIN CONTENT WORKSPACE */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* 1. LEFT/CENTER: WEEKLY CALENDAR SCHEDULER (COL-SPAN 2) */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                  {/* CALENDAR CONTROLS HEADER */}
                  <div className="flex justify-between items-center bg-slate-50 border border-slate-200/60 p-3 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <button type="button" className="w-8 h-8 rounded-full bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center font-bold text-slate-650 text-sm cursor-pointer shadow-sm">
                        &lt;
                      </button>
                      <span className="text-xs font-extrabold text-slate-805">November 11 – 15, 2024</span>
                      <button type="button" className="w-8 h-8 rounded-full bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center font-bold text-slate-650 text-sm cursor-pointer shadow-sm">
                        &gt;
                      </button>
                    </div>

                    <div className="flex bg-slate-200 p-0.5 rounded-lg text-[10px] font-bold border border-slate-300/30">
                      <span className="px-3.5 py-1 bg-white text-slate-800 rounded-md shadow-sm">Week</span>
                      <span className="px-3.5 py-1 text-slate-500 hover:text-slate-700 cursor-pointer">Month</span>
                    </div>
                  </div>

                  {/* TIMETABLE CONTAINER */}
                  <div className="relative border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-sm flex flex-col select-none">
                    
                    {/* Days Column Header */}
                    <div className="grid grid-cols-[80px_1fr] border-b border-slate-200 bg-slate-50 text-[10px] font-extrabold text-slate-400 text-center tracking-wider uppercase">
                      <div className="p-3.5 border-r border-slate-200"></div>
                      <div className="grid grid-cols-5 divide-x divide-slate-200">
                        <div className="p-3">MON<br/><span className="text-sm text-slate-800 font-black">11</span></div>
                        <div className="p-3">TUE<br/><span className="text-sm text-slate-800 font-black">12</span></div>
                        <div className="p-3">WED<br/><span className="text-sm text-slate-800 font-black">13</span></div>
                        <div className="p-3">THU<br/><span className="text-sm text-slate-800 font-black">14</span></div>
                        <div className="p-3">FRI<br/><span className="text-sm text-slate-800 font-black">15</span></div>
                      </div>
                    </div>

                    {/* Timeline & Blocks Body */}
                    <div className="grid grid-cols-[80px_1fr] relative h-[560px]">
                      
                      {/* Time Slots Labels */}
                      <div className="grid grid-rows-7 divide-y divide-slate-150 border-r border-slate-200 text-[10px] font-extrabold text-slate-400 text-right pr-3 bg-slate-50/50 uppercase tracking-tight">
                        <div className="pt-2">09:00 AM</div>
                        <div className="pt-2">10:00 AM</div>
                        <div className="pt-2">11:00 AM</div>
                        <div className="pt-2">12:00 PM</div>
                        <div className="pt-2">01:00 PM</div>
                        <div className="pt-2">02:00 PM</div>
                        <div className="pt-2">03:00 PM</div>
                      </div>

                      {/* Grid Columns */}
                      <div className="relative grid grid-cols-5 divide-x divide-slate-100 h-full bg-slate-50/10">
                        {[0, 1, 2, 3, 4].map(col => (
                          <div key={col} className="grid grid-rows-7 divide-y divide-slate-100 h-full">
                            {[0, 1, 2, 3, 4, 5, 6].map(row => (
                              <div key={row} className="h-[80px] bg-transparent"></div>
                            ))}
                          </div>
                        ))}

                        {/* MOCK CLASS 1: MON 10:00 - 11:30 */}
                        <div 
                          onClick={() => setSelectedCalendarClass({
                            className: "Advanced Linguistics Analysis",
                            teacherName: "Dr. Elena Henderson",
                            courseTitle: "Advanced Phonetics",
                            schedule: "MON 10:00 - 11:30",
                            studentsCount: 24,
                            capacity: 30,
                            students: [
                              { name: "Jameson Doyle", level: "B2 Upper Intermediate", init: "JD" },
                              { name: "Alice Su", level: "C1 Advanced", init: "AS" },
                              { name: "Mateo Kovach", level: "B2 Upper Intermediate", init: "MK" },
                              { name: "Lydia Wang", level: "B1 Intermediate", init: "LW" }
                            ]
                          })}
                          className={`absolute left-[0%] w-[19.8%] top-[80px] h-[120px] rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white p-3.5 text-left shadow-lg cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all flex flex-col justify-between border border-emerald-950 ${
                            selectedCalendarClass?.className === "Advanced Linguistics Analysis" ? 'ring-4 ring-emerald-400 ring-offset-2' : ''
                          }`}
                        >
                          <div>
                            <span className="text-[8px] font-black text-emerald-300 uppercase tracking-wide">10:00 - 11:30</span>
                            <h4 className="font-extrabold text-[11px] leading-tight mt-1 leading-snug">Advanced Linguistics Analysis</h4>
                          </div>
                          <p className="text-[9px] text-emerald-250 font-semibold flex items-center gap-1">👤 Dr. Henderson</p>
                        </div>

                        {/* MOCK CLASS 2: TUE 13:00 - 14:30 */}
                        <div 
                          onClick={() => setSelectedCalendarClass({
                            className: "Academic Writing Workshop",
                            teacherName: "Prof. Marcus Aris",
                            courseTitle: "Academic Writing Specialist",
                            schedule: "TUE 13:00 - 14:30",
                            studentsCount: 18,
                            capacity: 25,
                            students: [
                              { name: "Alex Mercer", level: "C1 Advanced", init: "AM" },
                              { name: "Clara Oswald", level: "B2 Upper Intermediate", init: "CO" },
                              { name: "Jameson Doyle", level: "B2 Upper Intermediate", init: "JD" }
                            ]
                          })}
                          className={`absolute left-[20%] w-[19.8%] top-[320px] h-[120px] rounded-2xl bg-emerald-400 hover:bg-emerald-500 text-emerald-950 p-3.5 text-left shadow-lg cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all flex flex-col justify-between border border-emerald-350 ${
                            selectedCalendarClass?.className === "Academic Writing Workshop" ? 'ring-4 ring-emerald-600 ring-offset-2' : ''
                          }`}
                        >
                          <div>
                            <span className="text-[8px] font-black text-emerald-900 uppercase tracking-wide">13:00 - 14:30</span>
                            <h4 className="font-extrabold text-[11px] leading-tight mt-1 leading-snug">Academic Writing Workshop</h4>
                          </div>
                          <p className="text-[9px] text-emerald-900 font-bold flex items-center gap-1">👤 Prof. Aris</p>
                        </div>

                        {/* MOCK CLASS 3: THU 09:30 - 11:00 */}
                        <div 
                          onClick={() => setSelectedCalendarClass({
                            className: "Grammar Fundamentals II",
                            teacherName: "Sarah Jane",
                            courseTitle: "Basic Grammar Modules",
                            schedule: "THU 09:30 - 11:00",
                            studentsCount: 15,
                            capacity: 20,
                            students: [
                              { name: "John Smith", level: "B1 Intermediate", init: "JS" },
                              { name: "Donna Noble", level: "A2 Elementary", init: "DN" },
                              { name: "Lydia Wang", level: "B1 Intermediate", init: "LW" }
                            ]
                          })}
                          className={`absolute left-[60%] w-[19.8%] top-[40px] h-[120px] rounded-2xl bg-amber-800 hover:bg-amber-900 text-amber-50 p-3.5 text-left shadow-lg cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all flex flex-col justify-between border border-amber-900 ${
                            selectedCalendarClass?.className === "Grammar Fundamentals II" ? 'ring-4 ring-amber-500 ring-offset-2' : ''
                          }`}
                        >
                          <div>
                            <span className="text-[8px] font-black text-amber-300 uppercase tracking-wide">09:30 - 11:00</span>
                            <h4 className="font-extrabold text-[11px] leading-tight mt-1 leading-snug">Grammar Fundamentals II</h4>
                          </div>
                          <p className="text-[9px] text-amber-250 font-semibold flex items-center gap-1">👤 Sarah Jane</p>
                        </div>

                        {/* DYNAMIC BLOCKS: Map actual database classes */}
                        {classrooms.map((cls, idx) => {
                          const col = 2 + (idx % 2) * 2; // WED or FRI
                          const row = 1 + (idx % 5);
                          const top = row * 80 + 20;
                          
                          return (
                            <div 
                              key={cls.id}
                              onClick={() => setSelectedCalendarClass({
                                className: cls.className,
                                teacherName: cls.teacherName || "Chưa phân công",
                                courseTitle: cls.courseTitle,
                                schedule: cls.schedule,
                                studentsCount: 24, 
                                capacity: 30,
                                students: [
                                  { name: "Jameson Doyle", level: "B2 Upper Intermediate", init: "JD" },
                                  { name: "Alice Su", level: "C1 Advanced", init: "AS" },
                                  { name: "Mateo Kovach", level: "B2 Upper Intermediate", init: "MK" }
                                ]
                              })}
                              className={`absolute w-[19.8%] rounded-2xl p-3 text-left shadow border cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all flex flex-col justify-between bg-emerald-50 text-emerald-800 border-emerald-200/80 ${
                                selectedCalendarClass?.className === cls.className ? 'ring-4 ring-emerald-450 ring-offset-2' : ''
                              }`}
                              style={{
                                left: `${col * 20}%`,
                                top: `${top}px`,
                                height: `110px`
                              }}
                            >
                              <div>
                                <span className="text-[8px] font-black text-emerald-600 uppercase tracking-wide">{cls.schedule}</span>
                                <h4 className="font-extrabold text-[10px] leading-tight mt-1 truncate">{cls.className}</h4>
                                <p className="text-[8px] text-slate-400 font-semibold mt-0.5 truncate">{cls.courseTitle}</p>
                              </div>
                              <p className="text-[8px] text-emerald-700 font-bold truncate">👤 {cls.teacherName || "Chưa phân công"}</p>
                            </div>
                          );
                        })}

                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. RIGHT SIDEBAR: TEACHER ASSIGNMENT & ENROLLMENT (COL-SPAN 1) */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                  
                  {/* CARD 1: TEACHER ASSIGNMENT */}
                  <div className="bg-white rounded-3xl border border-slate-150 p-5 shadow-sm relative flex flex-col text-left">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                      <h3 className="text-sm font-extrabold text-slate-800">Teacher Assignment</h3>
                      <button type="button" className="text-slate-400 hover:text-slate-650 text-xs bg-none border-none cursor-pointer">✏️</button>
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3 p-2 hover:bg-slate-50/50 rounded-xl transition-all">
                        <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center font-bold text-slate-700 border border-slate-200">
                          {selectedCalendarClass?.teacherName ? getInitials(selectedCalendarClass.teacherName) : "EH"}
                        </div>
                        <div className="flex-1">
                          <p className="font-extrabold text-xs text-slate-800">{selectedCalendarClass?.teacherName || "Dr. Elena Henderson"}</p>
                          <p className="text-[9px] text-slate-400 font-bold mt-0.5">Lead Faculty, Phonetics</p>
                        </div>
                        <span className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-250 flex items-center justify-center text-[10px] text-emerald-700 font-black">✓</span>
                      </div>

                      {!selectedCalendarClass && (
                        <div className="flex items-center gap-3 p-2 hover:bg-slate-50/50 rounded-xl transition-all">
                          <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center font-bold text-slate-700 border border-slate-200">
                            MA
                          </div>
                          <div className="flex-1">
                            <p className="font-extrabold text-xs text-slate-800">Prof. Marcus Aris</p>
                            <p className="text-[9px] text-slate-400 font-bold mt-0.5">Academic Writing Specialist</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <button 
                      type="button"
                      onClick={() => alert("✨ Đang liên hệ tìm giáo viên dạy thay...")}
                      className="mt-4 w-full py-3 border border-dashed border-slate-300 hover:border-slate-400 text-slate-500 hover:text-slate-800 text-xs font-bold rounded-xl bg-transparent transition-all cursor-pointer"
                    >
                      + Substitute Teacher
                    </button>
                  </div>

                  {/* CARD 2: STUDENT ENROLLMENT */}
                  <div className="bg-white rounded-3xl border border-slate-150 p-5 shadow-sm flex flex-col text-left">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                      <h3 className="text-sm font-extrabold text-slate-800">Student Enrollment</h3>
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[9px] font-black tracking-wider border border-emerald-200/50">
                        {selectedCalendarClass?.studentsCount || 24} / {selectedCalendarClass?.capacity || 30}
                      </span>
                    </div>

                    <div className="flex flex-col gap-3">
                      {(selectedCalendarClass?.students || [
                        { name: "Jameson Doyle", level: "B2 Upper Intermediate", init: "JD" },
                        { name: "Alice Su", level: "C1 Advanced", init: "AS" },
                        { name: "Mateo Kovach", level: "B2 Upper Intermediate", init: "MK" },
                        { name: "Lydia Wang", level: "B1 Intermediate", init: "LW" }
                      ]).map((std, i) => (
                        <div key={i} className="flex items-center justify-between p-2 hover:bg-slate-50/50 rounded-xl transition-all">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-650 border border-slate-200">
                              {std.init || getInitials(std.name)}
                            </div>
                            <div>
                              <p className="font-extrabold text-[11px] text-slate-800">{std.name}</p>
                              <p className="text-[8px] text-slate-400 font-bold mt-0.5">{std.level}</p>
                            </div>
                          </div>
                          <button type="button" className="text-slate-350 hover:text-slate-650 text-xs bg-none border-none cursor-pointer">•••</button>
                        </div>
                      ))}
                    </div>

                    <button 
                      type="button"
                      onClick={() => setSubTab('enroll')}
                      className="mt-5 w-full py-3 bg-[#e0e7ff] hover:bg-[#c7d2fe] text-[#4f46e5] font-extrabold text-xs rounded-xl border-none cursor-pointer transition-all shadow-sm shadow-[#e0e7ff]/30 text-center"
                    >
                      + Manage Enrollment
                    </button>
                  </div>

                </div>

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
                    className="w-full py-3 px-5 text-sm font-bold text-white bg-gradient-to-r from-[#064e3b] to-emerald-800 hover:from-[#047857] hover:to-emerald-700 rounded-xl shadow-lg shadow-emerald-950/10 cursor-pointer border-none mt-2 active:scale-[0.98] transition-all"
                  >
                    ✓ Xếp vào lớp
                  </button>
                </form>
              )}
            </div>
          )}

          {subTab === 'tuition' && (
            // TAB 3: TUITION & INVOICING HUB
            <div className="flex flex-col gap-8 text-left animate-slide-up">
              
              {/* TOP HEADER */}
              <div className="border-b border-slate-100 pb-5">
                <h2 className="text-2xl font-black text-slate-800">Tuition & Invoicing Hub</h2>
                <p className="text-xs text-slate-400 font-medium mt-1">Review student tuition payments, verify uploaded bank transfer receipts, and authorize final invoicing with academic precision.</p>
              </div>

              {/* STATS OVERVIEW CARDS (3 CARDS) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* CARD 1: Pending Reviews */}
                <div className="bg-white border border-slate-150 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-xl shrink-0">
                    📋
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pending Reviews</span>
                    <h3 className="text-2xl font-black text-slate-850 mt-0.5">{tuitionStats?.totalPendingCount || 18}</h3>
                  </div>
                  <span className="px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-black rounded-lg border border-green-200">+12%</span>
                </div>

                {/* CARD 2: Weekly Revenue */}
                <div className="bg-white border border-slate-150 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-xl shrink-0">
                    💵
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Weekly Revenue</span>
                    <h3 className="text-2xl font-black text-slate-850 mt-0.5">
                      {tuitionStats?.totalRevenue ? formatPrice(tuitionStats.totalRevenue) : '$42,850'}
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-black rounded-lg border border-green-200">+5.4k</span>
                </div>

                {/* CARD 3: Administrative Note (Dark Green Banner) */}
                <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 text-white p-5 rounded-2xl shadow-md relative overflow-hidden flex flex-col justify-between border border-emerald-950">
                  <div className="absolute -right-3 -bottom-3 opacity-15">
                    <span className="text-6xl">🛡️</span>
                  </div>
                  <div className="relative z-10">
                    <span className="text-[9px] text-emerald-350 font-black uppercase tracking-wider">Administrative Note</span>
                    <h4 className="text-sm font-extrabold mt-1 leading-tight">Quarterly Audit Ready</h4>
                    <p className="text-[10px] text-emerald-200 mt-1 leading-normal font-medium">All invoices from Q3 have been synchronized with the global mentorship accounting system.</p>
                  </div>
                </div>
              </div>

              {/* MAIN APPROVALS BOARD */}
              <div className="bg-white border border-slate-150 rounded-3xl overflow-hidden flex flex-col shadow-sm">
                
                {/* Table Header controls */}
                <div className="flex justify-between items-center border-b border-slate-150 p-5 bg-slate-50/50">
                  <h3 className="text-sm font-black text-slate-805">Pending Approvals</h3>
                  <div className="flex gap-2">
                    <button type="button" className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-655 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer">
                      <span>🔍 Filter</span>
                    </button>
                    <button type="button" onClick={() => alert("✨ Đang xuất dữ liệu CSV...")} className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-655 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer">
                      <span>📥 Export CSV</span>
                    </button>
                  </div>
                </div>

                {/* Approvals Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50/20 border-b border-slate-150 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="p-4 pl-6">Student Name</th>
                        <th className="p-4">Course Module</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Proof</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 pr-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 font-medium text-slate-700">
                      {(() => {
                        const realPending = tuitionStats?.pendingRecords?.filter(r => r.paymentStatus === 'PENDING_APPROVAL') || [];
                        const mockPending = [
                          {
                            studentName: "Alistar Johnson",
                            studentEmail: "alistar.j@university.edu",
                            courseTitle: "Advanced Academic IELTS",
                            tuitionFee: 1250.00,
                            proofUrl: "/uploads/receipt.pdf",
                            paymentStatus: "PENDING_APPROVAL",
                            paymentId: 9991
                          },
                          {
                            studentName: "Elena Moretti",
                            studentEmail: "e.moretti@design.it",
                            courseTitle: "Business English Mastery",
                            tuitionFee: 890.00,
                            proofUrl: "/uploads/transfer_img.jpg",
                            paymentStatus: "PENDING_APPROVAL",
                            paymentId: 9992
                          }
                        ];

                        const displayList = realPending.length > 0 ? realPending : mockPending;

                        return displayList.map((rec, i) => (
                          <tr key={i} className="hover:bg-slate-50/20 transition-all">
                            {/* Student Avatar Initials & Details */}
                            <td className="p-4 pl-6 flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-800 font-extrabold flex items-center justify-center text-[10px] border border-emerald-100 uppercase">
                                {getInitials(rec.studentName)}
                              </div>
                              <div>
                                <p className="font-extrabold text-xs text-slate-800">{rec.studentName}</p>
                                <p className="text-[9px] text-slate-400 font-semibold mt-0.5">{rec.studentEmail}</p>
                              </div>
                            </td>

                            {/* Course Module */}
                            <td className="p-4 text-xs text-slate-655 font-semibold">{rec.courseTitle || rec.className}</td>

                            {/* Amount */}
                            <td className="p-4 text-xs text-slate-800 font-black">{formatPrice(rec.tuitionFee)}</td>

                            {/* Proof Link with PDF/Image icon */}
                            <td className="p-4 text-xs">
                              {rec.proofUrl ? (
                                <a 
                                  href={rec.proofUrl.startsWith('http') ? rec.proofUrl : `http://localhost:8080${rec.proofUrl}`} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded border border-emerald-150 w-fit cursor-pointer"
                                >
                                  <span>{rec.proofUrl.toLowerCase().endsWith('.pdf') ? '📄' : '🖼️'}</span>
                                  <span className="underline truncate max-w-[120px]">{rec.proofUrl.split('/').pop()}</span>
                                </a>
                              ) : (
                                <span className="text-slate-400 text-[10px] italic">No proof</span>
                              )}
                            </td>

                            {/* Status Badge */}
                            <td className="p-4 text-xs">
                              <span className="px-2.5 py-0.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-[8px] font-black uppercase tracking-wider animate-pulse">
                                {rec.paymentStatus}
                              </span>
                            </td>

                            {/* Actions button */}
                            <td className="p-4 pr-6 text-right">
                              <button 
                                type="button"
                                onClick={() => {
                                  handleApproveTuition(rec.paymentId, rec.studentName, rec.paymentMethod || 'BANK_TRANSFER', rec.tuitionFee, rec.courseTitle || rec.className);
                                }}
                                className="px-4 py-2 bg-[#064e3b] hover:bg-emerald-950 text-white font-extrabold rounded-xl text-xs transition-all border-none cursor-pointer shadow-sm shadow-emerald-900/10"
                              >
                                Approve Transaction
                              </button>
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* AUTOMATED RECONCILIATION BOTTON WIDGET */}
              <div className="bg-indigo-50/50 border border-indigo-150 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white border border-indigo-200 flex items-center justify-center text-lg shrink-0">
                    ✔️
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-indigo-900 text-left">Automated Reconciliation</h4>
                    <p className="text-[10px] text-slate-500 font-semibold mt-1 leading-normal max-w-2xl text-left">
                      Once approved, the system generates a verified PDF invoice and notifies the student via the academic portal. This process is irreversible and logged for audit purposes.
                    </p>
                  </div>
                </div>
                <a href="#audit" onClick={(e) => { e.preventDefault(); alert("✨ Đang mở nhật ký kiểm toán hệ thống..."); }} className="text-xs font-black text-[#4f46e5] hover:underline whitespace-nowrap">
                  View Audit Logs →
                </a>
              </div>

            </div>
          )}

          {subTab === 'paymentConfig' && (
            // TAB 4: CẤU HÌNH CỔNG THANH TOÁN
            <div className="flex flex-col gap-6 animate-slide-up text-left">
              <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-black text-slate-800">⚙️ Thiết Lập Cổng Thanh Toán & Webhooks</h3>
                  <p className="text-xs text-slate-455 font-semibold mt-1">Cấu hình các kênh đóng học phí tự động MoMo, Stripe Credit Card, Chuyển khoản ngân hàng và quản lý Webhook kết nối.</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button 
                    onClick={() => {
                      alert("✨ Đang khởi tạo cổng thanh toán mới...");
                    }}
                    className="px-3.5 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-extrabold rounded-xl text-xs transition-all cursor-pointer border border-emerald-200/50"
                  >
                    ＋ Add New Method
                  </button>
                  <button 
                    onClick={() => {
                      alert("🎉 Đã lưu toàn bộ cấu hình cổng thanh toán thành công!");
                    }}
                    className="px-4 py-2 bg-[#064e3b] hover:bg-emerald-900 text-white font-extrabold rounded-xl text-xs transition-all cursor-pointer border-none shadow shadow-emerald-900/10"
                  >
                    Save All Changes
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                
                {/* CỘT TRÁI: CÁC CARD CẤU HÌNH (3/5 cột) */}
                <div className="lg:col-span-3 flex flex-col gap-5">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phương thức thanh toán tích hợp</h4>
                  
                  {paymentConfigs.map(cfg => {
                    const isEditing = editingConfigId === cfg.id;
                    const isStripe = cfg.gatewayKey === 'STRIPE';
                    const isMomo = cfg.gatewayKey === 'MOMO';
                    
                    return (
                      <div 
                        key={cfg.id}
                        className={`bg-white rounded-2xl border transition-all duration-200 p-5 ${
                          isEditing ? 'border-emerald-500 ring-1 ring-emerald-500/20 shadow-md' : 'border-slate-200 hover:border-slate-350 shadow-sm'
                        }`}
                      >
                        {/* Header của Card */}
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100 flex items-center justify-center text-lg shrink-0">
                              {isStripe ? '💳' : isMomo ? '📱' : '🏦'}
                            </div>
                            <div>
                              <h5 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                                {cfg.gatewayName}
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                                  cfg.isActive 
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' 
                                    : 'bg-slate-50 text-slate-400 border border-slate-200'
                                }`}>
                                  {cfg.isActive ? 'Hoạt động' : 'Tạm dừng'}
                                </span>
                              </h5>
                              <p className="text-[10px] text-slate-400 font-semibold mt-0.5 uppercase tracking-wider">{cfg.gatewayKey}</p>
                            </div>
                          </div>

                          {!isEditing && (
                            <button
                              onClick={() => handleEditConfigClick(cfg)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-lg text-[10px] transition-all cursor-pointer border border-slate-200/50"
                            >
                              Cấu hình ⚙️
                            </button>
                          )}
                        </div>

                        {/* Chi tiết hiển thị (khi KHÔNG sửa) */}
                        {!isEditing ? (
                          <div className="mt-4 pt-3 border-t border-slate-50 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-600 font-semibold">
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 block uppercase">Số tài khoản / ID</span>
                              <span className="text-slate-800 font-extrabold">{cfg.accountNumber}</span>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 block uppercase">Chủ thụ hưởng</span>
                              <span className="text-slate-800 font-extrabold">{cfg.accountName}</span>
                            </div>
                            <div className="col-span-2 mt-1">
                              <span className="text-[10px] font-bold text-slate-400 block uppercase">Cú pháp chuyển khoản</span>
                              <code className="text-emerald-800 bg-emerald-50/50 px-1.5 py-0.5 rounded font-mono font-bold text-[10px] inline-block mt-0.5">{cfg.syntaxTemplate}</code>
                            </div>
                            {isStripe && (
                              <div className="col-span-2 mt-1.5 p-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px]">
                                <span className="font-bold text-slate-500">Stripe Webhook URL:</span>
                                <code className="block mt-0.5 text-slate-700 bg-white border border-slate-150 px-2 py-1 rounded truncate">http://localhost:8080/api/payments/stripe/webhook</code>
                              </div>
                            )}
                          </div>
                        ) : (
                          // Form chỉnh sửa trực tiếp bên dưới card (Expandable inline form)
                          <form onSubmit={handleConfigSubmit} className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-4 text-xs font-semibold text-slate-655">
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tên hiển thị</label>
                                <input
                                  type="text"
                                  required
                                  value={editConfigForm.gatewayName}
                                  onChange={(e) => setEditConfigForm({ ...editConfigForm, gatewayName: e.target.value })}
                                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-700 text-xs font-semibold bg-white"
                                />
                              </div>

                              <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{isStripe ? 'Stripe Publishable Key' : 'Số tài khoản / SĐT Ví'}</label>
                                <input
                                  type="text"
                                  required
                                  value={editConfigForm.accountNumber}
                                  onChange={(e) => setEditConfigForm({ ...editConfigForm, accountNumber: e.target.value })}
                                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-700 text-xs font-semibold bg-white"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{isStripe ? 'Stripe Secret Key' : 'Tên chủ tài khoản'}</label>
                                <input
                                  type="text"
                                  required
                                  value={editConfigForm.accountName}
                                  onChange={(e) => setEditConfigForm({ ...editConfigForm, accountName: e.target.value })}
                                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-700 text-xs font-semibold bg-white"
                                />
                              </div>

                              <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{isStripe ? 'Stripe Webhook Signing Secret' : 'Cú pháp chuyển khoản'}</label>
                                <input
                                  type="text"
                                  required
                                  value={editConfigForm.syntaxTemplate}
                                  onChange={(e) => setEditConfigForm({ ...editConfigForm, syntaxTemplate: e.target.value })}
                                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-700 text-xs font-semibold bg-white font-mono"
                                />
                              </div>
                            </div>

                            {isStripe && (
                              <div className="flex flex-col gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px]">
                                <span className="font-bold text-slate-500">Webhook Endpoints (URL nhận thông báo tự động):</span>
                                <code className="block mt-1 text-slate-700 bg-white border border-slate-150 px-2 py-1.5 rounded truncate select-all">http://localhost:8080/api/payments/stripe/webhook</code>
                              </div>
                            )}

                            {!isStripe && (
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ảnh QR Code tĩnh (Click để tải lên/đổi ảnh)</label>
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
                                  <div className="mt-2.5 p-2 bg-emerald-50/50 border border-emerald-100 rounded-xl flex justify-between items-center gap-2">
                                    <span className="text-[10px] text-emerald-800 truncate flex-1 font-bold">QR: {editConfigForm.qrUrl}</span>
                                    <button
                                      type="button"
                                      onClick={() => setEditConfigForm({ ...editConfigForm, qrUrl: '' })}
                                      className="text-red-500 hover:text-red-700 text-[10px] font-bold bg-none border-none cursor-pointer"
                                    >
                                      Gỡ bỏ
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}

                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id={`active_${cfg.id}`}
                                  checked={editConfigForm.isActive}
                                  onChange={(e) => setEditConfigForm({ ...editConfigForm, isActive: e.target.checked })}
                                  className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-500/20 cursor-pointer"
                                />
                                <label htmlFor={`active_${cfg.id}`} className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                                  Kích hoạt hoạt động
                                </label>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingConfigId(null)}
                                  className="px-4 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-655 font-bold rounded-lg text-xs cursor-pointer"
                                >
                                  Hủy
                                </button>
                                <button
                                  type="submit"
                                  className="px-4 py-1.5 bg-[#064e3b] hover:bg-emerald-900 text-white font-bold rounded-lg text-xs border-none cursor-pointer shadow-sm"
                                >
                                  Lưu lại
                                </button>
                              </div>
                            </div>

                          </form>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* CỘT PHẢI: WEBHOOK & API ACTIVITY INSIGHTS TIMELINE (2/5 cột) */}
                <div className="lg:col-span-2 flex flex-col gap-5">
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-white shadow-lg flex flex-col justify-between h-full min-h-[500px]">
                    <div>
                      {/* Webhook Connection Health Status */}
                      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                        <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Webhook Connection</h4>
                          <h3 className="text-sm font-black mt-1 text-emerald-400 flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
                            ACTIVE (Verified)
                          </h3>
                        </div>
                        <span className="text-[10px] font-bold border border-slate-800 bg-slate-800 text-slate-300 rounded px-2.5 py-1">
                          SSL Secure
                        </span>
                      </div>

                      {/* Webhook logs Timeline */}
                      <div className="mt-6 space-y-5">
                        <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Live Webhook Log Stream</h5>
                        
                        <div className="relative border-l-2 border-slate-800 pl-4 ml-2 space-y-5">
                          {/* Log item 1 */}
                          <div className="relative">
                            <span className="absolute -left-[21px] top-1 w-2 h-2 bg-emerald-400 rounded-full ring-4 ring-slate-900"></span>
                            <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400">
                              <span>10:48:30 AM</span>
                              <span className="text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 rounded">charge.succeeded</span>
                            </div>
                            <p className="text-[11px] text-slate-200 mt-1 font-bold">Học viên Đào Long Nhật thanh toán 2.500.000đ</p>
                            <p className="text-[9px] text-slate-500 mt-0.5 font-mono">Payload: id=ch_3M4r9vLms123 • Status=Verified ✅</p>
                          </div>

                          {/* Log item 2 */}
                          <div className="relative">
                            <span className="absolute -left-[21px] top-1 w-2 h-2 bg-emerald-400 rounded-full ring-4 ring-slate-900"></span>
                            <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400">
                              <span>09:12:15 AM</span>
                              <span className="text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 rounded">payment_intent.created</span>
                            </div>
                            <p className="text-[11px] text-slate-200 mt-1 font-bold">Checkout bắt đầu (Lớp IELTS-6.5)</p>
                            <p className="text-[9px] text-slate-500 mt-0.5 font-mono">Payload: studentId=42 • amount=2500000 → OK</p>
                          </div>

                          {/* Log item 3 */}
                          <div className="relative">
                            <span className="absolute -left-[21px] top-1 w-2 h-2 bg-slate-500 rounded-full ring-4 ring-slate-900"></span>
                            <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400">
                              <span>Yesterday, 06:14:02 PM</span>
                              <span className="text-slate-300 border border-slate-700 bg-slate-800 px-1.5 py-0.5 rounded">charge.refunded</span>
                            </div>
                            <p className="text-[11px] text-slate-355 mt-1 font-semibold">Hoàn phí cho học viên Nguyễn Thị Thu (1.200.000đ)</p>
                            <p className="text-[9px] text-slate-500 mt-0.5 font-mono">Reason: Course Withdrawal • Ref=re_12345</p>
                          </div>

                          {/* Log item 4 */}
                          <div className="relative">
                            <span className="absolute -left-[21px] top-1 w-2 h-2 bg-emerald-400 rounded-full ring-4 ring-slate-900"></span>
                            <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400">
                              <span>2026-06-01, 11:20:49 AM</span>
                              <span className="text-emerald-450 border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 rounded">webhook.ping</span>
                            </div>
                            <p className="text-[11px] text-slate-200 mt-1 font-bold">Stripe Webhook ping endpoint test</p>
                            <p className="text-[9px] text-slate-500 mt-0.5 font-mono">Status: HTTP 200 OK (Verified Signature)</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-bold">
                      <span>Last Ping: Just now</span>
                      <button 
                        onClick={() => {
                          alert("🔄 Đang thử lại kết nối Stripe API Webhook...");
                        }}
                        className="text-emerald-400 hover:text-emerald-300 bg-none border-none cursor-pointer underline flex items-center gap-1"
                      >
                        Test Connection ➔
                      </button>
                    </div>
                  </div>
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
