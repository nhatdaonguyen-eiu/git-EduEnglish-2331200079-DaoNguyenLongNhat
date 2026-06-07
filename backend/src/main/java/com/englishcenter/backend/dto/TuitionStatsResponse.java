package com.englishcenter.backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

/**
 * ================================================================
 * DTO: TuitionStatsResponse
 * Cung cấp dữ liệu thống kê doanh số thu học phí theo lớp/học kỳ.
 * ================================================================
 */
@Data
public class TuitionStatsResponse {
    private BigDecimal totalRevenue;
    private int totalPaidCount;
    private int totalPendingCount;

    // Danh sách học viên đã đóng tiền hoàn tất
    private List<PaymentResponse> paidRecords;

    // Danh sách học viên chưa đóng tiền (Đang nợ phí)
    private List<PendingTuition> pendingRecords;

    @Data
    public static class PendingTuition {
        private Integer enrollmentId;
        private Integer studentId;
        private String studentName;
        private String studentEmail;
        private String className;
        private String courseTitle;
        private BigDecimal tuitionFee;
        private String transferSyntax;
        private String paymentStatus;
        private String paymentMethod;
        private Integer paymentId;
        private String proofUrl;
    }
}
