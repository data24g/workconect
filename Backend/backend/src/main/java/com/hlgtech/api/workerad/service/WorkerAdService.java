package com.hlgtech.api.workerad.service;

import com.hlgtech.api.workerad.model.WorkerAd;
import com.hlgtech.api.workerad.model.WorkerAdStatus;
import com.hlgtech.api.workerad.repository.WorkerAdRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class WorkerAdService {

    private final WorkerAdRepository repository;
    private final com.hlgtech.api.auth.repository.UserRepository userRepository;

    public WorkerAdService(WorkerAdRepository repository, com.hlgtech.api.auth.repository.UserRepository userRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
    }

    private void enrichWorkerAdData(WorkerAd ad) {
        userRepository.findById(ad.getWorkerId()).ifPresent(user -> {
            ad.setFullName(user.getFullName() != null && !user.getFullName().isEmpty()
                    ? user.getFullName() : user.getUsername());
            ad.setAvatar(user.getAvatar());
            ad.setWorkerRating(user.getRating());
            ad.setWorkerRatingCount(user.getRatingCount());
            ad.setNumericId(user.getNumericId());
        });
    }


    public List<WorkerAd> getAdsByWorker(String workerId) {
        List<WorkerAd> ads = repository.findByWorkerId(workerId);
        ads.forEach(this::enrichWorkerAdData);
        return ads;
    }

    public List<WorkerAd> getAllAds() {
        List<WorkerAd> ads = repository.findAll();
        ads.forEach(this::enrichWorkerAdData);
        return ads;
    }
    
    public WorkerAd getById(String id) {
        WorkerAd ad = repository.findById(id).orElse(null);
        if (ad != null) enrichWorkerAdData(ad);
        return ad;
    }

    public WorkerAd createAd(WorkerAd ad) {
        WorkerAd savedAd = repository.save(ad);
        enrichWorkerAdData(savedAd);
        return savedAd;
    }


    public void updateStatus(String adId, WorkerAdStatus status) {
        repository.findById(adId).ifPresent(ad -> {
            ad.setStatus(status);
            repository.save(ad);
        });
    }

    public void deleteAd(String adId) {
        repository.deleteById(adId);
    }
}
