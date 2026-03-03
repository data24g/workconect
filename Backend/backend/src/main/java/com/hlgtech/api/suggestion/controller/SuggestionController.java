package com.hlgtech.api.suggestion.controller;

import com.hlgtech.api.suggestion.dto.SuggestionDTO;
import com.hlgtech.api.suggestion.service.SuggestionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/suggestions")
public class SuggestionController {

    private final SuggestionService suggestionService;

    public SuggestionController(SuggestionService suggestionService) {
        this.suggestionService = suggestionService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<SuggestionDTO>> getSuggestions(@PathVariable String userId) {
        return ResponseEntity.ok(suggestionService.getSuggestions(userId));
    }
}
