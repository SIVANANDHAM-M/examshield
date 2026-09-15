package com.examshield.controller;

import com.examshield.dto.BlockchainVerificationResponse;
import com.examshield.entity.BlockchainBlock;
import com.examshield.service.BlockchainService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/blockchain")
public class BlockchainController {

    private final BlockchainService blockchainService;

    public BlockchainController(BlockchainService blockchainService) {
        this.blockchainService = blockchainService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('AUDITOR', 'EXAM_CONTROLLER', 'ADMIN')")
    public ResponseEntity<List<BlockchainBlock>> getBlocks() {
        return ResponseEntity.ok(blockchainService.getAllBlocks());
    }

    @GetMapping("/verify")
    @PreAuthorize("hasAnyRole('AUDITOR', 'EXAM_CONTROLLER', 'ADMIN')")
    public ResponseEntity<BlockchainVerificationResponse> verifyBlockchain() {
        return ResponseEntity.ok(blockchainService.verifyChain());
    }

    @PostMapping("/tamper")
    @PreAuthorize("hasAnyRole('AUDITOR', 'ADMIN')")
    public ResponseEntity<?> simulateTamper(@RequestBody(required = false) Map<String, Object> body) {
        Long blockIndex = body != null && body.containsKey("blockIndex") ? Long.valueOf(body.get("blockIndex").toString()) : 1L;
        String payload = body != null && body.containsKey("payload") ? body.get("payload").toString() : "MALICIOUS_ALTERATION: Question paper content secretly changed!";
        BlockchainBlock tampered = blockchainService.simulateTamper(blockIndex, payload);
        return ResponseEntity.ok(Map.of("message", "Tamper simulated on block #" + blockIndex, "block", tampered));
    }

    @PostMapping("/restore")
    @PreAuthorize("hasAnyRole('AUDITOR', 'ADMIN')")
    public ResponseEntity<?> restoreBlockchain() {
        blockchainService.restoreBlockchain();
        return ResponseEntity.ok(Map.of("message", "Blockchain cryptographic integrity restored"));
    }
}
