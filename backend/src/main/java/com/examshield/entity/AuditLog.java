package com.examshield.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String username;

    @Column(length = 100)
    private String userRole;

    @Column(nullable = false, length = 100)
    private String action;

    private Long paperId;

    private Long examId;

    @Column(nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now();

    @Column(length = 45)
    private String ipAddress;

    @Column(nullable = false, length = 50)
    private String status; // "SUCCESS", "FAILED", "WARNING"

    @Column(columnDefinition = "TEXT")
    private String details;

    public AuditLog() {}

    public AuditLog(String username, String userRole, String action, Long paperId, Long examId, String ipAddress, String status, String details) {
        this.username = username;
        this.userRole = userRole;
        this.action = action;
        this.paperId = paperId;
        this.examId = examId;
        this.ipAddress = ipAddress;
        this.status = status;
        this.details = details;
        this.timestamp = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getUserRole() { return userRole; }
    public void setUserRole(String userRole) { this.userRole = userRole; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public Long getPaperId() { return paperId; }
    public void setPaperId(Long paperId) { this.paperId = paperId; }

    public Long getExamId() { return examId; }
    public void setExamId(Long examId) { this.examId = examId; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
}
