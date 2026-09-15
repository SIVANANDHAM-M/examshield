package com.examshield.controller;

import com.examshield.dto.JwtAuthResponse;
import com.examshield.dto.LoginRequest;
import com.examshield.dto.RegisterRequest;
import com.examshield.entity.User;
import com.examshield.repository.UserRepository;
import com.examshield.security.JwtTokenProvider;
import com.examshield.service.AuditLogService;
import com.examshield.service.SecurityAlertService;
import com.examshield.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final UserService userService;
    private final AuditLogService auditLogService;
    private final SecurityAlertService alertService;

    // Track failed login attempts per username
    private final Map<String, AtomicInteger> failedAttempts = new ConcurrentHashMap<>();

    public AuthController(AuthenticationManager authenticationManager,
                          JwtTokenProvider tokenProvider,
                          UserRepository userRepository,
                          UserService userService,
                          AuditLogService auditLogService,
                          SecurityAlertService alertService) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.userRepository = userRepository;
        this.userService = userService;
        this.auditLogService = auditLogService;
        this.alertService = alertService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest, HttpServletRequest request) {
        String clientIp = request.getRemoteAddr();
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = tokenProvider.generateToken(authentication);

            User user = userRepository.findByUsername(loginRequest.getUsername()).orElseThrow();
            List<String> roles = authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .toList();

            failedAttempts.remove(loginRequest.getUsername());

            auditLogService.log(user.getUsername(), roles.isEmpty() ? "USER" : roles.get(0),
                    "USER_LOGIN", null, null, clientIp, "SUCCESS", "User authenticated successfully");

            return ResponseEntity.ok(new JwtAuthResponse(
                    jwt,
                    user.getId(),
                    user.getUsername(),
                    user.getFullName(),
                    user.getEmail(),
                    roles
            ));
        } catch (BadCredentialsException ex) {
            int attempts = failedAttempts.computeIfAbsent(loginRequest.getUsername(), k -> new AtomicInteger(0)).incrementAndGet();

            auditLogService.log(loginRequest.getUsername(), "ANONYMOUS",
                    "LOGIN_FAILED", null, null, clientIp, "FAILED", "Failed attempt #" + attempts);

            if (attempts >= 3) {
                alertService.createAlert("MULTIPLE_FAILED_LOGINS", "HIGH",
                        "3 or more consecutive failed login attempts for account: " + loginRequest.getUsername() + " from IP: " + clientIp);
            }

            throw ex;
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest registerRequest) {
        User user = userService.createUser(registerRequest);
        return ResponseEntity.ok(Map.of(
                "message", "User registered successfully",
                "username", user.getUsername()
        ));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        User user = userRepository.findByUsername(authentication.getName()).orElseThrow();
        List<String> roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        return ResponseEntity.ok(new JwtAuthResponse(
                null,
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getEmail(),
                roles
        ));
    }
}
