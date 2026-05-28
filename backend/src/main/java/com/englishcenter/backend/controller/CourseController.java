package com.englishcenter.backend.controller;

import com.englishcenter.backend.dto.CourseDTO;
import com.englishcenter.backend.dto.CourseRequest;
import com.englishcenter.backend.service.CourseService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * ================================================================
 *  CONTROLLER: CourseController                  [ĐÃ CẬP NHẬT]
 * ================================================================
 *
 *  Bảng tổng hợp toàn bộ API:
 *  ┌──────────┬──────────────────────┬──────────────────────────┬──────────┐
 *  │ Method   │ URL                  │ Chức năng                │ HTTP     │
 *  ├──────────┼──────────────────────┼──────────────────────────┼──────────┤
 *  │ GET      │ /api/courses         │ Lấy tất cả khóa học      │ 200 OK   │
 *  │ GET      │ /api/courses/{id}    │ Lấy 1 khóa học theo ID   │ 200 OK   │
 *  │ POST     │ /api/courses         │ Tạo mới khóa học         │ 201 Created│
 *  │ PUT      │ /api/courses/{id}    │ Cập nhật khóa học        │ 200 OK   │
 *  │ DELETE   │ /api/courses/{id}    │ Xóa mềm khóa học         │ 204 No Content│
 *  └──────────┴──────────────────────┴──────────────────────────┴──────────┘
 *
 *  Controller chỉ làm 3 việc:
 *  1. Nhận request từ frontend
 *  2. Gọi Service xử lý
 *  3. Đóng gói kết quả vào ResponseEntity trả về
 *
 *  Mọi logic nghiệp vụ đều nằm ở ServiceImpl, KHÔNG viết ở đây.
 * ================================================================
 */
@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "http://localhost:3000")
public class CourseController {

    @Autowired
    private CourseService courseService;  // Inject Interface, không inject Impl


    // ─────────────────────────────────────────────────────────────
    //  GET /api/courses
    //  Lấy danh sách tất cả khóa học đang hoạt động
    // ─────────────────────────────────────────────────────────────
    @GetMapping
    public ResponseEntity<List<CourseDTO>> getAllCourses() {
        List<CourseDTO> courses = courseService.getAllCourses();
        return ResponseEntity.ok(courses);  // 200 OK
    }


    // ─────────────────────────────────────────────────────────────
    //  GET /api/courses/{id}
    //  Lấy 1 khóa học theo ID
    // ─────────────────────────────────────────────────────────────
    // @PathVariable: Lấy {id} từ URL xuống biến Java
    // Ví dụ: GET /api/courses/5  →  id = 5
    @GetMapping("/{id}")
    public ResponseEntity<CourseDTO> getCourseById(@PathVariable Integer id) {
        CourseDTO course = courseService.getCourseById(id);
        return ResponseEntity.ok(course);   // 200 OK
        // Nếu không tìm thấy: Service tự ném ResponseStatusException → Spring trả 404
    }


    // ─────────────────────────────────────────────────────────────
    //  POST /api/courses
    //  Tạo mới khóa học
    // ─────────────────────────────────────────────────────────────
    // @RequestBody : Đọc JSON từ body của request, map vào CourseRequest
    // @Valid       : Kích hoạt validation (@NotBlank, @NotNull, @DecimalMin...)
    //               Nếu dữ liệu không hợp lệ → Spring tự trả 400 Bad Request
    @PostMapping
    public ResponseEntity<CourseDTO> createCourse(@Valid @RequestBody CourseRequest request) {
        CourseDTO created = courseService.createCourse(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created); // 201 Created
    }


    // ─────────────────────────────────────────────────────────────
    //  PUT /api/courses/{id}
    //  Cập nhật khóa học theo ID
    // ─────────────────────────────────────────────────────────────
    // Kết hợp @PathVariable (lấy ID từ URL) + @RequestBody (lấy dữ liệu mới từ body)
    @PutMapping("/{id}")
    public ResponseEntity<CourseDTO> updateCourse(
            @PathVariable Integer id,
            @Valid @RequestBody CourseRequest request) {
        CourseDTO updated = courseService.updateCourse(id, request);
        return ResponseEntity.ok(updated);  // 200 OK
    }


    // ─────────────────────────────────────────────────────────────
    //  DELETE /api/courses/{id}
    //  Xóa mềm khóa học theo ID
    // ─────────────────────────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Integer id) {
        courseService.deleteCourse(id);
        // 204 No Content: Thao tác thành công, không có dữ liệu để trả về
        // Đây là HTTP status chuẩn REST cho DELETE
        return ResponseEntity.noContent().build();
    }
}