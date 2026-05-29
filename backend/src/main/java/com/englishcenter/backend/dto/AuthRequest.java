package com.englishcenter.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * ================================================================
 * DTO: AuthRequest
 * Nhận thông tin đăng nhập từ client.
 * ================================================================
 */
@Data
public class AuthRequest {

    @NotBlank(message = "Tên đăng nhập không được để trống")
    private String username;

    @NotBlank(message = "Mật khẩu không được để trống")
    private String password;
}
