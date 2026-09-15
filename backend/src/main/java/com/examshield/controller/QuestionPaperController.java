package com.examshield.controller;

import com.examshield.dto.FinalizePaperResponse;
import com.examshield.dto.IntegrityCheckResponse;
import com.examshield.dto.ReviewPaperRequest;
import com.examshield.entity.QuestionPaper;
import com.examshield.service.QuestionPaperService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/papers")
public class QuestionPaperController {

    private final QuestionPaperService paperService;

    public QuestionPaperController(QuestionPaperService paperService) {
        this.paperService = paperService;
    }

    @GetMapping
    public ResponseEntity<List<QuestionPaper>> getAllPapers() {
        return ResponseEntity.ok(paperService.getAllPapers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuestionPaper> getPaperById(@PathVariable Long id) {
        return ResponseEntity.ok(paperService.getPaperById(id));
    }

    @GetMapping("/exam/{examId}")
    public ResponseEntity<QuestionPaper> getPaperByExamId(@PathVariable Long examId) {
        return ResponseEntity.ok(paperService.getPaperByExamId(examId));
    }

    @PostMapping("/{id}/submit")
    @PreAuthorize("hasAnyRole('QUESTION_SETTER', 'ADMIN')")
    public ResponseEntity<QuestionPaper> submitPaper(@PathVariable Long id, Authentication authentication) {
        QuestionPaper paper = paperService.submitPaper(id, authentication.getName());
        return ResponseEntity.ok(paper);
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('REVIEWER', 'ADMIN')")
    public ResponseEntity<QuestionPaper> approvePaper(@PathVariable Long id, @RequestBody(required = false) ReviewPaperRequest req, Authentication authentication) {
        String comments = req != null && req.getComments() != null ? req.getComments() : "Approved by reviewer";
        QuestionPaper paper = paperService.reviewPaper(id, true, comments, authentication.getName());
        return ResponseEntity.ok(paper);
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('REVIEWER', 'ADMIN')")
    public ResponseEntity<QuestionPaper> rejectPaper(@PathVariable Long id, @RequestBody(required = false) ReviewPaperRequest req, Authentication authentication) {
        String comments = req != null && req.getComments() != null ? req.getComments() : "Rejected by reviewer: modifications needed";
        QuestionPaper paper = paperService.reviewPaper(id, false, comments, authentication.getName());
        return ResponseEntity.ok(paper);
    }

    @PostMapping("/{id}/finalize")
    @PreAuthorize("hasAnyRole('EXAM_CONTROLLER', 'ADMIN')")
    public ResponseEntity<FinalizePaperResponse> finalizePaper(@PathVariable Long id, Authentication authentication) {
        FinalizePaperResponse response = paperService.finalizePaper(id, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/schedule-release")
    @PreAuthorize("hasAnyRole('EXAM_CONTROLLER', 'ADMIN')")
    public ResponseEntity<QuestionPaper> scheduleRelease(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime releaseTime,
            Authentication authentication) {
        QuestionPaper paper = paperService.scheduleRelease(id, releaseTime, authentication.getName());
        return ResponseEntity.ok(paper);
    }

    @PostMapping("/{id}/release")
    @PreAuthorize("hasAnyRole('EXAM_CONTROLLER', 'ADMIN')")
    public ResponseEntity<QuestionPaper> releasePaper(@PathVariable Long id, Authentication authentication) {
        QuestionPaper paper = paperService.releasePaper(id, authentication.getName());
        return ResponseEntity.ok(paper);
    }

    @GetMapping("/{id}/verify-integrity")
    @PreAuthorize("hasAnyRole('AUDITOR', 'EXAM_CONTROLLER', 'ADMIN')")
    public ResponseEntity<IntegrityCheckResponse> verifyIntegrity(@PathVariable Long id, Authentication authentication) {
        IntegrityCheckResponse response = paperService.verifyIntegrity(id, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/tamper")
    @PreAuthorize("hasAnyRole('AUDITOR', 'ADMIN')")
    public ResponseEntity<IntegrityCheckResponse> simulateTamper(@PathVariable Long id) {
        IntegrityCheckResponse response = paperService.simulatePaperTamper(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/restore")
    @PreAuthorize("hasAnyRole('AUDITOR', 'ADMIN')")
    public ResponseEntity<?> restorePaper(@PathVariable Long id) {
        paperService.restorePaperHash(id);
        return ResponseEntity.ok(Map.of("message", "Paper hash restored to match original encrypted content"));
    }

    @GetMapping("/{id}/content")
    @PreAuthorize("hasAnyRole('EXAM_CONTROLLER', 'ADMIN', 'AUDITOR')")
    public ResponseEntity<?> getDecryptedContent(@PathVariable Long id) {
        String content = paperService.getDecryptedContent(id);
        return ResponseEntity.ok(Map.of("paperId", id, "content", content));
    }
}
