package com.englishcenter.backend.service;

import com.englishcenter.backend.entity.Payment;

/**
 * ================================================================
 * SERVICE: EmailService
 * Chịu trách nhiệm sinh hóa đơn HTML tự động và ghi log mô phỏng email.
 * ================================================================
 */
public interface EmailService {

    /**
     * Sinh tệp hóa đơn HTML tĩnh lưu trên ổ đĩa và mô phỏng gửi email cho học viên.
     * @param payment Thông tin hóa đơn đã thanh toán thành công
     * @return Đường dẫn tương đối phục vụ tải hóa đơn (ví dụ: /uploads/invoices/invoice_1.html)
     */
    String generateInvoiceAndSimulateEmail(Payment payment);
}
