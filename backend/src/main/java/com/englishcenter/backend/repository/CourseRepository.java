package com.englishcenter.backend.repository;

import com.englishcenter.backend.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * ================================================================
 *  REPOSITORY: CourseRepository
 *  Lớp duy nhất được phép nói chuyện trực tiếp với Database.
 * ================================================================
 *  Kế thừa JpaRepository<Course, Integer> để có sẵn:
 *    - findAll()      → SELECT * FROM courses
 *    - findById(id)   → SELECT * FROM courses WHERE id = ?
 *    - save(course)   → INSERT hoặc UPDATE
 *    - delete(course) → DELETE (bạn sẽ không dùng cái này vì có soft delete)
 * ================================================================
 */
@Repository
public interface CourseRepository extends JpaRepository<Course, Integer> {

    // ─────────────────────────────────────────────────────────────
    // 🆕 THÊM MỚI: Lọc bỏ các khóa học đã xóa mềm
    // ─────────────────────────────────────────────────────────────
    // Spring Data JPA đọc tên hàm và tự động sinh câu SQL:
    //   SELECT * FROM courses WHERE is_deleted = false
    //
    // ❌ Trước đây dùng findAll() → trả về CẢ khóa học đã xóa mềm
    // ✅ Bây giờ dùng cái này → chỉ trả về khóa học đang hoạt động
    List<Course> findByIsDeletedFalse();
}