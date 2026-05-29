import React, { useState, useEffect } from 'react';
import axios from 'axios';

function TeacherPortal({ user }) {
  // Existing states
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [gradesForm, setGradesForm] = useState({}); // Luu diem tam thoi thi thu

  // Tab State
  const [activeTab, setActiveTab] = useState('class_grades');

  // Materials States
  const [materials, setMaterials] = useState([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialDescription, setMaterialDescription] = useState('');
  const [materialType, setMaterialType] = useState('FILE'); // FILE or LINK
  const [materialLink, setMaterialLink] = useState('');
  const [materialFile, setMaterialFile] = useState(null);
  const [uploadingMaterial, setUploadingMaterial] = useState(false);

  // Activities States
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [activityTitle, setActivityTitle] = useState('');
  const [activityType, setActivityType] = useState('ASSIGNMENT'); // ASSIGNMENT or TEST
  const [activitySkill, setActivitySkill] = useState('READING'); // LISTENING, SPEAKING, READING, WRITING
  const [activityInstruction, setActivityInstruction] = useState('');
  const [activityAudioFile, setActivityAudioFile] = useState(null);
  const [activityQuestions, setActivityQuestions] = useState([]);
  const [uploadingActivity, setUploadingActivity] = useState(false);

  // Grading States
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradingScore, setGradingScore] = useState('');
  const [gradingFeedback, setGradingFeedback] = useState('');
  const [savingGrade, setSavingGrade] = useState(false);

  useEffect(() => {
    fetchTeacherClasses();
  }, [user]);

  const fetchTeacherClasses = async () => {
    try {
      setLoadingClasses(true);
      const response = await axios.get(`http://localhost:8080/api/classrooms/teacher/${user.id}`);
      setClassrooms(response.data);
    } catch (err) {
      console.error("Loi lay danh sach lop hoc cua giao vien:", err);
    } finally {
      setLoadingClasses(false);
    }
  };

  // Chon lop hoc va lay danh sach hoc vien & du lieu LMS
  const handleSelectClass = async (classroom) => {
    setSelectedClass(classroom);
    setLoadingStudents(true);
    setActiveTab("class_grades");
    setSelectedActivityId("");
    setSelectedSubmission(null);
    setSubmissions([]);

    try {
      const response = await axios.get(`http://localhost:8080/api/classrooms/${classroom.id}/students`);
      setStudents(response.data);
      
      // Khoi tao form diem tam thoi
      const initialGrades = {};
      response.data.forEach(student => {
        initialGrades[student.studentId] = student.grade !== null ? student.grade.toString() : '';
      });
      setGradesForm(initialGrades);

      // LMS fetches if course ID is present
      if (classroom.courseId) {
        fetchMaterials(classroom.courseId);
        fetchActivities(classroom.courseId);
      }
    } catch (err) {
      console.error("Loi lay danh sach hoc vien trong lop:", err);
      alert("Khong the lay danh sach hoc vien.");
    } finally {
      setLoadingStudents(false);
    }
  };

  // ----------------------------------------------------
  // TAI LIEU GIANG DAY (LMS)
  // ----------------------------------------------------
  const fetchMaterials = async (courseId) => {
    if (!courseId) return;
    try {
      setLoadingMaterials(true);
      const res = await axios.get(`http://localhost:8080/api/lms/courses/${courseId}/materials`);
      setMaterials(res.data);
    } catch (err) {
      console.error("Loi lay danh sach tai lieu:", err);
    } finally {
      setLoadingMaterials(false);
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    if (!window.confirm("Ban co chac chan muon xoa tai lieu nay?")) return;
    try {
      await axios.delete(`http://localhost:8080/api/lms/materials/${materialId}`);
      alert("🎉 Xoa tai lieu thanh cong!");
      fetchMaterials(selectedClass.courseId);
    } catch (err) {
      console.error("Loi xoa tai lieu:", err);
      alert("Khong the xoa tai lieu.");
    }
  };

  const handleCreateMaterial = async (e) => {
    e.preventDefault();
    if (!materialTitle.trim()) {
      alert("Vui long nhap tieu de tai lieu!");
      return;
    }

    try {
      setUploadingMaterial(true);
      let finalFileUrl = "";

      if (materialType === "FILE") {
        if (!materialFile) {
          alert("Vui long chon mot tep tin!");
          setUploadingMaterial(false);
          return;
        }
        const formData = new FormData();
        formData.append("file", materialFile);
        const uploadRes = await axios.post("http://localhost:8080/api/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        finalFileUrl = uploadRes.data.url;
      } else {
        if (!materialLink.trim()) {
          alert("Vui long nhap duong dan lien ket!");
          setUploadingMaterial(false);
          return;
        }
        finalFileUrl = materialLink;
      }

      const payload = {
        title: materialTitle,
        description: materialDescription,
        type: materialType,
        fileUrl: finalFileUrl
      };

      await axios.post(`http://localhost:8080/api/lms/courses/${selectedClass.courseId}/materials`, payload);
      alert("🎉 Tai len tai lieu thanh cong!");
      
      // Reset Form
      setMaterialTitle("");
      setMaterialDescription("");
      setMaterialType("FILE");
      setMaterialLink("");
      setMaterialFile(null);
      const fileInput = document.getElementById("materialFileInput");
      if (fileInput) fileInput.value = "";

      fetchMaterials(selectedClass.courseId);
    } catch (err) {
      console.error("Loi tao tai lieu:", err);
      let msg = "Lỗi khi tạo tài liệu.";
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          msg = err.response.data;
        } else if (err.response.data.message) {
          msg = err.response.data.message;
        } else if (err.response.data.error) {
          msg = err.response.data.error;
        } else {
          msg = JSON.stringify(err.response.data);
        }
      } else if (err.message) {
        msg = err.message;
      }
      alert(`❌ ${msg}`);
    } finally {
      setUploadingMaterial(false);
    }
  };

  // ----------------------------------------------------
  // TAO BAI TAP & KIEM TRA (LMS)
  // ----------------------------------------------------
  const fetchActivities = async (courseId) => {
    if (!courseId) return;
    try {
      setLoadingActivities(true);
      const res = await axios.get(`http://localhost:8080/api/lms/courses/${courseId}/activities`);
      setActivities(res.data);
    } catch (err) {
      console.error("Loi lay danh sach hoat dong:", err);
    } finally {
      setLoadingActivities(false);
    }
  };

  const handleDeleteActivity = async (activityId) => {
    if (!window.confirm("Ban co chac chan muon xoa hoat dong nay?")) return;
    try {
      await axios.delete(`http://localhost:8080/api/lms/activities/${activityId}`);
      alert("🎉 Xoa hoat dong thanh cong!");
      fetchActivities(selectedClass.courseId);
      if (selectedActivityId === activityId.toString()) {
        setSelectedActivityId("");
        setSubmissions([]);
        setSelectedSubmission(null);
      }
    } catch (err) {
      console.error("Loi khi xoa hoat dong:", err);
      alert("Khong the xoa hoat dong.");
    }
  };

  const handleReleaseResults = async (activityId) => {
    try {
      await axios.put(`http://localhost:8080/api/lms/activities/${activityId}/release`);
      alert("🎉 Cong bo diem thi thanh cong! Hoc vien da co the xem diem.");
      fetchActivities(selectedClass.courseId);
    } catch (err) {
      console.error("Loi khi cong bo diem thi:", err);
      alert("Loi khi cong bo ket qua.");
    }
  };

  const handleAddQuestion = () => {
    setActivityQuestions(prev => [
      ...prev,
      {
        questionText: "",
        questionType: "MULTIPLE_CHOICE",
        options: "",
        correctAnswer: ""
      }
    ]);
  };

  const handleRemoveQuestion = (index) => {
    setActivityQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index, field, value) => {
    setActivityQuestions(prev => prev.map((q, i) => i === index ? { ...q, [field]: value } : q));
  };

  const handleCreateActivity = async (e) => {
    e.preventDefault();
    if (!activityTitle.trim()) {
      alert("Vui long nhap tieu de!");
      return;
    }
    if (activityQuestions.length === 0) {
      alert("Vui long tao it nhat 1 cau hoi!");
      return;
    }

    // Validate
    for (let i = 0; i < activityQuestions.length; i++) {
      const q = activityQuestions[i];
      if (!q.questionText.trim()) {
        alert(`Vui long nhap noi dung cho cau hoi ${i + 1}`);
        return;
      }
      if (q.questionType === "MULTIPLE_CHOICE" && !q.options.trim()) {
        alert(`Vui long nhap lua chon cho cau hoi trac nghiem ${i + 1}`);
        return;
      }
    }

    try {
      setUploadingActivity(true);
      let finalAudioUrl = "";

      if (activitySkill === "LISTENING" && activityAudioFile) {
        const formData = new FormData();
        formData.append("file", activityAudioFile);
        const uploadRes = await axios.post("http://localhost:8080/api/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        finalAudioUrl = uploadRes.data.url;
      }

      const formattedQuestions = activityQuestions.map((q, idx) => ({
        questionNumber: idx + 1,
        questionText: q.questionText,
        questionType: q.questionType,
        options: q.questionType === "MULTIPLE_CHOICE" ? q.options : null,
        correctAnswer: q.correctAnswer
      }));

      const payload = {
        title: activityTitle,
        type: activityType,
        skill: activitySkill,
        instruction: activityInstruction,
        audioUrl: finalAudioUrl,
        questions: formattedQuestions
      };

      await axios.post(`http://localhost:8080/api/lms/courses/${selectedClass.courseId}/activities`, payload);
      alert("🎉 Tao bai tap / bai kiem tra thanh cong!");

      // Reset Form
      setActivityTitle("");
      setActivityType("ASSIGNMENT");
      setActivitySkill("READING");
      setActivityInstruction("");
      setActivityAudioFile(null);
      setActivityQuestions([]);
      const audioInput = document.getElementById("activityAudioInput");
      if (audioInput) audioInput.value = "";

      fetchActivities(selectedClass.courseId);
    } catch (err) {
      console.error("Loi tao hoat dong:", err);
      let msg = "Không thể tạo hoạt động.";
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          msg = err.response.data;
        } else if (err.response.data.message) {
          msg = err.response.data.message;
        } else if (err.response.data.error) {
          msg = err.response.data.error;
        } else {
          msg = JSON.stringify(err.response.data);
        }
      } else if (err.message) {
        msg = err.message;
      }
      alert(`❌ ${msg}`);
    } finally {
      setUploadingActivity(false);
    }
  };

  // ----------------------------------------------------
  // CHAM DIEM & PHAN HOI (LMS)
  // ----------------------------------------------------
  const handleSelectActivity = async (activityId) => {
    setSelectedActivityId(activityId);
    setSelectedSubmission(null);
    if (!activityId) {
      setSubmissions([]);
      return;
    }
    try {
      setLoadingSubmissions(true);
      const res = await axios.get(`http://localhost:8080/api/lms/activities/${activityId}/submissions`);
      setSubmissions(res.data);
    } catch (err) {
      console.error("Loi lay danh sach bai nop:", err);
      alert("Loi khi tai danh sach bai nop.");
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleSelectSubmission = (submission) => {
    setSelectedSubmission(submission);
    setGradingScore(submission.score !== null ? submission.score.toString() : "");
    setGradingFeedback(submission.teacherFeedback || "");
  };

  const handleSaveSubmissionGrade = async (e) => {
    e.preventDefault();
    if (gradingScore === "") {
      alert("Vui long nhap diem!");
      return;
    }
    const scoreNum = parseFloat(gradingScore);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 10) {
      alert("Diem so phai tu 0.00 den 10.00!");
      return;
    }

    try {
      setSavingGrade(true);
      const payload = {
        score: scoreNum,
        teacherFeedback: gradingFeedback
      };
      const res = await axios.put(`http://localhost:8080/api/lms/submissions/${selectedSubmission.id}/grade`, payload);
      alert("🎉 Da cham diem va gui nhan xet thanh cong!");
      
      // Update local submissions list & active submission
      setSubmissions(prev => prev.map(sub => sub.id === selectedSubmission.id ? res.data : sub));
      setSelectedSubmission(res.data);
    } catch (err) {
      console.error("Loi khi cham diem:", err);
      let msg = "Lỗi khi lưu kết quả chấm điểm.";
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          msg = err.response.data;
        } else if (err.response.data.message) {
          msg = err.response.data.message;
        } else if (err.response.data.error) {
          msg = err.response.data.error;
        } else {
          msg = JSON.stringify(err.response.data);
        }
      } else if (err.message) {
        msg = err.message;
      }
      alert(`❌ ${msg}`);
    } finally {
      setSavingGrade(false);
    }
  };

  // ----------------------------------------------------
  // ORIGINAL GRADES FUNCTION
  // ----------------------------------------------------
  const handleGradeChange = (studentId, value) => {
    setGradesForm({ ...gradesForm, [studentId]: value });
  };

  const handleSaveGrade = async (studentId) => {
    const rawGrade = gradesForm[studentId];
    if (rawGrade === '') {
      alert("Vui lòng nhập điểm trước khi lưu!");
      return;
    }

    const parsedGrade = parseFloat(rawGrade);
    if (isNaN(parsedGrade) || parsedGrade < 0 || parsedGrade > 10) {
      alert("Điểm thi thử không hợp lệ. Vui lòng nhập số thuộc thang điểm từ 0.00 đến 10.00!");
      return;
    }

    try {
      await axios.put(`http://localhost:8080/api/classrooms/${selectedClass.id}/students/${studentId}/grade`, null, {
        params: { grade: parsedGrade }
      });
      
      // Cap nhat lai UI
      setStudents(prev => prev.map(s => s.studentId === studentId ? { ...s, grade: parsedGrade } : s));
      alert("🎉 Cập nhật kết quả điểm thi thử học viên thành công!");
    } catch (err) {
      console.error("Lỗi cập nhật điểm:", err);
      alert(err.response?.data?.message || "Lỗi khi cập nhật điểm học viên.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      
      {/* BANNER CHÀO MỪNG */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-orange-950 rounded-3xl p-6 sm:p-8 text-white mb-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <span className="px-3 py-1 bg-orange-500/20 text-orange-400 text-[10px] font-bold rounded-full uppercase border border-orange-500/10 tracking-widest">
            🎓 Teacher Dashboard
          </span>
          <h2 className="text-2xl sm:text-3xl font-black mt-4">Chào mừng Giáo viên, {user.fullName}!</h2>
          <p className="text-slate-400 text-sm mt-1.5 font-medium leading-relaxed max-w-xl">
            Hệ thống LMS và quản lý điểm số tích hợp. Bạn có thể tải tài liệu giảng dạy, tạo các hoạt động luyện tập hoặc chấm điểm nói/viết trực quan của học viên.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* CỘT 1: DANH SÁCH LỚP HỌC ĐƯỢC PHÂN CÔNG */}
        <div className="lg:col-span-1 flex flex-col gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-base font-black text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
              🏫 Lớp Học Phụ Trách
            </h3>

            {loadingClasses ? (
              <div className="py-10 text-center flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-3 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs text-slate-400 font-semibold">Đang lấy lớp học...</span>
              </div>
            ) : classrooms.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-xs font-semibold">
                Chưa được phân công lớp học nào.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {classrooms.map(cls => (
                  <button 
                    key={cls.id}
                    onClick={() => handleSelectClass(cls)}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                      selectedClass?.id === cls.id
                        ? 'border-orange-500 bg-orange-50/20 shadow-md shadow-orange-500/5'
                        : 'border-slate-100 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <p className="font-extrabold text-sm text-slate-800">{cls.className}</p>
                    <span className="inline-block text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded mt-1.5 border border-orange-100/50">
                      {cls.courseTitle}
                    </span>
                    <p className="text-[10px] text-slate-400 font-bold mt-2">
                      🕒 Lịch: {cls.schedule}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CHI TIẾT TỪNG LỚP HỌC THEO TAB (3 CỘT) */}
        <div className="lg:col-span-3">
          {selectedClass ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col min-h-[500px]">
              
              {/* TOP HEADER CHI TIẾT LỚP */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 pb-4 border-b border-slate-100 gap-4">
                <div>
                  <h3 className="text-xl font-black text-slate-800">
                    👥 Lớp: {selectedClass.className}
                  </h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                    Môn học: {selectedClass.courseTitle}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-orange-50 text-orange-500 border border-orange-100 rounded-full text-xs font-bold">
                    Khóa ID: {selectedClass.courseId || "Chưa gán"}
                  </span>
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">
                    Sĩ số: {students.length}
                  </span>
                </div>
              </div>

              {/* TABS SELECTOR */}
              <div className="flex border-b border-slate-100 mb-6 gap-1 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: 'class_grades', label: '👥 Lớp Học & Bảng Điểm', icon: '👥' },
                  { id: 'materials', label: '📚 Tài Liệu Giảng Dạy (LMS)', icon: '📚' },
                  { id: 'activities', label: '📝 Tạo Bài Tập & Kiểm Tra', icon: '📝' },
                  { id: 'grading', label: '🎯 Chấm Điểm & Phản Hồi', icon: '🎯' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-2.5 text-xs font-black rounded-xl whitespace-nowrap cursor-pointer transition-all border ${
                      activeTab === tab.id
                        ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20'
                        : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    <span className="mr-1.5">{tab.icon}</span>{tab.label}
                  </button>
                ))}
              </div>

              {/* TAB CONTENT AREAS */}
              
              {/* TAB 1: LOP HOC & BANG DIEM */}
              {activeTab === 'class_grades' && (
                <div className="animate-fade-in flex-1">
                  {loadingStudents ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm text-slate-400 font-semibold">Đang lấy danh sách học viên...</span>
                    </div>
                  ) : students.length === 0 ? (
                    <div className="py-20 text-center text-slate-400 font-semibold text-sm">
                      Lớp học này chưa được xếp học viên vào.
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-100">
                      <table className="w-full text-left text-sm border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            <th className="p-4">Học Viên</th>
                            <th className="p-4">Điểm Thi Thử Hiện Tại</th>
                            <th className="p-4 text-right">Nhập / Sửa Điểm (Thang 10)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                          {students.map(std => (
                            <tr key={std.studentId} className="hover:bg-slate-50/20 transition-colors">
                              <td className="p-4">
                                <p className="font-extrabold text-slate-800 text-sm">{std.studentName}</p>
                                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{std.studentEmail}</p>
                              </td>
                              <td className="p-4">
                                {std.grade !== null ? (
                                  <span className="px-2.5 py-1 text-xs font-black rounded-lg border bg-green-50 text-green-700 border-green-200">
                                    {std.grade} / 10
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 text-xs font-bold rounded-lg border bg-slate-50 text-slate-400 border-slate-200/50">
                                    Chưa có điểm thi thử
                                  </span>
                                )}
                              </td>
                              <td className="p-4 text-right flex justify-end items-center gap-3">
                                <input 
                                  type="number"
                                  min="0"
                                  max="10"
                                  step="0.1"
                                  placeholder="VD: 8.5"
                                  value={gradesForm[std.studentId] || ''}
                                  onChange={(e) => handleGradeChange(std.studentId, e.target.value)}
                                  className="w-20 px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-center font-bold text-slate-800 text-xs bg-slate-50/50"
                                />
                                <button 
                                  onClick={() => handleSaveGrade(std.studentId)}
                                  className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-all text-xs cursor-pointer shadow shadow-orange-500/10 border-none"
                                >
                                  Lưu
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: TAI LIEU GIANG DAY */}
              {activeTab === 'materials' && (
                <div className="animate-fade-in flex flex-col gap-8">
                  {/* Form Upload */}
                  <form onSubmit={handleCreateMaterial} className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 flex flex-col gap-4">
                    <h4 className="text-sm font-bold text-slate-800">➕ Tải lên tài liệu mới cho môn học</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase">Tiêu đề tài liệu</label>
                        <input 
                          type="text" 
                          required
                          value={materialTitle}
                          onChange={(e) => setMaterialTitle(e.target.value)}
                          placeholder="VD: Tài liệu Reading Unit 1"
                          className="w-full px-3 py-2 text-xs border border-slate-250 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
                        />
                      </div>
                      
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase">Mô tả tài liệu</label>
                        <input 
                          type="text" 
                          value={materialDescription}
                          onChange={(e) => setMaterialDescription(e.target.value)}
                          placeholder="VD: Các từ vựng quan trọng..."
                          className="w-full px-3 py-2 text-xs border border-slate-250 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase">Loại tài liệu</label>
                        <select 
                          value={materialType} 
                          onChange={(e) => setMaterialType(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-slate-250 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
                        >
                          <option value="FILE">📁 Tệp tin đính kèm (PDF, Word...)</option>
                          <option value="LINK">🔗 Đường dẫn / YouTube Link</option>
                        </select>
                      </div>

                      {materialType === 'FILE' ? (
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-bold text-slate-500 uppercase">Chọn tệp tài liệu</label>
                          <input 
                            id="materialFileInput"
                            type="file" 
                            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                            onChange={(e) => setMaterialFile(e.target.files[0])}
                            className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100"
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-bold text-slate-500 uppercase">Đường dẫn liên kết</label>
                          <input 
                            type="url" 
                            value={materialLink}
                            onChange={(e) => setMaterialLink(e.target.value)}
                            placeholder="https://example.com/tai-lieu"
                            className="w-full px-3 py-2 text-xs border border-slate-250 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
                          />
                        </div>
                      )}
                    </div>

                    <button 
                      type="submit" 
                      disabled={uploadingMaterial}
                      className="w-full mt-2 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl text-xs active:scale-[0.98] transition-all cursor-pointer shadow border-none disabled:opacity-55"
                    >
                      {uploadingMaterial ? "⏳ Đang tải tài liệu lên..." : "📁 Tải tài liệu lên môn học"}
                    </button>
                  </form>

                  {/* Materials List */}
                  <div className="flex flex-col gap-4">
                    <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">📚 Tài liệu hiện có ({materials.length})</h4>
                    
                    {loadingMaterials ? (
                      <div className="py-10 text-center text-xs text-slate-400">Đang tải danh sách tài liệu...</div>
                    ) : materials.length === 0 ? (
                      <div className="py-10 text-center text-xs text-slate-400 italic">Môn học này chưa có tài liệu nào.</div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {materials.map(mat => (
                          <div key={mat.id} className="p-4 rounded-2xl border border-slate-150 bg-white shadow-sm flex items-start justify-between gap-3 hover:border-slate-350 transition-all">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`text-[9px] px-2 py-0.5 rounded font-black border uppercase ${
                                  mat.type === 'FILE' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-green-50 text-green-600 border-green-100'
                                }`}>
                                  {mat.type}
                                </span>
                                <h5 className="font-extrabold text-slate-800 text-xs truncate">{mat.title}</h5>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-1.5">{mat.description || "Không có mô tả."}</p>
                              <a 
                                href={mat.fileUrl} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-[10px] text-orange-500 hover:text-orange-600 font-bold block mt-3 underline truncate"
                              >
                                {mat.fileUrl}
                              </a>
                            </div>
                            <button 
                              onClick={() => handleDeleteMaterial(mat.id)}
                              className="p-1.5 text-red-500 hover:text-white hover:bg-red-500 rounded-lg cursor-pointer transition-all border-none bg-none"
                            >
                              🗑️
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: TAO BAI TAP & KIEM TRA */}
              {activeTab === 'activities' && (
                <div className="animate-fade-in flex flex-col gap-8">
                  {/* Form Create Activity */}
                  <form onSubmit={handleCreateActivity} className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 flex flex-col gap-4">
                    <h4 className="text-sm font-bold text-slate-800">➕ Tạo Bài Luyện Tập & Kiểm Tra mới</h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex flex-col gap-1.5 md:col-span-2">
                        <label className="text-[11px] font-bold text-slate-500 uppercase">Tiêu đề hoạt động</label>
                        <input 
                          type="text" 
                          required
                          value={activityTitle}
                          onChange={(e) => setActivityTitle(e.target.value)}
                          placeholder="VD: Kiểm tra Speaking định kỳ tháng 10"
                          className="w-full px-3 py-2 text-xs border border-slate-250 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
                        />
                      </div>
                      
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase">Loại hoạt động</label>
                        <select 
                          value={activityType}
                          onChange={(e) => setActivityType(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-slate-250 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
                        >
                          <option value="ASSIGNMENT">📚 BÀI LUYỆN TẬP (ASSIGNMENT)</option>
                          <option value="TEST">📝 BÀI KIỂM TRA (TEST)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase">Kỹ năng đánh giá</label>
                        <select 
                          value={activitySkill}
                          onChange={(e) => setActivitySkill(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-slate-250 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
                        >
                          <option value="READING">📚 READING</option>
                          <option value="LISTENING">🎧 LISTENING</option>
                          <option value="SPEAKING">🗣️ SPEAKING</option>
                          <option value="WRITING">✍️ WRITING</option>
                        </select>
                      </div>

                      {activitySkill === 'LISTENING' && (
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-bold text-slate-500 uppercase">Tệp âm thanh đính kèm (Audio)</label>
                          <input 
                            id="activityAudioInput"
                            type="file" 
                            accept=".mp3,.wav,.m4a"
                            onChange={(e) => setActivityAudioFile(e.target.files[0])}
                            className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase">Hướng dẫn làm bài</label>
                      <textarea 
                        value={activityInstruction}
                        onChange={(e) => setActivityInstruction(e.target.value)}
                        placeholder="VD: Học viên hãy nghe kỹ đoạn hội thoại và điền vào ô trống hoặc chọn đáp án chính xác..."
                        rows="2"
                        className="w-full px-3 py-2 text-xs border border-slate-250 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
                      ></textarea>
                    </div>

                    {/* QUESTIONS BUILDER AREA */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 mt-2 flex flex-col gap-4">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <span className="text-xs font-extrabold text-slate-800">📝 Danh sách câu hỏi ({activityQuestions.length})</span>
                        <button 
                          type="button" 
                          onClick={handleAddQuestion}
                          className="px-3 py-1.5 bg-orange-50 text-orange-600 hover:bg-orange-100 font-extrabold rounded-lg text-xs cursor-pointer border border-orange-200"
                        >
                          ➕ Thêm Câu Hỏi
                        </button>
                      </div>

                      {activityQuestions.map((q, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-3 relative animate-slide-up">
                          <button 
                            type="button"
                            onClick={() => handleRemoveQuestion(idx)}
                            className="absolute top-2 right-2 text-red-500 text-xs font-bold hover:text-red-700 bg-none border-none cursor-pointer"
                          >
                            Xóa câu
                          </button>
                          
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-black text-center leading-5">
                              {idx + 1}
                            </span>
                            <span className="text-xs font-extrabold text-slate-700">Câu hỏi số {idx + 1}</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="flex flex-col gap-1 md:col-span-2">
                              <label className="text-[9px] font-bold text-slate-400 uppercase">Nội dung câu hỏi prompt</label>
                              <input 
                                type="text"
                                required
                                value={q.questionText}
                                onChange={(e) => handleQuestionChange(idx, 'questionText', e.target.value)}
                                placeholder="VD: Mệnh đề nào sau đây đúng?"
                                className="w-full px-2.5 py-1.5 text-xs border border-slate-250 rounded-lg bg-white"
                              />
                            </div>
                            
                            <div className="flex flex-col gap-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase">Loại câu hỏi</label>
                              <select 
                                value={q.questionType}
                                onChange={(e) => handleQuestionChange(idx, 'questionType', e.target.value)}
                                className="w-full px-2.5 py-1.5 text-xs border border-slate-250 rounded-lg bg-white"
                              >
                                <option value="MULTIPLE_CHOICE">Trắc nghiệm (MULTIPLE CHOICE)</option>
                                <option value="FILL_IN_THE_BLANK">Điền từ vào chỗ trống</option>
                                <option value="TEXT_RESPONSE">Tự luận viết (TEXT)</option>
                                <option value="AUDIO_RESPONSE">Ghi âm nói (AUDIO)</option>
                              </select>
                            </div>
                          </div>

                          {q.questionType === 'MULTIPLE_CHOICE' && (
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[9px] font-bold text-slate-400 uppercase">Đáp án trắc nghiệm lựa chọn (Ngăn cách bởi kí tự |)</label>
                              <input 
                                type="text"
                                required
                                value={q.options}
                                onChange={(e) => handleQuestionChange(idx, 'options', e.target.value)}
                                placeholder="A. Agree | B. Disagree | C. Not Given"
                                className="w-full px-2.5 py-1.5 text-xs border border-slate-250 rounded-lg bg-white"
                              />
                            </div>
                          )}

                          {q.questionType !== 'AUDIO_RESPONSE' && q.questionType !== 'TEXT_RESPONSE' && (
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[9px] font-bold text-slate-400 uppercase">Đáp án đúng chính xác (Để tự động so khớp tính điểm)</label>
                              <input 
                                type="text"
                                required
                                value={q.correctAnswer}
                                onChange={(e) => handleQuestionChange(idx, 'correctAnswer', e.target.value)}
                                placeholder="VD: Agree (hoặc A)"
                                className="w-full px-2.5 py-1.5 text-xs border border-slate-250 rounded-lg bg-white"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <button 
                      type="submit"
                      disabled={uploadingActivity}
                      className="w-full mt-2 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl text-xs shadow disabled:opacity-55 cursor-pointer border-none"
                    >
                      {uploadingActivity ? "⏳ Đang đăng hoạt động lên..." : "📝 Đăng hoạt động / bài làm mới"}
                    </button>
                  </form>

                  {/* Activities List */}
                  <div className="flex flex-col gap-4">
                    <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">📋 Hoạt động hiện có ({activities.length})</h4>
                    
                    {loadingActivities ? (
                      <div className="py-10 text-center text-xs text-slate-400">Đang tải danh sách bài tập...</div>
                    ) : activities.length === 0 ? (
                      <div className="py-10 text-center text-xs text-slate-400 italic">Môn học này chưa có hoạt động nào.</div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        {activities.map(act => (
                          <div key={act.id} className="p-4 bg-white rounded-2xl border border-slate-150 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`text-[9px] px-2 py-0.5 rounded font-black border uppercase ${
                                  act.type === 'TEST' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                                }`}>
                                  {act.type}
                                </span>
                                <span className="text-[9px] px-2 py-0.5 rounded font-black border uppercase bg-slate-50 border-slate-200">
                                  {act.skill}
                                </span>
                                <h5 className="font-extrabold text-slate-800 text-xs truncate">{act.title}</h5>
                              </div>
                              <p className="text-[10px] text-slate-400 font-bold mt-2">
                                📚 {act.questions?.length || 0} Câu hỏi | Hướng dẫn: {act.instruction || "Không có"}
                              </p>
                              {act.audioUrl && (
                                <audio controls src={act.audioUrl} className="h-7 mt-2 scale-90 -ml-4" />
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {act.type === 'TEST' && (
                                <button 
                                  onClick={() => handleReleaseResults(act.id)}
                                  disabled={act.isResultsReleased}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer border ${
                                    act.isResultsReleased 
                                      ? 'bg-green-50 text-green-600 border-green-200 cursor-not-allowed'
                                      : 'bg-orange-500 hover:bg-orange-600 text-white border-orange-500'
                                  }`}
                                >
                                  {act.isResultsReleased ? "✓ Đã Công Bố Điểm" : "📢 Công Bố Điểm"}
                                </button>
                              )}
                              <button 
                                onClick={() => handleDeleteActivity(act.id)}
                                className="p-2 text-red-500 hover:text-white hover:bg-red-500 rounded-lg cursor-pointer transition-all border-none bg-none"
                              >
                                🗑️ Xóa
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: CHAM DIEM & PHAN HOI */}
              {activeTab === 'grading' && (
                <div className="animate-fade-in flex flex-col gap-6">
                  {/* Select Activity */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-700">🎯 Chọn Bài Tập / Bài Kiểm Tra để chấm điểm:</label>
                    <select 
                      value={selectedActivityId}
                      onChange={(e) => handleSelectActivity(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-250 rounded-xl bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    >
                      <option value="">-- Click chọn bài luyện tập / kiểm tra --</option>
                      {activities.map(act => (
                        <option key={act.id} value={act.id}>
                          [{act.type}] {act.title} ({act.skill}) - Qs: {act.questions?.length || 0}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedActivityId ? (
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                      
                      {/* Left: Submissions List */}
                      <div className="md:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col gap-3 min-h-[300px]">
                        <h5 className="text-xs font-bold text-slate-800 border-b border-slate-200 pb-2">📥 Danh sách bài nộp ({submissions.length})</h5>
                        
                        {loadingSubmissions ? (
                          <div className="py-10 text-center text-xs text-slate-400">Đang tải bài nộp...</div>
                        ) : submissions.length === 0 ? (
                          <div className="py-10 text-center text-xs text-slate-400 italic">Chưa có học viên nào nộp bài.</div>
                        ) : (
                          <div className="flex flex-col gap-2 overflow-y-auto max-h-[400px]">
                            {submissions.map(sub => {
                              // Find student info from students list matching sub.studentId
                              const studentInfo = students.find(s => s.studentId === sub.studentId);
                              const studentName = studentInfo ? studentInfo.studentName : `Học viên ID ${sub.studentId}`;
                              
                              return (
                                <button
                                  key={sub.id}
                                  type="button"
                                  onClick={() => handleSelectSubmission(sub)}
                                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex justify-between items-center gap-2 ${
                                    selectedSubmission?.id === sub.id
                                      ? 'bg-orange-500 text-white border-orange-500 shadow'
                                      : 'bg-white hover:border-slate-350 text-slate-700 border-slate-200'
                                  }`}
                                >
                                  <div>
                                    <p className="font-extrabold text-xs truncate max-w-[120px]">{studentName}</p>
                                    <p className={`text-[9px] mt-1 font-bold ${
                                      selectedSubmission?.id === sub.id ? 'text-orange-200' : 'text-slate-400'
                                    }`}>
                                      Nộp: {new Date(sub.createdAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div>
                                    {sub.isGraded ? (
                                      <span className="px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-200 font-extrabold text-[9px]">
                                        {sub.score !== null ? `${sub.score}/10` : "Đã chấm"}
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-200 font-extrabold text-[9px] animate-pulse">
                                        Chờ chấm
                                      </span>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Right: Grading Workspace */}
                      <div className="md:col-span-3">
                        {selectedSubmission ? (
                          <div className="p-4 border border-slate-200 rounded-xl flex flex-col gap-4 animate-fade-in">
                            <div className="border-b border-slate-100 pb-3">
                              <h5 className="font-extrabold text-slate-800 text-sm">
                                Chấm bài học viên: {students.find(s => s.studentId === selectedSubmission.studentId)?.studentName || `ID ${selectedSubmission.studentId}`}
                              </h5>
                              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                                Trạng thái bài nộp: {selectedSubmission.isGraded ? "🟢 Đã duyệt & lưu điểm" : "🔴 Đang đợi giáo viên chấm"}
                              </p>
                            </div>

                            {/* Show List Answers */}
                            <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto pr-1">
                              <h6 className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Chi tiết câu trả lời:</h6>
                              {selectedSubmission.answers?.map((ans, idx) => (
                                <div key={ans.id} className="p-3 bg-slate-50 border border-slate-150 rounded-xl text-xs">
                                  <p className="font-extrabold text-slate-800">Câu {idx + 1}: {ans.questionText}</p>
                                  
                                  {ans.options && (
                                    <p className="text-[10px] text-slate-400 mt-1 font-medium">Lựa chọn: {ans.options}</p>
                                  )}

                                  <div className="mt-2.5 p-2 rounded-lg bg-white border border-slate-100 flex flex-col gap-1.5">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Bài làm học viên:</span>
                                    
                                    {ans.questionType === 'AUDIO_RESPONSE' ? (
                                      <div className="flex flex-col gap-1">
                                        {ans.studentAnswer ? (
                                          <audio controls src={ans.studentAnswer} className="w-full h-8" />
                                        ) : (
                                          <span className="text-red-500 font-bold text-[11px] italic">⚠️ Không nộp ghi âm</span>
                                        )}
                                      </div>
                                    ) : ans.questionType === 'TEXT_RESPONSE' ? (
                                      <p className="text-slate-800 font-medium whitespace-pre-wrap pl-1 border-l-2 border-orange-500 bg-orange-50/10 p-1.5 rounded text-[11px]">
                                        {ans.studentAnswer || "Học viên bỏ trống"}
                                      </p>
                                    ) : (
                                      <div className="flex items-center justify-between text-[11px]">
                                        <span className="font-bold text-slate-800">Trả lời: <strong className="text-orange-500">{ans.studentAnswer || "(bỏ trống)"}</strong></span>
                                        {ans.correctAnswer && (
                                          <span className="font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">Đáp án đúng: <strong className="text-green-600">{ans.correctAnswer}</strong></span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Form Input Score & Feedback */}
                            <form onSubmit={handleSaveSubmissionGrade} className="border-t border-slate-100 pt-4 flex flex-col gap-3">
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                                <label className="text-xs font-bold text-slate-700">Điểm số bài làm (Thang 10):</label>
                                <input 
                                  type="number"
                                  min="0"
                                  max="10"
                                  step="0.1"
                                  required
                                  value={gradingScore}
                                  onChange={(e) => setGradingScore(e.target.value)}
                                  placeholder="VD: 8.5"
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-250 text-xs font-bold text-slate-800 bg-slate-50/50 text-center sm:col-span-2"
                                />
                              </div>

                              <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-700">Phản hồi / Nhận xét của Giáo viên:</label>
                                <textarea 
                                  value={gradingFeedback}
                                  onChange={(e) => setGradingFeedback(e.target.value)}
                                  placeholder="Nhập nhận xét chi tiết, chỉnh sửa phát âm/ngữ pháp..."
                                  rows="3"
                                  className="w-full px-3 py-2 text-xs border border-slate-250 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
                                ></textarea>
                              </div>

                              <button
                                type="submit"
                                disabled={savingGrade}
                                className="w-full mt-1.5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl text-xs active:scale-[0.98] transition-all cursor-pointer shadow border-none disabled:opacity-55"
                              >
                                {savingGrade ? "⏳ Đang lưu kết quả..." : "🎯 Lưu Điểm & Nhận Xét Phản Hồi"}
                              </button>
                            </form>
                          </div>
                        ) : (
                          <div className="p-12 border border-dashed border-slate-250 text-center rounded-xl text-slate-400 text-xs font-semibold">
                            👈 Vui lòng bấm chọn một bài nộp ở danh sách bên trái để mở giao diện chấm điểm chi tiết.
                          </div>
                        )}
                      </div>

                    </div>
                  ) : (
                    <div className="py-16 text-center text-slate-400 font-semibold text-xs italic border border-dashed border-slate-200 rounded-2xl">
                      Vui lòng chọn bài tập ở dropdown phía trên để hiển thị công cụ chấm bài.
                    </div>
                  )}
                </div>
              )}

            </div>
          ) : (
            // TRẠNG THÁI CHƯA CHỌN LỚP
            <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center shadow-sm">
              <p className="text-5xl">🏫</p>
              <h3 className="text-base font-bold text-slate-700 mt-4">Vui lòng chọn lớp học phụ trách</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed font-semibold">
                Bảng quản lý LMS, tài liệu giảng dạy, bài kiểm tra và bài làm nói/viết của học viên sẽ xuất hiện chi tiết tại đây sau khi chọn lớp.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

export default TeacherPortal;
