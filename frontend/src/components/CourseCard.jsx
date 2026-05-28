import React from 'react';

// Component này chỉ nhận vào 1 khóa học và 2 hàm hành động (Sửa, Xóa)
function CourseCard({ course, onEdit, onDelete }) {
  return (
    <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
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
        <button onClick={() => onEdit(course)} style={{ flex: 1, padding: '8px', backgroundColor: '#ffc107', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          Sửa
        </button>
        <button onClick={() => onDelete(course.id)} style={{ flex: 1, padding: '8px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          Xóa
        </button>
      </div>
    </div>
  );
}

export default CourseCard;