package com.hlgtech.api.report.repository;

import com.hlgtech.api.report.model.Report;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ReportRepository extends MongoRepository<Report, String> {
    // All reports for a specific target (user / job / business)
    List<Report> findByTargetId(String targetId);

    // Reports filtered by target + type (BEST PRACTICE)
    List<Report> findByTargetIdAndTargetType(String targetId, String targetType);

    // Reports created by a user
    List<Report> findByFromUserId(String fromUserId);
}
