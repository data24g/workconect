package com.hlgtech.api.review.repository;

import com.hlgtech.api.review.model.Review;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ReviewRepository extends MongoRepository<Review, String> {
    List<Review> findByBusinessId(String businessId);

    // Reviews written by a user
    List<Review> findByFromUserId(String fromUserId);

    // Reviews received by a user (business / worker)
    List<Review> findByToUserId(String toUserId);
}
