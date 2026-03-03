package com.hlgtech.api.business.controller;

import com.hlgtech.api.auth.model.User;
import com.hlgtech.api.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/businesses")
public class BusinessController {

    @Autowired
    private UserRepository userRepository;

    // Helper: Map User -> Business DTO
    private Map<String, Object> mapUserToBusinessDTO(User user) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", user.getId());
        dto.put("numericId", user.getNumericId());
        
        // Tên hiển thị (Fallback an toàn)
        String displayName = user.getFullName();
        if (displayName == null || displayName.trim().isEmpty()) {
            displayName = user.getUsername();
        }
        if (displayName == null) displayName = "Doanh nghiệp ẩn danh";
        dto.put("name", displayName);

        dto.put("logo", user.getAvatar());
        dto.put("industry", (user.getIndustry() != null && !user.getIndustry().isEmpty()) ? user.getIndustry() : "Đa ngành");
        dto.put("location", (user.getLocation() != null && !user.getLocation().isEmpty()) ? user.getLocation() : "Toàn quốc");
        dto.put("scale", user.getScale() != null ? user.getScale() : "N/A");
        dto.put("established", user.getEstablished() != null ? user.getEstablished() : "N/A");
        dto.put("taxCode", user.getTaxCode() != null ? user.getTaxCode() : "N/A");
        dto.put("description", user.getBio() != null ? user.getBio() : "Chưa có mô tả.");
        dto.put("rating", user.getCredibilityScore() > 0 ? user.getCredibilityScore() : 5.0);
        
        boolean isVerified = false;
        try { isVerified = user.isVerified(); } catch (Exception e) {}
        dto.put("verifyStatus", isVerified ? "VERIFIED" : "PENDING");
        
        return dto;
    }

    @GetMapping
    public List<Map<String, Object>> getAllBusinesses() {
        // Lấy tất cả user
        List<User> allUsers = userRepository.findAll();
        List<Map<String, Object>> businessList = new ArrayList<>();

        System.out.println("Filtering businesses from " + allUsers.size() + " users...");

        for (User user : allUsers) {
            try {
                Object roleObj = user.getRole();
                String roleStr = (roleObj != null) ? roleObj.toString().toUpperCase() : "";
                
                // DATA FILTERING LOGIC: Chỉ lấy Business
                if (roleStr.contains("BUSINESS") || roleStr.equals("3") || roleStr.contains("EMPLOYER")) {
                    businessList.add(mapUserToBusinessDTO(user));
                }
            } catch (Exception e) {
                System.err.println("Error processing user " + user.getId());
            }
        }
        
        System.out.println("Returning " + businessList.size() + " businesses.");
        return businessList;
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getBusinessDetail(@PathVariable String id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(mapUserToBusinessDTO(userOpt.get()));
    }
}
