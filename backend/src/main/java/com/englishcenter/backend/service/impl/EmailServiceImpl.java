package com.englishcenter.backend.service.impl;

import com.englishcenter.backend.entity.*;
import com.englishcenter.backend.repository.*;
import com.englishcenter.backend.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStreamWriter;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;

/**
 * ================================================================
 * SERVICE IMPLEMENTATION: EmailServiceImpl
 * ================================================================
 */
@Service
public class EmailServiceImpl implements EmailService {

    @Autowired
    private ClassEnrollmentRepository classEnrollmentRepository;

    @Autowired
    private ClassroomRepository classroomRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public String generateInvoiceAndSimulateEmail(Payment payment) {
        // 1. Truy xuất thông tin bổ trợ để lập hóa đơn
        ClassEnrollment enrollment = classEnrollmentRepository.findById(payment.getEnrollmentId())
                .orElse(null);
        if (enrollment == null) return null;

        Classroom classroom = classroomRepository.findById(enrollment.getClassId())
                .orElse(null);
        if (classroom == null) return null;

        Course course = courseRepository.findById(classroom.getCourseId())
                .orElse(null);
        if (course == null) return null;

        User student = userRepository.findById(enrollment.getStudentId())
                .orElse(null);
        if (student == null) return null;

        // 2. Thiết lập cấu trúc thư mục chứa hóa đơn
        String uploadPath = new File("uploads" + File.separator + "invoices").getAbsolutePath();
        File dir = new File(uploadPath);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        String fileName = "invoice_" + payment.getId() + ".html";
        File invoiceFile = new File(dir, fileName);

        // Định dạng ngày giờ hiển thị
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
        String formattedDate = payment.getPaymentDate() != null 
                ? payment.getPaymentDate().format(formatter) 
                : java.time.LocalDateTime.now().format(formatter);

        // 3. Xây dựng mẫu HTML hóa đơn học phí cực kỳ sang trọng và chuyên nghiệp
        String htmlTemplate = "<!DOCTYPE html>\n" +
                "<html lang=\"vi\">\n" +
                "<head>\n" +
                "    <meta charset=\"UTF-8\">\n" +
                "    <title>Hóa Đơn Học Phí - EduEnglish</title>\n" +
                "    <style>\n" +
                "        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 40px; }\n" +
                "        .invoice-card { max-width: 650px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); overflow: hidden; }\n" +
                "        .header-banner { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: #ffffff; padding: 30px; display: flex; justify-content: space-between; align-items: center; }\n" +
                "        .logo-title { font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }\n" +
                "        .logo-orange { color: #f97316; }\n" +
                "        .invoice-label { font-size: 11px; text-transform: uppercase; font-weight: bold; background-color: rgba(249, 115, 22, 0.15); color: #f97316; padding: 4px 10px; border-radius: 8px; }\n" +
                "        .invoice-body { padding: 40px; }\n" +
                "        .title-row { display: flex; justify-content: space-between; border-b: 1px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 25px; }\n" +
                "        .title-row h1 { font-size: 24px; font-weight: 900; margin: 0; color: #0f172a; }\n" +
                "        .meta-info { text-align: right; font-size: 12px; color: #64748b; line-height: 1.6; }\n" +
                "        .section-title { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #f97316; margin-bottom: 10px; letter-spacing: 0.5px; }\n" +
                "        .grid-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }\n" +
                "        .info-block { background-color: #f8fafc; border: 1px solid #f1f5f9; padding: 15px; border-radius: 16px; font-size: 12px; line-height: 1.6; }\n" +
                "        .info-block strong { color: #0f172a; }\n" +
                "        .table-bill { width: 100%; border-collapse: collapse; margin-bottom: 30px; }\n" +
                "        .table-bill th { background-color: #f1f5f9; text-align: left; padding: 12px 16px; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #475569; }\n" +
                "        .table-bill td { padding: 16px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }\n" +
                "        .table-bill .fee-cell { text-align: right; font-weight: bold; color: #0f172a; }\n" +
                "        .summary-block { display: flex; justify-content: flex-end; align-items: center; gap: 15px; padding-top: 10px; }\n" +
                "        .summary-title { font-size: 13px; font-weight: bold; color: #475569; }\n" +
                "        .summary-value { font-size: 20px; font-weight: 900; color: #f97316; }\n" +
                "        .paid-stamp { display: inline-block; border: 3px double #10b981; color: #10b981; font-weight: 900; font-size: 14px; text-transform: uppercase; padding: 5px 15px; border-radius: 8px; transform: rotate(-8deg); opacity: 0.85; margin-left: 20px; }\n" +
                "        .footer { background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px; text-align: center; font-size: 11px; color: #64748b; line-height: 1.5; }\n" +
                "    </style>\n" +
                "</head>\n" +
                "<body>\n" +
                "    <div class=\"invoice-card\">\n" +
                "        <div class=\"header-banner\">\n" +
                "            <div class=\"logo-title\">Edu<span class=\"logo-orange\">English</span></div>\n" +
                "            <div class=\"invoice-label\">Hóa đơn đóng học phí</div>\n" +
                "        </div>\n" +
                "        \n" +
                "        <div class=\"invoice-body\">\n" +
                "            <div class=\"title-row\">\n" +
                "                <h1>HÓA ĐƠN ĐIỆN TỬ</h1>\n" +
                "                <div class=\"meta-info\">\n" +
                "                    Mã hóa đơn: <b>#INV-PAY" + payment.getId() + "</b><br/>\n" +
                "                    Ngày lập: " + formattedDate + "\n" +
                "                </div>\n" +
                "            </div>\n" +
                "            \n" +
                "            <div class=\"grid-info\">\n" +
                "                <div>\n" +
                "                    <div class=\"section-title\">Học viên thanh toán</div>\n" +
                "                    <div class=\"info-block\">\n" +
                "                        Họ tên: <b>" + student.getFullName() + "</b><br/>\n" +
                "                        Email: " + student.getEmail() + "<br/>\n" +
                "                        Số điện thoại: " + (student.getPhone() != null ? student.getPhone() : "N/A") + "\n" +
                "                    </div>\n" +
                "                </div>\n" +
                "                <div>\n" +
                "                    <div class=\"section-title\">Phương thức thanh toán</div>\n" +
                "                    <div class=\"info-block\">\n" +
                "                        Hình thức: <b>" + payment.getMethod() + "</b><br/>\n" +
                "                        Mã đơn hàng: " + (payment.getOrderId() != null ? payment.getOrderId() : "N/A") + "<br/>\n" +
                "                        Trạng thái: <span style=\"color:#10b981;font-weight:bold;\">ĐÃ THANH TOÁN (PAID)</span>\n" +
                "                    </div>\n" +
                "                </div>\n" +
                "            </div>\n" +
                "            \n" +
                "            <div class=\"section-title\">Chi tiết học phí khóa học</div>\n" +
                "            <table class=\"table-bill\">\n" +
                "                <thead>\n" +
                "                    <tr>\n" +
                "                        <th>Lớp học & Khóa học</th>\n" +
                "                        <th>Học kỳ</th>\n" +
                "                        <th style=\"text-align: right;\">Học phí</th>\n" +
                "                    </tr>\n" +
                "                </thead>\n" +
                "                <tbody>\n" +
                "                    <tr>\n" +
                "                        <td>\n" +
                "                            <b>Lớp: " + classroom.getClassName() + "</b><br/>\n" +
                "                            <span style=\"color: #64748b; font-size:11px;\">Khóa học: " + course.getTitle() + "</span>\n" +
                "                        </td>\n" +
                "                        <td>" + (classroom.getSemester() != null ? classroom.getSemester() : "N/A") + "</td>\n" +
                "                        <td class=\"fee-cell\">" + String.format("%,.0f VNĐ", payment.getAmount()) + "</td>\n" +
                "                    </tr>\n" +
                "                </tbody>\n" +
                "            </table>\n" +
                "            \n" +
                "            <div class=\"summary-block\">\n" +
                "                <div class=\"summary-title\">Tổng cộng tiền học phí:</div>\n" +
                "                <div class=\"summary-value\">" + String.format("%,.0f VNĐ", payment.getAmount()) + "</div>\n" +
                "                <div class=\"paid-stamp\">ĐÃ THANH TOÁN</div>\n" +
                "            </div>\n" +
                "        </div>\n" +
                "        \n" +
                "        <div class=\"footer\">\n" +
                "            Cảm ơn bạn đã lựa chọn tin tưởng trung tâm Anh ngữ <b>EduEnglish</b>!<br/>\n" +
                "            <i>Hóa đơn điện tử này được tạo tự động và có giá trị pháp lý tương đương biên lai giấy.</i>\n" +
                "        </div>\n" +
                "    </div>\n" +
                "</body>\n" +
                "</html>";

        // 4. Lưu mẫu hóa đơn HTML trên Server
        try (OutputStreamWriter writer = new OutputStreamWriter(new FileOutputStream(invoiceFile), StandardCharsets.UTF_8)) {
            writer.write(htmlTemplate);
        } catch (IOException e) {
            System.err.println("❌ Lỗi ghi file hóa đơn HTML: " + e.getMessage());
            return null;
        }

        // 5. Mô phỏng in Log gửi email ra Console (Theo phương án B của khách hàng)
        System.out.println("==========================================================================");
        System.out.println("📧 SIMULATED MAIL SERVICE - ĐÃ GỬI EMAIL HÓA ĐƠN TỰ ĐỘNG THÀNH CÔNG");
        System.out.println("--------------------------------------------------------------------------");
        System.out.println("Từ: invoice@eduenglish.edu.vn (EduEnglish Tuition System)");
        System.out.println("Đến học viên: " + student.getFullName() + " (" + student.getEmail() + ")");
        System.out.println("Tiêu đề: [EduEnglish] Biên Lai Đóng Học Phí Thành Công - Hóa đơn #" + payment.getId());
        System.out.println("Nội dung gửi thư: Chào " + student.getFullName() + ", Học phí lớp " + classroom.getClassName() + " đã được thanh toán thành công qua " + payment.getMethod() + ".");
        System.out.println("Số tiền đã đóng: " + String.format("%,.0f VNĐ", payment.getAmount()));
        System.out.println("Liên kết hóa đơn điện tử: http://localhost:8080/uploads/invoices/" + fileName);
        System.out.println("==========================================================================");

        return "/uploads/invoices/" + fileName;
    }
}
