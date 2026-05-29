package com.englishcenter.backend.service;

import com.englishcenter.backend.dto.ClassroomDTO;
import com.englishcenter.backend.dto.StudentEnrollmentDTO;
import com.englishcenter.backend.entity.Classroom;

import java.math.BigDecimal;
import java.util.List;

/**
 * ================================================================
 * SERVICE INTERFACE: ClassroomService
 * Nghiệp vụ quản lý xếp lớp học viên, tạo lớp và chấm điểm thi thử.
 * ================================================================
 */
public interface ClassroomService {

    // Admin tạo mới lớp học thực tế
    ClassroomDTO createClassroom(Classroom classroom);

    // Lấy toàn bộ lớp học đang mở
    List<ClassroomDTO> getAllClassrooms();

    // Lấy lớp học được giao cho Giáo viên cụ thể dạy
    List<ClassroomDTO> getClassroomsByTeacher(Integer teacherId);

    // Lấy danh sách lớp học của Học viên đăng ký học
    List<ClassroomDTO> getClassroomsByStudent(Integer studentId);

    // Admin xếp học viên vào lớp học
    void enrollStudent(Integer classId, Integer studentId);

    // Lấy danh sách học viên trong 1 lớp cụ thể (đi kèm bảng điểm)
    List<StudentEnrollmentDTO> getStudentsInClass(Integer classId);

    // Giáo viên/Admin cập nhật điểm thi thử của học viên trong lớp
    void updateStudentGrade(Integer classId, Integer studentId, BigDecimal grade);
}
