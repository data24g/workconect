package com.hlgtech.api.masterdata.controller;

import com.hlgtech.api.masterdata.dto.LocationDTO;
import com.hlgtech.api.masterdata.service.MasterDataService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/master-data")
public class MasterDataController {

    private final MasterDataService service;

    public MasterDataController(MasterDataService service) {
        this.service = service;
    }

    @GetMapping("/locations")
    public ResponseEntity<List<LocationDTO>> getLocations() {
        return ResponseEntity.ok(service.getLocations());
    }

    @GetMapping("/industries")
    public ResponseEntity<List<String>> getIndustries() {
        return ResponseEntity.ok(service.getIndustries());
    }
}
