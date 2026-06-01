package com.englishcenter.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * ================================================================
 * REQUEST DTO: BlogPostRequest
 * Tiếp nhận thông tin bài viết SEO được gửi lên từ trang quản trị Admin.
 * ================================================================
 */
@Data
public class BlogPostRequest {

    @NotBlank(message = "Tiêu đề bài viết không được để trống")
    private String title;

    private String summary;

    private String content;

    private String faq;

    private String ctaText;

    private String ctaLink;

    private String thumbnailUrl;
}
