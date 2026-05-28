package com.englishcenter.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

/**
 * ================================================================
 *  REQUEST DTO: CourseRequest                          [FILE MỚI]
 * ================================================================
 *
 *  Nhiệm vụ: Nhận dữ liệu ĐẦU VÀO từ frontend khi tạo / sửa.
 *
 *  Phân biệt 2 loại DTO trong project này:
 *  ┌────────────────┬──────────────────────────────────────────┐
 *  │ CourseDTO      │ Dữ liệu TRẢ RA ngoài  (dùng cho GET)    │
 *  │ CourseRequest  │ Dữ liệu NHẬN VÀO      (dùng cho POST/PUT)│
 *  └────────────────┴──────────────────────────────────────────┘
 *
 *  Khi frontend gửi POST /api/courses, body JSON sẽ trông như:
 *  {
 *    "title":       "IELTS Foundation",
 *    "description": "Khóa học IELTS cho người mới bắt đầu",
 *    "level":       "Beginner",
 *    "category":    "IELTS",
 *    "price":       3500000,
 *    "thumbnailUrl": "https://..."
 *  }
 *  → Spring tự động map JSON đó vào object CourseRequest này.
 *
 *  @NotBlank / @NotNull / @DecimalMin = Validation
 *  Nếu dữ liệu vi phạm → Spring tự trả lỗi 400 Bad Request
 *  mà KHÔNG cần bạn viết thêm code kiểm tra thủ công.
 * ================================================================
 */
@Data
public class CourseRequest {

    // @NotBlank = không được null, không được rỗng "", không được "   "
    @NotBlank(message = "Tên khóa học không được để trống")
    private String title;

    // Mô tả không bắt buộc → không cần annotation validate
    private String description;

    private String level;     // VD: "Beginner", "Intermediate", "Advanced"
    private String category;  // VD: "IELTS", "TOEIC", "Giao tiếp"

    // @NotNull    = field này bắt buộc phải có trong JSON (không được thiếu)
    // @DecimalMin = giá trị phải >= 0, không cho nhập số âm
    @NotNull(message = "Học phí không được để trống")
    @DecimalMin(value = "0.0", message = "Học phí không được là số âm")
    private BigDecimal price;

    private String thumbnailUrl; // Không bắt buộc
}