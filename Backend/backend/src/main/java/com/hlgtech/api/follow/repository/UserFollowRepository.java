package com.hlgtech.api.follow.repository;

import com.hlgtech.api.follow.model.UserFollow;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface UserFollowRepository extends MongoRepository<UserFollow, String> {
    Optional<UserFollow> findByFollowerIdAndFollowingId(String followerId, String followingId);
    List<UserFollow> findByFollowerId(String followerId);
    List<UserFollow> findByFollowingId(String followingId);
    long countByFollowerId(String followerId);
    long countByFollowingId(String followingId);
}
