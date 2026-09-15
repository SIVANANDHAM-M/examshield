-- ExamShield Database Schema (MySQL 8.x)

CREATE DATABASE IF NOT EXISTS examshield;
USE examshield;

CREATE TABLE IF NOT EXISTS roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS examinations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    exam_name VARCHAR(200) NOT NULL,
    subject VARCHAR(150) NOT NULL,
    course VARCHAR(100) NOT NULL,
    exam_date DATE NOT NULL,
    start_time TIME NOT NULL,
    duration_minutes INT NOT NULL,
    max_marks INT NOT NULL,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    exam_id BIGINT NOT NULL,
    question_number INT NOT NULL,
    question_text TEXT NOT NULL,
    marks INT NOT NULL,
    question_type VARCHAR(30) NOT NULL, -- 'MCQ' or 'DESCRIPTIVE'
    options_json TEXT,
    correct_option VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES examinations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS question_papers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    exam_id BIGINT NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT', -- DRAFT, SUBMITTED, APPROVED, REJECTED, LOCKED, RELEASED, EXAM_STARTED, EXAM_COMPLETED
    submitted_by BIGINT,
    submitted_at TIMESTAMP NULL,
    reviewed_by BIGINT,
    reviewed_at TIMESTAMP NULL,
    reviewer_comments TEXT,
    finalized_by BIGINT,
    finalized_at TIMESTAMP NULL,
    encrypted_content LONGTEXT,
    original_sha256_hash VARCHAR(64),
    scheduled_release_time TIMESTAMP NULL,
    released_at TIMESTAMP NULL,
    released_by BIGINT,
    security_period_active BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (exam_id) REFERENCES examinations(id) ON DELETE CASCADE,
    FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (finalized_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (released_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS paper_integrity_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    paper_id BIGINT NOT NULL,
    recorded_hash VARCHAR(64) NOT NULL,
    verified_hash VARCHAR(64) NOT NULL,
    status VARCHAR(50) NOT NULL, -- MATCH, MISMATCH
    verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_by BIGINT,
    remarks TEXT,
    FOREIGN KEY (paper_id) REFERENCES question_papers(id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS blockchain_blocks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    block_index BIGINT NOT NULL UNIQUE,
    timestamp BIGINT NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    paper_id BIGINT,
    user_id BIGINT,
    username VARCHAR(100),
    data_payload TEXT,
    previous_hash VARCHAR(64) NOT NULL,
    current_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    user_role VARCHAR(100),
    action VARCHAR(100) NOT NULL,
    paper_id BIGINT,
    exam_id BIGINT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    status VARCHAR(50) NOT NULL, -- SUCCESS, FAILED, WARNING
    details TEXT
);

CREATE TABLE IF NOT EXISTS security_alerts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    alert_type VARCHAR(100) NOT NULL,
    severity VARCHAR(30) NOT NULL, -- LOW, MEDIUM, HIGH, CRITICAL
    description TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved BOOLEAN DEFAULT FALSE
);
