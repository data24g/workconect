package com.hlgtech.api.proposal.controller;

import com.hlgtech.api.proposal.dto.ProposalDTO;
import com.hlgtech.api.proposal.service.ProposalService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/proposals")
public class ProposalController {

    private final ProposalService service;

    public ProposalController(ProposalService service) {
        this.service = service;
    }

    @GetMapping("/worker/{workerId}")
    public ResponseEntity<List<ProposalDTO>> getProposalsByWorker(@PathVariable String workerId) {
        return ResponseEntity.ok(service.getProposalsByWorker(workerId));
    }

    @GetMapping("/business/{businessId}")
    public ResponseEntity<List<ProposalDTO>> getProposalsByBusiness(@PathVariable String businessId) {
        return ResponseEntity.ok(service.getProposalsByBusiness(businessId));
    }


    @GetMapping("/ad/{adId}")
    public ResponseEntity<List<ProposalDTO>> getProposalsForAd(@PathVariable String adId) {
        return ResponseEntity.ok(service.getProposalsForAd(adId));
    }

    @PostMapping
    public ResponseEntity<Void> createProposal(@RequestParam String adId, @RequestParam String businessId, @RequestParam String message) {
        service.createProposal(adId, businessId, message);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Void> updateStatus(@PathVariable String id, @RequestParam String status) {
        service.updateStatus(id, status);
        return ResponseEntity.ok().build();
    }

}
