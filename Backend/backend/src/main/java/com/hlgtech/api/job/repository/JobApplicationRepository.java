package com.hlgtech.api.job.repository;

import com.hlgtech.api.job.model.JobApplication;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface JobApplicationRepository extends MongoRepository<JobApplication, String> {
    List<JobApplication> findByJobId(String jobId);
    List<JobApplication> findByWorkerId(String workerId);
}
