package com.hlgtech.api.notification.service;

import com.hlgtech.api.notification.model.Notification;
import com.hlgtech.api.notification.model.NotificationType;
import com.hlgtech.api.notification.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final com.hlgtech.api.auth.repository.UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, com.hlgtech.api.auth.repository.UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    public void notifyAdmins(String message, NotificationType type) {
        List<com.hlgtech.api.auth.model.User> admins = userRepository.findByRole(com.hlgtech.api.auth.model.Role.ADMIN);
        for (com.hlgtech.api.auth.model.User admin : admins) {
            createNotification(admin.getId(), message, type);
        }
    }

    public List<Notification> getNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public void createNotification(String userId, String message, NotificationType type) {
        Notification notification = new Notification(userId, message, type);
        notificationRepository.save(notification);
    }

    public void markAsRead(String notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setRead(true);
            notificationRepository.save(notification);
        });
    }

    public void markAllAsRead(String userId) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        notifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(notifications);
    }
}
