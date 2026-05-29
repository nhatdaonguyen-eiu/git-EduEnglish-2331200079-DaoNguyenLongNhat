package com.englishcenter.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class MaterialRequest {
    @NotBlank(message = "Tiêu đề tài liệu không được để trống")
    private String title;

    private String description;

    // "FILE" or "LINK"
    @NotBlank(message = "Loại tài liệu không được để trống")
    private String type;

    @NotBlank(message = "Đường dẫn tài liệu không được để trống")
    private String fileUrl;
}
