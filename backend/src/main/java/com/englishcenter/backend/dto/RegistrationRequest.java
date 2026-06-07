package com.englishcenter.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * ================================================================
 * REQUEST DTO: RegistrationRequest
 * Tiếp nhận thông tin học viên gửi lên từ giao diện tư vấn/đăng ký.
 * ================================================================
 */
@Data
public class RegistrationRequest {

    @NotBlank(message = "Họ tên không được để trống")
    private String fullName;

    @NotBlank(message = "Số điện thoại không được để trống")
    private String phoneNumber;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String email;

    // Có thể null nếu đăng ký tư vấn chung
    private Integer courseId;

    private String notes;

    private String source;
}
