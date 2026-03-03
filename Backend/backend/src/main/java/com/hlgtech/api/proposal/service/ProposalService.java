package com.hlgtech.api.proposal.service;

import com.hlgtech.api.auth.repository.UserRepository;
import com.hlgtech.api.proposal.dto.ProposalDTO;
import com.hlgtech.api.proposal.model.Proposal;
import com.hlgtech.api.proposal.repository.ProposalRepository;
import com.hlgtech.api.workerad.repository.WorkerAdRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProposalService {

    private final ProposalRepository repository;
    private final UserRepository userRepository;
    private final WorkerAdRepository workerAdRepository;
    private final com.hlgtech.api.notification.service.NotificationService notificationService;
    private final com.hlgtech.api.worksession.service.WorkSessionService workSessionService;

    public ProposalService(ProposalRepository repository, 
                           UserRepository userRepository, 
                           WorkerAdRepository workerAdRepository,
                           com.hlgtech.api.notification.service.NotificationService notificationService,
                           com.hlgtech.api.worksession.service.WorkSessionService workSessionService) {
        this.repository = repository;
        this.userRepository = userRepository;
        this.workerAdRepository = workerAdRepository;
        this.notificationService = notificationService;
        this.workSessionService = workSessionService;
    }


    public List<ProposalDTO> getProposalsForAd(String adId) {
        List<Proposal> proposals = repository.findByAdId(adId);
        return proposals.stream().map(p -> {
            ProposalDTO dto = new ProposalDTO();
            dto.setId(p.getId());
            dto.setAdId(p.getAdId());
            dto.setBusinessId(p.getBusinessId());
            dto.setMessage(p.getMessage());
            dto.setStatus(p.getStatus());
            dto.setSentAt(p.getSentAt());

            userRepository.findById(p.getBusinessId()).ifPresent(user -> {
                dto.setBusinessName(user.getFullName() != null ? user.getFullName() : user.getUsername());
                dto.setBusinessAvatar(user.getAvatar());
                dto.setBusinessNumericId(user.getNumericId());
            });

            return dto;
        }).collect(Collectors.toList());
    }

    public List<ProposalDTO> getProposalsByWorker(String workerId) {
        return workerAdRepository.findByWorkerId(workerId).stream()
                .flatMap(ad -> getProposalsForAd(ad.getId()).stream())
                .collect(Collectors.toList());
    }

    public List<ProposalDTO> getProposalsByBusiness(String businessId) {
        List<Proposal> proposals = repository.findByBusinessId(businessId);
        return proposals.stream().map(p -> {
            ProposalDTO dto = new ProposalDTO();
            dto.setId(p.getId());
            dto.setAdId(p.getAdId());
            dto.setBusinessId(p.getBusinessId());
            dto.setMessage(p.getMessage());
            dto.setStatus(p.getStatus());
            dto.setSentAt(p.getSentAt());

            userRepository.findById(p.getBusinessId()).ifPresent(user -> {
                dto.setBusinessName(user.getFullName() != null ? user.getFullName() : user.getUsername());
                dto.setBusinessAvatar(user.getAvatar());
                dto.setBusinessNumericId(user.getNumericId());
            });

            return dto;
        }).collect(Collectors.toList());
    }


    public void createProposal(String adId, String businessId, String message) {
        if (repository.existsByAdIdAndBusinessId(adId, businessId)) {
            throw new RuntimeException("Bạn đã gửi lời mời cho bài đăng này rồi.");
        }
        Proposal proposal = new Proposal();
        proposal.setAdId(adId);
        proposal.setBusinessId(businessId);
        proposal.setMessage(message);
        repository.save(proposal);

        // Notify Worker
        workerAdRepository.findById(adId).ifPresent(ad -> {
            String bInfo = userRepository.findById(businessId)
                .map(u -> {
                    String name = u.getFullName() != null && !u.getFullName().isEmpty() ? u.getFullName() : u.getUsername();
                    String idStr = u.getNumericId() != null ? " (@" + u.getNumericId() + ")" : "";
                    return name + idStr;
                })
                .orElse("Một nhà tuyển dụng");
            String msg = bInfo + " đã gửi lời mời làm việc cho bài đăng: " + ad.getTitle();
            notificationService.createNotification(ad.getWorkerId(), msg, com.hlgtech.api.notification.model.NotificationType.PROPOSAL);
        });

    }

    public void updateStatus(String id, String status) {
        Proposal proposal = repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy lời mời"));
        
        proposal.setStatus(status);
        repository.save(proposal);

        if ("ACCEPTED".equals(status)) {
            // Create WorkSession
            workerAdRepository.findById(proposal.getAdId()).ifPresent(ad -> {
                workSessionService.createSessionFromProposal(ad.getId(), proposal.getBusinessId(), ad.getWorkerId());
            });
        }
    }


}
