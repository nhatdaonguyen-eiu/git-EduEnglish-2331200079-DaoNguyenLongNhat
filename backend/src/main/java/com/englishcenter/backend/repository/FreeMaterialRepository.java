package com.englishcenter.backend.repository;

import com.englishcenter.backend.entity.FreeMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * ================================================================
 * REPOSITORY: FreeMaterialRepository
 * ================================================================
 */
@Repository
public interface FreeMaterialRepository extends JpaRepository<FreeMaterial, Integer> {
    List<FreeMaterial> findByIsDeletedFalseOrderByCreatedAtDesc();
}
