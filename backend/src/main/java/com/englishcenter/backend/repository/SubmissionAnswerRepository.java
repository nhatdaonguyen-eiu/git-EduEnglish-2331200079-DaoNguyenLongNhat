package com.englishcenter.backend.repository;

import com.englishcenter.backend.entity.SubmissionAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SubmissionAnswerRepository extends JpaRepository<SubmissionAnswer, Integer> {
    List<SubmissionAnswer> findBySubmissionId(Integer submissionId);
}
