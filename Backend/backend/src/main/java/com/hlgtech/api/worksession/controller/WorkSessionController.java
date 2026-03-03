package com.hlgtech.api.worksession.controller;

import com.hlgtech.api.core.ResponseObject;
import com.hlgtech.api.worksession.model.WorkSession;
import com.hlgtech.api.worksession.model.WorkSessionStatus;
import com.hlgtech.api.worksession.service.WorkSessionService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;

import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/work-sessions")
public class WorkSessionController {

    private final WorkSessionService service;

    public WorkSessionController(WorkSessionService service) {
        this.service = service;
    }

    // 1️⃣ CREATE / CONFIRM WORK SESSION
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ResponseObject> create(@RequestBody(required = false) Map<String, Object> payload) {
        if (payload == null) {
            return ResponseEntity.badRequest().body(new ResponseObject(400, null, "Payload is missing"));
        }
        try {
            WorkSession created = service.createFromMap(payload);
            // Trả về ResponseObject để frontend dễ xử lý chung
            return ResponseEntity.ok(new ResponseObject(200, created, "Ứng tuyển thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ResponseObject(500, null, e.getMessage()));
        }
    }

    // 2️⃣ GET BY JOB: Thêm hàm này vào (QUAN TRỌNG NHẤT)
    // Để trang quản lý của nhà tuyển dụng lấy được danh sách người nộp đơn
    @PreAuthorize("hasRole('BUSINESS') or hasRole('ADMIN')")
    @GetMapping("/job/{jobId}")
    public ResponseObject getByJobId(@PathVariable String jobId) {
        // Lưu ý: Đảm bảo service.getByJobId(jobId) đã được viết trong Service
        return new ResponseObject(
                200,
                service.getByJobId(jobId),
                "Danh sách ứng viên"
        );
    }


//    // 2️⃣ MARK WORK SESSION DONE
//    @PreAuthorize("hasRole('BUSINESS')")
//    @PutMapping("/{id}/status")
//    public ResponseObject updateStatus(
//            @PathVariable String id,
//            @RequestParam WorkSessionStatus status
//    ) {
//        return new ResponseObject(
//                200,
//                service.changeStatus(id, status),
//                "Work session status updated"
//        );
//    }

    // 2.2️⃣ UPDATE WORK SESSION FIELDS (GENERIC)
    @PutMapping("/{id}")
    public Object update(
            @PathVariable String id,
            @RequestBody Map<String, Object> updates
    ) {
        try {
            return service.update(id, updates);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseObject(500, null, "Update failed: " + e.getMessage());
        }
    }

    // 2.5️⃣ DELETE WORK SESSION
    @DeleteMapping("/{id}")
    public ResponseObject delete(@PathVariable String id) {
        service.delete(id);
        return new ResponseObject(
                200,
                null,
                "Work session deleted"
        );
    }

    // 3️⃣ LIST ALL WORK SESSIONS (DEBUG / DASHBOARD)
    @GetMapping
    public java.util.List<WorkSession> getAll() {
        try {
            System.out.println(">>> [GET /api/work-sessions] Fetching all work sessions...");
            java.util.List<WorkSession> sessions = service.getAll();
            System.out.println(">>> [GET /api/work-sessions] Found " + sessions.size() + " work sessions in database");
            if (sessions.size() > 0) {
                System.out.println(">>> First session: " + sessions.get(0).getId());
            }
            return sessions;
        } catch (Exception e) {
            System.err.println(">>> ERROR in getAll work sessions:");
            e.printStackTrace();
            return new java.util.ArrayList<>();
        }
    }

    // DEBUG: Check total count in database
    @GetMapping("/count")
    public ResponseEntity<?> getCount() {
        try {
            long count = service.getAll().size();
            Map<String, Object> response = new HashMap<>();
            response.put("count", count);
            response.put("message", "Total work sessions in database");
            System.out.println(">>> [GET /count] Returning count: " + count);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/statuses")
    public ResponseObject getAllStatuses() {
        return new ResponseObject(
                200,
                WorkSessionStatus.values(),
                "Work session statuses"
        );
    }

    // 👷 Worker view
    @PreAuthorize("hasRole('WORKER')")
    @GetMapping("/worker/{workerId}")
    public ResponseObject getByWorker(@PathVariable String workerId) {
        return new ResponseObject(
                200,
                service.getByWorker(workerId),
                "Worker work sessions"
        );
    }

    // 🏢 Business view
    @PreAuthorize("hasRole('BUSINESS')")
    @GetMapping("/business/{businessId}")
    public ResponseObject getByBusiness(@PathVariable String businessId) {
        return new ResponseObject(
                200,
                service.getByBusiness(businessId),
                "Business work sessions"
        );
    }

    // 🔧 MIGRATION: Update names for old work sessions
    @PostMapping("/migrate-names")
    public ResponseEntity<?> migrateNames() {
        try {
            System.out.println(">>> [MIGRATION] Starting name migration for old work sessions...");
            int updated = service.migrateOldWorkSessionNames();
            Map<String, Object> response = new HashMap<>();
            response.put("updated", updated);
            response.put("message", "Successfully updated " + updated + " work sessions");
            System.out.println(">>> [MIGRATION] Completed. Updated " + updated + " work sessions");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println(">>> [MIGRATION] Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Migration failed: " + e.getMessage());
        }
    }

    @DeleteMapping("/delete-all-data")
    public ResponseObject deleteAllData() {
        service.deleteAll();
        return new ResponseObject(200, null, "Đã xóa sạch dữ liệu!");
    }

    @GetMapping("/{id}")
    public ResponseObject getById(@PathVariable String id) {
        WorkSession session = service.getById(id);
        if (session == null) {
            return new ResponseObject(404, null, "Không tìm thấy phiên");
        }
        return new ResponseObject(200, session, "Thành công");
    }

    // Trong file WorkSessionController.java

    @PutMapping("/{id}/complete") // Đảm bảo đúng cấu trúc này
    public ResponseObject completeSession(
            @PathVariable("id") String id,
            @RequestParam("rating") Double rating,
            @RequestParam(value = "comment", required = false) String comment
    ) {
        // 1. Xác định vai trò người đang thực hiện thao tác
        String reviewerRole = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication().getAuthorities().toString().contains("BUSINESS") ? "BUSINESS" : "WORKER";

        // 2. Gọi service xử lý
        return new ResponseObject(200,
                service.completeAndRate(id, rating, comment, reviewerRole),
                "Xác thực và đánh giá thành công");
    }

    @PutMapping("/{id}/status")
    public ResponseObject updateStatus(
            @PathVariable String id,
            @RequestParam String status,
            @RequestParam(required = false) String reason // 👈 Nhận thêm tham số reason
    ) {
        return new ResponseObject(200, service.updateStatus(id, status, reason), "Cập nhật thành công");
    }


}
