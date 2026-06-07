import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RichTextEditor from './RichTextEditor';
import { 
  Users, 
  BookOpen, 
  FileText, 
  Award, 
  PlusCircle, 
  Trophy, 
  Calendar, 
  Clock, 
  GraduationCap, 
  CheckCircle, 
  ClipboardCheck, 
  Search, 
  Bell, 
  HelpCircle,
  FolderOpen,
  ArrowLeft,
  ChevronRight,
  Play,
  Volume2
} from 'lucide-react';

function TeacherPortal({ user, initialTab, onTabChange }) {
  // Navigation Tabs Sync
  const [activeTab, setActiveTab] = useState(initialTab || 'classes');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleTabSelect = (tab) => {
    setActiveTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  // Main Classroom states
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [gradesForm, setGradesForm] = useState({}); // temporary grades buffer

  // Sub-classroom Inner Navigation State (only inside a classroom detail)
  const [activeClassroomTab, setActiveClassroomTab] = useState('materials');

  // Materials States (LMS)
  const [materials, setMaterials] = useState([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialDescription, setMaterialDescription] = useState('');
  const [materialType, setMaterialType] = useState('FILE'); // FILE or LINK
  const [materialLink, setMaterialLink] = useState('');
  const [materialFile, setMaterialFile] = useState(null);
  const [uploadingMaterial, setUploadingMaterial] = useState(false);

  // Assignments / Activities States (LMS)
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [activityTitle, setActivityTitle] = useState('');
  
  // Unified tags category: Nghe, Đọc, Nói, Viết, Trắc nghiệm
  const [activityCategory, setActivityCategory] = useState('READING_ASSIGNMENT');
  const [activityType, setActivityType] = useState('ASSIGNMENT'); // ASSIGNMENT or TEST
  const [activitySkill, setActivitySkill] = useState('READING'); // LISTENING, SPEAKING, READING, WRITING
  
  const [activityInstruction, setActivityInstruction] = useState('');
  const [activityAudioFile, setActivityAudioFile] = useState(null);
  const [activityQuestions, setActivityQuestions] = useState([]);
  const [activityDeadline, setActivityDeadline] = useState('');
  const [uploadingActivity, setUploadingActivity] = useState(false);

  // Split-screen Grading States
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  
  // Form input grades
  const [gradingScore, setGradingScore] = useState('');
  const [gradingFeedback, setGradingFeedback] = useState('');
  const [savingGrade, setSavingGrade] = useState(false);
  
  // Sub-metrics criteria grading
  const [pronunciationScore, setPronunciationScore] = useState('');
  const [grammarScore, setGrammarScore] = useState('');
  const [fluencyScore, setFluencyScore] = useState('');
  
  // Search & filter submissions
  const [subSearch, setSubSearch] = useState('');
  const [subFilter, setSubFilter] = useState('all'); // all, ungraded, graded

  // Load classrooms on mount
  useEffect(() => {
    fetchTeacherClasses();
  }, [user]);

  const fetchTeacherClasses = async () => {
    try {
      setLoadingClasses(true);
      const response = await axios.get(`http://localhost:8080/api/classrooms/teacher/${user.id}`);
      setClassrooms(response.data);
      
      // Auto-set first class if available for assignment/grading tabs dropdowns
      if (response.data.length > 0 && !selectedClass) {
        setSelectedClass(response.data[0]);
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách lớp học của giáo viên:", err);
    } finally {
      setLoadingClasses(false);
    }
  };

  // Select class and retrieve classroom students / materials / activities
  const handleSelectClass = async (classroom, targetTab = 'materials') => {
    setSelectedClass(classroom);
    setLoadingStudents(true);
    setActiveClassroomTab(targetTab);
    setSelectedActivityId("");
    setSelectedSubmission(null);
    setSubmissions([]);

    try {
      const response = await axios.get(`http://localhost:8080/api/classrooms/${classroom.id}/students`);
      setStudents(response.data);
      
      // Initialize grades buffer
      const initialGrades = {};
      response.data.forEach(student => {
        initialGrades[student.studentId] = student.grade !== null ? student.grade.toString() : '';
      });
      setGradesForm(initialGrades);

      if (classroom.courseId) {
        fetchMaterials(classroom.courseId);
        fetchActivities(classroom.courseId);
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách học viên trong lớp:", err);
      alert("Không thể lấy danh sách học viên.");
    } finally {
      setLoadingStudents(false);
    }
  };

  // Change active selected class from dropdown selectors
  const handleClassDropdownChange = (classId) => {
    const cls = classrooms.find(c => c.id === parseInt(classId));
    if (cls) {
      handleSelectClass(cls, activeClassroomTab);
    } else {
      setSelectedClass(null);
      setStudents([]);
      setMaterials([]);
      setActivities([]);
    }
  };

  // ----------------------------------------------------
  // TÀI LIỆU GIẢNG DẠY (LMS)
  // ----------------------------------------------------
  const fetchMaterials = async (courseId) => {
    if (!courseId) return;
    try {
      setLoadingMaterials(true);
      const res = await axios.get(`http://localhost:8080/api/lms/courses/${courseId}/materials`);
      setMaterials(res.data);
    } catch (err) {
      console.error("Lỗi lấy danh sách tài liệu:", err);
    } finally {
      setLoadingMaterials(false);
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tài liệu giảng dạy này không?")) return;
    try {
      await axios.delete(`http://localhost:8080/api/lms/materials/${materialId}`);
      alert("🎉 Xóa tài liệu thành công!");
      fetchMaterials(selectedClass.courseId);
    } catch (err) {
      console.error("Lỗi xóa tài liệu:", err);
      alert("Không thể xóa tài liệu.");
    }
  };

  const handleCreateMaterial = async (e) => {
    e.preventDefault();
    if (!materialTitle.trim()) {
      alert("Vui lòng nhập tiêu đề tài liệu!");
      return;
    }

    try {
      setUploadingMaterial(true);
      let finalFileUrl = "";

      if (materialType === "FILE") {
        if (!materialFile) {
          alert("Vui lòng chọn một tệp tin tài liệu!");
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
          alert("Vui lòng nhập đường dẫn liên kết tài liệu!");
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
      alert("🎉 Tải lên tài liệu giảng dạy thành công!");
      
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
      console.error("Lỗi tạo tài liệu:", err);
      alert(`❌ Lỗi tải lên tài liệu: ${err.message}`);
    } finally {
      setUploadingMaterial(false);
    }
  };

  // ----------------------------------------------------
  // TẠO BÀI TẬP & HOẠT ĐỘNG (LMS)
  // ----------------------------------------------------
  const fetchActivities = async (courseId) => {
    if (!courseId) return;
    try {
      setLoadingActivities(true);
      const res = await axios.get(`http://localhost:8080/api/lms/courses/${courseId}/activities`);
      setActivities(res.data);
    } catch (err) {
      console.error("Lỗi lấy danh sách hoạt động:", err);
    } finally {
      setLoadingActivities(false);
    }
  };

  const handleDeleteActivity = async (activityId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài tập/kiểm tra này không?")) return;
    try {
      await axios.delete(`http://localhost:8080/api/lms/activities/${activityId}`);
      alert("🎉 Xóa hoạt động lms thành công!");
      fetchActivities(selectedClass.courseId);
      if (selectedActivityId === activityId.toString()) {
        setSelectedActivityId("");
        setSubmissions([]);
        setSelectedSubmission(null);
      }
    } catch (err) {
      console.error("Lỗi khi xóa hoạt động:", err);
      alert("Không thể xóa hoạt động.");
    }
  };

  const handleReleaseResults = async (activityId) => {
    try {
      await axios.put(`http://localhost:8080/api/lms/activities/${activityId}/release`);
      alert("🎉 Công bố kết quả thi thử thành công! Học viên có thể tra cứu điểm số.");
      fetchActivities(selectedClass.courseId);
    } catch (err) {
      console.error("Lỗi khi công bố điểm thi:", err);
      alert("Lỗi khi công bố kết quả.");
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
    if (!selectedClass) {
      alert("Vui lòng lựa chọn lớp học cần tạo bài tập!");
      return;
    }
    if (!activityTitle.trim()) {
      alert("Vui lòng nhập tiêu đề hoạt động bài tập!");
      return;
    }
    if (activityQuestions.length === 0) {
      alert("Vui lòng tạo tối thiểu 1 câu hỏi tương tác!");
      return;
    }

    // Validate questions data
    for (let i = 0; i < activityQuestions.length; i++) {
      const q = activityQuestions[i];
      if (!q.questionText.trim()) {
        alert(`Vui lòng nhập câu hỏi prompt cho câu số ${i + 1}`);
        return;
      }
      if (q.questionType === "MULTIPLE_CHOICE" && !q.options.trim()) {
        alert(`Vui lòng điền các lựa chọn trắc nghiệm ngăn cách bởi dấu | cho câu số ${i + 1}`);
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

      // Format questions index
      const formattedQuestions = activityQuestions.map((q, idx) => ({
        questionNumber: idx + 1,
        questionText: q.questionText,
        questionType: q.questionType,
        options: q.questionType === "MULTIPLE_CHOICE" ? q.options : null,
        correctAnswer: q.correctAnswer
      }));

      // Append deadline string internally to guidelines instruction to preserve column limitations
      const formattedInstruction = activityDeadline 
        ? `${activityInstruction}\n\n[Hạn nộp: ${activityDeadline}]` 
        : activityInstruction;

      const payload = {
        title: activityTitle,
        type: activityType,
        skill: activitySkill,
        instruction: formattedInstruction,
        audioUrl: finalAudioUrl,
        questions: formattedQuestions
      };

      await axios.post(`http://localhost:8080/api/lms/courses/${selectedClass.courseId}/activities`, payload);
      alert("🎉 Tạo và phân phối bài tập / bài thi thử thành công!");

      // Reset Form
      setActivityTitle("");
      setActivityCategory("READING_ASSIGNMENT");
      setActivityType("ASSIGNMENT");
      setActivitySkill("READING");
      setActivityInstruction("");
      setActivityAudioFile(null);
      setActivityQuestions([]);
      setActivityDeadline("");
      const audioInput = document.getElementById("activityAudioInput");
      if (audioInput) audioInput.value = "";

      fetchActivities(selectedClass.courseId);
    } catch (err) {
      console.error("Lỗi tạo bài tập LMS:", err);
      alert(`❌ Không thể đăng bài tập: ${err.message}`);
    } finally {
      setUploadingActivity(false);
    }
  };

  // ----------------------------------------------------
  // CHẤM ĐIỂM & ĐÁNH GIÁ (LMS)
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
      console.error("Lỗi lấy danh sách bài nộp:", err);
      alert("Lỗi khi tải danh sách bài nộp của học viên.");
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleSelectSubmission = (submission) => {
    setSelectedSubmission(submission);
    setGradingScore(submission.score !== null ? submission.score.toString() : "");
    setGradingFeedback(submission.teacherFeedback || "");
    
    // Set criteria based on previous score or default
    if (submission.score !== null) {
      const val = submission.score;
      setPronunciationScore(val.toString());
      setGrammarScore(val.toString());
      setFluencyScore(val.toString());
    } else {
      setPronunciationScore("");
      setGrammarScore("");
      setFluencyScore("");
    }
  };

  const updateCriteriaScore = (type, val) => {
    let p = type === 'pron' ? val : pronunciationScore;
    let g = type === 'gram' ? val : grammarScore;
    let f = type === 'flue' ? val : fluencyScore;
    
    if (type === 'pron') setPronunciationScore(val);
    if (type === 'gram') setGrammarScore(val);
    if (type === 'flue') setFluencyScore(val);
    
    const pNum = parseFloat(p) || 0;
    const gNum = parseFloat(g) || 0;
    const fNum = parseFloat(f) || 0;
    
    const count = (p ? 1 : 0) + (g ? 1 : 0) + (f ? 1 : 0);
    if (count > 0) {
      const avg = ((pNum + gNum + fNum) / count).toFixed(1);
      setGradingScore(avg);
    } else {
      setGradingScore("");
    }
  };

  const handleSaveSubmissionGrade = async (e) => {
    e.preventDefault();
    if (gradingScore === "") {
      alert("Vui lòng nhập điểm số!");
      return;
    }
    const scoreNum = parseFloat(gradingScore);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 10) {
      alert("Điểm số bắt buộc từ thang điểm 0.00 đến 10.00!");
      return;
    }

    try {
      setSavingGrade(true);
      const payload = {
        score: scoreNum,
        teacherFeedback: gradingFeedback
      };
      const res = await axios.put(`http://localhost:8080/api/lms/submissions/${selectedSubmission.id}/grade`, payload);
      alert("🎉 Đã lưu kết quả chấm điểm và gửi phản hồi thành công!");
      
      setSubmissions(prev => prev.map(sub => sub.id === selectedSubmission.id ? res.data : sub));
      setSelectedSubmission(res.data);
    } catch (err) {
      console.error("Lỗi khi chấm điểm:", err);
      alert(`❌ Lỗi lưu chấm điểm: ${err.message}`);
    } finally {
      setSavingGrade(false);
    }
  };

  // ----------------------------------------------------
  // DIỂM THI THỬ LỚP HỌC HÀNG TUẦN
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
      alert("Điểm thi thử phải thuộc thang điểm từ 0.00 đến 10.00!");
      return;
    }

    try {
      await axios.put(`http://localhost:8080/api/classrooms/${selectedClass.id}/students/${studentId}/grade`, null, {
        params: { grade: parsedGrade }
      });
      setStudents(prev => prev.map(s => s.studentId === studentId ? { ...s, grade: parsedGrade } : s));
      alert("🎉 Cập nhật sổ điểm thi thử học viên thành công!");
    } catch (err) {
      console.error("Lỗi cập nhật điểm:", err);
      alert("Lỗi khi cập nhật điểm học viên.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 animate-fade-in text-left">
      
      {/* STYLE KEYFRAMES DÂN DỤNG CHO MICRO & SÓNG SOUNDWAVE */}
      <style>{`
        @keyframes soundActive {
          0%, 100% { height: 4px; }
          50% { height: 32px; }
        }
        .grading-sound-wave {
          display: flex;
          align-items: center;
          gap: 2.5px;
          height: 38px;
        }
        .grading-sound-wave span {
          display: block;
          width: 3px;
          height: 4px;
          background-color: #059669;
          border-radius: 2px;
          animation: soundActive 1.2s ease-in-out infinite;
        }
        .grading-sound-wave span:nth-child(1) { animation-delay: 0.1s; }
        .grading-sound-wave span:nth-child(2) { animation-delay: 0.3s; }
        .grading-sound-wave span:nth-child(3) { animation-delay: 0.6s; }
        .grading-sound-wave span:nth-child(4) { animation-delay: 0.4s; }
        .grading-sound-wave span:nth-child(5) { animation-delay: 0.2s; }
        .grading-sound-wave span:nth-child(6) { animation-delay: 0.5s; }
        .grading-sound-wave span:nth-child(7) { animation-delay: 0.15s; }
        .grading-sound-wave span:nth-child(8) { animation-delay: 0.45s; }
        .grading-sound-wave span:nth-child(9) { animation-delay: 0.25s; }
        .grading-sound-wave span:nth-child(10) { animation-delay: 0.35s; }
      `}</style>

      {/* 🟢 HEADER TOP CONTROL BAR */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 mb-6 transition-all hover:shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black text-xl shadow-inner border border-emerald-500/20">
            {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'G'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-slate-800 text-base">GV. {user.fullName || 'Giảng viên'}</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-150 text-emerald-800 border border-emerald-250 text-[9px] font-black uppercase">
                Giảng viên
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">EduEnglish Center • Teacher Hub</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-slate-500">
          <button className="relative p-2 bg-slate-50 border border-slate-200 rounded-xl hover:text-slate-800 cursor-pointer">
            <Bell size={15} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
          </button>
          <button className="p-2 bg-slate-50 border border-slate-200 rounded-xl hover:text-slate-800 cursor-pointer">
            <HelpCircle size={15} />
          </button>
        </div>
      </div>

      {/* 🔴 HORIZONTAL PILLS TAB SWITCHER (TEACHER SIDEBAR DELEGATES) */}
      <div className="flex bg-slate-100/70 p-1.5 rounded-2xl gap-1 mb-6 max-w-lg">
        <button
          onClick={() => handleTabSelect('classes')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer border-none flex items-center justify-center gap-1.5 ${
            activeTab === 'classes'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 bg-transparent'
          }`}
        >
          <Users size={14} /> Quản lý lớp học
        </button>
        <button
          onClick={() => handleTabSelect('assignments')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer border-none flex items-center justify-center gap-1.5 ${
            activeTab === 'assignments'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 bg-transparent'
          }`}
        >
          <FileText size={14} /> Tạo bài tập
        </button>
        <button
          onClick={() => handleTabSelect('grading')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer border-none flex items-center justify-center gap-1.5 ${
            activeTab === 'grading'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 bg-transparent'
          }`}
        >
          <Award size={14} /> Không gian chấm điểm
        </button>
      </div>

      {/* ──────────────────────────────────────────────────────── */}
      {/* TAB 1: QUẢN LÝ LỚP HỌC (CLASSES DIRECTORY) */}
      {/* ──────────────────────────────────────────────────────── */}
      {activeTab === 'classes' && (
        <div className="animate-fade-in flex flex-col gap-6">
          
          {/* 1. NO SELECTED CLASSROOM (GRID SHOWCASE) */}
          {!selectedClass ? (
            <div className="flex flex-col gap-6">
              {/* Teacher Summary Banner */}
              <div className="bg-gradient-to-br from-emerald-800 via-emerald-950 to-slate-950 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
                <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl"></div>
                <div className="relative z-10">
                  <span className="px-3 py-1 bg-emerald-500/25 text-emerald-300 text-[10px] font-extrabold rounded-full uppercase border border-emerald-500/10 tracking-widest">
                    🏫 Lớp học phụ trách
                  </span>
                  <h2 className="text-2xl font-black mt-3">Quản lý lớp học & Giảng dạy</h2>
                  <p className="text-emerald-100/70 text-sm mt-1.5 font-medium max-w-md leading-relaxed">
                    Kiểm tra danh sách lớp phân công, sỹ số học viên, theo dõi tiến độ hoàn thành giáo trình và chỉnh sửa sổ điểm thi thử.
                  </p>
                </div>
                <div className="flex gap-3 relative z-10 text-center shrink-0">
                  <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 backdrop-blur-md">
                    <p className="text-xl font-black text-emerald-350">{classrooms.length}</p>
                    <p className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">Lớp giảng dạy</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 backdrop-blur-md">
                    <p className="text-xl font-black text-emerald-350">75</p>
                    <p className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">Tổng học viên</p>
                  </div>
                </div>
              </div>

              {/* Grid of classes */}
              <div className="flex flex-col gap-3">
                <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  LỚP HỌC ĐANG HOẠT ĐỘNG
                </h4>

                {loadingClasses ? (
                  <div className="py-12 bg-white rounded-3xl border border-slate-150 text-center flex flex-col items-center justify-center gap-2">
                    <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs text-slate-400 font-bold">Đang tải danh sách lớp học...</span>
                  </div>
                ) : classrooms.length === 0 ? (
                  <div className="py-12 bg-white rounded-3xl border border-slate-150 text-center text-slate-400 italic text-xs font-semibold">
                    Hiện chưa có lớp học nào được phân công giảng dạy trong hệ thống.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {classrooms.map((cls, i) => {
                      const mockStudentsCount = 12 + (i * 3) % 8;
                      const mockProgress = 35 + (i * 15) % 55;
                      return (
                        <div 
                          key={cls.id} 
                          className="bg-white rounded-3xl border border-slate-150 p-5 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between group"
                        >
                          <div>
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-extrabold text-sm text-slate-800 group-hover:text-emerald-700 transition-colors">{cls.className}</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{cls.courseTitle || "Lớp Học LMS"}</p>
                              </div>
                              <span className="text-[9px] font-black text-slate-655 bg-slate-50 border border-slate-150 px-2 py-0.5 rounded-lg">
                                👥 {mockStudentsCount} Học viên
                              </span>
                            </div>

                            <p className="text-[10px] text-slate-500 font-semibold mt-3.5 flex items-center gap-1.5">
                              <Calendar size={12} className="text-slate-400" /> {cls.schedule || "Lịch học tự do"}
                            </p>

                            {/* progress */}
                            <div className="mt-4">
                              <div className="flex justify-between text-[9px] font-bold text-slate-400 mb-1">
                                <span>Tiến độ giáo trình lớp</span>
                                <span className="text-slate-600 font-black">{mockProgress}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-100">
                                <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${mockProgress}%` }}></div>
                              </div>
                            </div>
                          </div>

                          <div className="border-t border-slate-100 mt-4 pt-3 flex gap-2">
                            <button
                              onClick={() => handleSelectClass(cls, 'materials')}
                              className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-black rounded-xl text-[10px] transition-all border border-emerald-100 text-center cursor-pointer"
                            >
                              📖 LMS Workspace
                            </button>
                            <button
                              onClick={() => alert(`Đang điểm danh cho lớp ${cls.className}...`)}
                              className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-xl text-[10px] transition-all border border-slate-200 cursor-pointer"
                            >
                              📅 Điểm danh
                            </button>
                            <button
                              onClick={() => handleSelectClass(cls, 'class_grades')}
                              className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-xl text-[10px] transition-all border border-slate-200 cursor-pointer"
                            >
                              📊 Sổ điểm
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            // 2. ACTIVE CLASSROOM SELECTED (LMS INNER SUB-WORKSPACE VIEW)
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col min-h-[500px]">
              
              {/* Classroom Selected Breadcrumbs */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 pb-4 border-b border-slate-100 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <button 
                      onClick={() => setSelectedClass(null)}
                      className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg text-[9px] font-black cursor-pointer transition-all flex items-center gap-1"
                    >
                      <ArrowLeft size={10} /> Quay lại danh sách lớp
                    </button>
                    <span className="text-slate-350 text-[10px]">/</span>
                    <span className="text-[10px] text-emerald-600 font-black uppercase tracking-wider">LMS Workspace</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-800">
                    👥 Lớp: {selectedClass.className}
                  </h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5 text-left">
                    Môn học: {selectedClass.courseTitle || "Lớp Học LMS"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs font-bold">
                    Khóa ID: {selectedClass.courseId || "Chưa gán"}
                  </span>
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">
                    Học viên: {students.length}
                  </span>
                </div>
              </div>

              {/* Classroom inner sub-tabs selectors */}
              <div className="flex border-b border-slate-100 mb-6 gap-2 overflow-x-auto pb-1">
                <button
                  onClick={() => setActiveClassroomTab('materials')}
                  className={`px-4 py-2 text-xs font-black rounded-xl cursor-pointer transition-all border ${
                    activeClassroomTab === 'materials'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  📚 Tài Liệu Giảng Dạy (LMS)
                </button>
                <button
                  onClick={() => setActiveClassroomTab('class_grades')}
                  className={`px-4 py-2 text-xs font-black rounded-xl cursor-pointer transition-all border ${
                    activeClassroomTab === 'class_grades'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  👥 Sổ Điểm Thi Thử
                </button>
              </div>

              {/* Sub-classroom tab content rendering */}

              {/* SUBTAB 1: TÀI LIỆU GIẢNG DẠY */}
              {activeClassroomTab === 'materials' && (
                <div className="animate-fade-in flex flex-col gap-6">
                  {/* Upload document form */}
                  <form onSubmit={handleCreateMaterial} className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200 flex flex-col gap-4">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">📁 Tải lên tài liệu học tập mới</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black text-slate-450 uppercase">Tiêu đề tài liệu</label>
                        <input 
                          type="text" 
                          required
                          value={materialTitle}
                          onChange={(e) => setMaterialTitle(e.target.value)}
                          placeholder="VD: Giáo trình từ vựng Unit 1"
                          className="w-full px-3 py-2 text-xs border border-slate-250 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white font-bold"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black text-slate-450 uppercase">Mô tả tài liệu</label>
                        <input 
                          type="text" 
                          value={materialDescription}
                          onChange={(e) => setMaterialDescription(e.target.value)}
                          placeholder="VD: Tổng hợp các trạng từ nâng cao..."
                          className="w-full px-3 py-2 text-xs border border-slate-250 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black text-slate-450 uppercase">Phân loại tệp tài liệu</label>
                        <select 
                          value={materialType} 
                          onChange={(e) => setMaterialType(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-slate-250 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white font-bold cursor-pointer"
                        >
                          <option value="FILE">📁 Tệp tải lên (PDF, Word, Ảnh...)</option>
                          <option value="LINK">🔗 Đường link URL / Youtube Video</option>
                        </select>
                      </div>

                      {materialType === 'FILE' ? (
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-black text-slate-450 uppercase">Chọn tệp tin đính kèm</label>
                          <input 
                            id="materialFileInput"
                            type="file" 
                            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip"
                            onChange={(e) => setMaterialFile(e.target.files[0])}
                            className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-black text-slate-450 uppercase">Nhập địa chỉ liên kết URL</label>
                          <input 
                            type="url" 
                            value={materialLink}
                            onChange={(e) => setMaterialLink(e.target.value)}
                            placeholder="https://example.com/tai-lieu"
                            className="w-full px-3 py-2 text-xs border border-slate-250 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white font-bold"
                          />
                        </div>
                      )}
                    </div>

                    <button 
                      type="submit" 
                      disabled={uploadingMaterial}
                      className="w-full mt-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs active:scale-[0.98] transition-all cursor-pointer shadow border-none disabled:opacity-55"
                    >
                      {uploadingMaterial ? "⏳ Đang tải tài liệu lên hệ thống..." : "📁 Đăng tải tài liệu học tập"}
                    </button>
                  </form>

                  {/* Materials list */}
                  <div className="flex flex-col gap-4 text-left">
                    <h4 className="text-xs font-black text-slate-800 border-b border-slate-100 pb-2 uppercase tracking-wider">
                      📚 Danh sách tài liệu hiện tại ({materials.length})
                    </h4>
                    
                    {loadingMaterials ? (
                      <div className="py-12 text-center text-xs text-slate-400 font-bold">Đang tải tài liệu...</div>
                    ) : materials.length === 0 ? (
                      <p className="py-12 text-center text-xs text-slate-400 italic bg-slate-50/50 rounded-2xl border border-dashed">
                        Lớp học chưa đăng tải tài liệu học tập nào.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {materials.map(mat => (
                          <div key={mat.id} className="p-4 rounded-2xl border border-slate-150 bg-white shadow-sm flex items-start justify-between gap-3 hover:border-slate-350 transition-all">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`text-[9px] px-2 py-0.5 rounded font-black border uppercase ${
                                  mat.type === 'FILE' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                }`}>
                                  {mat.type}
                                </span>
                                <h5 className="font-extrabold text-slate-800 text-xs truncate">{mat.title}</h5>
                              </div>
                              <p className="text-[11px] text-slate-550 mt-1.5 font-medium">{mat.description || "Không có mô tả chi tiết."}</p>
                              <a 
                                href={mat.fileUrl} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-[10px] text-emerald-600 hover:text-emerald-700 font-bold block mt-3 underline truncate"
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

              {/* SUBTAB 2: SỔ ĐIỂM THI THỬ */}
              {activeClassroomTab === 'class_grades' && (
                <div className="animate-fade-in flex-1">
                  {loadingStudents ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs text-slate-400 font-bold">Đang lấy danh sách học viên...</span>
                    </div>
                  ) : students.length === 0 ? (
                    <div className="py-16 text-center text-slate-450 font-bold text-xs italic bg-slate-50/50 border border-dashed rounded-2xl">
                      Lớp học này chưa có học viên đăng ký.
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-2xl border border-slate-200">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                            <th className="p-4">Học viên</th>
                            <th className="p-4">Điểm thi thử đầu vào / hiện tại</th>
                            <th className="p-4 text-right">Nhập / Cập nhật điểm thi (0 - 10)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                          {students.map(std => (
                            <tr key={std.studentId} className="hover:bg-slate-50/20 transition-colors">
                              <td className="p-4">
                                <p className="font-extrabold text-slate-800 text-sm">{std.studentName}</p>
                                <p className="text-[10px] text-slate-400 font-bold mt-0.5">{std.studentEmail}</p>
                              </td>
                              <td className="p-4">
                                {std.grade !== null ? (
                                  <span className="px-2.5 py-1 text-xs font-black rounded-lg border bg-emerald-50 text-emerald-700 border-emerald-250">
                                    {std.grade} / 10
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 text-xs font-bold rounded-lg border bg-slate-50 text-slate-450 border-slate-200">
                                    Chưa có kết quả thi
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
                                  className="w-20 px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-center font-black text-slate-800 text-xs bg-slate-50"
                                />
                                <button 
                                  onClick={() => handleSaveGrade(std.studentId)}
                                  className="px-3.5 py-1.5 bg-emerald-650 hover:bg-emerald-700 text-white font-black rounded-lg transition-all text-xs cursor-pointer border-none shadow-sm shadow-emerald-500/10"
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

            </div>
          )}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* TAB 2: TẠO BÀI TẬP VÀ HOẠT ĐỘNG (ASSIGNMENT CREATOR) */}
      {/* ──────────────────────────────────────────────────────── */}
      {activeTab === 'assignments' && (
        <div className="animate-fade-in flex flex-col gap-6">
          <div className="bg-gradient-to-br from-emerald-800 via-emerald-950 to-slate-950 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <span className="px-3 py-1 bg-yellow-500/25 text-yellow-400 text-[10px] font-extrabold rounded-full uppercase border border-yellow-500/20 tracking-widest">
                📝 Phân phối bài tập LMS
              </span>
              <h2 className="text-2xl font-black mt-3">Thiết kế & Tạo bài tập LMS</h2>
              <p className="text-emerald-100/70 text-sm mt-1.5 font-medium max-w-md leading-relaxed">
                Tạo bài luyện tập viết, đọc, ghi âm trực tiếp cho từng lớp. Đặt hạn nộp bài cụ thể cho học viên.
              </p>
            </div>
          </div>

          {/* Form Create Activity */}
          <form onSubmit={handleCreateActivity} className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-5 text-left">
            <h4 className="text-sm font-black text-slate-850 uppercase tracking-wider flex items-center gap-1.5">
              <PlusCircle className="text-emerald-600" size={16} /> Tạo hoạt động bài tập mới
            </h4>

            {/* CLASS SELECTOR DROPDOWN */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase">Chọn lớp học áp dụng</label>
              <select
                value={selectedClass?.id || ""}
                onChange={(e) => handleClassDropdownChange(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-250 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white font-bold cursor-pointer"
              >
                <option value="">-- Click chọn lớp học để giao bài tập --</option>
                {classrooms.map(c => (
                  <option key={c.id} value={c.id}>{c.className} ({c.courseTitle})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Tiêu đề bài tập</label>
                <input 
                  type="text" 
                  required
                  value={activityTitle}
                  onChange={(e) => setActivityTitle(e.target.value)}
                  placeholder="VD: Bài viết luận IELTS Writing Task 1 - Unit 2"
                  className="w-full px-3 py-2 text-xs border border-slate-250 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white font-bold"
                />
              </div>

              {/* Tag Category Selector: Nghe, Đọc, Nói, Viết, Trắc nghiệm */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Phân loại kỹ năng</label>
                <select 
                  value={activityCategory}
                  onChange={(e) => {
                    const val = e.target.value;
                    setActivityCategory(val);
                    if (val === 'READING_ASSIGNMENT') {
                      setActivitySkill('READING');
                      setActivityType('ASSIGNMENT');
                    } else if (val === 'LISTENING_ASSIGNMENT') {
                      setActivitySkill('LISTENING');
                      setActivityType('ASSIGNMENT');
                    } else if (val === 'SPEAKING_ASSIGNMENT') {
                      setActivitySkill('SPEAKING');
                      setActivityType('ASSIGNMENT');
                    } else if (val === 'WRITING_ASSIGNMENT') {
                      setActivitySkill('WRITING');
                      setActivityType('ASSIGNMENT');
                    } else if (val === 'MCQ_TEST') {
                      setActivitySkill('READING');
                      setActivityType('TEST');
                    }
                  }}
                  className="w-full px-3 py-2 text-xs border border-slate-250 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white font-bold cursor-pointer"
                >
                  <option value="READING_ASSIGNMENT">📚 Kỹ năng Đọc (Reading Assignment)</option>
                  <option value="LISTENING_ASSIGNMENT">🎧 Kỹ năng Nghe (Listening Assignment)</option>
                  <option value="SPEAKING_ASSIGNMENT">🗣️ Kỹ năng Nói (Speaking Assignment)</option>
                  <option value="WRITING_ASSIGNMENT">✍️ Kỹ năng Viết (Writing Assignment)</option>
                  <option value="MCQ_TEST">📝 Bài kiểm tra Trắc nghiệm (MCQ Test)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Deadline Date Picker */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Cài đặt hạn nộp bài (Deadline)</label>
                <input 
                  type="date"
                  value={activityDeadline}
                  onChange={(e) => setActivityDeadline(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-250 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white font-bold text-slate-700 cursor-pointer"
                />
              </div>

              {activitySkill === 'LISTENING' && (
                <div className="flex flex-col gap-1.5 animate-slide-up">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Chọn tệp âm thanh nghe bài học (Audio File)</label>
                  <input 
                    id="activityAudioInput"
                    type="file" 
                    accept=".mp3,.wav,.m4a"
                    onChange={(e) => setActivityAudioFile(e.target.files[0])}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase">Hướng dẫn / Yêu cầu làm bài</label>
              <textarea 
                value={activityInstruction}
                onChange={(e) => setActivityInstruction(e.target.value)}
                placeholder="VD: Hãy đọc đoạn văn dưới đây và viết bài luận tối thiểu 150 từ..."
                rows="2"
                className="w-full px-3 py-2 text-xs border border-slate-250 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white font-medium"
              ></textarea>
            </div>

            {/* Questions list builder panel */}
            <div className="bg-slate-50/50 p-4 sm:p-5 rounded-2xl border border-slate-200 mt-2 flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider">📝 Thiết kế danh sách câu hỏi ({activityQuestions.length})</span>
                <button 
                  type="button" 
                  onClick={handleAddQuestion}
                  className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-extrabold rounded-xl text-xs cursor-pointer transition-all"
                >
                  ➕ Thêm Câu Hỏi
                </button>
              </div>

              {activityQuestions.map((q, idx) => (
                <div key={idx} className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-col gap-3 relative animate-slide-up text-left">
                  <button 
                    type="button"
                    onClick={() => handleRemoveQuestion(idx)}
                    className="absolute top-3 right-3 text-red-500 hover:text-red-700 text-xs font-black border-none cursor-pointer bg-none"
                  >
                    Xóa câu
                  </button>
                  
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black text-center leading-5 shadow-inner">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Câu hỏi số {idx + 1}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1 md:col-span-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase">Nội dung câu hỏi prompt / gợi ý</label>
                      <input 
                        type="text"
                        required
                        value={q.questionText}
                        onChange={(e) => handleQuestionChange(idx, 'questionText', e.target.value)}
                        placeholder="VD: Write about the benefits of online learning."
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-bold"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase">Loại hình trả lời</label>
                      <select 
                        value={q.questionType}
                        onChange={(e) => handleQuestionChange(idx, 'questionType', e.target.value)}
                        className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-xl bg-white font-bold cursor-pointer"
                      >
                        <option value="MULTIPLE_CHOICE">Trắc nghiệm (MCQ)</option>
                        <option value="FILL_IN_THE_BLANK">Điền từ vào ô trống</option>
                        <option value="TEXT_RESPONSE">Tự luận viết (Writing)</option>
                        <option value="AUDIO_RESPONSE">Ghi âm phát âm (Speaking)</option>
                      </select>
                    </div>
                  </div>

                  {q.questionType === 'MULTIPLE_CHOICE' && (
                    <div className="flex flex-col gap-1.5 animate-slide-up">
                      <label className="text-[9px] font-black text-slate-400 uppercase">Danh sách các đáp án lựa chọn (Ngăn cách bởi kí tự |)</label>
                      <input 
                        type="text"
                        required
                        value={q.options}
                        onChange={(e) => handleQuestionChange(idx, 'options', e.target.value)}
                        placeholder="VD: True | False | Not Given"
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-bold"
                      />
                    </div>
                  )}

                  {q.questionType !== 'AUDIO_RESPONSE' && q.questionType !== 'TEXT_RESPONSE' && (
                    <div className="flex flex-col gap-1.5 animate-slide-up">
                      <label className="text-[9px] font-black text-slate-400 uppercase">Đáp án đúng chuẩn xác (Để chấm tự động)</label>
                      <input 
                        type="text"
                        required
                        value={q.correctAnswer}
                        onChange={(e) => handleQuestionChange(idx, 'correctAnswer', e.target.value)}
                        placeholder="VD: True"
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-bold text-emerald-800"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button 
              type="submit"
              disabled={uploadingActivity}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-black rounded-2xl text-xs active:scale-[0.98] transition-all cursor-pointer border-none shadow-sm disabled:opacity-55"
            >
              {uploadingActivity ? "⏳ Đang phân phối bài tập lên LMS..." : "🚀 Đăng hoạt động bài tập lên lớp học"}
            </button>
          </form>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* TAB 3: KHÔNG GIAN CHẤM ĐIỂM (SPLIT-SCREEN GRADING) */}
      {/* ──────────────────────────────────────────────────────── */}
      {activeTab === 'grading' && (
        <div className="animate-fade-in flex flex-col gap-6">
          <div className="bg-gradient-to-br from-emerald-800 via-emerald-950 to-slate-950 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <span className="px-3 py-1 bg-yellow-500/25 text-yellow-400 text-[10px] font-extrabold rounded-full uppercase border border-yellow-500/20 tracking-widest">
                🎯 Bảng chấm điểm bài làm
              </span>
              <h2 className="text-2xl font-black mt-3">Không Gian Chấm Điểm Học Viên</h2>
              <p className="text-emerald-100/70 text-sm mt-1.5 font-medium max-w-md leading-relaxed">
                Nghe file ghi âm phát âm Speaking, xem bài tự luận Writing, so khớp trắc nghiệm và chấm điểm cùng nhận xét Rich Text chi tiết.
              </p>
            </div>
          </div>

          {/* Classroom Selector & Activity Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm text-left">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">1. Chọn lớp học:</label>
              <select
                value={selectedClass?.id || ""}
                onChange={(e) => handleClassDropdownChange(e.target.value)}
                className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-800 font-bold cursor-pointer"
              >
                <option value="">-- Lựa chọn lớp học --</option>
                {classrooms.map(c => (
                  <option key={c.id} value={c.id}>{c.className} ({c.courseTitle})</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">2. Chọn bài tập cần chấm điểm:</label>
              <select 
                value={selectedActivityId}
                onChange={(e) => handleSelectActivity(e.target.value)}
                className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-800 font-bold cursor-pointer"
              >
                <option value="">-- Chọn bài tập / bài thi thử để chấm --</option>
                {activities.map(act => (
                  <option key={act.id} value={act.id}>
                    [{act.type}] {act.title} ({act.skill}) - {act.questions?.length || 0} câu hỏi
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedActivityId ? (() => {
            const filteredSubmissions = submissions.filter(sub => {
              const studentInfo = students.find(s => s.studentId === sub.studentId);
              const studentName = studentInfo ? studentInfo.studentName : `Học viên ID ${sub.studentId}`;
              const matchesSearch = studentName.toLowerCase().includes(subSearch.toLowerCase());
              
              if (subFilter === 'graded') {
                return matchesSearch && sub.isGraded;
              }
              if (subFilter === 'ungraded') {
                return matchesSearch && !sub.isGraded;
              }
              return matchesSearch;
            });

            return (
              /* SPLIT-SCREEN LAYOUT FOR GRADING CONTAINER */
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 text-left">
                
                {/* LEFT SIDEBAR: SUBMISSIONS INDEX RASTER (40% width) */}
                <div className="lg:col-span-2 bg-slate-50/50 p-5 rounded-3xl border border-slate-200 flex flex-col gap-4 min-h-[350px]">
                  <div className="border-b border-slate-200 pb-3 flex flex-col gap-3">
                    <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">📥 Danh sách học viên nộp bài ({filteredSubmissions.length})</h5>
                    
                    {/* Search box */}
                    <div className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 flex items-center gap-2">
                      <Search size={14} className="text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Tìm kiếm theo tên học sinh..." 
                        value={subSearch}
                        onChange={e => setSubSearch(e.target.value)}
                        className="w-full bg-transparent focus:outline-none text-[11px] font-bold text-slate-800 placeholder-slate-400 border-none"
                      />
                    </div>

                    {/* Filter buttons */}
                    <div className="flex gap-1 text-[9px] font-black uppercase">
                      <button 
                        type="button" 
                        onClick={() => setSubFilter('all')} 
                        className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                          subFilter === 'all' 
                            ? 'bg-emerald-600 text-white border-emerald-600' 
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Tất cả
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setSubFilter('ungraded')} 
                        className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                          subFilter === 'ungraded' 
                            ? 'bg-emerald-600 text-white border-emerald-600' 
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Chờ chấm
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setSubFilter('graded')} 
                        className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                          subFilter === 'graded' 
                            ? 'bg-emerald-600 text-white border-emerald-600' 
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Đã chấm
                      </button>
                    </div>
                  </div>
                  
                  {loadingSubmissions ? (
                    <div className="py-12 text-center text-xs text-slate-400 font-bold">Đang tải danh sách bài làm...</div>
                  ) : filteredSubmissions.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400 italic font-semibold">Không có bài làm nào phù hợp điều kiện.</div>
                  ) : (
                    <div className="flex flex-col gap-2 overflow-y-auto max-h-[500px] pr-1 bg-white p-2 rounded-2xl border border-slate-150">
                      {filteredSubmissions.map(sub => {
                        const studentInfo = students.find(s => s.studentId === sub.studentId);
                        const studentName = studentInfo ? studentInfo.studentName : `Học viên ID ${sub.studentId}`;
                        const isSelected = selectedSubmission?.id === sub.id;
                        
                        return (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => handleSelectSubmission(sub)}
                            className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex justify-between items-center gap-2 ${
                              isSelected
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                : 'bg-white hover:border-emerald-300 hover:bg-emerald-50/10 text-slate-700 border-slate-150'
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <p className="font-extrabold text-xs truncate">{studentName}</p>
                              <p className={`text-[8.5px] mt-1 font-bold ${
                                isSelected ? 'text-emerald-100' : 'text-slate-400'
                              }`}>
                                Nộp ngày: {new Date(sub.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="shrink-0">
                              {sub.isGraded ? (
                                <span className={`px-2 py-0.5 rounded-lg border font-black text-[9px] ${
                                  isSelected ? 'bg-white/20 border-white text-white' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                }`}>
                                  {sub.score !== null ? `${sub.score}/10` : "Đã chấm"}
                                </span>
                              ) : (
                                <span className={`px-2 py-0.5 rounded-lg border font-black text-[9px] animate-pulse ${
                                  isSelected ? 'bg-white/20 border-white text-white' : 'bg-red-50 text-red-650 border-red-200'
                                }`}>
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

                {/* RIGHT SIDEBAR: DETAILED GRADING CANVAS SHEET (60% width) */}
                <div className="lg:col-span-3">
                  {selectedSubmission ? (
                    <div className="p-5 border border-slate-100 rounded-3xl bg-white shadow-sm flex flex-col gap-5 animate-fade-in">
                      
                      <div className="border-b border-slate-100 pb-3">
                        <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-150 px-2 py-0.5 rounded-md uppercase">
                          Grading Desk
                        </span>
                        <h5 className="font-extrabold text-slate-800 text-sm mt-2">
                          Học viên: {students.find(s => s.studentId === selectedSubmission.studentId)?.studentName || `ID ${selectedSubmission.studentId}`}
                        </h5>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                          Trạng thái: {selectedSubmission.isGraded ? "🟢 Đã chấm & lưu điểm số" : "🔴 Chờ xem xét và lưu điểm số"}
                        </p>
                      </div>

                      {/* Answers Sheet review */}
                      <div className="flex flex-col gap-4 max-h-[350px] overflow-y-auto pr-1">
                        <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Bài làm của học viên:</h6>
                        
                        {selectedSubmission.answers?.map((ans, idx) => (
                          <div key={ans.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-150 text-xs">
                            <p className="font-extrabold text-slate-850">Câu {idx + 1}: {ans.questionText}</p>
                            
                            {ans.options && (
                              <p className="text-[10px] text-slate-400 mt-1 font-bold">Các lựa chọn trắc nghiệm: {ans.options}</p>
                            )}

                            <div className="mt-2.5 p-3 rounded-xl bg-white border border-slate-150">
                              <span className="text-[8.5px] font-black text-slate-450 uppercase tracking-wider block mb-1.5">Bài làm nộp:</span>
                              
                              {/* SPEAKING AUDIO RESPONSE INLINE BROWSER PLAYER WITH WAVE VISUAL */}
                              {ans.questionType === 'AUDIO_RESPONSE' ? (
                                <div className="flex flex-col gap-2">
                                  {ans.studentAnswer ? (
                                    <div className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-100 flex flex-col gap-2">
                                      <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest flex items-center gap-1.5">
                                          <Volume2 size={12} /> GIỌNG NÓI GHI ÂM (SPEAKING)
                                        </span>
                                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                                          Browser Player Active
                                        </span>
                                      </div>
                                      
                                      {/* Waveform graphic visualization mockup */}
                                      <div className="h-8 flex items-center justify-center gap-0.5 bg-white rounded-lg border border-slate-200 px-3 overflow-hidden shadow-inner">
                                        <span className="w-1 h-3 bg-emerald-600 rounded-full"></span>
                                        <span className="w-1 h-5 bg-emerald-500 rounded-full"></span>
                                        <span className="w-1 h-7 bg-emerald-700 rounded-full"></span>
                                        <span className="w-1 h-4 bg-emerald-400 rounded-full"></span>
                                        <span className="w-1 h-6 bg-emerald-600 rounded-full"></span>
                                        <span className="w-1 h-2 bg-emerald-300 rounded-full"></span>
                                        <span className="w-1 h-4 bg-emerald-400 rounded-full"></span>
                                        <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
                                        <span className="w-1 h-8 bg-emerald-700 rounded-full"></span>
                                        <span className="w-1 h-5 bg-emerald-600 rounded-full"></span>
                                        <span className="w-1 h-3 bg-emerald-300 rounded-full"></span>
                                        <span className="w-1 h-5 bg-emerald-450 rounded-full"></span>
                                        <span className="w-1 h-7 bg-emerald-500 rounded-full"></span>
                                        <span className="w-1 h-8 bg-emerald-600 rounded-full"></span>
                                        <span className="w-1 h-4 bg-emerald-400 rounded-full"></span>
                                        <span className="w-1 h-2 bg-emerald-350 rounded-full"></span>
                                        <span className="w-1 h-5 bg-emerald-600 rounded-full"></span>
                                        <span className="w-1 h-7 bg-emerald-700 rounded-full"></span>
                                        <span className="w-1 h-3 bg-emerald-200 rounded-full"></span>
                                      </div>

                                      <audio controls src={ans.studentAnswer} className="w-full h-8 mt-1 accent-emerald-700" />
                                    </div>
                                  ) : (
                                    <span className="text-red-500 font-bold text-[11px] italic">⚠️ Không có tệp ghi âm được nộp</span>
                                  )}
                                </div>
                              ) : ans.questionType === 'TEXT_RESPONSE' ? (
                                <p 
                                  className="text-slate-800 font-medium whitespace-pre-wrap pl-2 border-l-2 border-emerald-600 bg-emerald-50/10 p-2 rounded text-[11px] leading-relaxed text-left"
                                  dangerouslySetInnerHTML={{ __html: ans.studentAnswer || "Học viên bỏ trống bài viết" }}
                                />
                              ) : (
                                <div className="flex items-center justify-between text-[11px] pl-1">
                                  <span className="font-extrabold text-slate-800">Trả lời: <strong className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">{ans.studentAnswer || "(bỏ trống)"}</strong></span>
                                  {ans.correctAnswer && (
                                    <span className="font-bold text-slate-450 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">Đáp án đúng: <strong className="text-emerald-800">{ans.correctAnswer}</strong></span>
                                  )}
                                </div>
                              )}

                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Form inputs score & rich text comments feedback */}
                      <form onSubmit={handleSaveSubmissionGrade} className="border-t border-slate-100 pt-4 flex flex-col gap-4">
                        
                        {/* Sub criteria points for Speaking/Writing activities */}
                        <div className="flex flex-col gap-3">
                          <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Tiêu chí chấm điểm (0 - 10)</h6>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="flex flex-col gap-1 p-2 bg-slate-50 rounded-2xl border border-slate-150 text-center">
                              <label className="text-[9px] font-black text-slate-450 uppercase">Phát âm (Speaking)</label>
                              <input 
                                type="number"
                                min="0"
                                max="10"
                                step="0.1"
                                value={pronunciationScore}
                                onChange={(e) => updateCriteriaScore('pron', e.target.value)}
                                placeholder="VD: 8.0"
                                className="w-full mt-1.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-800 bg-white text-center focus:outline-none focus:border-emerald-600"
                              />
                            </div>
                            <div className="flex flex-col gap-1 p-2 bg-slate-50 rounded-2xl border border-slate-150 text-center">
                              <label className="text-[9px] font-black text-slate-450 uppercase">Ngữ pháp (Grammar)</label>
                              <input 
                                type="number"
                                min="0"
                                max="10"
                                step="0.1"
                                value={grammarScore}
                                onChange={(e) => updateCriteriaScore('gram', e.target.value)}
                                placeholder="VD: 7.5"
                                className="w-full mt-1.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-800 bg-white text-center focus:outline-none focus:border-emerald-600"
                              />
                            </div>
                            <div className="flex flex-col gap-1 p-2 bg-slate-50 rounded-2xl border border-slate-150 text-center">
                              <label className="text-[9px] font-black text-slate-450 uppercase">Độ trôi chảy (Fluency)</label>
                              <input 
                                type="number"
                                min="0"
                                max="10"
                                step="0.1"
                                value={fluencyScore}
                                onChange={(e) => updateCriteriaScore('flue', e.target.value)}
                                placeholder="VD: 8.5"
                                className="w-full mt-1.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-800 bg-white text-center focus:outline-none focus:border-emerald-600"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Overall score */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                          <label className="text-xs font-black text-slate-700">Tổng điểm số bài làm (0.0 - 10.0)</label>
                          <input 
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            required
                            value={gradingScore}
                            onChange={(e) => setGradingScore(e.target.value)}
                            placeholder="Tổng trung bình cộng..."
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-black text-emerald-800 bg-slate-50 text-center sm:col-span-2 focus:outline-none focus:ring-1 focus:ring-emerald-650"
                          />
                        </div>

                        {/* Feedback comments input (RichText Editor Integration) */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-black text-slate-750">Nhận xét chi tiết của Giáo viên</label>
                          <RichTextEditor 
                            value={gradingFeedback}
                            onChange={(html) => setGradingFeedback(html)}
                            placeholder="Nhập nhận xét sửa lỗi phát âm, ngữ pháp và gợi ý nâng band điểm..."
                            minHeight="140px"
                            label="Khung soạn thảo lời phê bài học"
                          />
                        </div>

                        {/* Submit actions */}
                        <button
                          type="submit"
                          disabled={savingGrade}
                          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-xs active:scale-[0.98] transition-all cursor-pointer border-none shadow-sm shadow-emerald-500/10 disabled:opacity-50"
                        >
                          {savingGrade ? "⏳ Đang ghi nhận điểm số..." : "🎯 Lưu Điểm Số & Phản Hồi Học Viên"}
                        </button>
                      </form>

                    </div>
                  ) : (
                    <div className="p-12 border border-dashed border-slate-200 text-center rounded-3xl text-slate-400 text-xs font-semibold bg-white">
                      👈 Vui lòng bấm chọn một bài nộp ở danh sách bên trái để mở công cụ chấm điểm chi tiết.
                    </div>
                  )}
                </div>

              </div>
            );
          })() : (
            <div className="py-16 text-center text-slate-400 font-bold text-xs italic border border-dashed border-slate-200 rounded-3xl bg-white">
              Vui lòng lựa chọn lớp học và bài tập cụ thể ở trên để hiển thị danh sách chấm điểm học viên.
            </div>
          )}
        </div>
      )}

    </div>
  );
}

export default TeacherPortal;
