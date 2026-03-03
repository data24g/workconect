package com.hlgtech.api.suggestion.service;

import com.hlgtech.api.auth.model.Role;
import com.hlgtech.api.auth.model.User;
import com.hlgtech.api.auth.repository.UserRepository;
import com.hlgtech.api.suggestion.dto.SuggestionDTO;
import com.hlgtech.api.suggestion.dto.SuggestionType;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SuggestionService {

    private final UserRepository userRepository;

    public SuggestionService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<SuggestionDTO> getSuggestions(String userId) {
        List<User> allUsers = userRepository.findAll();
        User targetUser = userRepository.findById(userId).orElse(null);
        Role preferredRole = (targetUser != null) ? targetUser.getRole() : Role.BUSINESS;

        List<SuggestionDTO> suggestions = new ArrayList<>();

        // Sort users to put preferred role first
        List<User> sortedUsers = allUsers.stream()
                .filter(u -> !u.getId().equals(userId))
                .sorted((u1, u2) -> {
                    if (u1.getRole() == preferredRole && u2.getRole() != preferredRole) return -1;
                    if (u1.getRole() != preferredRole && u2.getRole() == preferredRole) return 1;
                    return 0;
                })
                .limit(50)
                .collect(Collectors.toList());

        for (User user : sortedUsers) {
            SuggestionType type = (user.getRole() == Role.BUSINESS) ? SuggestionType.COMPANY : SuggestionType.USER;
            String roleStr = (user.getRole() == Role.BUSINESS) ? 
                    (user.getIndustry() != null ? user.getIndustry() : "Doanh nghiệp") : 
                    (user.getSkills() != null && !user.getSkills().isEmpty() ? user.getSkills().get(0) : 
                    (user.getTitle() != null ? user.getTitle() : "Người lao động"));
            
            suggestions.add(new SuggestionDTO(
                    user.getId(),
                    user.getFullName() != null ? user.getFullName() : user.getUsername(),
                    user.getAvatar(),
                    roleStr,
                    (int) (Math.random() * 50),
                    type,
                    user.getNumericId()
            ));
        }

        return suggestions;
    }
}
