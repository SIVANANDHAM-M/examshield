package com.examshield.repository;

import com.examshield.entity.PaperStatus;
import com.examshield.entity.QuestionPaper;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface QuestionPaperRepository extends JpaRepository<QuestionPaper, Long> {
    Optional<QuestionPaper> findByExaminationId(Long examId);
    List<QuestionPaper> findByStatus(PaperStatus status);
    List<QuestionPaper> findBySubmittedById(Long userId);
    List<QuestionPaper> findAllByOrderBySubmittedAtDesc();
}
