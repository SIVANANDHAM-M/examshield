package com.examshield.controller;

import com.examshield.dto.QuestionDto;
import com.examshield.entity.Question;
import com.examshield.service.ExamService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/questions")
public class QuestionController {

    private final ExamService examService;

    public QuestionController(ExamService examService) {
        this.examService = examService;
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('QUESTION_SETTER', 'ADMIN')")
    public ResponseEntity<Question> updateQuestion(@PathVariable Long id, @Valid @RequestBody QuestionDto dto, Authentication authentication) {
        Question q = examService.updateQuestion(id, dto, authentication.getName());
        return ResponseEntity.ok(q);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('QUESTION_SETTER', 'ADMIN')")
    public ResponseEntity<?> deleteQuestion(@PathVariable Long id, Authentication authentication) {
        examService.deleteQuestion(id, authentication.getName());
        return ResponseEntity.ok(Map.of("message", "Question deleted successfully", "id", id));
    }
}
