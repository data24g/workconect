package com.hlgtech.api.business.repository;

import com.hlgtech.api.business.model.Business;
import com.hlgtech.api.business.model.BusinessVerifyStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface BusinessRepository extends MongoRepository<Business, String> {
    List<Business> findByOwnerId(String ownerId);
    List<Business> findByVerifyStatus(BusinessVerifyStatus status);

}
