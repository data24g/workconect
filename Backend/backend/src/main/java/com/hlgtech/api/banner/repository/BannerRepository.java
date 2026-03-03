package com.hlgtech.api.banner.repository;

import com.hlgtech.api.banner.model.Banner;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BannerRepository extends MongoRepository<Banner, String> {

    // ĐÃ SỬA: Lấy banner đang Active và có Menu cụ thể
    List<Banner> findByIsActiveAndMenuOrderByDisplayOrderAsc(Boolean isActive, String menu);

    // ĐÃ SỬA: Lấy banner theo Menu (dùng cho Admin)
    List<Banner> findByMenu(String menu);
}