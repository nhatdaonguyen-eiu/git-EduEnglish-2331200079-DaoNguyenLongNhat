package com.englishcenter.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

/**
 * ================================================================
 * ENTITY: FreeMaterialQuestion
 * Ánh xạ trực tiếp với bảng "free_material_questions" trong MySQL.
 * Lưu trữ câu hỏi luyện tập liên kết với tài liệu học tập miễn phí.
 * ================================================================
 */
@Entity
@Table(name = "free_material_questions")
@Data
public class FreeMaterialQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "material_id", nullable = false)
    private Integer materialId;

    @Column(name = "question_number", nullable = false)
    private Integer questionNumber;

    @Column(name = "question_text", columnDefinition = "LONGTEXT", nullable = false)
    private String questionText;

    // "MULTIPLE_CHOICE" hoặc "FILL_IN_THE_BLANK"
    @Column(name = "question_type", nullable = false)
    private String questionType;

    // Các phương án lựa chọn, cách nhau bởi ký tự "|" (ví dụ: "A. Apple|B. Banana|C. Orange")
    @Column(columnDefinition = "LONGTEXT")
    private String options;

    // Đáp án đúng để tự động chấm điểm trên Server
    @Column(name = "correct_answer", columnDefinition = "LONGTEXT")
    private String correctAnswer;
}
