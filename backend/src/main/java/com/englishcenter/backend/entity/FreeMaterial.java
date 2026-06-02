package com.englishcenter.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * ================================================================
 * ENTITY: FreeMaterial
 * Ánh xạ trực tiếp với bảng "free_materials" trong MySQL.
 * Lưu trữ các tài liệu học tập công khai miễn phí.
 * ================================================================
 */
@Entity
@Table(name = "free_materials")
@Data
public class FreeMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "LONGTEXT")
    private String description;

    // Nội dung lý thuyết chính (Rich text / HTML)
    @Column(columnDefinition = "LONGTEXT")
    private String content;

    // Tệp đính kèm tài liệu học tập (ví dụ: PDF, DOCX)
    @Column(name = "file_url", columnDefinition = "LONGTEXT")
    private String fileUrl;

    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
