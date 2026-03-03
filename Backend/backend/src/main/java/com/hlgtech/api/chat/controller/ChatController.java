package com.hlgtech.api.chat.controller;

import com.hlgtech.api.chat.dto.ConversationDTO;
import com.hlgtech.api.chat.dto.MessageDTO;
import com.hlgtech.api.chat.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*") // Adjust CORS as needed
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    // Get all conversations for a user
    @GetMapping("/conversations/{userId}")
    public ResponseEntity<List<ConversationDTO>> getConversations(@PathVariable String userId) {
        return ResponseEntity.ok(chatService.getConversations(userId));
    }

    // Get messages between two users
    @GetMapping("/messages/{partnerId}")
    public ResponseEntity<List<MessageDTO>> getMessages(
            @PathVariable String partnerId,
            @RequestParam(required = false) String userId
    ) {
        if (userId == null) {
             // If userId is missing, return empty list (or handle via SecurityContext in future)
             return ResponseEntity.ok(List.of()); 
        }
        return ResponseEntity.ok(chatService.getMessages(userId, partnerId));
    }

    @PostMapping("/messages")
    public ResponseEntity<MessageDTO> sendMessage(@RequestBody MessageDTO message) {
        return ResponseEntity.ok(chatService.sendMessage(message));
    }
}
