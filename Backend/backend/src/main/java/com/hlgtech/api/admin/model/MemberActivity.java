package com.hlgtech.api.admin.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "member_activities")
public class MemberActivity {
    @Id
    private String id;
    private String userId; // ID của người thực hiện hoặc người bị tác động
    private String action; // Mã hành động (VD: VERIFY_BUSINESS, DELETE_JOB)
    private String details; // Mô tả chi tiết bằng tiếng Việt
    private LocalDateTime timestamp;

    public MemberActivity() {
        this.timestamp = LocalDateTime.now();
    }

    public MemberActivity(String userId, String action, String details) {
        this.userId = userId;
        this.action = action;
        this.details = details;
        this.timestamp = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
