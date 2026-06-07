import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import RichTextEditor from './RichTextEditor';
import { 
  Award, 
  BookOpen, 
  Calendar, 
  Check, 
  Clock, 
  Compass, 
  CreditCard, 
  DollarSign, 
  Download, 
  FileText, 
  Flame, 
  Globe, 
  GraduationCap, 
  Info, 
  LayoutDashboard, 
  MessageSquare, 
  Mic, 
  Play, 
  RefreshCw, 
  Search, 
  Trophy, 
  User, 
  Users, 
  Video 
} from 'lucide-react';

// Bộ 10 câu hỏi Trắc nghiệm kiểm tra trình độ Tiếng Anh cao cấp
const placementQuestions = [
  {
    id: 1,
    question: "If I _______ you, I would study harder for the upcoming IELTS exam.",
    options: ["am", "was", "were", "had been"],
    answer: "were",
    explanation: "Câu điều kiện loại 2 (giả định ở hiện tại), mệnh đề If chia động từ 'were' cho tất cả các ngôi."
  },
  {
    id: 2,
    question: "By the time the teacher arrived, the students _______ their homework.",
    options: ["finished", "have finished", "had finished", "were finishing"],
    answer: "had finished",
    explanation: "Hành động hoàn thành bài tập xảy ra và kết thúc trước hành động giáo viên đến (chia quá khứ hoàn thành 'had finished')."
  },
  {
    id: 3,
    question: "She is very good _______ speaking English in public debates.",
    options: ["at", "in", "on", "for"],
    answer: "at",
    explanation: "Cấu trúc thành ngữ: 'be good at + V-ing/Noun' nghĩa là giỏi về lĩnh vực gì."
  },
  {
    id: 4,
    question: "The more vocabulary you memorize, _______ you will speak English.",
    options: ["the better", "better", "the best", "more better"],
    answer: "the better",
    explanation: "Cấu trúc so sánh kép: The + comparative + S + V, the + comparative + S + V (Càng... thì càng...)."
  },
  {
    id: 5,
    question: "We decided to postpone the outdoor class _______ the heavy rain.",
    options: ["because", "although", "despite", "because of"],
    answer: "because of",
    explanation: "'Because of + Noun Phrase/V-ing' chỉ nguyên nhân. 'heavy rain' là cụm danh từ."
  },
  {
    id: 6,
    question: "I look forward to _______ you at the next English conversation club.",
    options: ["meet", "meeting", "met", "be meeting"],
    answer: "meeting",
    explanation: "Cấu trúc đặc biệt: 'look forward to + V-ing' (trông mong, chờ đợi làm việc gì đó)."
  },
  {
    id: 7,
    question: "English _______ as a global language in almost every country nowadays.",
    options: ["speaks", "is spoken", "is speaking", "spoke"],
    answer: "is spoken",
    explanation: "Câu bị động ở hiện tại đơn: Tiếng Anh được nói (is spoken) như một ngôn ngữ toàn cầu."
  },
  {
    id: 8,
    question: "I don't mind _______ extra hours to improve my English vocabulary.",
    options: ["to study", "study", "studying", "studied"],
    answer: "studying",
    explanation: "Động từ 'mind' luôn đi kèm với danh động từ: 'mind + V-ing' (ngại, phiền làm gì đó)."
  },
  {
    id: 9,
    question: "Choose the synonym of 'AVOID':",
    options: ["confront", "evade", "adopt", "attract"],
    answer: "evade",
    explanation: "'Avoid' nghĩa là né tránh, đồng nghĩa với động từ 'evade'."
  },
  {
    id: 10,
    question: "Choose the word with the correct spelling:",
    options: ["Accomodate", "Acomodate", "Accommodate", "Acommodate"],
    answer: "Accommodate",
    explanation: "Từ 'accommodate' (đáp ứng, cung cấp chỗ ở) có đúng chính tả là 2 chữ 'c' và 2 chữ 'm'."
  }
];

function StudentDashboard({ user, initialTab, onTabChange }) {
  // Sync tab switching
  const [activeTab, setActiveTab] = useState(initialTab || 'dashboard');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleTabSelect = (tab) => {
    setActiveTab(tab);
    if (tab === 'dashboard') {
      setTestMode(false);
    }
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  // Existing Main states
  const [classrooms, setClassrooms] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCourses, setActiveCourses] = useState([]);

  // --- NEW TUITION PORTAL STATES ---
  const [studentPayments, setStudentPayments] = useState([]);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState({});
  const [showBankTransferInfo, setShowBankTransferInfo] = useState({});
  const [paymentConfigs, setPaymentConfigs] = useState([]);

  // --- GAMIFICATION STATES ---
  const [classroomProgress, setClassroomProgress] = useState({});
  const [gamificationProfile, setGamificationProfile] = useState(null);
  const [leaderboards, setLeaderboards] = useState({});
  const [activeLeaderboardClassId, setActiveLeaderboardClassId] = useState('');
  const [checkingIn, setCheckingIn] = useState(false);

  // Existing Placement Test States
  const [testMode, setTestMode] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [testFinished, setTestFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // --- NEW LMS CLASSROOM PANEL STATES ---
  const [activeClassroom, setActiveClassroom] = useState(null);
  const [classroomTab, setClassroomTab] = useState('materials'); // 'materials' or 'activities'
  const [classroomMaterials, setClassroomMaterials] = useState([]);
  const [classroomActivities, setClassroomActivities] = useState([]);
  const [studentSubmissions, setStudentSubmissions] = useState([]);
  const [loadingClassroomData, setLoadingClassroomData] = useState(false);

  // Practice States
  const [activeActivity, setActiveActivity] = useState(null);
  const [practiceAnswers, setPracticeAnswers] = useState({}); // mapped by questionId
  const [localAudioBlobs, setLocalAudioBlobs] = useState({}); // mapped by questionId
  const [localAudioUrls, setLocalAudioUrls] = useState({}); // mapped by questionId
  const [submittingPractice, setSubmittingPractice] = useState(false);
  const [practiceResult, setPracticeResult] = useState(null); // submission response for instant feedback

  // Recording Ref & State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingQId, setRecordingQId] = useState(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef(null);
  const timerIntervalRef = useRef(null);

  useEffect(() => {
    fetchStudentClasses();
  }, [user]);

  const fetchStudentClasses = async () => {
    try {
      setLoading(true);
      const classRes = await axios.get(`http://localhost:8080/api/classrooms/student/${user.id}`);
      setClassrooms(classRes.data);

      const gradePromises = classRes.data.map(cls => 
        axios.get(`http://localhost:8080/api/classrooms/${cls.id}/students`)
          .then(res => {
            const studentEnrollment = res.data.find(s => s.studentId === user.id);
            return {
              classId: cls.id,
              className: cls.className,
              courseTitle: cls.courseTitle,
              grade: studentEnrollment ? studentEnrollment.grade : null,
              enrollmentId: studentEnrollment ? studentEnrollment.id : null,
              tuitionFee: cls.tuitionFee || 0,
              semester: cls.semester || 'N/A'
            };
          })
      );
      const gradesData = await Promise.all(gradePromises);
      setGrades(gradesData);

      const paymentsRes = await axios.get(`http://localhost:8080/api/payments/student/${user.id}`);
      setStudentPayments(paymentsRes.data);

      const configsRes = await axios.get('http://localhost:8080/api/payment-configs');
      setPaymentConfigs(configsRes.data);

      const coursesRes = await axios.get('http://localhost:8080/api/courses');
      setActiveCourses(coursesRes.data);

      // --- GAMIFICATION INTEGRATION ---
      const progressMap = {};
      try {
        const progressPromises = classRes.data.map(cls =>
          axios.get(`http://localhost:8080/api/gamification/student/${user.id}/classroom/${cls.id}/progress`)
            .then(res => {
              progressMap[cls.id] = res.data;
            })
            .catch(e => console.error("Lỗi lấy progress của lớp " + cls.id, e))
        );
        await Promise.all(progressPromises);
        setClassroomProgress(progressMap);
      } catch (err) {
        console.error("Lỗi lấy tiến trình học tập:", err);
      }

      // Fetch Gamification Profile
      try {
        const gamificationRes = await axios.get(`http://localhost:8080/api/gamification/student/${user.id}`);
        setGamificationProfile(gamificationRes.data);
      } catch (err) {
        console.error("Lỗi lấy hồ sơ Gamification:", err);
      }

      // Fetch Leaderboard for first class
      if (classRes.data.length > 0) {
        const firstClassId = classRes.data[0].id;
        setActiveLeaderboardClassId(firstClassId);
        try {
          const lbRes = await axios.get(`http://localhost:8080/api/gamification/classroom/${firstClassId}/leaderboard`);
          setLeaderboards({ [firstClassId]: lbRes.data });
        } catch (err) {
          console.error("Lỗi lấy bảng xếp hạng:", err);
        }
      }
    } catch (err) {
      console.error("Lỗi lấy thông tin học tập:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async (classId) => {
    if (!classId) return;
    try {
      const res = await axios.get(`http://localhost:8080/api/gamification/classroom/${classId}/leaderboard`);
      setLeaderboards(prev => ({ ...prev, [classId]: res.data }));
    } catch (err) {
      console.error("Lỗi lấy bảng xếp hạng:", err);
    }
  };

  const handleCheckin = async () => {
    try {
      setCheckingIn(true);
      const res = await axios.post(`http://localhost:8080/api/gamification/student/${user.id}/check-in`);
      setGamificationProfile(res.data);
      alert("🎉 Điểm danh thành công! Chuỗi ngày học của bạn đã được cập nhật.");
      
      if (activeLeaderboardClassId) {
        fetchLeaderboard(activeLeaderboardClassId);
      }
    } catch (err) {
      console.error("Lỗi điểm danh:", err);
      alert("❌ Điểm danh thất bại hoặc bạn đã điểm danh hôm nay.");
    } finally {
      setCheckingIn(false);
    }
  };

  const handlePayTuition = async (enrollmentId, amount, method) => {
    try {
      setLoading(true);
      const res = await axios.post('http://localhost:8080/api/payments/create', {
        enrollmentId,
        amount,
        method,
        note: `Thanh toán học phí online cổng ${method}`
      });
      
      const paymentsRes = await axios.get(`http://localhost:8080/api/payments/student/${user.id}`);
      setStudentPayments(paymentsRes.data);
      
      if (res.data.paymentUrl) {
        window.location.href = res.data.paymentUrl;
      } else if (method === 'BANK_TRANSFER') {
        setShowBankTransferInfo(prev => ({ ...prev, [enrollmentId]: res.data }));
      }
    } catch (err) {
      console.error("Lỗi khởi tạo thanh toán học phí:", err);
      alert("❌ Có lỗi xảy ra khi tạo giao dịch thanh toán.");
    } finally {
      setLoading(false);
    }
  };

  const formatVND = (value) => {
    if (!value) return '0 đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const getBankQRCode = (bankPayment) => {
    if (!bankPayment) return '';
    const activeConfig = paymentConfigs.find(c => c.gatewayKey === 'BANK_TRANSFER') || {};
    if (activeConfig.qrUrl) {
      return activeConfig.qrUrl;
    }
    const bankName = activeConfig.gatewayName || 'Techcombank';
    const acctNum = activeConfig.accountNumber || '1903456789012';
    const text = encodeURIComponent(
      `BANK: ${bankName} - ACCT: ${acctNum} - AMOUNT: ${bankPayment.amount} - SYNTAX: ${bankPayment.transferSyntax}`
    );
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${text}`;
  };

  // LMS FUNCTIONS
  const handleEnterClassroom = (cls) => {
    setActiveClassroom(cls);
    setActiveTab('lms');
  };

  const handleExitClassroom = () => {
    setActiveClassroom(null);
    setClassroomTab('materials');
  };

  const fetchClassroomData = async () => {
    if (!activeClassroom) return;
    try {
      setLoadingClassroomData(true);
      const courseId = activeClassroom.courseId;
      
      const [materialsRes, activitiesRes, submissionsRes] = await Promise.all([
        axios.get(`http://localhost:8080/api/lms/courses/${courseId}/materials`),
        axios.get(`http://localhost:8080/api/lms/courses/${courseId}/activities?userId=${user.id}`),
        axios.get(`http://localhost:8080/api/lms/students/${user.id}/submissions`)
      ]);

      setClassroomMaterials(materialsRes.data);
      setClassroomActivities(activitiesRes.data);
      setStudentSubmissions(submissionsRes.data);
    } catch (err) {
      console.error("Lỗi tải thông tin học tập lớp học:", err);
    } finally {
      setLoadingClassroomData(false);
    }
  };

  useEffect(() => {
    if (activeClassroom) {
      fetchClassroomData();
    }
  }, [activeClassroom]);

  // Audio Recording System
  const startRecording = async (qId) => {
    if (isRecording) {
      alert("Đang có một cuộc ghi âm khác hoạt động!");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      let chunks = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const localUrl = URL.createObjectURL(blob);
        setLocalAudioBlobs(prev => ({ ...prev, [qId]: blob }));
        setLocalAudioUrls(prev => ({ ...prev, [qId]: localUrl }));
        stream.getTracks().forEach(track => track.stop());
      };

      setRecordingQId(qId);
      setIsRecording(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);

      mediaRecorder.start();
    } catch (err) {
      console.error("Không thể mở microphone:", err);
      alert("Không thể truy cập microphone. Vui lòng cho phép quyền truy cập micro trong trình duyệt!");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    setIsRecording(false);
    setRecordingQId(null);
  };

  // Practice Handlers
  const handleOpenPractice = (activity) => {
    setActiveActivity(activity);
    setPracticeAnswers({});
    setLocalAudioBlobs({});
    setLocalAudioUrls({});
    setPracticeResult(null);
  };

  const handleOpenResults = (activity, sub) => {
    setActiveActivity(activity);
    setPracticeResult(sub);
  };

  const handleExitPractice = () => {
    setActiveActivity(null);
    setPracticeAnswers({});
    setLocalAudioBlobs({});
    setLocalAudioUrls({});
    setPracticeResult(null);
    stopRecording();
  };

  const handlePracticeSubmit = async (e) => {
    e.preventDefault();
    if (!activeActivity) return;

    try {
      setSubmittingPractice(true);
      const updatedAnswers = [];

      for (let i = 0; i < activeActivity.questions.length; i++) {
        const q = activeActivity.questions[i];
        let studentAnswerText = practiceAnswers[q.id] || "";

        if (q.questionType === "AUDIO_RESPONSE") {
          const audioBlob = localAudioBlobs[q.id];
          if (audioBlob) {
            const formData = new FormData();
            formData.append("file", audioBlob, `speaking_student_${user.id}_q_${q.id}.wav`);
            const uploadRes = await axios.post("http://localhost:8080/api/upload", formData, {
              headers: { "Content-Type": "multipart/form-data" }
            });
            studentAnswerText = uploadRes.data.url;
          }
        }

        updatedAnswers.push({
          questionId: q.id,
          studentAnswer: studentAnswerText
        });
      }

      const payload = {
        studentId: user.id,
        answers: updatedAnswers
      };

      const res = await axios.post(`http://localhost:8080/api/lms/activities/${activeActivity.id}/submissions`, payload);
      setPracticeResult(res.data);
      
      fetchClassroomData();
      alert("🎉 Bạn đã nộp bài thành công!");
    } catch (err) {
      console.error("Lỗi khi nộp bài làm:", err);
      alert("Không thể nộp bài làm. Vui lòng kiểm tra kết nối mạng!");
    } finally {
      setSubmittingPractice(false);
    }
  };

  const getSubmissionStatus = (activity) => {
    const sub = studentSubmissions.find(s => s.activityId === activity.id);
    if (!sub) return { status: 'NOT_STARTED', text: 'Chưa làm', style: 'bg-slate-50 text-slate-500 border-slate-200' };

    if (activity.type === 'TEST' && !activity.isResultsReleased) {
      return { 
        status: 'PENDING_RELEASE', 
        text: 'Chờ công bố điểm', 
        style: 'bg-yellow-50 text-yellow-600 border-yellow-250 animate-pulse',
        submission: sub 
      };
    }

    if (!sub.isGraded) {
      return { 
        status: 'PENDING_GRADE', 
        text: 'Đang chờ chấm', 
        style: 'bg-orange-50 text-orange-500 border-orange-200 animate-pulse',
        submission: sub 
      };
    }

    return { 
      status: 'GRADED', 
      text: `Điểm số: ${sub.score}/10`, 
      style: 'bg-emerald-50 text-emerald-700 border-emerald-250 font-black',
      submission: sub 
    };
  };

  const formatTime = (seconds) => {
    const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
    const ss = String(seconds % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  };

  // PLACEMENT TEST FUNCTIONS
  const handleStartTest = () => {
    setTestMode(true);
    setCurrentQIndex(0);
    setUserAnswers({});
    setTestFinished(false);
    setScore(0);
    setBookingSuccess(false);
  };

  const handleSelectOption = (option) => {
    setUserAnswers({ ...userAnswers, [currentQIndex]: option });
    if (currentQIndex < placementQuestions.length - 1) {
      setTimeout(() => {
        setCurrentQIndex(currentQIndex + 1);
      }, 200);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQIndex > 0) {
      setCurrentQIndex(currentQIndex - 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQIndex < placementQuestions.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
    }
  };

  const handleSubmitTest = () => {
    let calculatedScore = 0;
    placementQuestions.forEach((q, index) => {
      if (userAnswers[index] === q.answer) {
        calculatedScore += 1;
      }
    });
    setScore(calculatedScore);
    setTestFinished(true);
  };

  const getRecommendedLevel = () => {
    let targetLevel = 'Beginner';
    let levelText = 'Cơ bản (Beginner)';
    let genericDesc = 'Bạn có nền tảng từ vựng và ngữ pháp cơ bản chưa vững vàng. Lớp học này giúp bạn củng cố lại gốc tiếng Anh nhanh chóng!';

    if (score >= 5 && score <= 7) {
      targetLevel = 'Intermediate';
      levelText = 'Trung cấp (Intermediate)';
      genericDesc = 'Bạn có phản xạ ngữ pháp khá tốt! Chương trình ôn luyện IELTS Trung cấp giúp bạn mở rộng tối đa kỹ năng học thuật.';
    } else if (score >= 8) {
      targetLevel = 'Advanced';
      levelText = 'Nâng cao (Advanced)';
      genericDesc = 'Kỹ năng ngữ pháp và từ vựng của bạn rất xuất sắc. Bạn đã sẵn sàng bước vào khóa học cam kết đầu ra cao cấp nhất!';
    }

    let matchingCourses = activeCourses.filter(c => c.level === targetLevel);
    if (matchingCourses.length === 0 && activeCourses.length > 0) {
      matchingCourses = activeCourses;
    }

    if (matchingCourses.length > 0) {
      const course = matchingCourses[0];
      return {
        courseId: course.id,
        title: `${course.title} - [Trình độ đề xuất: ${targetLevel}]`,
        desc: course.description || `Khóa học ${course.title} thực tế đang mở tuyển sinh tại trung tâm, cam kết chất lượng đầu ra.`,
        isReal: true
      };
    } else {
      return {
        courseId: null,
        title: `Tư vấn Lộ trình ${levelText}`,
        desc: `Hiện tại trung tâm chưa mở lớp học cụ thể nào thuộc trình độ này trong database. ${genericDesc} Chuyên viên sẽ gọi điện tư vấn và xếp lộ trình cá nhân hóa riêng cho bạn.`,
        isReal: false
      };
    }
  };

  const handleBookRecommendation = async () => {
    const recommendation = getRecommendedLevel();
    try {
      const payload = {
        fullName: user.fullName || 'Học viên',
        phoneNumber: '0988888888',
        email: user.email || (user.username ? `${user.username}@gmail.com` : 'email@gmail.com'),
        courseId: recommendation.courseId,
        notes: `Học viên đã làm bài Placement Test đầu vào đạt ${score}/10 câu đúng. Đề xuất xếp vào trình độ: ${recommendation.title}`
      };
      await axios.post('http://localhost:8080/api/registrations', payload);
      setBookingSuccess(true);
      alert("🎉 Đã gửi đăng ký xếp lớp theo trình độ đề xuất thành công!");
    } catch (err) {
      console.error("Lỗi gửi thông tin xếp lớp:", err);
      alert("Không thể gửi thông tin xếp lớp.");
    }
  };

  // Graphical Tuition Status Timeline
  const renderTuitionTimeline = (payment) => {
    const status = payment?.status || 'UNPAID';
    const steps = [
      { key: 'UNPAID', label: 'Chưa thanh toán', desc: 'Chờ đóng học phí' },
      { key: 'PENDING_APPROVAL', label: 'Chờ duyệt ⏳', desc: 'Đang kiểm chứng' },
      { key: 'PAID', label: 'Đã đóng học phí ✓', desc: 'Hoàn tất giao dịch' },
    ];
    
    let currentStepIdx = 0;
    if (status === 'PENDING_APPROVAL' || status === 'PENDING') currentStepIdx = 1;
    if (status === 'PAID') currentStepIdx = 2;
    
    return (
      <div className="py-5">
        <div className="flex items-center justify-between relative max-w-sm mx-auto">
          {/* Timeline bar */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 z-0 rounded"></div>
          <div 
            className="absolute top-1/2 left-0 h-1 bg-emerald-500 -translate-y-1/2 z-0 rounded transition-all duration-500"
            style={{ width: `${currentStepIdx * 50}%` }}
          ></div>
          
          {steps.map((step, idx) => {
            const isCompleted = idx <= currentStepIdx;
            const isActive = idx === currentStepIdx;
            return (
              <div key={step.key} className="flex flex-col items-center relative z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shadow-md transition-all ${
                  isCompleted 
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-100' 
                    : 'bg-white text-slate-400 border-2 border-slate-200'
                }`}>
                  {idx + 1}
                </div>
                <span className={`text-[10px] mt-2 font-black tracking-tight ${
                  isActive ? 'text-emerald-700' : isCompleted ? 'text-slate-600' : 'text-slate-400'
                }`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 animate-fade-in text-left">
      
      {/* 🟢 TOP BAR INDICATOR: GAMIFICATION BANNER & ROLE AVATAR */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 mb-6 transition-all hover:shadow-md">
        {/* Left: Avatar & Intro */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black text-xl shadow-inner border border-emerald-500/20">
            {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'H'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-slate-800 text-base">Chào, {user.fullName || 'Học viên'}!</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-250 text-[9px] font-black uppercase">
                Học viên
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Mã tài khoản: #{user.id}</p>
          </div>
        </div>

        {/* Right: Streaks & Checkins (Sunny Gold accents) */}
        {gamificationProfile && (
          <div className="flex items-center gap-4 flex-wrap">
            {/* Streak count 🔥 */}
            <div className="flex items-center gap-2 bg-orange-50/50 border border-orange-100 px-3.5 py-2 rounded-2xl shadow-sm">
              <span className="text-2xl animate-pulse">🔥</span>
              <div className="text-left">
                <span className="block text-sm font-black text-slate-800 leading-none">
                  {gamificationProfile.currentStreak} Ngày
                </span>
                <span className="text-[9px] text-orange-600 font-bold uppercase tracking-wide mt-1 block">
                  Chuỗi liên tiếp
                </span>
              </div>
            </div>

            {/* EXP Score 🏆 */}
            <div className="flex items-center gap-2 bg-yellow-50/50 border border-yellow-150 px-3.5 py-2 rounded-2xl shadow-sm">
              <span className="text-2xl">🏆</span>
              <div className="text-left">
                <span className="block text-sm font-black text-slate-800 leading-none">
                  {gamificationProfile.badges?.filter(b => b.earned).length * 100 || 0} XP
                </span>
                <span className="text-[9px] text-yellow-600 font-bold uppercase tracking-wide mt-1 block">
                  Điểm vinh danh
                </span>
              </div>
            </div>

            {/* Daily check-in button (Sunny Gold `#EAB308`) */}
            <button
              type="button"
              onClick={handleCheckin}
              disabled={checkingIn}
              className="px-4 py-2.5 bg-yellow-500 hover:bg-yellow-650 text-slate-900 font-black rounded-2xl text-xs shadow-sm hover:shadow active:scale-95 transition-all cursor-pointer border-none disabled:opacity-50"
            >
              {checkingIn ? "⏳..." : "📅 Điểm Danh Hôm Nay"}
            </button>
          </div>
        )}
      </div>

      {/* 🔴 TAB CHUYỂN HOẠT ĐỘNG (SUB NAVIGATION PILLS) */}
      <div className="flex bg-slate-100/70 p-1.5 rounded-2xl gap-1 mb-6 max-w-lg">
        <button
          onClick={() => handleTabSelect('dashboard')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer border-none flex items-center justify-center gap-1.5 ${
            activeTab === 'dashboard'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 bg-transparent'
          }`}
        >
          <LayoutDashboard size={14} /> Dashboard
        </button>
        <button
          onClick={() => handleTabSelect('lms')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer border-none flex items-center justify-center gap-1.5 ${
            activeTab === 'lms'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 bg-transparent'
          }`}
        >
          <BookOpen size={14} /> LMS Lớp Học
        </button>
        <button
          onClick={() => handleTabSelect('achievements')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer border-none flex items-center justify-center gap-1.5 ${
            activeTab === 'achievements'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 bg-transparent'
          }`}
        >
          <Award size={14} /> Thi Đua & Huy Hiệu
        </button>
        <button
          onClick={() => handleTabSelect('tuition')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer border-none flex items-center justify-center gap-1.5 ${
            activeTab === 'tuition'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 bg-transparent'
          }`}
        >
          <DollarSign size={14} /> Học Phí
        </button>
      </div>

      {/* ──────────────────────────────────────────────────────── */}
      {/* TAB 1: DASHBOARD HỌC TẬP (STUDENT HOME) */}
      {/* ──────────────────────────────────────────────────────── */}
      {activeTab === 'dashboard' && (
        <div className="animate-fade-in flex flex-col gap-6">
          {!testMode ? (
            <>
              {/* WELCOMING GRADIENT BANNER */}
              <div className="bg-gradient-to-br from-emerald-800 via-emerald-950 to-slate-950 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl"></div>
                <div className="relative z-10 max-w-2xl">
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold rounded-full uppercase border border-emerald-500/10 tracking-widest">
                    🎓 Không Gian Học Viên EduEnglish
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black mt-4">Chào mừng học viên, {user.fullName}!</h2>
                  <p className="text-emerald-100/70 text-sm mt-2 leading-relaxed font-medium">
                    Hãy truy cập "Không gian học tập" của lớp để xem tài liệu chi tiết, hoàn thành bài tập về nhà, luyện kỹ năng nói/viết trực tiếp và tham gia đấu trường thi đua giành huy hiệu.
                  </p>
                </div>
              </div>

              {/* GRID LAYOUT FOR ENROLLED CLASSES & QUICK LINKS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* LỚP HỌC ĐANG THAM GIA */}
                <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4">
                  <h3 className="text-base font-black text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                    <BookOpen className="text-emerald-600" size={18} /> Lớp Học Đang Tham Gia ({classrooms.length})
                  </h3>

                  {loading ? (
                    <div className="py-12 text-center flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs text-slate-400 font-bold">Đang tải lịch lớp học...</span>
                    </div>
                  ) : classrooms.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs font-semibold italic bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                      Bạn chưa tham gia lớp học nào. Vui lòng đăng ký tư vấn để được sắp xếp lịch học.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {classrooms.map(cls => (
                        <div key={cls.id} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-150/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:bg-slate-50">
                          <div className="flex-1">
                            <p className="font-extrabold text-sm text-slate-800">{cls.className}</p>
                            <span className="inline-block text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded mt-1.5 uppercase">
                              {cls.courseTitle}
                            </span>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-semibold mt-3">
                              <User size={12} className="text-slate-400" />
                              <span>Giảng viên: <strong className="text-slate-700 font-extrabold">{cls.teacherName}</strong></span>
                            </div>

                            {/* Class Progress Bar */}
                            {classroomProgress[cls.id] && (
                              <div className="mt-3.5 max-w-sm">
                                <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 mb-1">
                                  <span>Tiến độ học tập:</span>
                                  <span className="text-emerald-600 font-black">
                                    {classroomProgress[cls.id].completedActivities}/{classroomProgress[cls.id].totalActivities} bài tập ({classroomProgress[cls.id].progressPercentage}%)
                                  </span>
                                </div>
                                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden border border-slate-200/50 shadow-inner">
                                  <div 
                                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-500"
                                    style={{ width: `${classroomProgress[cls.id].progressPercentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-3">
                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-slate-600 bg-white border border-slate-200 py-1 px-3 rounded-lg shadow-sm">
                              <Calendar size={11} className="text-slate-400" /> {cls.schedule}
                            </span>
                            <button
                              onClick={() => handleEnterClassroom(cls)}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-755 text-white font-extrabold rounded-xl text-xs transition-all shadow-sm active:scale-95 cursor-pointer border-none"
                            >
                              Vào Lớp Học 📖
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* THI THỬ PLACEMENT TEST INVITATION PANEL */}
                <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4 text-center items-center justify-center">
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl rounded-2xl shadow-inner border border-emerald-100">
                    📝
                  </div>
                  
                  <h3 className="text-base font-black text-slate-800">Kiểm Tra Trình Độ Đầu Vào</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider -mt-1.5">
                    Online Placement Test
                  </p>
                  
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    Bài thi thử trắc nghiệm 10 câu hỏi ngữ pháp nâng cao giúp bạn tự đánh giá năng lực hiện tại và đặt lịch lộ trình học phù hợp nhất.
                  </p>

                  <button 
                    onClick={handleStartTest}
                    className="w-full mt-2 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-slate-900 font-black rounded-xl shadow-sm hover:shadow active:scale-[0.98] transition-all cursor-pointer border-none text-xs"
                  >
                    Bắt Đầu Làm Test ➔
                  </button>
                </div>
              </div>
            </>
          ) : (
            // GIAO DIỆN BÀI THI PLACEMENT TEST ĐANG DIỄN RA
            <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden animate-slide-up">
              <div className="bg-slate-50 py-4 px-6 border-b border-slate-150 flex justify-between items-center">
                <span className="text-xs font-black text-slate-500">
                  Câu {currentQIndex + 1} / {placementQuestions.length}
                </span>
                <div className="flex-1 max-w-[200px] h-2 bg-slate-200 rounded-full mx-4 overflow-hidden">
                  <div 
                    className="h-full bg-emerald-600 transition-all duration-300"
                    style={{ width: `${((currentQIndex + 1) / placementQuestions.length) * 100}%` }}
                  ></div>
                </div>
                {!testFinished && (
                  <button 
                    onClick={() => setTestMode(false)}
                    className="text-xs font-black text-red-500 hover:text-red-700 cursor-pointer bg-none border-none"
                  >
                    Hủy thi
                  </button>
                )}
              </div>

              {!testFinished ? (
                <div className="p-6 sm:p-8">
                  <h3 className="text-base sm:text-lg font-black text-slate-800 leading-relaxed mb-6">
                    {placementQuestions[currentQIndex].question}
                  </h3>

                  <div className="flex flex-col gap-3">
                    {placementQuestions[currentQIndex].options.map((opt, i) => {
                      const isSelected = userAnswers[currentQIndex] === opt;
                      return (
                        <button 
                          key={i}
                          onClick={() => handleSelectOption(opt)}
                          className={`w-full py-3.5 px-4 text-left rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                            isSelected 
                              ? 'border-emerald-500 bg-emerald-50/20 text-emerald-700 shadow shadow-emerald-500/5'
                              : 'border-slate-200 hover:border-slate-350 hover:bg-slate-50/50 bg-white text-slate-700'
                          }`}
                        >
                          <span className="inline-block w-6 h-6 rounded-lg bg-slate-100 text-slate-500 text-xs font-bold text-center leading-6 mr-3">
                            {String.fromCharCode(65 + i)}
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex justify-between items-center mt-8 pt-4 border-t border-slate-100">
                    <button 
                      onClick={handlePrevQuestion}
                      disabled={currentQIndex === 0}
                      className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        currentQIndex === 0 
                          ? 'border-slate-100 text-slate-300 bg-slate-50 cursor-not-allowed'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      ◀ Câu Trước
                    </button>

                    {currentQIndex === placementQuestions.length - 1 ? (
                      <button 
                        onClick={handleSubmitTest}
                        disabled={userAnswers[currentQIndex] === undefined}
                        className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-black rounded-xl shadow cursor-pointer text-xs active:scale-[0.98] transition-all border-none"
                      >
                        ✓ Nộp bài test
                      </button>
                    ) : (
                      <button 
                        onClick={handleNextQuestion}
                        className="px-4 py-2 text-xs font-bold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                      >
                        Câu Tiếp ▶
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-6 sm:p-8 flex flex-col">
                  <div className="text-center mb-6">
                    <div className="inline-flex w-16 h-16 bg-emerald-50 rounded-full items-center justify-center text-4xl mb-3 shadow-inner border border-emerald-100">
                      🎉
                    </div>
                    <h3 className="text-xl font-black text-slate-800">Hoàn Thành Bài Kiểm Tra!</h3>
                    <div className="mt-3 inline-block px-4 py-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-full font-black text-sm">
                      Đạt điểm: {score} / 10 câu đúng
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 mb-6 text-left">
                    <span className="text-[9px] font-black text-emerald-600 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200/50 uppercase tracking-widest">
                      Lộ trình đề xuất
                    </span>
                    <h4 className="text-base font-extrabold text-slate-800 mt-2.5">
                      Khóa học: {getRecommendedLevel().title}
                    </h4>
                    <p className="text-slate-655 text-xs mt-2 leading-relaxed font-semibold">
                      {getRecommendedLevel().desc}
                    </p>
                  </div>

                  {bookingSuccess ? (
                    <div className="p-3.5 mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-black text-center animate-fade-in">
                      ✓ Đã gửi thông tin đăng ký xếp lớp lên hệ thống thành công! Chuyên viên sẽ sớm liên hệ tư vấn.
                    </div>
                  ) : (
                    <button 
                      onClick={handleBookRecommendation}
                      className="w-full py-3.5 bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-black rounded-xl shadow-md cursor-pointer text-xs active:scale-[0.98] transition-all border-none"
                    >
                      Đăng Ký Xếp Lớp Trình Độ Đề Xuất
                    </button>
                  )}

                  <button 
                    onClick={() => setTestMode(false)}
                    className="w-full mt-3 py-3 bg-white hover:bg-slate-100 text-slate-550 border border-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    🏠 Quay Lại Dashboard Cá Nhân
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* TAB 2: KHÔNG GIAN HỌC TẬP (LMS WORKSPACE) */}
      {/* ──────────────────────────────────────────────────────── */}
      {activeTab === 'lms' && (
        <div className="animate-fade-in flex flex-col gap-6">
          <style>{`
            @keyframes quiet {
              0%, 100% { height: 4px; }
              50% { height: 4px; }
            }
            @keyframes loud {
              0%, 100% { height: 4px; }
              50% { height: 28px; }
            }
            .sound-wave {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 3px;
              height: 40px;
            }
            .sound-wave span {
              display: block;
              width: 3px;
              height: 4px;
              background-color: #059669;
              border-radius: 2px;
            }
            .sound-wave.active span {
              animation: loud 1.2s ease-in-out infinite;
            }
            .sound-wave.active span:nth-child(1) { animation-delay: 0.1s; }
            .sound-wave.active span:nth-child(2) { animation-delay: 0.3s; }
            .sound-wave.active span:nth-child(3) { animation-delay: 0.6s; }
            .sound-wave.active span:nth-child(4) { animation-delay: 0.4s; }
            .sound-wave.active span:nth-child(5) { animation-delay: 0.2s; }
            .sound-wave.active span:nth-child(6) { animation-delay: 0.5s; }
          `}</style>

          {/* NO ACTIVE CLASSROOM SELECTOR SCREEN */}
          {!activeClassroom ? (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-6">
              <div>
                <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                  <BookOpen size={18} className="text-emerald-600" /> Chọn Không Gian Lớp Học LMS
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-semibold">
                  Chọn lớp học để vào Workspace riêng, làm bài tập về nhà, tự luận hoặc ghi âm.
                </p>
              </div>

              {loading ? (
                <div className="py-12 text-center text-xs text-slate-400 font-bold">Đang tải danh sách lớp học...</div>
              ) : classrooms.length === 0 ? (
                <div className="py-12 text-center text-slate-400 italic font-semibold bg-slate-50/50 rounded-2xl border border-slate-200">
                  Bạn chưa đăng ký lớp học nào.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {classrooms.map(cls => (
                    <div key={cls.id} className="p-5 bg-slate-50/50 border border-slate-200/80 rounded-2xl flex flex-col justify-between gap-4 hover:shadow-sm hover:bg-slate-50 transition-all">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-800">{cls.className}</h4>
                        <span className="inline-block text-[9px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md mt-1.5 uppercase border border-emerald-100">
                          {cls.courseTitle}
                        </span>
                        <div className="text-[10px] text-slate-500 font-bold mt-4 flex flex-col gap-1.5">
                          <p>👨‍🏫 Giáo viên: <strong>{cls.teacherName}</strong></p>
                          <p>📅 Lịch học: <strong>{cls.schedule}</strong></p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleEnterClassroom(cls)}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs transition-all border-none cursor-pointer text-center"
                      >
                        Vào Workspace Lớp Học ➔
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // 2-COLUMN LMS CLASSROOM WORKSPACE VIEW
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              
              {/* SYLLABUS INDEX SIDEBAR (LEFT 25%) */}
              <div className="lg:col-span-1 bg-white border border-slate-100 rounded-3xl p-4 shadow-sm flex flex-col justify-between gap-6 min-h-[450px]">
                <div className="flex flex-col gap-4">
                  {/* Classroom header info */}
                  <div className="pb-3 border-b border-slate-100">
                    <span className="text-[9px] font-black bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded border border-emerald-100">
                      LMS WORKSPACE
                    </span>
                    <h4 className="font-extrabold text-sm text-slate-800 mt-2">{activeClassroom.className}</h4>
                    <p className="text-[10px] text-slate-450 font-bold mt-1 uppercase">GV: {activeClassroom.teacherName}</p>
                  </div>

                  {/* Syllabus lists */}
                  <div className="flex flex-col gap-4">
                    {/* Switcher Tab */}
                    <div className="flex bg-slate-50 p-1 rounded-xl gap-1 border border-slate-200/50">
                      <button
                        onClick={() => setClassroomTab('materials')}
                        className={`flex-1 py-1.5 text-[10px] font-black rounded-lg border-none cursor-pointer ${
                          classroomTab === 'materials' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 bg-transparent'
                        }`}
                      >
                        Tài liệu
                      </button>
                      <button
                        onClick={() => setClassroomTab('activities')}
                        className={`flex-1 py-1.5 text-[10px] font-black rounded-lg border-none cursor-pointer ${
                          classroomTab === 'activities' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 bg-transparent'
                        }`}
                      >
                        Bài tập
                      </button>
                    </div>

                    {/* Materials List */}
                    {classroomTab === 'materials' && (
                      <div className="flex flex-col gap-1.5 max-h-[250px] overflow-y-auto pr-1">
                        {loadingClassroomData ? (
                          <div className="text-center text-[10px] text-slate-400 py-4 font-semibold">Tải bài học...</div>
                        ) : classroomMaterials.length === 0 ? (
                          <p className="text-[10px] text-slate-400 italic text-center py-4">Lớp chưa có tài liệu.</p>
                        ) : (
                          classroomMaterials.map(mat => (
                            <a
                              key={mat.id}
                              href={mat.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2.5 rounded-xl border border-slate-150 hover:border-emerald-300 hover:bg-emerald-50/10 text-xs font-semibold text-slate-700 text-left transition-all flex items-center gap-2"
                            >
                              <FileText size={14} className="text-emerald-600 shrink-0" />
                              <span className="truncate">{mat.title}</span>
                            </a>
                          ))
                        )}
                      </div>
                    )}

                    {/* Activities List */}
                    {classroomTab === 'activities' && (
                      <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                        {loadingClassroomData ? (
                          <div className="text-center text-[10px] text-slate-400 py-4 font-semibold">Tải bài tập...</div>
                        ) : classroomActivities.length === 0 ? (
                          <p className="text-[10px] text-slate-400 italic text-center py-4">Lớp chưa có bài tập.</p>
                        ) : (
                          classroomActivities.map(act => {
                            const { status, text, style, submission } = getSubmissionStatus(act);
                            const isSelected = activeActivity?.id === act.id;
                            
                            return (
                              <button
                                type="button"
                                key={act.id}
                                onClick={() => {
                                  if (status === 'GRADED') {
                                    handleOpenResults(act, submission);
                                  } else {
                                    handleOpenPractice(act);
                                  }
                                }}
                                className={`w-full p-2.5 rounded-xl text-left border transition-all flex flex-col gap-1 cursor-pointer ${
                                  isSelected 
                                    ? 'border-emerald-500 bg-emerald-50/20' 
                                    : 'border-slate-200 hover:border-slate-350 bg-white'
                                }`}
                              >
                                <span className="font-extrabold text-[11px] text-slate-800 leading-tight truncate w-full">
                                  {act.title}
                                </span>
                                <span className={`text-[8.5px] px-1.5 py-0.5 rounded font-black border uppercase inline-block self-start mt-0.5 ${style}`}>
                                  {text}
                                </span>
                              </button>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Exit Workspace Button */}
                <button
                  type="button"
                  onClick={handleExitClassroom}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold rounded-xl text-xs border-none cursor-pointer transition-all flex items-center justify-center gap-1.5"
                >
                  ◀ Thoát Workspace
                </button>
              </div>

              {/* MAIN CONTENT AREA (RIGHT 75%) */}
              <div className="lg:col-span-3 flex flex-col gap-6">
                
                {/* 1. SYLLABUS PROGRESS CARD */}
                {classroomProgress[activeClassroom.id] && (
                  <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-3xl">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-655 mb-1.5">
                      <span>Tiến độ bài tập lớp:</span>
                      <span className="text-emerald-700 font-extrabold">
                        Đã làm {classroomProgress[activeClassroom.id].completedActivities}/{classroomProgress[activeClassroom.id].totalActivities} bài tập ({classroomProgress[activeClassroom.id].progressPercentage}%)
                      </span>
                    </div>
                    <div className="w-full h-3 bg-emerald-100/60 rounded-full overflow-hidden border border-emerald-200/30">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-500"
                        style={{ width: `${classroomProgress[activeClassroom.id].progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* 2. ACTIVITY PANEL SHEET */}
                {activeActivity ? (
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col gap-6 animate-fade-in">
                    {/* Heading details */}
                    <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                      <div>
                        <span className="px-2.5 py-0.5 rounded bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-black uppercase">
                          {activeActivity.type} • {activeActivity.skill}
                        </span>
                        <h3 className="text-lg font-black text-slate-800 mt-1">{activeActivity.title}</h3>
                      </div>
                      <button 
                        onClick={handleExitPractice}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold rounded-xl text-xs transition-all cursor-pointer border-none"
                      >
                        ◀ Đóng
                      </button>
                    </div>

                    {/* MÀN HÌNH BÁO KẾT QUẢ / ĐÃ LÀM (SUBMITTED RESULT DETAILS VIEW) */}
                    {practiceResult ? (
                      <div className="flex flex-col gap-6 animate-fade-in text-left">
                        {/* Test type waiting for score releases */}
                        {activeActivity.type === 'TEST' && !activeActivity.isResultsReleased ? (
                          <div className="text-center p-8 bg-slate-50 rounded-2xl border border-slate-200 max-w-md mx-auto flex flex-col items-center">
                            <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center text-4xl mb-4 border border-yellow-200">🎉</div>
                            <h4 className="font-extrabold text-slate-800 text-base">Nộp bài kiểm tra thành công!</h4>
                            <p className="text-xs text-slate-500 mt-2 font-medium leading-relaxed">
                              Đang chờ giáo viên công bố kết quả thi thử. Điểm số của bạn sẽ tự động xuất hiện sau khi được xác thực.
                            </p>
                            <button 
                              onClick={handleExitPractice}
                              className="mt-6 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs transition-all cursor-pointer border-none"
                            >
                              Quay lại
                            </button>
                          </div>
                        ) : (
                          // GRADED OR RELEASED RESULT SCREEN WITH TEACHER CARD
                          <div className="flex flex-col gap-6">
                            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 border border-emerald-200 rounded-2xl p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                              <div>
                                <h4 className="font-extrabold text-slate-800 text-sm">🎉 Kết quả làm bài luyện tập của bạn</h4>
                                <p className="text-xs text-slate-550 mt-1 font-semibold">Cám ơn sự cố gắng hoàn thiện bản thân của bạn!</p>
                              </div>
                              <div className="text-right">
                                <span className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-base font-black shadow-sm">
                                  {practiceResult.score !== null ? `${practiceResult.score} / 10 điểm` : "Đang chờ chấm"}
                                </span>
                              </div>
                            </div>

                            {/* TEACHER EVALUATION CARD */}
                            {practiceResult.teacherFeedback && (
                              <div className="p-4 bg-yellow-50/50 border border-yellow-200 rounded-2xl">
                                <p className="text-xs font-black text-yellow-700 flex items-center gap-1">
                                  💬 NHẬN XÉT CỦA GIÁO VIÊN:
                                </p>
                                <p className="text-xs text-slate-700 mt-1.5 font-medium italic">{practiceResult.teacherFeedback}</p>
                              </div>
                            )}

                            {/* Question review layout */}
                            <div className="flex flex-col gap-4">
                              <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">Chi tiết bài làm:</h5>
                              {practiceResult.answers?.map((ans, idx) => {
                                const isCorrectMC = ans.correctAnswer && ans.studentAnswer && ans.studentAnswer.trim().toLowerCase() === ans.correctAnswer.trim().toLowerCase();
                                const isWritten = ans.questionType === 'TEXT_RESPONSE' || ans.questionType === 'AUDIO_RESPONSE';
                                
                                return (
                                  <div key={ans.id} className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200 flex flex-col gap-2">
                                    <p className="font-extrabold text-slate-850 text-xs">Câu {idx + 1}: {ans.questionText}</p>
                                    
                                    <div className="p-3 bg-white border border-slate-200/60 rounded-xl mt-1 text-xs">
                                      <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider mb-1">Nội dung bài nộp:</p>
                                      {ans.questionType === 'AUDIO_RESPONSE' ? (
                                        ans.studentAnswer ? (
                                          <audio controls src={ans.studentAnswer} className="mt-1 h-8 w-full" />
                                        ) : (
                                          <p className="text-red-500 italic font-bold">Không nộp ghi âm</p>
                                        )
                                      ) : (
                                        <p className="text-slate-800 font-bold mt-1 pl-1.5 border-l-2 border-emerald-600" dangerouslySetInnerHTML={{ __html: ans.studentAnswer || "(bỏ trống)" }}></p>
                                      )}
                                    </div>

                                    {!isWritten && (
                                      <div className="flex items-center gap-2 mt-2">
                                        {isCorrectMC ? (
                                          <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                            🟢 Trả lời chính xác
                                          </span>
                                        ) : (
                                          <span className="text-[10px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                                            🔴 Chưa chính xác (Đáp án đúng: {ans.correctAnswer})
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            <button 
                              onClick={handleExitPractice}
                              className="w-full mt-4 py-3 bg-slate-800 hover:bg-slate-900 text-white font-black rounded-xl text-xs cursor-pointer border-none shadow transition-all"
                            >
                              Quay lại danh sách bài tập
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      // PRACTICE WORKBOOK QUESTION SHEET
                      <form onSubmit={handlePracticeSubmit} className="flex flex-col gap-6 text-left">
                        {/* Instruction text */}
                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs text-slate-600 font-semibold leading-relaxed">
                          📝 <strong>Hướng dẫn:</strong> {activeActivity.instruction || "Hoàn thành các câu hỏi trắc nghiệm, viết hoặc ghi âm nói bên dưới."}
                        </div>

                        {/* Listening component if audio URL exists */}
                        {activeActivity.audioUrl && (
                          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                            <span className="text-[9px] font-black text-emerald-600 bg-white border border-emerald-200 px-2 py-0.5 rounded uppercase shadow-sm">
                              🎧 Audio listening sheet
                            </span>
                            <audio controls src={activeActivity.audioUrl} className="w-full mt-3 h-10" />
                          </div>
                        )}

                        {/* Questions index mapping */}
                        <div className="flex flex-col gap-6">
                          {activeActivity.questions?.map((q, idx) => (
                            <div key={q.id} className="p-5 bg-slate-50/30 rounded-2xl border border-slate-200 flex flex-col gap-3">
                              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                                <span className="w-5 h-5 bg-emerald-600 text-white text-[10px] font-black rounded-full text-center leading-5 shadow-sm">
                                  {idx + 1}
                                </span>
                                <span className="text-xs font-black text-slate-800">Câu hỏi {idx + 1}</span>
                              </div>
                              
                              <p className="text-sm font-extrabold text-slate-850 leading-relaxed mb-1">{q.questionText}</p>

                              {/* MCQ (Auto-grading instant feedback) */}
                              {q.questionType === 'MULTIPLE_CHOICE' && (
                                <div className="flex flex-col gap-2 mt-2">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {q.options?.split('|').map((opt, oIdx) => {
                                      const cleanOpt = opt.trim();
                                      const isSelected = practiceAnswers[q.id] === cleanOpt;
                                      const hasSelectedAny = !!practiceAnswers[q.id];
                                      
                                      let buttonStyle = "border-slate-200 hover:border-slate-350 hover:bg-slate-55 bg-white text-slate-700";
                                      if (hasSelectedAny) {
                                        const isCorrect = cleanOpt === q.correctAnswer;
                                        if (isSelected) {
                                          buttonStyle = isCorrect
                                            ? "border-emerald-500 bg-emerald-50 text-emerald-700 font-extrabold"
                                            : "border-red-500 bg-red-50 text-red-700 font-extrabold";
                                        } else if (isCorrect) {
                                          buttonStyle = "border-emerald-500 bg-emerald-55/40 text-emerald-800 font-bold";
                                        } else {
                                          buttonStyle = "border-slate-100 bg-slate-50/30 text-slate-400 opacity-60";
                                        }
                                      }
                                      
                                      return (
                                        <button
                                          type="button"
                                          key={oIdx}
                                          disabled={hasSelectedAny}
                                          onClick={() => setPracticeAnswers(prev => ({ ...prev, [q.id]: cleanOpt }))}
                                          className={`py-3 px-4 text-left rounded-xl border text-xs font-bold transition-all cursor-pointer ${buttonStyle}`}
                                        >
                                          {cleanOpt}
                                        </button>
                                      );
                                    })}
                                  </div>

                                  {practiceAnswers[q.id] && (
                                    <div className={`p-3.5 rounded-xl border mt-1.5 text-xs ${
                                      practiceAnswers[q.id] === q.correctAnswer
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-250"
                                        : "bg-red-50 text-red-700 border-red-200"
                                    }`}>
                                      <p className="font-extrabold flex items-center gap-1.5">
                                        {practiceAnswers[q.id] === q.correctAnswer ? (
                                          <>🟢 Trả lời chính xác!</>
                                        ) : (
                                          <>🔴 Chưa chính xác (Đáp án đúng: <span className="underline">{q.correctAnswer}</span>)</>
                                        )}
                                      </p>
                                      {q.explanation && (
                                        <p className="text-slate-650 mt-1.5 font-semibold leading-relaxed">{q.explanation}</p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* FILL_IN_THE_BLANK */}
                              {q.questionType === 'FILL_IN_THE_BLANK' && (
                                <input 
                                  type="text"
                                  required
                                  value={practiceAnswers[q.id] || ''}
                                  onChange={(e) => setPracticeAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                                  placeholder="Nhập câu trả lời điền vào..."
                                  className="w-full mt-2 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white font-bold text-slate-800"
                                />
                              )}

                              {/* TEXT_RESPONSE (Writing rich-text editor integration) */}
                              {q.questionType === 'TEXT_RESPONSE' && (
                                <div className="mt-2">
                                  <RichTextEditor 
                                    value={practiceAnswers[q.id] || ''}
                                    onChange={(html) => setPracticeAnswers(prev => ({ ...prev, [q.id]: html }))}
                                    placeholder="Nhập bài viết luận tự luận của bạn tại đây..."
                                    minHeight="160px"
                                    label="Khung soạn thảo bài Writing"
                                  />
                                </div>
                              )}

                              {/* AUDIO_RESPONSE (Speaking recorder wave simulation) */}
                              {q.questionType === 'AUDIO_RESPONSE' && (
                                <div className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-4 mt-2 shadow-sm">
                                  
                                  {isRecording && recordingQId === q.id ? (
                                    <div className="flex flex-col items-center gap-2">
                                      {/* Wave simulation with emerald green styling */}
                                      <div className="sound-wave active">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                      </div>
                                      <span className="text-[10px] font-black text-red-500 uppercase tracking-widest animate-pulse mt-1">
                                        🔴 ĐANG GHI ÂM GIỌNG NÓI ({formatTime(recordingSeconds)})
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col items-center gap-1.5">
                                      <Mic size={24} className="text-emerald-600" />
                                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Speaking Recorder Ready</span>
                                    </div>
                                  )}

                                  {/* Recorder control buttons */}
                                  <div className="flex gap-2">
                                    {isRecording && recordingQId === q.id ? (
                                      <button
                                        type="button"
                                        onClick={stopRecording}
                                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-extrabold rounded-xl text-xs transition-all cursor-pointer border-none shadow-sm active:scale-95"
                                      >
                                        ⏹️ Dừng ghi & Lưu bài
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => startRecording(q.id)}
                                        disabled={isRecording}
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs transition-all cursor-pointer border-none shadow-sm active:scale-95 disabled:opacity-50"
                                      >
                                        🎙️ {localAudioBlobs[q.id] ? "Ghi âm lại bài phát biểu" : "Bắt đầu nói / Ghi âm"}
                                      </button>
                                    )}
                                  </div>

                                  {/* Listen controls of student audio */}
                                  {localAudioUrls[q.id] && !isRecording && (
                                    <div className="w-full border-t border-slate-100 pt-3.5 flex flex-col items-center gap-2 mt-1">
                                      <span className="text-[9px] text-slate-450 font-black uppercase tracking-wider">Nghe lại file ghi âm của bạn:</span>
                                      <audio controls src={localAudioUrls[q.id]} className="w-full h-8" />
                                    </div>
                                  )}
                                </div>
                              )}

                            </div>
                          ))}
                        </div>

                        {/* Submission action CTA */}
                        <button
                          type="submit"
                          disabled={submittingPractice}
                          className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-black rounded-xl text-xs active:scale-[0.98] transition-all border-none disabled:opacity-50 cursor-pointer text-center"
                        >
                          {submittingPractice ? "⏳ Đang tải tệp ghi âm & nộp bài..." : "🚀 Nộp bài thi luyện tập ngay"}
                        </button>
                      </form>
                    )}
                  </div>
                ) : (
                  // SELECT WORKBOOK WELCOME SHEET
                  <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center py-20">
                    <div className="w-20 h-20 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center text-5xl mb-4 text-emerald-600">
                      📚
                    </div>
                    <h4 className="font-extrabold text-slate-800 text-base">Chào mừng tới Không gian lớp học LMS!</h4>
                    <p className="text-xs text-slate-500 mt-2 max-w-sm font-semibold leading-relaxed">
                      Hãy chọn tài liệu học tập hoặc các bài tập rèn luyện (MCQ, Viết luận, Phát âm) từ menu bên trái để bắt đầu bài học.
                    </p>
                  </div>
                )}

              </div>
            </div>
          )}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* TAB 3: THI ĐUA & HUY HIỆU (ACHIEVEMENTS HUB) */}
      {/* ──────────────────────────────────────────────────────── */}
      {activeTab === 'achievements' && gamificationProfile && (
        <div className="animate-fade-in flex flex-col gap-6">
          <div className="bg-gradient-to-br from-emerald-800 via-emerald-950 to-slate-950 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl"></div>
            <div className="relative z-10 text-left">
              <span className="px-3 py-1 bg-yellow-500/25 text-yellow-400 text-[10px] font-extrabold rounded-full uppercase border border-yellow-500/20 tracking-widest">
                🏆 Bảng vàng vinh danh
              </span>
              <h2 className="text-2xl sm:text-3xl font-black mt-4">Đấu Trường Thi Đua & Bảng Vinh Danh</h2>
              <p className="text-emerald-100/70 text-sm mt-1.5 font-medium leading-relaxed max-w-xl">
                Cố gắng làm nhiều bài tập, đạt điểm tối đa từ giáo viên để lọt Top bảng xếp hạng lớp và mở khóa trọn bộ huy hiệu danh giá.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Lớp xếp hạng Leaderboard (chiếm 2/3) */}
            <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4">
              <div className="flex justify-between items-center mb-2 border-b border-slate-100 pb-3 gap-2">
                <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                  <Trophy className="text-emerald-600" size={18} /> Bảng Xếp Hạng Đua Top
                </h3>
                
                {classrooms.length > 1 && (
                  <select
                    value={activeLeaderboardClassId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setActiveLeaderboardClassId(val);
                      fetchLeaderboard(val);
                    }}
                    className="px-3 py-1 rounded-xl border border-slate-200 focus:outline-none text-[11px] text-slate-655 bg-white font-extrabold cursor-pointer max-w-[150px]"
                  >
                    {classrooms.map(c => (
                      <option key={c.id} value={c.id}>{c.className}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex flex-col gap-2.5 max-h-[400px] overflow-y-auto pr-1">
                {leaderboards[activeLeaderboardClassId] && leaderboards[activeLeaderboardClassId].length > 0 ? (
                  leaderboards[activeLeaderboardClassId].map(item => {
                    const isCurrent = item.studentId === user.id;
                    const isTop1 = item.rank === 1;
                    const isTop2 = item.rank === 2;
                    const isTop3 = item.rank === 3;
                    
                    return (
                      <div 
                        key={item.studentId}
                        className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                          isCurrent 
                            ? 'bg-emerald-50/40 border-emerald-300 shadow-sm' 
                            : 'bg-white border-slate-150'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                            isTop1 ? 'bg-yellow-100 text-yellow-750' :
                            isTop2 ? 'bg-slate-100 text-slate-600' :
                            isTop3 ? 'bg-orange-100 text-orange-850' : 'bg-slate-50 text-slate-400'
                          }`}>
                            {isTop1 ? '🏆' : isTop2 ? '🥈' : isTop3 ? '🥉' : item.rank}
                          </span>
                          
                          <div className="text-left">
                            <p className={`text-xs font-black ${isCurrent ? 'text-emerald-700 font-extrabold' : 'text-slate-800'}`}>
                              {item.studentName} {isCurrent && " (Bạn)"}
                            </p>
                            <p className="text-[9px] text-slate-400 font-semibold">
                              Số bài nộp: {item.completedCount} bài làm
                            </p>
                          </div>
                        </div>

                        <div className="text-right flex items-center gap-6">
                          <div className="text-right">
                            <span className="text-xs font-black text-emerald-600 block">
                              {item.totalPoints} XP
                            </span>
                            <span className="text-[9px] text-slate-400 block font-semibold">
                              Điểm TB: {item.averageScore}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-slate-400 text-xs text-center py-12 font-semibold">
                    Chưa có dữ liệu thi đua trong lớp này.
                  </p>
                )}
              </div>
            </div>

            {/* Huy hiệu Badge Grid (chiếm 1/3) */}
            <div className="lg:col-span-1 bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between gap-6">
              <div>
                <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                  <h3 className="text-base font-black text-slate-800 flex items-center gap-1.5">
                    🏅 Huy Hiệu Của Tôi
                  </h3>
                  <span className="text-xs font-black text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                    {gamificationProfile.badges?.filter(b => b.earned).length}/{gamificationProfile.badges?.length} đạt được
                  </span>
                </div>

                {/* Grid (Glowing green border for unlocked badges) */}
                <div className="grid grid-cols-4 gap-3 my-2">
                  {gamificationProfile.badges?.map(b => (
                    <div 
                      key={b.badgeKey} 
                      title={`${b.title}: ${b.description} ${b.earned ? `(Đạt lúc ${new Date(b.earnedAt).toLocaleDateString('vi-VN')})` : '(Chưa đạt)'}`}
                      className={`flex flex-col items-center group relative cursor-help p-2 rounded-2xl transition-all ${
                        b.earned 
                          ? 'bg-white border border-emerald-200 shadow-sm scale-100 hover:scale-105 shadow-[0_0_15px_rgba(5,150,105,0.15)]' 
                          : 'bg-slate-100/40 border border-transparent opacity-30 grayscale scale-95'
                      }`}
                    >
                      <span className={`text-2xl ${b.earned ? 'drop-shadow-sm' : ''}`}>{b.icon}</span>
                      <span className="text-[8px] font-black text-slate-500 mt-1.5 truncate max-w-full text-center">
                        {b.title}
                      </span>
                      
                      {/* Interactive hover tooltips */}
                      <div className="absolute bottom-full mb-2.5 hidden group-hover:block w-44 p-3 bg-slate-900 text-white text-[10px] font-semibold rounded-xl shadow-xl z-20 leading-relaxed text-center">
                        <p className="text-yellow-400 font-extrabold">{b.title}</p>
                        <p className="mt-1 text-slate-300 font-medium text-[9px]">{b.description}</p>
                        {b.earned && (
                          <p className="mt-2 text-emerald-400 text-[8px] font-black">✓ Ngày đạt: {new Date(b.earnedAt).toLocaleDateString('vi-VN')}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <p className="text-[9.5px] text-slate-450 font-bold italic leading-relaxed text-center border-t border-slate-100 pt-3">
                💡 *Mẹo: Nộp đầy đủ bài làm LMS đúng hạn để tích luỹ EXP mở khoá toàn bộ huy hiệu!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* TAB 4: THANH TOÁN HỌC PHÍ (TUITION HUB) */}
      {/* ──────────────────────────────────────────────────────── */}
      {activeTab === 'tuition' && (
        <div className="animate-fade-in flex flex-col gap-6">
          <div className="bg-gradient-to-br from-emerald-800 via-emerald-950 to-slate-950 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl"></div>
            <div className="relative z-10 text-left">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold rounded-full uppercase border border-emerald-500/10 tracking-widest">
                💳 HỌC PHÍ TRỰC TUYẾN
              </span>
              <h2 className="text-2xl sm:text-3xl font-black mt-4">Học Phí & Cổng Thanh Toán</h2>
              <p className="text-emerald-100/70 text-sm mt-1.5 font-medium leading-relaxed max-w-xl">
                Kiểm tra thông tin biểu phí lớp học, lựa chọn phương thức giao dịch tiện lợi và nhận hóa đơn thanh toán chính thức tự động.
              </p>
            </div>
          </div>

          {grades.length === 0 ? (
            <div className="py-12 bg-white rounded-3xl border border-slate-100 shadow-sm text-center text-slate-450 italic font-semibold">
              Không có lớp học nào cần thanh toán học phí.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* CỘT DANH SÁCH INVOICES & CHỌN GATEWAY (CHIẾM 2 PHẦN) */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                {grades.map(g => {
                  const payment = studentPayments.find(p => p.enrollmentId === g.enrollmentId);
                  const isPaid = payment?.status === 'PAID';
                  const isPendingApproval = payment?.status === 'PENDING_APPROVAL';
                  const isPending = payment?.status === 'PENDING';
                  const activeGateways = paymentConfigs.filter(cfg => cfg.isActive);
                  const defaultMethod = activeGateways.length > 0 ? activeGateways[0].gatewayKey : 'VNPAY';
                  const selectedMethod = selectedPaymentMethods[g.enrollmentId] || defaultMethod;
                  const bankInfo = showBankTransferInfo[g.enrollmentId] !== false && (showBankTransferInfo[g.enrollmentId] || (payment?.method === 'BANK_TRANSFER' ? payment : null));

                  return (
                    <div key={g.classId} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4 text-left">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-extrabold text-xs text-slate-800">Lớp: {g.className} ({g.semester})</p>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{g.courseTitle}</p>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded text-[9px] font-black border uppercase ${
                          isPaid 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : isPendingApproval
                              ? 'bg-yellow-50 text-yellow-600 border-yellow-250 animate-pulse'
                              : isPending
                                ? 'bg-orange-50 text-orange-600 border-orange-200'
                                : 'bg-red-50 text-red-650 border-red-200'
                        }`}>
                          {isPaid ? 'Đã đóng học phí ✓' : isPendingApproval ? 'Chờ phê duyệt ⏳' : isPending ? 'Chờ thanh toán' : 'Chưa đóng học phí'}
                        </span>
                      </div>

                      {/* Timeline graphical representation */}
                      {renderTuitionTimeline(payment)}

                      <div className="flex justify-between items-center text-xs border-t border-slate-100 pt-3">
                        <span className="text-slate-500 font-bold">Mức học phí:</span>
                        <span className="font-black text-emerald-600 text-sm">{formatVND(g.tuitionFee)}</span>
                      </div>

                      {/* Display control invoice actions */}
                      {isPaid ? (
                        <div className="flex justify-between items-center gap-3 mt-1 pt-3 border-t border-slate-100">
                          <span className="text-[9.5px] text-slate-400 font-semibold italic">Đã nộp ngày {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString('vi-VN') : 'gần đây'} qua {payment.method}</span>
                          <a 
                            href={`http://localhost:8080${payment.invoiceUrl}`}
                            target="_blank" 
                            rel="noreferrer"
                            className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-lg text-[10px] font-black transition-all"
                          >
                            📄 Hóa Đơn VAT
                          </a>
                        </div>
                      ) : isPendingApproval ? (
                        <div className="p-3 bg-yellow-50/40 border border-yellow-200 rounded-2xl">
                          <p className="text-[10px] text-slate-655 font-bold leading-relaxed">
                            ⏳ <strong>Hệ thống đang đối soát ngân hàng:</strong> Giao dịch qua {payment.method} đang chờ duyệt. Mã đơn: <code>{payment.orderId}</code>.
                          </p>
                          <p className="text-[8.5px] text-slate-400 font-medium italic mt-1">
                            * Hóa đơn điện tử VAT sẽ xuất hiện ngay sau khi Manager trung tâm phê duyệt khoản đối soát.
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3 mt-1 pt-3 border-t border-slate-100">
                          {!bankInfo && (
                            <div className="flex items-center gap-3">
                              <select
                                value={selectedMethod}
                                onChange={(e) => setSelectedPaymentMethods(prev => ({ ...prev, [g.enrollmentId]: e.target.value }))}
                                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none text-[11px] text-slate-655 bg-white font-bold cursor-pointer"
                              >
                                {paymentConfigs.length > 0 ? (
                                  paymentConfigs.filter(cfg => cfg.isActive).map(cfg => (
                                    <option key={cfg.gatewayKey} value={cfg.gatewayKey}>
                                      {cfg.gatewayName} {cfg.gatewayKey !== 'BANK_TRANSFER' ? '(Cổng QR)' : ''}
                                    </option>
                                  ))
                                ) : (
                                  <>
                                    <option value="VNPAY">VNPay (Thử nghiệm QR)</option>
                                    <option value="MOMO">Ví MoMo (Thử nghiệm QR)</option>
                                    <option value="ZALOPAY">ZaloPay (Thử nghiệm QR)</option>
                                    <option value="BANK_TRANSFER">Chuyển khoản Ngân hàng (Techcombank)</option>
                                  </>
                                )}
                              </select>
                              
                              <button
                                onClick={() => handlePayTuition(g.enrollmentId, g.tuitionFee, selectedMethod)}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-[11px] shadow-sm transition-all cursor-pointer border-none"
                              >
                                Thanh toán trực tuyến
                              </button>
                            </div>
                          )}

                          {/* Render dynamic bank QR instruction if selected */}
                          {bankInfo && (
                            <div className="p-4 bg-emerald-50/30 border border-emerald-200 rounded-2xl flex flex-col gap-3">
                              <div className="flex justify-between items-center text-[9.5px] text-emerald-800 font-black border-b border-emerald-150 pb-2">
                                <span>🏦 THÔNG TIN CHUYỂN KHOẢN CÔNG TY</span>
                                <button 
                                  type="button"
                                  onClick={() => {
                                    setShowBankTransferInfo(prev => ({ ...prev, [g.enrollmentId]: false }));
                                  }}
                                  className="text-red-500 hover:text-red-700 font-extrabold bg-none border-none cursor-pointer text-xs"
                                >
                                  Đóng lại
                                </button>
                              </div>
                              
                              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                                <div className="flex-1 text-[11px] text-slate-700 flex flex-col gap-1.5 text-left w-full">
                                  {(() => {
                                    const bankCfg = paymentConfigs.find(c => c.gatewayKey === 'BANK_TRANSFER') || {
                                      gatewayName: 'Techcombank',
                                      accountNumber: '1903456789012',
                                      accountName: 'EduEnglish Center'
                                    };
                                    return (
                                      <>
                                        <p>Ngân hàng: <strong>{bankCfg.gatewayName}</strong></p>
                                        <p>Số tài khoản: <strong>{bankCfg.accountNumber}</strong></p>
                                        <p>Chủ tài khoản: <strong>{bankCfg.accountName}</strong></p>
                                      </>
                                    );
                                  })()}
                                  <p>Số tiền: <strong className="text-emerald-700">{formatVND(bankInfo.amount)}</strong></p>
                                  
                                  <div className="mt-1 flex flex-col gap-1">
                                    <span className="text-[9px] text-slate-450 uppercase font-black tracking-wider">Cú Pháp Chuyển Khoản:</span>
                                    <div className="bg-white border border-emerald-150 rounded px-2.5 py-1.5 flex items-center justify-between font-black text-xs text-emerald-700">
                                      <span>{bankInfo.transferSyntax}</span>
                                      <button 
                                        type="button"
                                        onClick={() => {
                                          navigator.clipboard.writeText(bankInfo.transferSyntax);
                                          alert('Đã sao chép cú pháp chuyển khoản!');
                                        }}
                                        className="text-[9px] text-emerald-600 border border-emerald-250 px-1.5 py-0.5 rounded hover:bg-slate-50 cursor-pointer font-bold"
                                      >
                                        Sao chép
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                {/* Dynamic generated Bank QR (prefilled amount & reference details) */}
                                <div className="w-32 h-32 flex flex-col items-center justify-center p-1.5 bg-white border border-slate-200 rounded-xl shadow-inner shrink-0">
                                  <img 
                                    src={getBankQRCode(bankInfo)} 
                                    alt="Mã QR Chuyển khoản" 
                                    className="w-full h-full object-contain rounded-lg"
                                  />
                                </div>
                              </div>
                              
                              <p className="text-[8.5px] text-slate-450 font-bold italic mt-1 leading-relaxed border-t border-emerald-100/50 pt-2 text-left">
                                * Lưu ý: Hãy chuyển khoản đúng thông tin tài khoản và chính xác cú pháp giao dịch. Chúng tôi sẽ kiểm tra và cập nhật hóa đơn của bạn trong vòng 24h.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* BẢNG ĐIỂM THI THỬ VÀ ĐIỂM LỚP HỌC (CHIẾM 1 PHẦN) */}
              <div className="lg:col-span-1 bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4 text-left">
                <h3 className="text-base font-black text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-1.5">
                  📊 Điểm Học Tập & Thi Thử
                </h3>
                
                <div className="flex flex-col gap-3">
                  {grades.map(g => (
                    <div key={g.classId} className="flex justify-between items-center p-3.5 bg-slate-50/50 rounded-2xl border border-slate-150">
                      <div>
                        <p className="font-extrabold text-xs text-slate-800">Lớp: {g.className}</p>
                        <p className="text-[9px] text-slate-400 font-semibold mt-0.5">{g.courseTitle}</p>
                      </div>
                      
                      {g.grade !== null ? (
                        <span className="px-2.5 py-1 text-xs font-black rounded-xl border bg-emerald-50 text-emerald-700 border-emerald-250 shadow-sm">
                          {g.grade} / 10
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-[10px] font-semibold rounded-xl border bg-slate-50 text-slate-400 border-slate-200">
                          Chưa chấm
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>
      )}

    </div>
  );
}

export default StudentDashboard;
