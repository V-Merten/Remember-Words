package com.example.remember_words.controller;

import com.example.remember_words.dto.PracticeRequest;
import com.example.remember_words.entity.Words;
import com.example.remember_words.service.PracticeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping
public class PracticeController {

    private final PracticeService practiceService;

    public PracticeController(PracticeService practiceService) {
        this.practiceService = practiceService;
    }

    @GetMapping("/api/practice")
    public ResponseEntity<List<Words>> getPracticeWords(@RequestParam(required = false) String ids) {
        List<Words> words = practiceService.getPracticeWords(ids);
        return ResponseEntity.ok(words);
    }

    @PostMapping("/api/practice")
    public ResponseEntity<Map<String, Object>> checkAnswer(@RequestBody PracticeRequest request) {
            Map<String, Object> response = practiceService.checkAnswer(request);
            if (response.containsKey("error")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            } else {
                return ResponseEntity.status(HttpStatus.OK).body(response);
            }
    }

}
