package com.hlgtech.api.admin.controller;

import com.hlgtech.api.admin.service.AdminAuditService;
import com.hlgtech.api.auth.model.Role;
import com.hlgtech.api.auth.model.User;
import com.hlgtech.api.auth.model.UserStatus;
import com.hlgtech.api.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.hlgtech.api.admin.model.MemberActivity;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AdminAuditService auditService;

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers(
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) String search) {

        List<User> users = userRepository.findAll();

        if (role != null) {
            users = users.stream()
                    .filter(u -> u.getRole() == role)
                    .collect(Collectors.toList());
        }

        if (search != null && !search.isEmpty()) {
            String lowerSearch = search.toLowerCase();
            users = users.stream()
                    .filter(u -> (u.getFullName() != null && u.getFullName().toLowerCase().contains(lowerSearch)) ||
                            (u.getEmail() != null && u.getEmail().toLowerCase().contains(lowerSearch)) ||
                            (u.getUsername() != null && u.getUsername().toLowerCase().contains(lowerSearch)))
                    .collect(Collectors.toList());
        }

        return ResponseEntity.ok(users);
    }

    @PutMapping("/{userId}/status")
    public ResponseEntity<?> updateUserStatus(
            @PathVariable String userId,
            @RequestParam UserStatus status,
            @RequestParam(required = false) String reason) {

        return userRepository.findById(userId).map(user -> {
            UserStatus oldStatus = user.getStatus();
            user.setStatus(status);
            userRepository.save(user);

            String detail = String.format("Thay đổi trạng thái người dùng %s từ %s sang %s. Lý do: %s",
                    user.getEmail(), oldStatus, status, reason != null ? reason : "Không có");
            auditService.logActivity(userId, "UPDATE_USER_STATUS", detail);

            return ResponseEntity.ok(user);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{userId}/badge")
    public ResponseEntity<?> updateBadge(
            @PathVariable String userId,
            @RequestParam(required = false) String badge) {

        return userRepository.findById(userId).map(user -> {
            user.setBadge(badge);
            userRepository.save(user);

            auditService.logActivity(userId, "UPDATE_USER_BADGE",
                    "Cập nhật huy hiệu cho " + user.getEmail() + ": " + (badge != null ? badge : "Gỡ bỏ"));

            return ResponseEntity.ok(user);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{userId}/premium")
    public ResponseEntity<?> updatePremium(
            @PathVariable String userId,
            @RequestParam boolean isPremium) {

        return userRepository.findById(userId).map(user -> {
            user.setPremium(isPremium);
            userRepository.save(user);

            auditService.logActivity(userId, "UPDATE_USER_PREMIUM",
                    "Cập nhật trạng thái Premium cho " + user.getEmail() + ": " + isPremium);

            return ResponseEntity.ok(user);
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{userId}/worker-profile")
    public ResponseEntity<?> getWorkerProfile(@PathVariable String userId) {
        return userRepository.findById(userId).map(user -> {
            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("id", user.getId());
            response.put("fullName", user.getFullName());
            response.put("username", user.getUsername());
            response.put("email", user.getEmail());
            response.put("phone", user.getPhone());
            response.put("avatar", user.getAvatar());
            response.put("role", user.getRole());
            response.put("status", user.getStatus());
            response.put("credibilityScore", user.getCredibilityScore());
            response.put("createdAt", user.getCreatedAt());
            response.put("bio", user.getBio());
            response.put("skills", user.getSkills());
            response.put("location", user.getLocation());
            response.put("education", user.getEducation());
            response.put("badge", user.getBadge());
            response.put("isPremium", user.isPremium());

            // Add activities
            response.put("activities", auditService.getLogsByUser(userId));

            return ResponseEntity.ok(response);
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{userId}/activities")
    public ResponseEntity<List<MemberActivity>> getActivities(@PathVariable String userId) {
        return ResponseEntity.ok(auditService.getLogsByUser(userId));
    }

    @PutMapping("/{userId}/warn")
    public ResponseEntity<?> warnUser(@PathVariable String userId) {
        return userRepository.findById(userId).map(user -> {
            user.setStatus(UserStatus.WARNING);
            userRepository.save(user);
            auditService.logActivity(userId, "USER_WARN", "Cảnh báo người dùng " + user.getEmail());
            return ResponseEntity.ok(user);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{userId}/ban")
    public ResponseEntity<?> banUser(@PathVariable String userId) {
        return userRepository.findById(userId).map(user -> {
            user.setStatus(UserStatus.BANNED);
            userRepository.save(user);
            auditService.logActivity(userId, "USER_BAN", "Cấm người dùng " + user.getEmail());
            return ResponseEntity.ok(user);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{userId}/activate")
    public ResponseEntity<?> activateUser(@PathVariable String userId) {
        return userRepository.findById(userId).map(user -> {
            user.setStatus(UserStatus.ACTIVE);
            userRepository.save(user);
            auditService.logActivity(userId, "USER_ACTIVATE", "Kích hoạt lại người dùng " + user.getEmail());
            return ResponseEntity.ok(user);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{userId}/disable")
    public ResponseEntity<?> disableUser(@PathVariable String userId) {
        return userRepository.findById(userId).map(user -> {
            user.setStatus(UserStatus.INACTIVE);
            userRepository.save(user);
            auditService.logActivity(userId, "USER_DISABLE", "Vô hiệu hóa người dùng " + user.getEmail());
            return ResponseEntity.ok(user);
        }).orElse(ResponseEntity.notFound().build());
    }
}
