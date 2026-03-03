package com.hlgtech.api.auth.controller;

import com.hlgtech.api.auth.model.User;
import com.hlgtech.api.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable String id) {
        return userRepository.findById(id)
                .map(user -> {
                    if (user.getNumericId() == null) {
                        user.setNumericId(10000000L + (long) (Math.random() * 90000000L));
                        userRepository.save(user);
                    }
                    return ResponseEntity.ok(user);
                })
                .orElse(ResponseEntity.notFound().build());
    }


    // API Cập nhật thông tin User theo ID
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable String id, @RequestBody Map<String, Object> updates) {
        Optional<User> userOpt = userRepository.findById(id);

        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();

        // Cập nhật các trường thông tin cơ bản
        if (updates.containsKey("fullName")) user.setFullName((String) updates.get("fullName"));
        if (updates.containsKey("bio")) user.setBio((String) updates.get("bio"));
        if (updates.containsKey("avatar")) user.setAvatar((String) updates.get("avatar"));
        if (updates.containsKey("location")) user.setLocation((String) updates.get("location"));
        if (updates.containsKey("industry")) user.setIndustry((String) updates.get("industry"));
        if (updates.containsKey("scale")) user.setScale((String) updates.get("scale"));
        if (updates.containsKey("established")) user.setEstablished((String) updates.get("established"));
        if (updates.containsKey("taxCode")) user.setTaxCode((String) updates.get("taxCode"));
        if (updates.containsKey("badge")) user.setBadge((String) updates.get("badge"));
        if (updates.containsKey("phone")) user.setPhone((String) updates.get("phone"));
        if (updates.containsKey("coverPhoto")) user.setCoverPhoto((String) updates.get("coverPhoto"));
        if (updates.containsKey("dob")) user.setDob((String) updates.get("dob"));
        if (updates.containsKey("gender")) user.setGender((String) updates.get("gender"));
        if (updates.containsKey("address")) user.setAddress((String) updates.get("address"));
        if (updates.containsKey("title")) user.setTitle((String) updates.get("title"));
        if (updates.containsKey("description")) user.setDescription((String) updates.get("description"));
        if (updates.containsKey("education")) user.setEducation((String) updates.get("education"));
        if (updates.containsKey("companyName")) user.setCompanyName((String) updates.get("companyName"));
        if (updates.containsKey("businessRegistrationCode")) user.setBusinessRegistrationCode((String) updates.get("businessRegistrationCode"));
        if (updates.containsKey("legalRepresentative")) user.setLegalRepresentative((String) updates.get("legalRepresentative"));
        if (updates.containsKey("emailVerified")) user.setEmailVerified((Boolean) updates.get("emailVerified"));
        if (updates.containsKey("phoneVerified")) user.setPhoneVerified((Boolean) updates.get("phoneVerified"));
        if (updates.containsKey("idCardVerified")) user.setIdCardVerified((Boolean) updates.get("idCardVerified"));
        if (updates.containsKey("verificationStatus")) {
            user.setVerificationStatus(com.hlgtech.api.auth.model.VerificationStatus.valueOf((String) updates.get("verificationStatus")));
        }
        if (updates.containsKey("verified")) user.setVerified((Boolean) updates.get("verified"));
        if (updates.containsKey("website")) user.setWebsite((String) updates.get("website"));
        
        // Handle skills list safely if presented
        if (updates.containsKey("skills") && updates.get("skills") instanceof java.util.List) {
             user.setSkills((java.util.List<String>) updates.get("skills"));
        }

        userRepository.save(user);

        return ResponseEntity.ok(user);
    }

    @PostMapping("/{id}/verify")
    public ResponseEntity<?> submitVerification(@PathVariable String id, @RequestBody Map<String, Object> verificationData) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) return ResponseEntity.notFound().build();

        User user = userOpt.get();
        
        // Update user info with verification data
        if (verificationData.containsKey("taxCode")) user.setTaxCode((String) verificationData.get("taxCode"));
        if (verificationData.containsKey("companyName")) user.setCompanyName((String) verificationData.get("companyName"));
        if (verificationData.containsKey("businessRegCode")) user.setBusinessRegistrationCode((String) verificationData.get("businessRegCode"));
        if (verificationData.containsKey("legalRepresentative")) user.setLegalRepresentative((String) verificationData.get("legalRepresentative"));
        if (verificationData.containsKey("phone")) user.setPhone((String) verificationData.get("phone"));
        if (verificationData.containsKey("email")) user.setEmail((String) verificationData.get("email"));
        if (verificationData.containsKey("website")) user.setWebsite((String) verificationData.get("website"));
        
        // CCCD Images
        if (verificationData.containsKey("idCardFrontImage")) user.setIdCardFrontImage((String) verificationData.get("idCardFrontImage"));
        if (verificationData.containsKey("idCardBackImage")) user.setIdCardBackImage((String) verificationData.get("idCardBackImage"));

        // Set status to PENDING
        user.setVerificationStatus(com.hlgtech.api.auth.model.VerificationStatus.PENDING);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Verification request submitted successfully", "status", "PENDING"));
    }
}

