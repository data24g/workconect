package com.hlgtech.api.workerad.repository;

import com.hlgtech.api.workerad.model.WorkerAd;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface WorkerAdRepository extends MongoRepository<WorkerAd, String> {
    List<WorkerAd> findByWorkerId(String workerId);
}
