package com.hlgtech.api.auth.service;

import com.hlgtech.api.auth.model.User;
import com.hlgtech.api.auth.model.UserStatus;
import com.hlgtech.api.auth.repository.UserRepository;
import com.hlgtech.api.credibility.service.CredibilityService;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository repository;
    private final CredibilityService credibilityService;

    public UserService(UserRepository repository, CredibilityService credibilityService) {
        this.repository = repository;
        this.credibilityService = credibilityService;
    }

    public void applyWarning(String userId) {
        User user = repository.findById(userId).orElseThrow();

        user.setStatus(UserStatus.WARNING);
        user.setCredibilityScore(
                credibilityService.calculate(userId)
        );

        repository.save(user);
    }

    public void ban(String userId) {
        User user = repository.findById(userId).orElseThrow();
        user.setStatus(UserStatus.BANNED);
        repository.save(user);
    }

    public void activate(String userId) {
        User user = repository.findById(userId).orElseThrow();
        user.setStatus(UserStatus.ACTIVE);
        repository.save(user);
    }

    public void deactivate(String userId) {
        User user = repository.findById(userId).orElseThrow();
        user.setStatus(UserStatus.INACTIVE);
        repository.save(user);
    }

    public User updateStatus(String userId, UserStatus status) {
        User user = repository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setStatus(status);
        return repository.save(user);
    }

}

