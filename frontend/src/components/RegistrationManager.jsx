import React, { useState, useEffect } from 'react';
import axios from 'axios';

function RegistrationManager() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Trạng thái mở xem chi tiết ghi chú lời nhắn
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('http://localhost:8080/api/registrations');
      setRegistrations(response.data);
    } catch (err) {
      console.error("Lỗi lấy danh sách đăng ký học:", err);
      setError('Không thể kết nối đến máy chủ để lấy danh sách đăng ký.');
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật nhanh trạng thái tư vấn của học viên
  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`http://localhost:8080/api/registrations/${id}/status`, null, {
        params: { status: newStatus }
      });
      // Cập nhật lại danh sách ngay lập tức trên UI
      setRegistrations(prev => prev.map(reg => reg.id === id ? { ...reg, status: newStatus } : reg));
    } catch (err) {
      alert("Lỗi khi cập nhật trạng thái chăm sóc!");
      console.error(err);
    }
  };

  // Xóa mềm thông tin đăng ký học
  const handleDelete = async (id) => {
    if (!window.confirm("⚠️ Bạn có chắc chắn muốn ẩn bản ghi đăng ký này khỏi hệ thống?")) return;
    try {
      await axios.delete(`http://localhost:8080/api/registrations/${id}`);
      setRegistrations(prev => prev.filter(reg => reg.id !== id));
    } catch (err) {
      alert("Không thể xóa thông tin đăng ký.");
      console.error(err);
    }
  };

  // Lấy màu sắc tương ứng cho badge trạng thái
  const getStatusColor = (status) => {
    switch (status) {
      case 'ENROLLED':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'CONTACTED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'CANCELLED':
        return 'bg-red-50 text-red-700 border-red-200';
      default: // PENDING
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  // Dịch trạng thái sang tiếng Việt thân thiện
  const translateStatus = (status) => {
    switch (status) {
      case 'ENROLLED': return '🟢 Đã Nhập Học';
      case 'CONTACTED': return '🔵 Đã Liên Hệ';
      case 'CANCELLED': return '🔴 Hủy Đăng Ký';
      default: return '🟡 Đang Chờ';
    }
  };

  // Định dạng ngày giờ hiển thị
  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return '';
    const date = new Date(dateTimeStr);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-5xl mx-auto shadow-sm border border-slate-100 animate-fade-in">
      <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
          📞 Quản Lý Đăng Ký Tư Vấn & Học Thử
          <span className="px-2.5 py-0.5 bg-slate-100 text-slate-500 rounded-full text-xs font-bold">
            {registrations.length}
          </span>
        </h2>
        <button 
          onClick={fetchRegistrations}
          className="px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-800 rounded-xl transition-all cursor-pointer border border-slate-200/50 flex items-center gap-1"
        >
          🔄 Làm mới
        </button>
      </div>

      {error && (
        <div className="p-4 mb-5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm font-semibold flex gap-2">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-slate-400 font-semibold">Đang nạp danh sách đăng ký...</span>
        </div>
      ) : registrations.length === 0 ? (
        <div className="py-16 text-center max-w-md mx-auto">
          <div className="text-4xl">📭</div>
          <h3 className="text-base font-bold text-slate-700 mt-3">Chưa có lượt đăng ký nào</h3>
          <p className="text-xs text-slate-400 mt-1">Các biểu mẫu đăng ký tư vấn từ Cổng học viên sẽ tự động xuất hiện tại đây.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-slate-55 bg-slate-50/70 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-4 px-4">Học Viên</th>
                <th className="py-4 px-4">Liên Hệ</th>
                <th className="py-4 px-4">Khóa Học Đăng Ký</th>
                <th className="py-4 px-4">Trạng Thái</th>
                <th className="py-4 px-4 text-right">Tác Vụ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {registrations.map((reg) => (
                <React.Fragment key={reg.id}>
                  <tr className="hover:bg-slate-50/30 transition-colors">
                    {/* HỌ TÊN VÀ THỜI GIAN */}
                    <td className="py-4 px-4">
                      <p className="font-extrabold text-slate-800">{reg.fullName}</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-1">
                        📅 {formatDateTime(reg.createdAt)}
                      </p>
                    </td>

                    {/* LIÊN HỆ */}
                    <td className="py-4 px-4">
                      <p className="font-semibold text-slate-600">{reg.phoneNumber}</p>
                      <p className="text-xs text-slate-400 font-medium select-all mt-0.5">{reg.email}</p>
                    </td>

                    {/* KHÓA HỌC QUAN TÂM */}
                    <td className="py-4 px-4">
                      <span className="text-slate-600 font-semibold text-xs py-1 px-2.5 rounded-lg bg-slate-100/70 border border-slate-200/20 max-w-xs block truncate" title={reg.courseTitle}>
                        {reg.courseTitle}
                      </span>
                    </td>

                    {/* TRẠNG THÁI */}
                    <td className="py-4 px-4">
                      <select 
                        value={reg.status}
                        onChange={(e) => handleStatusChange(reg.id, e.target.value)}
                        className={`text-xs font-bold rounded-full py-1.5 px-3 border cursor-pointer focus:outline-none transition-all ${getStatusColor(reg.status)}`}
                      >
                        <option value="PENDING">🟡 Đang Chờ</option>
                        <option value="CONTACTED">🔵 Đã Liên Hệ</option>
                        <option value="ENROLLED">🟢 Đã Nhập Học</option>
                        <option value="CANCELLED">🔴 Hủy Đăng Ký</option>
                      </select>
                    </td>

                    {/* TÁC VỤ */}
                    <td className="py-4 px-4 text-right flex justify-end gap-2.5 items-center">
                      <button 
                        onClick={() => setExpandedId(expandedId === reg.id ? null : reg.id)}
                        className={`p-1.5 text-xs font-bold rounded-lg cursor-pointer border transition-all ${
                          expandedId === reg.id
                            ? 'bg-orange-500 text-white border-orange-500 hover:bg-orange-600'
                            : 'bg-slate-50 text-slate-500 border-slate-200/50 hover:bg-slate-100 hover:text-slate-700'
                        }`}
                        title="Xem lời nhắn học viên"
                      >
                        💬 Lời nhắn
                      </button>
                      <button 
                        onClick={() => handleDelete(reg.id)}
                        className="p-1.5 text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 rounded-lg cursor-pointer border border-red-100 transition-all"
                        title="Xóa hồ sơ đăng ký"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>

                  {/* DÒNG HIỂN THỊ LỜI NHẮN CHI TIẾT KHI CLICK */}
                  {expandedId === reg.id && (
                    <tr className="bg-slate-50/50">
                      <td colSpan="5" className="py-4 px-6">
                        <div className="rounded-2xl border border-slate-200/40 bg-white p-4 text-xs shadow-inner">
                          <p className="font-bold text-slate-400 uppercase tracking-wider mb-2">Lời nhắn từ học viên:</p>
                          <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line font-semibold">
                            {reg.notes || "Học viên không để lại ghi chú cụ thể."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default RegistrationManager;
