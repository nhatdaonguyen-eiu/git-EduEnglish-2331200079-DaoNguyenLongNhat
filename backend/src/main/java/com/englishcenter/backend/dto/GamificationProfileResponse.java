package com.englishcenter.backend.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class GamificationProfileResponse {
    private Integer studentId;
    private Integer currentStreak;
    private Integer longestStreak;
    private LocalDate lastActiveDate;
    private List<BadgeDetail> badges;

    @Data
    public static class BadgeDetail {
        private String badgeKey;
        private String title;
        private String description;
        private String icon;
        private boolean earned;
        private LocalDateTime earnedAt;
    }
}
