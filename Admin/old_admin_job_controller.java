package com.hlgtech.api.job.controller;

import com.hlgtech.api.core.ResponseObject;
import com.hlgtech.api.job.model.Job;
import com.hlgtech.api.job.model.JobStatus;
import com.hlgtech.api.job.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/jobs")
@PreAuthorize("hasRole('ADMIN')")
public class AdminJobController {

    @Autowired
    private com.hlgtech.api.job.service.JobService jobService;

    @Autowired
    private com.hlgtech.api.auth.repository.MemberActivityRepository activityRepository;

    @Autowired
    private JobRepository jobRepository;

    // GET /api/admin/jobs?status=ACTIVE
    @GetMapping
    public ResponseObject getAllJobs(@RequestParam(required = false) String status) {
        List<Job> jobs = jobService.getAll();

        // Filter by status if provided
        if (status != null && !status.isEmpty()) {
            try {
                JobStatus filterStatus = JobStatus.valueOf(status.toUpperCase());
                jobs = jobs.stream()
                        .filter(job -> job.getStatus() == filterStatus)
                        .collect(Collectors.toList());
            } catch (IllegalArgumentException e) {
                return new ResponseObject(400, null, "Invalid status: " + status);
            }
        }

        return new ResponseObject(200, jobs, "Jobs retrieved successfully");
    }

    // PUT /api/admin/jobs/{id}/approve
    @PutMapping("/{id}/approve")
    public ResponseObject approveJob(@PathVariable String id) {
        try {
            Job job = jobService.updateStatus(id, JobStatus.OPEN);
            return new ResponseObject(200, job, "Job approved and set to OPEN status");
        } catch (Exception e) {
            return new ResponseObject(404, null, "Job not found: " + e.getMessage());
        }
    }

    // PUT /api/admin/jobs/{id}/status
    @PutMapping("/{id}/status")
    public ResponseObject updateJobStatus(
            @PathVariable String id,
            @RequestParam String status,
            @RequestParam(required = false) String reason) {

        try {
            JobStatus newStatus = JobStatus.valueOf(status.toUpperCase());
            Job job = jobService.updateStatus(id, newStatus);

            // Log activity
            String action = "UPDATE_JOB_STATUS";
            String details = "Cß║¡p nhß║¡t trß║íng th├íi c├┤ng viß╗çc '" + job.getTitle() + "' th├ánh " + newStatus;
            if (reason != null && !reason.isEmpty()) {
                details += " - L├╜ do: " + reason;
            }

            com.hlgtech.api.auth.model.MemberActivity activity = new com.hlgtech.api.auth.model.MemberActivity(
                    job.getBusinessId() != null ? job.getBusinessId() : id,
                    action,
                    details);
            activityRepository.save(activity);

            return new ResponseObject(200, job,
                    "Job status updated to " + newStatus +
                            (reason != null ? ". Reason: " + reason : ""));
        } catch (IllegalArgumentException e) {
            return new ResponseObject(400, null, "Invalid status: " + status);
        } catch (Exception e) {
            return new ResponseObject(404, null, "Job not found: " + e.getMessage());
        }
    }

    // DELETE /api/admin/jobs/{id}
    @DeleteMapping("/{id}")
    public ResponseObject deleteJob(@PathVariable String id) {
        try {
            // Get job details before deleting
            Optional<Job> jobOpt = jobRepository.findById(id);
            String jobTitle = "Unknown";
            String businessId = id;

            if (jobOpt.isPresent()) {
                Job job = jobOpt.get();
                jobTitle = job.getTitle();
                businessId = job.getBusinessId() != null ? job.getBusinessId() : id;
            }

            // Delete the job
            jobService.delete(id);

            // Log activity
            com.hlgtech.api.auth.model.MemberActivity activity = new com.hlgtech.api.auth.model.MemberActivity(
                    businessId,
                    "DELETE_JOB",
                    "X├│a tin tuyß╗ân dß╗Ñng: " + jobTitle);
            activityRepository.save(activity);

            return new ResponseObject(200, null, "Job deleted successfully");
        } catch (Exception e) {
            return new ResponseObject(404, null, "Job not found: " + e.getMessage());
        }
    }
}
