package com.examshield.service;

import com.examshield.dto.FinalizePaperResponse;
import com.examshield.dto.IntegrityCheckResponse;
import com.examshield.entity.*;
import com.examshield.exception.BadRequestException;
import com.examshield.exception.ResourceNotFoundException;
import com.examshield.repository.ExaminationRepository;
import com.examshield.repository.PaperIntegrityRecordRepository;
import com.examshield.repository.QuestionPaperRepository;
import com.examshield.repository.UserRepository;
import com.examshield.util.CryptoUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class QuestionPaperService {

    @Value("${examshield.crypto.aes-secret}")
    private String aesSecretKey;

    private final QuestionPaperRepository paperRepository;
    private final ExaminationRepository examinationRepository;
    private final PaperIntegrityRecordRepository integrityRecordRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;
    private final BlockchainService blockchainService;
    private final SecurityAlertService alertService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public QuestionPaperService(QuestionPaperRepository paperRepository,
                                ExaminationRepository examinationRepository,
                                PaperIntegrityRecordRepository integrityRecordRepository,
                                UserRepository userRepository,
                                AuditLogService auditLogService,
                                BlockchainService blockchainService,
                                SecurityAlertService alertService) {
        this.paperRepository = paperRepository;
        this.examinationRepository = examinationRepository;
        this.integrityRecordRepository = integrityRecordRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
        this.blockchainService = blockchainService;
        this.alertService = alertService;
    }

    @Transactional(readOnly = true)
    public List<QuestionPaper> getAllPapers() {
        return paperRepository.findAllByOrderBySubmittedAtDesc();
    }

    @Transactional(readOnly = true)
    public QuestionPaper getPaperById(Long paperId) {
        return paperRepository.findById(paperId)
                .orElseThrow(() -> new ResourceNotFoundException("Question paper not found: " + paperId));
    }

    @Transactional(readOnly = true)
    public QuestionPaper getPaperByExamId(Long examId) {
        return paperRepository.findByExaminationId(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Question paper not found for exam: " + examId));
    }

    @Transactional
    public QuestionPaper submitPaper(Long paperId, String username) {
        QuestionPaper paper = getPaperById(paperId);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        if (paper.getStatus() != PaperStatus.DRAFT && paper.getStatus() != PaperStatus.REJECTED) {
            throw new BadRequestException("Only DRAFT or REJECTED papers can be submitted for review");
        }

        if (paper.getExamination().getQuestions().isEmpty()) {
            throw new BadRequestException("Cannot submit paper without any questions");
        }

        paper.setStatus(PaperStatus.SUBMITTED);
        paper.setSubmittedBy(user);
        paper.setSubmittedAt(LocalDateTime.now());
        QuestionPaper saved = paperRepository.save(paper);

        auditLogService.log(username, "QUESTION_SETTER", "PAPER_SUBMITTED", paperId, paper.getExamination().getId(),
                "127.0.0.1", "SUCCESS", "Paper submitted for review for exam: " + paper.getExamName());

        blockchainService.addBlock("PAPER_SUBMITTED", paperId, user.getId(), username,
                "Paper submitted for review: " + paper.getExamName() + " (Questions count: " + paper.getExamination().getQuestions().size() + ")");

        return saved;
    }

    @Transactional
    public QuestionPaper reviewPaper(Long paperId, boolean approved, String comments, String username) {
        QuestionPaper paper = getPaperById(paperId);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        if (paper.getStatus() != PaperStatus.SUBMITTED) {
            throw new BadRequestException("Only papers in SUBMITTED status can be reviewed");
        }

        paper.setStatus(approved ? PaperStatus.APPROVED : PaperStatus.REJECTED);
        paper.setReviewedBy(user);
        paper.setReviewedAt(LocalDateTime.now());
        paper.setReviewerComments(comments);
        QuestionPaper saved = paperRepository.save(paper);

        String action = approved ? "PAPER_APPROVED" : "PAPER_REJECTED";
        auditLogService.log(username, "REVIEWER", action, paperId, paper.getExamination().getId(),
                "127.0.0.1", "SUCCESS", "Paper " + (approved ? "approved" : "rejected") + ". Comments: " + comments);

        blockchainService.addBlock(action, paperId, user.getId(), username,
                "Paper " + (approved ? "approved" : "rejected") + ": " + paper.getExamName() + ". Comments: " + comments);

        return saved;
    }

    @Transactional
    public FinalizePaperResponse finalizePaper(Long paperId, String username) {
        QuestionPaper paper = getPaperById(paperId);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        if (paper.getStatus() != PaperStatus.APPROVED) {
            throw new BadRequestException("Only APPROVED papers can be finalized and secured");
        }

        try {
            // Build canonical representation of questions and exam metadata
            Examination exam = paper.getExamination();
            Map<String, Object> canonicalPayload = new HashMap<>();
            canonicalPayload.put("examId", exam.getId());
            canonicalPayload.put("examName", exam.getExamName());
            canonicalPayload.put("subject", exam.getSubject());
            canonicalPayload.put("course", exam.getCourse());
            canonicalPayload.put("examDate", exam.getExamDate().toString());
            canonicalPayload.put("startTime", exam.getStartTime().toString());
            canonicalPayload.put("durationMinutes", exam.getDurationMinutes());
            canonicalPayload.put("maxMarks", exam.getMaxMarks());

            List<Map<String, Object>> qList = exam.getQuestions().stream().map(q -> {
                Map<String, Object> qMap = new HashMap<>();
                qMap.put("questionNumber", q.getQuestionNumber());
                qMap.put("questionText", q.getQuestionText());
                qMap.put("marks", q.getMarks());
                qMap.put("questionType", q.getQuestionType().name());
                qMap.put("optionsJson", q.getOptionsJson());
                qMap.put("correctOption", q.getCorrectOption());
                return qMap;
            }).toList();
            canonicalPayload.put("questions", qList);

            String canonicalJson = objectMapper.writeValueAsString(canonicalPayload);

            // 1. Generate SHA-256 Hash
            String sha256Hash = CryptoUtil.sha256(canonicalJson);

            // 2. Encrypt using AES-256-GCM
            String encryptedContent = CryptoUtil.encryptAes(canonicalJson, aesSecretKey);

            // 3. Update Paper State
            paper.setEncryptedContent(encryptedContent);
            paper.setOriginalSha256Hash(sha256Hash);
            paper.setStatus(PaperStatus.LOCKED);
            paper.setSecurityPeriodActive(true);
            paper.setFinalizedBy(user);
            paper.setFinalizedAt(LocalDateTime.now());
            QuestionPaper saved = paperRepository.save(paper);

            // 4. Audit Log
            auditLogService.log(username, "EXAM_CONTROLLER", "PAPER_FINALIZED", paperId, exam.getId(),
                    "127.0.0.1", "SUCCESS", "Question paper finalized, locked, and secured with AES-256");
            auditLogService.log(username, "EXAM_CONTROLLER", "PAPER_ENCRYPTED", paperId, exam.getId(),
                    "127.0.0.1", "SUCCESS", "AES-256-GCM encryption applied. SHA-256 hash: " + sha256Hash);

            // 5. Blockchain Audit Entry
            var block = blockchainService.addBlock("PAPER_FINALIZED_AND_ENCRYPTED", paperId, user.getId(), username,
                    "Paper Finalized & Encrypted with AES-256. SHA-256 Hash: " + sha256Hash + " for Exam: " + exam.getExamName());

            FinalizePaperResponse response = new FinalizePaperResponse();
            response.setPaperId(paperId);
            response.setExamId(exam.getId());
            response.setExamName(exam.getExamName());
            response.setPaperStatus("LOCKED");
            response.setEncryptionStatus("ENCRYPTED (AES-256-GCM)");
            response.setOriginalSha256Hash(sha256Hash);
            response.setAccessStatus("RESTRICTED (SECURITY PERIOD ACTIVE)");
            response.setSecurityPeriodActive(true);
            response.setBlockchainBlockIndex(block.getBlockIndex());
            response.setMessage("Question paper successfully finalized, AES encrypted, SHA-256 hashed, and sealed on blockchain.");

            return response;
        } catch (Exception e) {
            throw new RuntimeException("Finalization failed: " + e.getMessage(), e);
        }
    }

    @Transactional
    public QuestionPaper scheduleRelease(Long paperId, LocalDateTime scheduledTime, String username) {
        QuestionPaper paper = getPaperById(paperId);
        if (paper.getStatus() != PaperStatus.LOCKED) {
            throw new BadRequestException("Only LOCKED papers can have release scheduled");
        }

        paper.setScheduledReleaseTime(scheduledTime);
        QuestionPaper saved = paperRepository.save(paper);

        auditLogService.log(username, "EXAM_CONTROLLER", "RELEASE_SCHEDULED", paperId, paper.getExamination().getId(),
                "127.0.0.1", "SUCCESS", "Paper release scheduled for: " + scheduledTime);

        return saved;
    }

    @Transactional
    public QuestionPaper releasePaper(Long paperId, String username) {
        QuestionPaper paper = getPaperById(paperId);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        if (paper.getStatus() != PaperStatus.LOCKED) {
            throw new BadRequestException("Only LOCKED papers can be released");
        }

        paper.setStatus(PaperStatus.RELEASED);
        paper.setReleasedBy(user);
        paper.setReleasedAt(LocalDateTime.now());
        paper.setSecurityPeriodActive(false);
        QuestionPaper saved = paperRepository.save(paper);

        auditLogService.log(username, "EXAM_CONTROLLER", "PAPER_RELEASED", paperId, paper.getExamination().getId(),
                "127.0.0.1", "SUCCESS", "Secure Question Paper released for examination session");

        blockchainService.addBlock("PAPER_RELEASED", paperId, user.getId(), username,
                "Question paper released by Exam Controller: " + paper.getExamName());

        return saved;
    }

    @Transactional
    public IntegrityCheckResponse verifyIntegrity(Long paperId, String username) {
        QuestionPaper paper = getPaperById(paperId);
        User user = userRepository.findByUsername(username).orElse(null);

        if (paper.getOriginalSha256Hash() == null) {
            throw new BadRequestException("Paper has not been finalized yet. No original hash exists to verify.");
        }

        String originalHash = paper.getOriginalSha256Hash();
        String currentHash;

        try {
            if (paper.getEncryptedContent() != null) {
                // Decrypt and re-calculate SHA-256 over decrypted canonical content
                String decryptedJson = CryptoUtil.decryptAes(paper.getEncryptedContent(), aesSecretKey);
                currentHash = CryptoUtil.sha256(decryptedJson);
            } else {
                currentHash = "NO_CONTENT";
            }
        } catch (Exception e) {
            currentHash = "DECRYPTION_ERROR: " + e.getMessage();
        }

        boolean match = originalHash.equalsIgnoreCase(currentHash);
        String statusMessage = match
                ? "Integrity Verified – No Modification Detected"
                : "Integrity Check Failed – Possible Modification Detected";

        // Record verification in paper_integrity_records
        PaperIntegrityRecord record = new PaperIntegrityRecord();
        record.setPaper(paper);
        record.setRecordedHash(originalHash);
        record.setVerifiedHash(currentHash);
        record.setStatus(match ? "MATCH" : "MISMATCH");
        record.setVerifiedBy(user);
        record.setRemarks(statusMessage);
        integrityRecordRepository.save(record);

        // Audit log
        auditLogService.log(username, "AUDITOR", match ? "INTEGRITY_VERIFIED" : "INTEGRITY_MISMATCH",
                paperId, paper.getExamination().getId(), "127.0.0.1",
                match ? "SUCCESS" : "WARNING", statusMessage);

        if (!match) {
            alertService.createAlert("INTEGRITY_MISMATCH", "CRITICAL",
                    "Integrity check failed for paper #" + paperId + " (" + paper.getExamName() + ")! Recorded: " + originalHash + ", Recalculated: " + currentHash);
        }

        return new IntegrityCheckResponse(paperId, paper.getExamination().getId(), paper.getExamName(),
                originalHash, currentHash, match, statusMessage);
    }

    @Transactional
    public IntegrityCheckResponse simulatePaperTamper(Long paperId) {
        QuestionPaper paper = getPaperById(paperId);
        // Alter original hash to simulate tamper
        paper.setOriginalSha256Hash("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"); // Altered hash
        paperRepository.save(paper);

        alertService.createAlert("SIMULATED_PAPER_TAMPER", "HIGH",
                "Simulated tamper executed on Question Paper #" + paperId);

        return verifyIntegrity(paperId, "SYSTEM_SIMULATION");
    }

    @Transactional
    public void restorePaperHash(Long paperId) {
        QuestionPaper paper = getPaperById(paperId);
        if (paper.getEncryptedContent() != null) {
            String decryptedJson = CryptoUtil.decryptAes(paper.getEncryptedContent(), aesSecretKey);
            String correctHash = CryptoUtil.sha256(decryptedJson);
            paper.setOriginalSha256Hash(correctHash);
            paperRepository.save(paper);
        }
    }

    @Transactional(readOnly = true)
    public String getDecryptedContent(Long paperId) {
        QuestionPaper paper = getPaperById(paperId);
        if (paper.getStatus() != PaperStatus.RELEASED) {
            throw new BadRequestException("Access Restricted: Paper can only be viewed in decrypted form after RELEASE");
        }
        return CryptoUtil.decryptAes(paper.getEncryptedContent(), aesSecretKey);
    }
}
