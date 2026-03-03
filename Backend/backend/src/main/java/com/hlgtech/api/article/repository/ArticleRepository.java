package com.hlgtech.api.article.repository;

import com.hlgtech.api.article.model.Article;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArticleRepository extends MongoRepository<Article, String> {

    // PHƯƠNG THỨC MỚI: Lấy bài viết đang PUBLISHED theo Menu
    List<Article> findByStatusAndMenuOrderByPublishedDateDesc(Article.NewsStatus status, String menu);

    // Tùy chọn: Lấy bài viết theo Menu
    List<Article> findByMenu(String menu);
}