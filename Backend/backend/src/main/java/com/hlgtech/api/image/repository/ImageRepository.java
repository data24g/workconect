package com.hlgtech.api.image.repository;


import com.hlgtech.api.image.model.Image;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ImageRepository extends MongoRepository<Image, Long> {


}
