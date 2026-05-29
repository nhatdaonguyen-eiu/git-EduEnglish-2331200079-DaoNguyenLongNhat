package com.englishcenter.backend.repository;

import com.englishcenter.backend.entity.CourseMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CourseMaterialRepository extends JpaRepository<CourseMaterial, Integer> {
    List<CourseMaterial> findByCourseIdAndIsDeletedFalse(Integer courseId);
}
