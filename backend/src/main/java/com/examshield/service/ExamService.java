package com.examshield.service;

import com.examshield.dto.ExamRequest;
import com.examshield.dto.QuestionDto;
import com.examshield.entity.*;
import com.examshield.exception.BadRequestException;
import com.examshield.exception.ResourceNotFoundException;
import com.examshield.repository.ExaminationRepository;
import com.examshield.repository.QuestionPaperRepository;
import com.examshield.repository.QuestionRepository;
import com.examshield.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class ExamService {

    private final ExaminationRepository examRepository;
    private final QuestionRepository questionRepository;
    private final QuestionPaperRepository paperRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public ExamService(ExaminationRepository examRepository,
                       QuestionRepository questionRepository,
                       QuestionPaperRepository paperRepository,
                       UserRepository userRepository,
                       AuditLogService auditLogService) {
        this.examRepository = examRepository;
        this.questionRepository = questionRepository;
        this.paperRepository = paperRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public Examination createExam(ExamRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        Examination exam = new Examination();
        exam.setExamName(request.getExamName());
        exam.setSubject(request.getSubject());
        exam.setCourse(request.getCourse());
        exam.setExamDate(request.getExamDate());
        exam.setStartTime(request.getStartTime());
        exam.setDurationMinutes(request.getDurationMinutes());
        exam.setMaxMarks(request.getMaxMarks());
        exam.setCreatedBy(user);

        Examination savedExam = examRepository.save(exam);

        // Auto-create initial QuestionPaper entity in DRAFT status
        QuestionPaper paper = new QuestionPaper();
        paper.setExamination(savedExam);
        paper.setStatus(PaperStatus.DRAFT);
        paper.setSubmittedBy(user);
        paperRepository.save(paper);

        auditLogService.log(username, "QUESTION_SETTER", "EXAM_CREATED", paper.getId(), savedExam.getId(),
                "127.0.0.1", "SUCCESS", "Examination created: " + savedExam.getExamName());

        return savedExam;
    }

    @Transactional(readOnly = true)
    public List<Examination> getAllExams() {
        return examRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public Examination getExamById(Long id) {
        return examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Examination not found: " + id));
    }

    @Transactional
    public Question addQuestion(Long examId, QuestionDto dto, String username) {
        Examination exam = getExamById(examId);
        QuestionPaper paper = paperRepository.findByExaminationId(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Question paper not found for exam: " + examId));

        if (paper.getStatus() == PaperStatus.LOCKED || paper.getStatus() == PaperStatus.RELEASED ||
            paper.getStatus() == PaperStatus.EXAM_STARTED || paper.getStatus() == PaperStatus.EXAM_COMPLETED) {
            throw new BadRequestException("Editing disabled: Question paper is already " + paper.getStatus());
        }

        Question question = new Question();
        question.setExamination(exam);
        question.setQuestionNumber(dto.getQuestionNumber() != null ? dto.getQuestionNumber() : (exam.getQuestions().size() + 1));
        question.setQuestionText(dto.getQuestionText());
        question.setMarks(dto.getMarks());
        question.setQuestionType(dto.getQuestionType());
        question.setOptionsJson(dto.getOptionsJson());
        question.setCorrectOption(dto.getCorrectOption());

        Question saved = questionRepository.save(question);

        auditLogService.log(username, "QUESTION_SETTER", "QUESTION_CREATED", paper.getId(), examId,
                "127.0.0.1", "SUCCESS", "Question #" + saved.getQuestionNumber() + " added to " + exam.getExamName());

        return saved;
    }

    @Transactional
    public Question updateQuestion(Long questionId, QuestionDto dto, String username) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found: " + questionId));

        QuestionPaper paper = paperRepository.findByExaminationId(question.getExamination().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Question paper not found"));

        if (paper.getStatus() == PaperStatus.LOCKED || paper.getStatus() == PaperStatus.RELEASED ||
            paper.getStatus() == PaperStatus.EXAM_STARTED || paper.getStatus() == PaperStatus.EXAM_COMPLETED) {
            throw new BadRequestException("Editing disabled: Question paper is already " + paper.getStatus());
        }

        question.setQuestionText(dto.getQuestionText());
        question.setMarks(dto.getMarks());
        question.setQuestionType(dto.getQuestionType());
        question.setOptionsJson(dto.getOptionsJson());
        question.setCorrectOption(dto.getCorrectOption());
        if (dto.getQuestionNumber() != null) {
            question.setQuestionNumber(dto.getQuestionNumber());
        }

        Question updated = questionRepository.save(question);

        auditLogService.log(username, "QUESTION_SETTER", "QUESTION_UPDATED", paper.getId(), question.getExamination().getId(),
                "127.0.0.1", "SUCCESS", "Question #" + updated.getQuestionNumber() + " updated");

        return updated;
    }

    @Transactional
    public void deleteQuestion(Long questionId, String username) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found: " + questionId));

        QuestionPaper paper = paperRepository.findByExaminationId(question.getExamination().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Question paper not found"));

        if (paper.getStatus() == PaperStatus.LOCKED || paper.getStatus() == PaperStatus.RELEASED ||
            paper.getStatus() == PaperStatus.EXAM_STARTED || paper.getStatus() == PaperStatus.EXAM_COMPLETED) {
            throw new BadRequestException("Editing disabled: Question paper is already " + paper.getStatus());
        }

        Long examId = question.getExamination().getId();
        int qNum = question.getQuestionNumber();
        questionRepository.delete(question);

        auditLogService.log(username, "QUESTION_SETTER", "QUESTION_DELETED", paper.getId(), examId,
                "127.0.0.1", "SUCCESS", "Question #" + qNum + " deleted");
    }

    @Transactional
    public List<Question> reorderQuestions(Long examId, List<Long> orderedQuestionIds, String username) {
        Examination exam = getExamById(examId);
        QuestionPaper paper = paperRepository.findByExaminationId(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Question paper not found"));

        if (paper.getStatus() == PaperStatus.LOCKED || paper.getStatus() == PaperStatus.RELEASED ||
            paper.getStatus() == PaperStatus.EXAM_STARTED || paper.getStatus() == PaperStatus.EXAM_COMPLETED) {
            throw new BadRequestException("Editing disabled: Question paper is already " + paper.getStatus());
        }

        List<Question> updatedList = new ArrayList<>();
        int index = 1;
        for (Long qId : orderedQuestionIds) {
            Question q = questionRepository.findById(qId).orElse(null);
            if (q != null && q.getExamination().getId().equals(examId)) {
                q.setQuestionNumber(index++);
                updatedList.add(questionRepository.save(q));
            }
        }

        auditLogService.log(username, "QUESTION_SETTER", "QUESTIONS_REORDERED", paper.getId(), examId,
                "127.0.0.1", "SUCCESS", "Questions reordered for exam: " + exam.getExamName());

        return updatedList;
    }
}
