package com.hlgtech.api.worksession.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
@Document(collection = "work_sessions")
public class WorkSession {

    @Id
    private String id;

    private String jobId;

    private Double workerRating; // Điểm Business chấm cho Worker
    private Double businessRating; // Điểm Worker chấm cho Business

    @JsonProperty("workerRated")
    private boolean workerRated;   // Worker đã đánh giá chưa
    @JsonProperty("businessRated")
    private boolean businessRated; // Business đã đánh giá chưa

    private String comment;

    // Lưu thời gian tạo và cập nhật dưới dạng String để dễ xử lý
    private String createdAt;
    private String updatedAt;

    private String workerComment;  // Nhận xét về Worker
    private String businessComment; // Nhận xét về Business

    private String firstRatedAt;

    @Indexed
    private String workerId;

    @Indexed
    private String businessId;

    private String workerName;
    private String businessName;
    private String jobTitle;
    private String workerAvatar;
    private String businessAvatar;
    private Long workerNumericId;
    private Long businessNumericId;

    // Enum trạng thái (PENDING, ACCEPTED...)
    private WorkSessionStatus status;

    // Thời gian làm việc (nếu dùng kiểu Date)
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime startDate;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime endDate;

    private List<RatingHistoryEntry> workerToBusinessHistory = new ArrayList<>();
    private List<RatingHistoryEntry> businessToWorkerHistory = new ArrayList<>();

    private Double compensationToWorker = 0.0;
    private Double compensationToBusiness = 0.0;
    private String disputeReason;
    private String resolutionDetail;

    public static class RatingHistoryEntry {
        private Double rating;
        private String comment;
        private String timestamp;
        private String type;
        private int editCount;

        public RatingHistoryEntry() {}
        public RatingHistoryEntry(Double rating, String comment, String timestamp, String type, int editCount) {
            this.rating = rating;
            this.comment = comment;
            this.timestamp = timestamp;
            this.type = type;
            this.editCount = editCount;
        }

        public Double getRating() { return rating; }
        public void setRating(Double rating) { this.rating = rating; }
        public String getComment() { return comment; }
        public void setComment(String comment) { this.comment = comment; }
        public String getTimestamp() { return timestamp; }
        public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public int getEditCount() { return editCount; }
        public void setEditCount(int editCount) { this.editCount = editCount; }
    }

    // ================= GETTERS & SETTERS =================

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getJobId() { return jobId; }
    public void setJobId(String jobId) { this.jobId = jobId; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }

    public String getWorkerId() { return workerId; }
    public void setWorkerId(String workerId) { this.workerId = workerId; }

    public String getBusinessId() { return businessId; }
    public void setBusinessId(String businessId) { this.businessId = businessId; }

    public WorkSessionStatus getStatus() { return status; }
    public void setStatus(WorkSessionStatus status) { this.status = status; }

    public String getWorkerName() { return workerName; }
    public void setWorkerName(String workerName) { this.workerName = workerName; }

    public String getBusinessName() { return businessName; }
    public void setBusinessName(String businessName) { this.businessName = businessName; }

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public String getWorkerAvatar() { return workerAvatar; }
    public void setWorkerAvatar(String workerAvatar) { this.workerAvatar = workerAvatar; }

    public String getBusinessAvatar() { return businessAvatar; }
    public void setBusinessAvatar(String businessAvatar) { this.businessAvatar = businessAvatar; }

    public Long getWorkerNumericId() { return workerNumericId; }
    public void setWorkerNumericId(Long workerNumericId) { this.workerNumericId = workerNumericId; }

    public Long getBusinessNumericId() { return businessNumericId; }
    public void setBusinessNumericId(Long businessNumericId) { this.businessNumericId = businessNumericId; }

    public boolean isWorkerRated() { return workerRated; }
    public void setWorkerRated(boolean workerRated) { this.workerRated = workerRated; }

    public boolean isBusinessRated() { return businessRated; }
    public void setBusinessRated(boolean businessRated) { this.businessRated = businessRated; }

    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }

    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }

    public Double getWorkerRating() { return workerRating; }
    public void setWorkerRating(Double workerRating) { this.workerRating = workerRating; }

    public Double getBusinessRating() { return businessRating; }
    public void setBusinessRating(Double businessRating) { this.businessRating = businessRating; }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public String getFirstRatedAt() {
        return firstRatedAt;
    }

    public void setFirstRatedAt(String firstRatedAt) {
        this.firstRatedAt = firstRatedAt;
    }
    public String getWorkerComment() {
        return workerComment;
    }

    public void setWorkerComment(String workerComment) {
        this.workerComment = workerComment;
    }

    public String getBusinessComment() {
        return businessComment;
    }

    public void setBusinessComment(String businessComment) {
        this.businessComment = businessComment;
    }

    public List<RatingHistoryEntry> getWorkerToBusinessHistory() { return workerToBusinessHistory; }
    public void setWorkerToBusinessHistory(List<RatingHistoryEntry> workerToBusinessHistory) { this.workerToBusinessHistory = workerToBusinessHistory; }
    public List<RatingHistoryEntry> getBusinessToWorkerHistory() { return businessToWorkerHistory; }
    public void setBusinessToWorkerHistory(List<RatingHistoryEntry> businessToWorkerHistory) { this.businessToWorkerHistory = businessToWorkerHistory; }

    public Double getCompensationToWorker() { return compensationToWorker; }
    public void setCompensationToWorker(Double compensationToWorker) { this.compensationToWorker = compensationToWorker; }
    public Double getCompensationToBusiness() { return compensationToBusiness; }
    public void setCompensationToBusiness(Double compensationToBusiness) { this.compensationToBusiness = compensationToBusiness; }
    public String getDisputeReason() { return disputeReason; }
    public void setDisputeReason(String disputeReason) { this.disputeReason = disputeReason; }
    public String getResolutionDetail() { return resolutionDetail; }
    public void setResolutionDetail(String resolutionDetail) { this.resolutionDetail = resolutionDetail; }
}