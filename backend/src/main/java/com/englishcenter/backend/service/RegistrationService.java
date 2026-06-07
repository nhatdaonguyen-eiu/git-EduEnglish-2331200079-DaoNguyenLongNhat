package com.englishcenter.backend.service;

import com.englishcenter.backend.dto.RegistrationDTO;
import com.englishcenter.backend.dto.RegistrationRequest;

import java.util.List;

/**
 * ================================================================
 * SERVICE INTERFACE: RegistrationService
 * Hợp đồng nghiệp vụ quản lý việc đăng ký tư vấn/học thử.
 * ================================================================
 */
public interface RegistrationService {

    // Học viên tạo mới đăng ký tư vấn học thử
    RegistrationDTO createRegistration(RegistrationRequest request);

    // Admin lấy toàn bộ danh sách đăng ký chưa bị xóa mềm
    List<RegistrationDTO> getAllRegistrations();

    // Admin cập nhật trạng thái chăm sóc (PENDING, CONTACTED, etc.)
    RegistrationDTO updateRegistrationStatus(Integer id, String status);

    // Admin cập nhật ghi chú cuộc gọi tư vấn
    RegistrationDTO updateRegistrationNotes(Integer id, String notes);

    // Admin xóa mềm một bản ghi đăng ký học
    void deleteRegistration(Integer id);
}
