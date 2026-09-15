package com.examshield.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "security_alerts")
public class SecurityAlert {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String alertType;

    @Column(nullable = false, length = 30)
    private String severity; // "LOW", "MEDIUM", "HIGH", "CRITICAL"

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now();

    @Column(nullable = false)
    private boolean resolved = false;

    public SecurityAlert() {}

    public SecurityAlert(String alertType, String severity, String description) {
        this.alertType = alertType;
        this.severity = severity;
        this.description = description;
        this.timestamp = LocalDateTime.now();
        this.resolved = false;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getAlertType() { return alertType; }
    public void setAlertType(String alertType) { this.alertType = alertType; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public boolean isResolved() { return resolved; }
    public void setResolved(boolean resolved) { this.resolved = resolved; }
}
