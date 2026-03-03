package com.hlgtech.api.worksession.repository;

import com.hlgtech.api.worksession.model.WorkSession;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WorkSessionRepository extends MongoRepository<WorkSession, String> {

    // 👇 QUAN TRỌNG: Phải có dòng này thì trang Quản lý mới lấy được danh sách
    List<WorkSession> findByJobId(String jobId);

    // Lịch sử ứng tuyển của Worker
    List<WorkSession> findByWorkerId(String workerId);

    // Danh sách của Business
    List<WorkSession> findByBusinessId(String businessId);
}