package com.hlgtech.api.article.controller;

import com.hlgtech.api.article.model.Article;
import com.hlgtech.api.article.service.ArticleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Public API Controller for Articles
 * No authentication required - accessible by web clients
 * Endpoint: /api/articles
 */
@RestController
@RequestMapping("/api/articles")
@CrossOrigin(origins = "*") // Allow all origins for public access
public class PublicArticleController {

    @Autowired
    private ArticleService articleService;

    /**
     * Get all PUBLISHED articles
     * GET /api/articles
     */
    @GetMapping
    public ResponseEntity<List<Article>> getAllPublishedArticles() {
        List<Article> articles = articleService.findAll();
        // Filter only PUBLISHED articles for public access
        List<Article> publishedArticles = articles.stream()
                .filter(article -> article.getStatus() == Article.NewsStatus.PUBLISHED)
                .toList();
        return ResponseEntity.ok(publishedArticles);
    }

    /**
     * Get PUBLISHED articles by menu
     * GET /api/articles/menu/{menu}
     * Example: /api/articles/menu/homepage
     */
    @GetMapping("/menu/{menu}")
    public ResponseEntity<List<Article>> getPublishedArticlesByMenu(@PathVariable String menu) {
        List<Article> articles = articleService.findPublishedByMenu(menu);
        return ResponseEntity.ok(articles);
    }

    /**
     * Get a single PUBLISHED article by ID
     * GET /api/articles/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Article> getPublishedArticleById(@PathVariable String id) {
        return articleService.findById(id)
                .filter(article -> article.getStatus() == Article.NewsStatus.PUBLISHED)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get latest PUBLISHED articles (limit by count)
     * GET /api/articles/latest?limit=10
     */
    @GetMapping("/latest")
    public ResponseEntity<List<Article>> getLatestPublishedArticles(
            @RequestParam(defaultValue = "10") int limit) {
        List<Article> articles = articleService.findAll();
        List<Article> latestPublished = articles.stream()
                .filter(article -> article.getStatus() == Article.NewsStatus.PUBLISHED)
                .sorted((a, b) -> {
                    if (a.getPublishedDate() == null)
                        return 1;
                    if (b.getPublishedDate() == null)
                        return -1;
                    return b.getPublishedDate().compareTo(a.getPublishedDate());
                })
                .limit(limit)
                .toList();
        return ResponseEntity.ok(latestPublished);
    }

    /**
     * Search PUBLISHED articles by title or content
     * GET /api/articles/search?q=keyword
     */
    @GetMapping("/search")
    public ResponseEntity<List<Article>> searchPublishedArticles(@RequestParam String q) {
        List<Article> articles = articleService.findAll();
        String searchTerm = q.toLowerCase();
        List<Article> results = articles.stream()
                .filter(article -> article.getStatus() == Article.NewsStatus.PUBLISHED)
                .filter(article -> article.getTitle().toLowerCase().contains(searchTerm) ||
                        article.getContent().toLowerCase().contains(searchTerm) ||
                        (article.getTags() != null && article.getTags().toLowerCase().contains(searchTerm)))
                .toList();
        return ResponseEntity.ok(results);
    }
}
