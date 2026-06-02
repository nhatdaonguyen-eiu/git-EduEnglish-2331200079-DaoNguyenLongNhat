package com.englishcenter.backend.repository;

import com.englishcenter.backend.entity.StudentBadge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * ================================================================
 * REPOSITORY: StudentBadgeRepository
 * ================================================================
 */
@Repository
public interface StudentBadgeRepository extends JpaRepository<StudentBadge, Integer> {
    List<StudentBadge> findByStudentId(Integer studentId);
    boolean existsByStudentIdAndBadgeKey(Integer studentId, String badgeKey);
}
