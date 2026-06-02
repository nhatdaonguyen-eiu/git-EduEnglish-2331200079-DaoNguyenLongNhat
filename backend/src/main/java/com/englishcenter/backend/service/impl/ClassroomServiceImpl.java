package com.englishcenter.backend.service.impl;

import com.englishcenter.backend.dto.ClassroomDTO;
import com.englishcenter.backend.dto.StudentEnrollmentDTO;
import com.englishcenter.backend.entity.ClassEnrollment;
import com.englishcenter.backend.entity.Classroom;
import com.englishcenter.backend.entity.User;
import com.englishcenter.backend.repository.ClassEnrollmentRepository;
import com.englishcenter.backend.repository.ClassroomRepository;
import com.englishcenter.backend.repository.CourseRepository;
import com.englishcenter.backend.repository.UserRepository;
import com.englishcenter.backend.service.ClassroomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

/**
 * ================================================================
 * SERVICE IMPL: ClassroomServiceImpl
 * Triển khai các tính năng xếp lớp học, xem lịch học và chấm điểm thi thử.
 * ================================================================
 */
@Service
public class ClassroomServiceImpl implements ClassroomService {

    @Autowired
    private ClassroomRepository classroomRepository;

    @Autowired
    private ClassEnrollmentRepository classEnrollmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Override
    public ClassroomDTO createClassroom(Classroom classroom) {
        // 1. Kiểm tra giáo viên có tồn tại và đúng role không
        userRepository.findById(classroom.getTeacherId())
                .filter(u -> !u.getIsDeleted() && u.getRole().equalsIgnoreCase("TEACHER"))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Giáo viên phụ trách với ID " + classroom.getTeacherId() + " không tồn tại hoặc không hợp lệ"
                ));

        // 2. Kiểm tra khóa học có tồn tại không
        boolean courseExists = courseRepository.existsById(classroom.getCourseId());
        if (!courseExists) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Khóa học liên kết với ID " + classroom.getCourseId() + " không tồn tại"
            );
        }

        classroom.setIsDeleted(false);
        Classroom saved = classroomRepository.save(classroom);
        return toDTO(saved);
    }

    @Override
    public List<ClassroomDTO> getAllClassrooms() {
        return classroomRepository.findByIsDeletedFalse().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ClassroomDTO> getClassroomsByTeacher(Integer teacherId) {
        return classroomRepository.findByTeacherIdAndIsDeletedFalse(teacherId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ClassroomDTO> getClassroomsByStudent(Integer studentId) {
        // Tìm toàn bộ lớp học mà học viên đã tham gia
        List<ClassEnrollment> enrollments = classEnrollmentRepository.findByStudentId(studentId);
        
        return enrollments.stream()
                .map(enrollment -> classroomRepository.findById(enrollment.getClassId())
                        .filter(c -> !c.getIsDeleted())
                        .orElse(null))
                .filter(classroom -> classroom != null)
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void enrollStudent(Integer classId, Integer studentId) {
        // 1. Kiểm tra lớp học tồn tại
        classroomRepository.findById(classId)
                .filter(c -> !c.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Lớp học không tồn tại với ID: " + classId
                ));

        // 2. Kiểm tra học viên tồn tại và đúng role STUDENT
        userRepository.findById(studentId)
                .filter(u -> !u.getIsDeleted() && u.getRole().equalsIgnoreCase("STUDENT"))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Học viên xếp lớp với ID " + studentId + " không tồn tại hoặc không hợp lệ"
                ));

        // 3. Kiểm tra xem đã được xếp vào lớp chưa
        boolean alreadyEnrolled = classEnrollmentRepository.existsByClassIdAndStudentId(classId, studentId);
        if (alreadyEnrolled) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Học viên này đã được xếp vào lớp học này rồi"
            );
        }

        // 4. Lưu liên kết xếp lớp
        ClassEnrollment enrollment = new ClassEnrollment();
        enrollment.setClassId(classId);
        enrollment.setStudentId(studentId);
        // grade mặc định là null (chưa có điểm)
        classEnrollmentRepository.save(enrollment);
    }

    @Override
    public List<StudentEnrollmentDTO> getStudentsInClass(Integer classId) {
        // Đảm bảo lớp học có tồn tại
        if (!classroomRepository.existsById(classId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy lớp học với ID: " + classId);
        }

        List<ClassEnrollment> enrollments = classEnrollmentRepository.findByClassId(classId);

        return enrollments.stream()
                .map(enrollment -> {
                    StudentEnrollmentDTO dto = new StudentEnrollmentDTO();
                    dto.setId(enrollment.getId());
                    dto.setStudentId(enrollment.getStudentId());
                    dto.setGrade(enrollment.getGrade());
                    dto.setEnrolledAt(enrollment.getEnrolledAt());

                    // Nạp thêm tên và email học viên
                    userRepository.findById(enrollment.getStudentId())
                            .ifPresent(u -> {
                                dto.setStudentName(u.getFullName());
                                dto.setStudentEmail(u.getEmail());
                            });

                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public void updateStudentGrade(Integer classId, Integer studentId, BigDecimal grade) {
        // 1. Tìm liên kết xếp lớp học viên
        ClassEnrollment enrollment = classEnrollmentRepository.findByClassIdAndStudentId(classId, studentId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Học viên chưa được xếp vào lớp học này"
                ));

        // 2. Validate điểm số (IELTS là 0-9, TOEIC là 0-990, nhưng điểm số trắc nghiệm đầu vào chúng ta cho thang điểm 10)
        if (grade != null && (grade.compareTo(BigDecimal.ZERO) < 0 || grade.compareTo(BigDecimal.TEN) > 0)) {
            // Chấp nhận thang điểm từ 0 đến 10
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Điểm thi thử phải thuộc thang điểm từ 0 đến 10");
        }

        // 3. Cập nhật và lưu lại
        enrollment.setGrade(grade);
        classEnrollmentRepository.save(enrollment);
    }

    /**
     * Hàm nội bộ ánh xạ Classroom → ClassroomDTO trích xuất thông tin khóa học và giáo viên
     */
    private ClassroomDTO toDTO(Classroom classroom) {
        ClassroomDTO dto = new ClassroomDTO();
        dto.setId(classroom.getId());
        dto.setClassName(classroom.getClassName());
        dto.setCourseId(classroom.getCourseId());
        dto.setTeacherId(classroom.getTeacherId());
        dto.setSchedule(classroom.getSchedule());
        dto.setSemester(classroom.getSemester());
        dto.setTuitionFee(classroom.getTuitionFee());
        dto.setCreatedAt(classroom.getCreatedAt());

        // Tìm kiếm và mapping tên Khóa học
        courseRepository.findById(classroom.getCourseId())
                .ifPresent(course -> dto.setCourseTitle(course.getTitle()));

        // Tìm kiếm và mapping tên Giáo viên
        userRepository.findById(classroom.getTeacherId())
                .ifPresent(u -> dto.setTeacherName(u.getFullName()));

        return dto;
    }
}
