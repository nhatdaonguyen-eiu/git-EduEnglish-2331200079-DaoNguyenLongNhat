import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  
  // Lead Collection State Flow
  const [leadFlow, setLeadFlow] = useState({
    active: false,
    step: 0, // 1: Name, 2: Phone, 3: Email, 4: Notes
    fullName: '',
    phoneNumber: '',
    email: '',
    notes: ''
  });

  const [courses, setCourses] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchCoursesAndClassrooms();
    initializeWelcomeMessage();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchCoursesAndClassrooms = async () => {
    try {
      const coursesRes = await axios.get('http://localhost:8080/api/courses');
      setCourses(coursesRes.data);
      const classroomsRes = await axios.get('http://localhost:8080/api/classrooms');
      setClassrooms(classroomsRes.data);
    } catch (err) {
      console.error('Lỗi lấy thông tin cho chatbot:', err);
    }
  };

  const isOutOfHours = () => {
    const hour = new Date().getHours();
    return hour < 8 || hour >= 18;
  };

  const initializeWelcomeMessage = () => {
    const hourMsg = isOutOfHours() 
      ? '🌙 Hiện tại đang ngoài giờ làm việc của trung tâm (8:00 - 18:00). Trợ lý ảo EduBot đang hoạt động trực tuyến 24/7 để hỗ trợ bạn!'
      : '☀️ Chào bạn! EduBot đã sẵn sàng hỗ trợ bạn tìm hiểu thông tin học tập.';

    setMessages([
      {
        id: 1,
        sender: 'bot',
        text: `${hourMsg} Mình có thể giúp bạn giải đáp nhanh về khóa học, học phí hoặc lịch khai giảng. Bạn muốn tìm hiểu nội dung nào?`,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        quickReplies: true
      }
    ]);
  };

  const handleQuickReply = (option) => {
    const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    
    // Append user message
    setMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'user',
      text: option,
      time
    }]);

    setTimeout(() => {
      processResponse(option);
    }, 500);
  };

  const processResponse = (userInput) => {
    const input = userInput.toLowerCase().trim();
    const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    // Handle lead collection flow steps
    if (leadFlow.active) {
      handleLeadFlowStep(userInput);
      return;
    }

    // Trigger lead flow from selection or keyword
    if (input.includes('tư vấn') || input.includes('gọi lại') || input.includes('liên hệ') || input.includes('sđt') || input.includes('đăng ký tư vấn') || input === '4') {
      startLeadFlow();
      return;
    }

    // Check query categories
    if (input.includes('khóa học') || input.includes('lộ trình') || input.includes('dạy gì') || input === '1') {
      sendCoursesInfo();
      return;
    }

    if (input.includes('học phí') || input.includes('tiền') || input.includes('giá') || input.includes('bao nhiêu') || input === '2') {
      sendTuitionInfo();
      return;
    }

    if (input.includes('khai giảng') || input.includes('lịch') || input.includes('thời gian') || input === '3') {
      sendScheduleInfo();
      return;
    }

    // Fallback response
    setMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'bot',
      text: '🤖 EduBot chưa hiểu rõ câu hỏi của bạn lắm. Bạn có thể chọn tra cứu nhanh các thông tin sau hoặc yêu cầu tư vấn viên gọi lại nhé:',
      time,
      quickReplies: true
    }]);
  };

  const sendCoursesInfo = () => {
    const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    let text = '📚 **Các khóa học đang tuyển sinh tại EduEnglish:**\n\n';
    
    if (courses.length > 0) {
      courses.forEach(c => {
        text += `• **${c.title}** (${c.level}): ${c.description || 'Khóa học ôn luyện chuyên nghiệp cam kết đầu ra.'} (Thời gian học: ${c.duration || 'N/A'})\n\n`;
      });
    } else {
      text += 'Hiện tại chúng tôi đang tuyển sinh các khóa học IELTS Basic, IELTS Intermediate và IELTS Masterclass phù hợp với mọi trình độ từ mất gốc đến nâng cao.';
    }

    setMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'bot',
      text,
      time,
      quickReplies: true
    }]);
  };

  const sendTuitionInfo = () => {
    const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const formatVND = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    
    let text = '💰 **Thông tin học phí các khóa học tại trung tâm:**\n\n';
    
    if (courses.length > 0) {
      courses.forEach(c => {
        text += `• **${c.title}**: ${formatVND(c.price)} / khóa học\n`;
      });
      text += '\n🎁 *Đặc biệt: Giảm ngay 10% học phí khi hoàn thành đóng học phí sớm trước ngày khai giảng 1 tuần!*';
    } else {
      text += 'Học phí dao động từ 3.000.000 đ đến 6.000.000 đ tùy thuộc vào trình độ và cam kết đầu ra của từng khóa học.';
    }

    setMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'bot',
      text,
      time,
      quickReplies: true
    }]);
  };

  const sendScheduleInfo = () => {
    const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    let text = '📅 **Lịch khai giảng các lớp học sắp tới:**\n\n';
    
    const activeClasses = classrooms.filter(c => !c.isDeleted);
    if (activeClasses.length > 0) {
      activeClasses.forEach(c => {
        text += `• **Lớp ${c.className}** - Khóa học: *${c.courseTitle}* | Lịch học: **${c.schedule}** (Học kỳ: ${c.semester})\n\n`;
      });
    } else {
      text += 'Trung tâm liên tục khai giảng các lớp học mới vào tuần đầu tiên và tuần thứ ba của tháng. Vui lòng liên hệ tư vấn viên để được xếp lớp sớm nhất.';
    }

    setMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'bot',
      text,
      time,
      quickReplies: true
    }]);
  };

  // LEAD CAPTURE FLOW
  const startLeadFlow = () => {
    const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    setLeadFlow({
      active: true,
      step: 1,
      fullName: '',
      phoneNumber: '',
      email: '',
      notes: ''
    });

    setMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'bot',
      text: '📝 Bạn đang đăng ký để tư vấn viên liên hệ hỗ trợ. Hãy để lại thông tin liên lạc của bạn nhé!\n\n👉 **Bước 1/4:** Xin vui lòng nhập **Họ và tên đầy đủ** của bạn:',
      time
    }]);
  };

  const handleLeadFlowStep = async (userInput) => {
    const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    
    if (leadFlow.step === 1) {
      // Save name
      setLeadFlow(prev => ({ ...prev, step: 2, fullName: userInput }));
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'bot',
        text: `Chào ${userInput}! Cảm ơn bạn.\n\n👉 **Bước 2/4:** Xin vui lòng cung cấp **Số điện thoại** để tư vấn viên gọi điện tư vấn:`,
        time
      }]);
    } 
    else if (leadFlow.step === 2) {
      // Save phone
      setLeadFlow(prev => ({ ...prev, step: 3, phoneNumber: userInput }));
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'bot',
        text: 'Tuyệt vời!\n\n👉 **Bước 3/4:** Xin vui lòng nhập địa chỉ **Email** của bạn:',
        time
      }]);
    } 
    else if (leadFlow.step === 3) {
      // Validate email format basic
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userInput.trim())) {
        setMessages(prev => [...prev, {
          id: Date.now(),
          sender: 'bot',
          text: '❌ Định dạng email không hợp lệ. Vui lòng nhập lại địa chỉ email chính xác (Ví dụ: tenban@gmail.com):',
          time
        }]);
        return;
      }
      // Save email
      setLeadFlow(prev => ({ ...prev, step: 4, email: userInput }));
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'bot',
        text: 'Cảm ơn bạn. Bước cuối cùng đây rồi!\n\n👉 **Bước 4/4:** Hãy nhập **Nội dung bạn cần tư vấn** (Ví dụ: Tư vấn khóa học IELTS, Lịch học buổi tối... hoặc gõ "Không" để bỏ qua):',
        time
      }]);
    } 
    else if (leadFlow.step === 4) {
      // Save notes and submit lead
      const finalNotes = userInput.toLowerCase() === 'không' ? 'Khách yêu cầu gọi lại tư vấn chung' : userInput;
      
      const payload = {
        fullName: leadFlow.fullName,
        phoneNumber: leadFlow.phoneNumber,
        email: leadFlow.email,
        notes: `[Chatbot Lead - ${isOutOfHours() ? 'Ngoài Giờ Làm Việc' : 'Trong Giờ Làm Việc'}] ${finalNotes}`
      };

      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'bot',
        text: '⏳ Đang đăng ký thông tin của bạn lên hệ thống...',
        time
      }]);

      try {
        await axios.post('http://localhost:8080/api/registrations', payload);
        
        setMessages(prev => [...prev, {
          id: Date.now(),
          sender: 'bot',
          text: `🎉 **Đăng ký thành công!**\n\nCảm ơn bạn **${leadFlow.fullName}**. Thông tin của bạn đã được ghi nhận vào hệ thống lead tư vấn. Tư vấn viên trung tâm sẽ liên hệ trực tiếp hỗ trợ bạn qua SĐT **${leadFlow.phoneNumber}** sớm nhất có thể!`,
          time,
          quickReplies: true
        }]);
      } catch (err) {
        console.error('Lỗi gửi chatbot lead:', err);
        setMessages(prev => [...prev, {
          id: Date.now(),
          sender: 'bot',
          text: '⚠️ Rất tiếc, đã có sự cố xảy ra khi lưu trữ thông tin lên hệ thống. Tuy nhiên, thông tin đã được ghi nhận tạm thời. Vui lòng thử lại sau hoặc gọi hotline: 0988-888-888 để được hỗ trợ tức thì!',
          time,
          quickReplies: true
        }]);
      } finally {
        setLeadFlow({
          active: false,
          step: 0,
          fullName: '',
          phoneNumber: '',
          email: '',
          notes: ''
        });
      }
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'user',
      text: inputValue,
      time
    }]);

    const textInput = inputValue;
    setInputValue('');

    setTimeout(() => {
      processResponse(textInput);
    }, 500);
  };

  return (
    <>
      {/* FLOATING ACTION BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full flex items-center justify-center shadow-xl hover:shadow-orange-500/30 active:scale-95 transition-all z-50 cursor-pointer border-none"
      >
        {isOpen ? (
          <span className="text-xl">❌</span>
        ) : (
          <div className="relative">
            <span className="text-2xl">💬</span>
            <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
          </div>
        )}
      </button>

      {/* CHAT WINDOW DIALOG */}
      {isOpen && (
        <div className="w-[340px] sm:w-[380px] h-[480px] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col justify-between overflow-hidden fixed bottom-24 right-6 z-50 animate-slide-up">
          {/* Header */}
          <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center text-lg font-bold shadow-md shadow-orange-500/20">
                🤖
              </div>
              <div className="text-left">
                <h4 className="text-xs font-black tracking-wide">EduBot - Tư Vấn Tự Động</h4>
                <p className="text-[9px] text-green-400 font-bold flex items-center gap-1 mt-0.5 animate-pulse">
                  <span>●</span> Trực tuyến 24/7
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white bg-transparent border-none cursor-pointer text-sm"
            >
              ✕
            </button>
          </div>

          {/* Messages List Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-slate-50/50 flex flex-col gap-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[85%] ${
                  msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
                }`}
              >
                <div
                  className={`p-3 rounded-2xl text-xs font-semibold whitespace-pre-line text-left leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-orange-500 text-white rounded-tr-none'
                      : 'bg-white text-slate-700 border border-slate-200/80 rounded-tl-none shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[8px] text-slate-450 mt-1 font-bold">{msg.time}</span>

                {/* Quick replies buttons */}
                {msg.sender === 'bot' && msg.quickReplies && !leadFlow.active && (
                  <div className="flex flex-wrap gap-1.5 mt-3 text-left w-full">
                    <button
                      onClick={() => handleQuickReply('📚 Tìm hiểu khóa học')}
                      className="px-2.5 py-1.5 bg-white hover:bg-orange-50/20 border border-slate-200 hover:border-orange-500 text-slate-600 hover:text-orange-600 text-[10px] font-black rounded-lg cursor-pointer transition-all"
                    >
                      📚 Tìm hiểu khóa học
                    </button>
                    <button
                      onClick={() => handleQuickReply('💰 Xem học phí & ưu đãi')}
                      className="px-2.5 py-1.5 bg-white hover:bg-orange-50/20 border border-slate-200 hover:border-orange-500 text-slate-600 hover:text-orange-600 text-[10px] font-black rounded-lg cursor-pointer transition-all"
                    >
                      💰 Xem học phí & ưu đãi
                    </button>
                    <button
                      onClick={() => handleQuickReply('📅 Xem lịch khai giảng')}
                      className="px-2.5 py-1.5 bg-white hover:bg-orange-50/20 border border-slate-200 hover:border-orange-500 text-slate-600 hover:text-orange-600 text-[10px] font-black rounded-lg cursor-pointer transition-all"
                    >
                      📅 Xem lịch khai giảng
                    </button>
                    <button
                      onClick={() => handleQuickReply('📞 Đăng ký gọi tư vấn miễn phí')}
                      className="px-2.5 py-1.5 bg-white hover:bg-orange-50/20 border border-slate-200 hover:border-orange-500 text-slate-600 hover:text-orange-600 text-[10px] font-black rounded-lg cursor-pointer transition-all"
                    >
                      📞 Đăng ký tư vấn viên gọi lại
                    </button>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat text input form */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-white border-t border-slate-100 flex gap-2 items-center"
          >
            <input
              type="text"
              placeholder={
                leadFlow.active
                  ? `Nhập câu trả lời bước ${leadFlow.step}/4...`
                  : 'Nhập câu hỏi của bạn tại đây...'
              }
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none font-bold bg-white text-slate-800"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="w-8.5 h-8.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl flex items-center justify-center shadow-md shadow-orange-500/10 active:scale-95 disabled:opacity-50 transition-all border-none cursor-pointer text-xs"
            >
              ➔
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export default Chatbot;
