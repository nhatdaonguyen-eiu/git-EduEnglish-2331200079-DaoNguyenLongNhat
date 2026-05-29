import React, { useState } from 'react';
import axios from 'axios';

function CourseForm({ formData, onChange, onSubmit, editingId, onCancel }) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [showRoadmap, setShowRoadmap] = useState(false);

  // Xử lý upload ảnh qua API
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('file', file);

    setUploading(true);
    setUploadError('');

    try {
      const response = await axios.post('http://localhost:8080/api/upload', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Giả lập sự kiện e.target để cập nhật giá trị trong App.jsx
      onChange({
        target: {
          name: 'thumbnailUrl',
          value: response.data.url,
        },
      });
    } catch (err) {
      console.error("Lỗi upload ảnh:", err);
      setUploadError(err.response?.data?.error || 'Không thể tải ảnh lên. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  // Xóa ảnh hiện tại
  const handleRemoveImage = () => {
    onChange({
      target: {
        name: 'thumbnailUrl',
        value: '',
      },
    });
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl mx-auto mb-10 shadow-sm border border-slate-100 transition-all duration-300">
      <h2 className="text-xl sm:text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
        {editingId ? "✏️ Cập Nhật Khóa Học" : "✨ Thêm Khóa Học Mới"}
      </h2>
      
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        {/* TÊN KHÓA HỌC */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tên khóa học</label>
          <input 
            type="text" 
            name="title" 
            value={formData.title} 
            onChange={onChange} 
            placeholder="Ví dụ: IELTS 7.0 mục tiêu đầu ra" 
            required 
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-slate-800 placeholder-slate-400 bg-slate-50/30 font-medium"
          />
        </div>
        
        {/* MÔ TẢ KHÓA HỌC */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mô tả chi tiết</label>
          <textarea 
            name="description" 
            value={formData.description || ''} 
            onChange={onChange} 
            placeholder="Nhập lộ trình học, cam kết kết quả và tài liệu đính kèm..." 
            rows="3" 
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-slate-800 placeholder-slate-400 bg-slate-50/30 font-medium resize-none leading-relaxed"
          />
        </div>
        
        {/* CẤP ĐỘ & DANH MỤC */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cấp độ học viên</label>
            <select 
              name="level" 
              value={formData.level} 
              onChange={onChange} 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-slate-700 bg-slate-50/30 font-semibold cursor-pointer"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Danh mục chương trình</label>
            <select 
              name="category" 
              value={formData.category} 
              onChange={onChange} 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-slate-700 bg-slate-50/30 font-semibold cursor-pointer"
            >
              <option value="IELTS">IELTS</option>
              <option value="TOEIC">TOEIC</option>
              <option value="Giao tiếp">Giao tiếp</option>
            </select>
          </div>
        </div>

        {/* HỌC PHÍ */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Học phí trọn khóa (VNĐ)</label>
          <input 
            type="number" 
            name="price" 
            value={formData.price} 
            onChange={onChange} 
            placeholder="Ví dụ: 4500000" 
            required 
            min="0" 
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-slate-800 placeholder-slate-400 bg-slate-50/30 font-bold"
          />
        </div>

        {/* BỘ CHỌN HÌNH ẢNH MINH HỌA (UPLOADER THỰC TẾ) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ảnh minh họa khóa học</label>
          
          {formData.thumbnailUrl ? (
            // HIỂN THỊ ẢNH ĐÃ UPLOAD & NÚT GỠ BỎ
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-48 bg-slate-50 group shadow-inner">
              <img 
                src={formData.thumbnailUrl} 
                alt="Preview" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
                <label className="px-4 py-2 bg-white/90 hover:bg-white text-slate-800 text-xs font-bold rounded-xl cursor-pointer shadow-md transition-all">
                  Thay ảnh
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
                <button 
                  type="button" 
                  onClick={handleRemoveImage} 
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Xóa ảnh
                </button>
              </div>
            </div>
          ) : (
            // KHU VỰC KÉO THẢ/CHỌN FILE ĐỂ UPLOAD
            <label className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
              uploading 
                ? 'border-orange-300 bg-orange-50/10' 
                : 'border-slate-200 hover:border-orange-500/50 hover:bg-slate-50/30'
            }`}>
              <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} className="hidden" />
              
              {uploading ? (
                // LOADING SPINNER
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-semibold text-orange-600">Đang upload ảnh...</span>
                </div>
              ) : (
                // ICON & TEXT CHỌN FILE
                <>
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-2xl text-orange-500">
                    🖼️
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-700">Chọn một hình ảnh thực tế</p>
                    <p className="text-xs text-slate-400 mt-1">Chấp nhận JPG, PNG, WEBP tối đa 10MB</p>
                  </div>
                </>
              )}
            </label>
          )}
          
          {uploadError && (
            <p className="text-xs font-semibold text-red-500 mt-1">⚠️ {uploadError}</p>
          )}
        </div>

        {/* 🧭 PHẦN THIẾT LẬP LỘ TRÌNH & GIÁO TRÌNH CHI TIẾT (COLLAPSIBLE) */}
        <div className="border border-slate-200/80 rounded-2xl bg-slate-50/40 overflow-hidden transition-all duration-300">
          <button
            type="button"
            onClick={() => setShowRoadmap(!showRoadmap)}
            className="w-full px-5 py-4 flex items-center justify-between font-bold text-slate-700 hover:bg-slate-100/50 transition-all cursor-pointer text-left border-none bg-transparent text-sm"
          >
            <span className="flex items-center gap-2">
              🧭 Lộ Trình & Thông Tin Chi Tiết Khóa Học
            </span>
            <span className="text-slate-400 font-bold text-xs">
              {showRoadmap ? "▼ Thu gọn" : "▶ Mở rộng thiết lập"}
            </span>
          </button>

          {showRoadmap && (
            <div className="p-5 border-t border-slate-200/60 flex flex-col gap-4 animate-fade-in bg-white">
              {/* DỰ KIẾN THỜI LƯỢNG HỌC & ĐỐI TƯỢNG PHÙ HỢP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Thời lượng học</label>
                  <input 
                    type="text" 
                    name="duration" 
                    value={formData.duration || ''} 
                    onChange={onChange} 
                    placeholder="Ví dụ: 3 tháng (36 buổi)" 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-xs font-semibold bg-slate-50/30"
                  />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Ai phù hợp (Đối tượng)</label>
                  <input 
                    type="text" 
                    name="suitableFor" 
                    value={formData.suitableFor || ''} 
                    onChange={onChange} 
                    placeholder="Ví dụ: Người mới bắt đầu, mất gốc Tiếng Anh" 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-xs font-semibold bg-slate-50/30"
                  />
                </div>
              </div>

              {/* MỤC TIÊU ĐẦU RA */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Mục tiêu đầu ra</label>
                <textarea 
                  name="outputGoals" 
                  value={formData.outputGoals || ''} 
                  onChange={onChange} 
                  placeholder="Ví dụ: Đạt tối thiểu 5.5 IELTS hoặc tương đương, tự tin giao tiếp cơ bản..." 
                  rows="2" 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-xs font-medium bg-slate-50/30 resize-none leading-relaxed"
                />
              </div>

              {/* PHƯƠNG PHÁP HỌC & CAM KẾT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Phương pháp giảng dạy</label>
                  <textarea 
                    name="learningMethod" 
                    value={formData.learningMethod || ''} 
                    onChange={onChange} 
                    placeholder="Ví dụ: Thực hành phản xạ 80%, công nghệ tương tác AI..." 
                    rows="2" 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-xs font-medium bg-slate-50/30 resize-none leading-relaxed"
                  />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Cam kết từ trung tâm</label>
                  <textarea 
                    name="commitment" 
                    value={formData.commitment || ''} 
                    onChange={onChange} 
                    placeholder="Ví dụ: Cam kết hoàn 100% học phí hoặc học lại miễn phí nếu không đạt đầu ra..." 
                    rows="2" 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-xs font-medium bg-slate-50/30 resize-none leading-relaxed"
                  />
                </div>
              </div>

              {/* GIÁO TRÌNH & LỘ TRÌNH CHI TIẾT */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Giáo trình & Lộ trình chi tiết từng tuần/chặng</label>
                <textarea 
                  name="syllabus" 
                  value={formData.syllabus || ''} 
                  onChange={onChange} 
                  placeholder={`Tuần 1-2: Củng cố phát âm chuẩn IPA\nTuần 3-6: Xây dựng vốn từ vựng chủ đề quen thuộc\nTuần 7-12: Luyện giải đề thi thực tế...`} 
                  rows="4" 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-xs font-medium bg-slate-50/30 leading-relaxed"
                />
              </div>
            </div>
          )}
        </div>

        {/* NÚT TÁC VỤ GỬI FORM */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4 pt-3 border-t border-slate-100">
          <button 
            type="submit" 
            disabled={uploading}
            className={`flex-1 py-3 px-5 text-sm font-bold text-white rounded-xl transition-all duration-300 shadow-md flex items-center justify-center cursor-pointer ${
              editingId 
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-blue-500/10' 
                : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-orange-500/10'
            } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {editingId ? "💾 Lưu Thay Đổi" : "✨ Tạo Khóa Học"}
          </button>
          
          {editingId && (
            <button 
              type="button" 
              onClick={onCancel} 
              className="flex-1 sm:flex-initial py-3 px-6 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer text-center"
            >
              Hủy Bỏ
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default CourseForm;