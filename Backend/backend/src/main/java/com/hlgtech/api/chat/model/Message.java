package com.hlgtech.api.chat.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.time.LocalDateTime;

@Document(collection = "messages")
public class Message {

    @Id
    private String id;

    @DBRef
    private com.hlgtech.api.auth.model.User sender;

    @DBRef
    private com.hlgtech.api.auth.model.User receiver;

    private String content;

    @CreatedDate
    private LocalDateTime timestamp;

    private boolean isRead;

    public Message() {}

    public Message(String id, com.hlgtech.api.auth.model.User sender, com.hlgtech.api.auth.model.User receiver, String content, LocalDateTime timestamp, boolean isRead) {
        this.id = id;
        this.sender = sender;
        this.receiver = receiver;
        this.content = content;
        this.timestamp = timestamp;
        this.isRead = isRead;
    }

    public static MessageBuilder builder() {
        return new MessageBuilder();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public com.hlgtech.api.auth.model.User getSender() { return sender; }
    public void setSender(com.hlgtech.api.auth.model.User sender) { this.sender = sender; }
    public com.hlgtech.api.auth.model.User getReceiver() { return receiver; }
    public void setReceiver(com.hlgtech.api.auth.model.User receiver) { this.receiver = receiver; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }

    public static class MessageBuilder {
        private String id;
        private com.hlgtech.api.auth.model.User sender;
        private com.hlgtech.api.auth.model.User receiver;
        private String content;
        private LocalDateTime timestamp;
        private boolean isRead;

        MessageBuilder() {}

        public MessageBuilder id(String id) {
            this.id = id;
            return this;
        }
        public MessageBuilder sender(com.hlgtech.api.auth.model.User sender) {
            this.sender = sender;
            return this;
        }
        public MessageBuilder receiver(com.hlgtech.api.auth.model.User receiver) {
            this.receiver = receiver;
            return this;
        }
        public MessageBuilder content(String content) {
            this.content = content;
            return this;
        }
        public MessageBuilder timestamp(LocalDateTime timestamp) {
            this.timestamp = timestamp;
            return this;
        }
        public MessageBuilder isRead(boolean isRead) {
            this.isRead = isRead;
            return this;
        }
        public Message build() {
            return new Message(id, sender, receiver, content, timestamp, isRead);
        }
    }
}
