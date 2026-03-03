package com.hlgtech.api.article.service;

import com.hlgtech.api.article.model.Article;
import com.hlgtech.api.article.repository.ArticleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ArticleService {

    @Autowired
    private ArticleRepository articleRepository;

    public List<Article> findAll() {
        return articleRepository.findAll();
    }

    public Optional<Article> findById(String id) {
        return articleRepository.findById(id);
    }

    // PHƯƠNG THỨC MỚI: Lấy bài viết đã xuất bản theo Menu
    public List<Article> findPublishedByMenu(String menu) {
        return articleRepository.findByStatusAndMenuOrderByPublishedDateDesc(Article.NewsStatus.PUBLISHED, menu);
    }

    public Article save(Article article) {
        // Cập nhật ngày xuất bản nếu status chuyển sang PUBLISHED
        if (article.getStatus() == Article.NewsStatus.PUBLISHED && article.getPublishedDate() == null) {
            article.setPublishedDate(LocalDateTime.now());
        } else if (article.getStatus() != Article.NewsStatus.PUBLISHED) {
            article.setPublishedDate(null);
        }
        return articleRepository.save(article);
    }

    public void deleteById(String id) {
        articleRepository.deleteById(id);
    }
}