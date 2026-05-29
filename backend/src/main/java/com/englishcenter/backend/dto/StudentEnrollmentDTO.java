package com.englishcenter.backend.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ================================================================
 * DTO: StudentEnrollmentDTO
 * Đóng gói kết quả xếp lớp và kết quả học tập/điểm thi thử của học viên.
 * ================================================================
 */
@Data
public class StudentEnrollmentDTO {

    private Integer id; // ClassEnrollment ID
    private Integer studentId;
    private String studentName;
    private String studentEmail;
    private BigDecimal grade;
    private LocalDateTime enrolledAt;
}
