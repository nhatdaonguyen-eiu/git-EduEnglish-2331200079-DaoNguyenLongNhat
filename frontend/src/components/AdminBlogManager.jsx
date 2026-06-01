import { useState, useEffect } from 'react';
import axios from 'axios';
import RichTextEditor from './RichTextEditor';

// Component Quản lý Bài viết Blog SEO dành riêng cho Admin
function AdminBlogManager() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Cấu trúc Form quản lý bài viết
  const initialForm = {
    title: '',
    summary: '',
    content: '',
    ctaText: 'Nhận lộ trình học thử miễn phí ngay',
    ctaLink: '#register-section',
    thumbnailUrl: ''
  };
  const [formData, setFormData] = useState(initialForm);

  // Trạng thái cho mục FAQs động
  const [faqs, setFaqs] = useState([{ q: '', a: '' }]);

  // Lấy danh sách bài viết
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:8080/api/blogs');
      setBlogs(res.data);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách blog:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Xử lý thay đổi các trường cơ bản
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Thay đổi ảnh bìa qua API Upload
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('file', file);

    try {
      setUploading(true);
      const res = await axios.post('http://localhost:8080/api/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData((prev) => ({ ...prev, thumbnailUrl: res.data.url }));
    } catch (err) {
      alert('❌ Không thể upload hình ảnh. Vui lòng thử lại!');
    } finally {
      setUploading(false);
    }
  };

  // Quản lý FAQs động
  const handleFaqChange = (index, field, value) => {
    const newFaqs = [...faqs];
    newFaqs[index][field] = value;
    setFaqs(newFaqs);
  };

  const addFaq = () => {
    setFaqs([...faqs, { q: '', a: '' }]);
  };

  const removeFaq = (index) => {
    if (faqs.length === 1) {
      setFaqs([{ q: '', a: '' }]);
    } else {
      setFaqs(faqs.filter((_, i) => i !== index));
    }
  };

  // Lưu bài viết (Tạo mới hoặc Cập nhật)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra xem nội dung HTML có rỗng hay không
    const isHtmlEmpty = (html) => {
      if (!html) return true;
      const text = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, '').trim();
      return text === '' && !html.includes('<img');
    };

    if (!formData.title || isHtmlEmpty(formData.summary) || isHtmlEmpty(formData.content)) {
      alert('⚠️ Vui lòng nhập đầy đủ Tiêu đề, Mở bài và Thân bài!');
      return;
    }

    // Lọc bỏ FAQs trống trước khi lưu
    const cleanFaqs = faqs.filter(f => f && !isHtmlEmpty(f.q) && !isHtmlEmpty(f.a));

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        faq: JSON.stringify(cleanFaqs)
      };

      if (editingId) {
        await axios.put(`http://localhost:8080/api/blogs/${editingId}`, payload);
        alert('🎉 Đã cập nhật bài viết SEO thành công!');
      } else {
        await axios.post('http://localhost:8080/api/blogs', payload);
        alert('✨ Đã xuất bản bài viết SEO mới thành công!');
      }

      setFormData(initialForm);
      setFaqs([{ q: '', a: '' }]);
      setEditingId(null);
      fetchBlogs();
    } catch (err) {
      console.error('❌ Lỗi chi tiết khi lưu bài viết:', err);
      const errMsg = err.response?.data?.message || err.response?.data || err.message;
      alert(`❌ Có lỗi xảy ra khi lưu bài viết: ${errMsg}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Click nút sửa
  const handleEditClick = (blog) => {
    setEditingId(blog.id);
    setFormData({
      title: blog.title,
      summary: blog.summary,
      content: blog.content,
      ctaText: blog.ctaText || 'Nhận lộ trình học thử miễn phí ngay',
      ctaLink: blog.ctaLink || '#register-section',
      thumbnailUrl: blog.thumbnailUrl || ''
    });

    // Parse FAQ
    try {
      if (blog.faq) {
        const parsed = JSON.parse(blog.faq);
        setFaqs(parsed.length > 0 ? parsed : [{ q: '', a: '' }]);
      } else {
        setFaqs([{ q: '', a: '' }]);
      }
    } catch (e) {
      setFaqs([{ q: '', a: '' }]);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Click xóa mềm
  const handleDeleteClick = async (id) => {
    if (!window.confirm('⚠️ Bạn có chắc chắn muốn gỡ bỏ bài viết SEO này không?')) return;
    try {
      await axios.delete(`http://localhost:8080/api/blogs/${id}`);
      fetchBlogs();
    } catch (err) {
      alert('❌ Không thể gỡ bỏ bài viết.');
    }
  };

  // Hủy chế độ sửa
  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(initialForm);
    setFaqs([{ q: '', a: '' }]);
  };

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-8 animate-fade-in">
      
      {/* 1. BIỂU MẪU VIẾT BÀI CHUẨN SEO */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2 relative z-10">
          {editingId ? '✏️ Hiệu Chỉnh Bài Viết SEO' : '✍️ Soạn Thảo Bài Viết Chuẩn SEO Mới'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10 text-left">
          
          {/* Tiêu đề & Ảnh bìa */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-2 flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                🏷️ Tiêu đề bài viết (Từ khóa chính - Dạng người dùng tìm kiếm)
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Ví dụ: Học IELTS từ 0 lên 6.5 mất bao lâu? Lộ trình tự học cực chi tiết"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm text-slate-800 font-semibold bg-slate-50/50"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                🖼️ Ảnh bìa minh họa (Banner)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="thumbnailUrl"
                  value={formData.thumbnailUrl}
                  onChange={handleInputChange}
                  placeholder="URL ảnh bìa..."
                  className="flex-grow px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-xs text-slate-800 bg-slate-50/50"
                />
                <label className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center justify-center shrink-0 shadow shadow-orange-500/10">
                  {uploading ? '...' : 'Upload'}
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={uploading} />
                </label>
              </div>
            </div>
          </div>

          {/* Mở bài nhanh (Google Helpful Content Summary) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                💬 Mở bài ngắn (Trả lời ngay thắc mắc trong 2-3 câu ngắn gọn)
              </label>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">★ Đánh giá tốt cho SEO</span>
            </div>
            <RichTextEditor
              value={formData.summary}
              onChange={(val) => setFormData((prev) => ({ ...prev, summary: val }))}
              placeholder="Trả lời trực diện câu hỏi của tiêu đề ngay từ 2-3 câu đầu tiên. Google cực kỳ ưu tiên các câu trả lời ngắn này để cho lên Featured Snippet."
              minHeight="100px"
              showHeadings={false}
              showLists={false}
            />
          </div>

          {/* Thân bài dạng Rich Text Editor soạn thảo Word cao cấp */}
          <div className="flex flex-col gap-1.5 text-left">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                📖 Thân bài chi tiết (Công cụ soạn thảo Word chuyên nghiệp)
              </label>
              <span className="text-[10px] font-bold text-orange-500">Google Ưu Tiên Thẻ H2/H3</span>
            </div>
            <RichTextEditor
              value={formData.content}
              onChange={(val) => setFormData((prev) => ({ ...prev, content: val }))}
              placeholder="Bắt đầu viết nội dung bài giảng bổ ích tại đây..."
              minHeight="300px"
              showHeadings={true}
              showLists={true}
            />
          </div>

          {/* FAQS DÂN CHƠI SEO */}
          <div className="border border-slate-200/60 bg-slate-50/40 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                🙋 Câu Hỏi Thường Gặp (FAQs - Tốt cho Google Featured Snippets)
              </h3>
              <button
                type="button"
                onClick={addFaq}
                className="px-3 py-1 bg-orange-50 hover:bg-orange-100 text-orange-600 hover:text-orange-700 text-xs font-bold rounded-lg border border-orange-200/50 cursor-pointer"
              >
                ＋ Thêm câu hỏi
              </button>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white p-4 rounded-xl border border-slate-100 flex flex-col gap-3 relative shadow-sm">
                  <button
                    type="button"
                    onClick={() => removeFaq(index)}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-600 flex items-center justify-center font-bold text-xs cursor-pointer border-none"
                    title="Gỡ bỏ câu này"
                  >
                    ✕
                  </button>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Câu hỏi {index + 1}</span>
                    <RichTextEditor
                      value={faq.q}
                      onChange={(val) => handleFaqChange(index, 'q', val)}
                      placeholder="Ví dụ: Tự học IELTS lên 6.5 mất bao lâu?"
                      minHeight="60px"
                      showHeadings={false}
                      showLists={false}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Câu trả lời {index + 1}</span>
                    <RichTextEditor
                      value={faq.a}
                      onChange={(val) => handleFaqChange(index, 'a', val)}
                      placeholder="Ví dụ: Trung bình dao động từ 6 đến 9 tháng tùy nền tảng ban đầu..."
                      minHeight="90px"
                      showHeadings={false}
                      showLists={false}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Kêu gọi hành động (CTA) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                📣 Chữ kêu gọi hành động (CTA Button)
              </label>
              <input
                type="text"
                name="ctaText"
                value={formData.ctaText}
                onChange={handleInputChange}
                placeholder="Ví dụ: Đăng ký nhận lộ trình học IELTS 6.5 ngay"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-xs font-semibold text-slate-800"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                🔗 Liên kết CTA
              </label>
              <input
                type="text"
                name="ctaLink"
                value={formData.ctaLink}
                onChange={handleInputChange}
                placeholder="Mặc định cuộn về form tư vấn (#register-section)"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-xs font-semibold text-slate-800"
              />
            </div>
          </div>

          {/* Submit buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-slate-100">
            <button
              type="submit"
              disabled={submitting}
              className={`flex-1 py-3 px-5 text-sm font-bold text-white rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center cursor-pointer ${
                editingId
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-blue-500/10'
                  : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-orange-500/10'
              } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : editingId ? (
                '💾 Lưu Bài Viết SEO'
              ) : (
                '🚀 Xuất Bản Bài Viết SEO'
              )}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="py-3 px-6 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer text-center"
              >
                Hủy Chỉnh Sửa
              </button>
            )}
          </div>
        </form>
      </div>

      {/* 2. DANH SÁCH BÀI VIẾT HIỆN TẠI */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
        <h2 className="text-lg font-black text-slate-800 flex items-center gap-2 mb-6 text-left">
          📰 Bản Tin & Bài Viết SEO Đang Xuất Bản
          <span className="px-2.5 py-0.5 bg-slate-100 rounded-full text-xs font-bold text-slate-500">
            {blogs.length}
          </span>
        </h2>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-semibold text-slate-400">Đang đồng bộ dữ liệu bài viết...</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="py-12 text-center text-slate-400 font-medium">
            Chưa có bài viết SEO nào. Hãy tạo bài đầu tiên phía trên!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {blogs.map((blog) => (
              <div
                key={blog.id}
                className="p-5 rounded-2xl border border-slate-100 bg-slate-50/20 flex gap-4 hover:border-orange-500/20 hover:bg-slate-50 transition-all shadow-sm text-left items-start"
              >
                {/* Banner nhỏ */}
                <div className="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden border border-slate-200/50 shrink-0">
                  <img
                    src={blog.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200'}
                    alt="Banner"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Nội dung bài viết */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-black text-slate-800 line-clamp-1" title={blog.title}>
                    {blog.title}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5 truncate">
                    🔗 Slug: <span className="font-mono text-orange-500 font-semibold">/blogs/slug/{blog.slug}</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {blog.summary ? blog.summary.replace(/<[^>]*>/g, '') : ''}
                  </p>

                  <div className="flex items-center gap-3 mt-3.5 pt-2 border-t border-slate-100/60 justify-end">
                    <button
                      onClick={() => handleEditClick(blog)}
                      className="px-3 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg cursor-pointer border-none"
                    >
                      ✏️ Sửa bài
                    </button>
                    <button
                      onClick={() => handleDeleteClick(blog.id)}
                      className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg cursor-pointer border-none"
                    >
                      🗑️ Gỡ bỏ
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default AdminBlogManager;
