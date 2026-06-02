package com.englishcenter.backend.dto;

import lombok.Data;
import java.math.BigDecimal;

/**
 * ================================================================
 * DTO: PaymentRequest
 * Dùng khi học viên gửi yêu cầu thanh toán học phí online, hoặc
 * khi Admin cập nhật trạng thái nộp học phí thủ công.
 * ================================================================
 */
@Data
public class PaymentRequest {
    private Integer enrollmentId;
    private BigDecimal amount;
    private String method; // CASH, BANK_TRANSFER, VNPAY, MOMO, ZALOPAY
    private String status; // PENDING, PAID, REFUNDED
    private String note;
}
