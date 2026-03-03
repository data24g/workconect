package com.hlgtech.api.job.service;

import com.hlgtech.api.auth.model.User;
import com.hlgtech.api.auth.repository.UserRepository;
import com.hlgtech.api.job.dto.JobApplicationDTO;
import com.hlgtech.api.job.model.Job;
import com.hlgtech.api.job.model.JobApplication;
import com.hlgtech.api.job.model.JobApplicationStatus;
import com.hlgtech.api.job.repository.JobApplicationRepository;
import com.hlgtech.api.job.repository.JobRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class JobApplicationService {

    private final JobApplicationRepository repository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    public JobApplicationService(JobApplicationRepository repository, JobRepository jobRepository, UserRepository userRepository) {
        this.repository = repository;
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
    }

    public List<JobApplicationDTO> getApplicantsForJob(String jobId) {
        List<JobApplication> applications = repository.findByJobId(jobId);
        Job job = jobRepository.findById(jobId).orElse(null);
        String jobTitle = (job != null) ? job.getTitle() : "Unknown Job";

        return applications.stream().map(app -> {
            JobApplicationDTO dto = new JobApplicationDTO();
            dto.setId(app.getId());
            dto.setJobId(app.getJobId());
            dto.setJobTitle(jobTitle);
            dto.setWorkerId(app.getWorkerId());
            dto.setStatus(app.getStatus());
            dto.setAppliedAt(app.getAppliedAt());
            dto.setIntroMessage(app.getIntroMessage());

            userRepository.findById(app.getWorkerId()).ifPresent(user -> {
                dto.setWorkerName(user.getFullName() != null ? user.getFullName() : user.getUsername());
                dto.setWorkerAvatar(user.getAvatar());
            });

            return dto;
        }).collect(Collectors.toList());
    }

    public void applyForJob(String jobId, String workerId, String introMessage) {
        JobApplication application = new JobApplication(jobId, workerId, introMessage);
        repository.save(application);
    }

    public void updateStatus(String applicationId, JobApplicationStatus status) {
        repository.findById(applicationId).ifPresent(app -> {
            app.setStatus(status);
            repository.save(app);
        });
    }

    public List<JobApplicationDTO> getApplicantsByBusiness(String businessId) {
        List<Job> businessJobs = jobRepository.findAll().stream()
                .filter(j -> businessId.equals(j.getBusinessId()))
                .collect(Collectors.toList());
        
        return businessJobs.stream()
                .flatMap(job -> getApplicantsForJob(job.getId()).stream())
                .collect(Collectors.toList());
    }
}
