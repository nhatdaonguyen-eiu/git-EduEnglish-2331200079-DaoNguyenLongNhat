package com.englishcenter.backend.controller;

import com.englishcenter.backend.dto.RegistrationDTO;
import com.englishcenter.backend.dto.RegistrationRequest;
import com.englishcenter.backend.service.RegistrationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * ================================================================
 * CONTROLLER: RegistrationController
 * Expose các REST API để tiếp nhận và quản lý đăng ký học.
 * ================================================================
 */
@RestController
@RequestMapping("/api/registrations")
@CrossOrigin(origins = "http://localhost:5173")
public class RegistrationController {

    @Autowired
    private RegistrationService registrationService;

    // ─────────────────────────────────────────────────────────────
    // POST /api/registrations
    // Public API: Học viên gửi đăng ký tư vấn học thử từ trang chủ
    // ─────────────────────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<RegistrationDTO> createRegistration(@Valid @RequestBody RegistrationRequest request) {
        RegistrationDTO created = registrationService.createRegistration(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created); // 201 Created
    }

    // ─────────────────────────────────────────────────────────────
    // GET /api/registrations
    // Admin API: Admin xem toàn bộ danh sách đăng ký tư vấn
    // ─────────────────────────────────────────────────────────────
    @GetMapping
    public ResponseEntity<List<RegistrationDTO>> getAllRegistrations() {
        List<RegistrationDTO> registrations = registrationService.getAllRegistrations();
        return ResponseEntity.ok(registrations); // 200 OK
    }

    // ─────────────────────────────────────────────────────────────
    // PUT /api/registrations/{id}/status
    // Admin API: Cập nhật trạng thái chăm sóc của học viên
    // Ví dụ: PUT /api/registrations/5/status?status=CONTACTED
    // ─────────────────────────────────────────────────────────────
    @PutMapping("/{id}/status")
    public ResponseEntity<RegistrationDTO> updateStatus(
            @PathVariable Integer id,
            @RequestParam String status) {
        RegistrationDTO updated = registrationService.updateRegistrationStatus(id, status);
        return ResponseEntity.ok(updated); // 200 OK
    }

    // ─────────────────────────────────────────────────────────────
    // PUT /api/registrations/{id}/notes
    // Admin API: Cập nhật ghi chú chăm sóc học viên
    // ─────────────────────────────────────────────────────────────
    @PutMapping("/{id}/notes")
    public ResponseEntity<RegistrationDTO> updateNotes(
            @PathVariable Integer id,
            @RequestParam String notes) {
        RegistrationDTO updated = registrationService.updateRegistrationNotes(id, notes);
        return ResponseEntity.ok(updated); // 200 OK
    }

    // ─────────────────────────────────────────────────────────────
    // DELETE /api/registrations/{id}
    // Admin API: Xóa mềm một bản ghi đăng ký khỏi danh sách hiển thị
    // ─────────────────────────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRegistration(@PathVariable Integer id) {
        registrationService.deleteRegistration(id);
        return ResponseEntity.noContent().build(); // 204 No Content
    }
}
