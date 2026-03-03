package com.hlgtech.api.proposal.dto;

import java.time.LocalDateTime;

public class ProposalDTO {
    private String id;
    private String adId;
    private String businessId;
    private String businessName;
    private String businessAvatar;
    private Long businessNumericId;
    private String message;
    private String status;
    private LocalDateTime sentAt;

    public ProposalDTO() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getAdId() { return adId; }
    public void setAdId(String adId) { this.adId = adId; }

    public String getBusinessId() { return businessId; }
    public void setBusinessId(String businessId) { this.businessId = businessId; }

    public String getBusinessName() { return businessName; }
    public void setBusinessName(String businessName) { this.businessName = businessName; }

    public String getBusinessAvatar() { return businessAvatar; }
    public void setBusinessAvatar(String businessAvatar) { this.businessAvatar = businessAvatar; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }


    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }

    public Long getBusinessNumericId() { return businessNumericId; }
    public void setBusinessNumericId(Long businessNumericId) { this.businessNumericId = businessNumericId; }
}
