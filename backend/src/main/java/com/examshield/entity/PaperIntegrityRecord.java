package com.examshield.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "paper_integrity_records")
public class PaperIntegrityRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "paper_id", nullable = false)
    private QuestionPaper paper;

    @Column(nullable = false, length = 64)
    private String recordedHash;

    @Column(nullable = false, length = 64)
    private String verifiedHash;

    @Column(nullable = false, length = 50)
    private String status; // "MATCH" or "MISMATCH"

    @Column(nullable = false)
    private LocalDateTime verifiedAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "verified_by")
    private User verifiedBy;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    public PaperIntegrityRecord() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public QuestionPaper getPaper() { return paper; }
    public void setPaper(QuestionPaper paper) { this.paper = paper; }

    public String getRecordedHash() { return recordedHash; }
    public void setRecordedHash(String recordedHash) { this.recordedHash = recordedHash; }

    public String getVerifiedHash() { return verifiedHash; }
    public void setVerifiedHash(String verifiedHash) { this.verifiedHash = verifiedHash; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(LocalDateTime verifiedAt) { this.verifiedAt = verifiedAt; }

    public User getVerifiedBy() { return verifiedBy; }
    public void setVerifiedBy(User verifiedBy) { this.verifiedBy = verifiedBy; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
