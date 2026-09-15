package com.examshield.dto;

import java.util.List;

public class BlockchainVerificationResponse {
    private boolean valid;
    private String status; // "VALID" or "TAMPERED"
    private int totalBlocks;
    private Long invalidBlockIndex;
    private String details;
    private List<String> issues;

    public BlockchainVerificationResponse() {}

    public BlockchainVerificationResponse(boolean valid, String status, int totalBlocks, Long invalidBlockIndex, String details, List<String> issues) {
        this.valid = valid;
        this.status = status;
        this.totalBlocks = totalBlocks;
        this.invalidBlockIndex = invalidBlockIndex;
        this.details = details;
        this.issues = issues;
    }

    public boolean isValid() { return valid; }
    public void setValid(boolean valid) { this.valid = valid; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getTotalBlocks() { return totalBlocks; }
    public void setTotalBlocks(int totalBlocks) { this.totalBlocks = totalBlocks; }

    public Long getInvalidBlockIndex() { return invalidBlockIndex; }
    public void setInvalidBlockIndex(Long invalidBlockIndex) { this.invalidBlockIndex = invalidBlockIndex; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public List<String> getIssues() { return issues; }
    public void setIssues(List<String> issues) { this.issues = issues; }
}
