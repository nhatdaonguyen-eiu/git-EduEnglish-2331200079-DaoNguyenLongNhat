package com.englishcenter.backend.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * ================================================================
 * DTO: ClassroomDTO
 * Đóng gói chi tiết lớp học kèm tên khóa học và tên giáo viên dạy.
 * ================================================================
 */
@Data
public class ClassroomDTO {

    private Integer id;
    private String className;
    private Integer courseId;
    private String courseTitle;
    private Integer teacherId;
    private String teacherName;
    private String schedule;
    private LocalDateTime createdAt;
}
