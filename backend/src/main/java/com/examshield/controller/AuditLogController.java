package com.examshield.controller;

import com.examshield.entity.AuditLog;
import com.examshield.service.AuditLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
public class AuditLogController {

    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('AUDITOR', 'EXAM_CONTROLLER', 'ADMIN')")
    public ResponseEntity<List<AuditLog>> getLogs(
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) Long paperId,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(auditLogService.searchLogs(username, action, paperId, status));
    }
}
