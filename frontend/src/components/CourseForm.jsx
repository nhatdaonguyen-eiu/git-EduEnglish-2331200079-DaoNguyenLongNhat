import React from 'react';

function CourseForm({ formData, onChange, onSubmit, editingId, onCancel }) {
  return (
    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', maxWidth: '600px', margin: '0 auto 30px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
      <h2 style={{ marginTop: 0 }}>{editingId ? "✏️ Cập Nhật Khóa Học" : "✨ Thêm Khóa Học Mới"}</h2>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        <input type="text" name="title" value={formData.title} onChange={onChange} placeholder="Tên khóa học (VD: IELTS 7.0)" required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
        
        <textarea name="description" value={formData.description} onChange={onChange} placeholder="Mô tả khóa học..." rows="3" style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <select name="level" value={formData.level} onChange={onChange} style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
          
          <select name="category" value={formData.category} onChange={onChange} style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
            <option value="IELTS">IELTS</option>
            <option value="TOEIC">TOEIC</option>
            <option value="Giao tiếp">Giao tiếp</option>
          </select>
        </div>

        <input type="number" name="price" value={formData.price} onChange={onChange} placeholder="Giá tiền (VD: 5000000)" required min="0" style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: editingId ? '#007bff' : '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            {editingId ? "Lưu Thay Đổi" : "Tạo Khóa Học"}
          </button>
          {editingId && (
            <button type="button" onClick={onCancel} style={{ flex: 1, padding: '10px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              Hủy Bỏ
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default CourseForm;