package com.englishcenter.backend.dto;

import lombok.Data;
import java.util.List;

/**
 * ================================================================
 * DTO: GradeFreeMaterialResponse
 * Kết quả chấm điểm tự động trả về sau khi người dùng nộp bài làm.
 * ================================================================
 */
@Data
public class GradeFreeMaterialResponse {
    private Double score; // Điểm số hệ 10
    private Integer correctCount;
    private Integer totalQuestions;
    private List<QuestionResult> results;

    @Data
    public static class QuestionResult {
        private Integer questionId;
        private String studentAnswer;
        private String correctAnswer;
        private Boolean isCorrect;
    }
}
