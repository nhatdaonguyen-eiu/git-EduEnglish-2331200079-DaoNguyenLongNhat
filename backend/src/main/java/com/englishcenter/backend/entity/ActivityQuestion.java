package com.englishcenter.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "activity_questions")
@Data
public class ActivityQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "activity_id", nullable = false)
    private Integer activityId;

    @Column(name = "question_number", nullable = false)
    private Integer questionNumber;

    @Column(name = "question_text", columnDefinition = "TEXT", nullable = false)
    private String questionText;

    // "MULTIPLE_CHOICE", "FILL_IN_THE_BLANK", "TEXT_RESPONSE", "AUDIO_RESPONSE"
    @Column(name = "question_type", nullable = false)
    private String questionType;

    // Options split by "|" (e.g. "A. Yes|B. No|C. Not Given")
    @Column(columnDefinition = "TEXT")
    private String options;

    @Column(name = "correct_answer", columnDefinition = "TEXT")
    private String correctAnswer;
}
