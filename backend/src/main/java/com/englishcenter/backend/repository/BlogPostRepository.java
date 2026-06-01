package com.englishcenter.backend.repository;

import com.englishcenter.backend.entity.BlogPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * ================================================================
 * REPOSITORY: BlogPostRepository
 * Các truy vấn dữ liệu thao tác với bảng blog_posts trong MySQL.
 * ================================================================
 */
@Repository
public interface BlogPostRepository extends JpaRepository<BlogPost, Integer> {

    // Lấy tất cả bài viết chưa xóa mềm xếp theo thứ tự mới nhất trước
    List<BlogPost> findByIsDeletedFalseOrderByCreatedAtDesc();

    // Tìm kiếm bài viết chuẩn SEO theo chuỗi URL Slug
    Optional<BlogPost> findBySlugAndIsDeletedFalse(String slug);
}
