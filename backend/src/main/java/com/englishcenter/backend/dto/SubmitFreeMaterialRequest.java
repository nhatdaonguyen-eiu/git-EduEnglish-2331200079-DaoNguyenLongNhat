package com.englishcenter.backend.dto;

import lombok.Data;
import java.util.List;

/**
 * ================================================================
 * DTO: SubmitFreeMaterialRequest
 * Tiếp nhận danh sách câu trả lời từ người dùng khi nộp bài làm.
 * ================================================================
 */
@Data
public class SubmitFreeMaterialRequest {
    private List<AnswerRequest> answers;
}
