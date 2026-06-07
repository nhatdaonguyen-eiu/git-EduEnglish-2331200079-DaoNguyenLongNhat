package com.englishcenter.backend.service.impl;

import com.englishcenter.backend.dto.GamificationProfileResponse;
import com.englishcenter.backend.dto.LeaderboardResponse;
import com.englishcenter.backend.dto.ProgressResponse;
import com.englishcenter.backend.entity.ClassEnrollment;
import com.englishcenter.backend.entity.Classroom;
import com.englishcenter.backend.entity.Course;
import com.englishcenter.backend.entity.CourseActivity;
import com.englishcenter.backend.entity.StudentBadge;
import com.englishcenter.backend.entity.StudentSubmission;
import com.englishcenter.backend.entity.User;
import com.englishcenter.backend.repository.ClassEnrollmentRepository;
import com.englishcenter.backend.repository.ClassroomRepository;
import com.englishcenter.backend.repository.CourseActivityRepository;
import com.englishcenter.backend.repository.CourseRepository;
import com.englishcenter.backend.repository.StudentBadgeRepository;
import com.englishcenter.backend.repository.StudentSubmissionRepository;
import com.englishcenter.backend.repository.UserRepository;
import com.englishcenter.backend.service.GamificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class GamificationServiceImpl implements GamificationService {

    private final UserRepository userRepository;
    private final StudentBadgeRepository studentBadgeRepository;
    private final StudentSubmissionRepository studentSubmissionRepository;
    private final ClassEnrollmentRepository classEnrollmentRepository;
    private final CourseActivityRepository courseActivityRepository;
    private final ClassroomRepository classroomRepository;
    private final CourseRepository courseRepository;

    // Định nghĩa metadata cho các huy hiệu trong hệ thống
    private static final Map<String, String[]> BADGE_METADATA = new LinkedHashMap<>();
    static {
        // key -> {title, description, icon}
        BADGE_METADATA.put("STREAK_3", new String[]{"Chiến binh 3 ngày", "Đạt chuỗi học liên tiếp 3 ngày", "🔥"});
        BADGE_METADATA.put("STREAK_7", new String[]{"Học giả 7 ngày", "Đạt chuỗi học liên tiếp 7 ngày", "⚡"});
        BADGE_METADATA.put("STREAK_15", new String[]{"Kỷ luật thép", "Đạt chuỗi học liên tiếp 15 ngày", "🛡️"});
        BADGE_METADATA.put("FIRST_SUBMISSION", new String[]{"Khởi đầu mới", "Nộp bài tập đầu tiên thành công", "🌱"});
        BADGE_METADATA.put("PERFECT_SCORE", new String[]{"Điểm tuyệt đối", "Đạt điểm 10/10 trên bài làm bất kỳ", "🏆"});
        BADGE_METADATA.put("SCHOLAR", new String[]{"Chuyên cần", "Hoàn thành từ 5 hoạt động học tập trở lên", "📚"});
        BADGE_METADATA.put("TOP_LEADERBOARD", new String[]{"Đỉnh cao", "Đạt Top 3 bảng xếp hạng học tập của lớp", "🥇"});
    }

    @Override
    public GamificationProfileResponse updateStreakAndGetProfile(Integer studentId) {
        triggerDailyCheckin(studentId);
        checkAndAwardBadges(studentId);

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Học viên không tồn tại!"));

        List<StudentBadge> earnedBadges = studentBadgeRepository.findByStudentId(studentId);
        Map<String, StudentBadge> earnedMap = earnedBadges.stream()
                .collect(Collectors.toMap(StudentBadge::getBadgeKey, b -> b, (b1, b2) -> b1));

        List<GamificationProfileResponse.BadgeDetail> badgeDetails = new ArrayList<>();
        for (Map.Entry<String, String[]> entry : BADGE_METADATA.entrySet()) {
            String key = entry.getKey();
            String[] meta = entry.getValue();
            boolean isEarned = earnedMap.containsKey(key);

            GamificationProfileResponse.BadgeDetail detail = new GamificationProfileResponse.BadgeDetail();
            detail.setBadgeKey(key);
            detail.setTitle(meta[0]);
            detail.setDescription(meta[1]);
            detail.setIcon(meta[2]);
            detail.setEarned(isEarned);
            if (isEarned) {
                detail.setEarnedAt(earnedMap.get(key).getEarnedAt());
            }
            badgeDetails.add(detail);
        }

        GamificationProfileResponse res = new GamificationProfileResponse();
        res.setStudentId(studentId);
        res.setCurrentStreak(student.getCurrentStreak());
        res.setLongestStreak(student.getLongestStreak());
        res.setLastActiveDate(student.getLastActiveDate());
        res.setBadges(badgeDetails);

        return res;
    }

    @Override
    public void triggerDailyCheckin(Integer studentId) {
        User student = userRepository.findById(studentId).orElse(null);
        if (student == null) return;

        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);
        LocalDate lastActive = student.getLastActiveDate();

        if (lastActive == null) {
            student.setCurrentStreak(1);
            student.setLongestStreak(Math.max(student.getLongestStreak(), 1));
            student.setLastActiveDate(today);
        } else if (lastActive.equals(yesterday)) {
            student.setCurrentStreak(student.getCurrentStreak() + 1);
            student.setLongestStreak(Math.max(student.getLongestStreak(), student.getCurrentStreak()));
            student.setLastActiveDate(today);
        } else if (!lastActive.equals(today)) {
            // Chuỗi hoạt động bị đứt quãng, thiết lập lại thành 1 ngày
            student.setCurrentStreak(1);
            student.setLastActiveDate(today);
        }

        userRepository.save(student);
    }

    @Override
    public void checkAndAwardBadges(Integer studentId) {
        User student = userRepository.findById(studentId).orElse(null);
        if (student == null) return;

        // 1. Kiểm tra các huy hiệu chuỗi ngày học
        if (student.getCurrentStreak() >= 3) {
            awardBadgeIfNotExist(studentId, "STREAK_3");
        }
        if (student.getCurrentStreak() >= 7) {
            awardBadgeIfNotExist(studentId, "STREAK_7");
        }
        if (student.getCurrentStreak() >= 15) {
            awardBadgeIfNotExist(studentId, "STREAK_15");
        }

        // 2. Kiểm tra số lượng bài tập đã nộp
        List<StudentSubmission> submissions = studentSubmissionRepository.findByStudentId(studentId);
        if (!submissions.isEmpty()) {
            awardBadgeIfNotExist(studentId, "FIRST_SUBMISSION");
        }
        if (submissions.size() >= 5) {
            awardBadgeIfNotExist(studentId, "SCHOLAR");
        }

        // 3. Kiểm tra thành tích bài nộp điểm 10/10
        boolean hasPerfectScore = submissions.stream()
                .anyMatch(s -> s.getScore() != null && s.getScore() >= 10.0);
        if (hasPerfectScore) {
            awardBadgeIfNotExist(studentId, "PERFECT_SCORE");
        }

        // 4. Kiểm tra thành tích đạt Top 3 trong lớp
        List<ClassEnrollment> enrollments = classEnrollmentRepository.findByStudentId(studentId);
        for (ClassEnrollment enr : enrollments) {
            List<LeaderboardResponse> lb = getClassLeaderboard(enr.getClassId());
            boolean isTop3 = lb.stream()
                    .filter(item -> item.getStudentId().equals(studentId))
                    .anyMatch(item -> item.getRank() != null && item.getRank() <= 3);
            if (isTop3) {
                awardBadgeIfNotExist(studentId, "TOP_LEADERBOARD");
                break;
            }
        }
    }

    private void awardBadgeIfNotExist(Integer studentId, String badgeKey) {
        if (!studentBadgeRepository.existsByStudentIdAndBadgeKey(studentId, badgeKey)) {
            StudentBadge badge = new StudentBadge();
            badge.setStudentId(studentId);
            badge.setBadgeKey(badgeKey);
            studentBadgeRepository.save(badge);
        }
    }

    @Override
    public List<LeaderboardResponse> getClassLeaderboard(Integer classId) {
        Classroom classroom = classroomRepository.findById(classId).orElse(null);
        if (classroom == null) return new ArrayList<>();

        List<ClassEnrollment> enrollments = classEnrollmentRepository.findByClassId(classId);
        List<CourseActivity> activities = courseActivityRepository.findByCourseIdAndIsDeletedFalse(classroom.getCourseId());

        List<LeaderboardResponse> lbList = new ArrayList<>();

        for (ClassEnrollment enr : enrollments) {
            User student = userRepository.findById(enr.getStudentId()).orElse(null);
            if (student == null || Boolean.TRUE.equals(student.getIsDeleted())) continue;

            double totalPoints = 0.0;
            int completedCount = 0;

            for (CourseActivity act : activities) {
                Optional<StudentSubmission> subOpt = studentSubmissionRepository.findByActivityIdAndStudentId(act.getId(), enr.getStudentId());
                if (subOpt.isPresent() && subOpt.get().getScore() != null) {
                    totalPoints += subOpt.get().getScore();
                    completedCount++;
                }
            }

            double averageScore = completedCount > 0 ? totalPoints / completedCount : 0.0;

            LeaderboardResponse record = new LeaderboardResponse();
            record.setStudentId(enr.getStudentId());
            record.setStudentName(student.getFullName());
            record.setAvatarUrl(student.getAvatarUrl());
            record.setCompletedCount(completedCount);
            record.setAverageScore(Math.round(averageScore * 100.0) / 100.0);
            record.setTotalPoints(Math.round(totalPoints * 100.0) / 100.0);
            lbList.add(record);
        }

        // Sắp xếp theo tổng điểm giảm dần, sau đó theo điểm trung bình giảm dần
        lbList.sort((a, b) -> {
            int comp = b.getTotalPoints().compareTo(a.getTotalPoints());
            if (comp != 0) return comp;
            return b.getAverageScore().compareTo(a.getAverageScore());
        });

        // Gán hạng thứ tự (Rank)
        for (int i = 0; i < lbList.size(); i++) {
            lbList.get(i).setRank(i + 1);
        }

        return lbList;
    }

    @Override
    public ProgressResponse getCourseProgress(Integer studentId, Integer classId) {
        Classroom classroom = classroomRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Lớp học không tồn tại!"));
        Course course = courseRepository.findById(classroom.getCourseId())
                .orElseThrow(() -> new IllegalArgumentException("Khóa học không tồn tại!"));

        List<CourseActivity> activities = courseActivityRepository.findByCourseIdAndIsDeletedFalse(classroom.getCourseId());
        List<ProgressResponse.ActivityStatus> actStatuses = new ArrayList<>();

        int completedCount = 0;
        for (CourseActivity act : activities) {
            Optional<StudentSubmission> subOpt = studentSubmissionRepository.findByActivityIdAndStudentId(act.getId(), studentId);
            boolean completed = subOpt.isPresent();
            Double score = completed ? subOpt.get().getScore() : null;
            Boolean isGraded = completed ? subOpt.get().getIsGraded() : null;

            if (completed) {
                completedCount++;
            }

            ProgressResponse.ActivityStatus status = new ProgressResponse.ActivityStatus();
            status.setActivityId(act.getId());
            status.setTitle(act.getTitle());
            status.setType(act.getType());
            status.setSkill(act.getSkill());
            status.setCompleted(completed);
            status.setScore(score);
            status.setIsGraded(isGraded);
            actStatuses.add(status);
        }

        double percent = activities.isEmpty() ? 100.0 : ((double) completedCount / activities.size()) * 100.0;

        ProgressResponse res = new ProgressResponse();
        res.setClassId(classId);
        res.setCourseId(course.getId());
        res.setCourseTitle(course.getTitle());
        res.setTotalActivities(activities.size());
        res.setCompletedActivities(completedCount);
        res.setProgressPercentage(Math.round(percent * 100.0) / 100.0);
        res.setActivities(actStatuses);

        return res;
    }
}
