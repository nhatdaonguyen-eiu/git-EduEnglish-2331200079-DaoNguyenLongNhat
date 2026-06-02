package com.englishcenter.backend.controller;

import com.englishcenter.backend.entity.PaymentConfig;
import com.englishcenter.backend.repository.PaymentConfigRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/**
 * ================================================================
 * CONTROLLER: PaymentConfigController
 * Quản lý thiết lập các cổng thanh toán trực tuyến của trung tâm.
 * ================================================================
 */
@RestController
@RequestMapping("/api/payment-configs")
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentConfigController {

    @Autowired
    private PaymentConfigRepository paymentConfigRepository;

    /**
     * Tự động khởi tạo cấu hình các cổng thanh toán mặc định nếu chưa tồn tại.
     */
    @PostConstruct
    public void seedDefaultConfigs() {
        if (paymentConfigRepository.count() == 0) {
            // 1. Cấu hình VNPay
            PaymentConfig vnpay = new PaymentConfig();
            vnpay.setGatewayKey("VNPAY");
            vnpay.setGatewayName("VNPay (Mô phỏng)");
            vnpay.setAccountNumber("VNP123456");
            vnpay.setAccountName("EduEnglish Hub VNPay");
            vnpay.setSyntaxTemplate("EDU {studentId} {classId}");
            vnpay.setIsActive(true);
            paymentConfigRepository.save(vnpay);

            // 2. Cấu hình Ví MoMo
            PaymentConfig momo = new PaymentConfig();
            momo.setGatewayKey("MOMO");
            momo.setGatewayName("Ví Điện Tử MoMo");
            momo.setAccountNumber("0901234567");
            momo.setAccountName("EduEnglish Center");
            momo.setSyntaxTemplate("EDU {studentId} {classId}");
            momo.setIsActive(true);
            paymentConfigRepository.save(momo);

            // 3. Cấu hình Ví ZaloPay
            PaymentConfig zalopay = new PaymentConfig();
            zalopay.setGatewayKey("ZALOPAY");
            zalopay.setGatewayName("Ví ZaloPay");
            zalopay.setAccountNumber("0901234567");
            zalopay.setAccountName("EduEnglish Center");
            zalopay.setSyntaxTemplate("EDU {studentId} {classId}");
            zalopay.setIsActive(true);
            paymentConfigRepository.save(zalopay);

            // 4. Cấu hình Chuyển khoản trực tiếp qua Ngân hàng
            PaymentConfig bank = new PaymentConfig();
            bank.setGatewayKey("BANK_TRANSFER");
            bank.setGatewayName("Techcombank");
            bank.setAccountNumber("1903456789012");
            bank.setAccountName("EduEnglish Center");
            bank.setSyntaxTemplate("EDU {studentId} {classId}");
            bank.setIsActive(true);
            paymentConfigRepository.save(bank);
        }
    }

    /**
     * Lấy toàn bộ danh sách cổng thanh toán (Học viên & Admin dùng)
     */
    @GetMapping
    public ResponseEntity<List<PaymentConfig>> getAllConfigs() {
        return ResponseEntity.ok(paymentConfigRepository.findAll());
    }

    /**
     * Cập nhật cổng thanh toán (Admin/Manager dùng)
     */
    @PutMapping("/{id}")
    public ResponseEntity<PaymentConfig> updateConfig(@PathVariable Integer id, @RequestBody PaymentConfig request) {
        PaymentConfig config = paymentConfigRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy cấu hình cổng với ID: " + id
                ));

        config.setGatewayName(request.getGatewayName());
        config.setAccountNumber(request.getAccountNumber());
        config.setAccountName(request.getAccountName());
        config.setSyntaxTemplate(request.getSyntaxTemplate());
        config.setIsActive(request.getIsActive());
        
        // Cập nhật URL QR tĩnh (nếu có, hoặc set rỗng để dùng QR động)
        config.setQrUrl(request.getQrUrl());

        PaymentConfig saved = paymentConfigRepository.save(config);
        return ResponseEntity.ok(saved);
    }
}
