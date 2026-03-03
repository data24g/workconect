package com.hlgtech.api.follow.controller;

import com.hlgtech.api.auth.model.User;
import com.hlgtech.api.follow.service.UserFollowService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/follows")
public class UserFollowController {

    private final UserFollowService followService;

    public UserFollowController(UserFollowService followService) {
        this.followService = followService;
    }

    @PostMapping("/{followingId}")
    public ResponseEntity<?> follow(@PathVariable String followingId, @RequestParam String followerId) {
        followService.followUser(followerId, followingId);
        return ResponseEntity.ok(Map.of("message", "Followed successfully"));
    }

    @DeleteMapping("/{followingId}")
    public ResponseEntity<?> unfollow(@PathVariable String followingId, @RequestParam String followerId) {
        followService.unfollowUser(followerId, followingId);
        return ResponseEntity.ok(Map.of("message", "Unfollowed successfully"));
    }

    @GetMapping("/{userId}/followers")
    public ResponseEntity<List<User>> getFollowers(@PathVariable String userId) {
        return ResponseEntity.ok(followService.getFollowers(userId));
    }

    @GetMapping("/{userId}/following")
    public ResponseEntity<List<User>> getFollowing(@PathVariable String userId) {
        return ResponseEntity.ok(followService.getFollowing(userId));
    }
    
    @GetMapping("/check")
    public ResponseEntity<Boolean> checkFollow(@RequestParam String followerId, @RequestParam String followingId) {
        return ResponseEntity.ok(followService.isFollowing(followerId, followingId));
    }
}
