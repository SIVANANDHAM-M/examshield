package com.examshield.config;

import com.examshield.dto.QuestionDto;
import com.examshield.entity.*;
import com.examshield.repository.ExaminationRepository;
import com.examshield.repository.QuestionPaperRepository;
import com.examshield.repository.RoleRepository;
import com.examshield.repository.UserRepository;
import com.examshield.service.AuditLogService;
import com.examshield.service.BlockchainService;
import com.examshield.service.ExamService;
import com.examshield.service.QuestionPaperService;
import com.examshield.service.SecurityAlertService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final ExaminationRepository examRepository;
    private final QuestionPaperRepository paperRepository;
    private final PasswordEncoder passwordEncoder;
    private final BlockchainService blockchainService;
    private final QuestionPaperService paperService;
    private final ExamService examService;
    private final AuditLogService auditLogService;
    private final SecurityAlertService alertService;

    public DataInitializer(RoleRepository roleRepository,
                           UserRepository userRepository,
                           ExaminationRepository examRepository,
                           QuestionPaperRepository paperRepository,
                           PasswordEncoder passwordEncoder,
                           BlockchainService blockchainService,
                           QuestionPaperService paperService,
                           ExamService examService,
                           AuditLogService auditLogService,
                           SecurityAlertService alertService) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.examRepository = examRepository;
        this.paperRepository = paperRepository;
        this.passwordEncoder = passwordEncoder;
        this.blockchainService = blockchainService;
        this.paperService = paperService;
        this.examService = examService;
        this.auditLogService = auditLogService;
        this.alertService = alertService;
    }

    @Override
    public void run(String... args) throws Exception {
        // 1. Initialize Roles
        Role setterRole = roleRepository.findByName(RoleName.ROLE_QUESTION_SETTER)
                .orElseGet(() -> roleRepository.save(new Role(RoleName.ROLE_QUESTION_SETTER)));
        Role reviewerRole = roleRepository.findByName(RoleName.ROLE_REVIEWER)
                .orElseGet(() -> roleRepository.save(new Role(RoleName.ROLE_REVIEWER)));
        Role controllerRole = roleRepository.findByName(RoleName.ROLE_EXAM_CONTROLLER)
                .orElseGet(() -> roleRepository.save(new Role(RoleName.ROLE_EXAM_CONTROLLER)));
        Role auditorRole = roleRepository.findByName(RoleName.ROLE_AUDITOR)
                .orElseGet(() -> roleRepository.save(new Role(RoleName.ROLE_AUDITOR)));
        Role adminRole = roleRepository.findByName(RoleName.ROLE_ADMIN)
                .orElseGet(() -> roleRepository.save(new Role(RoleName.ROLE_ADMIN)));

        // 2. Initialize 5 Demo Users if not present
        if (userRepository.count() == 0) {
            User setter = new User("setter", "Dr. Alan Turing", "setter@examshield.edu",
                    passwordEncoder.encode("Setter@123"), "Computer Science & Engineering");
            setter.setRoles(Set.of(setterRole));
            userRepository.save(setter);

            User reviewer = new User("reviewer", "Prof. Grace Hopper", "reviewer@examshield.edu",
                    passwordEncoder.encode("Reviewer@123"), "Academic Review Board");
            reviewer.setRoles(Set.of(reviewerRole));
            userRepository.save(reviewer);

            User controller = new User("controller", "Dr. John von Neumann", "controller@examshield.edu",
                    passwordEncoder.encode("Controller@123"), "Office of Controller of Examinations");
            controller.setRoles(Set.of(controllerRole));
            userRepository.save(controller);

            User auditor = new User("auditor", "Ada Lovelace", "auditor@examshield.edu",
                    passwordEncoder.encode("Auditor@123"), "Cybersecurity & Audit Cell");
            auditor.setRoles(Set.of(auditorRole));
            userRepository.save(auditor);

            User admin = new User("admin", "System Administrator", "admin@examshield.edu",
                    passwordEncoder.encode("Admin@123"), "Information Technology Services");
            admin.setRoles(Set.of(adminRole));
            userRepository.save(admin);

            // 3. Initialize Blockchain Genesis Block
            blockchainService.initGenesisBlockIfNeeded();

            // 4. Seed Examination 1: Computer Networks (To be finalized & encrypted)
            Examination exam1 = new Examination();
            exam1.setExamName("CS801: End-Semester Examination - Computer Networks");
            exam1.setSubject("Computer Networks");
            exam1.setCourse("B.Tech Computer Science and Engineering");
            exam1.setExamDate(LocalDate.of(2026, 9, 20));
            exam1.setStartTime(LocalTime.of(10, 0));
            exam1.setDurationMinutes(180);
            exam1.setMaxMarks(100);
            exam1.setCreatedBy(setter);
            exam1 = examRepository.save(exam1);

            QuestionPaper paper1 = new QuestionPaper();
            paper1.setExamination(exam1);
            paper1.setStatus(PaperStatus.DRAFT);
            paper1.setSubmittedBy(setter);
            paper1 = paperRepository.save(paper1);

            // Add Questions to Exam 1
            QuestionDto q1 = new QuestionDto();
            q1.setQuestionNumber(1);
            q1.setQuestionText("What is the purpose of TCP congestion control?");
            q1.setMarks(10);
            q1.setQuestionType(QuestionType.DESCRIPTIVE);
            examService.addQuestion(exam1.getId(), q1, "setter");

            QuestionDto q2 = new QuestionDto();
            q2.setQuestionNumber(2);
            q2.setQuestionText("Which layer of the OSI model is responsible for end-to-end communication and reliability?");
            q2.setMarks(5);
            q2.setQuestionType(QuestionType.MCQ);
            q2.setOptionsJson("[\"Network Layer\", \"Data Link Layer\", \"Transport Layer\", \"Session Layer\"]");
            q2.setCorrectOption("Transport Layer");
            examService.addQuestion(exam1.getId(), q2, "setter");

            QuestionDto q3 = new QuestionDto();
            q3.setQuestionNumber(3);
            q3.setQuestionText("Explain the Diffie-Hellman Key Exchange algorithm with a numerical illustration and analyze its vulnerability to Man-In-The-Middle attacks.");
            q3.setMarks(15);
            q3.setQuestionType(QuestionType.DESCRIPTIVE);
            examService.addQuestion(exam1.getId(), q3, "setter");

            QuestionDto q4 = new QuestionDto();
            q4.setQuestionNumber(4);
            q4.setQuestionText("In IPv4 addressing, what is the default subnet mask for a Class B network?");
            q4.setMarks(5);
            q4.setQuestionType(QuestionType.MCQ);
            q4.setOptionsJson("[\"255.0.0.0\", \"255.255.0.0\", \"255.255.255.0\", \"255.255.255.255\"]");
            q4.setCorrectOption("255.255.0.0");
            examService.addQuestion(exam1.getId(), q4, "setter");

            // Advance Paper 1 through workflow to LOCKED (Finalized & Encrypted)
            paperService.submitPaper(paper1.getId(), "setter");
            paperService.reviewPaper(paper1.getId(), true, "All questions meet syllabus guidelines and Bloom's taxonomy standards.", "reviewer");
            paperService.finalizePaper(paper1.getId(), "controller");

            // 5. Seed Examination 2: Distributed Systems (In SUBMITTED status ready for demo review & finalization)
            Examination exam2 = new Examination();
            exam2.setExamName("CS802: Mid-Term Examination - Distributed Systems");
            exam2.setSubject("Distributed Systems & Cloud Computing");
            exam2.setCourse("B.Tech Information Technology");
            exam2.setExamDate(LocalDate.of(2026, 9, 25));
            exam2.setStartTime(LocalTime.of(14, 0));
            exam2.setDurationMinutes(120);
            exam2.setMaxMarks(50);
            exam2.setCreatedBy(setter);
            exam2 = examRepository.save(exam2);

            QuestionPaper paper2 = new QuestionPaper();
            paper2.setExamination(exam2);
            paper2.setStatus(PaperStatus.DRAFT);
            paper2.setSubmittedBy(setter);
            paper2 = paperRepository.save(paper2);

            QuestionDto dq1 = new QuestionDto();
            dq1.setQuestionNumber(1);
            dq1.setQuestionText("State the CAP theorem and discuss why network partitioning cannot be avoided in distributed datastores.");
            dq1.setMarks(10);
            dq1.setQuestionType(QuestionType.DESCRIPTIVE);
            examService.addQuestion(exam2.getId(), dq1, "setter");

            QuestionDto dq2 = new QuestionDto();
            dq2.setQuestionNumber(2);
            dq2.setQuestionText("Which consensus algorithm is specifically designed for crash-fault-tolerant distributed state machine replication?");
            dq2.setMarks(5);
            dq2.setQuestionType(QuestionType.MCQ);
            dq2.setOptionsJson("[\"Raft / Paxos\", \"PBFT\", \"Proof of Work\", \"Round Robin\"]");
            dq2.setCorrectOption("Raft / Paxos");
            examService.addQuestion(exam2.getId(), dq2, "setter");

            paperService.submitPaper(paper2.getId(), "setter");

            // 6. Seed Sample Alerts
            alertService.createAlert("SECURITY_AUDIT_INITIALIZED", "LOW",
                    "ExamShield audit engine successfully activated with SHA-256 integrity checks and permissioned blockchain ledger.");
        }
    }
}
