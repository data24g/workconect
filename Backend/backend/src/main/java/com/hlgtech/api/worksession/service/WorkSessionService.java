package com.hlgtech.api.worksession.service;

import com.hlgtech.api.auth.model.User;
import com.hlgtech.api.auth.repository.UserRepository;
import com.hlgtech.api.job.repository.JobRepository;
import com.hlgtech.api.worksession.model.WorkSession;
import com.hlgtech.api.worksession.model.WorkSessionStatus;
import com.hlgtech.api.worksession.repository.WorkSessionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class WorkSessionService {

    private final WorkSessionRepository repository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final com.hlgtech.api.workerad.repository.WorkerAdRepository workerAdRepository;
    private final com.hlgtech.api.notification.service.NotificationService notificationService;

    public WorkSessionService(WorkSessionRepository repository,
                              UserRepository userRepository,
                              JobRepository jobRepository,
                              com.hlgtech.api.workerad.repository.WorkerAdRepository workerAdRepository,
                              com.hlgtech.api.notification.service.NotificationService notificationService) {
        this.repository = repository;
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
        this.workerAdRepository = workerAdRepository;
        this.notificationService = notificationService;
    }



    /**
     * ✅ LÀM GIÀU DỮ LIỆU: Điền tên đối tác và tên công việc
     */
    private void enrichSessionDetails(WorkSession s) {
        if (s == null) return;

        userRepository.findById(s.getBusinessId()).ifPresent(b -> {
            s.setBusinessName(b.getFullName() != null && !b.getFullName().isEmpty()
                    ? b.getFullName() : b.getUsername());
            s.setBusinessAvatar(b.getAvatar());
            s.setBusinessNumericId(b.getNumericId());
        });

        userRepository.findById(s.getWorkerId()).ifPresent(w -> {
            s.setWorkerName(w.getFullName() != null && !w.getFullName().isEmpty()
                    ? w.getFullName() : w.getUsername());
            s.setWorkerAvatar(w.getAvatar());
            s.setWorkerNumericId(w.getNumericId());
        });

        if (s.getJobId() != null) {
            jobRepository.findById(s.getJobId()).ifPresent(j -> {
                s.setJobTitle(j.getTitle());
            });

            // Nếu vẫn chưa có title (có thể là bài đăng tìm việc của Worker), check WorkerAd
            if (s.getJobTitle() == null || s.getJobTitle().isEmpty()) {
                workerAdRepository.findById(s.getJobId()).ifPresent(ad -> {
                    s.setJobTitle("Hợp tác: " + ad.getTitle());
                });
            }
        }
    }


    /**
     * ✅ CẬP NHẬT RATING VÀO HỒ SƠ USER (GPA)
     * Công thức: NewAvg = ((OldAvg * OldCount) + NewScore) / (OldCount + 1)
     */
    // 1. Hàm tính toán GPA chuẩn (Tránh cộng dồn ratingCount sai lệch)
    private void updateUserProfileRating(String userId, Double newScore, Double oldScore) {
        userRepository.findById(userId).ifPresent(user -> {
            double currentRating = (user.getRating() != null) ? user.getRating() : 0.0;
            int currentCount = (user.getRatingCount() != null) ? user.getRatingCount() : 0;

            double updatedRating;
            if (oldScore == null) {
                // TRƯỜNG HỢP 1: Đánh giá mới hoàn toàn -> Tăng số lượt (Count)
                updatedRating = ((currentRating * currentCount) + newScore) / (currentCount + 1);
                user.setRatingCount(currentCount + 1);
            } else {
                // TRƯỜP HỢP 2: Chỉnh sửa đánh giá cũ -> Giữ nguyên số lượt (Count)
                double totalScore = (currentRating * currentCount) - oldScore + newScore;
                updatedRating = totalScore / currentCount;
            }

            // Làm tròn về 1 chữ số thập phân (Ví dụ: 4.5)
            user.setRating(Math.round(updatedRating * 10.0) / 10.0);
            userRepository.save(user);
        });
    }

    // 2. Hàm hoàn thành phiên (Lầy điểm cũ để truyền vào hàm tính toán trên)
    public WorkSession completeAndRate(String id, Double newRating, String comment, String reviewerRole) {
        WorkSession session = repository.findById(id).orElseThrow();
        Double oldRating = null;
        String now = LocalDateTime.now().toString();

        if ("BUSINESS".equals(reviewerRole)) {
            // Business đang đánh giá Worker
            if (session.isBusinessRated()) {
                oldRating = session.getWorkerRating();
            }
            
            if (session.getBusinessToWorkerHistory() == null) {
                session.setBusinessToWorkerHistory(new java.util.ArrayList<>());
            }

            // Logic Lịch sử:
            String type = "initial";
            int editCount = 0;
            if (session.isBusinessRated()) {
                if (session.getBusinessToWorkerHistory().isEmpty()) {
                    WorkSession.RatingHistoryEntry initialEntry = new WorkSession.RatingHistoryEntry(
                        oldRating, session.getWorkerComment(), session.getUpdatedAt(), "initial", 0
                    );
                    session.getBusinessToWorkerHistory().add(initialEntry);
                }
                editCount = session.getBusinessToWorkerHistory().size();
                type = (newRating != null && !newRating.equals(oldRating)) ? "edit" : "supplement";
            }
            
            WorkSession.RatingHistoryEntry currentEntry = new WorkSession.RatingHistoryEntry(newRating, comment, now, type, editCount);
            session.getBusinessToWorkerHistory().add(currentEntry);

            session.setWorkerRating(newRating);
            session.setWorkerComment(comment);
            session.setBusinessRated(true); // Đánh dấu Business ĐÃ đánh giá
        } else {
            // Worker đang đánh giá Business
            if (session.isWorkerRated()) {
                oldRating = session.getBusinessRating();
            }

            if (session.getWorkerToBusinessHistory() == null) {
                session.setWorkerToBusinessHistory(new java.util.ArrayList<>());
            }

            // Logic Lịch sử:
            String type = "initial";
            int editCount = 0;
            if (session.isWorkerRated()) {
                if (session.getWorkerToBusinessHistory().isEmpty()) {
                    WorkSession.RatingHistoryEntry initialEntry = new WorkSession.RatingHistoryEntry(
                        oldRating, session.getBusinessComment(), session.getUpdatedAt(), "initial", 0
                    );
                    session.getWorkerToBusinessHistory().add(initialEntry);
                }
                editCount = session.getWorkerToBusinessHistory().size();
                type = (newRating != null && !newRating.equals(oldRating)) ? "edit" : "supplement";
            }

            WorkSession.RatingHistoryEntry currentEntry = new WorkSession.RatingHistoryEntry(newRating, comment, now, type, editCount);
            session.getWorkerToBusinessHistory().add(currentEntry);

            session.setBusinessRating(newRating);
            session.setBusinessComment(comment);
            session.setWorkerRated(true); // Đánh dấu Worker ĐÃ đánh giá
        }

        if (session.getFirstRatedAt() == null) {
            session.setFirstRatedAt(now);
        }

        // Chỉ chuyển sang COMPLETED khi cả 2 bên đã đánh giá xong
        if (session.isWorkerRated() && session.isBusinessRated()) {
            session.setStatus(WorkSessionStatus.COMPLETED);
        }
        
        session.setUpdatedAt(now);
        WorkSession saved = repository.save(session);

        String targetUserId = "BUSINESS".equals(reviewerRole) ? session.getWorkerId() : session.getBusinessId();
        updateUserProfileRating(targetUserId, newRating, oldRating);

        enrichSessionDetails(saved);

        String reviewerInfo = userRepository.findById("BUSINESS".equals(reviewerRole) ? session.getBusinessId() : session.getWorkerId())
            .map(u -> {
                String name = u.getFullName() != null && !u.getFullName().isEmpty() ? u.getFullName() : u.getUsername();
                String idStr = u.getNumericId() != null ? " (@" + u.getNumericId() + ")" : "";
                return name + idStr;
            }).orElse("Đối tác");

        String message = "BUSINESS".equals(reviewerRole) 
            ? reviewerInfo + " đã gửi đánh giá " + newRating + " sao cho bạn."
            : "Worker " + reviewerInfo + " đã hoàn thành công việc và gửi đánh giá " + newRating + " sao cho bạn.";
        notificationService.createNotification(targetUserId, message, com.hlgtech.api.notification.model.NotificationType.RATING);

        return saved;
    }


    // ==================================================================
    // 2. CÁC HÀM TRUY VẤN (ĐÃ TỐI ƯU ENRICH)
    // ==================================================================

    public List<WorkSession> getByWorker(String workerId) {
        List<WorkSession> list = repository.findByWorkerId(workerId);
        list.forEach(this::enrichSessionDetails);
        return list;
    }

    public List<WorkSession> getByBusiness(String businessId) {
        List<WorkSession> list = repository.findByBusinessId(businessId);
        list.forEach(this::enrichSessionDetails);
        return list;
    }

    public WorkSession getById(String id) {
        WorkSession s = repository.findById(id).orElse(null);
        enrichSessionDetails(s);
        return s;
    }

    public List<WorkSession> getAll() {
        List<WorkSession> list = repository.findAll();
        list.forEach(this::enrichSessionDetails);
        return list;
    }

    public List<WorkSession> getByJobId(String jobId) {
        List<WorkSession> list = repository.findByJobId(jobId);
        list.forEach(this::enrichSessionDetails);
        return list;
    }

    // ==================================================================
    // 3. QUẢN LÝ TRẠNG THÁI ỨNG TUYỂN
    // ==================================================================

    public WorkSession createFromMap(Map<String, Object> payload) {
        String jobId = (String) payload.get("jobId");
        String workerId = (String) payload.get("workerId");
        String businessId = (String) payload.get("businessId");

        // Chặn ứng tuyển trùng lặp
        List<WorkSession> existing = repository.findByJobId(jobId);
        for (WorkSession ws : existing) {
            if (ws.getWorkerId().equals(workerId)) {
                enrichSessionDetails(ws);
                return ws;
            }
        }

        WorkSession session = new WorkSession();
        session.setJobId(jobId);
        session.setWorkerId(workerId);
        session.setBusinessId(businessId);
        session.setStatus(WorkSessionStatus.PENDING);
        session.setCreatedAt(LocalDateTime.now().toString());

        WorkSession saved = repository.save(session);
        enrichSessionDetails(saved);

        // Notify Business
        String applicantInfo = userRepository.findById(workerId)
            .map(u -> {
                String name = u.getFullName() != null && !u.getFullName().isEmpty() ? u.getFullName() : u.getUsername();
                String idStr = u.getNumericId() != null ? " (@" + u.getNumericId() + ")" : "";
                return name + idStr;
            }).orElse("Ứng viên");
        String businessMsg = applicantInfo + " đã ứng tuyển vào vị trí: " + saved.getJobTitle();
        notificationService.createNotification(businessId, businessMsg, com.hlgtech.api.notification.model.NotificationType.JOB_APPLY);

        return saved;

    }

    public WorkSession createSessionFromProposal(String adId, String businessId, String workerId) {
        WorkSession session = new WorkSession();
        session.setJobId(adId); // Sử dụng adId như ID định danh trong WorkSession
        session.setWorkerId(workerId);
        session.setBusinessId(businessId);
        session.setStatus(WorkSessionStatus.ACCEPTED); // Khi Worker chấp nhận lời mời, trạng thái là ACCEPTED (Đang làm việc)
        session.setCreatedAt(LocalDateTime.now().toString());

        // Lấy tiêu đề công việc từ WorkerAd
        workerAdRepository.findById(adId).ifPresent(ad -> {
            session.setJobTitle("Hợp tác: " + ad.getTitle());
        });

        WorkSession saved = repository.save(session);
        enrichSessionDetails(saved);

        // Notify Business
        String workerInfo = userRepository.findById(workerId)
            .map(u -> {
                String name = u.getFullName() != null && !u.getFullName().isEmpty() ? u.getFullName() : u.getUsername();
                String idStr = u.getNumericId() != null ? " (@" + u.getNumericId() + ")" : "";
                return name + idStr;
            }).orElse("Ứng viên");
        String msg = workerInfo + " đã chấp nhận lời mời làm việc của bạn cho bài đăng: " + saved.getJobTitle();
        notificationService.createNotification(businessId, msg, com.hlgtech.api.notification.model.NotificationType.JOB_STATUS);

        return saved;
    }

    public WorkSession updateStatus(String id, String status, String reason) {

        WorkSession session = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hồ sơ"));

        session.setStatus(WorkSessionStatus.valueOf(status));

        // ✅ Lưu lý do vào đúng trường để Worker đọc được
        if ("REJECTED".equals(status)) {
            session.setComment(reason);
        }

        session.setUpdatedAt(LocalDateTime.now().toString());
        WorkSession saved = repository.save(session);
        enrichSessionDetails(saved);

        // Notify Worker
        String partnerInfo = userRepository.findById(saved.getBusinessId())
            .map(u -> {
                String name = u.getFullName() != null && !u.getFullName().isEmpty() ? u.getFullName() : u.getUsername();
                String idStr = u.getNumericId() != null ? " (@" + u.getNumericId() + ")" : "";
                return name + idStr;
            }).orElse("Nhà tuyển dụng");

        String workerMsg = partnerInfo + " đã cập nhật trạng thái hợp đồng '" + saved.getJobTitle() + "' sang: " + status;
        if ("REJECTED".equals(status) && reason != null && !reason.isEmpty()) {
            workerMsg += ". Lý do: " + reason;
        }
        notificationService.createNotification(saved.getWorkerId(), workerMsg, com.hlgtech.api.notification.model.NotificationType.JOB_STATUS);

        return saved;

    }

    public WorkSession changeStatus(String id, WorkSessionStatus status) {
        WorkSession session = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ID: " + id));
        session.setStatus(status);
        session.setUpdatedAt(LocalDateTime.now().toString());

        WorkSession saved = repository.save(session);
        enrichSessionDetails(saved);
        return saved;
    }

    // ==================================================================
    // 4. DỌN DẸP HỆ THỐNG
    // ==================================================================

    public void delete(String id) {
        repository.deleteById(id);
    }

    public void deleteAll() {
        repository.deleteAll();
    }

    public Object update(String id, Map<String, Object> updates) {
        return null; // Đã thay thế bằng logic completeAndRate
    }

    public int migrateOldWorkSessionNames() {
        return 0;
    }
}