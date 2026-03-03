package com.hlgtech.api.banner.service;

import com.hlgtech.api.banner.model.Banner;
import com.hlgtech.api.banner.repository.BannerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BannerService {

    @Autowired
    private BannerRepository bannerRepository;

    public List<Banner> findAll() {
        return bannerRepository.findAll();
    }

    public Optional<Banner> findById(String id) {
        return bannerRepository.findById(id);
    }

    // ĐÃ SỬA: Lấy banners đang hoạt động theo Menu
    public List<Banner> findActiveBannersByMenu(String menu) {
        return bannerRepository.findByIsActiveAndMenuOrderByDisplayOrderAsc(true, menu);
    }

    public Banner save(Banner banner) {
        return bannerRepository.save(banner);
    }

    public void deleteById(String id) {
        bannerRepository.deleteById(id);
    }
}