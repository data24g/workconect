package com.hlgtech.api.job.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "jobs")
public class Job {

    @Id
    private String id;

    @Indexed
    private String businessId;

    private String requirements;

    private String title;

    private String salary;

    private String location;

    private JobType type;

    private String description;

    private Double minRating;

    private LocalDateTime postedAt = LocalDateTime.now();

    private JobStatus status;

    public JobType getType() {
        return type;
    }

    public void setType(JobType type) {
        this.type = type;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getMinRating() {
        return minRating;
    }

    public void setMinRating(Double minRating) {
        this.minRating = minRating;
    }

    public LocalDateTime getPostedAt() {
        return postedAt;
    }

    public void setPostedAt(LocalDateTime postedAt) {
        this.postedAt = postedAt;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getSalary() {
        return salary;
    }

    public void setSalary(String salary) {
        this.salary = salary;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public JobStatus getStatus() {
        return status;
    }

    public void setStatus(JobStatus status) {
        this.status = status;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getBusinessId() {
        return businessId;
    }

    public void setBusinessId(String businessId) {
        this.businessId = businessId;
    }

    public String getRequirements() {
        return requirements;
    }

    public void setRequirements(String requirements) {
        this.requirements = requirements;
    }

    @org.springframework.data.annotation.Transient
    private String businessName;

    @org.springframework.data.annotation.Transient
    private String businessAvatar;

    @org.springframework.data.annotation.Transient // Đánh dấu là trường ảo, không lưu vào DB Job
    private Double businessRating;

    @org.springframework.data.annotation.Transient // Quan trọng: Phải có Transient ở đây
    private Integer businessRatingCount;

    @org.springframework.data.annotation.Transient
    private Long businessNumericId;

    // --- Getter và Setter (Tuyển tự tạo hoặc copy dưới đây) ---
    public Double getBusinessRating() {
        return businessRating;
    }

    public void setBusinessRating(Double businessRating) {
        this.businessRating = businessRating;
    }

    // Getter và Setter để JobService có thể gọi được
    public String getBusinessName() {
        return businessName;
    }

    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }

    public String getBusinessAvatar() {
        return businessAvatar;
    }

    public void setBusinessAvatar(String businessAvatar) {
        this.businessAvatar = businessAvatar;
    }

    public Integer getBusinessRatingCount() {
        return businessRatingCount;
    }

    public void setBusinessRatingCount(Integer businessRatingCount) {
        this.businessRatingCount = businessRatingCount;
    }

    public Long getBusinessNumericId() {
        return businessNumericId;
    }

    public void setBusinessNumericId(Long businessNumericId) {
        this.businessNumericId = businessNumericId;
    }

}
