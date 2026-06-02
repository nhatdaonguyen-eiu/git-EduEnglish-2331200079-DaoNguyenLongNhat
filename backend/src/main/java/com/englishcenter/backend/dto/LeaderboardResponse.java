package com.englishcenter.backend.dto;

import lombok.Data;

@Data
public class LeaderboardResponse {
    private Integer rank;
    private Integer studentId;
    private String studentName;
    private String avatarUrl;
    private Integer completedCount;
    private Double averageScore;
    private Double totalPoints;
}
