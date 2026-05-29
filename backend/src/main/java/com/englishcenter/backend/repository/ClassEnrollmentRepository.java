package com.englishcenter.backend.repository;

import com.englishcenter.backend.entity.ClassEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * ================================================================
 * REPOSITORY: ClassEnrollmentRepository
 * Thao tác CSDL liên kết học viên vào lớp học.
 * ================================================================
 */
@Repository
public interface ClassEnrollmentRepository extends JpaRepository<ClassEnrollment, Integer> {

    // Lấy toàn bộ học viên trong lớp
    List<ClassEnrollment> findByClassId(Integer classId);

    // Lấy toàn bộ lớp học mà học viên đã đăng ký tham gia
    List<ClassEnrollment> findByStudentId(Integer studentId);

    // Kiểm tra học viên đã được xếp vào lớp này chưa
    boolean existsByClassIdAndStudentId(Integer classId, Integer studentId);

    // Tìm kiếm liên kết xếp lớp cụ thể để chấm điểm
    Optional<ClassEnrollment> findByClassIdAndStudentId(Integer classId, Integer studentId);
}
