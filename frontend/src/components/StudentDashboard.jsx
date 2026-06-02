import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

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

function StudentDashboard({ user }) {
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
      // Fetch progress for each classroom
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
      
      // Cập nhật bảng xếp hạng
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
      
      // Refresh payments list
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
      return activeConfig.qrUrl; // Option A: Static uploaded QR template image
    }
    // Dynamic QR generation
    const bankName = activeConfig.gatewayName || 'Techcombank';
    const acctNum = activeConfig.accountNumber || '1903456789012';
    const text = encodeURIComponent(
      `BANK: ${bankName} - ACCT: ${acctNum} - AMOUNT: ${bankPayment.amount} - SYNTAX: ${bankPayment.transferSyntax}`
    );
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${text}`;
  };

  // --- NEW LMS FUNCTIONS ---
  const handleEnterClassroom = (cls) => {
    setActiveClassroom(cls);
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

  // Recording system
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

      // 1. Upload files for SPEAKING (AUDIO_RESPONSE) questions
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

      // 2. Submit Answers
      const res = await axios.post(`http://localhost:8080/api/lms/activities/${activeActivity.id}/submissions`, payload);
      setPracticeResult(res.data);
      
      // Update data lists
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
        style: 'bg-orange-50 text-orange-600 border-orange-200 animate-pulse',
        submission: sub 
      };
    }

    if (!sub.isGraded) {
      return { 
        status: 'PENDING_GRADE', 
        text: 'Đang chờ chấm', 
        style: 'bg-red-50 text-red-500 border-red-200 animate-pulse',
        submission: sub 
      };
    }

    return { 
      status: 'GRADED', 
      text: `Điểm số: ${sub.score}/10`, 
      style: 'bg-green-50 text-green-700 border-green-200 font-extrabold',
      submission: sub 
    };
  };

  const formatTime = (seconds) => {
    const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
    const ss = String(seconds % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  };

  // ----------------------------------------------------
  // ORIGINAL PLACEMENT TEST FUNCTIONS
  // ----------------------------------------------------
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

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      
      {/* 1. MÀN HÌNH KHÔNG GIAN LỚP HỌC (CLASSROOM VIEW) */}
      {activeClassroom ? (
        <div className="flex flex-col gap-6 animate-slide-up">
          
          {/* Style dynamic wave animation */}
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
              background-color: #f97316;
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

          {/* Practice Panel Modal/Area */}
          {activeActivity ? (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xl flex flex-col gap-6 animate-fade-in">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div>
                  <span className="px-2.5 py-0.5 rounded bg-orange-50 border border-orange-100 text-orange-500 text-[10px] font-black uppercase">
                    {activeActivity.type} • {activeActivity.skill}
                  </span>
                  <h3 className="text-xl font-black text-slate-800 mt-1">{activeActivity.title}</h3>
                </div>
                <button 
                  onClick={handleExitPractice}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs transition-all cursor-pointer border-none"
                >
                  ◀ Thoát
                </button>
              </div>

              {/* MÀN HÌNH BÁO KẾT QUẢ NGAY LẬP TỨC (PRACTICE RESULTS SCREEN) */}
              {practiceResult ? (
                <div className="flex flex-col gap-6 animate-fade-in">
                  
                  {/* Test type awaiting grade or result summary */}
                  {activeActivity.type === 'TEST' && !activeActivity.isResultsReleased ? (
                    <div className="text-center p-8 bg-slate-50 rounded-2xl border border-slate-200 max-w-md mx-auto flex flex-col items-center">
                      <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center text-4xl mb-4">🎉</div>
                      <h4 className="font-extrabold text-slate-800 text-base">Nộp bài kiểm tra thành công!</h4>
                      <p className="text-xs text-slate-500 mt-2 font-medium leading-relaxed">
                        Hãy đợi Giáo viên chấm điểm và công bố kết quả. Kết quả chi tiết sẽ xuất hiện ngay sau khi được công bố.
                      </p>
                      <button 
                        onClick={handleExitPractice}
                        className="mt-6 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition-all cursor-pointer border-none"
                      >
                        Quay lại lớp học
                      </button>
                    </div>
                  ) : (
                    // ASSIGNMENT RESULT OR RELEASED TEST RESULT
                    <div className="flex flex-col gap-6">
                      <div className="bg-gradient-to-r from-orange-50 to-orange-100/50 border border-orange-200 rounded-2xl p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div>
                          <h4 className="font-extrabold text-slate-800 text-sm">🎉 Kết quả làm bài thi của bạn</h4>
                          <p className="text-xs text-slate-500 mt-1 font-semibold">Cám ơn sự cố gắng ôn luyện của bạn!</p>
                        </div>
                        <div className="text-right">
                          <span className="px-4 py-2 bg-orange-500 text-white rounded-xl text-lg font-black shadow-sm">
                            {practiceResult.score !== null ? `${practiceResult.score} / 10 điểm` : "Đang chờ chấm"}
                          </span>
                        </div>
                      </div>

                      {/* Teacher's feedback */}
                      {practiceResult.teacherFeedback && (
                        <div className="p-4 bg-orange-50/50 border border-orange-200 rounded-2xl">
                          <p className="text-xs font-black text-orange-600">💬 NHẬN XÉT CỦA GIÁO VIÊN:</p>
                          <p className="text-xs text-slate-700 mt-1 font-medium italic">{practiceResult.teacherFeedback}</p>
                        </div>
                      )}

                      {/* Question by question feedback */}
                      <div className="flex flex-col gap-4">
                        <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Xem lại bài làm:</h5>
                        {practiceResult.answers?.map((ans, idx) => {
                          const isCorrectMC = ans.correctAnswer && ans.studentAnswer && ans.studentAnswer.trim().toLowerCase() === ans.correctAnswer.trim().toLowerCase();
                          const isWritten = ans.questionType === 'TEXT_RESPONSE' || ans.questionType === 'AUDIO_RESPONSE';
                          
                          return (
                            <div key={ans.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-150 flex flex-col gap-2">
                              <p className="font-extrabold text-slate-800 text-xs">Câu {idx + 1}: {ans.questionText}</p>
                              
                              <div className="p-3 bg-white border border-slate-200/60 rounded-xl mt-1 text-xs">
                                <p className="text-slate-500 font-semibold uppercase text-[9px] tracking-wider">Bài làm của bạn:</p>
                                {ans.questionType === 'AUDIO_RESPONSE' ? (
                                  ans.studentAnswer ? (
                                    <audio controls src={ans.studentAnswer} className="mt-1 h-8 w-full" />
                                  ) : (
                                    <p className="text-red-500 italic font-bold">Không nộp ghi âm</p>
                                  )
                                ) : (
                                  <p className="text-slate-800 font-bold mt-1 pl-1.5 border-l-2 border-orange-500">{ans.studentAnswer || "(bỏ trống)"}</p>
                                )}
                              </div>

                              {!isWritten && (
                                <div className="flex items-center gap-2 mt-2">
                                  {isCorrectMC ? (
                                    <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                                      🟢 Chính xác
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
                        className="w-full mt-4 py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs cursor-pointer border-none shadow transition-all"
                      >
                        Quay lại lớp học
                      </button>
                    </div>
                  )}

                </div>
              ) : (
                // PRACTICE SHEET FORM
                <form onSubmit={handlePracticeSubmit} className="flex flex-col gap-6">
                  {/* Instructions */}
                  <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl text-xs text-slate-600 font-semibold leading-relaxed">
                    📝 <strong>Hướng dẫn:</strong> {activeActivity.instruction || "Học viên hoàn thành các câu hỏi bên dưới."}
                  </div>

                  {/* Audio Player if Listening */}
                  {activeActivity.audioUrl && (
                    <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl">
                      <span className="text-[9px] font-black text-orange-500 bg-white border border-orange-200 px-2 py-0.5 rounded uppercase">🎧 Audio Player</span>
                      <audio controls src={activeActivity.audioUrl} className="w-full mt-3 h-10" />
                    </div>
                  )}

                  {/* Questions List */}
                  <div className="flex flex-col gap-6">
                    {activeActivity.questions?.map((q, idx) => (
                      <div key={q.id} className="p-5 bg-slate-50/50 rounded-2xl border border-slate-200/80 flex flex-col gap-3">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                          <span className="w-5 h-5 bg-orange-500 text-white text-[10px] font-black rounded-full text-center leading-5 shadow-sm">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-black text-slate-800">Câu hỏi {idx + 1}</span>
                        </div>
                        <p className="text-sm font-extrabold text-slate-800 leading-relaxed mb-1">{q.questionText}</p>

                        {/* RENDER INPUTS BASED ON QUESTION TYPE */}
                        
                        {/* 1. MULTIPLE_CHOICE */}
                        {q.questionType === 'MULTIPLE_CHOICE' && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                            {q.options?.split('|').map((opt, oIdx) => {
                              const cleanOpt = opt.trim();
                              const isSelected = practiceAnswers[q.id] === cleanOpt;
                              return (
                                <button
                                  type="button"
                                  key={oIdx}
                                  onClick={() => setPracticeAnswers(prev => ({ ...prev, [q.id]: cleanOpt }))}
                                  className={`py-3 px-4 text-left rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                    isSelected 
                                      ? 'border-orange-500 bg-orange-50/20 text-orange-600 shadow shadow-orange-500/5'
                                      : 'border-slate-200 hover:border-slate-350 hover:bg-slate-50/50 bg-white'
                                  }`}
                                >
                                  {cleanOpt}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* 2. FILL_IN_THE_BLANK */}
                        {q.questionType === 'FILL_IN_THE_BLANK' && (
                          <input 
                            type="text"
                            required
                            value={practiceAnswers[q.id] || ''}
                            onChange={(e) => setPracticeAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                            placeholder="Nhập câu trả lời điền vào..."
                            className="w-full mt-2 px-3 py-2 text-xs border border-slate-250 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white font-bold"
                          />
                        )}

                        {/* 3. TEXT_RESPONSE */}
                        {q.questionType === 'TEXT_RESPONSE' && (
                          <textarea 
                            required
                            rows="4"
                            value={practiceAnswers[q.id] || ''}
                            onChange={(e) => setPracticeAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                            placeholder="Nhập bài viết luận của bạn tại đây..."
                            className="w-full mt-2 px-3 py-2 text-xs border border-slate-250 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
                          ></textarea>
                        )}

                        {/* 4. AUDIO_RESPONSE (Speaking Recorder) */}
                        {q.questionType === 'AUDIO_RESPONSE' && (
                          <div className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-3.5 mt-2 shadow-sm">
                            
                            {/* Visual Wave and state info */}
                            {isRecording && recordingQId === q.id ? (
                              <div className="flex flex-col items-center gap-2">
                                <div className="sound-wave active">
                                  <span></span>
                                  <span></span>
                                  <span></span>
                                  <span></span>
                                  <span></span>
                                  <span></span>
                                </div>
                                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest animate-pulse">
                                  🔴 Đang ghi âm ({formatTime(recordingSeconds)})
                                </span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-3xl text-orange-500">🎙️</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Speaking micro recorder</span>
                              </div>
                            )}

                            {/* Buttons */}
                            <div className="flex gap-2">
                              {isRecording && recordingQId === q.id ? (
                                <button
                                  type="button"
                                  onClick={stopRecording}
                                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-xs transition-all cursor-pointer border-none shadow shadow-red-500/10"
                                >
                                  ⏹️ Dừng & Lưu
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => startRecording(q.id)}
                                  disabled={isRecording}
                                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition-all cursor-pointer border-none shadow shadow-orange-500/10 disabled:opacity-50"
                                >
                                  🎙️ {localAudioBlobs[q.id] ? "Ghi âm lại" : "Bắt đầu nói"}
                                </button>
                              )}
                            </div>

                            {/* Playback of student voice */}
                            {localAudioUrls[q.id] && !isRecording && (
                              <div className="w-full border-t border-slate-100 pt-3 flex flex-col items-center gap-2 mt-1">
                                <span className="text-[9px] text-slate-400 font-bold uppercase">Nghe lại giọng ghi âm của bạn:</span>
                                <audio controls src={localAudioUrls[q.id]} className="w-full h-8" />
                              </div>
                            )}
                          </div>
                        )}

                      </div>
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={submittingPractice}
                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl text-xs active:scale-[0.98] shadow shadow-orange-500/10 transition-all border-none disabled:opacity-55"
                  >
                    {submittingPractice ? "⏳ Đang tải file ghi âm & nộp bài..." : "🚀 Nộp bài thi làm của bạn"}
                  </button>
                </form>
              )}

            </div>
          ) : (
            // NORMAL CLASSROOM VIEW SHEETS
            <div className="flex flex-col gap-6">
              {/* Classroom header banner */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-orange-950 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl"></div>
                <div className="relative z-10">
                  <span className="px-3 py-1 bg-orange-500/20 text-orange-400 text-[10px] font-bold rounded-full uppercase border border-orange-500/10 tracking-widest">
                    🏫 CLASSROOM WORKSPACE
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black mt-3">{activeClassroom.className}</h2>
                  <p className="text-slate-400 text-xs mt-1.5 font-bold uppercase">
                    👨‍🏫 Giáo viên phụ trách: {activeClassroom.teacherName}
                  </p>
                  <p className="text-slate-500 text-[11px] font-semibold mt-1">
                    🕒 Lịch học: {activeClassroom.schedule}
                  </p>
                </div>
                <button 
                  onClick={handleExitClassroom}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs transition-all border-none cursor-pointer relative z-10"
                >
                  ◀ Quay lại Portal
                </button>
              </div>

              {/* Sub-tab selectors */}
              <div className="flex border-b border-slate-100 gap-2">
                <button
                  onClick={() => setClassroomTab('materials')}
                  className={`px-4 py-2.5 text-xs font-black transition-all border-b-2 cursor-pointer ${
                    classroomTab === 'materials'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  📚 Tài Liệu Học Tập
                </button>
                <button
                  onClick={() => setClassroomTab('activities')}
                  className={`px-4 py-2.5 text-xs font-black transition-all border-b-2 cursor-pointer ${
                    classroomTab === 'activities'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  📝 Luyện Tập & Kiểm Tra
                </button>
              </div>

              {/* Sub-tab Content Areas */}
              
              {/* TAB 1: TAI LIEU HOC TAP */}
              {classroomTab === 'materials' && (
                <div className="animate-fade-in flex flex-col gap-4">
                  {loadingClassroomData ? (
                    <div className="py-12 text-center text-xs text-slate-400 font-semibold">Đang tải tài liệu giảng dạy...</div>
                  ) : classroomMaterials.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400 italic bg-white rounded-2xl border border-slate-100">Lớp học này chưa đăng tài liệu học tập nào.</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {classroomMaterials.map(mat => (
                        <div key={mat.id} className="p-5 rounded-2xl bg-white border border-slate-150 flex flex-col justify-between gap-4 hover:shadow hover:border-slate-300 transition-all">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[9px] px-2 py-0.5 rounded font-black border uppercase ${
                                mat.type === 'FILE' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-green-50 text-green-600 border-green-100'
                              }`}>
                                {mat.type}
                              </span>
                              <h5 className="font-extrabold text-slate-800 text-xs">{mat.title}</h5>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-2 font-medium leading-relaxed">{mat.description || "Không có mô tả chi tiết."}</p>
                          </div>
                          <a 
                            href={mat.fileUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl text-center text-xs transition-all shadow-sm"
                          >
                            {mat.type === 'FILE' ? "📥 Mở / Tải tài liệu" : "🔗 Mở liên kết học tập"}
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: LUYEN TAP & KIEM TRA */}
              {classroomTab === 'activities' && (
                <div className="animate-fade-in flex flex-col gap-4">
                  {loadingClassroomData ? (
                    <div className="py-12 text-center text-xs text-slate-400 font-semibold">Đang tải bài tập lớp học...</div>
                  ) : classroomActivities.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400 italic bg-white rounded-2xl border border-slate-100">Hiện lớp chưa có bài tập rèn luyện nào.</div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {classroomActivities.map(act => {
                        const { status, text, style, submission } = getSubmissionStatus(act);
                        
                        return (
                          <div key={act.id} className="p-5 bg-white rounded-2xl border border-slate-150 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:shadow hover:border-slate-350 transition-all">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`text-[9px] px-2 py-0.5 rounded font-black border uppercase ${
                                  act.type === 'TEST' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                                }`}>
                                  {act.type}
                                </span>
                                <span className="text-[9px] px-2 py-0.5 rounded font-black border uppercase bg-slate-50 border-slate-200">
                                  {act.skill}
                                </span>
                                <h5 className="font-extrabold text-slate-800 text-xs">{act.title}</h5>
                              </div>
                              <p className="text-[10px] text-slate-400 font-bold mt-2.5 uppercase tracking-wider">
                                📅 Đăng: {new Date(act.createdAt).toLocaleDateString()} • {act.questions?.length || 0} Câu hỏi
                              </p>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border uppercase ${style}`}>
                                {text}
                              </span>

                              {status === 'NOT_STARTED' && (
                                <button
                                  onClick={() => handleOpenPractice(act)}
                                  className="px-4 py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-lg text-xs cursor-pointer border-none shadow transition-all active:scale-95"
                                >
                                  📝 Làm bài
                                </button>
                              )}

                              {status !== 'NOT_STARTED' && (
                                <div className="flex gap-2">
                                  {status === 'GRADED' && (
                                    <button
                                      onClick={() => handleOpenResults(act, submission)}
                                      className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-black rounded-lg text-xs cursor-pointer border-none shadow transition-all active:scale-95"
                                    >
                                      🔍 Xem kết quả
                                    </button>
                                  )}
                                  <button
                                    onClick={() => {
                                      if (window.confirm('⚠️ Bạn có chắc chắn muốn làm lại bài tập này không? Kết quả bài làm trước sẽ bị ghi đè.')) {
                                        handleOpenPractice(act);
                                      }
                                    }}
                                    className="px-4 py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-lg text-xs cursor-pointer border-none shadow transition-all active:scale-95"
                                  >
                                    🔄 Làm lại
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

        </div>
      ) : (
        
        // 2. MÀN HÌNH DASHBOARD TRANG CHỦ HỌC VIÊN CƠ BẢN (ORIGINAL VIEW)
        <div>
          
          {/* BANNER CHÀO MỪNG */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-orange-950 rounded-3xl p-6 sm:p-8 text-white mb-8 border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <span className="px-3 py-1 bg-orange-500/20 text-orange-400 text-[10px] font-bold rounded-full uppercase border border-orange-500/10 tracking-widest animate-pulse">
                🎓 Student Portal Active
              </span>
              <h2 className="text-2xl sm:text-3xl font-black mt-4">Chào mừng học viên, {user.fullName}!</h2>
              <p className="text-slate-400 text-sm mt-1.5 font-medium leading-relaxed max-w-xl">
                Cổng thông tin giúp học viên theo dõi lịch học lớp đăng ký, bảng điểm chấm từ giáo viên và trực tiếp thi thử đầu vào trực tuyến miễn phí.
              </p>
            </div>
          </div>

          {!testMode ? (
            <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* CỘT LỚP HỌC & LỊCH HỌC (CHIẾM 2 PHẦN) */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                
                {/* LỊCH HỌC HÀNG TUẦN */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <h3 className="text-base font-black text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-1.5">
                    📅 Lớp Học Đang Tham Gia ({classrooms.length})
                  </h3>

                  {loading ? (
                    <div className="py-10 text-center flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-3 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs text-slate-400 font-semibold">Đang lấy lịch học...</span>
                    </div>
                  ) : classrooms.length === 0 ? (
                    <div className="py-10 text-center text-slate-400 text-xs font-semibold">
                      Bạn chưa đăng ký lớp học nào. Hãy đăng ký tư vấn để được xếp lớp!
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {classrooms.map(cls => (
                        <div key={cls.id} className="p-4 bg-slate-50/50 rounded-xl border border-slate-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex-1">
                            <p className="font-extrabold text-sm text-slate-800">{cls.className}</p>
                            <span className="inline-block text-[9px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded mt-1">
                              {cls.courseTitle}
                            </span>
                            <p className="text-[10px] text-slate-400 font-bold mt-2">
                              👨‍🏫 Giáo viên dạy: <strong className="text-slate-600">{cls.teacherName}</strong>
                            </p>

                            {/* Thanh tiến trình học tập */}
                            {classroomProgress[cls.id] && (
                              <div className="mt-3.5 max-w-sm text-left">
                                <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 mb-1">
                                  <span>Tiến độ học tập:</span>
                                  <span className="text-orange-655 font-black">
                                    {classroomProgress[cls.id].completedActivities}/{classroomProgress[cls.id].totalActivities} bài làm ({classroomProgress[cls.id].progressPercentage}%)
                                  </span>
                                </div>
                                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner border border-slate-200/40">
                                  <div 
                                    className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-500"
                                    style={{ width: `${classroomProgress[cls.id].progressPercentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="sm:text-right flex sm:flex-col items-end gap-2.5">
                            <span className="inline-block text-[10px] font-bold text-slate-500 bg-white border border-slate-200 py-1 px-3 rounded-lg shadow-sm">
                              🕒 Lịch: {cls.schedule}
                            </span>
                            <button
                              onClick={() => handleEnterClassroom(cls)}
                              className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold rounded-lg text-xs transition-all shadow shadow-orange-500/10 cursor-pointer border-none"
                            >
                              📖 Vào Lớp Học
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* THANH TOÁN HỌC PHÍ & HÓA ĐƠN */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm animate-fade-in">
                  <h3 className="text-base font-black text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-1.5">
                    💳 Học Phí & Hóa Đơn Lớp Học
                  </h3>

                  {loading ? (
                    <div className="py-10 text-center text-slate-400 text-xs font-semibold">Đang nạp tình trạng học phí...</div>
                  ) : grades.length === 0 ? (
                    <p className="py-10 text-center text-slate-400 text-xs font-semibold">Bạn chưa có lớp học nào cần nộp học phí.</p>
                  ) : (
                    <div className="flex flex-col gap-5">
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
                          <div key={g.classId} className="p-4 bg-slate-50/55 rounded-2xl border border-slate-150 flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-extrabold text-xs text-slate-800">Lớp: {g.className} ({g.semester})</p>
                                <p className="text-[10px] text-slate-400 font-semibold">{g.courseTitle}</p>
                              </div>
                              <span className={`px-2.5 py-0.5 rounded text-[9px] font-black border uppercase ${
                                isPaid 
                                  ? 'bg-green-50 text-green-700 border-green-200' 
                                  : isPendingApproval
                                    ? 'bg-amber-50 text-amber-600 border-amber-200 animate-pulse'
                                    : isPending
                                      ? 'bg-orange-50 text-orange-600 border-orange-200'
                                      : 'bg-red-50 text-red-600 border-red-200'
                              }`}>
                                {isPaid ? 'Đã đóng' : isPendingApproval ? 'Chờ duyệt ⏳' : isPending ? 'Chờ thanh toán' : 'Chưa nộp'}
                              </span>
                            </div>

                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-500 font-bold">Mức học phí lớp:</span>
                              <span className="font-black text-orange-600">{formatVND(g.tuitionFee)}</span>
                            </div>

                            {/* Actions or instructions */}
                            {isPaid ? (
                              <div className="flex justify-between items-center gap-3 mt-1 border-t border-slate-100 pt-3">
                                <span className="text-[10px] text-slate-400 font-semibold italic">Đã nộp vào {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString('vi-VN') : 'gần đây'} qua {payment.method}</span>
                                <a 
                                  href={`http://localhost:8080${payment.invoiceUrl}`}
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="px-3.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 rounded-lg text-[10px] font-black transition-all"
                                >
                                  📄 Xem Hóa Đơn
                                </a>
                              </div>
                            ) : isPendingApproval ? (
                              <div className="p-3.5 bg-amber-50/40 border border-amber-200 rounded-xl flex flex-col gap-2">
                                <p className="text-[11px] text-slate-755 font-semibold text-left">
                                  ⏳ <strong>Đang chờ phê duyệt:</strong> Giao dịch qua {payment.method} đang chờ duyệt. Mã đơn: <code>{payment.orderId}</code>.
                                </p>
                                <p className="text-[9px] text-slate-400 font-semibold italic text-left">
                                  * Ghi chú: Manager đang đối chiếu với ngân hàng. Hóa đơn sẽ xuất hiện tại đây sau khi được duyệt.
                                </p>
                              </div>
                            ) : (
                              <div className="flex flex-col gap-3 mt-1 border-t border-slate-100 pt-3">
                                {/* Option to choose payment gateway if not transfer instructions */}
                                {!bankInfo && (
                                  <div className="flex items-center gap-3">
                                    <select
                                      value={selectedMethod}
                                      onChange={(e) => setSelectedPaymentMethods(prev => ({ ...prev, [g.enrollmentId]: e.target.value }))}
                                      className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none text-[11px] text-slate-700 bg-white font-bold cursor-pointer"
                                    >
                                      {paymentConfigs.length > 0 ? (
                                        paymentConfigs.filter(cfg => cfg.isActive).map(cfg => (
                                          <option key={cfg.gatewayKey} value={cfg.gatewayKey}>
                                            {cfg.gatewayName} {cfg.gatewayKey !== 'BANK_TRANSFER' ? '(Giả lập QR)' : ''}
                                          </option>
                                        ))
                                      ) : (
                                        <>
                                          <option value="VNPAY">VNPay (Giả lập QR)</option>
                                          <option value="MOMO">Ví MoMo (Giả lập QR)</option>
                                          <option value="ZALOPAY">ZaloPay (Giả lập QR)</option>
                                          <option value="BANK_TRANSFER">Chuyển khoản Ngân hàng (Techcombank)</option>
                                        </>
                                      )}
                                    </select>
                                    
                                    <button
                                      onClick={() => handlePayTuition(g.enrollmentId, g.tuitionFee, selectedMethod)}
                                      className="px-4 py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-lg text-[11px] shadow transition-all cursor-pointer border-none"
                                    >
                                      Nộp Học Phí 💳
                                    </button>
                                  </div>
                                )}

                                {/* If choosing bank transfer and initialized */}
                                {bankInfo && (
                                  <div className="p-4 bg-blue-50/40 border border-blue-200 rounded-2xl flex flex-col gap-3">
                                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold border-b border-blue-100 pb-2">
                                      <span>🏦 THÔNG TIN CHUYỂN KHOẢN CÔNG TY</span>
                                      <button 
                                        type="button"
                                        onClick={() => {
                                          setShowBankTransferInfo(prev => ({ ...prev, [g.enrollmentId]: false }));
                                        }}
                                        className="text-red-500 hover:text-red-700 font-extrabold bg-none border-none cursor-pointer text-xs"
                                      >
                                        Đóng
                                      </button>
                                    </div>
                                    
                                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                                      {/* Left side: Text Details */}
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
                                        <p>Số tiền: <strong className="text-orange-600">{formatVND(bankInfo.amount)}</strong></p>
                                        
                                        <div className="mt-1 flex flex-col gap-1">
                                          <span className="text-[9px] text-slate-450 uppercase font-black tracking-wider">Cú Pháp Chuyển Khoản:</span>
                                          <div className="bg-white border border-blue-150 rounded px-2.5 py-1.5 flex items-center justify-between font-black text-xs text-orange-600">
                                            <span>{bankInfo.transferSyntax}</span>
                                            <button 
                                              type="button"
                                              onClick={() => {
                                                navigator.clipboard.writeText(bankInfo.transferSyntax);
                                                alert('Đã sao chép cú pháp chuyển khoản!');
                                              }}
                                              className="text-[9px] text-blue-500 border border-blue-200 px-1.5 py-0.5 rounded hover:bg-slate-50 cursor-pointer"
                                            >
                                              Sao chép
                                            </button>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Right side: QR Code */}
                                      <div className="w-32 h-32 flex flex-col items-center justify-center p-1.5 bg-white border border-slate-200 rounded-xl shadow-sm">
                                        <img 
                                          src={getBankQRCode(bankInfo)} 
                                          alt="Mã QR Chuyển khoản" 
                                          className="w-full h-full object-contain rounded-lg"
                                        />
                                      </div>
                                    </div>
                                    
                                    <p className="text-[9px] text-slate-450 font-semibold italic mt-1 leading-relaxed text-left border-t border-blue-100/50 pt-2">
                                      * Lưu ý: Hãy chuyển khoản đúng thông tin và cú pháp. Manager sẽ xác minh giao dịch này thủ công trong tài khoản ngân hàng của trung tâm.
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}

                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* BẢNG ĐIỂM HỌC VỤ GIẢ LẬP */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <h3 className="text-base font-black text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-1.5">
                    📊 Bảng Điểm Thi Thử (LMS)
                  </h3>

                  {loading ? (
                    <div className="py-10 text-center text-slate-400 text-xs font-semibold">Đang nạp bảng điểm...</div>
                  ) : grades.length === 0 ? (
                    <p className="py-10 text-center text-slate-400 text-xs font-semibold">Bạn chưa có điểm số nào.</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {grades.map(g => (
                        <div key={g.classId} className="flex justify-between items-center p-3 bg-slate-50/20 rounded-xl border border-slate-100">
                          <div>
                            <p className="font-extrabold text-xs text-slate-800">Lớp: {g.className}</p>
                            <p className="text-[9px] text-slate-400 font-semibold">{g.courseTitle}</p>
                          </div>
                          
                          {g.grade !== null ? (
                            <span className="px-3 py-1 text-xs font-black rounded-lg border bg-green-50 text-green-700 border-green-200">
                              {g.grade} / 10
                            </span>
                          ) : (
                            <span className="px-3 py-1 text-xs font-semibold rounded-lg border bg-slate-50 text-slate-400 border-slate-200">
                              Chưa chấm điểm
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* CỘT THI THỬ PLACEMENT TEST (CHIẾM 1 PHẦN) */}
              <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-3xl border border-slate-155 shadow-sm text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/5 rounded-full blur-lg"></div>
                  
                  <div className="w-14 h-14 bg-orange-50 text-orange-500 flex items-center justify-center text-3xl rounded-2xl mx-auto mb-4 shadow-inner">
                    📝
                  </div>
                  
                  <h3 className="text-lg font-black text-slate-800">Kiểm Tra Trình Độ Đầu Vào</h3>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                    Online Placement Test
                  </p>
                  
                  <p className="text-xs text-slate-500 mt-4 leading-relaxed font-semibold">
                    Bài kiểm tra trắc nghiệm 10 câu hỏi ngữ pháp và từ vựng thông minh giúp bạn tự đánh giá trình độ hiện tại và nhận đề xuất lộ trình khóa học phù hợp nhất!
                  </p>

                  <button 
                    onClick={handleStartTest}
                    className="w-full mt-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-md shadow-orange-500/10 hover:shadow-orange-500/20 active:scale-[0.98] transition-all cursor-pointer border-none text-xs"
                  >
                    📝 Bắt Đầu Làm Bài Test
                  </button>
                </div>
              </div>

            </div>

            {/* 🏆 ĐẤU TRƯỜNG GAMIFICATION & THÀNH TÍCH */}
            {gamificationProfile && (
              <div className="mt-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-150 shadow-sm animate-fade-in text-left">
                <div className="border-b border-slate-100 pb-4 mb-6">
                  <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    🏆 Đấu Trường Gamification & Thành Tích Học Tập
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5 uppercase tracking-wider">
                    Gamification Learning Arena
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* 1. Chuỗi học tập (Streak) */}
                  <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-150 flex flex-col items-center justify-between text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/5 rounded-full blur-lg"></div>
                    
                    <div className="w-full text-left mb-4">
                      <span className="px-2.5 py-0.5 rounded bg-orange-50 border border-orange-100 text-orange-500 text-[10px] font-black uppercase">
                        Chuỗi học tập
                      </span>
                    </div>

                    <div className="my-2 flex flex-col items-center">
                      <div className="text-6xl mb-2 animate-bounce">🔥</div>
                      <span className="text-4xl font-black text-slate-800">
                        {gamificationProfile.currentStreak} Ngày
                      </span>
                      <p className="text-xs text-slate-500 font-bold mt-1">Chuỗi học tập hiện tại</p>
                    </div>

                    <div className="w-full bg-white border border-slate-200/80 rounded-xl p-3 my-4 flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-400">Kỷ lục dài nhất:</span>
                      <span className="text-orange-600 font-black">{gamificationProfile.longestStreak} ngày ⚡</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleCheckin}
                      disabled={checkingIn}
                      className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black rounded-xl shadow-md shadow-orange-500/10 active:scale-[0.98] transition-all cursor-pointer border-none text-xs disabled:opacity-50"
                    >
                      {checkingIn ? "⏳ Đang điểm danh..." : "📅 Điểm Danh Hôm Nay"}
                    </button>
                  </div>

                  {/* 2. Huy hiệu thành tích (Badges) */}
                  <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-150 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-4 border-b border-slate-200/40 pb-2">
                        <span className="px-2.5 py-0.5 rounded bg-orange-50 border border-orange-100 text-orange-500 text-[10px] font-black uppercase">
                          Huy hiệu đã đạt
                        </span>
                        <span className="text-[10px] font-black text-slate-500">
                          {gamificationProfile.badges.filter(b => b.earned).length}/{gamificationProfile.badges.length}
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-3.5 my-2">
                        {gamificationProfile.badges.map(b => (
                          <div 
                            key={b.badgeKey} 
                            title={`${b.title}: ${b.description} ${b.earned ? `(Đạt lúc ${new Date(b.earnedAt).toLocaleDateString('vi-VN')})` : '(Chưa đạt)'}`}
                            className={`flex flex-col items-center group relative cursor-help p-1.5 rounded-xl transition-all ${
                              b.earned 
                                ? 'bg-white border border-amber-200 shadow-sm scale-100' 
                                : 'bg-slate-100/40 border border-transparent opacity-40 grayscale scale-95'
                            }`}
                          >
                            <span className={`text-2xl ${b.earned ? 'drop-shadow' : ''}`}>{b.icon}</span>
                            <span className="text-[7.5px] font-bold text-slate-500 mt-1 truncate max-w-full text-center">
                              {b.title}
                            </span>
                            
                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 hidden group-hover:block w-40 p-2 bg-slate-900 text-white text-[9px] font-bold rounded-lg shadow-xl z-20 leading-relaxed text-center">
                              <p className="text-amber-400">{b.title}</p>
                              <p className="mt-0.5 text-slate-300 font-medium">{b.description}</p>
                              {b.earned && (
                                <p className="mt-1 text-green-400 text-[8px]">✓ Đạt ngày: {new Date(b.earnedAt).toLocaleDateString('vi-VN')}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <p className="text-[9px] text-slate-400 font-semibold italic text-center mt-4">
                      * Mẹo: Nộp đầy đủ bài tập và đạt điểm cao để nhanh chóng mở khóa toàn bộ huy hiệu!
                    </p>
                  </div>

                  {/* 3. Bảng xếp hạng (Leaderboard) */}
                  <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-150 flex flex-col justify-between">
                    <div className="w-full">
                      <div className="flex justify-between items-center mb-4 border-b border-slate-200/40 pb-2 gap-2">
                        <span className="px-2.5 py-0.5 rounded bg-orange-50 border border-orange-100 text-orange-500 text-[10px] font-black uppercase">
                          Bảng xếp hạng lớp
                        </span>
                        
                        {classrooms.length > 1 && (
                          <select
                            value={activeLeaderboardClassId}
                            onChange={(e) => {
                              const val = e.target.value;
                              setActiveLeaderboardClassId(val);
                              fetchLeaderboard(val);
                            }}
                            className="px-2 py-0.5 rounded border border-slate-200 focus:outline-none text-[9px] text-slate-600 bg-white font-bold cursor-pointer max-w-[120px]"
                          >
                            {classrooms.map(c => (
                              <option key={c.id} value={c.id}>{c.className}</option>
                            ))}
                          </select>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 max-h-[190px] overflow-y-auto pr-1">
                        {leaderboards[activeLeaderboardClassId] && leaderboards[activeLeaderboardClassId].length > 0 ? (
                          leaderboards[activeLeaderboardClassId].map(item => {
                            const isCurrent = item.studentId === user.id;
                            const isTop1 = item.rank === 1;
                            const isTop2 = item.rank === 2;
                            const isTop3 = item.rank === 3;
                            
                            return (
                              <div 
                                key={item.studentId}
                                className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
                                  isCurrent 
                                    ? 'bg-orange-50/30 border-orange-300 shadow-sm' 
                                    : 'bg-white border-slate-200/60'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                                    isTop1 ? 'bg-amber-100 text-amber-700' :
                                    isTop2 ? 'bg-slate-200 text-slate-700' :
                                    isTop3 ? 'bg-orange-100 text-orange-850' : 'bg-slate-100 text-slate-500'
                                  }`}>
                                    {isTop1 ? '🥇' : isTop2 ? '🥈' : isTop3 ? '🥉' : item.rank}
                                  </span>
                                  
                                  <div className="text-left">
                                    <p className={`text-[10px] font-bold ${isCurrent ? 'text-orange-700' : 'text-slate-750'}`}>
                                      {item.studentName} {isCurrent && " (Bạn)"}
                                    </p>
                                    <p className="text-[8px] text-slate-400 font-semibold">
                                      Nộp: {item.completedCount} bài làm
                                    </p>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <span className="text-[10px] font-black text-orange-600 block">
                                    {item.totalPoints}đ
                                  </span>
                                  <span className="text-[8px] text-slate-400 block font-semibold">
                                    TB: {item.averageScore}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-slate-400 text-xs text-center py-8 font-semibold">
                            Chưa có dữ liệu thi đua trong lớp này.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            </>
          ) : (
            // GIAO DIỆN BÀI THI PLACEMENT TEST ĐANG DIỄN RA
            <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden animate-slide-up">
              
              <div className="bg-slate-50 py-4 px-6 border-b border-slate-100 flex justify-between items-center shrink-0">
                <span className="text-xs font-black text-slate-500">
                  Câu {currentQIndex + 1} / {placementQuestions.length}
                </span>
                <div className="flex-1 max-w-[200px] h-2 bg-slate-200 rounded-full mx-4 overflow-hidden">
                  <div 
                    className="h-full bg-orange-500 transition-all duration-300"
                    style={{ width: `${((currentQIndex + 1) / placementQuestions.length) * 100}%` }}
                  ></div>
                </div>
                {!testFinished && (
                  <button 
                    onClick={() => setTestMode(false)}
                    className="text-xs font-bold text-red-500 hover:text-red-700 cursor-pointer bg-none border-none"
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
                              ? 'border-orange-500 bg-orange-50/20 text-orange-600 shadow shadow-orange-500/5'
                              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 bg-white'
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
                        className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl shadow cursor-pointer text-xs active:scale-[0.98] transition-all border-none"
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
                    <div className="inline-flex w-16 h-16 bg-orange-50 rounded-full items-center justify-center text-4xl mb-3 shadow-inner">
                      🎉
                    </div>
                    <h3 className="text-xl font-black text-slate-800">Hoàn Thành Bài Kiểm Tra!</h3>
                    <div className="mt-3 inline-block px-4 py-1.5 bg-orange-50 border border-orange-100 text-orange-600 rounded-full font-black text-sm">
                      Đạt điểm: {score} / 10 câu đúng
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 mb-6 text-left">
                    <span className="text-[9px] font-black text-orange-500 bg-orange-100 px-2.5 py-0.5 rounded-full border border-orange-200/50 uppercase tracking-widest">
                      Lộ trình đề xuất
                    </span>
                    <h4 className="text-base font-extrabold text-slate-800 mt-2.5">
                      Khóa học: {getRecommendedLevel().title}
                    </h4>
                    <p className="text-slate-600 text-xs mt-2 leading-relaxed font-semibold">
                      {getRecommendedLevel().desc}
                    </p>
                  </div>

                  {bookingSuccess ? (
                    <div className="p-3 mb-6 bg-green-50 border border-green-200 text-green-600 rounded-xl text-xs font-bold text-center animate-fade-in">
                      ✓ Đã gửi thông tin đăng ký xếp lớp lên hệ thống thành công! Chuyên viên sẽ sớm liên hệ tư vấn.
                    </div>
                  ) : (
                    <button 
                      onClick={handleBookRecommendation}
                      className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg shadow-orange-500/10 cursor-pointer text-xs active:scale-[0.98] transition-all border-none"
                    >
                      📝 Đăng Ký Xếp Lớp Trình Độ Đề Xuất
                    </button>
                  )}

                  <button 
                    onClick={() => setTestMode(false)}
                    className="w-full mt-3 py-3 bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    🏠 Quay Lại Dashboard Cá Nhân
                  </button>

                </div>
              )}

            </div>
          )}

        </div>
      )}

    </div>
  );
}

export default StudentDashboard;
