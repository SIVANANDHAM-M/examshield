package com.examshield.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "question_papers")
public class QuestionPaper {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "exam_id", nullable = false, unique = true)
    @JsonIgnore
    private Examination examination;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private PaperStatus status = PaperStatus.DRAFT;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "submitted_by")
    private User submittedBy;

    private LocalDateTime submittedAt;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    private LocalDateTime reviewedAt;

    @Column(columnDefinition = "TEXT")
    private String reviewerComments;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "finalized_by")
    private User finalizedBy;

    private LocalDateTime finalizedAt;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String encryptedContent;

    @Column(length = 64)
    private String originalSha256Hash;

    private LocalDateTime scheduledReleaseTime;

    private LocalDateTime releasedAt;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "released_by")
    private User releasedBy;

    private boolean securityPeriodActive = false;

    public QuestionPaper() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Examination getExamination() { return examination; }
    public void setExamination(Examination examination) { this.examination = examination; }

    public PaperStatus getStatus() { return status; }
    public void setStatus(PaperStatus status) { this.status = status; }

    public User getSubmittedBy() { return submittedBy; }
    public void setSubmittedBy(User submittedBy) { this.submittedBy = submittedBy; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }

    public User getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(User reviewedBy) { this.reviewedBy = reviewedBy; }

    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }

    public String getReviewerComments() { return reviewerComments; }
    public void setReviewerComments(String reviewerComments) { this.reviewerComments = reviewerComments; }

    public User getFinalizedBy() { return finalizedBy; }
    public void setFinalizedBy(User finalizedBy) { this.finalizedBy = finalizedBy; }

    public LocalDateTime getFinalizedAt() { return finalizedAt; }
    public void setFinalizedAt(LocalDateTime finalizedAt) { this.finalizedAt = finalizedAt; }

    public String getEncryptedContent() { return encryptedContent; }
    public void setEncryptedContent(String encryptedContent) { this.encryptedContent = encryptedContent; }

    public String getOriginalSha256Hash() { return originalSha256Hash; }
    public void setOriginalSha256Hash(String originalSha256Hash) { this.originalSha256Hash = originalSha256Hash; }

    public LocalDateTime getScheduledReleaseTime() { return scheduledReleaseTime; }
    public void setScheduledReleaseTime(LocalDateTime scheduledReleaseTime) { this.scheduledReleaseTime = scheduledReleaseTime; }

    public LocalDateTime getReleasedAt() { return releasedAt; }
    public void setReleasedAt(LocalDateTime releasedAt) { this.releasedAt = releasedAt; }

    public User getReleasedBy() { return releasedBy; }
    public void setReleasedBy(User releasedBy) { this.releasedBy = releasedBy; }

    public boolean isSecurityPeriodActive() { return securityPeriodActive; }
    public void setSecurityPeriodActive(boolean securityPeriodActive) { this.securityPeriodActive = securityPeriodActive; }

    public Long getExamId() {
        return examination != null ? examination.getId() : null;
    }

    public String getExamName() {
        return examination != null ? examination.getExamName() : null;
    }
}
