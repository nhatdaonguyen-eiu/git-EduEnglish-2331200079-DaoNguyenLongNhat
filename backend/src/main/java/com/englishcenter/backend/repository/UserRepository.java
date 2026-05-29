package com.englishcenter.backend.repository;

import com.englishcenter.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * ================================================================
 * REPOSITORY: UserRepository
 * Thao tác CSDL bảng users.
 * ================================================================
 */
@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    // Tìm kiếm người dùng còn hoạt động theo tên đăng nhập
    Optional<User> findByUsernameAndIsDeletedFalse(String username);

    // Kiểm tra tên đăng nhập đã tồn tại chưa
    boolean existsByUsernameAndIsDeletedFalse(String username);
}
