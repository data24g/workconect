package com.hlgtech.api.worksession.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum WorkSessionStatus {
    PENDING,    // Chờ duyệt
    ACCEPTED,   // 👈 QUAN TRỌNG: Phải có để nút "Chấp nhận" chạy được
    REJECTED,   // 👈 QUAN TRỌNG: Phải có để nút "Từ chối" chạy được
    CANCELLED,  // Đã hủy

    // Các trạng thái cũ (Giữ lại để không lỗi code cũ)
    ONGOING,
    COMPLETED,
    CONFIRMED,
    DISPUTED,
    RESOLVED;

    @JsonCreator
    public static WorkSessionStatus fromValue(Object value) {
        if (value == null) return PENDING;
        
        if (value instanceof Number) {
            int ordinal = ((Number) value).intValue();
            if (ordinal >= 0 && ordinal < values().length) {
                return values()[ordinal];
            }
        }
        
        if (value instanceof String) {
            String str = (String) value;
            try {
                // Thử parse theo tên (PENDING, ONGOING...)
                return WorkSessionStatus.valueOf(str.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Thử parse theo số dạng chuỗi ("0", "1"...)
                try {
                    int ordinal = Integer.parseInt(str);
                    if (ordinal >= 0 && ordinal < values().length) {
                        return values()[ordinal];
                    }
                } catch (NumberFormatException nfe) {
                    // Mặc định trả về PENDING nếu không khớp
                    return PENDING;
                }
            }
        }
        return PENDING;
    }
}
