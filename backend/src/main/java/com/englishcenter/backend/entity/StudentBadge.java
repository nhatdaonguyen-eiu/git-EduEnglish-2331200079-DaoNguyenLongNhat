package com.englishcenter.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

/**
 * ================================================================
 * ENTITY: StudentBadge
 * Lưu giữ thông tin huy hiệu thành tích của học viên đã đạt được.
 * ================================================================
 */
@Entity
@Table(name = "student_badges")
@Data
public class StudentBadge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "student_id", nullable = false)
    private Integer studentId;

    @Column(name = "badge_key", nullable = false, length = 50)
    private String badgeKey;

    @CreationTimestamp
    @Column(name = "earned_at", updatable = false)
    private LocalDateTime earnedAt;
}
