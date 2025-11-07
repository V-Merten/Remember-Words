package com.example.remember_words.service;

import com.example.remember_words.dto.PracticeDirection;
import com.example.remember_words.dto.PracticeRequest;
import com.example.remember_words.entity.Words;
import com.example.remember_words.repository.WordsRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class PracticeService {

    private final WordsRepository wordsRepository;
    private final WordsService wordsService;

    public PracticeService(WordsRepository wordsRepository, WordsService wordsService) {
        this.wordsRepository = wordsRepository;
        this.wordsService = wordsService;
    }

    public List<Words> getPracticeWords(String ids) {
        if (ids != null && !ids.isEmpty()) {
            List<Long> idList = Arrays.stream(ids.split(","))
                    .map(Long::parseLong)
                    .collect(Collectors.toList());
            return wordsService.findWordsByIds(idList);
        } else {
            return wordsService.findAllWords();
        }
    }


    public Map<String, Object> checkAnswer(PracticeRequest request) {
        Optional<Words> optionalWord = wordsRepository.findById(request.getId());
        Map<String, Object> response = new HashMap<>();
        if (optionalWord.isPresent()) {
            Words word = optionalWord.get();
            PracticeDirection direction = Optional.ofNullable(request.getDirection())
                    .orElse(PracticeDirection.FOREIGN_TO_NATIVE);
            String expectedAnswer = direction == PracticeDirection.FOREIGN_TO_NATIVE
                    ? word.getTranslatedWord()
                    : word.getForeignWord();
            String userAnswer = Optional.ofNullable(request.getUserWord()).orElse("").trim();
            boolean correct = expectedAnswer.equalsIgnoreCase(userAnswer);
            response.put("correct", correct);
            if (correct) {
                response.put("message", "Correct");
            } else {
                response.put("message", "Incorrect!");
                Map<String, Object> details = new HashMap<>();
                details.put("foreignWord", word.getForeignWord());
                details.put("correctTranslation", word.getTranslatedWord());
                details.put("expectedAnswer", expectedAnswer);
                details.put("userAnswer", request.getUserWord());
                response.put("details", details);
            }
        } else {
            response.put("error", "Not found a word!");
        }
        return response;
    }

}
