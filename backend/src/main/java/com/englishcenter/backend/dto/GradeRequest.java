package com.englishcenter.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class GradeRequest {
    @NotNull(message = "Điểm số không được để trống")
    private Double score;

    private String teacherFeedback;
}
