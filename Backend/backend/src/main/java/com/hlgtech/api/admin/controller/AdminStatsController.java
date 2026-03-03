package com.hlgtech.api.admin.controller;

import com.hlgtech.api.auth.model.Role;
import com.hlgtech.api.auth.repository.UserRepository;
import com.hlgtech.api.job.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.YearMonth;
import java.util.*;

@RestController
@RequestMapping("/api/admin/stats")
@PreAuthorize("hasRole('ADMIN')")
public class AdminStatsController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private com.hlgtech.api.report.repository.ReportRepository reportRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardStats() {
        try {
            Map<String, Object> stats = new HashMap<>();

            // 1. Total users
            long totalUsers = userRepository.count();
            stats.put("totalUsers", totalUsers);

            // 2. Workers
            List<com.hlgtech.api.auth.model.User> workers = userRepository.findByRole(Role.WORKER);
            stats.put("totalWorkers", workers != null ? workers.size() : 0);

            // 3. Employers
            List<com.hlgtech.api.auth.model.User> employers = userRepository.findByRole(Role.BUSINESS);
            stats.put("totalEmployers", employers != null ? employers.size() : 0);

            // 4. Pending Verifications
            long pendingVerifications = 0;
            if (employers != null) {
                pendingVerifications = employers.stream()
                        .filter(u -> u != null && Boolean.FALSE.equals(u.isVerified()))
                        .count();
            }
            stats.put("pendingVerifications", pendingVerifications);

            // 5. Active Jobs
            long activeJobs = 0;
            try {
                activeJobs = jobRepository.findAll().stream()
                        .filter(j -> j != null && j.getStatus() != null && "OPEN".equals(j.getStatus().toString()))
                        .count();
            } catch (Exception e) {
                System.err.println("Error counting jobs: " + e.getMessage());
            }
            stats.put("activeJobs", activeJobs);

            // 6. Reports
            long totalReports = 0;
            long openReports = 0;
            try {
                totalReports = reportRepository.count();
                openReports = reportRepository.findAll().stream()
                        .filter(r -> r != null && (r.getStatus() == null || "OPEN".equals(r.getStatus().toString())))
                        .count();
            } catch (Exception e) {
                System.err.println("Error counting reports: " + e.getMessage());
            }
            stats.put("totalReports", totalReports);
            stats.put("openReports", openReports);

            // 7. Mock Revenue
            stats.put("totalRevenue", 15000000.0);

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage(), "stackTrace", "Check server logs"));
        }
    }

    @GetMapping("/revenue")
    public ResponseEntity<List<Map<String, Object>>> getRevenueStats(@RequestParam(defaultValue = "12") int months) {
        List<Map<String, Object>> revenueData = new ArrayList<>();

        YearMonth current = YearMonth.now();
        Random random = new Random();

        for (int i = months - 1; i >= 0; i--) {
            YearMonth month = current.minusMonths(i);
            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", month.toString());
            monthData.put("revenue", 1000000 + random.nextInt(5000000));
            monthData.put("transactions", 10 + random.nextInt(50));
            revenueData.add(monthData);
        }

        return ResponseEntity.ok(revenueData);
    }
}
