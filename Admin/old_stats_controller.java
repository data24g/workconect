package com.hlgtech.api.stats.controller;

import com.hlgtech.api.auth.model.Role;
import com.hlgtech.api.auth.repository.UserRepository;
import com.hlgtech.api.core.ResponseObject;
import com.hlgtech.api.job.repository.JobRepository;
import com.hlgtech.api.worksession.repository.WorkSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/stats")
@PreAuthorize("hasRole('ADMIN')")
public class StatsController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private WorkSessionRepository workSessionRepository;

    // GET /api/admin/stats/dashboard
    @GetMapping("/dashboard")
    public ResponseObject getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        // Total users (all roles)
        long totalUsers = userRepository.count();
        stats.put("totalUsers", totalUsers);

        // Total workers
        long totalWorkers = userRepository.findAll().stream()
                .filter(user -> {
                    Object role = user.getRole();
                    return role != null && role.toString().toUpperCase().contains("WORKER");
                })
                .count();
        stats.put("totalWorkers", totalWorkers);

        // Total businesses
        long totalBusinesses = userRepository.findAll().stream()
                .filter(user -> {
                    Object role = user.getRole();
                    String roleStr = role != null ? role.toString().toUpperCase() : "";
                    return roleStr.contains("BUSINESS") || roleStr.contains("EMPLOYER");
                })
                .count();
        stats.put("totalBusinesses", totalBusinesses);

        // Pending KYC verifications
        long pendingKYC = userRepository.findAll().stream()
                .filter(user -> {
                    Object role = user.getRole();
                    String roleStr = role != null ? role.toString().toUpperCase() : "";
                    boolean isBusiness = roleStr.contains("BUSINESS") || roleStr.contains("EMPLOYER");
                    return isBusiness && !user.isVerified();
                })
                .count();
        stats.put("pendingKYC", pendingKYC);

        // Total jobs
        long totalJobs = jobRepository.count();
        stats.put("totalJobs", totalJobs);

        // Total work sessions
        long totalSessions = workSessionRepository.count();
        stats.put("totalWorkSessions", totalSessions);

        // TODO: Calculate total revenue from transactions
        // This would require a Transaction/Payment repository
        stats.put("totalRevenue", 0.0);

        // Active users (last 30 days)
        // Note: This requires tracking last login time in User model
        stats.put("activeUsersLast30Days", 0);

        return new ResponseObject(200, stats, "Dashboard statistics");
    }

    // GET /api/admin/stats/revenue?months=12
    @GetMapping("/revenue")
    public ResponseObject getRevenueStats(@RequestParam(defaultValue = "12") int months) {
        List<Map<String, Object>> revenueData = new ArrayList<>();

        // TODO: Implement actual revenue calculation from transactions
        // For now, return mock data structure
        YearMonth current = YearMonth.now();
        for (int i = months - 1; i >= 0; i--) {
            YearMonth month = current.minusMonths(i);
            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", month.toString());
            monthData.put("revenue", 0.0); // Would calculate from actual transactions
            monthData.put("transactions", 0); // Count of transactions in that month
            revenueData.add(monthData);
        }

        return new ResponseObject(200, revenueData,
                "Revenue data for last " + months + " months");
    }
}
