package com.englishcenter.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDateTime;

/**
 * ================================================================
 * ENTITY: User
 * Đại diện cho người dùng hệ thống (Admin, Giáo viên, Học viên).
 * ================================================================
 */
@Entity
@Table(name = "users")
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Tên đăng nhập duy nhất
    @Column(nullable = false, unique = true)
    private String username;

    // Mật khẩu đã mã hóa bảo mật (chỉ cho phép nhận khi submit, không bao giờ trả về JSON)
    @com.fasterxml.jackson.annotation.JsonProperty(access = com.fasterxml.jackson.annotation.JsonProperty.Access.WRITE_ONLY)
    @Column(nullable = false)
    private String password;

    // Họ và tên người dùng
    @Column(name = "full_name", nullable = false)
    private String fullName;

    // Email liên lạc
    @Column(nullable = false)
    private String email;

    // Vai trò: ADMIN, TEACHER, STUDENT
    @Column(nullable = false)
    private String role;

    // Số điện thoại liên hệ
    private String phone;

    // URL ảnh đại diện (avatar)
    @Column(name = "avatar_url")
    private String avatarUrl;

    // 🎓 THÔNG TIN HỒ SƠ GIẢNG DẠY (DÀNH CHO TEACHER)
    private String specialty;

    private String certificates;

    private String experience;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "is_featured", nullable = false, columnDefinition = "boolean default false")
    private Boolean isFeatured = false;

    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;

    // === GAMIFICATION FIELDS ===
    @Column(name = "current_streak", nullable = false)
    private Integer currentStreak = 0;

    @Column(name = "longest_streak", nullable = false)
    private Integer longestStreak = 0;

    @Column(name = "last_active_date")
    private java.time.LocalDate lastActiveDate;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
