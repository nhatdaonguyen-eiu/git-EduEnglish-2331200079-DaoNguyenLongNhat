package com.englishcenter.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * ================================================================
 * ENTITY: BlogPost
 * Ánh xạ trực tiếp với bảng "blog_posts" trong MySQL.
 * Lưu trữ các bài viết chuẩn SEO để hỗ trợ kéo traffic và tạo uy tín.
 * ================================================================
 */
@Entity
@Table(name = "blog_posts")
@Data
public class BlogPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Tiêu đề chứa từ khóa chính, viết như người thật tìm kiếm
    @Column(nullable = false)
    private String title;

    // Đường dẫn thân thiện với SEO (URL slug)
    @Column(nullable = false, unique = true)
    private String slug;

    // Mở bài ngắn 2-3 câu trả lời thẳng vấn đề
    @Column(columnDefinition = "LONGTEXT")
    private String summary;

    // Thân bài chia các thẻ H2/H3 rõ ràng
    @Column(columnDefinition = "LONGTEXT")
    private String content;

    // FAQs lưu cấu trúc dưới dạng JSON string để linh hoạt render
    @Column(columnDefinition = "LONGTEXT")
    private String faq;

    // Chữ trên nút CTA gợi ý xem thêm lộ trình/học thử
    @Column(name = "cta_text", columnDefinition = "LONGTEXT")
    private String ctaText;

    // Liên kết của nút CTA
    @Column(name = "cta_link", columnDefinition = "LONGTEXT")
    private String ctaLink;

    // Banner ảnh đại diện minh họa cho bài viết
    @Column(name = "thumbnail_url", columnDefinition = "LONGTEXT")
    private String thumbnailUrl;

    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
