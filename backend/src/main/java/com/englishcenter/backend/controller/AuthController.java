package com.englishcenter.backend.controller;

import com.englishcenter.backend.dto.AuthRequest;
import com.englishcenter.backend.dto.AuthResponse;
import com.englishcenter.backend.entity.User;
import com.englishcenter.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * ================================================================
 * CONTROLLER: AuthController
 * Cung cấp API Đăng nhập, Đăng ký và truy vấn phân quyền người dùng.
 * ================================================================
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private UserService userService;

    // ─────────────────────────────────────────────────────────────
    // POST /api/auth/login
    // Thực hiện đăng nhập, trả về Token và thông tin vai trò
    // ─────────────────────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = userService.login(request);
        return ResponseEntity.ok(response);
    }

    // ─────────────────────────────────────────────────────────────
    // POST /api/auth/register
    // Đăng ký tài khoản học viên mới
    // ─────────────────────────────────────────────────────────────
    @PostMapping("/register")
    public ResponseEntity<User> register(@Valid @RequestBody User user) {
        User registered = userService.register(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(registered);
    }

    // ─────────────────────────────────────────────────────────────
    // GET /api/auth/teachers
    // Lấy danh sách giáo viên đang hoạt động (cho Admin chọn lịch dạy)
    // ─────────────────────────────────────────────────────────────
    @GetMapping("/teachers")
    public ResponseEntity<List<User>> getTeachers() {
        List<User> teachers = userService.getUsersByRole("TEACHER");
        return ResponseEntity.ok(teachers);
    }

    // ─────────────────────────────────────────────────────────────
    // GET /api/auth/students
    // Lấy danh sách học viên đang hoạt động (cho Admin xếp lớp)
    // ─────────────────────────────────────────────────────────────
    @GetMapping("/students")
    public ResponseEntity<List<User>> getStudents() {
        List<User> students = userService.getUsersByRole("STUDENT");
        return ResponseEntity.ok(students);
    }
}
