package com.englishcenter.backend.controller;

import com.englishcenter.backend.dto.*;
import com.englishcenter.backend.service.LmsService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lms")
@CrossOrigin(origins = "http://localhost:5173")
public class LmsController {

    @Autowired
    private LmsService lmsService;

    // ==========================================
    // MATERIALS ENDPOINTS
    // ==========================================

    @PostMapping("/courses/{courseId}/materials")
    public ResponseEntity<MaterialResponse> createMaterial(
            @PathVariable Integer courseId,
            @Valid @RequestBody MaterialRequest request) {
        MaterialResponse created = lmsService.createMaterial(courseId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/courses/{courseId}/materials")
    public ResponseEntity<List<MaterialResponse>> getMaterialsByCourse(
            @PathVariable Integer courseId) {
        List<MaterialResponse> materials = lmsService.getMaterialsByCourse(courseId);
        return ResponseEntity.ok(materials);
    }

    @DeleteMapping("/materials/{materialId}")
    public ResponseEntity<Void> deleteMaterial(@PathVariable Integer materialId) {
        lmsService.deleteMaterial(materialId);
        return ResponseEntity.noContent().build();
    }

    // ==========================================
    // ACTIVITIES ENDPOINTS
    // ==========================================

    @PostMapping("/courses/{courseId}/activities")
    public ResponseEntity<ActivityResponse> createActivity(
            @PathVariable Integer courseId,
            @Valid @RequestBody ActivityRequest request) {
        ActivityResponse created = lmsService.createActivity(courseId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/courses/{courseId}/activities")
    public ResponseEntity<List<ActivityResponse>> getActivitiesByCourse(
            @PathVariable Integer courseId,
            @RequestParam(required = false) Integer userId) {
        List<ActivityResponse> activities = lmsService.getActivitiesByCourse(courseId, userId);
        return ResponseEntity.ok(activities);
    }

    @GetMapping("/activities/{activityId}")
    public ResponseEntity<ActivityResponse> getActivityDetails(
            @PathVariable Integer activityId,
            @RequestParam(required = false) Integer userId) {
        ActivityResponse activity = lmsService.getActivityDetails(activityId, userId);
        return ResponseEntity.ok(activity);
    }

    @DeleteMapping("/activities/{activityId}")
    public ResponseEntity<Void> deleteActivity(@PathVariable Integer activityId) {
        lmsService.deleteActivity(activityId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/activities/{activityId}/release")
    public ResponseEntity<Void> releaseTestResults(@PathVariable Integer activityId) {
        lmsService.releaseTestResults(activityId);
        return ResponseEntity.ok().build();
    }

    // ==========================================
    // SUBMISSIONS & GRADING ENDPOINTS
    // ==========================================

    @PostMapping("/activities/{activityId}/submissions")
    public ResponseEntity<SubmissionResponse> submitActivity(
            @PathVariable Integer activityId,
            @Valid @RequestBody SubmissionRequest request) {
        SubmissionResponse submission = lmsService.submitActivity(activityId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(submission);
    }

    @PutMapping("/submissions/{submissionId}/grade")
    public ResponseEntity<SubmissionResponse> gradeSubmission(
            @PathVariable Integer submissionId,
            @Valid @RequestBody GradeRequest request) {
        SubmissionResponse graded = lmsService.gradeSubmission(submissionId, request);
        return ResponseEntity.ok(graded);
    }

    @GetMapping("/submissions/{submissionId}")
    public ResponseEntity<SubmissionResponse> getSubmissionDetails(
            @PathVariable Integer submissionId,
            @RequestParam(required = false) Integer userId) {
        SubmissionResponse details = lmsService.getSubmissionDetails(submissionId, userId);
        return ResponseEntity.ok(details);
    }

    @GetMapping("/activities/{activityId}/submissions")
    public ResponseEntity<List<SubmissionResponse>> getSubmissionsForActivity(
            @PathVariable Integer activityId) {
        List<SubmissionResponse> submissions = lmsService.getSubmissionsForActivity(activityId);
        return ResponseEntity.ok(submissions);
    }

    @GetMapping("/students/{studentId}/submissions")
    public ResponseEntity<List<SubmissionResponse>> getSubmissionsForStudent(
            @PathVariable Integer studentId) {
        List<SubmissionResponse> submissions = lmsService.getSubmissionsForStudent(studentId);
        return ResponseEntity.ok(submissions);
    }
}
