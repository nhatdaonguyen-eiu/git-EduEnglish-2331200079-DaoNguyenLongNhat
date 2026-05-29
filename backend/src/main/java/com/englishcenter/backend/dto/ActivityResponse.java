package com.englishcenter.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ActivityResponse {
    private Integer id;
    private Integer courseId;
    private String title;
    private String type;
    private String skill;
    private String instruction;
    private String audioUrl;
    private Boolean isResultsReleased;
    private LocalDateTime createdAt;
    private List<QuestionResponse> questions;
}
