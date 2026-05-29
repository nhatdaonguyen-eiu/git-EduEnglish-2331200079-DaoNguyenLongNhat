package com.englishcenter.backend.repository;

import com.englishcenter.backend.entity.StudentSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudentSubmissionRepository extends JpaRepository<StudentSubmission, Integer> {
    Optional<StudentSubmission> findByActivityIdAndStudentId(Integer activityId, Integer studentId);
    List<StudentSubmission> findByStudentId(Integer studentId);
    List<StudentSubmission> findByActivityId(Integer activityId);
}
