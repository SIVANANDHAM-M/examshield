package com.examshield.util;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;

public class CryptoUtil {

    private static final String AES_ALGORITHM = "AES";
    private static final String CIPHER_TRANSFORMATION = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH = 12; // 96-bit IV recommended for GCM
    private static final int GCM_TAG_LENGTH = 128; // in bits

    /**
     * Calculates SHA-256 hash in lowercase hexadecimal string format.
     */
    public static String sha256(String data) {
        if (data == null) {
            data = "";
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

    /**
     * Derives a 256-bit AES SecretKey from any string using SHA-256.
     */
    private static SecretKey deriveKey(String secretKeyStr) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] keyBytes = digest.digest(secretKeyStr.getBytes(StandardCharsets.UTF_8));
            return new SecretKeySpec(keyBytes, AES_ALGORITHM);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Key derivation failed", e);
        }
    }

    /**
     * Encrypts plaintext using AES-256-GCM.
     * Returns Base64 string containing [12 bytes IV + ciphertext with auth tag].
     */
    public static String encryptAes(String plainText, String secretKeyStr) {
        try {
            byte[] iv = new byte[GCM_IV_LENGTH];
            new SecureRandom().nextBytes(iv);

            Cipher cipher = Cipher.getInstance(CIPHER_TRANSFORMATION);
            GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.ENCRYPT_MODE, deriveKey(secretKeyStr), spec);

            byte[] cipherText = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));

            ByteBuffer byteBuffer = ByteBuffer.allocate(iv.length + cipherText.length);
            byteBuffer.put(iv);
            byteBuffer.put(cipherText);

            return Base64.getEncoder().encodeToString(byteBuffer.array());
        } catch (Exception e) {
            throw new RuntimeException("AES Encryption failed: " + e.getMessage(), e);
        }
    }

    /**
     * Decrypts Base64 string containing [12 bytes IV + ciphertext with auth tag] using AES-256-GCM.
     */
    public static String decryptAes(String cipherTextBase64, String secretKeyStr) {
        try {
            byte[] cipherMessage = Base64.getDecoder().decode(cipherTextBase64);
            ByteBuffer byteBuffer = ByteBuffer.wrap(cipherMessage);

            byte[] iv = new byte[GCM_IV_LENGTH];
            byteBuffer.get(iv);

            byte[] cipherText = new byte[byteBuffer.remaining()];
            byteBuffer.get(cipherText);

            Cipher cipher = Cipher.getInstance(CIPHER_TRANSFORMATION);
            GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.DECRYPT_MODE, deriveKey(secretKeyStr), spec);

            byte[] plainTextBytes = cipher.doFinal(cipherText);
            return new String(plainTextBytes, StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("AES Decryption failed: " + e.getMessage(), e);
        }
    }

    /**
     * Calculates SHA-256 hash for a blockchain block.
     */
    public static String calculateBlockHash(Long blockIndex, Long timestamp, String eventType, Long paperId, Long userId, String previousHash, String dataPayload) {
        String input = blockIndex + ":" +
                timestamp + ":" +
                (eventType != null ? eventType : "") + ":" +
                (paperId != null ? paperId : "") + ":" +
                (userId != null ? userId : "") + ":" +
                (previousHash != null ? previousHash : "") + ":" +
                (dataPayload != null ? dataPayload : "");
        return sha256(input);
    }
}
