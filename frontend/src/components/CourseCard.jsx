import React from 'react';

// Component này nhận vào 1 khóa học và các hàm hành động Sửa/Xóa
function CourseCard({ course, onEdit, onDelete }) {
  // Ảnh mặc định chất lượng cao nếu chưa tải ảnh bìa lên
  const defaultImage = 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600&auto=format&fit=crop&q=60';
  const imageUrl = course.thumbnailUrl || defaultImage;

  // Quyết định màu sắc cho Badge Cấp độ
  const getLevelColor = (level) => {
    switch (level) {
      case 'Advanced':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Intermediate':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-green-50 text-green-700 border-green-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 border border-slate-100 flex flex-col group h-full">
      {/* ẢNH BÌA VÀ BADGES TRÊN ẢNH */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
        <img 
          src={imageUrl} 
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
        />
        {/* Badge Danh mục ở góc trái */}
        <span className="absolute top-3 left-3 px-3 py-1 text-xs font-bold text-white bg-orange-500 rounded-full shadow-md backdrop-blur-sm">
          {course.category}
        </span>
        {/* Badge Cấp độ ở góc phải */}
        <span className={`absolute top-3 right-3 px-3 py-1 text-xs font-bold rounded-full border shadow-md ${getLevelColor(course.level)}`}>
          {course.level}
        </span>
      </div>

      {/* NỘI DUNG THÔNG TIN KHÓA HỌC */}
      <div className="p-5 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800 line-clamp-1 group-hover:text-orange-500 transition-colors duration-200" title={course.title}>
            {course.title}
          </h3>
          <p className="text-slate-500 text-sm mt-2 line-clamp-2 h-10 overflow-hidden leading-relaxed">
            {course.description || "Chưa có mô tả chi tiết cho khóa học này."}
          </p>
        </div>

        <div>
          {/* GIÁ HỌC PHÍ */}
          <div className="flex justify-between items-baseline mt-4 pt-3 border-t border-slate-100">
            <span className="text-xs text-slate-400 font-medium">Học phí trọn khóa</span>
            <span className="text-xl font-black text-orange-500">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.price)}
            </span>
          </div>

          {/* CÁC NÚT TƯƠNG TÁC */}
          <div className="flex gap-3 mt-4">
            <button 
              onClick={() => onEdit(course)} 
              className="flex-1 py-2 px-3 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer border border-amber-200/50"
            >
              ✏️ Sửa
            </button>
            <button 
              onClick={() => onDelete(course.id)} 
              className="flex-1 py-2 px-3 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer border border-red-100"
            >
              🗑️ Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseCard;