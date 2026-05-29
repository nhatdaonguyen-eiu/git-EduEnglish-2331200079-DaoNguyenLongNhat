package com.englishcenter.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * ================================================================
 * REQUEST DTO: CreateTeacherRequest
 * Chỉ Admin mới sử dụng DTO này để tạo tài khoản giáo viên.
 * ================================================================
 */
@Data
public class CreateTeacherRequest {

    @NotBlank(message = "Tên đăng nhập không được để trống")
    private String username;

    @NotBlank(message = "Mật khẩu không được để trống")
    private String password;

    @NotBlank(message = "Họ tên giáo viên không được để trống")
    private String fullName;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String email;

    private String phone;
}
