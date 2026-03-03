package com.hlgtech.api.review.service;

import com.hlgtech.api.business.service.BusinessService;
import com.hlgtech.api.review.model.Review;
import com.hlgtech.api.review.repository.ReviewRepository;
import com.hlgtech.api.auth.model.User;
import com.hlgtech.api.auth.repository.UserRepository;
import com.hlgtech.api.worksession.model.WorkSessionStatus;
import com.hlgtech.api.worksession.repository.WorkSessionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final WorkSessionRepository workSessionRepository;
    private final BusinessService businessService;
    private final UserRepository userRepository;

    public ReviewService(ReviewRepository reviewRepository, WorkSessionRepository workSessionRepository, BusinessService businessService, UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.workSessionRepository = workSessionRepository;
        this.businessService = businessService;
        this.userRepository = userRepository;
    }

    public Review create(Review review) {

        var session = workSessionRepository
                .findById(review.getWorkSessionId())
                .orElseThrow();

        if (session.getStatus() != WorkSessionStatus.COMPLETED) {
            throw new RuntimeException("Cannot review unfinished work");
        }

        Review saved = reviewRepository.save(review);

        double avg = reviewRepository.findByBusinessId(review.getBusinessId())
                .stream()
                .mapToInt(Review::getScore)
                .average()
                .orElse(0);

        businessService.updateRating(review.getBusinessId(), avg);

        // Update credibility score for the target user (toUserId)
        userRepository.findById(review.getToUserId()).ifPresent(user -> {
            double currentScore = user.getCredibilityScore();
            // Logic: 5 stars -> +5, 1 star -> -5 (3 stars is neutral)
            double newScore = currentScore + (review.getScore() - 3) * 2;
            user.setCredibilityScore(Math.max(0, Math.min(100, newScore)));
            userRepository.save(user);
        });

        return saved;
    }

    public List<Review> getByUser(String userId) {
        return reviewRepository.findByToUserId(userId);
    }

    public List<Review> getByAuthor(String userId) {
        return reviewRepository.findByFromUserId(userId);
    }
}
