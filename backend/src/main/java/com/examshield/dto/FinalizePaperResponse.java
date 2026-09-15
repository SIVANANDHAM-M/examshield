package com.examshield.dto;

public class FinalizePaperResponse {
    private Long paperId;
    private Long examId;
    private String examName;
    private String paperStatus; // LOCKED
    private String encryptionStatus; // ENCRYPTED (AES-256-GCM)
    private String originalSha256Hash;
    private String partialSha256Hash;
    private String accessStatus; // RESTRICTED
    private boolean securityPeriodActive;
    private Long blockchainBlockIndex;
    private String message;

    public FinalizePaperResponse() {}

    public Long getPaperId() { return paperId; }
    public void setPaperId(Long paperId) { this.paperId = paperId; }

    public Long getExamId() { return examId; }
    public void setExamId(Long examId) { this.examId = examId; }

    public String getExamName() { return examName; }
    public void setExamName(String examName) { this.examName = examName; }

    public String getPaperStatus() { return paperStatus; }
    public void setPaperStatus(String paperStatus) { this.paperStatus = paperStatus; }

    public String getEncryptionStatus() { return encryptionStatus; }
    public void setEncryptionStatus(String encryptionStatus) { this.encryptionStatus = encryptionStatus; }

    public String getOriginalSha256Hash() { return originalSha256Hash; }
    public void setOriginalSha256Hash(String originalSha256Hash) {
        this.originalSha256Hash = originalSha256Hash;
        if (originalSha256Hash != null && originalSha256Hash.length() > 16) {
            this.partialSha256Hash = originalSha256Hash.substring(0, 10) + "..." + originalSha256Hash.substring(originalSha256Hash.length() - 8);
        } else {
            this.partialSha256Hash = originalSha256Hash;
        }
    }

    public String getPartialSha256Hash() { return partialSha256Hash; }
    public void setPartialSha256Hash(String partialSha256Hash) { this.partialSha256Hash = partialSha256Hash; }

    public String getAccessStatus() { return accessStatus; }
    public void setAccessStatus(String accessStatus) { this.accessStatus = accessStatus; }

    public boolean isSecurityPeriodActive() { return securityPeriodActive; }
    public void setSecurityPeriodActive(boolean securityPeriodActive) { this.securityPeriodActive = securityPeriodActive; }

    public Long getBlockchainBlockIndex() { return blockchainBlockIndex; }
    public void setBlockchainBlockIndex(Long blockchainBlockIndex) { this.blockchainBlockIndex = blockchainBlockIndex; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
