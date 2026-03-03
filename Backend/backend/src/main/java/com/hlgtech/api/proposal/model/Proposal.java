package com.hlgtech.api.proposal.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "proposals")
public class Proposal {

    @Id
    private String id;

    @Indexed
    private String adId;

    @Indexed
    private String businessId;

    private String message;
    private String status = "PENDING"; // PENDING, ACCEPTED, REJECTED
    private LocalDateTime sentAt = LocalDateTime.now();

    public Proposal() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getAdId() { return adId; }
    public void setAdId(String adId) { this.adId = adId; }

    public String getBusinessId() { return businessId; }
    public void setBusinessId(String businessId) { this.businessId = businessId; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }


    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }
}
