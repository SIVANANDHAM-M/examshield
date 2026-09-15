package com.examshield.repository;

import com.examshield.entity.SecurityAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SecurityAlertRepository extends JpaRepository<SecurityAlert, Long> {
    List<SecurityAlert> findAllByOrderByTimestampDesc();
    List<SecurityAlert> findByResolvedFalseOrderByTimestampDesc();
}
