package com.hlgtech.api.review.controller;

import com.hlgtech.api.core.ResponseObject;
import com.hlgtech.api.review.model.Review;
import com.hlgtech.api.review.repository.ReviewRepository;
import com.hlgtech.api.review.service.ReviewService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewRepository reviewRepository;
    private final ReviewService service;

    public ReviewController(ReviewRepository reviewRepository, ReviewService service) {
        this.reviewRepository = reviewRepository;
        this.service = service;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseObject getAll() {
        return new ResponseObject(
                200,
                reviewRepository.findAll(),
                "All reviews"
        );
    }

    // Create review
    @PreAuthorize("hasAnyRole('USER', 'WORKER', 'BUSINESS')")
    @PostMapping
    public Object create(@RequestBody Review review) {
        try {
            return service.create(review);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseObject(500, null, "Review submission failed: " + e.getMessage());
        }
    }

    // Get reviews ABOUT a user
    @GetMapping("/user/{userId}")
    public ResponseObject getByUser(@PathVariable String userId) {
        return new ResponseObject(
                200,
                service.getByUser(userId),
                "Reviews for user"
        );
    }

    // Get reviews written BY a user
    @GetMapping("/from/{userId}")
    public ResponseObject getByAuthor(@PathVariable String userId) {
        return new ResponseObject(
                200,
                service.getByAuthor(userId),
                "Reviews written by user"
        );
    }
}
