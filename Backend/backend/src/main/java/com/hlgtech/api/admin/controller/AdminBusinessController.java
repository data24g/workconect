package com.hlgtech.api.admin.controller;

import com.hlgtech.api.admin.service.AdminAuditService;
import com.hlgtech.api.auth.model.User;
import com.hlgtech.api.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/businesses")
@PreAuthorize("hasRole('ADMIN')")
public class AdminBusinessController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AdminAuditService auditService;

    // We don't use BusinessRepository anymore since business data is in User
    // collection
    // @Autowired private BusinessRepository businessRepository;

    @GetMapping
    public ResponseEntity<List<java.util.Map<String, Object>>> getAllBusinesses(
            @RequestParam(required = false) com.hlgtech.api.auth.model.VerificationStatus status) {

        List<User> businessUsers;
        if (status != null) {
            // Find by role BUSINESS and status
            businessUsers = userRepository.findByVerificationStatus(status).stream()
                    .filter(u -> u.getRole() == com.hlgtech.api.auth.model.Role.BUSINESS)
                    .collect(java.util.stream.Collectors.toList());
        } else {
            businessUsers = userRepository.findByRole(com.hlgtech.api.auth.model.Role.BUSINESS);
        }

        List<java.util.Map<String, Object>> result = businessUsers.stream().map(user -> {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", user.getId());
            map.put("name", user.getCompanyName() != null ? user.getCompanyName() : user.getFullName());
            map.put("email", user.getEmail());
            map.put("logo", user.getAvatar());
            map.put("industry", user.getIndustry());
            map.put("location", user.getLocation());
            map.put("verified", user.isVerified());
            map.put("verifyStatus", user.getVerificationStatus());
            map.put("verificationStatus", user.getVerificationStatus());
            map.put("taxCode", user.getTaxCode());
            map.put("scale", user.getScale());
            map.put("established", user.getEstablished());
            map.put("bio", user.getBio());
            map.put("website", user.getWebsite());
            // Add other necessary fields
            return map;
        }).collect(java.util.stream.Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}/kyc")
    public ResponseEntity<?> getBusinessDetails(@PathVariable String id) {
        return userRepository.findById(id).map(user -> {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", user.getId());
            map.put("name", user.getCompanyName() != null ? user.getCompanyName() : user.getFullName());
            map.put("email", user.getEmail());
            map.put("logo", user.getAvatar());
            map.put("industry", user.getIndustry());
            map.put("location", user.getLocation());
            map.put("verified", user.isVerified());
            map.put("verifyStatus", user.getVerificationStatus());
            map.put("verificationStatus", user.getVerificationStatus());
            map.put("taxCode", user.getTaxCode());
            map.put("scale", user.getScale());
            map.put("established", user.getEstablished());
            map.put("bio", user.getBio());
            map.put("phone", user.getPhone());
            map.put("website", user.getWebsite());
            map.put("legalRepresentative", user.getLegalRepresentative());
            map.put("businessRegistrationCode", user.getBusinessRegistrationCode());
            // Map other fields needed for KYC modal
            return ResponseEntity.ok(map);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{userId}/verify")
    public ResponseEntity<?> verifyBusinessAction(@PathVariable String userId,
            @RequestBody java.util.Map<String, String> request) {
        String status = request.get("status");
        String reason = request.get("reason");

        return userRepository.findById(userId).map(user -> {
            if ("VERIFIED".equals(status)) {
                user.setVerified(true);
                user.setBadge("VERIFIED");
                user.setVerificationStatus(com.hlgtech.api.auth.model.VerificationStatus.APPROVED);
                auditService.logActivity(userId, "VERIFY_BUSINESS", "Duyệt doanh nghiệp: " + user.getCompanyName());
            } else if ("REJECTED".equals(status) || "DENIED".equals(status)) {
                user.setVerified(false);
                user.setBadge(null);
                user.setVerificationStatus(com.hlgtech.api.auth.model.VerificationStatus.REJECTED);
                auditService.logActivity(userId, "REJECT_BUSINESS",
                        "Từ chối doanh nghiệp: " + user.getCompanyName() + ". Lý do: " + reason);
            } else if ("UNVERIFY".equals(status)) {
                user.setVerified(false);
                user.setBadge(null);
                user.setVerificationStatus(com.hlgtech.api.auth.model.VerificationStatus.PENDING);
                auditService.logActivity(userId, "UNVERIFY_BUSINESS",
                        "Hủy xác thực doanh nghiệp: " + user.getCompanyName() + ". Lý do: " + reason);
            }

            userRepository.save(user);
            return ResponseEntity.ok(java.util.Map.of("message", "Success", "data", user));
        }).orElse(ResponseEntity.notFound().build());
    }
}
