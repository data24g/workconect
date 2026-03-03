package com.hlgtech.api.job.dto;

import com.hlgtech.api.job.model.JobApplicationStatus;
import java.time.LocalDateTime;

public class JobApplicationDTO {
    private String id;
    private String jobId;
    private String jobTitle;
    private String workerId;
    private String workerName;
    private String workerAvatar;
    private JobApplicationStatus status;
    private LocalDateTime appliedAt;
    private String introMessage;

    public JobApplicationDTO() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getJobId() { return jobId; }
    public void setJobId(String jobId) { this.jobId = jobId; }

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public String getWorkerId() { return workerId; }
    public void setWorkerId(String workerId) { this.workerId = workerId; }

    public String getWorkerName() { return workerName; }
    public void setWorkerName(String workerName) { this.workerName = workerName; }

    public String getWorkerAvatar() { return workerAvatar; }
    public void setWorkerAvatar(String workerAvatar) { this.workerAvatar = workerAvatar; }

    public JobApplicationStatus getStatus() { return status; }
    public void setStatus(JobApplicationStatus status) { this.status = status; }

    public LocalDateTime getAppliedAt() { return appliedAt; }
    public void setAppliedAt(LocalDateTime appliedAt) { this.appliedAt = appliedAt; }

    public String getIntroMessage() { return introMessage; }
    public void setIntroMessage(String introMessage) { this.introMessage = introMessage; }
}
