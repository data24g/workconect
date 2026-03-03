package com.hlgtech.api.notification.model;

public enum NotificationType {
    SYSTEM,
    JOB_APPLY,      // Worker applies to Business
    JOB_STATUS,     // Business updates status (Accepted/Rejected)
    PROPOSAL,       // Business invites Worker
    RATING,         // Someone rated you
    COMPLETED,      // Job completed
    VERIFICATION,   // Suggest verification
    MESSAGE,
    FOLLOW,          // Someone followed you
    USER_REGISTERED,
    BUSINESS_PENDING,
    JOB_POSTED
}
