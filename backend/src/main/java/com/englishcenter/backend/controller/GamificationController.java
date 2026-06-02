package com.englishcenter.backend.controller;

import com.englishcenter.backend.dto.GamificationProfileResponse;
import com.englishcenter.backend.dto.LeaderboardResponse;
import com.englishcenter.backend.dto.ProgressResponse;
import com.englishcenter.backend.service.GamificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * ================================================================
 * CONTROLLER: GamificationController
 * Expose các REST APIs phục vụ tính năng Gamification & Tiến trình học.
 * ================================================================
 */
@RestController
@RequestMapping("/api/gamification")
@CrossOrigin(origins = "http://localhost:5173")
public class GamificationController {

    @Autowired
    private GamificationService gamificationService;

    /**
     * Lấy hồ sơ gamification (streak, badges) của học viên
     */
    @GetMapping("/student/{studentId}")
    public ResponseEntity<GamificationProfileResponse> getStudentGamificationProfile(
            @PathVariable Integer studentId) {
        GamificationProfileResponse profile = gamificationService.updateStreakAndGetProfile(studentId);
        return ResponseEntity.ok(profile);
    }

    /**
     * Kích hoạt điểm danh check-in bằng nút bấm thủ công
     */
    @PostMapping("/student/{studentId}/check-in")
    public ResponseEntity<GamificationProfileResponse> triggerManualCheckin(
            @PathVariable Integer studentId) {
        gamificationService.triggerDailyCheckin(studentId);
        GamificationProfileResponse profile = gamificationService.updateStreakAndGetProfile(studentId);
        return ResponseEntity.ok(profile);
    }

    /**
     * Lấy bảng xếp hạng điểm thi đua trong lớp học
     */
    @GetMapping("/classroom/{classId}/leaderboard")
    public ResponseEntity<List<LeaderboardResponse>> getClassroomLeaderboard(
            @PathVariable Integer classId) {
        List<LeaderboardResponse> leaderboard = gamificationService.getClassLeaderboard(classId);
        return ResponseEntity.ok(leaderboard);
    }

    /**
     * Lấy chi tiết tiến độ học tập (Progress bar) cho một lớp cụ thể
     */
    @GetMapping("/student/{studentId}/classroom/{classId}/progress")
    public ResponseEntity<ProgressResponse> getStudentCourseProgress(
            @PathVariable Integer studentId,
            @PathVariable Integer classId) {
        ProgressResponse progress = gamificationService.getCourseProgress(studentId, classId);
        return ResponseEntity.ok(progress);
    }
}
