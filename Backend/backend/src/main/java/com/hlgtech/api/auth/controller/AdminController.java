package com.hlgtech.api.auth.controller;

import com.hlgtech.api.auth.model.UserStatus;
import com.hlgtech.api.auth.service.UserService;
import com.hlgtech.api.core.ResponseObject;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserService userService;

    public AdminController(UserService userService) {
        this.userService = userService;
    }

    // ⚠️ Warn user
    @PutMapping("/users/{id}/warn")
    public ResponseObject warnUser(@PathVariable String id) {
        return new ResponseObject(
                200,
                userService.updateStatus(id, UserStatus.WARNING),
                "User warned"
        );
    }

    // 🚫 Disable user
    @PutMapping("/users/{id}/disable")
    public ResponseObject disableUser(@PathVariable String id) {
        return new ResponseObject(
                200,
                userService.updateStatus(id, UserStatus.INACTIVE),
                "User disabled"
        );
    }

    // ✅ Activate user
    @PutMapping("/users/{id}/activate")
    public ResponseObject activateUser(@PathVariable String id) {
        return new ResponseObject(
                200,
                userService.updateStatus(id, UserStatus.ACTIVE),
                "User activated"
        );
    }

    // Ban user
    @PutMapping("/users/{id}/ban")
    public ResponseObject banUser(@PathVariable String id) {
        return new ResponseObject(
                200,
                userService.updateStatus(id, UserStatus.BANNED),
                "User activated"
        );
    }
}
