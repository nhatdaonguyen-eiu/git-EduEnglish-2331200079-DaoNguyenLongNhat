package com.englishcenter.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * ================================================================
 * ENTITY: Registration
 * Ánh xạ trực tiếp với bảng "registrations" lưu trữ thông tin đăng ký.
 * ================================================================
 */
@Entity
@Table(name = "registrations")
@Data
public class Registration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Họ tên học viên
    @Column(name = "full_name", nullable = false)
    private String fullName;

    // Số điện thoại liên lạc
    @Column(name = "phone_number", nullable = false)
    private String phoneNumber;

    // Email học viên
    @Column(nullable = false)
    private String email;

    // Khóa học đăng ký (có thể null nếu đăng ký tư vấn chung)
    @Column(name = "course_id")
    private Integer courseId;

    // Lời nhắn / Ghi chú từ học viên
    @Column(columnDefinition = "TEXT")
    private String notes;

    // Trạng thái xử lý: PENDING, CONTACTED, ENROLLED, CANCELLED
    @Column(nullable = false)
    private String status = "PENDING";

    // Xóa mềm
    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
