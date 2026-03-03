package com.hlgtech.api.admin.repository;

import com.hlgtech.api.admin.model.MemberActivity;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface MemberActivityRepository extends MongoRepository<MemberActivity, String> {
    List<MemberActivity> findByUserIdOrderByTimestampDesc(String userId);
    List<MemberActivity> findAllByOrderByTimestampDesc();
}
