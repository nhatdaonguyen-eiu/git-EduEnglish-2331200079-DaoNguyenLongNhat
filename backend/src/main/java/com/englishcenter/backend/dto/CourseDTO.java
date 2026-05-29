package com.englishcenter.backend.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ================================================================
 *  DTO: CourseDTO  (Data Transfer Object)
 * ================================================================
 *  TẠI SAO CẦN DTO?
 *  → Entity (Course.java) = bản đồ của bảng DB, chứa mọi thứ.
 *  → DTO = "hộp quà" bạn đóng gói và gửi ra ngoài cho frontend.
 *
 *  Lợi ích:
 *  1. Kiểm soát chính xác dữ liệu trả về (không lộ "is_deleted")
 *  2. Frontend đổi yêu cầu → chỉ sửa DTO, không đụng Entity
 *  3. Tránh lộ cấu trúc nội bộ của DB ra ngoài
 * ================================================================
 */
@Data  // Lombok tự tạo getter, setter cho tất cả các field
public class CourseDTO {

    private Integer id;
    private String title;
    private String description;
    private String level;
    private String category;
    private BigDecimal price;
    private String thumbnailUrl;
    
    // 🧭 THÔNG TIN LỘ TRÌNH KHÓA HỌC
    private String suitableFor;
    private String outputGoals;
    private String duration;
    private String commitment;
    private String learningMethod;
    private String syllabus;

    private LocalDateTime createdAt;

    // ✅ LƯU Ý: Không có "isDeleted"
    //    Frontend không cần và không nên biết field nội bộ này
}