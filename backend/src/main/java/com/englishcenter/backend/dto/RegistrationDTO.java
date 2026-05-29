package com.englishcenter.backend.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * ================================================================
 * DTO: RegistrationDTO
 * Đóng gói dữ liệu trả ra cho admin xem thông tin học viên đăng ký.
 * ================================================================
 */
@Data
public class RegistrationDTO {

    private Integer id;
    private String fullName;
    private String phoneNumber;
    private String email;
    private Integer courseId;
    private String courseTitle; // Tên khóa học đã map từ courseId
    private String notes;
    private String status;
    private LocalDateTime createdAt;
}
