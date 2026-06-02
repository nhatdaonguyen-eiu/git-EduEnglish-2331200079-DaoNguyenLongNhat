package com.englishcenter.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * ================================================================
 * ENTITY: PaymentConfig
 * Ánh xạ bảng "payment_configs" lưu trữ cấu hình cổng thanh toán
 * trực tuyến động do Manager thiết lập.
 * ================================================================
 */
@Entity
@Table(name = "payment_configs")
@Data
public class PaymentConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Khóa định danh cổng: "VNPAY", "MOMO", "ZALOPAY", "BANK_TRANSFER"
    @Column(name = "gateway_key", nullable = false, unique = true, length = 50)
    private String gatewayKey;

    // Tên hiển thị cổng thanh toán (Ví dụ: "Ví điện tử MoMo", "Vietcombank")
    @Column(name = "gateway_name", nullable = false, length = 100)
    private String gatewayName;

    // Số tài khoản hoặc số điện thoại ví điện tử
    @Column(name = "account_number", nullable = false, length = 50)
    private String accountNumber;

    // Tên chủ tài khoản thụ hưởng
    @Column(name = "account_name", nullable = false, length = 100)
    private String accountName;

    // Đường dẫn ảnh QR tĩnh (nếu có upload)
    @Column(name = "qr_url", length = 255)
    private String qrUrl;

    // Cấu trúc cú pháp chuyển tiền (Ví dụ: "EDU {studentId} {classId}")
    @Column(name = "syntax_template", nullable = false, length = 255)
    private String syntaxTemplate = "EDU {studentId} {classId}";

    // Trạng thái kích hoạt cổng thanh toán này
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
