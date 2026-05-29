import React, { useState, useEffect } from 'react';
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
  const [classrooms, setClassrooms] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  // Danh sách các khóa học thực tế lấy từ Database để gợi ý khớp trình độ thi thử
  const [activeCourses, setActiveCourses] = useState([]);

  // Trạng thái bài thi thử Placement Test
  const [testMode, setTestMode] = useState(false); // Đang làm bài hay không
  const [currentQIndex, setCurrentQIndex] = useState(0); // Câu hỏi hiện tại
  const [userAnswers, setUserAnswers] = useState({}); // Lưu câu trả lời của học viên
  const [testFinished, setTestFinished] = useState(false); // Đã nộp bài
  const [score, setScore] = useState(0); // Điểm số
  const [bookingSuccess, setBookingSuccess] = useState(false); // Lưu đăng ký tự động theo trình độ

  useEffect(() => {
    fetchStudentClasses();
  }, [user]);

  const fetchStudentClasses = async () => {
    try {
      setLoading(true);
      // Lấy lịch học
      const classRes = await axios.get(`http://localhost:8080/api/classrooms/student/${user.id}`);
      setClassrooms(classRes.data);

      // Lấy điểm thi thử của các lớp đã học
      const gradePromises = classRes.data.map(cls => 
        axios.get(`http://localhost:8080/api/classrooms/${cls.id}/students`)
          .then(res => {
            const studentEnrollment = res.data.find(s => s.studentId === user.id);
            return {
              classId: cls.id,
              className: cls.className,
              courseTitle: cls.courseTitle,
              grade: studentEnrollment ? studentEnrollment.grade : null
            };
          })
      );
      const gradesData = await Promise.all(gradePromises);
      setGrades(gradesData);

      // Lấy danh sách khóa học thực tế đang hoạt động từ database để phục vụ gợi ý
      const coursesRes = await axios.get('http://localhost:8080/api/courses');
      setActiveCourses(coursesRes.data);
    } catch (err) {
      console.error("Lỗi lấy thông tin học tập:", err);
    } finally {
      setLoading(false);
    }
  };

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
    
    // Nếu chưa là câu cuối, tự động qua câu tiếp theo sau 300ms
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

  // Đề xuất khóa học DỰA TRÊN CÁC KHÓA HỌC THỰC TẾ TRONG DATABASE CỦA TRUNG TÂM
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

    // 1. Tìm khóa học thực tế tương ứng chính xác với level trong DB
    let matchingCourses = activeCourses.filter(c => c.level === targetLevel);

    // 2. Nếu không có khóa học nào thuộc level này, tìm bất kỳ khóa học nào đang mở trong DB để gợi ý (tránh gợi ý không có thực)
    if (matchingCourses.length === 0 && activeCourses.length > 0) {
      matchingCourses = activeCourses;
    }

    if (matchingCourses.length > 0) {
      // Đề xuất khóa học thực tế tìm thấy trong CSDL
      const course = matchingCourses[0];
      return {
        courseId: course.id,
        title: `${course.title} - [Trình độ đề xuất: ${targetLevel}]`,
        desc: course.description || `Khóa học ${course.title} thực tế đang mở tuyển sinh tại trung tâm, cam kết chất lượng đầu ra.`,
        isReal: true
      };
    } else {
      // Nếu trung tâm chưa có khóa học thực tế nào trong database
      return {
        courseId: null,
        title: `Tư vấn Lộ trình ${levelText}`,
        desc: `Hiện tại trung tâm chưa mở lớp học cụ thể nào thuộc trình độ này trong database. ${genericDesc} Chuyên viên sẽ gọi điện tư vấn và xếp lộ trình cá nhân hóa riêng cho bạn.`,
        isReal: false
      };
    }
  };

  // Đăng ký tư vấn nhanh theo trình độ đề xuất
  const handleBookRecommendation = async () => {
    const recommendation = getRecommendedLevel();
    try {
      const payload = {
        fullName: user.fullName || 'Thạch Anh Tài',
        phoneNumber: '0988888888', // SĐT giả lập vì đây là tài khoản đã có trên hệ thống
        email: user.email || (user.username ? `${user.username}@gmail.com` : 'taideptrai@gmail.com'), // KHẮC PHỤC TRIỆT ĐỂ: Fallback email nếu session cũ không có email
        courseId: recommendation.courseId, // GỬI ĐÚNG ID KHÓA HỌC THỰC TẾ (hoặc null nếu chưa mở lớp)
        notes: `Học viên đã làm bài Placement Test đầu vào đạt ${score}/10 câu đúng. Đề xuất xếp vào trình độ: ${recommendation.title}`
      };
      await axios.post('http://localhost:8080/api/registrations', payload);
      setBookingSuccess(true);
      alert("🎉 Đã gửi đăng ký xếp lớp theo trình độ đề xuất thành công!");
    } catch (err) {
      console.error("Lỗi gửi thông tin xếp lớp:", err);
      alert(err.response?.data?.message || err.response?.data?.error || "Không thể gửi thông tin xếp lớp.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      
      {/* BANNER CHÀO MỪNG HỌC VIÊN */}
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
        // GIAO DIỆN CHÍNH: LỊCH HỌC, BẢNG ĐIỂM VÀ LÀM TEST ĐẦU VÀO
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
                      <div>
                        <p className="font-extrabold text-sm text-slate-800">{cls.className}</p>
                        <span className="inline-block text-[9px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded mt-1">
                          {cls.courseTitle}
                        </span>
                        <p className="text-[10px] text-slate-400 font-bold mt-2">
                          👨‍🏫 Giáo viên dạy: <strong className="text-slate-600">{cls.teacherName}</strong>
                        </p>
                      </div>
                      
                      <div className="sm:text-right">
                        <span className="inline-block text-[10px] font-bold text-slate-500 bg-white border border-slate-200 py-1 px-3 rounded-lg shadow-sm">
                          🕒 Lịch: {cls.schedule}
                        </span>
                      </div>
                    </div>
                  ))}
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
            <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm text-center relative overflow-hidden">
              {/* Trang trí góc */}
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
      ) : (
        // GIAO DIỆN BÀI THI PLACEMENT TEST ĐANG DIỄN RA
        <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden animate-slide-up">
          
          {/* THANH TIẾN ĐỘ LÀM BÀI TRÊN ĐẦU */}
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
            // PHẦN CÂU HỎI VÀ ĐÁP ÁN ĐANG THI
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

              {/* NÚT ĐIỀU HƯỚNG PREV / NEXT */}
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
            // MÀN HÌNH HIỂN THỊ KẾT QUẢ ĐIỂM THI ĐẦU VÀO VÀ ĐỀ XUẤT KHÓA HỌC
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

              {/* KHU VỰC KHUYẾN NGHỊ KHÓA HỌC CỰC KỲ SANG TRỌNG */}
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

              {/* NÚT HÀNH ĐỘNG ĐĂNG KÝ HỌC THEO ĐỀ XUẤT */}
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
  );
}

export default StudentDashboard;
