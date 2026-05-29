package com.englishcenter.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

/**
 * ================================================================
 *  CONFIG: WebConfig
 * ================================================================
 *  Ánh xạ đường dẫn tĩnh để phục vụ hình ảnh đã tải lên từ Client.
 *  Đường dẫn '/uploads/**' sẽ ánh xạ trực tiếp đến thư mục './uploads/'
 *  nằm ở thư mục gốc của dự án.
 * ================================================================
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Tạo hoặc lấy đường dẫn tuyệt đối của thư mục uploads trong thư mục gốc
        String uploadPath = new File("uploads").getAbsolutePath();
        
        // Tạo thư mục nếu chưa tồn tại
        File uploadDir = new File(uploadPath);
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }

        // Ánh xạ /uploads/** trỏ vào file:uploads/
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadPath + "/");
    }
}
