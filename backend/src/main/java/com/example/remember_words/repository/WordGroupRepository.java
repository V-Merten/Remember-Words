package com.example.remember_words.repository;

import com.example.remember_words.entity.WordGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.lang.NonNull;

import java.util.List;
import java.util.Optional;

public interface WordGroupRepository extends JpaRepository<WordGroup, Long> {

    Optional<WordGroup> findByName(String name);
    
    Optional <WordGroup> findById(@NonNull Long id);

    List<WordGroup> findAllByOrderByIdAsc();

}
