package com.example.remember_words.controller;

import com.example.remember_words.entity.Words;
import com.example.remember_words.service.WordsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class WordController {

    private final Logger log = LoggerFactory.getLogger(WordController.class);
    private final WordsService wordsService;

    public WordController(WordsService wordsService) {
        this.wordsService = wordsService;
    }

    @PutMapping
    public ResponseEntity<Words> updateWords(@RequestBody Words words) {
        try{
            wordsService.updateWords(words.getId(), words.getForeignWord(), words.getTranslatedWord());
            return new ResponseEntity<>(words, HttpStatus.OK);
        } catch (Exception e){
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/{foreignWord}/{translatedWord}/{groupId}")
    public ResponseEntity<Words> saveWords(@PathVariable String foreignWord,
                                           @PathVariable String translatedWord,
                                           @PathVariable String groupId) {
        Long groupIdLong = null;
        if (!"null".equalsIgnoreCase(groupId) && !groupId.isEmpty()) {
            try {
                groupIdLong = Long.valueOf(groupId);
            } catch (NumberFormatException ex) {
                return ResponseEntity.badRequest().build();
            }
        }
        try {
            Words newWords = wordsService.save(foreignWord, translatedWord, groupIdLong);
            return ResponseEntity.ok(newWords);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


    @GetMapping
    public ResponseEntity<List<Words>> getAllWords() {
        try {
            List<Words> words = wordsService.findAllWords();
            for (Words word : words) {
                log.info("Requested word={} | {}", word.getForeignWord(), word.getTranslatedWord());
            }
            return ResponseEntity.ok(words);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Words> deleteAllWords(@PathVariable long id) {
        wordsService.deleteWords(id);
        return ResponseEntity.ok().build();
    }


}
