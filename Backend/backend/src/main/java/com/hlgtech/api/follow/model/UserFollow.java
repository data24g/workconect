package com.hlgtech.api.follow.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "user_follows")
public class UserFollow {
    @Id
    private String id;

    @Indexed
    private String followerId; // Người đi theo dõi

    @Indexed
    private String followingId; // Người được theo dõi

    private LocalDateTime createdAt = LocalDateTime.now();

    public UserFollow(String followerId, String followingId) {
        this.followerId = followerId;
        this.followingId = followingId;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getFollowerId() { return followerId; }
    public void setFollowerId(String followerId) { this.followerId = followerId; }
    public String getFollowingId() { return followingId; }
    public void setFollowingId(String followingId) { this.followingId = followingId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
