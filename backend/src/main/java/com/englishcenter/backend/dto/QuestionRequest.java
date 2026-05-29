package com.englishcenter.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class QuestionRequest {
    @NotNull(message = "Số thứ tự câu hỏi không được để trống")
    private Integer questionNumber;

    @NotBlank(message = "Nội dung câu hỏi không được để trống")
    private String questionText;

    // "MULTIPLE_CHOICE", "FILL_IN_THE_BLANK", "TEXT_RESPONSE", "AUDIO_RESPONSE"
    @NotBlank(message = "Loại câu hỏi không được để trống")
    private String questionType;

    // Options split by "|" (e.g. "A. Yes|B. No|C. Not Given")
    private String options;

    private String correctAnswer;
}
