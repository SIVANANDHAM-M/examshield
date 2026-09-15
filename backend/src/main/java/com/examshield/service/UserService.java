package com.examshield.service;

import com.examshield.dto.RegisterRequest;
import com.examshield.entity.Role;
import com.examshield.entity.RoleName;
import com.examshield.entity.User;
import com.examshield.exception.BadRequestException;
import com.examshield.exception.ResourceNotFoundException;
import com.examshield.repository.RoleRepository;
import com.examshield.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    public UserService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder,
                       AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional(readOnly = true)
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    @Transactional
    public User createUser(RegisterRequest req) {
        if (userRepository.existsByUsername(req.getUsername())) {
            throw new BadRequestException("Username already taken: " + req.getUsername());
        }
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new BadRequestException("Email already in use: " + req.getEmail());
        }

        User user = new User(
                req.getUsername(),
                req.getFullName(),
                req.getEmail(),
                passwordEncoder.encode(req.getPassword()),
                req.getDepartment()
        );

        Set<Role> roles = new HashSet<>();
        if (req.getRoles() != null && !req.getRoles().isEmpty()) {
            for (String rName : req.getRoles()) {
                RoleName rn = RoleName.valueOf(rName.startsWith("ROLE_") ? rName : "ROLE_" + rName);
                Role role = roleRepository.findByName(rn)
                        .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + rName));
                roles.add(role);
            }
        } else {
            Role defaultRole = roleRepository.findByName(RoleName.ROLE_QUESTION_SETTER)
                    .orElseThrow(() -> new ResourceNotFoundException("Default role not found"));
            roles.add(defaultRole);
        }
        user.setRoles(roles);

        User saved = userRepository.save(user);

        auditLogService.log("ADMIN", "ADMIN", "USER_CREATED", null, null, "127.0.0.1", "SUCCESS",
                "New user registered: " + saved.getUsername());

        return saved;
    }

    @Transactional
    public User toggleUserStatus(Long userId, String adminUsername) {
        User user = getUserById(userId);
        user.setActive(!user.isActive());
        User saved = userRepository.save(user);

        auditLogService.log(adminUsername, "ADMIN", "USER_STATUS_TOGGLED", null, null, "127.0.0.1", "SUCCESS",
                "User " + user.getUsername() + " active status set to: " + user.isActive());

        return saved;
    }

    @Transactional
    public User updateUserRoles(Long userId, Set<String> roleNames, String adminUsername) {
        User user = getUserById(userId);
        Set<Role> roles = new HashSet<>();
        for (String rName : roleNames) {
            RoleName rn = RoleName.valueOf(rName.startsWith("ROLE_") ? rName : "ROLE_" + rName);
            Role role = roleRepository.findByName(rn)
                    .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + rName));
            roles.add(role);
        }
        user.setRoles(roles);
        User saved = userRepository.save(user);

        auditLogService.log(adminUsername, "ADMIN", "USER_ROLES_UPDATED", null, null, "127.0.0.1", "SUCCESS",
                "Roles updated for " + user.getUsername() + ": " + roleNames);

        return saved;
    }
}
