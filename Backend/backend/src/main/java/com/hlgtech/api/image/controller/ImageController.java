package com.hlgtech.api.image.controller;


import com.hlgtech.api.core.ResponseObject;
import com.hlgtech.api.image.model.Image;
import com.hlgtech.api.image.service.ImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;
@RestController
@RequestMapping("/api/images")
public class ImageController {
    private final ImageService imageService;
    @Autowired
    public ImageController(ImageService imageService) {
        this.imageService = imageService;
    }
    @PostMapping
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) throws IOException {
        Image savedImage = imageService.saveImage(file);
        //return ResponseEntity.ok(savedImage.getId());
        return ResponseEntity.status(HttpStatus.OK).body(new ResponseObject(200, savedImage.getId(),"upload Ok"));

    }

    @GetMapping("/{id}")
    public ResponseEntity<byte[]> getImage(@PathVariable("id") Long id) {
        Optional<Image> imageOptional = imageService.getImage(id);
        if (imageOptional.isPresent()) {
            Image image = imageOptional.get();
            //return ResponseEntity.ok().body(image.getData());
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_JPEG); // Set the appropriate media type, e.g., IMAGE_JPEG, IMAGE_PNG, etc.

            // Return the image byte array with the headers
            return new ResponseEntity<>(image.getData(), headers, HttpStatus.OK);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}