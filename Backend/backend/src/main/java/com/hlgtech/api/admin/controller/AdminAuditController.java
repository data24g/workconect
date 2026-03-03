package com.hlgtech.api.admin.controller;

import com.hlgtech.api.admin.model.MemberActivity;
import com.hlgtech.api.admin.service.AdminAuditService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/audit-logs")
@PreAuthorize("hasRole('ADMIN')")
public class AdminAuditController {

    @Autowired
    private AdminAuditService auditService;

    @GetMapping
    public ResponseEntity<List<MemberActivity>> getAllLogs() {
        return ResponseEntity.ok(auditService.getAllLogs());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<MemberActivity>> getLogsByUser(@PathVariable String userId) {
        return ResponseEntity.ok(auditService.getLogsByUser(userId));
    }
}
