package com.hlgtech.api.chat.dto;

import lombok.Data;
import lombok.Builder;

public class MessageDTO {
    private String id;
    private String senderId;
    private String receiverId;
    private String content;
    private String timestamp;
    private boolean isRead;
    private String lastSeen; // For status

    public MessageDTO() {}

    public MessageDTO(String id, String senderId, String receiverId, String content, String timestamp, boolean isRead, String lastSeen) {
        this.id = id;
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.content = content;
        this.timestamp = timestamp;
        this.isRead = isRead;
        this.lastSeen = lastSeen;
    }

    public static MessageDTOBuilder builder() {
        return new MessageDTOBuilder();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getSenderId() { return senderId; }
    public void setSenderId(String senderId) { this.senderId = senderId; }
    public String getReceiverId() { return receiverId; }
    public void setReceiverId(String receiverId) { this.receiverId = receiverId; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }
    public String getLastSeen() { return lastSeen; }
    public void setLastSeen(String lastSeen) { this.lastSeen = lastSeen; }

    public static class MessageDTOBuilder {
        private String id;
        private String senderId;
        private String receiverId;
        private String content;
        private String timestamp;
        private boolean isRead;
        private String lastSeen;

        MessageDTOBuilder() {}

        public MessageDTOBuilder id(String id) {
            this.id = id;
            return this;
        }
        public MessageDTOBuilder senderId(String senderId) {
            this.senderId = senderId;
            return this;
        }
        public MessageDTOBuilder receiverId(String receiverId) {
            this.receiverId = receiverId;
            return this;
        }
        public MessageDTOBuilder content(String content) {
            this.content = content;
            return this;
        }
        public MessageDTOBuilder timestamp(String timestamp) {
            this.timestamp = timestamp;
            return this;
        }
        public MessageDTOBuilder isRead(boolean isRead) {
            this.isRead = isRead;
            return this;
        }
        public MessageDTOBuilder lastSeen(String lastSeen) {
            this.lastSeen = lastSeen;
            return this;
        }
        public MessageDTO build() {
            return new MessageDTO(id, senderId, receiverId, content, timestamp, isRead, lastSeen);
        }
    }
}
