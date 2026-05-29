package com.englishcenter.backend.service;

import com.englishcenter.backend.dto.AuthRequest;
import com.englishcenter.backend.dto.AuthResponse;
import com.englishcenter.backend.dto.CreateTeacherRequest;
import com.englishcenter.backend.dto.ProfileRequest;
import com.englishcenter.backend.entity.User;

import java.util.List;

/**
 * ================================================================
 * SERVICE INTERFACE: UserService
 * Nghiệp vụ quản lý tài khoản, đăng nhập & phân quyền.
 * ================================================================
 */
public interface UserService {

    // Thực hiện đăng nhập hệ thống
    AuthResponse login(AuthRequest request);

    // Đăng ký tài khoản học viên mới
    User register(User user);

    // Lấy danh sách tài khoản theo vai trò (ví dụ: lấy tất cả TEACHER)
    List<User> getUsersByRole(String role);

    // Tự động sinh tài khoản Admin mẫu lúc khởi chạy nếu CSDL trống
    void initDefaultAdmin();

    // Tạo tài khoản giáo viên (chỉ Admin)
    User createTeacher(CreateTeacherRequest request);

    // Lấy thông tin hồ sơ cá nhân
    AuthResponse getUserProfile(Integer userId);

    // Cập nhật hồ sơ cá nhân
    AuthResponse updateProfile(Integer userId, ProfileRequest request);

    // Xóa mềm tài khoản (người dùng tự xóa)
    void deleteAccount(Integer userId, String password);
}
