package com.hlgtech.api.follow.service;

import com.hlgtech.api.auth.model.User;
import com.hlgtech.api.auth.repository.UserRepository;
import com.hlgtech.api.follow.model.UserFollow;
import com.hlgtech.api.follow.repository.UserFollowRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserFollowService {

    private final UserFollowRepository followRepository;
    private final UserRepository userRepository;
    private final com.hlgtech.api.notification.service.NotificationService notificationService;

    public UserFollowService(UserFollowRepository followRepository, 
                             UserRepository userRepository,
                             com.hlgtech.api.notification.service.NotificationService notificationService) {
        this.followRepository = followRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public void followUser(String followerId, String followingId) {
        if (followerId.equals(followingId)) return;
        if (followRepository.findByFollowerIdAndFollowingId(followerId, followingId).isPresent()) return;

        UserFollow follow = new UserFollow(followerId, followingId);
        followRepository.save(follow);

        updateStats(followerId, followingId);

        // Create notification for the followed user
        userRepository.findById(followerId).ifPresent(follower -> {
            String followerName = follower.getFullName() != null ? follower.getFullName() : follower.getUsername();
            String idStr = follower.getNumericId() != null ? " (@" + follower.getNumericId() + ")" : "";
            notificationService.createNotification(
                followingId, 
                followerName + idStr + " đã bắt đầu theo dõi bạn.", 
                com.hlgtech.api.notification.model.NotificationType.FOLLOW
            );
        });
    }

    public void unfollowUser(String followerId, String followingId) {
        followRepository.findByFollowerIdAndFollowingId(followerId, followingId)
                .ifPresent(follow -> {
                    followRepository.delete(follow);
                    updateStats(followerId, followingId);
                });
    }

    public List<User> getFollowers(String userId) {
        List<String> followerIds = followRepository.findByFollowingId(userId).stream()
                .map(UserFollow::getFollowerId)
                .collect(Collectors.toList());
        return userRepository.findAllById(followerIds);
    }

    public List<User> getFollowing(String userId) {
        List<String> followingIds = followRepository.findByFollowerId(userId).stream()
                .map(UserFollow::getFollowingId)
                .collect(Collectors.toList());
        return userRepository.findAllById(followingIds);
    }

    public boolean isFollowing(String followerId, String followingId) {
        return followRepository.findByFollowerIdAndFollowingId(followerId, followingId).isPresent();
    }

    private void updateStats(String followerId, String followingId) {
        // Update Following Count for Follower
        userRepository.findById(followerId).ifPresent(user -> {
            user.setFollowingCount((int) followRepository.countByFollowerId(followerId));
            userRepository.save(user);
        });

        // Update Followers Count for Following
        userRepository.findById(followingId).ifPresent(user -> {
            user.setFollowersCount((int) followRepository.countByFollowingId(followingId));
            userRepository.save(user);
        });
    }
}
