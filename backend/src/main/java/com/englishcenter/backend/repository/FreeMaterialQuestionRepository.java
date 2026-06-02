package com.englishcenter.backend.repository;

import com.englishcenter.backend.entity.FreeMaterialQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * ================================================================
 * REPOSITORY: FreeMaterialQuestionRepository
 * ================================================================
 */
@Repository
public interface FreeMaterialQuestionRepository extends JpaRepository<FreeMaterialQuestion, Integer> {
    List<FreeMaterialQuestion> findByMaterialIdOrderByQuestionNumberAsc(Integer materialId);

    @Transactional
    void deleteByMaterialId(Integer materialId);
}
