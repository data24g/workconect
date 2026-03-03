package com.hlgtech.api.job.repository;

import com.hlgtech.api.job.model.Job;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface JobRepository extends MongoRepository<Job, String> {
    List<Job> findByBusinessId(String businessId);
}
