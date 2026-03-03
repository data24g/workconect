package com.hlgtech.api.report.service;

import com.hlgtech.api.report.model.Report;
import com.hlgtech.api.report.repository.ReportRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReportService {

    private final ReportRepository reportRepository;

    public ReportService(ReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    public Report create(Report report) {
        report.setCreatedAt(System.currentTimeMillis());
        return reportRepository.save(report);
    }

    public List<Report> getAll() {
        return reportRepository.findAll();
    }
}
