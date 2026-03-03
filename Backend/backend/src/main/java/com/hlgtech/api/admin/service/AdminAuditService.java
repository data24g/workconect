package com.hlgtech.api.admin.service;

import com.hlgtech.api.admin.model.MemberActivity;
import com.hlgtech.api.admin.repository.MemberActivityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AdminAuditService {

    @Autowired
    private MemberActivityRepository memberActivityRepository;

    public void logActivity(String userId, String action, String details) {
        MemberActivity activity = new MemberActivity(userId, action, details);
        memberActivityRepository.save(activity);
    }

    public List<MemberActivity> getAllLogs() {
        return memberActivityRepository.findAllByOrderByTimestampDesc();
    }

    public List<MemberActivity> getLogsByUser(String userId) {
        return memberActivityRepository.findByUserIdOrderByTimestampDesc(userId);
    }
}
