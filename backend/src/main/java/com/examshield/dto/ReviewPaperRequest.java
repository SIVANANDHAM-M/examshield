package com.examshield.dto;

import jakarta.validation.constraints.NotNull;

public class ReviewPaperRequest {
    @NotNull
    private Boolean approved;

    private String comments;

    public ReviewPaperRequest() {}

    public ReviewPaperRequest(Boolean approved, String comments) {
        this.approved = approved;
        this.comments = comments;
    }

    public Boolean getApproved() { return approved; }
    public void setApproved(Boolean approved) { this.approved = approved; }

    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
}
