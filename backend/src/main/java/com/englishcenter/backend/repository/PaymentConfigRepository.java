package com.englishcenter.backend.repository;

import com.englishcenter.backend.entity.PaymentConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * ================================================================
 * REPOSITORY: PaymentConfigRepository
 * ================================================================
 */
@Repository
public interface PaymentConfigRepository extends JpaRepository<PaymentConfig, Integer> {

    // Tìm cấu hình cổng thanh toán dựa theo mã định danh (VNPAY, MOMO...)
    Optional<PaymentConfig> findByGatewayKey(String gatewayKey);
}
