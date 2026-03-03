package com.hlgtech.api.report.controller;

import com.hlgtech.api.core.ResponseObject;
import com.hlgtech.api.report.model.Report;
import com.hlgtech.api.report.service.ReportService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService service;

    public ReportController(ReportService service) {
        this.service = service;
    }

    // ✅ ANY AUTHENTICATED USER CAN REPORT
    @PreAuthorize("isAuthenticated()")
    @PostMapping
    public ResponseObject report(@RequestBody Report report) {
        return new ResponseObject(
                200,
                service.create(report),
                "Report submitted"
        );
    }

    // ✅ ADMIN CAN VIEW ALL REPORTS
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseObject getAll() {
        return new ResponseObject(
                200,
                service.getAll(),
                "All reports"
        );
    }
}
