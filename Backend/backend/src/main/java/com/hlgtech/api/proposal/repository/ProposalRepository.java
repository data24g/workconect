package com.hlgtech.api.proposal.repository;

import com.hlgtech.api.proposal.model.Proposal;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ProposalRepository extends MongoRepository<Proposal, String> {
    List<Proposal> findByAdId(String adId);
    List<Proposal> findByBusinessId(String businessId);
    boolean existsByAdIdAndBusinessId(String adId, String businessId);
}

