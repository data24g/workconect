package com.hlgtech.api.notification.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;
    private String userId;
    private String message;
    private boolean isRead = false;
    private LocalDateTime createdAt = LocalDateTime.now();
    private NotificationType type;

    public Notification() {}

    public Notification(String userId, String message, NotificationType type) {
        this.userId = userId;
        this.message = message;
        this.type = type;
        this.createdAt = LocalDateTime.now();
        this.isRead = false;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public NotificationType getType() { return type; }
    public void setType(NotificationType type) { this.type = type; }
}
