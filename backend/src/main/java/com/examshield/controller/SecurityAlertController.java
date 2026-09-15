package com.examshield.controller;

import com.examshield.entity.SecurityAlert;
import com.examshield.service.SecurityAlertService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/alerts")
public class SecurityAlertController {

    private final SecurityAlertService alertService;

    public SecurityAlertController(SecurityAlertService alertService) {
        this.alertService = alertService;
    }

    @GetMapping
    public ResponseEntity<List<SecurityAlert>> getAllAlerts() {
        return ResponseEntity.ok(alertService.getAllAlerts());
    }

    @GetMapping("/active")
    public ResponseEntity<List<SecurityAlert>> getActiveAlerts() {
        return ResponseEntity.ok(alertService.getActiveAlerts());
    }

    @PostMapping("/{id}/resolve")
    @PreAuthorize("hasAnyRole('ADMIN', 'AUDITOR')")
    public ResponseEntity<?> resolveAlert(@PathVariable Long id) {
        SecurityAlert alert = alertService.resolveAlert(id);
        return ResponseEntity.ok(Map.of("message", "Alert marked as resolved", "alert", alert));
    }
}
