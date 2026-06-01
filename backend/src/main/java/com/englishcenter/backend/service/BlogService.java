package com.englishcenter.backend.service;

import com.englishcenter.backend.dto.BlogPostDTO;
import com.englishcenter.backend.dto.BlogPostRequest;

import java.util.List;

/**
 * ================================================================
 * SERVICE INTERFACE: BlogService
 * Định nghĩa nghiệp vụ quản trị & đọc bài viết chuẩn SEO.
 * ================================================================
 */
public interface BlogService {

    // Lấy toàn bộ danh sách bài viết hoạt động
    List<BlogPostDTO> getAllBlogs();

    // Lấy bài viết theo ID
    BlogPostDTO getBlogById(Integer id);

    // Lấy bài viết theo đường dẫn SEO Slug
    BlogPostDTO getBlogBySlug(String slug);

    // Admin tạo bài viết mới (Tự sinh Slug từ Title)
    BlogPostDTO createBlog(BlogPostRequest request);

    // Admin sửa bài viết theo ID
    BlogPostDTO updateBlog(Integer id, BlogPostRequest request);

    // Admin xóa bài viết (Xóa mềm)
    void deleteBlog(Integer id);

    // Tự động gieo (seed) bài viết mẫu lộ trình IELTS chuẩn SEO khi khởi chạy
    void initDefaultBlog();
}
