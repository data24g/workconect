package com.hlgtech.api.chat.service;

import com.hlgtech.api.auth.model.User;
import com.hlgtech.api.auth.repository.UserRepository;
import com.hlgtech.api.chat.dto.ConversationDTO;
import com.hlgtech.api.chat.dto.MessageDTO;
import com.hlgtech.api.chat.model.Message;
import com.hlgtech.api.chat.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    public ChatService(MessageRepository messageRepository, UserRepository userRepository) {
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
    }

    public List<ConversationDTO> getConversations(String userId) {
        // Get all messages involving this user to find partners
        List<Message> allMessages = messageRepository.findAllMessagesInvolvingUser(userId);

        // Extract unique partner IDs
        List<String> partnerIds = allMessages.stream()
                .map(m -> m.getSender().getId().equals(userId) ? m.getReceiver().getId() : m.getSender().getId())
                .distinct()
                .collect(Collectors.toList());

        List<ConversationDTO> conversations = new ArrayList<>();

        for (String partnerId : partnerIds) {
            User partner = userRepository.findById(partnerId).orElse(null);
            if (partner == null)
                continue;

            // Get latest message
            List<Message> messages = messageRepository.findLatestMessage(userId, partnerId, PageRequest.of(0, 1));
            Message lastMsg = messages.isEmpty() ? null : messages.get(0);

            long unread = messageRepository.countUnread(userId, partnerId);

            conversations.add(ConversationDTO.builder()
                    .id(partnerId)
                    .participant(partner)
                    .lastMessage(lastMsg != null ? lastMsg.getContent() : "")
                    .lastTimestamp(lastMsg != null && lastMsg.getTimestamp() != null ? lastMsg.getTimestamp().toString() : "")
                    .unreadCount((int) unread)
                    .build());
        }

        // Sort by last message time desc
        conversations.sort(Comparator.comparing(ConversationDTO::getLastTimestamp).reversed());
        return conversations;
    }

    public List<MessageDTO> getMessages(String userId, String partnerId) {
        List<Message> messages = messageRepository.findChatHistory(userId, partnerId);

        // Mark as read
        messages.forEach(m -> {
            if (m.getReceiver().getId().equals(userId) && !m.isRead()) {
                m.setRead(true);
                messageRepository.save(m);
            }
        });

        return messages.stream().map(m -> MessageDTO.builder()
                .id(m.getId())
                .senderId(m.getSender().getId())
                .receiverId(m.getReceiver().getId())
                .content(m.getContent())
                .timestamp(m.getTimestamp() != null ? m.getTimestamp().toString() : "")
                .isRead(m.isRead())
                .build()).collect(Collectors.toList());
    }

    public MessageDTO sendMessage(MessageDTO req) {
        User sender = userRepository.findById(req.getSenderId())
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findById(req.getReceiverId())
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        Message message = Message.builder()
                .sender(sender)
                .receiver(receiver)
                .content(req.getContent())
                .timestamp(LocalDateTime.now()) // Explicitly set timestamp
                .isRead(false)
                .build();

        Message saved = messageRepository.save(message);

        return MessageDTO.builder()
                .id(saved.getId())
                .senderId(saved.getSender().getId())
                .receiverId(saved.getReceiver().getId())
                .content(saved.getContent())
                .timestamp(saved.getTimestamp().toString())
                .isRead(saved.isRead())
                .build();
    }
}
