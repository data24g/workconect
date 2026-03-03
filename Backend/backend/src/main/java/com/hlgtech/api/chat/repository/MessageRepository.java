package com.hlgtech.api.chat.repository;

import com.hlgtech.api.chat.model.Message;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;

public interface MessageRepository extends MongoRepository<Message, String> {

    // Get chat history between two users sorted by time (ASC for history)
    @Query(value = "{ $or: [ { $and: [ { 'sender.$id': ?0 }, { 'receiver.$id': ?1 } ] }, { $and: [ { 'sender.$id': ?1 }, { 'receiver.$id': ?0 } ] } ] }", sort = "{ 'timestamp': 1 }")
    List<Message> findChatHistory(String user1, String user2);

    // Get all messages involving a user (to find conversation partners)
    @Query(value = "{ $or: [ { 'sender.$id': ?0 }, { 'receiver.$id': ?0 } ] }")
    List<Message> findAllMessagesInvolvingUser(String userId);

    // Get latest message between two users
    @Query(value = "{ $or: [ { $and: [ { 'sender.$id': ?0 }, { 'receiver.$id': ?1 } ] }, { $and: [ { 'sender.$id': ?1 }, { 'receiver.$id': ?0 } ] } ] }", sort = "{ 'timestamp': -1 }")
    List<Message> findLatestMessage(String user1, String user2, Pageable pageable);

    // Count unread messages for a specific conversation (where I am receiver and sender is partner)
    @Query(value = "{ 'receiver.$id': ?0, 'sender.$id': ?1, 'isRead': false }", count = true)
    long countUnread(String userId, String senderId);
}
