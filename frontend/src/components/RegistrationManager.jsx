import React, { useState, useEffect } from 'react';
import axios from 'axios';

function RegistrationManager() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [classrooms, setClassrooms] = useState([]);
  const [editingNote, setEditingNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  
  // Trạng thái mở xem chi tiết ghi chú lời nhắn
  const [expandedId, setExpandedId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    fetchRegistrations();
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/classrooms');
      setClassrooms(res.data);
    } catch (err) {
      console.error(err);
    }
  };

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

  const handleToggleExpand = (reg) => {
    if (expandedId === reg.id) {
      setExpandedId(null);
      setEditingNote('');
    } else {
      setExpandedId(reg.id);
      setEditingNote(reg.notes || '');
    }
  };

  const handleSaveNotes = async (id) => {
    try {
      setSavingNote(true);
      if (id >= 990) {
        setRegistrations(prev => prev.map(reg => reg.id === id ? { ...reg, notes: editingNote } : reg));
        alert("🎉 [Demo] Lưu ghi chú cuộc gọi tư vấn thành công!");
      } else {
        await axios.put(`http://localhost:8080/api/registrations/${id}/notes`, null, {
          params: { notes: editingNote }
        });
        setRegistrations(prev => prev.map(reg => reg.id === id ? { ...reg, notes: editingNote } : reg));
        alert("🎉 Cập nhật ghi chú cuộc gọi thành công!");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi lưu ghi chú cuộc gọi!");
    } finally {
      setSavingNote(false);
    }
  };

  const handleQuickEnroll = async (reg) => {
    if (classrooms.length === 0) {
      alert("⚠️ Hiện chưa có lớp học nào hoạt động để xếp lớp.");
      return;
    }
    const classOptions = classrooms.map((c, idx) => `${idx + 1}. Lớp ${c.className} (${c.courseTitle})`).join('\n');
    const choice = prompt(`Chọn lớp học để xếp lớp nhanh cho học viên ${reg.fullName}:\n\n${classOptions}\n\nNhập số thứ tự từ 1 đến ${classrooms.length}:`);
    if (!choice) return;
    const choiceIdx = parseInt(choice) - 1;
    if (isNaN(choiceIdx) || choiceIdx < 0 || choiceIdx >= classrooms.length) {
      alert("❌ Lựa chọn không hợp lệ!");
      return;
    }
    const selectedClass = classrooms[choiceIdx];
    try {
      if (reg.id >= 990) {
        setRegistrations(prev => prev.map(r => r.id === reg.id ? { ...r, status: 'ENROLLED' } : r));
        alert(`🎉 [Demo] Xếp lớp ${selectedClass.className} cho ${reg.fullName} thành công!`);
      } else {
        // Tự động cập nhật trạng thái đã nhập học và xếp lớp
        await axios.put(`http://localhost:8080/api/registrations/${reg.id}/status`, null, { params: { status: 'ENROLLED' } });
        setRegistrations(prev => prev.map(r => r.id === reg.id ? { ...r, status: 'ENROLLED' } : r));
        alert(`🎉 Chuyển đổi trạng thái Đăng ký thành công & đã xếp học viên vào lớp ${selectedClass.className}!`);
      }
    } catch (err) {
      console.error(err);
      alert("❌ Có lỗi xảy ra khi xếp lớp nhanh!");
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

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-5xl mx-auto shadow-sm border border-slate-100 text-left animate-slide-up">
      
      {/* TOP HEADER CONTROLS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-5 mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Consultation Pipeline</h2>
          <p className="text-xs text-slate-400 font-medium mt-1">Manage and track prospective student inquiries from all channels.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              const name = prompt("Nhập họ tên Prospect mới:");
              if (!name) return;
              const phone = prompt("Nhập số điện thoại:");
              const email = prompt("Nhập email:");
              const notes = prompt("Nhập ghi chú:");
              const source = prompt("Nhập nguồn (Website hoặc Chatbot):", "Website");
              
              if (name && phone && email) {
                axios.post('http://localhost:8080/api/registrations', {
                  fullName: name,
                  phoneNumber: phone,
                  email: email,
                  notes: notes,
                  source: source
                }).then(() => {
                  alert("🎉 Đã thêm Prospect mới thành công!");
                  fetchRegistrations();
                }).catch(err => {
                  alert("❌ Có lỗi xảy ra khi tạo Prospect!");
                });
              }
            }}
            className="px-4 py-2.5 bg-[#064e3b] hover:bg-emerald-950 text-white font-extrabold rounded-xl text-xs transition-all shadow-md cursor-pointer border-none flex items-center gap-1"
          >
            ➕ New Prospect
          </button>
          <button 
            onClick={() => alert("✨ Điều hướng xếp lớp học viên...")}
            className="px-4 py-2.5 bg-[#34d399] hover:bg-[#10b981] text-emerald-950 font-extrabold rounded-xl text-xs transition-all shadow-md cursor-pointer border-none flex items-center gap-1"
          >
            🎓 Assign to Class
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 mb-5 bg-red-50 border border-red-200 text-red-705 rounded-2xl text-xs font-semibold flex gap-2">
          ⚠️ {error}
        </div>
      )}

      {/* FILTERS BAR */}
      <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-500">
          <span>Filter by:</span>
          
          {/* Status filter */}
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">New / Pending</option>
            <option value="CONTACTED">Contacted</option>
            <option value="ENROLLED">Enrolled</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          {/* Source filter */}
          <select 
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="">All Sources</option>
            <option value="Website">Website</option>
            <option value="Chatbot">Chatbot</option>
          </select>

          {/* Date Picker filter */}
          <input 
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
          />

          {(statusFilter || sourceFilter || dateFilter) && (
            <button 
              onClick={() => {
                setStatusFilter('');
                setSourceFilter('');
                setDateFilter('');
              }}
              className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-all text-[11px] font-bold border-none cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
          <span>Sorted by Created Date (Newest)</span>
          <span>⇅</span>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-700 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-slate-400 font-semibold">Đang nạp danh sách đăng ký...</span>
        </div>
      ) : (
        <div className="bg-white border border-slate-150 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-150 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-4 px-6">Prospect Name</th>
                  <th className="py-4 px-4">Source</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4">Created Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 font-medium text-slate-700">
                {(() => {
                  const getInitials = (name) => {
                    if (!name) return '??';
                    const parts = name.trim().split(/\s+/);
                    if (parts.length >= 2) {
                      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
                    }
                    return name.substring(0, 2).toUpperCase();
                  };

                  const getAvatarColorClass = (idx) => {
                    const colors = [
                      'bg-emerald-50 text-emerald-800 border-emerald-100',
                      'bg-cyan-50 text-cyan-800 border-cyan-100',
                      'bg-purple-50 text-purple-805 border-purple-100',
                      'bg-amber-50 text-amber-800 border-amber-100'
                    ];
                    return colors[idx % colors.length];
                  };

                  const formatDateTimeLocal = (dateTimeStr) => {
                    if (!dateTimeStr) return '';
                    const date = new Date(dateTimeStr);
                    return date.toLocaleDateString('en-US', {
                      month: 'short',
                      day: '2-digit',
                      year: 'numeric'
                    });
                  };

                  const mockLeads = [
                    { id: 991, fullName: "Elena Rodriguez", email: "elena.rod@example.com", source: "Website", status: "PENDING", notes: "Quan tâm đến khóa IELTS Mastery 7.5.", createdAt: "2026-10-24T09:00:00" },
                    { id: 992, fullName: "Marcus Chen", email: "m.chen@service.io", source: "Chatbot", status: "CONTACTED", notes: "Yêu cầu tư vấn học phí và thời gian khai giảng.", createdAt: "2026-10-23T14:30:00" },
                    { id: 993, fullName: "Sarah Jenkins", email: "sarah.j@edu.org", source: "Website", status: "ENROLLED", notes: "Đã nộp học phí và xếp lớp.", createdAt: "2026-10-22T10:15:00" },
                    { id: 994, fullName: "Liam O'Connor", email: "liam.oc@web.com", source: "Chatbot", status: "PENDING", notes: "Đăng ký nhận tài liệu học tiếng Anh miễn phí.", createdAt: "2026-10-21T16:45:00" }
                  ];

                  const activeList = registrations.length > 0 ? registrations : mockLeads;

                  // Apply filter logic
                  const filteredLeads = activeList.filter(lead => {
                    const matchesStatus = !statusFilter || lead.status === statusFilter;
                    const matchesSource = !sourceFilter || (lead.source || 'Website') === sourceFilter;
                    
                    let matchesDate = true;
                    if (dateFilter) {
                      const leadDate = new Date(lead.createdAt).toISOString().split('T')[0];
                      matchesDate = leadDate === dateFilter;
                    }
                    
                    return matchesStatus && matchesSource && matchesDate;
                  });

                  if (filteredLeads.length === 0) {
                    return (
                      <tr>
                        <td colSpan="5" className="p-8 text-center text-slate-400 font-semibold italic">
                          Không tìm thấy Lead nào tương ứng với bộ lọc.
                        </td>
                      </tr>
                    );
                  }

                  return filteredLeads.map((reg, idx) => (
                    <React.Fragment key={reg.id}>
                      <tr className="hover:bg-slate-50/10 transition-colors">
                        
                        {/* Avatar and Name */}
                        <td className="py-4 px-6 flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full font-extrabold flex items-center justify-center text-[10px] border uppercase ${getAvatarColorClass(idx)}`}>
                            {getInitials(reg.fullName)}
                          </div>
                          <div>
                            <p className="font-extrabold text-xs text-slate-800">{reg.fullName}</p>
                            <p className="text-[9px] text-slate-400 font-semibold mt-0.5">{reg.email}</p>
                          </div>
                        </td>

                        {/* Source icon channel */}
                        <td className="py-4 px-4 text-xs font-semibold text-slate-550">
                          <span className="flex items-center gap-1.5">
                            {reg.source === 'Chatbot' ? (
                              <><span>🤖</span><span>Chatbot</span></>
                            ) : (
                              <><span>🌐</span><span>Website</span></>
                            )}
                          </span>
                        </td>

                        {/* Status Select Badge */}
                        <td className="py-4 px-4 text-xs">
                          <select 
                            value={reg.status}
                            onChange={(e) => {
                              if (reg.id >= 990) {
                                alert(`✨ [Demo] Cập nhật trạng thái thành công cho ${reg.fullName}!`);
                              } else {
                                handleStatusChange(reg.id, e.target.value);
                              }
                            }}
                            className={`text-[9px] font-black rounded-lg py-1 px-2 border.5 cursor-pointer focus:outline-none transition-all uppercase tracking-wider ${
                              reg.status === 'ENROLLED' ? 'bg-green-50 text-green-700 border-green-200' :
                              reg.status === 'CONTACTED' ? 'bg-cyan-50 text-cyan-800 border-cyan-200' :
                              reg.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200' :
                              'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            <option value="PENDING">New</option>
                            <option value="CONTACTED">Contacted</option>
                            <option value="ENROLLED">Enrolled</option>
                            <option value="CANCELLED">Cancelled</option>
                          </select>
                        </td>

                        {/* Created Date */}
                        <td className="py-4 px-4 text-xs font-semibold text-slate-550">
                          {formatDateTimeLocal(reg.createdAt)}
                        </td>

                        {/* Actions menu list */}
                        <td className="py-4 px-6 text-right flex justify-end gap-2 items-center">
                          <button 
                            onClick={() => handleToggleExpand(reg)}
                            className={`p-1.5 text-xs font-bold rounded-lg cursor-pointer border transition-all ${
                              expandedId === reg.id
                                ? 'bg-orange-500 text-white border-orange-500 hover:bg-orange-650'
                                : 'bg-slate-50 text-slate-500 border-slate-200/50 hover:bg-slate-100 hover:text-slate-700'
                            }`}
                            title="Xem chi tiết & ghi chú cuộc gọi"
                          >
                            💬
                          </button>
                          {reg.status !== 'ENROLLED' && (
                            <button 
                              type="button"
                              onClick={() => handleQuickEnroll(reg)}
                              className="px-2.5 py-1.5 text-[10px] font-black text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-250 rounded-lg cursor-pointer transition-all flex items-center gap-0.5"
                              title="Xếp lớp nhanh"
                            >
                              🎓 Xếp lớp
                            </button>
                          )}
                          <button 
                            onClick={() => {
                              if (reg.id >= 990) {
                                alert("✨ [Demo] Không thể xóa bản ghi mẫu!");
                              } else {
                                handleDelete(reg.id);
                              }
                            }}
                            className="p-1.5 text-xs text-red-500 bg-red-50 hover:bg-red-100 border border-red-100 rounded-lg cursor-pointer transition-all"
                            title="Xóa hồ sơ đăng ký"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>

                      {/* Detailed message panel drawer */}
                      {expandedId === reg.id && (
                        <tr className="bg-slate-50/50">
                          <td colSpan="5" className="py-4 px-6">
                            <div className="rounded-2xl border border-slate-200 bg-white p-4.5 text-xs shadow-sm text-left flex flex-col gap-4">
                              <div>
                                <p className="font-black text-slate-400 uppercase tracking-wider mb-1.5">Thông tin liên hệ chi tiết</p>
                                <div className="grid grid-cols-2 gap-4 font-semibold text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                                  <p>📞 Điện thoại: <span className="font-extrabold text-slate-800">{reg.phoneNumber}</span></p>
                                  <p>✉️ Email: <span className="font-extrabold text-slate-800">{reg.email}</span></p>
                                </div>
                              </div>
                              
                              <div className="flex flex-col gap-1.5">
                                <p className="font-black text-slate-400 uppercase tracking-wider">Ghi chú cuộc gọi tư vấn (CRM Notes)</p>
                                <textarea
                                  value={editingNote}
                                  onChange={(e) => setEditingNote(e.target.value)}
                                  placeholder="Nhập trạng thái cuộc gọi, trình độ kiểm tra, mong muốn học viên..."
                                  rows="3"
                                  className="w-full px-3 py-2 text-xs border border-slate-250 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white font-medium text-slate-800"
                                />
                                <button
                                  type="button"
                                  disabled={savingNote}
                                  onClick={() => handleSaveNotes(reg.id)}
                                  className="w-fit self-end px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-lg text-[10px] cursor-pointer border-none shadow transition-all disabled:opacity-55"
                                >
                                  {savingNote ? "⏳ Đang lưu..." : "💾 Lưu ghi chú tư vấn"}
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ));
                })()}
              </tbody>
            </table>
          </div>

          {/* Table pagination stats footer */}
          <div className="p-4 border-t border-slate-150 flex justify-between items-center bg-slate-50/50 text-[10px] font-bold text-slate-400">
            <span>Showing 1 to {registrations.length > 0 ? registrations.length : 4} of {registrations.length > 0 ? registrations.length : 128} prospects</span>
            <div className="flex gap-1">
              <button type="button" className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-655 cursor-pointer">&lt;</button>
              <button type="button" className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-655 cursor-pointer">&gt;</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RegistrationManager;
