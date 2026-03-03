package com.hlgtech.api.workerad.controller;

import com.hlgtech.api.workerad.model.WorkerAd;
import com.hlgtech.api.workerad.model.WorkerAdStatus;
import com.hlgtech.api.workerad.service.WorkerAdService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/worker-ads")
public class WorkerAdController {

    private final WorkerAdService service;

    public WorkerAdController(WorkerAdService service) {
        this.service = service;
    }

    @GetMapping("/worker/{workerId}")
    public ResponseEntity<List<WorkerAd>> getAdsByWorker(@PathVariable String workerId) {
        return ResponseEntity.ok(service.getAdsByWorker(workerId));
    }

    @GetMapping
    public ResponseEntity<List<WorkerAd>> getAllAds() {
        return ResponseEntity.ok(service.getAllAds());
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkerAd> getById(@PathVariable String id) {
        return ResponseEntity.ok(service.getById(id));
    }


    @PostMapping
    public ResponseEntity<WorkerAd> createAd(@RequestBody WorkerAd ad) {
        return ResponseEntity.ok(service.createAd(ad));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Void> updateStatus(@PathVariable String id, @RequestParam WorkerAdStatus status) {
        service.updateStatus(id, status);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAd(@PathVariable String id) {
        service.deleteAd(id);
        return ResponseEntity.ok().build();
    }
}
