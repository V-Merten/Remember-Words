package com.example.remember_words.service;

import com.example.remember_words.entity.WordGroup;
import com.example.remember_words.entity.Words;
import com.example.remember_words.repository.WordGroupRepository;
import com.example.remember_words.repository.WordsRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class WordGroupService {

    private final Logger logger = LoggerFactory.getLogger(WordGroupService.class);
    private final WordGroupRepository wordGroupRepository;
    private final WordsRepository wordsRepository;

    public WordGroupService(WordGroupRepository wordGroupRepository, WordsRepository wordsRepository) {
        this.wordGroupRepository = wordGroupRepository;
        this.wordsRepository = wordsRepository;
    }

    @Transactional
    public WordGroup createWordsGroup(String groupName) {

        Optional<WordGroup> existingGroup = wordGroupRepository.findByName(groupName);
        if (existingGroup.isPresent()) {
            throw new RuntimeException("Group with name " + groupName.trim() + " already exists");
        }

        WordGroup wordGroup = new WordGroup();
        wordGroup.setName(groupName.trim());
        wordGroupRepository.save(wordGroup);

        logger.info("New group has been created: id={}, groupName={}",
                wordGroup.getId(), wordGroup.getName());

        return wordGroup;
    }

    @Transactional
    public void addWordsToGroup(Long wordsId, Long groupId) {
        Words existingWord = wordsRepository.findById(wordsId)
                .orElseThrow(() -> new RuntimeException("Words with id " + wordsId + " not found"));

        WordGroup existingGroup = wordGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group with id " + groupId + " not found"));

        existingWord.setGroupId(existingGroup);
        wordsRepository.save(existingWord);
        logger.info("Word added to group: word={}, group={}", existingWord.getForeignWord(), existingGroup.getName());
    }

    @Transactional
    public void removeWordsFromGroup(Long wordsId) {
        Words existingWord = wordsRepository.findById(wordsId)
                .orElseThrow(() -> new RuntimeException("Words with id " + wordsId + " not found"));

        existingWord.setGroupId(null);
        wordsRepository.save(existingWord);
        logger.info("Word removed from group: word={}", existingWord.getForeignWord());
    }

    @Transactional
    public void renameWordGroup(String oldWordGroupName, String newWordGroupName) {
            WordGroup existingGroup = wordGroupRepository.findByName(oldWordGroupName.trim())
                .orElseThrow(() -> new RuntimeException("Words with name " + oldWordGroupName + " not found"));

        existingGroup.setName(newWordGroupName.trim());
        wordGroupRepository.save(existingGroup);
        logger.info("Group renamed: old group name= {} |  new group name={}", oldWordGroupName, newWordGroupName);
    }

    @Transactional
    public void deleteGroup(Long groupId) {
        WordGroup existingGroup = wordGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group with id " + groupId + " not found"));

        List<Words> wordsWithGroup = wordsRepository.findByGroupId(existingGroup);
        for (Words word : wordsWithGroup) {
            word.setGroupId(null);
        }

        wordsRepository.saveAll(wordsWithGroup);
        wordGroupRepository.delete(existingGroup);

        logger.info("Group deleted: id={} | name={}", existingGroup.getId(), existingGroup.getName());
    }


}
