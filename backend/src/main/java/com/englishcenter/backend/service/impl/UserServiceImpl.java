package com.englishcenter.backend.service.impl;

import com.englishcenter.backend.dto.AuthRequest;
import com.englishcenter.backend.dto.AuthResponse;
import com.englishcenter.backend.entity.User;
import com.englishcenter.backend.repository.UserRepository;
import com.englishcenter.backend.service.UserService;
import com.englishcenter.backend.util.HashUtil;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * ================================================================
 * SERVICE IMPL: UserServiceImpl
 * Triển khai nghiệp vụ người dùng, đăng nhập, mã hóa SHA-256.
 * ================================================================
 */
@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @PostConstruct
    @Override
    public void initDefaultAdmin() {
        // Tự động gieo dữ liệu tài khoản mặc định nếu DB trống
        if (userRepository.count() == 0) {
            // 1. Tài khoản ADMIN
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(HashUtil.hashPassword("admin123"));
            admin.setFullName("Hệ Thống Quản Trị Viên");
            admin.setEmail("admin@eduenglish.edu.vn");
            admin.setRole("ADMIN");
            admin.setIsDeleted(false);
            userRepository.save(admin);

            // 2. Tài khoản TEACHER
            User teacher = new User();
            teacher.setUsername("teacher");
            teacher.setPassword(HashUtil.hashPassword("teacher123"));
            teacher.setFullName("Teacher David Harrison");
            teacher.setEmail("david.harrison@eduenglish.edu.vn");
            teacher.setRole("TEACHER");
            teacher.setIsDeleted(false);
            userRepository.save(teacher);

            // 3. Tài khoản STUDENT
            User student = new User();
            student.setUsername("student");
            student.setPassword(HashUtil.hashPassword("student123"));
            student.setFullName("Bạch Gia Huy");
            student.setEmail("huydeptrai@gmail.com");
            student.setRole("STUDENT");
            student.setIsDeleted(false);
            userRepository.save(student);
        }
    }

    @Override
    public AuthResponse login(AuthRequest request) {
        // 1. Kiểm tra tài khoản tồn tại
        User user = userRepository.findByUsernameAndIsDeletedFalse(request.getUsername())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Tên đăng nhập hoặc mật khẩu không chính xác"
                ));

        // 2. Kiểm tra mật khẩu mã hóa
        boolean isMatch = HashUtil.checkPassword(request.getPassword(), user.getPassword());
        if (!isMatch) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Tên đăng nhập hoặc mật khẩu không chính xác"
            );
        }

        // 3. Đăng nhập thành công -> Tạo mô phỏng Session Token
        AuthResponse response = new AuthResponse();
        response.setId(user.getId()); // Gán ID người dùng
        response.setToken(UUID.randomUUID().toString()); // Sinh ngẫu nhiên Token phiên làm việc
        response.setUsername(user.getUsername());
        response.setFullName(user.getFullName());
        response.setRole(user.getRole());
        response.setEmail(user.getEmail()); // Gán Email người dùng

        return response;
    }

    @Override
    public User register(User user) {
        // 1. Kiểm tra tên đăng nhập trùng lặp
        if (userRepository.existsByUsernameAndIsDeletedFalse(user.getUsername())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Tên đăng nhập đã tồn tại trên hệ thống"
            );
        }

        // 2. Mã hóa mật khẩu
        user.setPassword(HashUtil.hashPassword(user.getPassword()));
        user.setRole("STUDENT"); // Đăng ký tự do mặc định luôn là STUDENT
        user.setIsDeleted(false);

        // 3. Lưu lại
        return userRepository.save(user);
    }

    @Override
    public List<User> getUsersByRole(String role) {
        return userRepository.findAll().stream()
                .filter(u -> !u.getIsDeleted() && u.getRole().equalsIgnoreCase(role))
                .collect(Collectors.toList());
    }
}
