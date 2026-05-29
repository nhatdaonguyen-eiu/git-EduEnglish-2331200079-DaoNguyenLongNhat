package com.englishcenter.backend.repository;

import com.englishcenter.backend.entity.ActivityQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ActivityQuestionRepository extends JpaRepository<ActivityQuestion, Integer> {
    List<ActivityQuestion> findByActivityIdOrderByQuestionNumberAsc(Integer activityId);
}
