package com.englishcenter.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * ================================================================
 * ENTITY: Classroom
 * Ánh xạ bảng classrooms lưu trữ thông tin lớp học thực tế.
 * ================================================================
 */
@Entity
@Table(name = "classrooms")
@Data
public class Classroom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Tên lớp học (Ví dụ: IELTS-70-C1)
    @Column(name = "class_name", nullable = false, unique = true)
    private String className;

    // Liên kết với Khóa học
    @Column(name = "course_id", nullable = false)
    private Integer courseId;

    // Liên kết với Giáo viên phụ trách (Role = TEACHER)
    @Column(name = "teacher_id", nullable = false)
    private Integer teacherId;

    // Lịch học trong tuần (Ví dụ: Thứ 2, 4, 6 | 19:30 - 21:00)
    @Column(nullable = false)
    private String schedule;

    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
