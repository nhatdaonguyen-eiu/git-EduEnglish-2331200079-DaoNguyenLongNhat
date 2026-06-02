package com.englishcenter.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ================================================================
 * ENTITY: Payment
 * Ánh xạ trực tiếp bảng "payments" trong MySQL.
 * Lưu trữ lịch sử giao dịch và trạng thái thanh toán học phí của học viên.
 * ================================================================
 */
@Entity
@Table(name = "payments")
@Data
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Liên kết trực tiếp với mã đăng ký lớp học (ClassEnrollment ID)
    @Column(name = "enrollment_id", nullable = false)
    private Integer enrollmentId;

    // Số tiền thanh toán (Ví dụ: 3,000,000)
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    // Phương thức: "CASH", "BANK_TRANSFER", "VNPAY", "MOMO", "ZALOPAY"
    @Column(nullable = false)
    private String method = "CASH";

    // Trạng thái: "PENDING" (Chờ thanh toán), "PAID" (Đã đóng), "REFUNDED" (Đã hoàn tiền)
    @Column(nullable = false)
    private String status = "PENDING";

    // Mã đơn hàng đối chiếu khi thanh toán online (order_id)
    @Column(name = "order_id")
    private String orderId;

    // Ghi chú chi tiết giao dịch
    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(name = "payment_date")
    private LocalDateTime paymentDate;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
