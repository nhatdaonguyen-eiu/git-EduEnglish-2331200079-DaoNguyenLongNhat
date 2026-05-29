package com.englishcenter.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class SubmissionRequest {
    @NotNull(message = "ID học viên không được để trống")
    private Integer studentId;

    @NotEmpty(message = "Danh sách câu trả lời không được để trống")
    @Valid
    private List<AnswerRequest> answers;
}
