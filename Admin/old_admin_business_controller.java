package com.hlgtech.api.business.controller;

import com.hlgtech.api.auth.model.Role;
import com.hlgtech.api.auth.model.User;
import com.hlgtech.api.auth.repository.UserRepository;
import com.hlgtech.api.core.ResponseObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/businesses")
@PreAuthorize("hasRole('ADMIN')")
public class AdminBusinessController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.hlgtech.api.auth.repository.MemberActivityRepository activityRepository;

    @Autowired
    private com.hlgtech.api.job.repository.JobRepository jobRepository;

    @Autowired
    private com.hlgtech.api.worksession.repository.WorkSessionRepository workSessionRepository;

    @Autowired
    private com.hlgtech.api.notification.service.NotificationService notificationService;

    // GET /api/admin/businesses?status=PENDING
    @GetMapping
    public ResponseObject getBusinesses(@RequestParam(required = false) String status) {
        List<User> allBusinesses = userRepository.findAll().stream()
                .filter(user -> {
                    Object roleObj = user.getRole();
                    String roleStr = (roleObj != null) ? roleObj.toString().toUpperCase() : "";
                    return roleStr.contains("BUSINESS") || roleStr.equals("3") || roleStr.contains("EMPLOYER");
                })
                .collect(Collectors.toList());

        // Filter by verification status if provided
        if (status != null && !status.isEmpty()) {
            allBusinesses = allBusinesses.stream()
                    .filter(user -> {
                        if ("PENDING".equalsIgnoreCase(status)) {
                            return !user.isVerified();
                        } else if ("VERIFIED".equalsIgnoreCase(status)) {
                            return user.isVerified();
                        }
                        return true;
                    })
                    .collect(Collectors.toList());
        }

        List<Map<String, Object>> result = allBusinesses.stream()
                .map(this::mapToBusinessDTO)
                .collect(Collectors.toList());

        return new ResponseObject(200, result, "Businesses retrieved successfully");
    }

    // GET /api/admin/businesses/{id}/kyc
    @GetMapping("/{id}/kyc")
    public ResponseObject getBusinessKYC(@PathVariable String id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return new ResponseObject(404, null, "Business not found");
        }

        User business = userOpt.get();
        Map<String, Object> kycData = new HashMap<>();
        kycData.put("id", business.getId());
        kycData.put("name", business.getFullName() != null ? business.getFullName() : business.getUsername());
        kycData.put("username", business.getUsername());
        kycData.put("email", business.getEmail());
        kycData.put("phone", business.getPhone());
        kycData.put("avatar", business.getAvatar());
        kycData.put("taxCode", business.getTaxCode());
        kycData.put("industry", business.getIndustry());
        kycData.put("location", business.getLocation());
        kycData.put("scale", business.getScale());
        kycData.put("established", business.getEstablished());
        kycData.put("bio", business.getBio());
        kycData.put("verified", business.isVerified());
        kycData.put("verifyStatus", business.isVerified() ? "VERIFIED" : "PENDING");
        kycData.put("badge", business.getBadge());
        kycData.put("status", business.getStatus());
        kycData.put("createdAt", business.getCreatedAt());

        // Jobs posted by this business
        kycData.put("jobs", jobRepository.findByBusinessId(id));

        // Activities
        kycData.put("activities", activityRepository.findByUserIdOrderByTimestampDesc(id));

        // Work Sessions (History of people who worked for this business)
        kycData.put("workSessions", workSessionRepository.findByBusinessId(id));

        return new ResponseObject(200, kycData, "Business detail retrieved");
    }

    // POST /api/admin/businesses/{id}/verify
    @PostMapping("/{id}/verify")
    public ResponseObject verifyBusiness(
            @PathVariable String id,
            @RequestBody Map<String, String> request) {

        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return new ResponseObject(404, null, "Business not found");
        }

        User business = userOpt.get();
        String status = request.get("status");
        String reason = request.get("reason");

        // Get current admin user ID from security context (simplified - using business
        // ID for now)
        String adminId = id; // TODO: Get actual admin ID from SecurityContext

        if ("VERIFIED".equalsIgnoreCase(status)) {
            business.setVerified(true);
            business.setBadge("VERIFIED"); // Blue tick badge
            userRepository.save(business);

            // Log activity
            com.hlgtech.api.auth.model.MemberActivity activity = new com.hlgtech.api.auth.model.MemberActivity(
                    adminId,
                    "VERIFY_BUSINESS",
                    "Duyß╗çt x├íc thß╗▒c doanh nghiß╗çp: "
                            + (business.getFullName() != null ? business.getFullName() : business.getUsername()));
            activityRepository.save(activity);

            // Create notification for business
            notificationService.createNotification(
                    "BUSINESS_VERIFIED",
                    "Doanh nghiß╗çp ─æ├ú ─æ╞░ß╗úc x├íc thß╗▒c",
                    "Ch├║c mß╗½ng! Doanh nghiß╗çp cß╗ºa bß║ín ─æ├ú ─æ╞░ß╗úc x├íc thß╗▒c th├ánh c├┤ng. Bß║ín c├│ thß╗â bß║»t ─æß║ºu ─æ─âng tin tuyß╗ân dß╗Ñng.",
                    "fa-check-circle",
                    "#10B981", // Green
                    id, // relatedId = businessId
                    "BUSINESS",
                    "/business/profile",
                    true // isImportant
            );

            return new ResponseObject(200, mapToBusinessDTO(business),
                    "Business verified successfully");
        } else if ("REJECTED".equalsIgnoreCase(status)) {
            business.setVerified(false);
            business.setBadge(null); // Remove badge
            userRepository.save(business);

            // Log activity
            com.hlgtech.api.auth.model.MemberActivity activity = new com.hlgtech.api.auth.model.MemberActivity(
                    adminId,
                    "REJECT_BUSINESS",
                    "Tß╗½ chß╗æi x├íc thß╗▒c doanh nghiß╗çp: "
                            + (business.getFullName() != null ? business.getFullName() : business.getUsername()) +
                            (reason != null ? " - L├╜ do: " + reason : ""));
            activityRepository.save(activity);

            // Create notification for business with REASON
            String notifMessage = "Y├¬u cß║ºu x├íc thß╗▒c doanh nghiß╗çp cß╗ºa bß║ín ─æ├ú bß╗ï tß╗½ chß╗æi.";
            if (reason != null && !reason.isEmpty()) {
                notifMessage += " L├╜ do: " + reason;
            }
            notifMessage += " Vui l├▓ng kiß╗âm tra v├á gß╗¡i lß║íi hß╗ô s╞í.";

            notificationService.createNotification(
                    "BUSINESS_REJECTED",
                    "X├íc thß╗▒c bß╗ï tß╗½ chß╗æi",
                    notifMessage,
                    "fa-times-circle",
                    "#EF4444", // Red
                    id, // relatedId = businessId
                    "BUSINESS",
                    "/business/verification",
                    true // isImportant
            );

            return new ResponseObject(200, mapToBusinessDTO(business),
                    "Business verification rejected: " + reason);
        } else if ("UNVERIFY".equalsIgnoreCase(status)) {
            business.setVerified(false);
            business.setBadge(null); // Remove verified badge
            userRepository.save(business);

            // Log activity
            com.hlgtech.api.auth.model.MemberActivity activity = new com.hlgtech.api.auth.model.MemberActivity(
                    adminId,
                    "UNVERIFY_BUSINESS",
                    "Hß╗ºy x├íc thß╗▒c doanh nghiß╗çp: "
                            + (business.getFullName() != null ? business.getFullName() : business.getUsername()) +
                            (reason != null ? " - L├╜ do: " + reason : ""));
            activityRepository.save(activity);

            // Create notification for business with REASON
            String notifMessage = "Doanh nghiß╗çp cß╗ºa bß║ín ─æ├ú bß╗ï hß╗ºy x├íc thß╗▒c.";
            if (reason != null && !reason.isEmpty()) {
                notifMessage += " L├╜ do: " + reason;
            }
            notifMessage += " Vui l├▓ng cß║¡p nhß║¡t th├┤ng tin v├á gß╗¡i lß║íi y├¬u cß║ºu x├íc thß╗▒c.";

            notificationService.createNotification(
                    "BUSINESS_UNVERIFIED",
                    "─É├ú hß╗ºy x├íc thß╗▒c doanh nghiß╗çp",
                    notifMessage,
                    "fa-exclamation-triangle",
                    "#F59E0B", // Orange/Warning
                    id, // relatedId = businessId
                    "BUSINESS",
                    "/business/verification",
                    true // isImportant
            );

            return new ResponseObject(200, mapToBusinessDTO(business),
                    "Business unverified successfully" + (reason != null ? ": " + reason : ""));
        }

        return new ResponseObject(400, null, "Invalid status");
    }

    private Map<String, Object> mapToBusinessDTO(User user) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", user.getId());
        dto.put("name", user.getFullName() != null ? user.getFullName() : user.getUsername());
        dto.put("email", user.getEmail());
        dto.put("logo", user.getAvatar());
        dto.put("industry", user.getIndustry());
        dto.put("location", user.getLocation());
        dto.put("scale", user.getScale());
        dto.put("established", user.getEstablished());
        dto.put("taxCode", user.getTaxCode());
        dto.put("description", user.getBio());
        dto.put("rating", user.getRating() != null ? user.getRating() : 0.0);
        dto.put("verified", user.isVerified());
        dto.put("verifyStatus", user.isVerified() ? "VERIFIED" : "PENDING");
        dto.put("badge", user.getBadge());
        dto.put("createdAt", user.getCreatedAt());
        return dto;
    }
}
