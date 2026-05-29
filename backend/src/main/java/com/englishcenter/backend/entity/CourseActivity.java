package com.englishcenter.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "course_activities")
@Data
public class CourseActivity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "course_id", nullable = false)
    private Integer courseId;

    @Column(nullable = false)
    private String title;

    // "ASSIGNMENT" or "TEST"
    @Column(nullable = false)
    private String type;

    // "LISTENING", "SPEAKING", "READING", "WRITING"
    @Column(nullable = false)
    private String skill;

    @Column(columnDefinition = "TEXT")
    private String instruction;

    @Column(name = "audio_url")
    private String audioUrl;

    @Column(name = "is_results_released", nullable = false)
    private Boolean isResultsReleased = false;

    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
