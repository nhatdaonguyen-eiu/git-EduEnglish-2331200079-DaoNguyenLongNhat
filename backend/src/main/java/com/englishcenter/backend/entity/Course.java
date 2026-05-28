package com.englishcenter.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ================================================================
 * ENTITY: Course
 * Ánh xạ (map) trực tiếp với bảng "courses" trong MySQL.
 * Mỗi field ở đây = 1 cột trong bảng.
 * ================================================================
 */
@Entity
@Table(name = "courses")
@Data  // Lombok tự tạo getter, setter, equals, hashCode, toString
public class Course {

    // ✅ Khóa chính, tự tăng (AUTO_INCREMENT)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // ✅ NOT NULL - Tên khóa học
    @Column(nullable = false)
    private String title;

    // ✅ Kiểu TEXT (dài hơn VARCHAR) - Mô tả
    @Column(columnDefinition = "TEXT")
    private String description;

    // ✅ Cấp độ: "Beginner", "Intermediate", "Advanced"
    private String level;

    // ✅ Danh mục: "IELTS", "TOEIC", "Giao tiếp"
    private String category;

    // ✅ Dùng BigDecimal cho tiền tệ - tránh sai số của double/float
    @Column(nullable = false)
    private BigDecimal price;

    // ✅ Tên cột trong DB là "thumbnail_url" (snake_case)
    //    Tên field Java là "thumbnailUrl" (camelCase) → phải khai báo rõ
    @Column(name = "thumbnail_url")
    private String thumbnailUrl;

    // ✅ Xóa mềm: TRUE = đã xóa, FALSE = còn tồn tại
    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;

    // ─────────────────────────────────────────
    // 🆕 ĐÃ TỐI ƯU: Map 2 cột thời gian với tự động hóa (Auditing)
    //    Giải quyết triệt để tình trạng lệch dữ liệu giữa RAM và MySQL
    // ─────────────────────────────────────────

    // ✅ @CreationTimestamp: Java tự nhìn đồng hồ hệ thống và điền giờ lúc mới tạo (INSERT)
    // ✅ updatable = false: Chỉ ghi 1 lần lúc tạo, không bao giờ bị ghi đè
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // ✅ @UpdateTimestamp: Java tự động cập nhật giờ mới nhất mỗi khi sửa đổi (UPDATE)
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}