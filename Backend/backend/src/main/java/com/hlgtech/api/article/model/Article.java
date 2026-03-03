package com.hlgtech.api.article.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "article") // Tên collection trong MongoDB
public class Article {

    @Id // Tự động quản lý bởi MongoDB
    private String id;

    private String title;
    private String shortDescription;
    private String content;

    private String tags;
    private String thumbUrl;

    // TRƯỜNG MỚI ĐƯỢC BỔ SUNG
    private String menu;

    // SEO
    private String seoTitle;
    private String seoDescription;

    // Status
    private NewsStatus status = NewsStatus.DRAFT;

    private LocalDateTime createdDate = LocalDateTime.now();

    private LocalDateTime publishedDate;

    // Enum cho Status
    public enum NewsStatus {
        DRAFT, PUBLISHED, PENDING
    }

    // --- BỔ SUNG GETTER/SETTER CHO TRƯỜNG MỚI ---
    public String getMenu() {
        return menu;
    }

    public void setMenu(String menu) {
        this.menu = menu;
    }
    // --- (Các Getters/Setters còn lại giữ nguyên) ---

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getShortDescription() {
        return shortDescription;
    }

    public void setShortDescription(String shortDescription) {
        this.shortDescription = shortDescription;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getTags() {
        return tags;
    }

    public void setTags(String tags) {
        this.tags = tags;
    }

    public String getThumbUrl() {
        return thumbUrl;
    }

    public void setThumbUrl(String thumbUrl) {
        this.thumbUrl = thumbUrl;
    }

    public String getSeoTitle() {
        return seoTitle;
    }

    public void setSeoTitle(String seoTitle) {
        this.seoTitle = seoTitle;
    }

    public String getSeoDescription() {
        return seoDescription;
    }

    public void setSeoDescription(String seoDescription) {
        this.seoDescription = seoDescription;
    }

    public NewsStatus getStatus() {
        return status;
    }

    public void setStatus(NewsStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }

    public LocalDateTime getPublishedDate() {
        return publishedDate;
    }

    public void setPublishedDate(LocalDateTime publishedDate) {
        this.publishedDate = publishedDate;
    }
}