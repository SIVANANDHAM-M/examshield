package com.examshield.controller;

import com.examshield.dto.ExamRequest;
import com.examshield.dto.QuestionDto;
import com.examshield.entity.Examination;
import com.examshield.entity.Question;
import com.examshield.service.ExamService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/exams")
public class ExamController {

    private final ExamService examService;

    public ExamController(ExamService examService) {
        this.examService = examService;
    }

    @GetMapping
    public ResponseEntity<List<Examination>> getAllExams() {
        return ResponseEntity.ok(examService.getAllExams());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Examination> getExamById(@PathVariable Long id) {
        return ResponseEntity.ok(examService.getExamById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('QUESTION_SETTER', 'ADMIN')")
    public ResponseEntity<Examination> createExam(@Valid @RequestBody ExamRequest request, Authentication authentication) {
        Examination exam = examService.createExam(request, authentication.getName());
        return ResponseEntity.ok(exam);
    }

    @PostMapping("/{id}/questions")
    @PreAuthorize("hasAnyRole('QUESTION_SETTER', 'ADMIN')")
    public ResponseEntity<Question> addQuestion(@PathVariable Long id, @Valid @RequestBody QuestionDto dto, Authentication authentication) {
        Question q = examService.addQuestion(id, dto, authentication.getName());
        return ResponseEntity.ok(q);
    }

    @PostMapping("/{id}/questions/reorder")
    @PreAuthorize("hasAnyRole('QUESTION_SETTER', 'ADMIN')")
    public ResponseEntity<List<Question>> reorderQuestions(@PathVariable Long id, @RequestBody List<Long> questionIds, Authentication authentication) {
        List<Question> reordered = examService.reorderQuestions(id, questionIds, authentication.getName());
        return ResponseEntity.ok(reordered);
    }
}
