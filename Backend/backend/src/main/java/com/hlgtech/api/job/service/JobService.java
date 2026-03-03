package com.hlgtech.api.job.service;

import com.hlgtech.api.job.dto.JobRequestDTO;
import com.hlgtech.api.job.model.Job;
import com.hlgtech.api.job.model.JobStatus;
import com.hlgtech.api.job.repository.JobRepository;
import com.hlgtech.api.auth.model.User;
import com.hlgtech.api.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class JobService {

    private final JobRepository repository;
    private final UserRepository userRepository;
    private final com.hlgtech.api.notification.service.NotificationService notificationService;
    private final org.springframework.data.mongodb.core.MongoTemplate mongoTemplate;

    @Autowired
    public JobService(JobRepository repository, UserRepository userRepository,
            com.hlgtech.api.notification.service.NotificationService notificationService,
            org.springframework.data.mongodb.core.MongoTemplate mongoTemplate) {
        this.repository = repository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.mongoTemplate = mongoTemplate;
    }

    /**
     * Hàm phụ trợ: Gán thông tin Doanh nghiệp (Name, Avatar, Rating) vào Job object
     * Giúp đồng bộ dữ liệu ở mọi trang hiển thị
     */
    // Trong JobService.java - Hàm enrichJobData
    private void enrichJobData(Job job) {
        String bizId = job.getBusinessId();
        if (bizId == null || bizId.trim().isEmpty())
            return;
        bizId = bizId.trim();

        // Use mongoTemplate for direct ID lookup
        User employer = mongoTemplate.findById(bizId, User.class);

        if (employer == null) {
            employer = userRepository.findByUsername(bizId).orElse(null);
        }

        if (employer != null) {
            String name = (employer.getCompanyName() != null && !employer.getCompanyName().isEmpty())
                    ? employer.getCompanyName()
                    : (employer.getFullName() != null && !employer.getFullName().isEmpty()
                            ? employer.getFullName()
                            : employer.getUsername());

            job.setBusinessName(name);
            job.setBusinessAvatar(employer.getAvatar());
            job.setBusinessRating(employer.getRating() != null ? employer.getRating() : 0.0);
            job.setBusinessRatingCount(employer.getRatingCount() != null ? employer.getRatingCount() : 0);
            job.setBusinessNumericId(employer.getNumericId());
        }
    }

    /* --- CÁC HÀM NGHIỆP VỤ --- */

    public List<Job> getAll() {
        List<Job> jobs = repository.findAll();
        jobs.forEach(this::enrichJobData); // Gán info cho từng job
        return jobs;
    }

    public List<Job> getByBusiness(String businessId) {
        List<Job> jobs = repository.findByBusinessId(businessId);
        jobs.forEach(this::enrichJobData); // Đảm bảo trang quản lý của Business cũng hiện đúng info
        return jobs;
    }

    public Job getById(String id) {
        Job job = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job không tồn tại"));
        enrichJobData(job); // Gán info cho trang chi tiết
        return job;
    }

    public Job create(Job job) {
        job.setStatus(JobStatus.OPEN); // Bắt đầu ở trạng thái OPEN theo yêu cầu
        Job savedJob = repository.save(job);
        enrichJobData(savedJob);

        notificationService.notifyAdmins("Tin tuyển dụng mới cần kiểm duyệt: " + job.getTitle(),
                com.hlgtech.api.notification.model.NotificationType.JOB_POSTED);

        return savedJob;
    }

    public Job update(String id, JobRequestDTO dto) {
        Job job = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job không tồn tại"));

        job.setTitle(dto.getTitle());
        job.setRequirements(dto.getRequirements());
        job.setSalary(dto.getSalary());
        job.setLocation(dto.getLocation());
        job.setType(dto.getType());
        job.setDescription(dto.getDescription());
        job.setMinRating(dto.getMinRating());

        Job updatedJob = repository.save(job);
        enrichJobData(updatedJob);
        return updatedJob;
    }

    public Job updateStatus(String jobId, JobStatus status) {
        Job job = repository.findById(jobId).orElseThrow();
        job.setStatus(status);
        return repository.save(job);
    }

    public void delete(String id) {
        repository.deleteById(id);
    }
}