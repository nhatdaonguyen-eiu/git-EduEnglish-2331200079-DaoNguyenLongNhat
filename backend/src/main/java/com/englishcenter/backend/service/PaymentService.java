package com.englishcenter.backend.service;

import com.englishcenter.backend.dto.PaymentRequest;
import com.englishcenter.backend.dto.PaymentResponse;
import com.englishcenter.backend.dto.TuitionStatsResponse;

import java.math.BigDecimal;
import java.util.List;

/**
 * ================================================================
 * SERVICE: PaymentService
 * ================================================================
 */
public interface PaymentService {

    // Khởi tạo thanh toán học phí (Sinh hóa đơn PENDING)
    PaymentResponse initiateTuitionPayment(PaymentRequest request);

    // Xác nhận thanh toán thành công (Chuyển trạng thái PAID, gửi hóa đơn email)
    PaymentResponse confirmPaymentSuccess(Integer paymentId);

    // Nhận phản hồi/callback thành công từ giao diện giả lập trực tuyến
    PaymentResponse processMockCallback(String orderId);

    // Lọc tìm hóa đơn theo mã đơn hàng trực tuyến
    PaymentResponse getPaymentDetailsByOrderId(String orderId);

    // Lấy thông tin thanh toán cho một học sinh đóng lớp học
    PaymentResponse getPaymentDetailsByEnrollment(Integer enrollmentId);

    // Học sinh xem lịch sử đóng học phí của mình
    List<PaymentResponse> getStudentPayments(Integer studentId);

    // Admin cập nhật đóng học phí thủ công (Tiền mặt/Chuyển khoản trực tiếp)
    PaymentResponse markCashPaymentAsPaid(Integer enrollmentId, BigDecimal amount, String method, String note);

    // Thống kê doanh thu, trạng thái đóng tiền theo lớp/học kỳ phục vụ Admin Dashboard
    TuitionStatsResponse getTuitionStatistics(Integer classId, String semester);

    // Học sinh nộp yêu cầu duyệt chuyển khoản (Trạng thái PENDING -> PENDING_APPROVAL)
    PaymentResponse submitPaymentForApproval(String orderId);
}
