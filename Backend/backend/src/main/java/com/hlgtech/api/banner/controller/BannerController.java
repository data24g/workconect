package com.hlgtech.api.banner.controller;

import com.hlgtech.api.banner.model.Banner;
import com.hlgtech.api.banner.service.BannerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/banners")
@CrossOrigin(origins = "http://localhost:3000") // Chỉ cho phép Admin FE gọi
public class BannerController { // Đây là BannerAdminController

    @Autowired
    private BannerService bannerService;

    // GET /api/admin/banners
    @GetMapping
    public List<Banner> getAllBanners() {
        return bannerService.findAll();
    }

    // GET /api/admin/banners/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Banner> getBannerById(@PathVariable String id) {
        return bannerService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // POST /api/admin/banners
    @PostMapping
    public Banner createBanner(@RequestBody Banner banner) {
        return bannerService.save(banner);
    }

    // PUT /api/admin/banners/{id}
    @PutMapping("/{id}")
    public ResponseEntity<Banner> updateBanner(@PathVariable String id, @RequestBody Banner bannerDetails) {
        return bannerService.findById(id)
                .map(banner -> {
                    bannerDetails.setId(id);

                    // Cập nhật các trường
                    banner.setImageUrl(bannerDetails.getImageUrl());
                    banner.setTitle(bannerDetails.getTitle());
                    banner.setSubtitle(bannerDetails.getSubtitle());
                    banner.setLink(bannerDetails.getLink());

                    // CẬP NHẬT TRƯỜNG 'menu'
                    banner.setMenu(bannerDetails.getMenu());

                    banner.setActive(bannerDetails.getActive());
                    banner.setDisplayOrder(bannerDetails.getDisplayOrder());

                    Banner updatedBanner = bannerService.save(banner);
                    return ResponseEntity.ok(updatedBanner);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETE /api/admin/banners/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBanner(@PathVariable String id) {
        if (bannerService.findById(id).isPresent()) {
            bannerService.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    // ĐÃ XÓA: API Public (byTag/byMenu) nên được đặt ở Controller khác.

    @GetMapping("/byMenu")
    public List<Banner> getActiveBannersByMenu(@RequestParam(required = false) String menu) {

        String finalMenu = (menu != null && !menu.isEmpty()) ? menu : "homepage"; // Đặt giá trị mặc định là "homepage"

        // Gọi Service đã được sửa để tìm kiếm theo Menu
        return bannerService.findActiveBannersByMenu(finalMenu);
    }
}