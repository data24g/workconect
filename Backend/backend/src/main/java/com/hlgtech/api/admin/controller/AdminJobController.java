package com.hlgtech.api.admin.controller;

import com.hlgtech.api.admin.service.AdminAuditService;
import com.hlgtech.api.job.model.Job;
import com.hlgtech.api.job.model.JobStatus;
import com.hlgtech.api.job.repository.JobRepository;
import com.hlgtech.api.job.service.JobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/jobs")
@PreAuthorize("hasRole('ADMIN')")
public class AdminJobController {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private JobService jobService;

    @Autowired
    private AdminAuditService auditService;

    @GetMapping
    public ResponseEntity<?> getAllJobs() {
        List<Job> jobs = jobService.getAll();
        if (jobs.isEmpty())
            return ResponseEntity.ok(jobs);

        Job first = jobs.get(0);
        System.out.println("DEBUG: First job businessName: " + first.getBusinessName());

        return ResponseEntity.ok(jobs);
    }

    @GetMapping("/{jobId}")
    public ResponseEntity<Job> getJobById(@PathVariable String jobId) {
        try {
            return ResponseEntity.ok(jobService.getById(jobId));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/business/{businessId}")
    public ResponseEntity<List<Job>> getJobsByBusiness(@PathVariable String businessId) {
        return ResponseEntity.ok(jobService.getByBusiness(businessId));
    }

    @PutMapping("/{jobId}/approve")
    public ResponseEntity<?> approveJob(@PathVariable String jobId) {
        return jobRepository.findById(jobId).map(job -> {
            job.setStatus(JobStatus.OPEN);
            jobRepository.save(job);

            auditService.logActivity(job.getBusinessId(), "APPROVE_JOB",
                    "Duyệt tin tuyển dụng: " + job.getTitle());

            return ResponseEntity.ok(job);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{jobId}/reject")
    public ResponseEntity<?> rejectJob(
            @PathVariable String jobId,
            @RequestParam String reason) {

        return jobRepository.findById(jobId).map(job -> {
            job.setStatus(JobStatus.REJECTED);
            jobRepository.save(job);

            auditService.logActivity(job.getBusinessId(), "REJECT_JOB",
                    "Từ chối tin tuyển dụng: " + job.getTitle() + ". Lý do: " + reason);

            return ResponseEntity.ok(job);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{jobId}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable String jobId,
            @RequestParam JobStatus status,
            @RequestParam(required = false) String reason) {

        return jobRepository.findById(jobId).map(job -> {
            JobStatus oldStatus = job.getStatus();
            job.setStatus(status);
            jobRepository.save(job);

            String detail = String.format("Cập nhật trạng thái tin tuyển dụng '%s' từ %s sang %s. Lý do: %s",
                    job.getTitle(), oldStatus, status, reason != null ? reason : "Không có");
            auditService.logActivity(job.getBusinessId(), "UPDATE_JOB_STATUS", detail);

            return ResponseEntity.ok(job);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{jobId}")
    public ResponseEntity<?> deleteJob(@PathVariable String jobId) {
        return jobRepository.findById(jobId).map(job -> {
            String title = job.getTitle();
            String businessId = job.getBusinessId();

            jobRepository.deleteById(jobId);

            auditService.logActivity(businessId, "DELETE_JOB",
                    "Xóa tin tuyển dụng: " + title + " (ID: " + jobId + ")");

            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
