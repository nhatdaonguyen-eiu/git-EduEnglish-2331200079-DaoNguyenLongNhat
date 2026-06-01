package com.englishcenter.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * ================================================================
 * DTO: BlogPostDTO
 * Đóng gói dữ liệu bài viết SEO trả ra cho học viên và trang quản trị.
 * ================================================================
 */
@Data
public class BlogPostDTO {
    private Integer id;
    private String title;
    private String slug;
    private String summary;
    private String content;
    private String faq;
    private String ctaText;
    private String ctaLink;
    private String thumbnailUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
