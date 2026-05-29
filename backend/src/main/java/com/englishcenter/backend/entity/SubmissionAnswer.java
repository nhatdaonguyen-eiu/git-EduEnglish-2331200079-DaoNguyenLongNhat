package com.englishcenter.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "submission_answers")
@Data
public class SubmissionAnswer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "submission_id", nullable = false)
    private Integer submissionId;

    @Column(name = "question_id", nullable = false)
    private Integer questionId;

    @Column(name = "student_answer", columnDefinition = "TEXT")
    private String studentAnswer;
}
