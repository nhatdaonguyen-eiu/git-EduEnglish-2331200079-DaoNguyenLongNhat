package com.englishcenter.backend.dto;

import lombok.Data;

/**
 * ================================================================
 * DTO: AuthResponse
 * Phản hồi thông tin đăng nhập thành công kèm Token phiên học tập.
 * ================================================================
 */
@Data
public class AuthResponse {

    private Integer id; // Thêm ID người dùng
    private String token;
    private String username;
    private String fullName;
    private String role; // ADMIN, TEACHER, STUDENT
    private String email; // Email liên lạc của tài khoản
    private String phone;
    private String avatarUrl;
}
