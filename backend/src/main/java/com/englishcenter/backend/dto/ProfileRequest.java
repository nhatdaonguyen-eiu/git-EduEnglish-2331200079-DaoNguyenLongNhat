package com.englishcenter.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * ================================================================
 * REQUEST DTO: ProfileRequest
 * Tiếp nhận thông tin cập nhật hồ sơ cá nhân từ người dùng.
 * ================================================================
 */
@Data
public class ProfileRequest {

    @NotBlank(message = "Họ tên không được để trống")
    private String fullName;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String email;

    private String phone;

    private String avatarUrl;

    // 🎓 THÔNG TIN HỒ SƠ GIẢNG DẠY (TEACHER)
    private String specialty;
    private String certificates;
    private String experience;
    private String bio;

    // Mật khẩu hiện tại — bắt buộc để xác nhận quyền sở hữu tài khoản
    @NotBlank(message = "Vui lòng nhập mật khẩu hiện tại để xác nhận")
    private String currentPassword;

    // Mật khẩu mới — tùy chọn, chỉ điền nếu muốn đổi mật khẩu
    private String newPassword;
}
