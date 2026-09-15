package com.examshield.dto;

import java.time.LocalDateTime;

public class IntegrityCheckResponse {
    private Long paperId;
    private Long examId;
    private String examName;
    private String originalHash;
    private String currentHash;
    private boolean match;
    private String statusMessage;
    private LocalDateTime verifiedAt;

    public IntegrityCheckResponse() {}

    public IntegrityCheckResponse(Long paperId, Long examId, String examName, String originalHash, String currentHash, boolean match, String statusMessage) {
        this.paperId = paperId;
        this.examId = examId;
        this.examName = examName;
        this.originalHash = originalHash;
        this.currentHash = currentHash;
        this.match = match;
        this.statusMessage = statusMessage;
        this.verifiedAt = LocalDateTime.now();
    }

    public Long getPaperId() { return paperId; }
    public void setPaperId(Long paperId) { this.paperId = paperId; }

    public Long getExamId() { return examId; }
    public void setExamId(Long examId) { this.examId = examId; }

    public String getExamName() { return examName; }
    public void setExamName(String examName) { this.examName = examName; }

    public String getOriginalHash() { return originalHash; }
    public void setOriginalHash(String originalHash) { this.originalHash = originalHash; }

    public String getCurrentHash() { return currentHash; }
    public void setCurrentHash(String currentHash) { this.currentHash = currentHash; }

    public boolean isMatch() { return match; }
    public void setMatch(boolean match) { this.match = match; }

    public String getStatusMessage() { return statusMessage; }
    public void setStatusMessage(String statusMessage) { this.statusMessage = statusMessage; }

    public LocalDateTime getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(LocalDateTime verifiedAt) { this.verifiedAt = verifiedAt; }
}
