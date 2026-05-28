import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  // =====================================================================
  // 1. KHO LƯU TRỮ TRẠNG THÁI (STATE)
  // =====================================================================
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // State quản lý dữ liệu trong Form
  const initialForm = { title: '', description: '', level: 'Beginner', category: 'IELTS', price: '' };
  const [formData, setFormData] = useState(initialForm);
  
  // State để nhận biết: Đang thêm mới (null) hay đang sửa khóa học (chứa ID)
  const [editingId, setEditingId] = useState(null);

  // =====================================================================
  // 2. CÁC HÀM GIAO TIẾP VỚI BACKEND (API)
  // =====================================================================
  
  // Chạy ngay khi mở web
  useEffect(() => {
    fetchCourses();
  }, []);

  // [READ] Lấy danh sách khóa học
  const fetchCourses = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/courses');
      setCourses(response.data);
    } catch (error) {
      console.error("Lỗi kết nối Backend:", error);
    } finally {
      setLoading(false);
    }
  };

  // [CREATE & UPDATE] Xử lý khi bấm nút "Lưu Khóa Học"
  const handleSubmit = async (e) => {
    e.preventDefault(); // Ngăn trình duyệt tự tải lại trang
    
    try {
      if (editingId) {
        // Nếu có editingId -> Gọi API PUT để Sửa
        await axios.put(`http://localhost:8080/api/courses/${editingId}`, formData);
        alert("Đã cập nhật khóa học thành công!");
      } else {
        // Nếu không có editingId -> Gọi API POST để Thêm mới
        await axios.post('http://localhost:8080/api/courses', formData);
        alert("Đã thêm khóa học mới thành công!");
      }
      
      // Thành công thì làm mới danh sách và xóa trắng form
      setFormData(initialForm);
      setEditingId(null);
      fetchCourses();
      
    } catch (error) {
      console.error("Lỗi khi lưu dữ liệu:", error);
      alert("Có lỗi xảy ra! Vui lòng kiểm tra lại thông tin.");
    }
  };

  // [DELETE] Xử lý khi bấm nút "Xóa"
  const handleDelete = async (id) => {
    // Hiện bảng hỏi xác nhận để tránh bấm nhầm
    const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa khóa học này không?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:8080/api/courses/${id}`);
      // Xóa xong thì gọi lại hàm lấy danh sách để giao diện tự cập nhật
      fetchCourses();
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
      alert("Không thể xóa khóa học này.");
    }
  };

  // =====================================================================
  // 3. CÁC HÀM HỖ TRỢ GIAO DIỆN
  // =====================================================================
  
  // Hàm ghi nhận mỗi khi bạn gõ chữ vào ô nhập liệu
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Hàm đổ dữ liệu của khóa học cũ lên Form khi bấm nút "Sửa"
  const handleEditClick = (course) => {
    setEditingId(course.id);
    setFormData({
      title: course.title,
      description: course.description,
      level: course.level,
      category: course.category,
      price: course.price
    });
    // Cuộn trang lên chỗ cái form để dễ sửa
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Hàm hủy bỏ việc sửa, dọn dẹp form
  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(initialForm);
  };

  // =====================================================================
  // 4. BẢN VẼ GIAO DIỆN (JSX)
  // =====================================================================
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', color: '#ff6600', marginBottom: '30px' }}>EduEnglish Dashboard</h1>

      {/* KHU VỰC FORM NHẬP LIỆU */}
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', maxWidth: '600px', margin: '0 auto 30px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginTop: 0 }}>{editingId ? "✏️ Cập Nhật Khóa Học" : "✨ Thêm Khóa Học Mới"}</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="Tên khóa học (VD: IELTS 7.0)" required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
          
          <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Mô tả khóa học..." rows="3" style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <select name="level" value={formData.level} onChange={handleInputChange} style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
            
            <select name="category" value={formData.category} onChange={handleInputChange} style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
              <option value="IELTS">IELTS</option>
              <option value="TOEIC">TOEIC</option>
              <option value="Giao tiếp">Giao tiếp</option>
            </select>
          </div>

          <input type="number" name="price" value={formData.price} onChange={handleInputChange} placeholder="Giá tiền (VD: 5000000)" required min="0" style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: editingId ? '#007bff' : '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              {editingId ? "Lưu Thay Đổi" : "Tạo Khóa Học"}
            </button>
            {editingId && (
              <button type="button" onClick={handleCancelEdit} style={{ flex: 1, padding: '10px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                Hủy Bỏ
              </button>
            )}
          </div>
        </form>
      </div>

      {/* KHU VỰC DANH SÁCH KHÓA HỌC */}
      <h2 style={{ borderBottom: '2px solid #ff6600', paddingBottom: '10px', maxWidth: '1000px', margin: '0 auto' }}>Danh Sách Khóa Học Đang Mở</h2>
      
      {loading ? (
        <p style={{ textAlign: 'center' }}>Đang tải dữ liệu...</p>
      ) : courses.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666' }}>Chưa có khóa học nào. Hãy tạo mới ở form phía trên!</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', maxWidth: '1000px', margin: '20px auto' }}>
          {courses.map((course) => (
            <div key={course.id} style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{course.title}</h3>
              <p style={{ color: '#666', fontSize: '14px', flexGrow: 1 }}>{course.description || "Chưa có mô tả."}</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#888', margin: '10px 0' }}>
                <span>Cấp độ: <strong>{course.level}</strong></span>
                <span>Danh mục: <strong>{course.category}</strong></span>
              </div>

              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#e65c00', textAlign: 'right', borderTop: '1px solid #eee', paddingTop: '10px', marginBottom: '15px' }}>
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.price)}
              </div>

              {/* NÚT TƯƠNG TÁC */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => handleEditClick(course)} style={{ flex: 1, padding: '8px', backgroundColor: '#ffc107', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Sửa
                </button>
                <button onClick={() => handleDelete(course.id)} style={{ flex: 1, padding: '8px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;