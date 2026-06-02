package com.englishcenter.backend.repository;

import com.englishcenter.backend.entity.Classroom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * ================================================================
 * REPOSITORY: ClassroomRepository
 * Thao tác CSDL bảng classrooms.
 * ================================================================
 */
@Repository
public interface ClassroomRepository extends JpaRepository<Classroom, Integer> {

    // Lọc danh sách lớp học chưa xóa mềm
    List<Classroom> findByIsDeletedFalse();

    // Lọc lớp học của riêng giáo viên phụ trách
    List<Classroom> findByTeacherIdAndIsDeletedFalse(Integer teacherId);

    // Lọc lớp học theo học kỳ
    List<Classroom> findBySemesterAndIsDeletedFalse(String semester);

    // Lọc danh sách lớp học xếp theo ngày tạo giảm dần
    List<Classroom> findByIsDeletedFalseOrderByCreatedAtDesc();
}
