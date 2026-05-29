import React, { useState, useEffect } from 'react';
import axios from 'axios';

function TeacherPortal({ user }) {
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [gradesForm, setGradesForm] = useState({}); // Lưu điểm tạm thời của học viên trước khi lưu

  useEffect(() => {
    fetchTeacherClasses();
  }, [user]);

  const fetchTeacherClasses = async () => {
    try {
      setLoadingClasses(true);
      const response = await axios.get(`http://localhost:8080/api/classrooms/teacher/${user.id}`);
      setClassrooms(response.data);
    } catch (err) {
      console.error("Lỗi lấy danh sách lớp học của giáo viên:", err);
    } finally {
      setLoadingClasses(false);
    }
  };

  // Chọn lớp học và lấy danh sách học viên
  const handleSelectClass = async (classroom) => {
    setSelectedClass(classroom);
    setLoadingStudents(true);
    try {
      const response = await axios.get(`http://localhost:8080/api/classrooms/${classroom.id}/students`);
      setStudents(response.data);
      
      // Khởi tạo form điểm tạm thời
      const initialGrades = {};
      response.data.forEach(student => {
        initialGrades[student.studentId] = student.grade !== null ? student.grade.toString() : '';
      });
      setGradesForm(initialGrades);
    } catch (err) {
      console.error("Lỗi lấy danh sách học viên trong lớp:", err);
      alert("Không thể lấy danh sách học viên.");
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleGradeChange = (studentId, value) => {
    setGradesForm({ ...gradesForm, [studentId]: value });
  };

  // Lưu điểm học viên lẻ lên Backend
  const handleSaveGrade = async (studentId) => {
    const rawGrade = gradesForm[studentId];
    if (rawGrade === '') {
      alert("Vui lòng nhập điểm trước khi lưu!");
      return;
    }

    const parsedGrade = parseFloat(rawGrade);
    if (isNaN(parsedGrade) || parsedGrade < 0 || parsedGrade > 10) {
      alert("Điểm thi thử không hợp lệ. Vui lòng nhập số thuộc thang điểm từ 0.00 đến 10.00!");
      return;
    }

    try {
      await axios.put(`http://localhost:8080/api/classrooms/${selectedClass.id}/students/${studentId}/grade`, null, {
        params: { grade: parsedGrade }
      });
      
      // Cập nhật lại UI danh sách học viên
      setStudents(prev => prev.map(s => s.studentId === studentId ? { ...s, grade: parsedGrade } : s));
      alert("🎉 Cập nhật kết quả điểm thi thử học viên thành công!");
    } catch (err) {
      console.error("Lỗi cập nhật điểm:", err);
      alert(err.response?.data?.message || "Lỗi khi cập nhật điểm học viên.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      
      {/* BANNER CHÀO MỪNG GIÁO VIÊN */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-orange-950 rounded-3xl p-6 sm:p-8 text-white mb-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <span className="px-3 py-1 bg-orange-500/20 text-orange-400 text-[10px] font-bold rounded-full uppercase border border-orange-500/10 tracking-widest">
            🎓 Teacher Dashboard
          </span>
          <h2 className="text-2xl sm:text-3xl font-black mt-4">Chào mừng Giáo viên, {user.fullName}!</h2>
          <p className="text-slate-400 text-sm mt-1.5 font-medium leading-relaxed max-w-xl">
            Phân hệ Giáo viên giúp bạn theo dõi danh sách lớp học được phân công và trực tiếp nhập điểm thi thử đầu ra giả lập (LMS) cho từng học viên.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CỘT 1: DANH SÁCH LỚP HỌC ĐƯỢC PHÂN CÔNG (CHIẾM 1 PHẦN) */}
        <div className="lg:col-span-1 flex flex-col gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-base font-black text-slate-800 border-b border-slate-100 pb-3 mb-4">
              🏫 Lớp Học Phụ Trách
            </h3>

            {loadingClasses ? (
              <div className="py-10 text-center flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-3 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs text-slate-400 font-semibold">Đang lấy lớp học...</span>
              </div>
            ) : classrooms.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-xs font-semibold">
                Chưa được phân công lớp học nào.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {classrooms.map(cls => (
                  <button 
                    key={cls.id}
                    onClick={() => handleSelectClass(cls)}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                      selectedClass?.id === cls.id
                        ? 'border-orange-500 bg-orange-50/20 shadow-md shadow-orange-500/5'
                        : 'border-slate-100 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <p className="font-extrabold text-sm text-slate-800">{cls.className}</p>
                    <span className="inline-block text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded mt-1.5 border border-orange-100/50">
                      {cls.courseTitle}
                    </span>
                    <p className="text-[10px] text-slate-400 font-bold mt-2">
                      🕒 Lịch: {cls.schedule}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CỘT 2: BẢNG CHẤM ĐIỂM HỌC VIÊN CỦA LỚP ĐƯỢC CHỌN (CHIẾM 2 PHẦN) */}
        <div className="lg:col-span-2">
          {selectedClass ? (
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm animate-fade-in flex flex-col">
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-800">
                    👥 Lớp: {selectedClass.className}
                  </h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                    Môn: {selectedClass.courseTitle}
                  </p>
                </div>
                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">
                  Sĩ số: {students.length}
                </span>
              </div>

              {loadingStudents ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-slate-400 font-semibold">Đang lấy danh sách học viên...</span>
                </div>
              ) : students.length === 0 ? (
                <div className="py-20 text-center text-slate-400 font-semibold text-sm">
                  Lớp học này chưa được Admin xếp học viên vào.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse rounded-xl overflow-hidden border border-slate-100">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="p-3">Học Viên</th>
                        <th className="p-3">Điểm Số Hiện Tại</th>
                        <th className="p-3 text-right">Nhập / Sửa Điểm (Thang 10)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {students.map(std => (
                        <tr key={std.studentId} className="hover:bg-slate-50/20 transition-colors">
                          <td className="p-3">
                            <p className="font-extrabold text-slate-800 text-sm">{std.studentName}</p>
                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{std.studentEmail}</p>
                          </td>
                          <td className="p-3">
                            {std.grade !== null ? (
                              <span className="px-2.5 py-1 text-xs font-bold rounded-lg border bg-green-50 text-green-700 border-green-200">
                                {std.grade} / 10
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 text-xs font-bold rounded-lg border bg-slate-50 text-slate-400 border-slate-200/50">
                                Chưa có điểm
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right flex justify-end items-center gap-3">
                            <input 
                              type="number"
                              min="0"
                              max="10"
                              step="0.1"
                              placeholder="VD: 8.5"
                              value={gradesForm[std.studentId] || ''}
                              onChange={(e) => handleGradeChange(std.studentId, e.target.value)}
                              className="w-20 px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-center font-bold text-slate-800 text-xs bg-slate-50/50"
                            />
                            <button 
                              onClick={() => handleSaveGrade(std.studentId)}
                              className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-all text-xs cursor-pointer shadow shadow-orange-500/10 border-none"
                            >
                              Lưu
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            // TRẠNG THÁI CHƯA CHỌN LỚP
            <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center shadow-sm">
              <p className="text-4xl">🏫</p>
              <h3 className="text-base font-bold text-slate-700 mt-4">Vui lòng chọn lớp học phụ trách</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed font-semibold">
                Danh sách học viên và bảng điểm thi thử đầu ra sẽ hiển thị tại đây để bạn bắt đầu thao tác chấm điểm.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

export default TeacherPortal;
