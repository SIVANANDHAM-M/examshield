package com.examshield.repository;

import com.examshield.entity.PaperIntegrityRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PaperIntegrityRecordRepository extends JpaRepository<PaperIntegrityRecord, Long> {
    List<PaperIntegrityRecord> findByPaperIdOrderByVerifiedAtDesc(Long paperId);
    List<PaperIntegrityRecord> findAllByOrderByVerifiedAtDesc();
}
