import { useState, useEffect } from 'react';
import axios from 'axios';
// Nhập khẩu các mảnh ghép Lego từ thư mục components
import CourseForm from './components/CourseForm';
import CourseCard from './components/CourseCard';

function App() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Trạng thái Form nhập liệu
  const initialForm = { title: '', description: '', level: 'Beginner', category: 'IELTS', price: '', thumbnailUrl: '' };
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  // Trạng thái tìm kiếm & bộ lọc khóa học
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('');
  const [category, setCategory] = useState('');

  // Cơ chế Debounce tìm kiếm thông minh giúp giảm tải cho database
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCourses();
    }, 250); // Đợi người dùng dừng gõ 250ms mới gọi API

    return () => clearTimeout(delayDebounceFn);
  }, [search, level, category]);

  // Hàm gọi API lấy danh sách khóa học có truyền tham số lọc
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/api/courses', {
        params: {
          search: search || null,
          level: level || null,
          category: category || null
        }
      });
      setCourses(response.data);
    } catch (error) {
      console.error("Lỗi kết nối Backend:", error);
    } finally {
      setLoading(false);
    }
  };

  // Submit tạo mới hoặc cập nhật khóa học
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://localhost:8080/api/courses/${editingId}`, formData);
        alert("🎉 Đã cập nhật khóa học thành công!");
      } else {
        await axios.post('http://localhost:8080/api/courses', formData);
        alert("✨ Đã thêm khóa học mới thành công!");
      }
      setFormData(initialForm);
      setEditingId(null);
      fetchCourses();
    } catch (error) {
      alert("❌ Có lỗi xảy ra khi lưu khóa học!");
    }
  };

  // Xóa mềm khóa học
  const handleDelete = async (id) => {
    if (!window.confirm("⚠️ Bạn có chắc chắn muốn xóa khóa học này không?")) return;
    try {
      await axios.delete(`http://localhost:8080/api/courses/${id}`);
      fetchCourses();
    } catch (error) {
      alert("❌ Không thể xóa khóa học này.");
    }
  };

  // Cập nhật giá trị nhập trong các input của form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Khi click Sửa khóa học
  const handleEditClick = (course) => {
    setEditingId(course.id);
    setFormData({ 
      title: course.title, 
      description: course.description, 
      level: course.level, 
      category: course.category, 
      price: course.price,
      thumbnailUrl: course.thumbnailUrl || ''
    });
    // Cuộn trang mượt mà lên trên cùng nơi chứa Form sửa
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Hủy chế độ sửa
  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(initialForm);
  };

  // Reset toàn bộ bộ lọc
  const handleClearFilters = () => {
    setSearch('');
    setLevel('');
    setCategory('');
  };

  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen font-sans pb-20 selection:bg-orange-500 selection:text-white">
      {/* 1. TIÊU ĐỀ TRANG CỰC KỲ CAO CẤP */}
      <header className="py-10 text-center max-w-5xl mx-auto px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 rounded-full border border-orange-100 text-orange-600 text-xs font-bold mb-3 animate-pulse">
          ⚡ EDUENGLISH PORTAL
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-800 via-slate-900 to-slate-950 bg-clip-text text-transparent">
          EduEnglish Dashboard
        </h1>
        <p className="text-slate-500 text-sm mt-2 font-medium">
          Hệ thống quản lý chương trình đào tạo & khóa học chuẩn quốc tế
        </p>
      </header>

      {/* 2. FORM THÊM / CẬP NHẬT */}
      <div className="px-4">
        <CourseForm 
          formData={formData} 
          onChange={handleInputChange} 
          onSubmit={handleSubmit} 
          editingId={editingId} 
          onCancel={handleCancelEdit} 
        />
      </div>

      {/* 3. THANH TÌM KIẾM & BỘ LỌC DỮ LIỆU ĐỘNG */}
      <div className="max-w-5xl mx-auto px-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-end">
          
          {/* Ô TÌM KIẾM TỪ KHÓA */}
          <div className="w-full md:flex-1 flex flex-col gap-1.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tìm kiếm</span>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Tìm tên hoặc mô tả khóa học..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm text-slate-800 placeholder-slate-400 bg-slate-50/50"
              />
              <span className="absolute left-3 top-3.5 text-xs text-slate-400">🔍</span>
            </div>
          </div>

          {/* CHỌN CẤP ĐỘ */}
          <div className="w-full sm:w-1/2 md:w-48 flex flex-col gap-1.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cấp độ</span>
            <select 
              value={level} 
              onChange={(e) => setLevel(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm text-slate-700 bg-slate-50/50 font-medium cursor-pointer"
            >
              <option value="">Tất cả Cấp độ</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          {/* CHỌN DANH MỤC */}
          <div className="w-full sm:w-1/2 md:w-48 flex flex-col gap-1.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Danh mục</span>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm text-slate-700 bg-slate-50/50 font-medium cursor-pointer"
            >
              <option value="">Tất cả Danh mục</option>
              <option value="IELTS">IELTS</option>
              <option value="TOEIC">TOEIC</option>
              <option value="Giao tiếp">Giao tiếp</option>
            </select>
          </div>

          {/* NÚT LÀM MỚI BỘ LỌC */}
          {(search || level || category) && (
            <button 
              onClick={handleClearFilters}
              className="w-full sm:w-auto px-4 py-2.5 text-sm font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-xl transition-all cursor-pointer border border-orange-100 text-center flex items-center justify-center gap-1.5"
            >
              🔄 Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* 4. HIỂN THỊ DANH SÁCH KHÓA HỌC */}
      <main className="max-w-5xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-3">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            📚 Danh Sách Khóa Học Đang Mở 
            <span className="px-2.5 py-0.5 bg-slate-200/60 rounded-full text-xs font-bold text-slate-600">
              {courses.length}
            </span>
          </h2>
        </div>
        
        {loading ? (
          // HIỆU ỨNG LOADING SPINNER TRANG NHÃ
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-semibold text-slate-400">Đang đồng bộ dữ liệu từ hệ thống...</p>
          </div>
        ) : courses.length === 0 ? (
          // GIAO DIỆN KHÔNG CÓ DỮ LIỆU ĐẸP MẮT
          <div className="py-20 bg-white rounded-3xl border border-slate-100 shadow-sm text-center max-w-lg mx-auto px-6">
            <div className="text-4xl mb-3">🎓</div>
            <h3 className="text-base font-bold text-slate-700">Không tìm thấy khóa học nào</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">
              Vui lòng đổi từ khóa hoặc điều kiện lọc để hiển thị nhiều chương trình đào tạo hơn.
            </p>
            {(search || level || category) && (
              <button 
                onClick={handleClearFilters}
                className="mt-4 px-4 py-2 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-all cursor-pointer shadow-md shadow-orange-500/10"
              >
                Reset Bộ Lọc
              </button>
            )}
          </div>
        ) : (
          // HIỂN THỊ DANH SÁCH LƯỚI
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard 
                key={course.id} 
                course={course} 
                onEdit={handleEditClick} 
                onDelete={handleDelete} 
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;