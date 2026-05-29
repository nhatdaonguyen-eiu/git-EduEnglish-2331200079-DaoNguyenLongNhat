package com.englishcenter.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

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

    // Mật khẩu đã mã hóa bảo mật
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

    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
