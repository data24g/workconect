package com.hlgtech.api.auth.repository;

import com.hlgtech.api.auth.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    Optional<User> findByUsernameOrEmail(String username, String email);

    java.util.List<User> findByRole(com.hlgtech.api.auth.model.Role role);

    java.util.List<User> findByVerificationStatus(com.hlgtech.api.auth.model.VerificationStatus status);

    Optional<User> findByNumericId(Long numericId);
}
