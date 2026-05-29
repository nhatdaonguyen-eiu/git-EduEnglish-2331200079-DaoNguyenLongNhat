package com.englishcenter.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ================================================================
 * ENTITY: ClassEnrollment
 * Ánh xạ bảng class_enrollments kết nối học viên vào lớp học.
 * Hỗ trợ lưu trữ điểm kiểm tra thi thử của học viên trong lớp.
 * ================================================================
 */
@Entity
@Table(name = "class_enrollments")
@Data
public class ClassEnrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "class_id", nullable = false)
    private Integer classId;

    @Column(name = "student_id", nullable = false)
    private Integer studentId;

    // Điểm kiểm tra thi thử (giả lập), ví dụ: 7.5
    @Column(precision = 4, scale = 2)
    private BigDecimal grade;

    @CreationTimestamp
    @Column(name = "enrolled_at", updatable = false)
    private LocalDateTime enrolledAt;
}
