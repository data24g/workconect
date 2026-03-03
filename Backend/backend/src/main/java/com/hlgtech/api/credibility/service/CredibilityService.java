package com.hlgtech.api.credibility.service;

import com.hlgtech.api.review.repository.ReviewRepository;
import com.hlgtech.api.report.repository.ReportRepository;
import org.springframework.stereotype.Service;

@Service
public class CredibilityService {

    private final ReviewRepository reviewRepository;
    private final ReportRepository reportRepository;

    public CredibilityService(
            ReviewRepository reviewRepository,
            ReportRepository reportRepository
    ) {
        this.reviewRepository = reviewRepository;
        this.reportRepository = reportRepository;
    }

    public double calculate(String userId) {

        // ⭐ Average rating RECEIVED by the user
        double avgRating = reviewRepository.findByToUserId(userId)
                .stream()
                .mapToInt(r -> r.getScore())
                .average()
                .orElse(5); // default neutral rating

        // 🚨 Number of reports targeting this USER
        int reportCount = reportRepository
                .findByTargetIdAndTargetType(userId, "USER")
                .size();

        // 📊 Credibility formula (0–100)
        double credibility = avgRating * 20 - reportCount * 10;

        return Math.max(0, credibility);
    }
}
