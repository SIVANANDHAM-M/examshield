package com.examshield.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "blockchain_blocks")
public class BlockchainBlock {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long blockIndex;

    @Column(nullable = false)
    private Long timestamp; // Epoch millisecond

    @Column(nullable = false, length = 100)
    private String eventType;

    private Long paperId;

    private Long userId;

    @Column(length = 100)
    private String username;

    @Column(columnDefinition = "TEXT")
    private String dataPayload;

    @Column(nullable = false, length = 64)
    private String previousHash;

    @Column(nullable = false, length = 64)
    private String currentHash;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public BlockchainBlock() {}

    public BlockchainBlock(Long blockIndex, Long timestamp, String eventType, Long paperId, Long userId, String username, String dataPayload, String previousHash, String currentHash) {
        this.blockIndex = blockIndex;
        this.timestamp = timestamp;
        this.eventType = eventType;
        this.paperId = paperId;
        this.userId = userId;
        this.username = username;
        this.dataPayload = dataPayload;
        this.previousHash = previousHash;
        this.currentHash = currentHash;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getBlockIndex() { return blockIndex; }
    public void setBlockIndex(Long blockIndex) { this.blockIndex = blockIndex; }

    public Long getTimestamp() { return timestamp; }
    public void setTimestamp(Long timestamp) { this.timestamp = timestamp; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public Long getPaperId() { return paperId; }
    public void setPaperId(Long paperId) { this.paperId = paperId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getDataPayload() { return dataPayload; }
    public void setDataPayload(String dataPayload) { this.dataPayload = dataPayload; }

    public String getPreviousHash() { return previousHash; }
    public void setPreviousHash(String previousHash) { this.previousHash = previousHash; }

    public String getCurrentHash() { return currentHash; }
    public void setCurrentHash(String currentHash) { this.currentHash = currentHash; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
