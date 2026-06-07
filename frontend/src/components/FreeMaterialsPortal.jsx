import { useState, useEffect } from 'react';
import axios from 'axios';
import RichTextEditor from './RichTextEditor';
import { Play, Clock, Eye } from 'lucide-react';

const mockVideos = [
  {
    id: 'video-1',
    title: 'Học phát âm tiếng Anh chuẩn IPA trong 30 phút',
    duration: '32:15',
    views: '12.5K lượt xem',
    thumbnailUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=500',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  },
  {
    id: 'video-2',
    title: 'Mẹo làm bài thi nghe IELTS Listening Section 1 đạt điểm tuyệt đối',
    duration: '18:40',
    views: '8.2K lượt xem',
    thumbnailUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=500',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  },
  {
    id: 'video-3',
    title: '15 cấu trúc ngữ pháp thông dụng trong giao tiếp công sở',
    duration: '24:10',
    views: '5.6K lượt xem',
    thumbnailUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  }
];

function FreeMaterialsPortal({ currentUser, initialView }) {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeVideo, setActiveVideo] = useState(null);
  
  // Blog specific states
  const [viewMode, setViewMode] = useState(initialView || 'materials');
  const [blogs, setBlogs] = useState([]);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [emailInput, setEmailInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

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

  const mockBlogs = [
    {
      id: 'mock-1',
      title: 'Làm chủ Kỹ năng Viết Academic: Bí quyết đạt 7.5+ IELTS',
      category: 'BÀI VIẾT NỔI BẬT',
      createdAt: '2026-06-02T13:00:00Z',
      readTime: '15 phút đọc',
      summary: 'Tìm hiểu cấu trúc ngữ pháp nâng cao và cách triển khai ý tưởng mạch lạc trong bài thi viết học thuật từ các chuyên gia ngôn ngữ hàng đầu.',
      content: '<h2>1. Tìm hiểu tiêu chí chấm điểm IELTS Writing Task 2</h2><p>Để đạt band 7.5+ trong phần thi Viết, học viên cần hiểu rõ 4 tiêu chí cốt lõi: Task Response (Đáp ứng yêu cầu đề bài), Coherence & Cohesion (Tính mạch lạc và liên kết), Lexical Resource (Vốn từ vựng), và Grammatical Range & Accuracy (Phạm vi và độ chính xác ngữ pháp)...</p>',
      thumbnailUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800'
    },
    {
      id: 'mock-2',
      title: '5 Podcast tiếng Anh giúp bạn cải thiện kỹ năng nghe mỗi ngày',
      category: 'LUYỆN NGHE',
      createdAt: '2026-06-02T13:00:00Z',
      readTime: '8 phút đọc',
      summary: 'Vừa nghe thụ động vừa chủ động qua các kênh podcast uy tín không chỉ giúp bạn làm quen với ngữ điệu bản xứ mà còn cập nhật kiến thức thời sự đa dạng...',
      content: '<h2>5 Kênh Podcast tiếng Anh đáng nghe nhất</h2><p>Học nghe tiếng Anh qua podcast là phương pháp cực kỳ hiệu quả để rèn luyện đôi tai nhạy bén. Dưới đây là top 5 kênh podcast uy tín từ BBC, Luke\'s English Podcast, và TED Talks...</p>',
      thumbnailUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600'
    },
    {
      id: 'mock-3',
      title: 'Phân biệt các thì hoàn thành: Không còn là nỗi ám ảnh',
      category: 'NGỮ PHÁP',
      createdAt: '2025-11-12T13:00:00Z',
      readTime: '10 phút đọc',
      summary: 'Hệ thống lại toàn bộ cách dùng Hiện tại hoàn thành, Quá khứ hoàn thành và Tương lai hoàn thành thông qua ví dụ trực quan và sơ đồ tư duy...',
      content: '<h2>Hệ thống hóa các thì Hoàn thành</h2><p>Các thì hoàn thành (Present Perfect, Past Perfect, Future Perfect) thường gây bối rối cho người học do tính chất kết nối thời gian. Bài viết này hướng dẫn cách phân biệt chi tiết qua các mốc thời gian rõ ràng...</p>',
      thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600'
    },
    {
      id: 'mock-4',
      title: 'EduEnglish ra mắt tính năng AI Mentorship mới',
      category: 'NEWS',
      createdAt: '2026-05-25T13:00:00Z',
      readTime: '7 phút đọc',
      summary: 'Sử dụng công nghệ ngôn ngữ tiên tiến nhất để hỗ trợ học viên sửa lỗi phát âm và ngữ pháp ngay lập tức trong quá trình luyện tập nghe nói...',
      content: '<h2>Công nghệ AI Mentorship đột phá tại EduEnglish</h2><p>Với sự phát triển mạnh mẽ của AI, hệ thống LMS EduEnglish hiện đã chính thức cập nhật công nghệ Mentorship ảo. Học sinh có thể làm bài tập Speaking/Writing và nhận đánh giá lỗi phát âm chi tiết...</p>',
      thumbnailUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600'
    }
  ];

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

  const fetchBlogs = async () => {
    try {
      setBlogsLoading(true);
      const res = await axios.get('http://localhost:8080/api/blogs');
      if (res.data && res.data.length > 0) {
        setBlogs([mockBlogs[0], ...res.data]);
      } else {
        setBlogs(mockBlogs);
      }
    } catch (err) {
      console.error('Lỗi khi tải blog:', err);
      setBlogs(mockBlogs);
    } finally {
      setBlogsLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
    fetchBlogs();
  }, []);

  useEffect(() => {
    if (initialView) {
      setViewMode(initialView);
    }
  }, [initialView]);

  const handleOpenBlog = (blog, skipPushHistory = false) => {
    setSelectedBlog(blog);
    if (!skipPushHistory) {
      window.history.pushState({ view: 'blog-detail', blogId: blog.id }, '', `/blog?blogId=${blog.id}`);
    }
  };

  const handleCloseBlog = () => {
    setSelectedBlog(null);
    if (window.location.search.includes('blogId=')) {
      window.history.back();
    }
  };

  // Xem chi tiết tài liệu (đọc lý thuyết và nạp câu hỏi bài tập)
  const handleSelectMaterial = async (id, skipPushHistory = false) => {
    try {
      setLoadingDetail(true);
      const res = await axios.get(`http://localhost:8080/api/free-materials/${id}`);
      setSelectedMaterial(res.data);
      setAnswers({});
      setQuizResult(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (!skipPushHistory) {
        window.history.pushState({ view: 'material-detail', materialId: id }, '', `/materials?materialId=${id}`);
      }
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
    if (window.location.search.includes('materialId=')) {
      window.history.back();
    }
  };

  // Sync state from query parameters on mount or when blogs change, and listen for popstate
  useEffect(() => {
    const checkUrlParams = () => {
      const params = new URLSearchParams(window.location.search);
      if (viewMode === 'blog') {
        const blogId = params.get('blogId');
        if (blogId) {
          const found = blogs.find(b => b.id === blogId);
          if (found) {
            setSelectedBlog(found);
          } else {
            const foundMock = mockBlogs.find(b => b.id === blogId);
            if (foundMock) setSelectedBlog(foundMock);
          }
        } else {
          setSelectedBlog(null);
        }
      } else if (viewMode === 'materials') {
        const materialId = params.get('materialId');
        if (materialId) {
          if (!selectedMaterial || selectedMaterial.id !== parseInt(materialId)) {
            handleSelectMaterial(materialId, true);
          }
        } else {
          setSelectedMaterial(null);
        }
      }
    };

    checkUrlParams();

    window.addEventListener('popstate', checkUrlParams);
    return () => window.removeEventListener('popstate', checkUrlParams);
  }, [blogs, viewMode]);

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
          <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm">
            📚 Cộng đồng học tập tự do
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight mt-2 flex items-center gap-2">
            Kho Tài Liệu Học Tập Miễn Phí
          </h2>
          <p className="text-slate-450 text-xs sm:text-sm font-semibold mt-1">
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
                ? 'bg-slate-850 hover:bg-slate-900 text-white shadow-slate-800/10' 
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
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-800/5 rounded-full blur-3xl pointer-events-none"></div>
              
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
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-700 text-sm text-slate-800 font-semibold bg-slate-50/50"
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
                      <label className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center justify-center shrink-0 shadow shadow-emerald-700/10">
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
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-700 text-sm text-slate-800 bg-slate-50/50 resize-none font-medium leading-relaxed"
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
                      className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 hover:text-emerald-950 text-xs font-bold rounded-lg border border-emerald-200/50 cursor-pointer"
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
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none text-xs font-bold text-emerald-800 uppercase"
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
                    className="flex-1 py-3 px-5 text-sm font-bold text-white rounded-xl shadow-lg bg-gradient-to-r from-[#064e3b] to-emerald-800 hover:from-[#047857] hover:to-emerald-700 shadow-emerald-900/10 cursor-pointer text-center"
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
                  className="px-4 py-2 bg-[#064e3b] hover:bg-[#047857] text-white text-xs font-bold rounded-xl shadow shadow-emerald-900/10 cursor-pointer border-none"
                >
                  ➕ Thêm tài liệu mới
                </button>
              </div>

              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 border-4 border-emerald-700 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs font-semibold text-slate-400">Đang đồng bộ dữ liệu tài liệu...</p>
                </div>
              ) : materials.length === 0 ? (
                <div className="py-12 text-center text-slate-400 font-medium">
                  Chưa có tài liệu học tập miễn phí nào.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {materials.map(mat => (
                    <div key={mat.id} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/20 flex flex-col justify-between hover:border-emerald-500/20 hover:bg-slate-50 transition-all shadow-sm">
                      <div className="text-left">
                        <h4 className="text-sm font-black text-slate-800 line-clamp-1">{mat.title}</h4>
                        <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">{mat.description}</p>
                      </div>
                      
                      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-100/60 justify-end">
                        <button
                          onClick={() => handleEditClick(mat)}
                          className="px-3 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg cursor-pointer border-none"
                        >
                          📝 Sửa đổi
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
          {/* Dynamic Sub-tab Bar for Student View */}
          {!selectedMaterial && !selectedBlog && (
            <div className="flex border-b border-slate-200 mb-8 font-semibold gap-6 text-sm flex-wrap">
              <button
                onClick={() => {
                  setViewMode('materials');
                  window.history.pushState({}, '', '/materials');
                  setSelectedMaterial(null);
                  setSelectedBlog(null);
                }}
                className={`pb-3 px-4 border-b-2 transition-all cursor-pointer ${
                  viewMode === 'materials'
                    ? 'border-emerald-700 text-emerald-800 font-black text-xs sm:text-sm'
                    : 'border-transparent text-slate-400 hover:text-slate-655'
                }`}
              >
                📚 Tài liệu PDF & Bài tập
              </button>
              
              <button
                onClick={() => {
                  setViewMode('videos');
                  window.history.pushState({}, '', '/materials?view=videos');
                  setSelectedMaterial(null);
                  setSelectedBlog(null);
                }}
                className={`pb-3 px-4 border-b-2 transition-all cursor-pointer ${
                  viewMode === 'videos'
                    ? 'border-emerald-700 text-emerald-800 font-black text-xs sm:text-sm'
                    : 'border-transparent text-slate-400 hover:text-slate-655'
                }`}
              >
                🎥 Video bài học trực tuyến
              </button>

              <button
                onClick={() => {
                  setViewMode('blog');
                  window.history.pushState({}, '', '/blog');
                  setSelectedMaterial(null);
                  setSelectedBlog(null);
                }}
                className={`pb-3 px-4 border-b-2 transition-all cursor-pointer ${
                  viewMode === 'blog'
                    ? 'border-emerald-700 text-emerald-800 font-black text-xs sm:text-sm'
                    : 'border-transparent text-slate-400 hover:text-slate-655'
                }`}
              >
                📰 Chia sẻ kinh nghiệm
              </button>
            </div>
          )}

          {/* A. GIAO DIỆN BLOG */}
          {viewMode === 'blog' && (
            selectedBlog ? (
              // CHI TIẾT BÀI VIẾT BLOG
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden animate-slide-up flex flex-col max-w-4xl mx-auto">
                <div className="relative p-6 sm:p-8 bg-slate-900 text-white flex flex-col justify-between items-start gap-4">
                  <button
                    onClick={handleCloseBlog}
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-355 flex items-center gap-1 bg-none border-none cursor-pointer"
                  >
                    ⬅️ Trở về danh sách bài viết
                  </button>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-snug">
                    {selectedBlog.title}
                  </h1>
                  <div className="flex items-center gap-3 text-xs text-slate-350 font-semibold mt-2">
                    <span className="px-2 py-0.5 bg-emerald-800 text-emerald-300 rounded-md uppercase font-bold text-[9px]">{selectedBlog.category}</span>
                    <span>•</span>
                    <span>{selectedBlog.readTime || '8 phút đọc'}</span>
                    <span>•</span>
                    <span>{new Date(selectedBlog.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>

                <div className="p-6 sm:p-8 space-y-6 text-left">
                  {selectedBlog.thumbnailUrl && (
                    <img 
                      src={selectedBlog.thumbnailUrl} 
                      alt={selectedBlog.title} 
                      className="w-full h-80 object-cover rounded-2xl shadow-sm"
                    />
                  )}

                  <div 
                    className="prose prose-slate max-w-none text-slate-655 text-sm sm:text-base leading-relaxed font-medium space-y-4 
                      prose-headings:text-slate-800 prose-headings:font-black prose-headings:tracking-tight
                      prose-h2:text-lg prose-h2:border-l-4 prose-h2:border-emerald-700 prose-h2:pl-3 prose-h2:pt-2
                      prose-h3:text-sm prose-h3:text-emerald-700 prose-h3:font-extrabold prose-strong:text-slate-900"
                    dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
                  />

                  <div className="pt-6 border-t border-slate-100 text-right">
                    <button
                      onClick={handleCloseBlog}
                      className="px-6 py-2.5 bg-[#064e3b] hover:bg-[#047857] text-white text-xs font-bold rounded-xl transition-all border-none cursor-pointer"
                    >
                      Đóng bài viết
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // DANH SÁCH BÀI VIẾT BLOG
              <div className="space-y-12 animate-fade-in text-left">
                {/* 1. HERO FEATURE POST */}
                {blogs.length > 0 && (() => {
                  const heroPost = blogs[0];
                  return (
                    <div 
                      className="relative rounded-3xl overflow-hidden min-h-[360px] flex flex-col justify-end p-6 sm:p-10 shadow-lg bg-cover bg-center text-white"
                      style={{ 
                        backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.25)), url(${heroPost.thumbnailUrl})` 
                      }}
                    >
                      <div className="max-w-2xl space-y-4">
                        <span className="px-3 py-1 bg-[#10b981] text-white text-[9px] font-black rounded-md uppercase tracking-wider">
                          BÀI VIẾT NỔI BẬT
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-black leading-snug drop-shadow-md">
                          {heroPost.title}
                        </h1>
                        <p className="text-slate-200 text-xs sm:text-sm leading-relaxed drop-shadow-sm font-medium line-clamp-2">
                          {heroPost.summary}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-4 pt-2">
                          <button
                            onClick={() => handleOpenBlog(heroPost)}
                            className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-800 hover:text-slate-900 text-xs font-black rounded-xl transition-all shadow border-none cursor-pointer"
                          >
                            Đọc tiếp
                          </button>
                          
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-[10px] text-white">M</span>
                            <span className="text-[10px] font-black text-slate-200">Bởi Dr. Nguyễn Minh Anh</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 2. KHÁM PHÁ THEO CHỦ ĐỀ */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Khám phá theo chủ đề</h3>
                    <div className="flex justify-between items-baseline gap-4">
                      <p className="text-slate-450 text-[11px] font-semibold">
                        Lọc nội dung theo nhu cầu học tập của bạn để tìm thấy những tài liệu phù hợp nhất cho lộ trình chinh phục tiếng Anh.
                      </p>
                      {selectedCategory !== 'all' && (
                        <button 
                          onClick={() => setSelectedCategory('all')} 
                          className="text-xs font-black text-emerald-800 hover:text-emerald-950 bg-none border-none cursor-pointer hover:underline"
                        >
                          Hiển thị tất cả ➔
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    {/* Card 1 (chiếm 2 cột) */}
                    <div 
                      onClick={() => setSelectedCategory(selectedCategory === 'Mẹo học tập' ? 'all' : 'Mẹo học tập')}
                      className={`sm:col-span-2 rounded-2xl h-44 p-5 flex flex-col justify-end bg-slate-950 text-white relative overflow-hidden group cursor-pointer border shadow-sm transition-all ${
                        selectedCategory === 'Mẹo học tập' ? 'ring-2 ring-emerald-450 border-emerald-450' : 'border-slate-800'
                      }`}
                    >
                      <img 
                        src="https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400" 
                        alt="Mẹo học tập"
                        className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                      />
                      <div className="relative z-10 space-y-1">
                        <h4 className="text-sm font-black flex items-center gap-1.5">
                          Mẹo học tập {selectedCategory === 'Mẹo học tập' && '✓'}
                        </h4>
                        <p className="text-[10px] text-slate-350 leading-normal font-semibold">Các phương pháp ghi nhớ từ vựng và cải thiện phản xạ giao tiếp tự nhiên.</p>
                      </div>
                    </div>

                    {/* Card 2 */}
                    <div 
                      onClick={() => setSelectedCategory(selectedCategory === 'IELTS' ? 'all' : 'IELTS')}
                      className={`rounded-2xl h-44 p-5 flex flex-col justify-end bg-slate-950 text-white relative overflow-hidden group cursor-pointer border shadow-sm transition-all ${
                        selectedCategory === 'IELTS' ? 'ring-2 ring-emerald-450 border-emerald-450' : 'border-slate-800'
                      }`}
                    >
                      <img 
                        src="https://images.unsplash.com/photo-1455390582262-044cdead277a?w=300" 
                        alt="IELTS"
                        className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                      />
                      <div className="relative z-10">
                        <h4 className="text-sm font-black flex items-center gap-1.5">
                          Luyện thi IELTS/TOEFL {selectedCategory === 'IELTS' && '✓'}
                        </h4>
                      </div>
                    </div>

                    {/* Card 3 */}
                    <div 
                      onClick={() => setSelectedCategory(selectedCategory === 'News' ? 'all' : 'News')}
                      className={`rounded-2xl h-44 p-5 flex flex-col justify-end bg-slate-950 text-white relative overflow-hidden group cursor-pointer border shadow-sm transition-all ${
                        selectedCategory === 'News' ? 'ring-2 ring-emerald-450 border-emerald-450' : 'border-slate-800'
                      }`}
                    >
                      <img 
                        src="https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=300" 
                        alt="News"
                        className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                      />
                      <div className="relative z-10">
                        <h4 className="text-sm font-black flex items-center gap-1.5">
                          Tin tức giáo dục {selectedCategory === 'News' && '✓'}
                        </h4>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. BÀI VIẾT MỚI NHẤT */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">
                      {selectedCategory === 'all' ? 'Bài viết mới nhất' : `Chủ đề: ${selectedCategory}`}
                    </h3>
                  </div>

                  {blogsLoading ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 border-3 border-emerald-700 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-xs text-slate-400 font-bold">Đang lấy các bài viết...</p>
                    </div>
                  ) : (() => {
                    const displayBlogs = blogs.slice(1).filter(blog => 
                      selectedCategory === 'all' || 
                      blog.category?.toLowerCase() === selectedCategory.toLowerCase() ||
                      (selectedCategory === 'IELTS' && blog.category?.toLowerCase().includes('ielts')) ||
                      (selectedCategory === 'News' && blog.category?.toLowerCase() === 'news')
                    );

                    if (displayBlogs.length === 0) {
                      return <p className="text-center text-slate-400 py-10 font-bold text-xs italic">Chưa có bài viết nào thuộc chủ đề này.</p>;
                    }

                    return (
                      <div className="flex flex-col gap-6">
                        {displayBlogs.map(blog => (
                          <div 
                            key={blog.id} 
                            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5 flex flex-col md:flex-row gap-5 hover:shadow-md transition-shadow group cursor-pointer text-left"
                            onClick={() => handleOpenBlog(blog)}
                          >
                            <div className="w-full md:w-48 h-32 overflow-hidden rounded-xl bg-slate-100 shrink-0">
                              <img 
                                src={blog.thumbnailUrl} 
                                alt={blog.title} 
                                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-200"
                              />
                            </div>

                            <div className="flex-grow flex flex-col justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2.5 text-[9px] font-black text-slate-400">
                                  <span className="text-emerald-700 font-bold">{blog.category || 'LUYỆN NGHE'}</span>
                                  <span>•</span>
                                  <span>{new Date(blog.createdAt).toLocaleDateString('vi-VN')}</span>
                                  <span>•</span>
                                  <span>{blog.readTime || '8 phút đọc'}</span>
                                </div>
                                <h4 className="text-sm sm:text-base font-black text-slate-800 leading-snug group-hover:text-emerald-800 transition-colors pt-1">
                                  {blog.title}
                                </h4>
                                <p className="text-[11px] text-slate-500 font-semibold leading-relaxed line-clamp-2 pt-1">
                                  {blog.summary}
                                </p>
                              </div>
                              <span className="text-[10px] font-black text-emerald-850 group-hover:text-emerald-950 pt-2 block">
                                Đọc chi tiết ➔
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}

                  {/* Phân trang mẫu */}
                  <div className="flex justify-center items-center gap-1.5 pt-4 text-xs font-black">
                    <button className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer border-none shadow-sm">&lt;</button>
                    <button className="w-8 h-8 rounded-lg bg-[#064e3b] text-white flex items-center justify-center cursor-pointer border-none shadow-sm">1</button>
                    <button className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer border-none shadow-sm">2</button>
                    <button className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer border-none shadow-sm">3</button>
                    <span className="text-slate-400 px-1">...</span>
                    <button className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer border-none shadow-sm">12</button>
                    <button className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer border-none shadow-sm">&gt;</button>
                  </div>
                </div>

                {/* 4. BANNER ĐĂNG KÝ NHẬN TÀI LIỆU ĐỘC QUYỀN */}
                <div className="bg-gradient-to-r from-emerald-950 via-[#064e3b] to-emerald-900 p-8 rounded-3xl text-white flex flex-col md:flex-row justify-between items-center gap-6 mt-16 shadow-lg border border-emerald-800">
                  <div className="text-left space-y-1">
                    <h3 className="text-lg sm:text-xl font-black">Đăng ký nhận tài liệu độc quyền</h3>
                    <p className="text-[10px] text-emerald-200 font-bold max-w-md leading-relaxed">
                      Nhận ngay trọn bộ "1000 từ vựng Academic thông dụng nhất" và các tài liệu hữu ích hàng tuần qua email của bạn.
                    </p>
                  </div>

                  <div className="flex gap-2 w-full md:w-auto shrink-0 max-w-sm">
                    <input 
                      type="email" 
                      placeholder="Email của bạn"
                      value={emailInput}
                      onChange={e => setEmailInput(e.target.value)}
                      className="flex-1 min-w-[150px] px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none bg-white text-slate-800"
                    />
                    <button 
                      onClick={() => {
                        if (!emailInput.trim()) return;
                        alert('🎉 Đăng ký nhận bản tin thành công! Bộ tài liệu 1000 từ vựng đang được gửi đến hòm thư của bạn.');
                        setEmailInput('');
                      }}
                      className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl cursor-pointer border-none shrink-0"
                    >
                      Đăng ký ngay
                    </button>
                  </div>
                </div>
              </div>
            )
          )}

          {/* B. GIAO DIỆN VIDEO */}
          {viewMode === 'videos' && (
            <div className="space-y-8 animate-fade-in text-left">
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Thư viện video bài giảng</h3>
                <p className="text-slate-450 text-[11px] font-semibold mt-1">Lớp học trực tuyến chất lượng cao biên soạn bởi hội đồng chuyên môn EduEnglish.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockVideos.map(video => (
                  <div 
                    key={video.id}
                    onClick={() => setActiveVideo(video)}
                    className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1.5 transition-all duration-300 border border-slate-100 group cursor-pointer flex flex-col h-full text-left"
                  >
                    {/* Thumbnail wrapper */}
                    <div className="relative aspect-video w-full overflow-hidden bg-slate-100 shrink-0">
                      <img 
                        src={video.thumbnailUrl} 
                        alt={video.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Play icon overlay */}
                      <div className="absolute inset-0 bg-black/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg transition-transform duration-300 transform scale-90 group-hover:scale-100">
                          <Play className="w-6 h-6 fill-current pl-1" />
                        </div>
                      </div>
                      <span className="absolute bottom-3 right-3 px-2 py-0.5 text-[9px] font-black text-white bg-slate-900/60 rounded-md backdrop-blur-sm">
                        {video.duration}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="p-5 flex-grow flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs sm:text-sm font-black text-slate-800 leading-snug group-hover:text-emerald-800 transition-colors line-clamp-2">
                          {video.title}
                        </h4>
                      </div>
                      
                      <div className="flex justify-between items-center mt-5 pt-3 border-t border-slate-50 text-[10px] font-black text-slate-450">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          Bài học trực tuyến
                        </span>
                        <span className="flex items-center gap-1 text-emerald-700">
                          <Eye className="w-3.5 h-3.5 text-emerald-500" />
                          {video.views}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* C. GIAO DIỆN TÀI LIỆU (MATERIALS VIEW) */}
          {viewMode === 'materials' && (
            selectedMaterial ? (
              // A. CHI TIẾT TÀI LIỆU VÀ KHUNG LÀM BÀI TẬP
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden animate-slide-up flex flex-col max-w-5xl mx-auto">
                {/* Tiêu đề & banner giới thiệu */}
                <div className="relative p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 text-white shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-emerald-900">
                  <div className="text-left max-w-3xl">
                    <button
                      onClick={handleBackToList}
                      className="mb-4 text-xs font-extrabold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-none border-none cursor-pointer"
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
                      className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-lg transition-all flex items-center gap-1.5 shrink-0 text-center"
                    >
                      📥 Tải Tài Liệu Đính Kèm
                    </a>
                  )}
                </div>

                {/* Layout hai cột: Trái đọc lý thuyết, Phải làm bài tập */}
                <div className="grid grid-cols-1 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
                  {/* CỘT LÝ THUYẾT */}
                  <div className="lg:col-span-3 p-6 sm:p-8 overflow-y-auto max-h-[75vh]">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-5 pb-2 border-b border-slate-100 flex items-center gap-1.5">
                      📖 Lý Thuyết & Hướng Dẫn Chi Tiết
                    </h3>
                    
                    {selectedMaterial.content ? (
                      <div 
                        className="prose prose-slate max-w-none text-slate-655 text-sm leading-relaxed font-medium space-y-4 
                          prose-headings:text-slate-800 prose-headings:font-black prose-headings:tracking-tight
                          prose-h2:text-lg prose-h2:border-l-4 prose-h2:border-emerald-700 prose-h2:pl-3 prose-h2:pt-2
                          prose-h3:text-sm prose-h3:text-emerald-700 prose-h3:font-extrabold prose-strong:text-slate-900"
                        dangerouslySetInnerHTML={{ __html: selectedMaterial.content }}
                      />
                    ) : (
                      <div className="py-12 text-center text-xs text-slate-400 italic">Tài liệu không có nội dung lý thuyết bằng văn bản. Hãy tải file đính kèm để xem chi tiết.</div>
                    )}
                  </div>

                  {/* CỘT KHUNG BÀI TẬP TƯƠNG TÁC */}
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
                                    ? 'bg-emerald-50/50 border-emerald-100 shadow-sm' 
                                    : isIncorrect 
                                      ? 'bg-red-50/50 border-red-100 shadow-sm' 
                                      : 'bg-white border-slate-200/80 shadow-sm'
                                }`}
                              >
                                <div className="flex gap-2">
                                  <span className={`text-[10px] font-black w-5 h-5 rounded-full shrink-0 flex items-center justify-center border ${
                                    isCorrect 
                                      ? 'bg-emerald-500 border-emerald-600 text-white' 
                                      : isIncorrect 
                                        ? 'bg-red-500 border-red-600 text-white' 
                                        : 'bg-slate-100 border-slate-200 text-slate-650'
                                  }`}>
                                    {idx + 1}
                                  </span>
                                  <p className="text-xs font-bold text-slate-800 leading-tight">
                                    {q.questionText}
                                  </p>
                                </div>

                                <div className="mt-3.5 pl-7">
                                  {q.questionType === 'MULTIPLE_CHOICE' ? (
                                    <div className="flex flex-col gap-2">
                                      {(q.options || '').split('|').map((opt, oIdx) => {
                                        const cleanOpt = opt.trim();
                                        const optChar = cleanOpt.charAt(0);
                                        
                                        return (
                                          <label 
                                            key={oIdx} 
                                            className={`flex items-start gap-2.5 p-2 rounded-xl text-[11px] font-bold border cursor-pointer select-none transition-all ${
                                              answers[q.id] === optChar
                                                ? 'border-emerald-700 bg-emerald-50 text-emerald-850'
                                                : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50 text-slate-650'
                                            }`}
                                          >
                                            <input
                                              type="radio"
                                              name={`q_${q.id}`}
                                              value={optChar}
                                              checked={answers[q.id] === optChar}
                                              onChange={() => handleAnswerChange(q.id, optChar)}
                                              disabled={quizResult !== null}
                                              className="accent-emerald-700 shrink-0 mt-0.5"
                                            />
                                            <span>{cleanOpt}</span>
                                          </label>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <input
                                      type="text"
                                      value={answers[q.id] || ''}
                                      onChange={e => handleAnswerChange(q.id, e.target.value)}
                                      placeholder="Điền câu trả lời của bạn..."
                                      disabled={quizResult !== null}
                                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-700 text-xs font-semibold text-slate-800 bg-slate-50/40"
                                    />
                                  )}

                                  {quizResult && (
                                    <div className="mt-3 pt-2.5 border-t border-dashed border-slate-100 flex flex-col gap-1 text-[11px] font-bold animate-fade-in">
                                      <p className={`flex items-center gap-1.5 ${isCorrect ? 'text-emerald-600' : 'text-red-500'}`}>
                                        {isCorrect ? '✓ Câu trả lời đúng!' : '✕ Chưa chính xác!'}
                                        <span className="text-slate-400 font-medium">(Bạn chọn: {answers[q.id] || 'Chưa trả lời'})</span>
                                      </p>
                                      {!isCorrect && (
                                        <p className="text-emerald-605 font-bold">
                                          💡 Đáp án chuẩn: <span className="font-extrabold text-emerald-800">{q.correctAnswer}</span>
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}

                          {quizResult === null ? (
                            <button
                              type="submit"
                              disabled={submittingQuiz}
                              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-850 hover:from-emerald-700 hover:to-emerald-900 text-white text-xs font-black rounded-xl shadow-lg transition-all flex items-center justify-center cursor-pointer border-none mt-8"
                            >
                              {submittingQuiz ? 'Đang chấm điểm...' : '🚀 Nộp Bài Làm & Xem Điểm Số'}
                            </button>
                          ) : (
                            <div className="mt-8 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
                              <div className="text-center">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Kết quả bài làm</span>
                                <h4 className="text-2xl font-black text-slate-800 mt-1 flex items-center justify-center gap-1.5">
                                  🏆 Điểm số: <span className="text-emerald-700">{quizResult.score.toFixed(1)}/10</span>
                                </h4>
                                <p className="text-[11px] text-slate-400 font-bold mt-1">
                                  Trả lời đúng {quizResult.correctCount}/{quizResult.totalQuestions} câu hỏi.
                                </p>
                              </div>
                              
                              <button
                                type="button"
                                onClick={handleRedoQuiz}
                                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-all shadow cursor-pointer border-none flex items-center justify-center gap-1"
                              >
                                🔄 Làm Lại Bài Tập Này
                              </button>
                            </div>
                          )}
                        </form>
                      ) : (
                        <div className="py-12 text-center text-xs text-slate-400 italic bg-white rounded-2xl border border-slate-100 shadow-sm animate-fade-in">
                          Tài liệu học tập này hiện chưa có bài tập đính kèm.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // DANH SÁCH TÀI LIỆU
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center max-w-md">
                  <span className="text-slate-400 mr-2 text-xs">🔍</span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Nhập chủ đề tài liệu bạn quan tâm..."
                    className="w-full bg-transparent focus:outline-none text-xs text-slate-850 placeholder-slate-400 font-semibold"
                  />
                </div>

                {loading ? (
                  <div className="py-16 flex flex-col items-center justify-center gap-3">
                    <div className="w-8 h-8 border-3 border-emerald-700 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs font-bold text-slate-400">Đang đồng bộ dữ liệu tài liệu...</p>
                  </div>
                ) : filteredMaterials.length === 0 ? (
                  <div className="py-16 text-center text-slate-400 font-bold text-xs bg-white rounded-3xl border border-slate-100 shadow-sm">
                    Chưa tìm thấy tài liệu phù hợp với chủ đề tìm kiếm.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMaterials.map(mat => (
                      <div 
                        key={mat.id}
                        className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-200 group cursor-pointer text-left"
                        onClick={() => handleSelectMaterial(mat.id)}
                      >
                        <div>
                          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-lg shadow-sm border border-emerald-100 group-hover:bg-[#064e3b] group-hover:text-white transition-all">
                            📚
                          </div>
                          
                          <h3 className="text-xs sm:text-sm font-black text-slate-800 mt-4 leading-snug group-hover:text-emerald-800 transition-all line-clamp-1" title={mat.title}>
                            {mat.title}
                          </h3>
                          
                          <p className="text-slate-555 text-[10px] sm:text-[11px] font-semibold mt-2 line-clamp-3 leading-relaxed">
                            {mat.description}
                          </p>
                        </div>

                        <div className="flex justify-between items-center mt-5 pt-3 border-t border-slate-50 text-[10px] font-black text-emerald-700">
                          <span>Học & Làm bài tập ➔</span>
                          <span className="text-slate-400 font-bold">Miễn phí</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          )}

          {/* Video Modal Player Popup */}
          {activeVideo && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-slate-950 rounded-3xl overflow-hidden shadow-2xl max-w-3xl w-full border border-slate-800 animate-slide-up flex flex-col">
                <div className="p-4 bg-slate-900 text-white flex justify-between items-center border-b border-slate-800">
                  <h3 className="text-xs sm:text-sm font-black truncate max-w-md">{activeVideo.title}</h3>
                  <button
                    onClick={() => setActiveVideo(null)}
                    className="w-8 h-8 rounded-full bg-slate-850 hover:bg-slate-800 text-white flex items-center justify-center font-bold text-xs cursor-pointer border-none"
                  >
                    ✕
                  </button>
                </div>
                
                {/* Aspect Ratio Video container */}
                <div className="relative aspect-video w-full bg-black">
                  <iframe
                    src={activeVideo.videoUrl}
                    title={activeVideo.title}
                    className="absolute inset-0 w-full h-full border-none"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                
                <div className="p-5 text-left bg-slate-900 text-slate-400">
                  <p className="text-[10px] text-emerald-400 font-black uppercase tracking-wider flex items-center gap-2">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Thời lượng: {activeVideo.duration}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-emerald-450"><Eye className="w-3.5 h-3.5" /> {activeVideo.views}</span>
                  </p>
                  <h4 className="text-xs font-bold text-slate-300 mt-2 leading-relaxed">
                    Bài học được thiết kế đặc quyền bởi chuyên gia học vụ của EduEnglish để hỗ trợ tự học trực tuyến hiệu quả.
                  </h4>
                </div>
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
}

export default FreeMaterialsPortal;
