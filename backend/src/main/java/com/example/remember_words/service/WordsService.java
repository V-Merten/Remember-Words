package com.example.remember_words.service;

import com.example.remember_words.entity.WordGroup;
import com.example.remember_words.entity.Words;
import com.example.remember_words.repository.WordGroupRepository;
import com.example.remember_words.repository.WordsRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class WordsService {

    private final Logger logger = LoggerFactory.getLogger(WordsService.class);
    private final WordsRepository wordsRepository;
    private final WordGroupRepository wordGroupRepository;

    public WordsService(WordsRepository wordsRepository, WordGroupRepository wordGroupRepository) {
        this.wordsRepository = wordsRepository;
        this.wordGroupRepository = wordGroupRepository;
    }

    @Transactional
    public Words save(String foreignWord, String translatedWord, Long groupId) {
        WordGroup wordGroup = null;
        if (groupId != null) {
            wordGroup = wordGroupRepository.findById(groupId).orElse(null);
        }

        Words words = new Words();
        words.setForeignWord(foreignWord);
        words.setTranslatedWord(translatedWord);
        words.setGroupId(wordGroup);

        if (wordGroup != null) {
            logger.info("Saved new words | Foreign word={} | Translated word={} | Group={}",
                    foreignWord, translatedWord, wordGroup.getName());
        } else {
            logger.info("Saved new words | Foreign word={} | Translated word={} | Group=None",
                    foreignWord, translatedWord);
        }

        return wordsRepository.save(words);
    }


    @Transactional
    public void deleteWords(long id) {
        Words words = wordsRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Words not found"));
        wordsRepository.deleteById(words.getId());
        logger.info("Deleted words | Foreign word : {} | translated word: {}", words.getForeignWord(), words.getForeignWord());
    }

    @Transactional
    public void updateWords(long id, String foreignWord, String translatedWord) {
        Words words = wordsRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Words not found"));

        logger.info("Updating | Foreign Word: {} -> {} | Translated word: {} -> {}",
                words.getForeignWord(), foreignWord, words.getTranslatedWord(), translatedWord);

        words.setForeignWord(foreignWord);
        words.setTranslatedWord(translatedWord);
        wordsRepository.save(words);
    }

    public List<Words> findAllWords() {
        return wordsRepository.findAllByOrderByIdAsc();
    }

    public List<WordGroup> findAllGroups() {
        return wordGroupRepository.findAllByOrderByIdAsc();
    }

    public List<Words> findWordsByIds(List<Long> ids) {
        return wordsRepository.findAllById(ids);
    }

    public List<Words> findWordsByGroup(Long groupId) {
        WordGroup group = wordGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        return wordsRepository.findByGroupIdOrderByIdAsc(group);
    }


}
