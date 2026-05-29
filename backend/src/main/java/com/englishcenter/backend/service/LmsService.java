package com.englishcenter.backend.service;

import com.englishcenter.backend.dto.*;
import java.util.List;

public interface LmsService {
    // Materials
    MaterialResponse createMaterial(Integer courseId, MaterialRequest request);
    List<MaterialResponse> getMaterialsByCourse(Integer courseId);
    void deleteMaterial(Integer materialId);

    // Activities
    ActivityResponse createActivity(Integer courseId, ActivityRequest request);
    List<ActivityResponse> getActivitiesByCourse(Integer courseId, Integer userId);
    ActivityResponse getActivityDetails(Integer activityId, Integer userId);
    void deleteActivity(Integer activityId);
    void releaseTestResults(Integer activityId);

    // Submissions
    SubmissionResponse submitActivity(Integer activityId, SubmissionRequest request);
    SubmissionResponse gradeSubmission(Integer submissionId, GradeRequest request);
    SubmissionResponse getSubmissionDetails(Integer submissionId, Integer userId);
    List<SubmissionResponse> getSubmissionsForActivity(Integer activityId);
    List<SubmissionResponse> getSubmissionsForStudent(Integer studentId);
}
