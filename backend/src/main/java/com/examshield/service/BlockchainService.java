package com.examshield.service;

import com.examshield.dto.BlockchainVerificationResponse;
import com.examshield.entity.BlockchainBlock;
import com.examshield.repository.BlockchainBlockRepository;
import com.examshield.util.CryptoUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class BlockchainService {

    public static final String GENESIS_PREV_HASH = "0000000000000000000000000000000000000000000000000000000000000000";

    private final BlockchainBlockRepository blockRepository;
    private final SecurityAlertService alertService;

    public BlockchainService(BlockchainBlockRepository blockRepository, SecurityAlertService alertService) {
        this.blockRepository = blockRepository;
        this.alertService = alertService;
    }

    @Transactional
    public void initGenesisBlockIfNeeded() {
        if (blockRepository.count() == 0) {
            long now = System.currentTimeMillis();
            String genesisPayload = "ExamShield Genesis Block - Secure Examination Ledger Initialized";
            String genesisHash = CryptoUtil.calculateBlockHash(0L, now, "GENESIS_BLOCK", null, null, GENESIS_PREV_HASH, genesisPayload);

            BlockchainBlock genesis = new BlockchainBlock(
                    0L,
                    now,
                    "GENESIS_BLOCK",
                    null,
                    null,
                    "SYSTEM",
                    genesisPayload,
                    GENESIS_PREV_HASH,
                    genesisHash
            );
            blockRepository.save(genesis);
        }
    }

    @Transactional
    public synchronized BlockchainBlock addBlock(String eventType, Long paperId, Long userId, String username, String dataPayload) {
        initGenesisBlockIfNeeded();

        BlockchainBlock latest = blockRepository.findTopByOrderByBlockIndexDesc()
                .orElseThrow(() -> new RuntimeException("Genesis block missing"));

        long nextIndex = latest.getBlockIndex() + 1;
        long now = System.currentTimeMillis();
        String prevHash = latest.getCurrentHash();

        String currentHash = CryptoUtil.calculateBlockHash(nextIndex, now, eventType, paperId, userId, prevHash, dataPayload);

        BlockchainBlock newBlock = new BlockchainBlock(
                nextIndex,
                now,
                eventType,
                paperId,
                userId,
                username,
                dataPayload,
                prevHash,
                currentHash
        );

        return blockRepository.save(newBlock);
    }

    @Transactional(readOnly = true)
    public List<BlockchainBlock> getAllBlocks() {
        initGenesisBlockIfNeeded();
        return blockRepository.findAllByOrderByBlockIndexAsc();
    }

    @Transactional(readOnly = true)
    public BlockchainVerificationResponse verifyChain() {
        List<BlockchainBlock> chain = blockRepository.findAllByOrderByBlockIndexAsc();
        if (chain.isEmpty()) {
            return new BlockchainVerificationResponse(true, "VALID", 0, null, "Blockchain is empty", List.of());
        }

        List<String> issues = new ArrayList<>();
        Long invalidIndex = null;

        for (int i = 0; i < chain.size(); i++) {
            BlockchainBlock current = chain.get(i);

            // Verify current hash computation
            String recomputedHash = CryptoUtil.calculateBlockHash(
                    current.getBlockIndex(),
                    current.getTimestamp(),
                    current.getEventType(),
                    current.getPaperId(),
                    current.getUserId(),
                    current.getPreviousHash(),
                    current.getDataPayload()
            );

            if (!recomputedHash.equals(current.getCurrentHash())) {
                issues.add("Block #" + current.getBlockIndex() + " hash mismatch! Recorded: " + current.getCurrentHash() + ", Recalculated: " + recomputedHash);
                if (invalidIndex == null) invalidIndex = current.getBlockIndex();
            }

            // Verify previous hash link
            if (i > 0) {
                BlockchainBlock previous = chain.get(i - 1);
                if (!current.getPreviousHash().equals(previous.getCurrentHash())) {
                    issues.add("Block #" + current.getBlockIndex() + " previousHash (" + current.getPreviousHash() + ") does not match Block #" + previous.getBlockIndex() + " currentHash (" + previous.getCurrentHash() + ")");
                    if (invalidIndex == null) invalidIndex = current.getBlockIndex();
                }
            } else {
                // Genesis block previous hash check
                if (!GENESIS_PREV_HASH.equals(current.getPreviousHash())) {
                    issues.add("Genesis Block #0 has invalid previous hash: " + current.getPreviousHash());
                    if (invalidIndex == null) invalidIndex = 0L;
                }
            }
        }

        if (!issues.isEmpty()) {
            alertService.createAlert("BLOCKCHAIN_TAMPERING_DETECTED", "CRITICAL",
                    "Tampering detected in blockchain ledger! Invalid block: #" + invalidIndex + ". Total issues: " + issues.size());
            return new BlockchainVerificationResponse(false, "TAMPERED", chain.size(), invalidIndex,
                    "Tampering detected! Ledger integrity compromised.", issues);
        }

        return new BlockchainVerificationResponse(true, "VALID", chain.size(), null,
                "Blockchain Status: VALID - All block hashes and cryptographic link proofs verified successfully.", List.of());
    }

    @Transactional
    public BlockchainBlock simulateTamper(Long blockIndex, String alteredData) {
        BlockchainBlock block = blockRepository.findByBlockIndex(blockIndex)
                .orElseThrow(() -> new RuntimeException("Block not found: " + blockIndex));

        // Intentionally alter data without updating currentHash to demonstrate tamper detection
        block.setDataPayload(alteredData != null ? alteredData : "MALICIOUS_ALTERATION: Question paper content secretly changed!");
        BlockchainBlock saved = blockRepository.save(block);

        alertService.createAlert("SIMULATED_LEDGER_TAMPER", "HIGH",
                "Simulated tamper executed on Block #" + blockIndex + " to test tamper detection.");

        return saved;
    }

    @Transactional
    public void restoreBlockchain() {
        List<BlockchainBlock> chain = blockRepository.findAllByOrderByBlockIndexAsc();
        String prevHash = GENESIS_PREV_HASH;

        for (BlockchainBlock block : chain) {
            block.setPreviousHash(prevHash);
            String recomputedHash = CryptoUtil.calculateBlockHash(
                    block.getBlockIndex(),
                    block.getTimestamp(),
                    block.getEventType(),
                    block.getPaperId(),
                    block.getUserId(),
                    block.getPreviousHash(),
                    block.getDataPayload()
            );
            block.setCurrentHash(recomputedHash);
            prevHash = recomputedHash;
            blockRepository.save(block);
        }
    }
}
