package com.examshield.service;

import com.examshield.entity.SecurityAlert;
import com.examshield.repository.SecurityAlertRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SecurityAlertService {

    private final SecurityAlertRepository alertRepository;

    public SecurityAlertService(SecurityAlertRepository alertRepository) {
        this.alertRepository = alertRepository;
    }

    @Transactional
    public SecurityAlert createAlert(String alertType, String severity, String description) {
        SecurityAlert alert = new SecurityAlert(alertType, severity, description);
        return alertRepository.save(alert);
    }

    @Transactional(readOnly = true)
    public List<SecurityAlert> getAllAlerts() {
        return alertRepository.findAllByOrderByTimestampDesc();
    }

    @Transactional(readOnly = true)
    public List<SecurityAlert> getActiveAlerts() {
        return alertRepository.findByResolvedFalseOrderByTimestampDesc();
    }

    @Transactional
    public SecurityAlert resolveAlert(Long id) {
        SecurityAlert alert = alertRepository.findById(id).orElse(null);
        if (alert != null) {
            alert.setResolved(true);
            return alertRepository.save(alert);
        }
        return null;
    }
}
