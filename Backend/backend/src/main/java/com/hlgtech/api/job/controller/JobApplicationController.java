package com.hlgtech.api.job.controller;

import com.hlgtech.api.job.dto.JobApplicationDTO;
import com.hlgtech.api.job.model.JobApplicationStatus;
import com.hlgtech.api.job.service.JobApplicationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/job-applications")
public class JobApplicationController {

    private final JobApplicationService service;

    public JobApplicationController(JobApplicationService service) {
        this.service = service;
    }

    @GetMapping("/business/{businessId}")
    public ResponseEntity<List<JobApplicationDTO>> getApplicantsByBusiness(@PathVariable String businessId) {
        return ResponseEntity.ok(service.getApplicantsByBusiness(businessId));
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<JobApplicationDTO>> getApplicantsByJob(@PathVariable String jobId) {
        return ResponseEntity.ok(service.getApplicantsForJob(jobId));
    }

    @PostMapping("/apply")
    public ResponseEntity<Void> apply(@RequestParam String jobId, @RequestParam String workerId, @RequestParam String introMessage) {
        service.applyForJob(jobId, workerId, introMessage);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Void> updateStatus(@PathVariable String id, @RequestParam JobApplicationStatus status) {
        service.updateStatus(id, status);
        return ResponseEntity.ok().build();
    }
}
