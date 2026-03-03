package com.hlgtech.api.admin.controller;

import com.hlgtech.api.admin.service.AdminAuditService;
import com.hlgtech.api.worksession.model.WorkSession;
import com.hlgtech.api.worksession.model.WorkSessionStatus;
import com.hlgtech.api.worksession.repository.WorkSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/work-sessions")
@PreAuthorize("hasRole('ADMIN')")
public class AdminWorkSessionController {

    @Autowired
    private WorkSessionRepository workSessionRepository;

    @Autowired
    private AdminAuditService auditService;

    @GetMapping
    public ResponseEntity<?> getAllSessions() {
        try {
            List<WorkSession> sessions = workSessionRepository.findAll();
            return ResponseEntity.ok(sessions);
        } catch (Exception e) {
            // Log error and return empty list to prevent 500 error
            System.err.println("Error fetching work sessions: " + e.getMessage());
            e.printStackTrace();
            // Return empty list instead of error
            return ResponseEntity.ok(new java.util.ArrayList<>());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkSession> getSession(@PathVariable String id) {
        return workSessionRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/worker/{workerId}")
    public ResponseEntity<List<WorkSession>> getByWorker(@PathVariable String workerId) {
        return ResponseEntity.ok(workSessionRepository.findByWorkerId(workerId));
    }

    @GetMapping("/business/{businessId}")
    public ResponseEntity<List<WorkSession>> getByBusiness(@PathVariable String businessId) {
        return ResponseEntity.ok(workSessionRepository.findByBusinessId(businessId));
    }

    @PutMapping("/{id}/resolve-dispute")
    public ResponseEntity<?> resolveDispute(
            @PathVariable String id,
            @RequestParam Double compensationToWorker,
            @RequestParam Double compensationToBusiness,
            @RequestParam String resolutionDetail) {

        return workSessionRepository.findById(id).map(session -> {
            session.setStatus(WorkSessionStatus.RESOLVED);
            session.setCompensationToWorker(compensationToWorker);
            session.setCompensationToBusiness(compensationToBusiness);
            session.setResolutionDetail(resolutionDetail);

            workSessionRepository.save(session);

            auditService.logActivity(id, "RESOLVE_DISPUTE",
                    String.format("Giải quyết tranh chấp phiên %s. Worker: %.2f, Business: %.2f",
                            id, compensationToWorker, compensationToBusiness));

            return ResponseEntity.ok(session);
        }).orElse(ResponseEntity.notFound().build());
    }
}
