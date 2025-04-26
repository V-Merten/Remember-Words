package com.example.remember_words.repository;

import com.example.remember_words.entity.WordGroup;
import com.example.remember_words.entity.Words;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WordsRepository extends JpaRepository<Words, Long> {
    List<Words> findByGroupId(WordGroup groupId);
    List<Words> findAllByOrderByIdAsc();
    List<Words> findByGroupIdOrderByIdAsc(WordGroup group);
}
