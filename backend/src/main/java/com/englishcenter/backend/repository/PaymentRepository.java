package com.englishcenter.backend.repository;

import com.englishcenter.backend.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * ================================================================
 * REPOSITORY: PaymentRepository
 * ================================================================
 */
@Repository
public interface PaymentRepository extends JpaRepository<Payment, Integer> {
    
    // Tìm hóa đơn thanh toán theo đăng ký lớp học
    Optional<Payment> findByEnrollmentId(Integer enrollmentId);

    // Tìm hóa đơn theo mã đơn hàng trực tuyến
    Optional<Payment> findByOrderId(String orderId);

    // Tìm tất cả các hóa đơn khớp với danh sách đăng ký
    List<Payment> findByEnrollmentIdIn(List<Integer> enrollmentIds);
}
