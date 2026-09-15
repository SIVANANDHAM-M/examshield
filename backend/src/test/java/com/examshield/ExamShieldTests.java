package com.examshield;

import com.examshield.dto.BlockchainVerificationResponse;
import com.examshield.entity.BlockchainBlock;
import com.examshield.service.BlockchainService;
import com.examshield.service.SecurityAlertService;
import com.examshield.util.CryptoUtil;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class ExamShieldTests {

    @Autowired
    private BlockchainService blockchainService;

    @Autowired
    private SecurityAlertService alertService;

    @Test
    void testSha256Hashing() {
        String data = "ExamShield Secure Paper Content";
        String hash1 = CryptoUtil.sha256(data);
        String hash2 = CryptoUtil.sha256(data);
        String hashDifferent = CryptoUtil.sha256("ExamShield Tampered Content");

        Assertions.assertNotNull(hash1);
        Assertions.assertEquals(64, hash1.length());
        Assertions.assertEquals(hash1, hash2);
        Assertions.assertNotEquals(hash1, hashDifferent);
    }

    @Test
    void testAesEncryptionDecryption() {
        String secretKey = "MySuperSecretExamShieldKey2026!";
        String plaintext = "{\"subject\":\"Computer Networks\",\"questions\":[\"What is TCP?\"]}";

        String ciphertext = CryptoUtil.encryptAes(plaintext, secretKey);
        Assertions.assertNotNull(ciphertext);
        Assertions.assertNotEquals(plaintext, ciphertext);

        String decrypted = CryptoUtil.decryptAes(ciphertext, secretKey);
        Assertions.assertEquals(plaintext, decrypted);
    }

    @Test
    void testBlockchainValidationAndTamperDetection() {
        // Blockchain is already seeded with genesis and audit blocks
        BlockchainVerificationResponse initialResponse = blockchainService.verifyChain();
        Assertions.assertTrue(initialResponse.isValid());
        Assertions.assertEquals("VALID", initialResponse.getStatus());

        // Simulate tamper on block #1
        blockchainService.simulateTamper(1L, "TAMPERED_MALICIOUS_DATA");

        // Verify that chain detection flags TAMPERED
        BlockchainVerificationResponse tamperedResponse = blockchainService.verifyChain();
        Assertions.assertFalse(tamperedResponse.isValid());
        Assertions.assertEquals("TAMPERED", tamperedResponse.getStatus());
        Assertions.assertEquals(1L, tamperedResponse.getInvalidBlockIndex());

        // Restore blockchain
        blockchainService.restoreBlockchain();
        BlockchainVerificationResponse restoredResponse = blockchainService.verifyChain();
        Assertions.assertTrue(restoredResponse.isValid());
        Assertions.assertEquals("VALID", restoredResponse.getStatus());
    }
}
