package com.englishcenter.backend.repository;

import com.englishcenter.backend.entity.CourseActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CourseActivityRepository extends JpaRepository<CourseActivity, Integer> {
    List<CourseActivity> findByCourseIdAndIsDeletedFalse(Integer courseId);
}
