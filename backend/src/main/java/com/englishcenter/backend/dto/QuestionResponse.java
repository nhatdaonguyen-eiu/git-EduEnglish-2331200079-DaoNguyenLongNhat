package com.englishcenter.backend.dto;

import lombok.Data;

@Data
public class QuestionResponse {
    private Integer id;
    private Integer activityId;
    private Integer questionNumber;
    private String questionText;
    private String questionType;
    private String options;
    private String correctAnswer;
}
