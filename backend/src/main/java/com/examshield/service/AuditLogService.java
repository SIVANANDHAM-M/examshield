package com.examshield.service;

import com.examshield.entity.AuditLog;
import com.examshield.repository.AuditLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public AuditLog log(String username, String role, String action, Long paperId, Long examId, String ipAddress, String status, String details) {
        AuditLog log = new AuditLog(username, role, action, paperId, examId, ipAddress, status, details);
        return auditLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public List<AuditLog> getAllLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc();
    }

    @Transactional(readOnly = true)
    public List<AuditLog> searchLogs(String username, String action, Long paperId, String status) {
        List<AuditLog> all = auditLogRepository.findAllByOrderByTimestampDesc();
        return all.stream()
                .filter(l -> (username == null || username.isBlank() || l.getUsername().toLowerCase().contains(username.toLowerCase())))
                .filter(l -> (action == null || action.isBlank() || l.getAction().equalsIgnoreCase(action)))
                .filter(l -> (paperId == null || (l.getPaperId() != null && l.getPaperId().equals(paperId))))
                .filter(l -> (status == null || status.isBlank() || l.getStatus().equalsIgnoreCase(status)))
                .collect(Collectors.toList());
    }
}
