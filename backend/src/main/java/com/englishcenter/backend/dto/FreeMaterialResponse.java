package com.englishcenter.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

/**
 * ================================================================
 * DTO: FreeMaterialResponse
 * Định dạng phản hồi thông tin tài liệu miễn phí ra bên ngoài.
 * ================================================================
 */
@Data
public class FreeMaterialResponse {
    private Integer id;
    private String title;
    private String description;
    private String content;
    private String fileUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<QuestionResponse> questions;

    @Data
    public static class QuestionResponse {
        private Integer id;
        private Integer materialId;
        private Integer questionNumber;
        private String questionText;
        private String questionType;
        private String options;
        private String correctAnswer; // Trả về để phục vụ cả việc chỉnh sửa của Admin và chấm điểm
    }
}
