package com.englishcenter.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.List;

@Data
public class ActivityRequest {
    @NotBlank(message = "Tiêu đề hoạt động không được để trống")
    private String title;

    // "ASSIGNMENT" or "TEST"
    @NotBlank(message = "Loại hoạt động không được để trống")
    private String type;

    // "LISTENING", "SPEAKING", "READING", "WRITING"
    @NotBlank(message = "Kỹ năng không được để trống")
    private String skill;

    private String instruction;

    private String audioUrl;

    @Valid
    private List<QuestionRequest> questions;
}
