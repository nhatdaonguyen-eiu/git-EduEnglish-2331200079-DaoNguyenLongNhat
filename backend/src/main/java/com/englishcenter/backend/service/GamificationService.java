package com.englishcenter.backend.service;

import com.englishcenter.backend.dto.GamificationProfileResponse;
import com.englishcenter.backend.dto.LeaderboardResponse;
import com.englishcenter.backend.dto.ProgressResponse;

import java.util.List;

public interface GamificationService {
    GamificationProfileResponse updateStreakAndGetProfile(Integer studentId);
    void checkAndAwardBadges(Integer studentId);
    List<LeaderboardResponse> getClassLeaderboard(Integer classId);
    ProgressResponse getCourseProgress(Integer studentId, Integer classId);
    void triggerDailyCheckin(Integer studentId);
}
