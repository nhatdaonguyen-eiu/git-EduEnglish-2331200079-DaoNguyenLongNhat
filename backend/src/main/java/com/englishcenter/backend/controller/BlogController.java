package com.englishcenter.backend.controller;

import com.englishcenter.backend.dto.BlogPostDTO;
import com.englishcenter.backend.dto.BlogPostRequest;
import com.englishcenter.backend.service.BlogService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * ================================================================
 * CONTROLLER: BlogController
 * Cung cấp APIs truy xuất bài viết SEO công khai và quản trị bài viết.
 * ================================================================
 */
@RestController
@RequestMapping("/api/blogs")
@CrossOrigin(origins = "http://localhost:5173")
public class BlogController {

    @Autowired
    private BlogService blogService;

    // ─────────────────────────────────────────────────────────────
    // GET /api/blogs
    // Lấy toàn bộ danh sách bài viết (Công khai cho Học viên)
    // ─────────────────────────────────────────────────────────────
    @GetMapping
    public ResponseEntity<List<BlogPostDTO>> getAllBlogs() {
        List<BlogPostDTO> blogs = blogService.getAllBlogs();
        return ResponseEntity.ok(blogs);
    }

    // ─────────────────────────────────────────────────────────────
    // GET /api/blogs/{id}
    // Lấy chi tiết bài viết theo ID
    // ─────────────────────────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<BlogPostDTO> getBlogById(@PathVariable Integer id) {
        BlogPostDTO blog = blogService.getBlogById(id);
        return ResponseEntity.ok(blog);
    }

    // ─────────────────────────────────────────────────────────────
    // GET /api/blogs/slug/{slug}
    // Lấy chi tiết bài viết theo URL Slug thân thiện SEO
    // ─────────────────────────────────────────────────────────────
    @GetMapping("/slug/{slug}")
    public ResponseEntity<BlogPostDTO> getBlogBySlug(@PathVariable String slug) {
        BlogPostDTO blog = blogService.getBlogBySlug(slug);
        return ResponseEntity.ok(blog);
    }

    // ─────────────────────────────────────────────────────────────
    // POST /api/blogs
    // Tạo bài viết mới (Chỉ Admin)
    // ─────────────────────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<BlogPostDTO> createBlog(@Valid @RequestBody BlogPostRequest request) {
        BlogPostDTO created = blogService.createBlog(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // ─────────────────────────────────────────────────────────────
    // PUT /api/blogs/{id}
    // Cập nhật bài viết theo ID (Chỉ Admin)
    // ─────────────────────────────────────────────────────────────
    @PutMapping("/{id}")
    public ResponseEntity<BlogPostDTO> updateBlog(
            @PathVariable Integer id,
            @Valid @RequestBody BlogPostRequest request) {
        BlogPostDTO updated = blogService.updateBlog(id, request);
        return ResponseEntity.ok(updated);
    }

    // ─────────────────────────────────────────────────────────────
    // DELETE /api/blogs/{id}
    // Xóa bài viết vĩnh viễn (Xóa mềm - Chỉ Admin)
    // ─────────────────────────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBlog(@PathVariable Integer id) {
        blogService.deleteBlog(id);
        return ResponseEntity.noContent().build();
    }
}
