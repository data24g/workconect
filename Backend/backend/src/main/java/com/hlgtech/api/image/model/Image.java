package com.hlgtech.api.image.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "images")
public class Image {
    @Id
    private Long id;
    private byte[] data;

    @Transient
    public static final String SEQUENCE_NAME = "image_sequence";

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public byte[] getData() {
        return data;
    }

    public void setData(byte[] data) {
        this.data = data;
    }
// Constructors, getters, and setters
}