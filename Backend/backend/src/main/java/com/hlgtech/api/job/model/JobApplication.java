package com.hlgtech.api.job.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "job_applications")
public class JobApplication {

    @Id
    private String id;

    @Indexed
    private String jobId;

    @Indexed
    private String workerId;

    private String introMessage;

    private JobApplicationStatus status = JobApplicationStatus.PENDING;

    private LocalDateTime appliedAt = LocalDateTime.now();

    public JobApplication() {}

    public JobApplication(String jobId, String workerId, String introMessage) {
        this.jobId = jobId;
        this.workerId = workerId;
        this.introMessage = introMessage;
        this.appliedAt = LocalDateTime.now();
        this.status = JobApplicationStatus.PENDING;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getJobId() { return jobId; }
    public void setJobId(String jobId) { this.jobId = jobId; }

    public String getWorkerId() { return workerId; }
    public void setWorkerId(String workerId) { this.workerId = workerId; }

    public String getIntroMessage() { return introMessage; }
    public void setIntroMessage(String introMessage) { this.introMessage = introMessage; }

    public JobApplicationStatus getStatus() { return status; }
    public void setStatus(JobApplicationStatus status) { this.status = status; }

    public LocalDateTime getAppliedAt() { return appliedAt; }
    public void setAppliedAt(LocalDateTime appliedAt) { this.appliedAt = appliedAt; }
}
