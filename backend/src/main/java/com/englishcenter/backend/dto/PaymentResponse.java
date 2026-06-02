package com.englishcenter.backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ================================================================
 * DTO: PaymentResponse
 * Trả về thông tin chi tiết hóa đơn thanh toán cho học viên & quản lý.
 * ================================================================
 */
@Data
public class PaymentResponse {
    private Integer id;
    private Integer enrollmentId;
    private Integer studentId;
    private String studentName;
    private String studentEmail;
    private String className;
    private String courseTitle;
    private BigDecimal amount;
    private String method;
    private String status;
    private String orderId;
    private String note;
    private LocalDateTime paymentDate;
    private LocalDateTime createdAt;

    // Đường dẫn để xem hóa đơn HTML tĩnh trên Server
    private String invoiceUrl;

    // Đường dẫn giả lập cổng thanh toán để demo (MoMo, ZaloPay, VNPay)
    private String paymentUrl;

    // Cú pháp chuyển khoản ngân hàng hợp lệ
    private String transferSyntax;
}
