package com.examshield.repository;

import com.examshield.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByExaminationIdOrderByQuestionNumberAsc(Long examId);
    void deleteByExaminationId(Long examId);
}
