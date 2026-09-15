package com.examshield.controller;

import com.examshield.dto.UserDto;
import com.examshield.entity.User;
import com.examshield.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // ── helper: convert entity → safe DTO ──────────────────────────────────
    private UserDto toDto(User u) {
        List<String> roleNames = u.getRoles().stream()
                .map(r -> r.getName().name())   // e.g. "ROLE_ADMIN"
                .collect(Collectors.toList());
        return new UserDto(
                u.getId(),
                u.getUsername(),
                u.getFullName(),
                u.getEmail(),
                u.getDepartment(),
                u.isActive(),
                u.getCreatedAt(),
                roleNames
        );
    }

    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers() {
        List<UserDto> dtos = userService.getAllUsers()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<UserDto> toggleStatus(@PathVariable Long id, Authentication authentication) {
        User user = userService.toggleUserStatus(id, authentication.getName());
        return ResponseEntity.ok(toDto(user));
    }

    @PutMapping("/{id}/roles")
    public ResponseEntity<UserDto> updateRoles(@PathVariable Long id,
                                               @RequestBody Map<String, Set<String>> body,
                                               Authentication authentication) {
        Set<String> roles = body.get("roles");
        User user = userService.updateUserRoles(id, roles, authentication.getName());
        return ResponseEntity.ok(toDto(user));
    }
}
