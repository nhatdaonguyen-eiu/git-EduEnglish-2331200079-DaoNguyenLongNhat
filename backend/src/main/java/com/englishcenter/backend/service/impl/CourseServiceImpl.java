package com.englishcenter.backend.service.impl;

import com.englishcenter.backend.dto.CourseDTO;
import com.englishcenter.backend.dto.CourseRequest;
import com.englishcenter.backend.entity.Course;
import com.englishcenter.backend.repository.CourseRepository;
import com.englishcenter.backend.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

/**
 * ================================================================
 *  SERVICE IMPL: CourseServiceImpl               [ĐÃ CẬP NHẬT]
 * ================================================================
 *
 *  Luồng dữ liệu tổng quát:
 *
 *  [READ]
 *  DB ──► Repository ──► Entity ──► toDTO() ──► Controller ──► Frontend
 *
 *  [CREATE]
 *  Frontend ──► Controller ──► CourseRequest ──► toEntity()
 *           ──► Repository.save() ──► DB
 *           ──► toDTO() ──► Controller ──► Frontend
 *
 *  [UPDATE]
 *  Frontend ──► Controller ──► Tìm Entity theo ID
 *           ──► Ghi đè field mới vào Entity cũ (giữ ID + createdAt)
 *           ──► Repository.save() ──► DB
 *           ──► toDTO() ──► Controller ──► Frontend
 *
 *  [DELETE]
 *  Frontend ──► Controller ──► Tìm Entity theo ID
 *           ──► Đặt isDeleted = true
 *           ──► Repository.save() ──► DB (dữ liệu vẫn còn, chỉ bị ẩn)
 *
 * ──────────────────────────────────────────────────────────────
 *  LƯU Ý VỀ THỜI GIAN (so với phiên bản trước):
 *  Course.java của bạn đã dùng @CreationTimestamp / @UpdateTimestamp
 *  → Hibernate tự xử lý createdAt và updatedAt
 *  → ServiceImpl KHÔNG cần gọi setCreatedAt() / setUpdatedAt() thủ công nữa
 * ================================================================
 */
@Service
public class CourseServiceImpl implements CourseService {

    @Autowired
    private CourseRepository courseRepository;


    // ════════════════════════════════════════════════
    //  [R] READ ALL — GET /api/courses
    // ════════════════════════════════════════════════
    @Override
    public List<CourseDTO> getAllCourses(String search, String level, String category) {
        // searchCourses() → SELECT * FROM courses WHERE is_deleted = false AND criteria...
        return courseRepository.searchCourses(search, level, category)
                .stream()
                .map(this::toDTO)   // Chuyển từng Entity → DTO
                .collect(Collectors.toList());
    }


    // ════════════════════════════════════════════════
    //  [R] READ ONE — GET /api/courses/{id}
    // ════════════════════════════════════════════════
    @Override
    public CourseDTO getCourseById(Integer id) {
        // findById() trả về Optional<Course>
        // .filter()     → Loại bỏ nếu đã bị xóa mềm
        // .orElseThrow() → Nếu không tìm thấy: ném ngoại lệ → Spring trả HTTP 404
        Course course = courseRepository.findById(id)
                .filter(c -> !c.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy khóa học với ID: " + id
                ));

        return toDTO(course);
    }


    // ════════════════════════════════════════════════
    //  [C] CREATE — POST /api/courses
    // ════════════════════════════════════════════════
    @Override
    public CourseDTO createCourse(CourseRequest request) {
        // Bước 1: Chuyển dữ liệu frontend gửi lên → Entity để lưu DB
        Course course = toEntity(request);

        // Bước 2: Lưu vào DB
        // save() trả về Entity đã có ID (do AUTO_INCREMENT)
        // @CreationTimestamp tự điền createdAt, @UpdateTimestamp tự điền updatedAt
        // → KHÔNG cần gọi setCreatedAt() thủ công
        Course savedCourse = courseRepository.save(course);

        // Bước 3: Trả về DTO của bản vừa tạo (kèm ID mới)
        return toDTO(savedCourse);
    }


    // ════════════════════════════════════════════════
    //  [U] UPDATE — PUT /api/courses/{id}
    // ════════════════════════════════════════════════
    @Override
    public CourseDTO updateCourse(Integer id, CourseRequest request) {
        // Bước 1: Tìm Entity hiện tại, nếu không thấy → 404
        Course course = courseRepository.findById(id)
                .filter(c -> !c.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy khóa học với ID: " + id
                ));

        // Bước 2: Ghi đè từng field bằng dữ liệu mới từ request
        // ⚠️  KHÔNG tạo Entity mới — phải dùng lại Entity cũ đã có ID
        //     Nếu tạo mới rồi save() → JPA sẽ INSERT thêm dòng mới thay vì UPDATE
        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setLevel(request.getLevel());
        course.setCategory(request.getCategory());
        course.setPrice(request.getPrice());
        course.setThumbnailUrl(request.getThumbnailUrl());
        
        // Cập nhật các trường lộ trình học tập chi tiết
        course.setSuitableFor(request.getSuitableFor());
        course.setOutputGoals(request.getOutputGoals());
        course.setDuration(request.getDuration());
        course.setCommitment(request.getCommitment());
        course.setLearningMethod(request.getLearningMethod());
        course.setSyllabus(request.getSyllabus());
        // createdAt giữ nguyên (updatable = false trong Entity)
        // updatedAt tự cập nhật nhờ @UpdateTimestamp → không cần set thủ công

        // Bước 3: Lưu lại (save() nhận ra Entity đã có ID → chạy UPDATE thay vì INSERT)
        Course updatedCourse = courseRepository.save(course);

        return toDTO(updatedCourse);
    }


    // ════════════════════════════════════════════════
    //  [D] DELETE — DELETE /api/courses/{id}
    // ════════════════════════════════════════════════
    @Override
    public void deleteCourse(Integer id) {
        // Bước 1: Tìm Entity, nếu không thấy → 404
        Course course = courseRepository.findById(id)
                .filter(c -> !c.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy khóa học với ID: " + id
                ));

        // Bước 2: Đặt cờ xóa mềm
        // ❌ TUYỆT ĐỐI không dùng courseRepository.delete(course)
        //    → Xóa thật = mất vĩnh viễn, vi phạm nguyên tắc soft delete
        // ✅ Chỉ đánh dấu is_deleted = true → dữ liệu vẫn còn trong DB
        course.setIsDeleted(true);

        // Bước 3: Lưu lại trạng thái mới
        courseRepository.save(course);

        // Không return gì cả → Controller sẽ trả HTTP 204 No Content
    }


    // ════════════════════════════════════════════════
    //  HELPERS — Hàm chuyển đổi dữ liệu nội bộ
    // ════════════════════════════════════════════════

    /**
     * Entity → DTO
     * Dùng khi TRẢ DỮ LIỆU ra ngoài (tất cả các hàm Read/Create/Update).
     * Chỉ đưa vào DTO những field frontend được phép thấy.
     */
    private CourseDTO toDTO(Course course) {
        CourseDTO dto = new CourseDTO();
        dto.setId(course.getId());
        dto.setTitle(course.getTitle());
        dto.setDescription(course.getDescription());
        dto.setLevel(course.getLevel());
        dto.setCategory(course.getCategory());
        dto.setPrice(course.getPrice());
        dto.setThumbnailUrl(course.getThumbnailUrl());
        
        // Map các cột lộ trình học tập chi tiết
        dto.setSuitableFor(course.getSuitableFor());
        dto.setOutputGoals(course.getOutputGoals());
        dto.setDuration(course.getDuration());
        dto.setCommitment(course.getCommitment());
        dto.setLearningMethod(course.getLearningMethod());
        dto.setSyllabus(course.getSyllabus());

        dto.setCreatedAt(course.getCreatedAt());
        // isDeleted KHÔNG được set vào DTO → frontend không nhìn thấy
        return dto;
    }

    /**
     * CourseRequest → Entity
     * Dùng khi NHẬN DỮ LIỆU từ frontend vào (chỉ dùng cho Create).
     * Update không dùng hàm này vì phải giữ lại Entity cũ để tránh INSERT nhầm.
     */
    private Course toEntity(CourseRequest request) {
        Course course = new Course();
        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setLevel(request.getLevel());
        course.setCategory(request.getCategory());
        course.setPrice(request.getPrice());
        course.setThumbnailUrl(request.getThumbnailUrl());
        
        // Map các cột lộ trình học tập chi tiết
        course.setSuitableFor(request.getSuitableFor());
        course.setOutputGoals(request.getOutputGoals());
        course.setDuration(request.getDuration());
        course.setCommitment(request.getCommitment());
        course.setLearningMethod(request.getLearningMethod());
        course.setSyllabus(request.getSyllabus());

        course.setIsDeleted(false); // Mặc định khi tạo mới: chưa xóa
        // createdAt, updatedAt sẽ được @CreationTimestamp tự điền khi save()
        return course;
    }
}