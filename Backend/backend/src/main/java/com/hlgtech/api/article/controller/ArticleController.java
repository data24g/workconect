package com.hlgtech.api.article.controller;

import com.hlgtech.api.article.model.Article;
import com.hlgtech.api.article.service.ArticleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// =============================================================
// ADMIN CONTROLLER: /api/admin/news
// =============================================================
@RestController
@RequestMapping("/api/admin/news")
@CrossOrigin(origins = "http://localhost:3000")
public class ArticleController { // ArticleAdminController

    @Autowired
    private ArticleService articleService;

    // GET /api/admin/news
    @GetMapping
    public List<Article> getAllNews() {
        return articleService.findAll();
    }

    @GetMapping("/byMenu")
    public List<Article> getPublishedNewsByMenu(@RequestParam(required = false) String menu) {

        String finalMenu = (menu != null && !menu.isEmpty()) ? menu : "homepage"; // Đặt giá trị mặc định là "homepage"

        // Gọi Service đã được sửa để tìm kiếm theo Menu
        return articleService.findPublishedByMenu(finalMenu);
    }

    // GET /api/admin/news/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Article> getNewsById(@PathVariable String id) {
        return articleService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // POST /api/admin/news
    @PostMapping
    public Article createNews(@RequestBody Article news) {
        return articleService.save(news);
    }

    // PUT /api/admin/news/{id}
    @PutMapping("/{id}")
    public ResponseEntity<Article> updateNews(@PathVariable String id, @RequestBody Article newsDetails) {
        return articleService.findById(id)
                .map(news -> {
                    newsDetails.setId(id);

                    // Cập nhật các trường
                    news.setTitle(newsDetails.getTitle());
                    news.setShortDescription(newsDetails.getShortDescription());
                    news.setContent(newsDetails.getContent());
                    news.setTags(newsDetails.getTags());
                    news.setThumbUrl(newsDetails.getThumbUrl());

                    // BỔ SUNG: CẬP NHẬT TRƯỜNG 'menu'
                    news.setMenu(newsDetails.getMenu());

                    news.setSeoTitle(newsDetails.getSeoTitle());
                    news.setSeoDescription(newsDetails.getSeoDescription());
                    news.setStatus(newsDetails.getStatus());

                    Article updatedNews = articleService.save(news);
                    return ResponseEntity.ok(updatedNews);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETE /api/admin/news/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNews(@PathVariable String id) {
        if (articleService.findById(id).isPresent()) {
            articleService.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
