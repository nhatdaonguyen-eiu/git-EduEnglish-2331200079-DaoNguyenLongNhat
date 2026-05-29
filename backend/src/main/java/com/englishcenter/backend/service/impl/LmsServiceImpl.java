package com.englishcenter.backend.service.impl;

import com.englishcenter.backend.dto.*;
import com.englishcenter.backend.entity.*;
import com.englishcenter.backend.repository.*;
import com.englishcenter.backend.service.LmsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class LmsServiceImpl implements LmsService {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseMaterialRepository courseMaterialRepository;

    @Autowired
    private CourseActivityRepository courseActivityRepository;

    @Autowired
    private ActivityQuestionRepository activityQuestionRepository;

    @Autowired
    private StudentSubmissionRepository studentSubmissionRepository;

    @Autowired
    private SubmissionAnswerRepository submissionAnswerRepository;

    // ==========================================
    // MATERIALS
    // ==========================================

    @Override
    public MaterialResponse createMaterial(Integer courseId, MaterialRequest request) {
        courseRepository.findById(courseId)
                .filter(c -> !c.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy khóa học với ID: " + courseId
                ));

        CourseMaterial material = new CourseMaterial();
        material.setCourseId(courseId);
        material.setTitle(request.getTitle());
        material.setDescription(request.getDescription());
        material.setType(request.getType());
        material.setFileUrl(request.getFileUrl());
        material.setIsDeleted(false);

        CourseMaterial saved = courseMaterialRepository.save(material);
        return toMaterialResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MaterialResponse> getMaterialsByCourse(Integer courseId) {
        return courseMaterialRepository.findByCourseIdAndIsDeletedFalse(courseId)
                .stream()
                .map(this::toMaterialResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteMaterial(Integer materialId) {
        CourseMaterial material = courseMaterialRepository.findById(materialId)
                .filter(m -> !m.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy tài liệu với ID: " + materialId
                ));

        material.setIsDeleted(true);
        courseMaterialRepository.save(material);
    }

    // ==========================================
    // ACTIVITIES
    // ==========================================

    @Override
    public ActivityResponse createActivity(Integer courseId, ActivityRequest request) {
        courseRepository.findById(courseId)
                .filter(c -> !c.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy khóa học với ID: " + courseId
                ));

        CourseActivity activity = new CourseActivity();
        activity.setCourseId(courseId);
        activity.setTitle(request.getTitle());
        activity.setType(request.getType());
        activity.setSkill(request.getSkill());
        activity.setInstruction(request.getInstruction());
        activity.setAudioUrl(request.getAudioUrl());
        activity.setIsResultsReleased(false);
        activity.setIsDeleted(false);

        CourseActivity savedActivity = courseActivityRepository.save(activity);

        List<ActivityQuestion> savedQuestions = new ArrayList<>();
        if (request.getQuestions() != null) {
            for (QuestionRequest qr : request.getQuestions()) {
                ActivityQuestion question = new ActivityQuestion();
                question.setActivityId(savedActivity.getId());
                question.setQuestionNumber(qr.getQuestionNumber());
                question.setQuestionText(qr.getQuestionText());
                question.setQuestionType(qr.getQuestionType());
                question.setOptions(qr.getOptions());
                question.setCorrectAnswer(qr.getCorrectAnswer());
                savedQuestions.add(activityQuestionRepository.save(question));
            }
        }

        return toActivityResponse(savedActivity, savedQuestions, null); // passing null query userId (creator can see everything)
    }

    @Override
    @Transactional(readOnly = true)
    public List<ActivityResponse> getActivitiesByCourse(Integer courseId, Integer userId) {
        List<CourseActivity> activities = courseActivityRepository.findByCourseIdAndIsDeletedFalse(courseId);
        return activities.stream()
                .map(act -> {
                    List<ActivityQuestion> questions = activityQuestionRepository.findByActivityIdOrderByQuestionNumberAsc(act.getId());
                    return toActivityResponse(act, questions, userId);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ActivityResponse getActivityDetails(Integer activityId, Integer userId) {
        CourseActivity activity = courseActivityRepository.findById(activityId)
                .filter(act -> !act.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy hoạt động với ID: " + activityId
                ));

        List<ActivityQuestion> questions = activityQuestionRepository.findByActivityIdOrderByQuestionNumberAsc(activityId);
        return toActivityResponse(activity, questions, userId);
    }

    @Override
    public void deleteActivity(Integer activityId) {
        CourseActivity activity = courseActivityRepository.findById(activityId)
                .filter(act -> !act.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy hoạt động với ID: " + activityId
                ));

        activity.setIsDeleted(true);
        courseActivityRepository.save(activity);
    }

    @Override
    public void releaseTestResults(Integer activityId) {
        CourseActivity activity = courseActivityRepository.findById(activityId)
                .filter(act -> !act.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy hoạt động với ID: " + activityId
                ));

        activity.setIsResultsReleased(true);
        courseActivityRepository.save(activity);
    }

    // ==========================================
    // SUBMISSIONS & GRADING
    // ==========================================

    @Override
    public SubmissionResponse submitActivity(Integer activityId, SubmissionRequest request) {
        CourseActivity activity = courseActivityRepository.findById(activityId)
                .filter(act -> !act.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy hoạt động với ID: " + activityId
                ));

        // Find or create StudentSubmission
        StudentSubmission submission = studentSubmissionRepository.findByActivityIdAndStudentId(activityId, request.getStudentId())
                .orElse(new StudentSubmission());

        // Reset old answers if re-submitting
        if (submission.getId() != null) {
            List<SubmissionAnswer> oldAnswers = submissionAnswerRepository.findBySubmissionId(submission.getId());
            submissionAnswerRepository.deleteAll(oldAnswers);
        }

        submission.setActivityId(activityId);
        submission.setStudentId(request.getStudentId());
        submission.setTeacherFeedback(null); // Reset teacher feedback on new submission

        // Fetch questions
        List<ActivityQuestion> questions = activityQuestionRepository.findByActivityIdOrderByQuestionNumberAsc(activityId);
        Map<Integer, ActivityQuestion> questionMap = questions.stream()
                .collect(Collectors.toMap(ActivityQuestion::getId, q -> q));

        boolean hasManualGrading = false;
        double correctCount = 0.0;
        int totalQuestions = questions.size();

        for (ActivityQuestion q : questions) {
            if ("AUDIO_RESPONSE".equalsIgnoreCase(q.getQuestionType()) || "TEXT_RESPONSE".equalsIgnoreCase(q.getQuestionType())) {
                hasManualGrading = true;
            }
        }

        // Save new answers & compute auto-score
        List<SubmissionAnswer> savedAnswers = new ArrayList<>();
        StudentSubmission tempSaved = studentSubmissionRepository.save(submission);

        if (request.getAnswers() != null) {
            for (AnswerRequest ansReq : request.getAnswers()) {
                SubmissionAnswer answer = new SubmissionAnswer();
                answer.setSubmissionId(tempSaved.getId());
                answer.setQuestionId(ansReq.getQuestionId());
                answer.setStudentAnswer(ansReq.getStudentAnswer());

                SubmissionAnswer savedAnswer = submissionAnswerRepository.save(answer);
                savedAnswers.add(savedAnswer);

                // Auto-grade matches
                ActivityQuestion question = questionMap.get(ansReq.getQuestionId());
                if (question != null) {
                    String qType = question.getQuestionType();
                    if ("MULTIPLE_CHOICE".equalsIgnoreCase(qType) || "FILL_IN_THE_BLANK".equalsIgnoreCase(qType)) {
                        String cleanStudentAns = (ansReq.getStudentAnswer() != null) ? ansReq.getStudentAnswer().trim() : "";
                        String cleanCorrectAns = (question.getCorrectAnswer() != null) ? question.getCorrectAnswer().trim() : "";
                        if (!cleanCorrectAns.isEmpty() && cleanStudentAns.equalsIgnoreCase(cleanCorrectAns)) {
                            correctCount += 1.0;
                        }
                    }
                }
            }
        }

        // Calculate score
        double finalScore = 0.0;
        if (totalQuestions > 0) {
            finalScore = (correctCount * 10.0) / totalQuestions;
        }

        submission.setIsGraded(!hasManualGrading);
        submission.setScore(finalScore);

        StudentSubmission finalSaved = studentSubmissionRepository.save(submission);

        return toSubmissionResponse(finalSaved, savedAnswers, request.getStudentId());
    }

    @Override
    public SubmissionResponse gradeSubmission(Integer submissionId, GradeRequest request) {
        StudentSubmission submission = studentSubmissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy bài nộp với ID: " + submissionId
                ));

        submission.setScore(request.getScore());
        submission.setTeacherFeedback(request.getTeacherFeedback());
        submission.setIsGraded(true);

        StudentSubmission saved = studentSubmissionRepository.save(submission);
        List<SubmissionAnswer> answers = submissionAnswerRepository.findBySubmissionId(saved.getId());

        // Since teacher is grading, we pass null as querying userId to show all details
        return toSubmissionResponse(saved, answers, null);
    }

    @Override
    @Transactional(readOnly = true)
    public SubmissionResponse getSubmissionDetails(Integer submissionId, Integer userId) {
        StudentSubmission submission = studentSubmissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy bài nộp với ID: " + submissionId
                ));

        List<SubmissionAnswer> answers = submissionAnswerRepository.findBySubmissionId(submission.getId());
        return toSubmissionResponse(submission, answers, userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubmissionResponse> getSubmissionsForActivity(Integer activityId) {
        // Teacher/Admin usually queries this, so we don't hide answers
        return studentSubmissionRepository.findByActivityId(activityId)
                .stream()
                .map(sub -> {
                    List<SubmissionAnswer> answers = submissionAnswerRepository.findBySubmissionId(sub.getId());
                    return toSubmissionResponse(sub, answers, null);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubmissionResponse> getSubmissionsForStudent(Integer studentId) {
        // Querying for their own submissions
        return studentSubmissionRepository.findByStudentId(studentId)
                .stream()
                .map(sub -> {
                    List<SubmissionAnswer> answers = submissionAnswerRepository.findBySubmissionId(sub.getId());
                    return toSubmissionResponse(sub, answers, studentId);
                })
                .collect(Collectors.toList());
    }

    // ==========================================
    // HELPERS & DTO CONVERTERS
    // ==========================================

    private MaterialResponse toMaterialResponse(CourseMaterial m) {
        MaterialResponse res = new MaterialResponse();
        res.setId(m.getId());
        res.setCourseId(m.getCourseId());
        res.setTitle(m.getTitle());
        res.setDescription(m.getDescription());
        res.setType(m.getType());
        res.setFileUrl(m.getFileUrl());
        res.setCreatedAt(m.getCreatedAt());
        return res;
    }

    private ActivityResponse toActivityResponse(CourseActivity act, List<ActivityQuestion> questions, Integer userId) {
        ActivityResponse res = new ActivityResponse();
        res.setId(act.getId());
        res.setCourseId(act.getCourseId());
        res.setTitle(act.getTitle());
        res.setType(act.getType());
        res.setSkill(act.getSkill());
        res.setInstruction(act.getInstruction());
        res.setAudioUrl(act.getAudioUrl());
        res.setIsResultsReleased(act.getIsResultsReleased());
        res.setCreatedAt(act.getCreatedAt());

        boolean isStudent = false;
        if (userId != null) {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isPresent() && "STUDENT".equalsIgnoreCase(userOpt.get().getRole())) {
                isStudent = true;
            }
        }

        // Hide correct answers in questions if student is querying a TEST before results are released
        boolean hideCorrectAnswers = isStudent && "TEST".equalsIgnoreCase(act.getType()) && !act.getIsResultsReleased();

        List<QuestionResponse> qList = questions.stream()
                .map(q -> {
                    QuestionResponse qr = new QuestionResponse();
                    qr.setId(q.getId());
                    qr.setActivityId(q.getActivityId());
                    qr.setQuestionNumber(q.getQuestionNumber());
                    qr.setQuestionText(q.getQuestionText());
                    qr.setQuestionType(q.getQuestionType());
                    qr.setOptions(q.getOptions());
                    if (hideCorrectAnswers) {
                        qr.setCorrectAnswer(null);
                    } else {
                        qr.setCorrectAnswer(q.getCorrectAnswer());
                    }
                    return qr;
                })
                .collect(Collectors.toList());

        res.setQuestions(qList);
        return res;
    }

    private SubmissionResponse toSubmissionResponse(StudentSubmission sub, List<SubmissionAnswer> answers, Integer userId) {
        SubmissionResponse res = new SubmissionResponse();
        res.setId(sub.getId());
        res.setActivityId(sub.getActivityId());
        res.setStudentId(sub.getStudentId());
        res.setIsGraded(sub.getIsGraded());
        res.setCreatedAt(sub.getCreatedAt());

        CourseActivity act = courseActivityRepository.findById(sub.getActivityId()).orElse(null);

        boolean isStudent = false;
        if (userId != null) {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isPresent() && "STUDENT".equalsIgnoreCase(userOpt.get().getRole())) {
                isStudent = true;
            }
        }

        // Rule: If it's a TEST, and results are not released, hide score, feedback and answers for student
        boolean hideDetails = act != null && "TEST".equalsIgnoreCase(act.getType()) && !act.getIsResultsReleased() && isStudent;

        if (hideDetails) {
            res.setScore(null);
            res.setTeacherFeedback(null);
            res.setAnswers(null); // Hide answers completely
        } else {
            res.setScore(sub.getScore());
            res.setTeacherFeedback(sub.getTeacherFeedback());

            // Fetch question info to enrich answer details
            List<ActivityQuestion> questions = activityQuestionRepository.findByActivityIdOrderByQuestionNumberAsc(sub.getActivityId());
            Map<Integer, ActivityQuestion> questionMap = questions.stream()
                    .collect(Collectors.toMap(ActivityQuestion::getId, q -> q));

            List<AnswerResponse> ansList = answers.stream()
                    .map(ans -> {
                        AnswerResponse ar = new AnswerResponse();
                        ar.setId(ans.getId());
                        ar.setSubmissionId(ans.getSubmissionId());
                        ar.setQuestionId(ans.getQuestionId());
                        ar.setStudentAnswer(ans.getStudentAnswer());

                        ActivityQuestion q = questionMap.get(ans.getQuestionId());
                        if (q != null) {
                            ar.setQuestionText(q.getQuestionText());
                            ar.setQuestionType(q.getQuestionType());
                            ar.setOptions(q.getOptions());
                            ar.setCorrectAnswer(q.getCorrectAnswer());
                        }
                        return ar;
                    })
                    .collect(Collectors.toList());

            res.setAnswers(ansList);
        }

        return res;
    }
}
