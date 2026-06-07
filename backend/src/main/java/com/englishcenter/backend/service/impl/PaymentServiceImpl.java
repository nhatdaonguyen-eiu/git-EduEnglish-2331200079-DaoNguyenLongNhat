package com.englishcenter.backend.service.impl;

import com.englishcenter.backend.dto.*;
import com.englishcenter.backend.entity.*;
import com.englishcenter.backend.repository.*;
import com.englishcenter.backend.service.EmailService;
import com.englishcenter.backend.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * ================================================================
 * SERVICE IMPLEMENTATION: PaymentServiceImpl
 * ================================================================
 */
@Service
@Transactional
public class PaymentServiceImpl implements PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private ClassEnrollmentRepository classEnrollmentRepository;

    @Autowired
    private ClassroomRepository classroomRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PaymentConfigRepository paymentConfigRepository;

    @Override
    public PaymentResponse initiateTuitionPayment(PaymentRequest request) {
        ClassEnrollment enrollment = classEnrollmentRepository.findById(request.getEnrollmentId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy học viên trong lớp với ID: " + request.getEnrollmentId()
                ));

        Classroom classroom = classroomRepository.findById(enrollment.getClassId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy lớp học!"
                ));

        Course course = courseRepository.findById(classroom.getCourseId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy khóa học liên quan!"
                ));

        // Xác định học phí thực tế của lớp (nếu chưa cấu hình sẽ lấy theo giá gốc của khóa học)
        BigDecimal expectedAmount = classroom.getTuitionFee() != null && classroom.getTuitionFee().compareTo(BigDecimal.ZERO) > 0
                ? classroom.getTuitionFee()
                : course.getPrice();

        // Kiểm tra xem đã có giao dịch nào tồn tại trước đó cho lượt đăng ký lớp này chưa
        Optional<Payment> existingPaymentOpt = paymentRepository.findByEnrollmentId(request.getEnrollmentId());
        Payment payment;

        if (existingPaymentOpt.isPresent()) {
            payment = existingPaymentOpt.get();
            // Nếu đã thanh toán thành công rồi, trả về luôn để tránh đóng trùng
            if ("PAID".equals(payment.getStatus())) {
                return toResponse(payment);
            }
            // Nếu đang chờ thanh toán, cập nhật lại số tiền, hình thức và ghi chú mới
            payment.setMethod(request.getMethod());
            payment.setAmount(expectedAmount);
            if (request.getNote() != null) {
                payment.setNote(request.getNote());
            }
        } else {
            payment = new Payment();
            payment.setEnrollmentId(request.getEnrollmentId());
            payment.setAmount(expectedAmount);
            payment.setMethod(request.getMethod());
            payment.setStatus("PENDING");
            payment.setOrderId("EDU" + System.currentTimeMillis() + "_" + enrollment.getStudentId() + "_" + enrollment.getClassId());
            payment.setNote(request.getNote() != null ? request.getNote() : "Thanh toán học phí lớp " + classroom.getClassName());
        }

        Payment saved = paymentRepository.save(payment);
        return toResponse(saved);
    }

    @Override
    public PaymentResponse confirmPaymentSuccess(Integer paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy hóa đơn học phí với ID: " + paymentId
                ));

        if (!"PAID".equals(payment.getStatus())) {
            payment.setStatus("PAID");
            payment.setPaymentDate(LocalDateTime.now());
            payment = paymentRepository.save(payment);

            // Tự động sinh hóa đơn HTML tĩnh lưu trên đĩa và in log gửi email
            emailService.generateInvoiceAndSimulateEmail(payment);
        }

        return toResponse(payment);
    }

    @Override
    public PaymentResponse processMockCallback(String orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng giao dịch: " + orderId
                ));

        if (!"PAID".equals(payment.getStatus())) {
            payment.setStatus("PAID");
            payment.setPaymentDate(LocalDateTime.now());
            payment = paymentRepository.save(payment);

            // Tự động sinh hóa đơn HTML và gửi email giả lập
            emailService.generateInvoiceAndSimulateEmail(payment);
        }

        return toResponse(payment);
    }

    @Override
    public PaymentResponse getPaymentDetailsByOrderId(String orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId).orElse(null);
        if (payment == null) return null;
        return toResponse(payment);
    }

    @Override
    public PaymentResponse getPaymentDetailsByEnrollment(Integer enrollmentId) {
        Payment payment = paymentRepository.findByEnrollmentId(enrollmentId).orElse(null);
        if (payment == null) return null;
        return toResponse(payment);
    }

    @Override
    public List<PaymentResponse> getStudentPayments(Integer studentId) {
        List<ClassEnrollment> enrollments = classEnrollmentRepository.findByStudentId(studentId);
        if (enrollments.isEmpty()) return new ArrayList<>();

        List<Integer> enrollmentIds = enrollments.stream().map(ClassEnrollment::getId).collect(Collectors.toList());
        return paymentRepository.findByEnrollmentIdIn(enrollmentIds).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public PaymentResponse markCashPaymentAsPaid(Integer enrollmentId, BigDecimal amount, String method, String note) {
        ClassEnrollment enrollment = classEnrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy học viên trong lớp!"
                ));

        Optional<Payment> existing = paymentRepository.findByEnrollmentId(enrollmentId);
        Payment payment;

        if (existing.isPresent()) {
            payment = existing.get();
        } else {
            payment = new Payment();
            payment.setEnrollmentId(enrollmentId);
            payment.setOrderId("CASH" + System.currentTimeMillis() + "_" + enrollment.getStudentId());
        }

        payment.setAmount(amount);
        payment.setStatus("PAID");
        payment.setMethod(method != null ? method : "CASH");
        payment.setPaymentDate(LocalDateTime.now());
        payment.setNote(note != null ? note : "Đóng tiền mặt thủ công tại quầy tư vấn.");

        Payment saved = paymentRepository.save(payment);

        // Sinh hóa đơn và ghi log email
        emailService.generateInvoiceAndSimulateEmail(saved);

        return toResponse(saved);
    }

    @Override
    public TuitionStatsResponse getTuitionStatistics(Integer classId, String semester) {
        List<Classroom> targetClasses;

        // Lọc danh sách lớp học cần thống kê
        if (classId != null) {
            Classroom c = classroomRepository.findById(classId).orElse(null);
            targetClasses = c != null ? Collections.singletonList(c) : new ArrayList<>();
        } else if (semester != null && !semester.trim().isEmpty()) {
            targetClasses = classroomRepository.findBySemesterAndIsDeletedFalse(semester);
        } else {
            targetClasses = classroomRepository.findByIsDeletedFalse();
        }

        BigDecimal totalRevenue = BigDecimal.ZERO;
        List<PaymentResponse> paidRecords = new ArrayList<>();
        List<TuitionStatsResponse.PendingTuition> pendingRecords = new ArrayList<>();

        for (Classroom cls : targetClasses) {
            Course course = courseRepository.findById(cls.getCourseId()).orElse(null);
            BigDecimal coursePrice = course != null ? course.getPrice() : BigDecimal.ZERO;
            BigDecimal fee = cls.getTuitionFee() != null && cls.getTuitionFee().compareTo(BigDecimal.ZERO) > 0
                    ? cls.getTuitionFee()
                    : coursePrice;

            List<ClassEnrollment> enrollments = classEnrollmentRepository.findByClassId(cls.getId());
            for (ClassEnrollment enr : enrollments) {
                User student = userRepository.findById(enr.getStudentId()).orElse(null);
                String studentName = student != null ? student.getFullName() : "N/A";
                String studentEmail = student != null ? student.getEmail() : "N/A";

                Optional<Payment> payOpt = paymentRepository.findByEnrollmentId(enr.getId());

                if (payOpt.isPresent() && "PAID".equals(payOpt.get().getStatus())) {
                    Payment p = payOpt.get();
                    totalRevenue = totalRevenue.add(p.getAmount());
                    paidRecords.add(toResponse(p));
                } else {
                    TuitionStatsResponse.PendingTuition pend = new TuitionStatsResponse.PendingTuition();
                    pend.setEnrollmentId(enr.getId());
                    pend.setStudentId(enr.getStudentId());
                    pend.setStudentName(studentName);
                    pend.setStudentEmail(studentEmail);
                    pend.setClassName(cls.getClassName());
                    pend.setCourseTitle(course != null ? course.getTitle() : "N/A");
                    pend.setTuitionFee(fee);
                    String syntax = "EDU " + enr.getStudentId() + " " + cls.getId();
                    PaymentConfig config = paymentConfigRepository.findByGatewayKey("BANK_TRANSFER").orElse(null);
                    if (config != null) {
                        syntax = config.getSyntaxTemplate()
                                .replace("{studentId}", String.valueOf(enr.getStudentId()))
                                .replace("{classId}", String.valueOf(cls.getId()));
                    }
                    pend.setTransferSyntax(syntax);
                    
                    if (payOpt.isPresent()) {
                        Payment p = payOpt.get();
                        pend.setPaymentStatus(p.getStatus());
                        pend.setPaymentMethod(p.getMethod());
                        pend.setPaymentId(p.getId());
                        pend.setProofUrl(p.getProofUrl());
                    }
                    
                    pendingRecords.add(pend);
                }
            }
        }

        TuitionStatsResponse stats = new TuitionStatsResponse();
        stats.setTotalRevenue(totalRevenue);
        stats.setTotalPaidCount(paidRecords.size());
        stats.setTotalPendingCount(pendingRecords.size());
        stats.setPaidRecords(paidRecords);
        stats.setPendingRecords(pendingRecords);

        return stats;
    }

    @Override
    public PaymentResponse submitPaymentForApproval(String orderId, String proofUrl) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy giao dịch: " + orderId
                ));
        if ("PENDING".equals(payment.getStatus())) {
            payment.setStatus("PENDING_APPROVAL");
            if (proofUrl != null && !proofUrl.trim().isEmpty()) {
                payment.setProofUrl(proofUrl);
            }
            payment = paymentRepository.save(payment);
        }
        return toResponse(payment);
    }

    // ════════════════════════════════════════════════
    // CONVERT TO DTO RESPONSE
    // ════════════════════════════════════════════════
    private PaymentResponse toResponse(Payment payment) {
        PaymentResponse res = new PaymentResponse();
        res.setId(payment.getId());
        res.setEnrollmentId(payment.getEnrollmentId());
        res.setAmount(payment.getAmount());
        res.setMethod(payment.getMethod());
        res.setStatus(payment.getStatus());
        res.setOrderId(payment.getOrderId());
        res.setNote(payment.getNote());
        res.setPaymentDate(payment.getPaymentDate());
        res.setCreatedAt(payment.getCreatedAt());
        res.setProofUrl(payment.getProofUrl());

        // Lấy các trường thông tin bổ sung từ CSDL
        ClassEnrollment enrollment = classEnrollmentRepository.findById(payment.getEnrollmentId()).orElse(null);
        if (enrollment != null) {
            res.setStudentId(enrollment.getStudentId());
            User student = userRepository.findById(enrollment.getStudentId()).orElse(null);
            if (student != null) {
                res.setStudentName(student.getFullName());
                res.setStudentEmail(student.getEmail());
            }

            Classroom classroom = classroomRepository.findById(enrollment.getClassId()).orElse(null);
            if (classroom != null) {
                res.setClassName(classroom.getClassName());
                Course course = courseRepository.findById(classroom.getCourseId()).orElse(null);
                if (course != null) {
                    res.setCourseTitle(course.getTitle());
                }

                // Thiết lập cú pháp chuyển khoản từ cấu hình cổng tương ứng
                String syntax = "EDU " + enrollment.getStudentId() + " " + classroom.getId();
                PaymentConfig config = paymentConfigRepository.findByGatewayKey(payment.getMethod()).orElse(null);
                if (config != null) {
                    syntax = config.getSyntaxTemplate()
                            .replace("{studentId}", String.valueOf(enrollment.getStudentId()))
                            .replace("{classId}", String.valueOf(classroom.getId()));
                }
                res.setTransferSyntax(syntax);
            }
        }

        // Tạo liên kết xem hóa đơn tĩnh
        if ("PAID".equals(payment.getStatus())) {
            res.setInvoiceUrl("/uploads/invoices/invoice_" + payment.getId() + ".html");
        } else {
            res.setInvoiceUrl(null);
        }

        // Tạo liên kết giả lập thanh toán
        if ("PENDING".equals(payment.getStatus()) && 
            ("VNPAY".equals(payment.getMethod()) || "MOMO".equals(payment.getMethod()) || "ZALOPAY".equals(payment.getMethod()) || "BANK_TRANSFER".equals(payment.getMethod()))) {
            res.setPaymentUrl("http://localhost:5173/tuition-payment-checkout?orderId=" + payment.getOrderId() + "&method=" + payment.getMethod());
        } else {
            res.setPaymentUrl(null);
        }

        return res;
    }
}
