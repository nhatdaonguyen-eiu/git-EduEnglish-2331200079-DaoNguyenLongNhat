import { useState, useEffect } from 'react';
import axios from 'axios';
import RichTextEditor from './RichTextEditor';

function FreeMaterialsPortal({ currentUser }) {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Trạng thái cho tài liệu đang chọn xem/làm bài
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [answers, setAnswers] = useState({}); // { [questionId]: studentAnswer }
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState(null); // Kết quả chấm điểm từ Backend

  // Trạng thái quản lý (Admin/Teacher)
  const [isManagerMode, setIsManagerMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  
  const initialForm = {
    title: '',
    description: '',
    content: '',
    fileUrl: ''
  };
  const [formData, setFormData] = useState(initialForm);
  const [questions, setQuestions] = useState([
    { questionNumber: 1, questionText: '', questionType: 'MULTIPLE_CHOICE', options: '', correctAnswer: '' }
  ]);

  const isAdminOrTeacher = currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'TEACHER');

  // Lấy danh sách tài liệu
  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:8080/api/free-materials');
      setMaterials(res.data);
    } catch (err) {
      console.error('Lỗi khi tải tài liệu:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  // Xem chi tiết tài liệu (đọc lý thuyết và nạp câu hỏi bài tập)
  const handleSelectMaterial = async (id) => {
    try {
      setLoadingDetail(true);
      const res = await axios.get(`http://localhost:8080/api/free-materials/${id}`);
      setSelectedMaterial(res.data);
      setAnswers({});
      setQuizResult(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      alert('❌ Không thể tải chi tiết tài liệu này.');
    } finally {
      setLoadingDetail(false);
    }
  };

  // Trở về danh sách
  const handleBackToList = () => {
    setSelectedMaterial(null);
    setAnswers({});
    setQuizResult(null);
  };

  // Quản lý câu trả lời
  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  // Nộp bài tập luyện tập
  const handleSubmitQuiz = async (e) => {
    e.preventDefault();
    if (!selectedMaterial) return;

    // Chuyển đổi format answers sang mảng AnswerRequest
    const answerList = selectedMaterial.questions.map(q => ({
      questionId: q.id,
      studentAnswer: answers[q.id] || ''
    }));

    try {
      setSubmittingQuiz(true);
      const res = await axios.post(
        `http://localhost:8080/api/free-materials/${selectedMaterial.id}/submit`,
        { answers: answerList }
      );
      setQuizResult(res.data);
      alert('🎉 Bài tập của bạn đã được chấm điểm tự động thành công!');
    } catch (err) {
      alert('❌ Gặp lỗi trong quá trình nộp bài tập.');
    } finally {
      setSubmittingQuiz(false);
    }
  };

  // Làm lại bài tập
  const handleRedoQuiz = () => {
    setAnswers({});
    setQuizResult(null);
  };

  // ---------------------------------------------------------------------------
  // PHẦN ADMIN / TEACHER - QUẢN LÝ TÀI LIỆU
  // ---------------------------------------------------------------------------
  
  const handleEditClick = async (material) => {
    try {
      setLoadingDetail(true);
      const res = await axios.get(`http://localhost:8080/api/free-materials/${material.id}`);
      setEditingId(material.id);
      setFormData({
        title: res.data.title,
        description: res.data.description,
        content: res.data.content || '',
        fileUrl: res.data.fileUrl || ''
      });
      setQuestions(res.data.questions && res.data.questions.length > 0 ? res.data.questions : [
        { questionNumber: 1, questionText: '', questionType: 'MULTIPLE_CHOICE', options: '', correctAnswer: '' }
      ]);
      setIsEditing(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      alert('❌ Không thể tải thông tin chỉnh sửa.');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm('⚠️ Bạn có chắc chắn muốn gỡ bỏ tài liệu này không?')) return;
    try {
      await axios.delete(`http://localhost:8080/api/free-materials/${id}`);
      alert('✨ Đã gỡ bỏ tài liệu thành công!');
      fetchMaterials();
    } catch (err) {
      alert('❌ Có lỗi xảy ra khi xóa tài liệu.');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('file', file);

    try {
      setUploadingFile(true);
      const res = await axios.post('http://localhost:8080/api/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, fileUrl: res.data.url }));
      alert('📁 Đã tải lên tài liệu thành công!');
    } catch (err) {
      alert('❌ Không thể tải lên file đính kèm.');
    } finally {
      setUploadingFile(false);
    }
  };

  // Quản lý câu hỏi động trong Form
  const handleQuestionChange = (index, field, value) => {
    const newQs = [...questions];
    newQs[index][field] = value;
    setQuestions(newQs);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { questionNumber: questions.length + 1, questionText: '', questionType: 'MULTIPLE_CHOICE', options: '', correctAnswer: '' }
    ]);
  };

  const removeQuestion = (index) => {
    if (questions.length === 1) {
      setQuestions([{ questionNumber: 1, questionText: '', questionType: 'MULTIPLE_CHOICE', options: '', correctAnswer: '' }]);
    } else {
      const filtered = questions.filter((_, i) => i !== index);
      // Cập nhật lại số thứ tự câu hỏi
      const mapped = filtered.map((q, idx) => ({ ...q, questionNumber: idx + 1 }));
      setQuestions(mapped);
    }
  };

  // Lưu tài liệu mới hoặc cập nhật
  const handleSaveMaterial = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      alert('⚠️ Vui lòng nhập đầy đủ Tiêu đề và Mô tả ngắn!');
      return;
    }

    // Lọc bỏ câu hỏi rỗng
    const validQuestions = questions.filter(q => q.questionText.trim() !== '' && q.correctAnswer.trim() !== '');

    const payload = {
      ...formData,
      questions: validQuestions
    };

    try {
      if (editingId) {
        await axios.put(`http://localhost:8080/api/free-materials/${editingId}`, payload);
        alert('🎉 Đã cập nhật tài liệu thành công!');
      } else {
        await axios.post('http://localhost:8080/api/free-materials', payload);
        alert('✨ Đã thêm tài liệu mới thành công!');
      }
      
      // Reset form
      setFormData(initialForm);
      setQuestions([{ questionNumber: 1, questionText: '', questionType: 'MULTIPLE_CHOICE', options: '', correctAnswer: '' }]);
      setIsEditing(false);
      setEditingId(null);
      fetchMaterials();
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Lỗi không xác định';
      alert(`❌ Gặp lỗi khi lưu tài liệu: ${errMsg}`);
    }
  };

  const handleCancelEdit = () => {
    setFormData(initialForm);
    setQuestions([{ questionNumber: 1, questionText: '', questionType: 'MULTIPLE_CHOICE', options: '', correctAnswer: '' }]);
    setIsEditing(false);
    setEditingId(null);
  };

  // Lọc tài liệu theo từ khóa tìm kiếm
  const filteredMaterials = materials.filter(m =>
    m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 animate-fade-in text-left">
      
      {/* ─────────────────────────────────────────────────────────────
          PORTAL HEADER
          ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <span className="px-3 py-1 bg-orange-50 text-orange-600 border border-orange-200 text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm">
            📚 Cộng đồng học tập tự do
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight mt-2 flex items-center gap-2">
            Kho Tài Liệu Học Tập Miễn Phí
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm font-semibold mt-1">
            Luyện tập lý thuyết và giải bài tập tương tác có chấm điểm tức thì.
          </p>
        </div>

        {/* Nút bật/tắt chế độ quản lý dành riêng cho Admin/Teacher */}
        {isAdminOrTeacher && !selectedMaterial && (
          <button
            onClick={() => {
              setIsManagerMode(!isManagerMode);
              handleCancelEdit();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer ${
              isManagerMode 
                ? 'bg-slate-800 hover:bg-slate-900 text-white shadow-slate-800/10' 
                : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-700'
            }`}
          >
            {isManagerMode ? '👁️ Xem Giao Diện Học Viên' : '⚙️ Chế Độ Quản Lý Kho'}
          </button>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          1. CHẾ ĐỘ QUẢN LÝ (ADMIN / TEACHER)
          ───────────────────────────────────────────────────────────── */}
      {isManagerMode && !selectedMaterial && (
        <div className="space-y-8 animate-fade-in">
          
          {/* A. FORM THÊM MỚI / CHỈNH SỬA TÀI LIỆU */}
          {isEditing ? (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/5 rounded-full blur-3xl pointer-events-none"></div>
              
              <h3 className="text-lg font-black text-slate-800 mb-6 relative z-10 flex items-center gap-2">
                {editingId ? '✏️ Hiệu Chỉnh Tài Liệu Luyện Tập' : '✍️ Đăng Tải Tài Liệu Luyện Tập Mới'}
              </h3>

              <form onSubmit={handleSaveMaterial} className="space-y-6 relative z-10">
                
                {/* Tiêu đề & File đính kèm */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="md:col-span-2 flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      🏷️ Tiêu đề tài liệu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Ví dụ: Chinh phục Thì Hiện Tại Hoàn Thành (Present Perfect)"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm text-slate-800 font-semibold bg-slate-50/50"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      📁 Tài liệu đính kèm (PDF, DOCX)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.fileUrl}
                        onChange={e => setFormData({ ...formData, fileUrl: e.target.value })}
                        placeholder="Đường dẫn file đính kèm..."
                        className="flex-grow px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-xs text-slate-700 bg-slate-50/50"
                      />
                      <label className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center justify-center shrink-0 shadow shadow-orange-500/10">
                        {uploadingFile ? '...' : 'Upload'}
                        <input type="file" onChange={handleFileUpload} className="hidden" disabled={uploadingFile} />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Mô tả ngắn */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    💬 Mô tả tóm tắt <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Mô tả tóm tắt ngắn gọn nội dung tài liệu học tập và số lượng bài tập tương ứng để kích thích người học..."
                    rows="2"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm text-slate-800 bg-slate-50/50 resize-none font-medium leading-relaxed"
                    required
                  />
                </div>

                {/* Lý thuyết */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    📖 Nội dung lý thuyết chi tiết (Soạn thảo văn bản chuẩn Word)
                  </label>
                  <RichTextEditor
                    value={formData.content}
                    onChange={val => setFormData({ ...formData, content: val })}
                    placeholder="Nhập nội dung giảng dạy lý thuyết, hướng dẫn giải bài tại đây..."
                    minHeight="250px"
                    showHeadings={true}
                    showLists={true}
                  />
                </div>

                {/* 📝 KHU VỰC BÀI TẬP ĐÍNH KÈM (QUIZ BUILDER) */}
                <div className="border border-slate-200 bg-slate-50/40 rounded-2xl p-5 space-y-5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      ✍️ Thiết Lập Bộ Bài Tập Trực Tuyến Đính Kèm ({questions.length} Câu)
                    </h4>
                    <button
                      type="button"
                      onClick={addQuestion}
                      className="px-3 py-1 bg-orange-50 hover:bg-orange-100 text-orange-600 hover:text-orange-700 text-xs font-bold rounded-lg border border-orange-200/50 cursor-pointer"
                    >
                      ＋ Thêm câu hỏi
                    </button>
                  </div>

                  <div className="space-y-4">
                    {questions.map((q, index) => (
                      <div key={index} className="bg-white p-5 rounded-2xl border border-slate-100/80 flex flex-col gap-4 relative shadow-sm">
                        <button
                          type="button"
                          onClick={() => removeQuestion(index)}
                          className="absolute top-3 right-3 w-6 h-6 rounded-full bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-600 flex items-center justify-center font-bold text-xs cursor-pointer border-none"
                          title="Gỡ câu này"
                        >
                          ✕
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                          
                          {/* Câu hỏi số & Thể loại */}
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[9px] font-black text-slate-400 uppercase">Câu hỏi {index + 1}</span>
                            <select
                              value={q.questionType}
                              onChange={e => handleQuestionChange(index, 'questionType', e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none text-xs font-bold text-slate-700 cursor-pointer"
                            >
                              <option value="MULTIPLE_CHOICE">Trắc Nghiệm (MCQ)</option>
                              <option value="FILL_IN_THE_BLANK">Điền từ vào chỗ trống</option>
                            </select>
                          </div>

                          {/* Đề bài câu hỏi */}
                          <div className="md:col-span-3 flex flex-col gap-1.5">
                            <span className="text-[9px] font-black text-slate-400 uppercase">Nội dung câu hỏi <span className="text-red-500">*</span></span>
                            <input
                              type="text"
                              value={q.questionText}
                              onChange={e => handleQuestionChange(index, 'questionText', e.target.value)}
                              placeholder="Ví dụ: She ________ (study) English since childhood."
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none text-xs font-semibold text-slate-800"
                              required
                            />
                          </div>

                        </div>

                        {/* Phương án trắc nghiệm & Đáp án đúng */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                          
                          {q.questionType === 'MULTIPLE_CHOICE' ? (
                            <div className="md:col-span-3 flex flex-col gap-1.5">
                              <span className="text-[9px] font-black text-slate-400 uppercase">Các tùy chọn lựa chọn (Ngăn cách bởi dấu "|" )</span>
                              <input
                                type="text"
                                value={q.options}
                                onChange={e => handleQuestionChange(index, 'options', e.target.value)}
                                placeholder="Ví dụ: A. study|B. studied|C. has studied|D. have studied"
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none text-xs text-slate-700"
                                required
                              />
                            </div>
                          ) : (
                            <div className="md:col-span-3 text-left text-xs font-bold text-slate-400 italic py-2 pl-2">
                              💡 Điền từ vào chỗ trống không cần thiết lập danh sách tùy chọn lựa chọn.
                            </div>
                          )}

                          <div className="flex flex-col gap-1.5">
                            <span className="text-[9px] font-black text-slate-400 uppercase">Đáp án đúng <span className="text-red-500">*</span></span>
                            <input
                              type="text"
                              value={q.correctAnswer}
                              onChange={e => handleQuestionChange(index, 'correctAnswer', e.target.value)}
                              placeholder={q.questionType === 'MULTIPLE_CHOICE' ? "Ví dụ: C" : "Ví dụ: has studied"}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none text-xs font-bold text-orange-500 uppercase"
                              required
                            />
                          </div>

                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Nút lưu */}
                <div className="flex gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="submit"
                    className="flex-1 py-3 px-5 text-sm font-bold text-white rounded-xl shadow-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-orange-500/10 cursor-pointer text-center"
                  >
                    💾 Lưu Tài Liệu Học Tập
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="py-3 px-6 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer text-center"
                  >
                    Hủy Bỏ
                  </button>
                </div>

              </form>
            </div>
          ) : (
            
            // B. DANH SÁCH BẢNG QUẢN LÝ DÀNH CHO ADMIN
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-slate-800">
                  Danh Sách Tài Liệu Đang Quản Lý ({materials.length})
                </h3>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow shadow-orange-500/10 cursor-pointer border-none"
                >
                  ➕ Thêm tài liệu mới
                </button>
              </div>

              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs font-semibold text-slate-400">Đang đồng bộ dữ liệu tài liệu...</p>
                </div>
              ) : materials.length === 0 ? (
                <div className="py-12 text-center text-slate-400 font-medium">
                  Chưa có tài liệu học tập miễn phí nào.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {materials.map(mat => (
                    <div key={mat.id} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/20 flex flex-col justify-between hover:border-orange-500/20 hover:bg-slate-50 transition-all shadow-sm">
                      <div className="text-left">
                        <h4 className="text-sm font-black text-slate-800 line-clamp-1">{mat.title}</h4>
                        <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">{mat.description}</p>
                      </div>
                      
                      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-100/60 justify-end">
                        <button
                          onClick={() => handleEditClick(mat)}
                          className="px-3 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg cursor-pointer border-none"
                        >
                          ✏️ Sửa đổi
                        </button>
                        <button
                          onClick={() => handleDeleteClick(mat.id)}
                          className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg cursor-pointer border-none"
                        >
                          🗑️ Gỡ bỏ
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. GIAO DIỆN HỌC VIÊN & KHÁCH VÃNG LAI (STUDENT / GUEST VIEW)
          ───────────────────────────────────────────────────────────── */}
      {!isManagerMode && (
        <>
          {selectedMaterial ? (
            
            // A. CHI TIẾT TÀI LIỆU VÀ KHUNG LÀM BÀI TẬP
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden animate-slide-up flex flex-col">
              
              {/* Tiêu đề & banner giới thiệu */}
              <div className="relative p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-950 to-orange-950 text-white shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="text-left max-w-3xl">
                  <button
                    onClick={handleBackToList}
                    className="mb-4 text-xs font-extrabold text-orange-400 hover:text-orange-300 flex items-center gap-1 bg-none border-none cursor-pointer"
                  >
                    ⬅️ Trở về danh sách tài liệu
                  </button>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-snug drop-shadow-md">
                    {selectedMaterial.title}
                  </h1>
                  <p className="text-slate-400 text-xs sm:text-sm mt-2 font-medium">
                    {selectedMaterial.description}
                  </p>
                </div>

                {selectedMaterial.fileUrl && (
                  <a
                    href={selectedMaterial.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 transition-all flex items-center gap-1.5 shrink-0 text-center"
                  >
                    📥 Tải Tài Liệu Đính Kèm
                  </a>
                )}
              </div>

              {/* Layout hai cột: Trái đọc lý thuyết, Phải làm bài tập */}
              <div className="grid grid-cols-1 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
                
                {/* CỘT LÝ THUYẾT (PROSE FORMATTING) */}
                <div className="lg:col-span-3 p-6 sm:p-8 overflow-y-auto max-h-[75vh]">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-5 pb-2 border-b border-slate-100 flex items-center gap-1.5">
                    📖 Lý Thuyết & Hướng Dẫn Chi Tiết
                  </h3>
                  
                  {selectedMaterial.content ? (
                    <div 
                      className="prose prose-slate max-w-none text-slate-600 text-sm leading-relaxed font-medium space-y-4 
                        prose-headings:text-slate-800 prose-headings:font-black prose-headings:tracking-tight
                        prose-h2:text-lg prose-h2:border-l-4 prose-h2:border-orange-500 prose-h2:pl-3 prose-h2:pt-2
                        prose-h3:text-sm prose-h3:text-orange-600 prose-h3:font-extrabold prose-strong:text-slate-900"
                      dangerouslySetInnerHTML={{ __html: selectedMaterial.content }}
                    />
                  ) : (
                    <div className="py-12 text-center text-xs text-slate-400 italic">Tài liệu không có nội dung lý thuyết bằng văn bản. Hãy tải file đính kèm để xem chi tiết.</div>
                  )}
                </div>

                {/* CỘT KHUNG BÀI TẬP TƯƠNG TÁC (Interactive Quiz Panel) */}
                <div className="lg:col-span-2 p-6 sm:p-8 bg-slate-50/50 flex flex-col justify-between max-h-[75vh] overflow-y-auto">
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-5 pb-2 border-b border-slate-100 flex items-center gap-1.5">
                      ✍️ Bài Tập Rèn Luyện Tương Tác
                    </h3>

                    {selectedMaterial.questions && selectedMaterial.questions.length > 0 ? (
                      <form onSubmit={handleSubmitQuiz} className="space-y-6 text-left">
                        {selectedMaterial.questions.map((q, idx) => {
                          const isIncorrect = quizResult && quizResult.results && quizResult.results.find(r => r.questionId === q.id && !r.isCorrect);
                          const isCorrect = quizResult && quizResult.results && quizResult.results.find(r => r.questionId === q.id && r.isCorrect);

                          return (
                            <div 
                              key={q.id} 
                              className={`p-4 rounded-2xl border transition-all ${
                                isCorrect 
                                  ? 'bg-emerald-50/50 border-emerald-100 shadow-sm shadow-emerald-500/5' 
                                  : isIncorrect 
                                    ? 'bg-red-50/50 border-red-100 shadow-sm shadow-red-500/5' 
                                    : 'bg-white border-slate-200/80 shadow-sm'
                              }`}
                            >
                              {/* Đề bài câu hỏi */}
                              <div className="flex gap-2">
                                <span className={`text-[10px] font-black w-5 h-5 rounded-full shrink-0 flex items-center justify-center border ${
                                  isCorrect 
                                    ? 'bg-emerald-500 border-emerald-600 text-white' 
                                    : isIncorrect 
                                      ? 'bg-red-500 border-red-600 text-white' 
                                      : 'bg-slate-100 border-slate-200 text-slate-600'
                                }`}>
                                  {idx + 1}
                                </span>
                                <p className="text-xs font-bold text-slate-800 leading-tight">
                                  {q.questionText}
                                </p>
                              </div>

                              {/* Form nhập đáp án */}
                              <div className="mt-3.5 pl-7">
                                {q.questionType === 'MULTIPLE_CHOICE' ? (
                                  
                                  // 1. Dạng Trắc nghiệm (Radio buttons)
                                  <div className="flex flex-col gap-2">
                                    {(q.options || '').split('|').map((opt, oIdx) => {
                                      const cleanOpt = opt.trim();
                                      const optChar = cleanOpt.charAt(0); // Lấy chữ cái đầu (A, B, C, D)
                                      
                                      return (
                                        <label 
                                          key={oIdx} 
                                          className={`flex items-start gap-2.5 p-2 rounded-xl text-[11px] font-semibold border cursor-pointer select-none transition-all ${
                                            answers[q.id] === optChar
                                              ? 'border-orange-500 bg-orange-50/20 text-orange-700'
                                              : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50 text-slate-600'
                                          }`}
                                        >
                                          <input
                                            type="radio"
                                            name={`q_${q.id}`}
                                            value={optChar}
                                            checked={answers[q.id] === optChar}
                                            onChange={() => handleAnswerChange(q.id, optChar)}
                                            disabled={quizResult !== null}
                                            className="accent-orange-500 shrink-0 mt-0.5"
                                          />
                                          <span>{cleanOpt}</span>
                                        </label>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  
                                  // 2. Dạng Điền từ (Text Input)
                                  <input
                                    type="text"
                                    value={answers[q.id] || ''}
                                    onChange={e => handleAnswerChange(q.id, e.target.value)}
                                    placeholder="Điền câu trả lời của bạn..."
                                    disabled={quizResult !== null}
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-xs font-semibold text-slate-800 bg-slate-50/40"
                                  />
                                )}

                                {/* Hiển thị đáp án sau khi chấm bài */}
                                {quizResult && (
                                  <div className="mt-3 pt-2.5 border-t border-dashed border-slate-100 flex flex-col gap-1 text-[11px] font-bold">
                                    <p className={`flex items-center gap-1.5 ${isCorrect ? 'text-emerald-600' : 'text-red-500'}`}>
                                      {isCorrect ? '✓ Câu trả lời đúng!' : '✕ Chưa chính xác!'}
                                      <span className="text-slate-400 font-medium">(Bạn chọn: {answers[q.id] || 'Chưa trả lời'})</span>
                                    </p>
                                    {!isCorrect && (
                                      <p className="text-emerald-600">
                                        💡 Đáp án chuẩn: <span className="font-extrabold">{q.correctAnswer}</span>
                                      </p>
                                    )}
                                  </div>
                                )}

                              </div>
                            </div>
                          );
                        })}

                        {/* Nút bấm ở chân */}
                        {quizResult === null ? (
                          <button
                            type="submit"
                            disabled={submittingQuiz}
                            className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs font-black rounded-xl shadow-lg shadow-orange-500/10 transition-all flex items-center justify-center cursor-pointer border-none mt-8"
                          >
                            {submittingQuiz ? 'Đang chấm điểm...' : '🚀 Nộp Bài Làm & Xem Điểm Số'}
                          </button>
                        ) : (
                          <div className="mt-8 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
                            <div className="text-center">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Kết quả bài làm</span>
                              <h4 className="text-2xl font-black text-slate-800 mt-1 flex items-center justify-center gap-1.5">
                                🏆 Điểm số: <span className="text-orange-500">{quizResult.score.toFixed(1)}/10</span>
                              </h4>
                              <p className="text-[11px] text-slate-400 font-bold mt-1">
                                Trả lời đúng {quizResult.correctCount}/{quizResult.totalQuestions} câu hỏi.
                              </p>
                            </div>
                            
                            <button
                              type="button"
                              onClick={handleRedoQuiz}
                              className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-all shadow shadow-orange-500/10 cursor-pointer border-none flex items-center justify-center gap-1"
                            >
                              🔄 Làm Lại Bài Tập Này
                            </button>
                          </div>
                        )}

                      </form>
                    ) : (
                      <div className="py-12 text-center text-xs text-slate-400 italic bg-white rounded-2xl border border-slate-100 shadow-sm">Tài liệu học tập này hiện chưa có bài tập đính kèm.</div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          ) : (
            
            // B. MÀN HÌNH DANH SÁCH TÀI LIỆU HỌC VIÊN & KHÁCH VÃNG LAI
            <div className="space-y-6">
              
              {/* Ô tìm kiếm tài liệu */}
              <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center max-w-md">
                <span className="text-slate-400 mr-2">🔍</span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Nhập chủ đề tài liệu bạn quan tâm..."
                  className="w-full bg-transparent focus:outline-none text-sm text-slate-800 placeholder-slate-400 font-semibold"
                />
              </div>

              {loading ? (
                <div className="py-16 flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs font-semibold text-slate-400">Đang đồng bộ dữ liệu tài liệu...</p>
                </div>
              ) : filteredMaterials.length === 0 ? (
                <div className="py-16 text-center text-slate-400 font-medium bg-white rounded-3xl border border-slate-100 shadow-sm">
                  Chưa tìm thấy tài liệu phù hợp với chủ đề tìm kiếm.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredMaterials.map(mat => (
                    <div 
                      key={mat.id}
                      className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group cursor-pointer text-left"
                      onClick={() => handleSelectMaterial(mat.id)}
                    >
                      <div>
                        {/* Biểu tượng đẹp */}
                        <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center text-lg shadow-sm border border-orange-100 group-hover:bg-orange-500 group-hover:text-white transition-all">
                          📝
                        </div>
                        
                        <h3 className="text-sm sm:text-base font-black text-slate-800 mt-4 leading-snug group-hover:text-orange-500 transition-all line-clamp-1" title={mat.title}>
                          {mat.title}
                        </h3>
                        
                        <p className="text-slate-500 text-[11px] font-semibold mt-2.5 line-clamp-3 leading-relaxed">
                          {mat.description}
                        </p>
                      </div>

                      <div className="flex justify-between items-center mt-5 pt-3 border-t border-slate-50 text-[11px] font-bold text-orange-500">
                        <span>Học & Làm bài tập ➔</span>
                        <span className="text-slate-400 font-medium">Miễn phí</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}
        </>
      )}

    </div>
  );
}

export default FreeMaterialsPortal;
