package com.englishcenter.backend.repository;

import com.englishcenter.backend.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    // 🆕 THÊM MỚI: Tìm kiếm và lọc khóa học động
    @Query("SELECT c FROM Course c WHERE c.isDeleted = false " +
           "AND (:search IS NULL OR :search = '' OR LOWER(c.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.description) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:level IS NULL OR :level = '' OR c.level = :level) " +
           "AND (:category IS NULL OR :category = '' OR c.category = :category)")
    List<Course> searchCourses(
            @Param("search") String search,
            @Param("level") String level,
            @Param("category") String category
    );
}