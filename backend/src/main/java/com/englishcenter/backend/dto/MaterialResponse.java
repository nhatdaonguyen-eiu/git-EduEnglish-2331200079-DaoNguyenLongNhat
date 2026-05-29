package com.englishcenter.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MaterialResponse {
    private Integer id;
    private Integer courseId;
    private String title;
    private String description;
    private String type;
    private String fileUrl;
    private LocalDateTime createdAt;
}
