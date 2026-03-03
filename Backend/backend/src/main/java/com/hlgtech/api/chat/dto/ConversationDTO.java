package com.hlgtech.api.chat.dto;

import lombok.Data;
import lombok.Builder;
import com.hlgtech.api.auth.model.User;

public class ConversationDTO {
    private String id; // This is just a placeholder ID (usually partnerId)
    private User participant;
    private String lastMessage;
    private String lastTimestamp;
    private int unreadCount;

    public ConversationDTO() {}

    public ConversationDTO(String id, User participant, String lastMessage, String lastTimestamp, int unreadCount) {
        this.id = id;
        this.participant = participant;
        this.lastMessage = lastMessage;
        this.lastTimestamp = lastTimestamp;
        this.unreadCount = unreadCount;
    }

    public static ConversationDTOBuilder builder() {
        return new ConversationDTOBuilder();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public User getParticipant() { return participant; }
    public void setParticipant(User participant) { this.participant = participant; }
    public String getLastMessage() { return lastMessage; }
    public void setLastMessage(String lastMessage) { this.lastMessage = lastMessage; }
    public String getLastTimestamp() { return lastTimestamp; }
    public void setLastTimestamp(String lastTimestamp) { this.lastTimestamp = lastTimestamp; }
    public int getUnreadCount() { return unreadCount; }
    public void setUnreadCount(int unreadCount) { this.unreadCount = unreadCount; }

    public static class ConversationDTOBuilder {
        private String id;
        private User participant;
        private String lastMessage;
        private String lastTimestamp;
        private int unreadCount;

        ConversationDTOBuilder() {}

        public ConversationDTOBuilder id(String id) {
            this.id = id;
            return this;
        }
        public ConversationDTOBuilder participant(User participant) {
            this.participant = participant;
            return this;
        }
        public ConversationDTOBuilder lastMessage(String lastMessage) {
            this.lastMessage = lastMessage;
            return this;
        }
        public ConversationDTOBuilder lastTimestamp(String lastTimestamp) {
            this.lastTimestamp = lastTimestamp;
            return this;
        }
        public ConversationDTOBuilder unreadCount(int unreadCount) {
            this.unreadCount = unreadCount;
            return this;
        }
        public ConversationDTO build() {
            return new ConversationDTO(id, participant, lastMessage, lastTimestamp, unreadCount);
        }
    }
}
