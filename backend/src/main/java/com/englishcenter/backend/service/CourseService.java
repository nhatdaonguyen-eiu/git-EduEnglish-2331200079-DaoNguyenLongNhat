package com.englishcenter.backend.service;

import com.englishcenter.backend.dto.CourseDTO;
import com.englishcenter.backend.dto.CourseRequest;

import java.util.List;

/**
 * ================================================================
 *  SERVICE INTERFACE: CourseService              [ĐÃ CẬP NHẬT]
 * ================================================================
 *
 *  Interface = "Bản hợp đồng" liệt kê CÁC TÍNH NĂNG phải có.
 *  CourseServiceImpl.java là nơi viết CHI TIẾT từng tính năng.
 *
 *  CRUD mapping:
 *  ┌─────────────────────┬────────────┬──────────────────────────┐
 *  │ Tên hàm             │ HTTP       │ Endpoint                 │
 *  ├─────────────────────┼────────────┼──────────────────────────┤
 *  │ getAllCourses()      │ GET        │ /api/courses             │
 *  │ getCourseById()     │ GET        │ /api/courses/{id}        │
 *  │ createCourse()      │ POST       │ /api/courses             │
 *  │ updateCourse()      │ PUT        │ /api/courses/{id}        │
 *  │ deleteCourse()      │ DELETE     │ /api/courses/{id}        │
 *  └─────────────────────┴────────────┴──────────────────────────┘
 *
 *  Lý do trả về DTO thay vì Entity:
 *  → Controller và Frontend không bao giờ thấy Entity trực tiếp
 *  → Bảo vệ cấu trúc DB nội bộ, kiểm soát chính xác dữ liệu ra ngoài
 * ================================================================
 */
public interface CourseService {

    // [R] Lấy tất cả khóa học đang hoạt động (is_deleted = false) có lọc và tìm kiếm
    List<CourseDTO> getAllCourses(String search, String level, String category);

    // [R] Lấy 1 khóa học theo ID → ném 404 nếu không tìm thấy
    CourseDTO getCourseById(Integer id);

    // [C] Tạo mới 1 khóa học
    // Nhận: CourseRequest (dữ liệu frontend gửi lên)
    // Trả:  CourseDTO     (bản vừa tạo, đã có ID)
    CourseDTO createCourse(CourseRequest request);

    // [U] Cập nhật 1 khóa học theo ID → ném 404 nếu không tìm thấy
    // Nhận: id + CourseRequest (dữ liệu mới)
    // Trả:  CourseDTO (bản sau khi cập nhật)
    CourseDTO updateCourse(Integer id, CourseRequest request);

    // [D] Xóa mềm 1 khóa học theo ID (đặt is_deleted = true, KHÔNG xóa DB)
    // void vì không có gì để trả về → Controller sẽ trả HTTP 204
    void deleteCourse(Integer id);
}