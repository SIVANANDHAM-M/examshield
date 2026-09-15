package com.examshield.repository;

import com.examshield.entity.Examination;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ExaminationRepository extends JpaRepository<Examination, Long> {
    List<Examination> findByCreatedByIdOrderByCreatedAtDesc(Long createdById);
    List<Examination> findAllByOrderByCreatedAtDesc();
}
