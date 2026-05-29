package com.englishcenter.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AnswerRequest {
    @NotNull(message = "ID câu hỏi không được để trống")
    private Integer questionId;

    private String studentAnswer;
}
