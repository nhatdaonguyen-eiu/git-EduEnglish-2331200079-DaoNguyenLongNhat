package com.englishcenter.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class ProgressResponse {
    private Integer classId;
    private Integer courseId;
    private String courseTitle;
    private Integer totalActivities;
    private Integer completedActivities;
    private Double progressPercentage;
    private List<ActivityStatus> activities;

    @Data
    public static class ActivityStatus {
        private Integer activityId;
        private String title;
        private String type;
        private String skill;
        private boolean completed;
        private Double score;
        private Boolean isGraded;
    }
}
