package com.englishcenter.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class SubmissionResponse {
    private Integer id;
    private Integer activityId;
    private Integer studentId;
    private Double score;
    private String teacherFeedback;
    private Boolean isGraded;
    private LocalDateTime createdAt;
    private List<AnswerResponse> answers;
}
