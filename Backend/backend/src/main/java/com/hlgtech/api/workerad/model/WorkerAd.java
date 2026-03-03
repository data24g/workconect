package com.hlgtech.api.workerad.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "worker_ads")
public class WorkerAd {

    @Id
    private String id;

    @Indexed
    private String workerId;

    private String title;
    private String description;
    private List<String> skills;
    private String expectedSalary;
    private String location;
    private WorkerAdStatus status = WorkerAdStatus.OPEN;
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @org.springframework.data.annotation.Transient
    private String fullName;
    @org.springframework.data.annotation.Transient
    private String avatar;
    @org.springframework.data.annotation.Transient
    private Double workerRating;
    @org.springframework.data.annotation.Transient
    private Integer workerRatingCount;
    @org.springframework.data.annotation.Transient
    private Long numericId;

    public WorkerAd() {}

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }


    public Double getWorkerRating() { return workerRating; }
    public void setWorkerRating(Double workerRating) { this.workerRating = workerRating; }

    public Integer getWorkerRatingCount() { return workerRatingCount; }
    public void setWorkerRatingCount(Integer workerRatingCount) { this.workerRatingCount = workerRatingCount; }

    public Long getNumericId() { return numericId; }
    public void setNumericId(Long numericId) { this.numericId = numericId; }

    public String getId() { return id; }

    public void setId(String id) { this.id = id; }

    public String getWorkerId() { return workerId; }
    public void setWorkerId(String workerId) { this.workerId = workerId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }

    public String getExpectedSalary() { return expectedSalary; }
    public void setExpectedSalary(String expectedSalary) { this.expectedSalary = expectedSalary; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public WorkerAdStatus getStatus() { return status; }
    public void setStatus(WorkerAdStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
