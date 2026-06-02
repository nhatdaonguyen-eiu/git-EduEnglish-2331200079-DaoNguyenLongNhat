package com.englishcenter.backend.dto;

import lombok.Data;
import java.util.List;

/**
 * ================================================================
 * DTO: FreeMaterialRequest
 * Tiếp nhận thông tin tài liệu miễn phí mới hoặc cập nhật từ Admin.
 * ================================================================
 */
@Data
public class FreeMaterialRequest {
    private String title;
    private String description;
    private String content;
    private String fileUrl;
    private List<QuestionRequest> questions;

    @Data
    public static class QuestionRequest {
        private Integer id; // Sử dụng khi cập nhật câu hỏi đã tồn tại
        private Integer questionNumber;
        private String questionText;
        private String questionType;
        private String options;
        private String correctAnswer;
    }
}
