package com.englishcenter.backend.service.impl;

import com.englishcenter.backend.dto.AnswerRequest;
import com.englishcenter.backend.dto.FreeMaterialRequest;
import com.englishcenter.backend.dto.FreeMaterialResponse;
import com.englishcenter.backend.dto.GradeFreeMaterialResponse;
import com.englishcenter.backend.dto.SubmitFreeMaterialRequest;
import com.englishcenter.backend.entity.FreeMaterial;
import com.englishcenter.backend.entity.FreeMaterialQuestion;
import com.englishcenter.backend.repository.FreeMaterialQuestionRepository;
import com.englishcenter.backend.repository.FreeMaterialRepository;
import com.englishcenter.backend.service.FreeMaterialService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * ================================================================
 * SERVICE IMPLEMENTATION: FreeMaterialServiceImpl
 * ================================================================
 */
@Service
@Transactional
@RequiredArgsConstructor
public class FreeMaterialServiceImpl implements FreeMaterialService {

    private final FreeMaterialRepository freeMaterialRepository;
    private final FreeMaterialQuestionRepository freeMaterialQuestionRepository;

    @PostConstruct
    @Override
    public void initDefaultFreeMaterials() {
        if (freeMaterialRepository.count() == 0) {
            FreeMaterial material = new FreeMaterial();
            material.setTitle("Chinh Phục Thì Hiện Tại Hoàn Thành (Present Perfect Tense)");
            material.setDescription("Tổng hợp chi tiết lý thuyết, công thức, cách dùng, dấu hiệu nhận biết và bài tập trắc nghiệm tự luyện về thì Hiện Tại Hoàn Thành (Present Perfect).");
            material.setContent(
                "<h2>1. Khái Niệm Thì Hiện Tại Hoàn Thành</h2>\n" +
                "<p>Thì hiện tại hoàn thành (Present Perfect Tense) dùng để diễn tả một hành động, sự việc đã bắt đầu trong quá khứ, kéo dài đến hiện tại và có khả năng tiếp tục diễn ra trong tương lai; hoặc hành động đã hoàn thành nhưng kết quả/ảnh hưởng của nó vẫn còn quan trọng ở hiện tại.</p>\n\n" +
                "<h2>2. Công Thức (Form)</h2>\n" +
                "<ul>\n" +
                "  <li><b>Khẳng định:</b> S + have/has + V3/ed<br/><i>(I/You/We/They đi với <b>have</b>; He/She/It đi với <b>has</b>)</i></li>\n" +
                "  <li><b>Phủ định:</b> S + have/has + not + V3/ed</li>\n" +
                "  <li><b>Nghi vấn:</b> Have/Has + S + V3/ed?</li>\n" +
                "</ul>\n\n" +
                "<h2>3. Cách Dùng Phổ Biến</h2>\n" +
                "<ol>\n" +
                "  <li><b>Diễn tả kinh nghiệm, trải nghiệm:</b> Thường đi kèm với <i>ever, never</i>.<br/>- Ex: I have visited Paris twice. (Tôi đã đi thăm Paris 2 lần).</li>\n" +
                "  <li><b>Hành động bắt đầu trong quá khứ kéo dài đến hiện tại:</b> Thường đi kèm với <i>since, for</i>.<br/>- Ex: We have lived here for 10 years. (Chúng tôi đã sống ở đây được 10 năm).</li>\n" +
                "  <li><b>Hành động vừa mới xảy ra và để lại kết quả ở hiện tại:</b> Thường đi với <i>just, already, yet</i>.<br/>- Ex: She has just finished her homework. (Cô ấy vừa làm xong bài tập về nhà).</li>\n" +
                "</ol>"
            );
            material.setFileUrl("");
            material.setIsDeleted(false);

            FreeMaterial saved = freeMaterialRepository.save(material);

            // Gieo 3 câu hỏi luyện tập
            List<FreeMaterialQuestion> questions = new ArrayList<>();

            FreeMaterialQuestion q1 = new FreeMaterialQuestion();
            q1.setMaterialId(saved.getId());
            q1.setQuestionNumber(1);
            q1.setQuestionText("They ________ each other for five years.");
            q1.setQuestionType("MULTIPLE_CHOICE");
            q1.setOptions("A. know|B. have known|C. knew|D. are knowing");
            q1.setCorrectAnswer("B");
            questions.add(q1);

            FreeMaterialQuestion q2 = new FreeMaterialQuestion();
            q2.setMaterialId(saved.getId());
            q2.setQuestionNumber(2);
            q2.setQuestionText("I ________ my keys! I can't find them anywhere.");
            q2.setQuestionType("MULTIPLE_CHOICE");
            q2.setOptions("A. have lost|B. lost|C. lose|D. had lost");
            q2.setCorrectAnswer("A");
            questions.add(q2);

            FreeMaterialQuestion q3 = new FreeMaterialQuestion();
            q3.setMaterialId(saved.getId());
            q3.setQuestionNumber(3);
            q3.setQuestionText("She ________ (work) at this company since last October. (Write the correct Present Perfect form)");
            q3.setQuestionType("FILL_IN_THE_BLANK");
            q3.setOptions("");
            q3.setCorrectAnswer("has worked");
            questions.add(q3);

            freeMaterialQuestionRepository.saveAll(questions);
        }
    }

    @Override
    public List<FreeMaterialResponse> getAllFreeMaterials() {
        return freeMaterialRepository.findByIsDeletedFalseOrderByCreatedAtDesc().stream()
                .map(this::toResponseSummary)
                .collect(Collectors.toList());
    }

    @Override
    public FreeMaterialResponse getFreeMaterialById(Integer id) {
        FreeMaterial material = freeMaterialRepository.findById(id)
                .filter(m -> !m.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy tài liệu với ID: " + id
                ));

        List<FreeMaterialQuestion> questions = freeMaterialQuestionRepository.findByMaterialIdOrderByQuestionNumberAsc(id);
        return toResponseDetail(material, questions);
    }

    @Override
    public FreeMaterialResponse createFreeMaterial(FreeMaterialRequest request) {
        FreeMaterial material = new FreeMaterial();
        material.setTitle(request.getTitle());
        material.setDescription(request.getDescription());
        material.setContent(request.getContent());
        material.setFileUrl(request.getFileUrl());
        material.setIsDeleted(false);

        FreeMaterial saved = freeMaterialRepository.save(material);

        List<FreeMaterialQuestion> savedQuestions = new ArrayList<>();
        if (request.getQuestions() != null) {
            for (FreeMaterialRequest.QuestionRequest qr : request.getQuestions()) {
                FreeMaterialQuestion q = new FreeMaterialQuestion();
                q.setMaterialId(saved.getId());
                q.setQuestionNumber(qr.getQuestionNumber());
                q.setQuestionText(qr.getQuestionText());
                q.setQuestionType(qr.getQuestionType());
                q.setOptions(qr.getOptions());
                q.setCorrectAnswer(qr.getCorrectAnswer());
                savedQuestions.add(freeMaterialQuestionRepository.save(q));
            }
        }

        return toResponseDetail(saved, savedQuestions);
    }

    @Override
    public FreeMaterialResponse updateFreeMaterial(Integer id, FreeMaterialRequest request) {
        FreeMaterial material = freeMaterialRepository.findById(id)
                .filter(m -> !m.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy tài liệu với ID: " + id
                ));

        material.setTitle(request.getTitle());
        material.setDescription(request.getDescription());
        material.setContent(request.getContent());
        material.setFileUrl(request.getFileUrl());

        FreeMaterial saved = freeMaterialRepository.save(material);

        // Xóa tất cả các câu hỏi cũ và lưu lại các câu hỏi mới
        freeMaterialQuestionRepository.deleteByMaterialId(id);

        List<FreeMaterialQuestion> savedQuestions = new ArrayList<>();
        if (request.getQuestions() != null) {
            for (FreeMaterialRequest.QuestionRequest qr : request.getQuestions()) {
                FreeMaterialQuestion q = new FreeMaterialQuestion();
                q.setMaterialId(saved.getId());
                q.setQuestionNumber(qr.getQuestionNumber());
                q.setQuestionText(qr.getQuestionText());
                q.setQuestionType(qr.getQuestionType());
                q.setOptions(qr.getOptions());
                q.setCorrectAnswer(qr.getCorrectAnswer());
                savedQuestions.add(freeMaterialQuestionRepository.save(q));
            }
        }

        return toResponseDetail(saved, savedQuestions);
    }

    @Override
    public void deleteFreeMaterial(Integer id) {
        FreeMaterial material = freeMaterialRepository.findById(id)
                .filter(m -> !m.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy tài liệu với ID: " + id
                ));

        material.setIsDeleted(true);
        freeMaterialRepository.save(material);
    }

    @Override
    public GradeFreeMaterialResponse submitAnswers(Integer id, SubmitFreeMaterialRequest request) {
        FreeMaterial material = freeMaterialRepository.findById(id)
                .filter(m -> !m.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy tài liệu với ID: " + id
                ));

        List<FreeMaterialQuestion> questions = freeMaterialQuestionRepository.findByMaterialIdOrderByQuestionNumberAsc(id);
        Map<Integer, FreeMaterialQuestion> questionMap = questions.stream()
                .collect(Collectors.toMap(FreeMaterialQuestion::getId, q -> q));

        int correctCount = 0;
        int totalQuestions = questions.size();
        List<GradeFreeMaterialResponse.QuestionResult> results = new ArrayList<>();

        if (request.getAnswers() != null) {
            for (AnswerRequest ansReq : request.getAnswers()) {
                FreeMaterialQuestion q = questionMap.get(ansReq.getQuestionId());
                if (q != null) {
                    GradeFreeMaterialResponse.QuestionResult result = new GradeFreeMaterialResponse.QuestionResult();
                    result.setQuestionId(ansReq.getQuestionId());
                    result.setStudentAnswer(ansReq.getStudentAnswer());
                    result.setCorrectAnswer(q.getCorrectAnswer());

                    String cleanStudent = (ansReq.getStudentAnswer() != null) ? ansReq.getStudentAnswer().trim() : "";
                    String cleanCorrect = (q.getCorrectAnswer() != null) ? q.getCorrectAnswer().trim() : "";

                    boolean isCorrect = false;
                    if (!cleanCorrect.isEmpty() && cleanStudent.equalsIgnoreCase(cleanCorrect)) {
                        correctCount++;
                        isCorrect = true;
                    }
                    result.setIsCorrect(isCorrect);
                    results.add(result);
                }
            }
        }

        double score = 0.0;
        if (totalQuestions > 0) {
            score = (correctCount * 10.0) / totalQuestions;
        }

        GradeFreeMaterialResponse response = new GradeFreeMaterialResponse();
        response.setScore(score);
        response.setCorrectCount(correctCount);
        response.setTotalQuestions(totalQuestions);
        response.setResults(results);

        return response;
    }

    // ════════════════════════════════════════════════
    // MAPPERS
    // ════════════════════════════════════════════════

    private FreeMaterialResponse toResponseSummary(FreeMaterial material) {
        FreeMaterialResponse res = new FreeMaterialResponse();
        res.setId(material.getId());
        res.setTitle(material.getTitle());
        res.setDescription(material.getDescription());
        res.setContent(material.getContent());
        res.setFileUrl(material.getFileUrl());
        res.setCreatedAt(material.getCreatedAt());
        res.setUpdatedAt(material.getUpdatedAt());
        res.setQuestions(null); // Không tải các câu hỏi khi lấy danh sách
        return res;
    }

    private FreeMaterialResponse toResponseDetail(FreeMaterial material, List<FreeMaterialQuestion> questions) {
        FreeMaterialResponse res = new FreeMaterialResponse();
        res.setId(material.getId());
        res.setTitle(material.getTitle());
        res.setDescription(material.getDescription());
        res.setContent(material.getContent());
        res.setFileUrl(material.getFileUrl());
        res.setCreatedAt(material.getCreatedAt());
        res.setUpdatedAt(material.getUpdatedAt());

        List<FreeMaterialResponse.QuestionResponse> qResponses = questions.stream()
                .map(q -> {
                    FreeMaterialResponse.QuestionResponse qr = new FreeMaterialResponse.QuestionResponse();
                    qr.setId(q.getId());
                    qr.setMaterialId(q.getMaterialId());
                    qr.setQuestionNumber(q.getQuestionNumber());
                    qr.setQuestionText(q.getQuestionText());
                    qr.setQuestionType(q.getQuestionType());
                    qr.setOptions(q.getOptions());
                    qr.setCorrectAnswer(q.getCorrectAnswer());
                    return qr;
                }).collect(Collectors.toList());

        res.setQuestions(qResponses);
        return res;
    }
}
