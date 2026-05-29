import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ClassroomManager() {
  const [classrooms, setClassrooms] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);

  // Form states
  const [newClass, setNewClass] = useState({ className: '', courseId: '', teacherId: '', schedule: '' });
  const [enrollment, setEnrollment] = useState({ classId: '', studentId: '' });

  // Sub-tabs: 'list' (Danh sách & Tạo lớp), 'enroll' (Xếp lớp học viên)
  const [subTab, setSubTab] = useState('list');
  const [loading, setLoading] = useState(true);
  
  // Trạng thái xem danh sách học viên lớp cụ thể
  const [inspectClass, setInspectClass] = useState(null);
  const [inspectedStudents, setInspectedStudents] = useState([]);
  const [loadingInspect, setLoadingInspect] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [classRes, teacherRes, studentRes, courseRes] = await Promise.all([
        axios.get('http://localhost:8080/api/classrooms'),
        axios.get('http://localhost:8080/api/auth/teachers'),
        axios.get('http://localhost:8080/api/auth/students'),
        axios.get('http://localhost:8080/api/courses')
      ]);

      setClassrooms(classRes.data);
      setTeachers(teacherRes.data);
      setStudents(studentRes.data);
      setCourses(courseRes.data);
      
      // Khởi tạo giá trị mặc định cho dropdown
      if (courseRes.data.length > 0 && teacherRes.data.length > 0) {
        setNewClass({
          className: '',
          courseId: courseRes.data[0].id.toString(),
          teacherId: teacherRes.data[0].id.toString(),
          schedule: 'Thứ 2, 4, 6 | 19:30 - 21:00'
        });
      }
      
      if (classRes.data.length > 0 && studentRes.data.length > 0) {
        setEnrollment({
          classId: classRes.data[0].id.toString(),
          studentId: studentRes.data[0].id.toString()
        });
      }
    } catch (err) {
      console.error("Lỗi tải thông tin lớp học:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClassSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        className: newClass.className,
        courseId: parseInt(newClass.courseId),
        teacherId: parseInt(newClass.teacherId),
        schedule: newClass.schedule
      };

      const response = await axios.post('http://localhost:8080/api/classrooms', payload);
      alert("🎉 Tạo lớp học mới thành công!");
      
      // Cập nhật lại UI
      setClassrooms([...classrooms, response.data]);
      setNewClass({ ...newClass, className: '' });
      
      // Đồng bộ hóa danh sách lớp trong form xếp lớp
      if (classrooms.length === 0) {
        setEnrollment(prev => ({ ...prev, classId: response.data.id.toString() }));
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Có lỗi xảy ra khi tạo lớp học!");
    }
  };

  const handleEnrollSubmit = async (e) => {
    e.preventDefault();
    try {
      const classId = parseInt(enrollment.classId);
      const studentId = parseInt(enrollment.studentId);
      
      await axios.post(`http://localhost:8080/api/classrooms/${classId}/enroll/${studentId}`);
      alert("🎉 Xếp lớp học viên thành công!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Có lỗi xảy ra khi xếp lớp học viên!");
    }
  };

  // Xem danh sách học viên trong 1 lớp học
  const handleInspectClass = async (classroom) => {
    setInspectClass(classroom);
    setLoadingInspect(true);
    try {
      const response = await axios.get(`http://localhost:8080/api/classrooms/${classroom.id}/students`);
      setInspectedStudents(response.data);
    } catch (err) {
      console.error("Lỗi lấy danh sách học viên lớp:", err);
      alert("Không thể lấy danh sách học viên.");
    } finally {
      setLoadingInspect(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-5xl mx-auto shadow-sm border border-slate-100 animate-fade-in flex flex-col">
      
      {/* HEADER & TABS CON */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 border-b border-slate-100 pb-4 gap-4">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
          🏫 Phân Hệ Quản Lý Lớp Học & Đào Tạo
        </h2>
        
        <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200/20 shrink-0">
          <button 
            onClick={() => setSubTab('list')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              subTab === 'list'
                ? 'bg-white text-orange-600 shadow shadow-slate-200/50'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            🏫 Danh Sách & Tạo Lớp
          </button>
          
          <button 
            onClick={() => setSubTab('enroll')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              subTab === 'enroll'
                ? 'bg-white text-orange-600 shadow shadow-slate-200/50'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            👤 Xếp Lớp Học Viên
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-slate-400 font-semibold">Đang lấy dữ liệu quản trị lớp...</span>
        </div>
      ) : (
        <div>
          {subTab === 'list' ? (
            // TAB 1: DANH SÁCH & TẠO LỚP MỚI
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* FORM TẠO LỚP HỌC MỚI (CHIẾM 1 PHẦN) */}
              <div className="lg:col-span-1 bg-slate-50/50 border border-slate-100 rounded-2xl p-5 h-fit">
                <h3 className="text-base font-black text-slate-800 mb-4 flex items-center gap-1.5">
                  ✨ Tạo Lớp Học Mới
                </h3>
                
                {courses.length === 0 || teachers.length === 0 ? (
                  <p className="text-xs text-red-500 font-semibold leading-relaxed">
                    ⚠️ Hệ thống cần có ít nhất 1 khóa học hoạt động và 1 giáo viên để có thể tạo được lớp học.
                  </p>
                ) : (
                  <form onSubmit={handleClassSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tên lớp học</label>
                      <input 
                        type="text" 
                        placeholder="Ví dụ: IELTS-70-C1" 
                        required
                        value={newClass.className}
                        onChange={(e) => setNewClass({ ...newClass, className: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-xs font-semibold bg-white"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Môn / Khóa học</label>
                      <select 
                        value={newClass.courseId}
                        onChange={(e) => setNewClass({ ...newClass, courseId: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none text-xs font-semibold bg-white cursor-pointer"
                      >
                        {courses.map(course => (
                          <option key={course.id} value={course.id}>{course.title} - [{course.category}]</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Giáo viên phụ trách</label>
                      <select 
                        value={newClass.teacherId}
                        onChange={(e) => setNewClass({ ...newClass, teacherId: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none text-xs font-semibold bg-white cursor-pointer"
                      >
                        {teachers.map(teacher => (
                          <option key={teacher.id} value={teacher.id}>{teacher.fullName}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lịch dạy học</label>
                      <input 
                        type="text" 
                        placeholder="Ví dụ: Thứ 2, 4, 6 | 19:30 - 21:00" 
                        required
                        value={newClass.schedule}
                        onChange={(e) => setNewClass({ ...newClass, schedule: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-xs font-semibold bg-white"
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="w-full py-2.5 px-4 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl shadow shadow-orange-500/10 cursor-pointer border-none mt-2"
                    >
                      💾 Tạo lớp học
                    </button>
                  </form>
                )}
              </div>

              {/* LƯỚI DANH SÁCH LỚP HỌC (CHIẾM 2 PHẦN) */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                <h3 className="text-base font-black text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                  🏫 Lớp học đang hoạt động ({classrooms.length})
                </h3>

                {classrooms.length === 0 ? (
                  <div className="py-16 text-center text-slate-400 text-sm font-semibold">
                    Chưa có lớp học nào được tạo.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {classrooms.map(cls => (
                      <div key={cls.id} className="bg-white rounded-2xl border border-slate-150 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                        <div>
                          <p className="font-extrabold text-slate-800 text-base">{cls.className}</p>
                          <span className="inline-block text-[9px] font-bold text-orange-500 bg-orange-50 border border-orange-100/50 px-2 py-0.5 rounded mt-1.5">
                            {cls.courseTitle}
                          </span>
                          <p className="text-[10px] text-slate-500 font-bold mt-3">
                            👨‍🏫 GV: <strong className="text-slate-700">{cls.teacherName || "Chưa phân công"}</strong>
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold mt-1.5">
                            🕒 Lịch: {cls.schedule}
                          </p>
                        </div>
                        
                        <div className="mt-4 pt-3 border-t border-slate-100 text-right">
                          <button 
                            onClick={() => handleInspectClass(cls)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 font-bold rounded-lg text-xs cursor-pointer border border-slate-200/30"
                          >
                            👥 Học viên lớp
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          ) : (
            // TAB 2: XẾP LỚP HỌC VIÊN
            <div className="max-w-md mx-auto p-5 border border-slate-100 rounded-3xl bg-slate-50/50">
              <h3 className="text-base font-black text-slate-800 mb-2 text-center">
                👤 Xếp Học Viên Vào Lớp
              </h3>
              <p className="text-xs text-slate-400 text-center mb-6 max-w-xs mx-auto font-medium">
                Chọn một lớp học đang tuyển sinh và liên kết học viên (STUDENT) tương ứng vào lớp học.
              </p>

              {classrooms.length === 0 || students.length === 0 ? (
                <p className="text-xs text-red-500 text-center font-bold">
                  ⚠️ Hệ thống cần có ít nhất 1 lớp học hoạt động và 1 tài khoản học viên để thực hiện xếp lớp.
                </p>
              ) : (
                <form onSubmit={handleEnrollSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lớp học tiếp nhận</label>
                    <select 
                      value={enrollment.classId}
                      onChange={(e) => setEnrollment({ ...enrollment, classId: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-xs font-semibold bg-white cursor-pointer"
                    >
                      {classrooms.map(cls => (
                        <option key={cls.id} value={cls.id}>{cls.className} - [{cls.courseTitle}]</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Học viên được gán</label>
                    <select 
                      value={enrollment.studentId}
                      onChange={(e) => setEnrollment({ ...enrollment, studentId: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-xs font-semibold bg-white cursor-pointer"
                    >
                      {students.map(std => (
                        <option key={std.id} value={std.id}>{std.fullName} - [{std.username}]</option>
                      ))}
                    </select>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full py-3 px-5 text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl shadow-lg shadow-orange-500/10 cursor-pointer border-none mt-2 active:scale-[0.98] transition-all"
                  >
                    ✓ Xếp vào lớp
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      )}

      {/* POPUP XEM HỌC VIÊN LỚP CỦA ADMIN */}
      {inspectClass && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-lg w-full border border-slate-100 animate-slide-up flex flex-col max-h-[80vh]">
            
            <div className="p-5 border-b border-slate-100 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-lg font-black text-slate-800">Lớp: {inspectClass.className}</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">{inspectClass.courseTitle}</p>
              </div>
              <button 
                onClick={() => setInspectClass(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold cursor-pointer border-none"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-grow">
              {loadingInspect ? (
                <div className="py-10 text-center flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-3 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs text-slate-400">Đang lấy danh sách học viên...</span>
                </div>
              ) : inspectedStudents.length === 0 ? (
                <p className="text-center text-slate-400 py-10 font-semibold text-xs leading-relaxed">
                  Lớp học này chưa có học viên nào tham gia.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Danh sách học viên lớp ({inspectedStudents.length}):
                  </h4>
                  {inspectedStudents.map(std => (
                    <div key={std.studentId} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <p className="font-extrabold text-xs text-slate-800">{std.studentName}</p>
                        <p className="text-[10px] text-slate-400 font-semibold">{std.studentEmail}</p>
                      </div>
                      
                      {std.grade !== null ? (
                        <span className="px-2 py-0.5 text-[10px] font-black rounded-md bg-green-50 text-green-700 border border-green-200">
                          {std.grade} / 10
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 text-slate-400">
                          Chưa thi
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 text-right shrink-0">
              <button 
                onClick={() => setInspectClass(null)}
                className="px-6 py-2.5 bg-white hover:bg-slate-100 text-slate-600 font-bold rounded-xl border border-slate-200 text-xs cursor-pointer shadow-sm"
              >
                Đóng lại
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default ClassroomManager;
