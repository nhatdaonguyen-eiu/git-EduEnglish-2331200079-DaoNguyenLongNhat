import { useState, useEffect } from 'react';
import axios from 'axios';
// Nhập khẩu các mảnh ghép Lego từ thư mục components
import CourseForm from './components/CourseForm';
import CourseCard from './components/CourseCard';

function App() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const initialForm = { title: '', description: '', level: 'Beginner', category: 'IELTS', price: '' };
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://localhost:8080/api/courses/${editingId}`, formData);
        alert("Đã cập nhật khóa học thành công!");
      } else {
        await axios.post('http://localhost:8080/api/courses', formData);
        alert("Đã thêm khóa học mới thành công!");
      }
      setFormData(initialForm);
      setEditingId(null);
      fetchCourses();
    } catch (error) {
      alert("Có lỗi xảy ra!");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa không?")) return;
    try {
      await axios.delete(`http://localhost:8080/api/courses/${id}`);
      fetchCourses();
    } catch (error) {
      alert("Không thể xóa khóa học.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEditClick = (course) => {
    setEditingId(course.id);
    setFormData({ title: course.title, description: course.description, level: course.level, category: course.category, price: course.price });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(initialForm);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', color: '#ff6600', marginBottom: '30px' }}>EduEnglish Dashboard</h1>

      {/* Ráp mảnh ghép Form vào đây */}
      <CourseForm formData={formData} onChange={handleInputChange} onSubmit={handleSubmit} editingId={editingId} onCancel={handleCancelEdit} />

      <h2 style={{ borderBottom: '2px solid #ff6600', paddingBottom: '10px', maxWidth: '1000px', margin: '0 auto' }}>Danh Sách Khóa Học Đang Mở</h2>
      
      {loading ? (
        <p style={{ textAlign: 'center' }}>Đang tải dữ liệu...</p>
      ) : courses.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666' }}>Chưa có khóa học nào.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', maxWidth: '1000px', margin: '20px auto' }}>
          {/* Duyệt mảng và ráp các mảnh ghép Card vào đây */}
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} onEdit={handleEditClick} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

export default App;