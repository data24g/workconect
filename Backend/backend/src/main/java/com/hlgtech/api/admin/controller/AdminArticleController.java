package com.hlgtech.api.admin.controller;

import com.hlgtech.api.admin.service.AdminAuditService;
import com.hlgtech.api.article.model.Article;
import com.hlgtech.api.article.repository.ArticleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/articles")
@PreAuthorize("hasRole('ADMIN')")
public class AdminArticleController {

    @Autowired
    private ArticleRepository articleRepository;

    @Autowired
    private AdminAuditService auditService;

    @GetMapping
    public ResponseEntity<List<Article>> getAllArticles(@RequestParam(required = false) String menu) {
        if (menu != null && !menu.isEmpty()) {
            return ResponseEntity.ok(articleRepository.findByMenu(menu));
        }
        return ResponseEntity.ok(articleRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<Article> createArticle(@RequestBody Article article) {
        article.setCreatedDate(LocalDateTime.now());
        if (article.getStatus() == Article.NewsStatus.PUBLISHED && article.getPublishedDate() == null) {
            article.setPublishedDate(LocalDateTime.now());
        }
        Article saved = articleRepository.save(article);
        
        auditService.logActivity(null, "CREATE_ARTICLE", "Tạo bài viết mới: " + article.getTitle());
        
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Article> updateArticle(@PathVariable String id, @RequestBody Article articleDetails) {
        return articleRepository.findById(id).map(article -> {
            article.setTitle(articleDetails.getTitle());
            article.setContent(articleDetails.getContent());
            article.setShortDescription(articleDetails.getShortDescription());
            article.setMenu(articleDetails.getMenu());
            article.setTags(articleDetails.getTags());
            article.setThumbUrl(articleDetails.getThumbUrl());
            article.setSeoTitle(articleDetails.getSeoTitle());
            article.setSeoDescription(articleDetails.getSeoDescription());
            
            if (article.getStatus() != Article.NewsStatus.PUBLISHED && articleDetails.getStatus() == Article.NewsStatus.PUBLISHED) {
                article.setPublishedDate(LocalDateTime.now());
            }
            article.setStatus(articleDetails.getStatus());
            
            Article updated = articleRepository.save(article);
            auditService.logActivity(null, "UPDATE_ARTICLE", "Cập nhật bài viết: " + article.getTitle());
            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteArticle(@PathVariable String id) {
        return articleRepository.findById(id).map(article -> {
            articleRepository.deleteById(id);
            auditService.logActivity(null, "DELETE_ARTICLE", "Xóa bài viết: " + article.getTitle());
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
