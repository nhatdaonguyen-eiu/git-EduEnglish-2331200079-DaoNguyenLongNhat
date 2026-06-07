package com.englishcenter.backend.controller;

import com.englishcenter.backend.dto.PaymentRequest;
import com.englishcenter.backend.dto.PaymentResponse;
import com.englishcenter.backend.dto.TuitionStatsResponse;
import com.englishcenter.backend.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * ================================================================
 * CONTROLLER: PaymentController
 * Cung cấp API quản lý giao dịch học phí, hóa đơn, và báo cáo doanh thu.
 * ================================================================
 */
@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    // 1. Khởi tạo thanh toán học phí (Sinh hóa đơn PENDING)
    @PostMapping("/create")
    public ResponseEntity<PaymentResponse> initiatePayment(@RequestBody PaymentRequest request) {
        PaymentResponse response = paymentService.initiateTuitionPayment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 2. Xác nhận thanh toán thành công (Thủ công / Dành cho nhà phát triển kiểm tra)
    @PostMapping("/confirm-success/{id}")
    public ResponseEntity<PaymentResponse> confirmPayment(@PathVariable Integer id) {
        return ResponseEntity.ok(paymentService.confirmPaymentSuccess(id));
    }

    // 3. Callback giả lập từ Cổng thanh toán MoMo/ZaloPay/VNPay trên frontend
    @PostMapping("/mock-callback")
    public ResponseEntity<PaymentResponse> mockCallback(@RequestParam String orderId) {
        return ResponseEntity.ok(paymentService.processMockCallback(orderId));
    }

    // 3.5. Học viên gửi yêu cầu xác thực chuyển khoản (PENDING -> PENDING_APPROVAL)
    @PostMapping("/submit-approval")
    public ResponseEntity<PaymentResponse> submitApproval(
            @RequestParam String orderId,
            @RequestParam(required = false) String proofUrl) {
        return ResponseEntity.ok(paymentService.submitPaymentForApproval(orderId, proofUrl));
    }

    // 4. Lấy chi tiết hóa đơn thanh toán theo Mã đăng ký lớp (ClassEnrollment ID)
    @GetMapping("/enrollment/{enrollmentId}")
    public ResponseEntity<PaymentResponse> getPaymentByEnrollment(@PathVariable Integer enrollmentId) {
        PaymentResponse response = paymentService.getPaymentDetailsByEnrollment(enrollmentId);
        if (response == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(response);
    }

    // 5. Lấy lịch sử thanh toán học phí của một học sinh
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<PaymentResponse>> getStudentPayments(@PathVariable Integer studentId) {
        return ResponseEntity.ok(paymentService.getStudentPayments(studentId));
    }

    // 6. Admin cập nhật trạng thái đóng học phí tiền mặt hoặc chuyển khoản thủ công tại quầy
    @PostMapping("/cash-pay")
    public ResponseEntity<PaymentResponse> payWithCash(
            @RequestParam Integer enrollmentId,
            @RequestParam BigDecimal amount,
            @RequestParam(required = false) String method,
            @RequestParam(required = false) String note) {
        return ResponseEntity.ok(paymentService.markCashPaymentAsPaid(enrollmentId, amount, method, note));
    }

    // 7. Thống kê doanh thu theo lớp hoặc học kỳ dành cho Admin Dashboard
    @GetMapping("/stats")
    public ResponseEntity<TuitionStatsResponse> getTuitionStats(
            @RequestParam(required = false) Integer classId,
            @RequestParam(required = false) String semester) {
        return ResponseEntity.ok(paymentService.getTuitionStatistics(classId, semester));
    }

    // 8. Lấy chi tiết đơn thanh toán theo Mã đơn hàng (order_id)
    @GetMapping("/order/{orderId}")
    public ResponseEntity<PaymentResponse> getPaymentByOrderId(@PathVariable String orderId) {
        PaymentResponse response = paymentService.getPaymentDetailsByOrderId(orderId);
        if (response == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(response);
    }
}
