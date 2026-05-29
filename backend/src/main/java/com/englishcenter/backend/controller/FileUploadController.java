package com.englishcenter.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * ================================================================
 *  CONTROLLER: FileUploadController
 * ================================================================
 *  API xử lý tải hình ảnh lên hệ thống từ Client.
 *  - Endpoint: POST /api/upload
 *  - Định dạng nhận: multipart/form-data
 *  - Định dạng trả về: JSON { "url": "http://localhost:8080/uploads/xxx.png" }
 * ================================================================
 */
@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = "http://localhost:5173")
public class FileUploadController {

    private static final String UPLOAD_DIR = "uploads";
    // Giới hạn các định dạng được phép upload (ảnh, tài liệu, âm thanh)
    private static final String[] ALLOWED_EXTENSIONS = {
        ".jpg", ".jpeg", ".png", ".gif", ".webp", 
        ".pdf", ".doc", ".docx", 
        ".mp3", ".wav", ".m4a"
    };

    @PostMapping
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        // 1. Kiểm tra file rỗng
        if (file.isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Vui lòng chọn một tệp để tải lên");
            return ResponseEntity.badRequest().body(error);
        }

        // 2. Kiểm tra định dạng tệp (đuôi mở rộng)
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Tên tệp không hợp lệ");
            return ResponseEntity.badRequest().body(error);
        }

        String extension = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
        boolean isAllowed = false;
        for (String ext : ALLOWED_EXTENSIONS) {
            if (ext.equals(extension)) {
                isAllowed = true;
                break;
            }
        }

        if (!isAllowed) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Định dạng tệp không hỗ trợ. Chỉ hỗ trợ tệp Ảnh (.jpg, .png...), Tài liệu (.pdf, .doc, .docx) và Âm thanh (.mp3, .wav, .m4a)");
            return ResponseEntity.badRequest().body(error);
        }

        try {
            // 3. Đảm bảo thư mục uploads tồn tại
            Path uploadPath = Paths.get(UPLOAD_DIR).toAbsolutePath().normalize();
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // 4. Tạo tên file độc nhất để tránh bị đè (UUID)
            String newFilename = UUID.randomUUID().toString() + extension;
            Path targetLocation = uploadPath.resolve(newFilename);

            // 5. Sao chép và lưu trữ tệp tin
            Files.copy(file.getInputStream(), targetLocation);

            // 6. Tạo đường dẫn URL tĩnh để trả về cho Frontend
            // Ở local chúng ta dùng http://localhost:8080/uploads/tên_file
            String fileUrl = "http://localhost:8080/uploads/" + newFilename;

            Map<String, String> response = new HashMap<>();
            response.put("url", fileUrl);
            return ResponseEntity.ok(response);

        } catch (IOException ex) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Không thể lưu tệp: " + ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
