package com.hlgtech.api.job.controller;

import com.hlgtech.api.core.ResponseObject;
import com.hlgtech.api.job.dto.JobRequestDTO;
import com.hlgtech.api.job.model.Job;
import com.hlgtech.api.job.model.JobStatus;
import com.hlgtech.api.job.service.JobService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobService service;

    @Autowired
    public JobController(JobService service) {
        this.service = service;
    }

    /* --- KHỐI LẤY DANH SÁCH JOB --- */
    @GetMapping
    public ResponseObject getAll() {
        // Service bây giờ đã tự điền thêm tên và ảnh doanh nghiệp
        return new ResponseObject(200, service.getAll(), "All jobs with business info");
    }

    @PreAuthorize("hasRole('BUSINESS') or hasRole('ADMIN')")
    @PostMapping
    public ResponseObject create(@Valid @RequestBody JobRequestDTO dto) {
        Job job = new Job();
        job.setBusinessId(dto.getBusinessId());
        job.setRequirements(dto.getRequirements());
        job.setTitle(dto.getTitle());
        job.setSalary(dto.getSalary());
        job.setLocation(dto.getLocation());
        job.setType(dto.getType());
        job.setDescription(dto.getDescription());
        job.setMinRating(dto.getMinRating());
        job.setPostedAt(java.time.LocalDateTime.now());
        // Mặc định khi tạo mới là OPEN
        job.setStatus(JobStatus.OPEN);
        return new ResponseObject(200, service.create(job), "Job created");
    }

    // 👇 ĐÃ SỬA: Cho phép BUSINESS cập nhật trạng thái
    @PreAuthorize("hasRole('BUSINESS') or hasRole('ADMIN')")
    @PutMapping("/{id}/status")
    public ResponseObject updateStatus(
            @PathVariable String id,
            @RequestParam JobStatus status) {
        return new ResponseObject(200,
                service.updateStatus(id, status),
                "Job status updated");
    }

    @GetMapping("/business/{businessId}")
    public ResponseObject getByBusiness(@PathVariable String businessId) {
        return new ResponseObject(
                200,
                service.getByBusiness(businessId),
                "Jobs by business");
    }

    @PreAuthorize("hasRole('BUSINESS') or hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseObject delete(@PathVariable String id) {
        service.delete(id); // Cần thêm hàm delete vào Service nữa nhé
        return new ResponseObject(200, null, "Xóa công việc thành công");
    }

    @PreAuthorize("hasRole('BUSINESS') or hasRole('ADMIN')") // Thêm để đồng bộ bảo mật
    @GetMapping("/{id}")
    public ResponseObject getById(@PathVariable String id) {
        Job job = service.getById(id);
        if (job == null) {
            return new ResponseObject(404, null, "Not Found");
        }
        return new ResponseObject(200, job, "Success");
    }

    // 2. Cập nhật Job (PUT /api/jobs/{id})
    // Lưu ý: Dùng DTO giống lúc tạo mới
    @PreAuthorize("hasRole('BUSINESS') or hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseObject update(@PathVariable String id, @RequestBody JobRequestDTO dto) {
        return new ResponseObject(200, service.update(id, dto), "Job updated");
    }

}
