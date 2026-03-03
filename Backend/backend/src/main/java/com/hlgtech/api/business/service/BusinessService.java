package com.hlgtech.api.business.service;

import com.hlgtech.api.business.model.Business;
import com.hlgtech.api.business.model.BusinessVerifyStatus;
import com.hlgtech.api.business.repository.BusinessRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BusinessService {

    private final BusinessRepository repository;
    private final com.hlgtech.api.notification.service.NotificationService notificationService;

    public BusinessService(BusinessRepository repository, com.hlgtech.api.notification.service.NotificationService notificationService) {
        this.repository = repository;
        this.notificationService = notificationService;
    }

    // ✅ CREATE BUSINESS
    public Business create(Business business) {
        business.setVerifyStatus(BusinessVerifyStatus.PENDING);
        business.setRating(0.0);
        Business saved = repository.save(business);
        
        notificationService.notifyAdmins("Doanh nghiệp mới yêu cầu xác thực: " + business.getName(), 
                com.hlgtech.api.notification.model.NotificationType.BUSINESS_PENDING);
                
        return saved;
    }

    // ✅ UPDATE RATING (CALLED FROM REVIEW SERVICE)
    public void updateRating(String ownerId, double rating) {
        Business business = repository.findByOwnerId(ownerId)
                .stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Business not found"));

        business.setRating(rating);
        repository.save(business);
    }

    // ✅ GET ALL BUSINESSES
    public List<Business> getAll() {
        return repository.findAll();
    }

    // ❌ REMOVED boolean verified
    // ✅ REPLACED WITH ENUM
    public List<Business> getByVerifyStatus(BusinessVerifyStatus status) {
        return repository.findByVerifyStatus(status);
    }

    // ✅ ADMIN VERIFY / DENY / PENDING
    public Business changeVerifyStatus(String businessId, BusinessVerifyStatus status) {
        Business business = repository.findById(businessId)
                .orElseThrow(() -> new RuntimeException("Business not found"));

        business.setVerifyStatus(status);
        return repository.save(business);
    }
}
