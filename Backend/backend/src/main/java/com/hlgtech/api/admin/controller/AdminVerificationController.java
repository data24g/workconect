package com.hlgtech.api.admin.controller;

import com.hlgtech.api.auth.model.User;
import com.hlgtech.api.auth.model.VerificationStatus;
import com.hlgtech.api.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/verifications")
public class AdminVerificationController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/pending")
    public ResponseEntity<List<User>> getPendingVerifications() {
        return ResponseEntity.ok(userRepository.findByVerificationStatus(VerificationStatus.PENDING));
    }

    @PostMapping("/{userId}/approve")
    public ResponseEntity<?> approveVerification(@PathVariable String userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) return ResponseEntity.notFound().build();

        User user = userOpt.get();
        user.setVerificationStatus(VerificationStatus.APPROVED);
        user.setVerified(true);
        user.setEmailVerified(true);
        user.setPhoneVerified(true);
        user.setIdCardVerified(true);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "User verified successfully"));
    }

    @PostMapping("/{userId}/reject")
    public ResponseEntity<?> rejectVerification(@PathVariable String userId, @RequestBody Map<String, String> body) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) return ResponseEntity.notFound().build();

        User user = userOpt.get();
        user.setVerificationStatus(VerificationStatus.REJECTED);
        user.setVerified(false);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "User verification rejected", "reason", body.getOrDefault("reason", "No reason provided")));
    }
}
