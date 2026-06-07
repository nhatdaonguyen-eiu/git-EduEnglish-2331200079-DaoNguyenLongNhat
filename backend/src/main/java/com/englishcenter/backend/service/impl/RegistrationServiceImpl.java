package com.englishcenter.backend.service.impl;

import com.englishcenter.backend.dto.RegistrationDTO;
import com.englishcenter.backend.dto.RegistrationRequest;
import com.englishcenter.backend.entity.Registration;
import com.englishcenter.backend.repository.CourseRepository;
import com.englishcenter.backend.repository.RegistrationRepository;
import com.englishcenter.backend.service.RegistrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

/**
 * ================================================================
 * SERVICE IMPL: RegistrationServiceImpl
 * Triển khai các logic nghiệp vụ cho phân hệ quản lý đăng ký tư vấn.
 * ================================================================
 */
@Service
public class RegistrationServiceImpl implements RegistrationService {

    @Autowired
    private RegistrationRepository registrationRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Override
    public RegistrationDTO createRegistration(RegistrationRequest request) {
        // 1. Chuyển đổi DTO → Entity
        Registration registration = new Registration();
        registration.setFullName(request.getFullName());
        registration.setPhoneNumber(request.getPhoneNumber());
        registration.setEmail(request.getEmail());
        
        // Kiểm tra xem khóa học có tồn tại không (nếu có truyền courseId)
        if (request.getCourseId() != null) {
            boolean courseExists = courseRepository.existsById(request.getCourseId());
            if (!courseExists) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Khóa học đăng ký với ID " + request.getCourseId() + " không tồn tại"
                );
            }
            registration.setCourseId(request.getCourseId());
        }
        
        registration.setNotes(request.getNotes());
        registration.setStatus("PENDING"); // Mặc định: Chờ liên hệ
        registration.setIsDeleted(false);
        if (request.getSource() != null) {
            registration.setSource(request.getSource());
        } else {
            registration.setSource("Website");
        }

        // 2. Lưu vào DB
        Registration saved = registrationRepository.save(registration);

        // 3. Chuyển đổi Entity → DTO trả ra ngoài
        return toDTO(saved);
    }

    @Override
    public List<RegistrationDTO> getAllRegistrations() {
        return registrationRepository.findByIsDeletedFalseOrderByCreatedAtDesc()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public RegistrationDTO updateRegistrationStatus(Integer id, String status) {
        // 1. Tìm bản ghi đăng ký hiện có
        Registration registration = registrationRepository.findById(id)
                .filter(r -> !r.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy thông tin đăng ký với ID: " + id
                ));

        // 2. Kiểm tra tính hợp lệ của trạng thái mới
        String upperStatus = status.toUpperCase();
        if (!upperStatus.equals("PENDING") && !upperStatus.equals("CONTACTED") 
                && !upperStatus.equals("ENROLLED") && !upperStatus.equals("CANCELLED")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Trạng thái chăm sóc không hợp lệ: " + status
            );
        }

        // 3. Cập nhật trạng thái và lưu lại
        registration.setStatus(upperStatus);
        Registration updated = registrationRepository.save(registration);

        return toDTO(updated);
    }

    @Override
    public RegistrationDTO updateRegistrationNotes(Integer id, String notes) {
        // 1. Tìm bản ghi đăng ký hiện có
        Registration registration = registrationRepository.findById(id)
                .filter(r -> !r.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy thông tin đăng ký với ID: " + id
                ));

        // 2. Cập nhật ghi chú và lưu lại
        registration.setNotes(notes);
        Registration updated = registrationRepository.save(registration);
        return toDTO(updated);
    }

    @Override
    public void deleteRegistration(Integer id) {
        // 1. Tìm bản ghi cần xóa
        Registration registration = registrationRepository.findById(id)
                .filter(r -> !r.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy thông tin đăng ký với ID: " + id
                ));

        // 2. Thực hiện xóa mềm
        registration.setIsDeleted(true);
        registrationRepository.save(registration);
    }

    /**
     * Hàm nội bộ ánh xạ Entity → DTO và tự động điền tên khóa học
     */
    private RegistrationDTO toDTO(Registration registration) {
        RegistrationDTO dto = new RegistrationDTO();
        dto.setId(registration.getId());
        dto.setFullName(registration.getFullName());
        dto.setPhoneNumber(registration.getPhoneNumber());
        dto.setEmail(registration.getEmail());
        dto.setCourseId(registration.getCourseId());
        dto.setNotes(registration.getNotes());
        dto.setStatus(registration.getStatus());
        dto.setSource(registration.getSource());
        dto.setCreatedAt(registration.getCreatedAt());

        // Ánh xạ tên khóa học từ Course CSDL nếu có courseId
        if (registration.getCourseId() != null) {
            courseRepository.findById(registration.getCourseId())
                    .ifPresent(course -> dto.setCourseTitle(course.getTitle()));
        } else {
            dto.setCourseTitle("Tư vấn chung (Chưa chọn khóa học)");
        }

        return dto;
    }
}
