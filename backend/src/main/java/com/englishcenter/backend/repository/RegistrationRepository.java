package com.englishcenter.backend.repository;

import com.englishcenter.backend.entity.Registration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * ================================================================
 * REPOSITORY: RegistrationRepository
 * Thao tác trực tiếp với bảng registrations trong CSDL.
 * ================================================================
 */
@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Integer> {

    // Lọc danh sách đăng ký học chưa bị xóa, sắp xếp theo thời gian tạo mới nhất
    List<Registration> findByIsDeletedFalseOrderByCreatedAtDesc();
}
