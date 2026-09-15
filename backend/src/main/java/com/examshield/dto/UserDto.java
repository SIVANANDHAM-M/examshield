package com.examshield.dto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Safe DTO for User — never exposes passwordHash.
 */
public class UserDto {
    private Long id;
    private String username;
    private String fullName;
    private String email;
    private String department;
    private boolean active;
    private LocalDateTime createdAt;
    private List<String> roles; // e.g. ["ROLE_ADMIN", "ROLE_REVIEWER"]

    public UserDto() {}

    public UserDto(Long id, String username, String fullName, String email,
                   String department, boolean active, LocalDateTime createdAt,
                   List<String> roles) {
        this.id = id;
        this.username = username;
        this.fullName = fullName;
        this.email = email;
        this.department = department;
        this.active = active;
        this.createdAt = createdAt;
        this.roles = roles;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<String> getRoles() { return roles; }
    public void setRoles(List<String> roles) { this.roles = roles; }
}
