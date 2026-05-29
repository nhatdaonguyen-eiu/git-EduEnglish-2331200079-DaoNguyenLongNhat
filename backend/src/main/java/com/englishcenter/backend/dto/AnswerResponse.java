package com.englishcenter.backend.dto;

import lombok.Data;

@Data
public class AnswerResponse {
    private Integer id;
    private Integer submissionId;
    private Integer questionId;
    private String studentAnswer;
    private String questionText;
    private String questionType;
    private String options;
    private String correctAnswer;
}
