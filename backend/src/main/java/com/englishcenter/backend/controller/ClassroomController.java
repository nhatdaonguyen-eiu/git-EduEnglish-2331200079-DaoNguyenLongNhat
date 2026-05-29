package com.englishcenter.backend.controller;

import com.englishcenter.backend.dto.ClassroomDTO;
import com.englishcenter.backend.dto.StudentEnrollmentDTO;
import com.englishcenter.backend.entity.Classroom;
import com.englishcenter.backend.service.ClassroomService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * ================================================================
 * CONTROLLER: ClassroomController
 * Quản trị phân hệ lớp học, đăng ký xếp lớp và chấm điểm thi thử LMS.
 * ================================================================
 */
@RestController
@RequestMapping("/api/classrooms")
@CrossOrigin(origins = "http://localhost:5173")
public class ClassroomController {

    @Autowired
    private ClassroomService classroomService;

    // ─────────────────────────────────────────────────────────────
    // POST /api/classrooms
    // Admin API: Tạo mới một lớp học
    // ─────────────────────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<ClassroomDTO> createClassroom(@Valid @RequestBody Classroom classroom) {
        ClassroomDTO created = classroomService.createClassroom(classroom);
        return ResponseEntity.status(HttpStatus.CREATED).body(created); // 201 Created
    }

    // ─────────────────────────────────────────────────────────────
    // GET /api/classrooms
    // Admin API: Xem tất cả các lớp học của trung tâm
    // ─────────────────────────────────────────────────────────────
    @GetMapping
    public ResponseEntity<List<ClassroomDTO>> getAllClassrooms() {
        List<ClassroomDTO> classrooms = classroomService.getAllClassrooms();
        return ResponseEntity.ok(classrooms);
    }

    // ─────────────────────────────────────────────────────────────
    // GET /api/classrooms/teacher/{teacherId}
    // Teacher API: Giáo viên lấy toàn bộ lớp học được phân công dạy
    // ─────────────────────────────────────────────────────────────
    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<ClassroomDTO>> getClassroomsByTeacher(@PathVariable Integer teacherId) {
        List<ClassroomDTO> classrooms = classroomService.getClassroomsByTeacher(teacherId);
        return ResponseEntity.ok(classrooms);
    }

    // ─────────────────────────────────────────────────────────────
    // GET /api/classrooms/student/{studentId}
    // Student API: Học viên lấy toàn bộ lớp học đã tham gia đăng ký
    // ─────────────────────────────────────────────────────────────
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<ClassroomDTO>> getClassroomsByStudent(@PathVariable Integer studentId) {
        List<ClassroomDTO> classrooms = classroomService.getClassroomsByStudent(studentId);
        return ResponseEntity.ok(classrooms);
    }

    // ─────────────────────────────────────────────────────────────
    // POST /api/classrooms/{classId}/enroll/{studentId}
    // Admin API: Xếp học viên vào một lớp học cụ thể
    // ─────────────────────────────────────────────────────────────
    @PostMapping("/{classId}/enroll/{studentId}")
    public ResponseEntity<Void> enrollStudent(
            @PathVariable Integer classId,
            @PathVariable Integer studentId) {
        classroomService.enrollStudent(classId, studentId);
        return ResponseEntity.ok().build();
    }

    // ─────────────────────────────────────────────────────────────
    // GET /api/classrooms/{classId}/students
    // Teacher/Admin API: Xem toàn bộ học viên và điểm số trong 1 lớp
    // ─────────────────────────────────────────────────────────────
    @GetMapping("/{classId}/students")
    public ResponseEntity<List<StudentEnrollmentDTO>> getStudentsInClass(@PathVariable Integer classId) {
        List<StudentEnrollmentDTO> students = classroomService.getStudentsInClass(classId);
        return ResponseEntity.ok(students);
    }

    // ─────────────────────────────────────────────────────────────
    // PUT /api/classrooms/{classId}/students/{studentId}/grade
    // Teacher/Admin API: Cập nhật kết quả thi thử học viên trong lớp
    // Ví dụ: PUT /api/classrooms/3/students/5/grade?grade=8.5
    // ─────────────────────────────────────────────────────────────
    @PutMapping("/{classId}/students/{studentId}/grade")
    public ResponseEntity<Void> updateStudentGrade(
            @PathVariable Integer classId,
            @PathVariable Integer studentId,
            @RequestParam BigDecimal grade) {
        classroomService.updateStudentGrade(classId, studentId, grade);
        return ResponseEntity.ok().build();
    }
}
