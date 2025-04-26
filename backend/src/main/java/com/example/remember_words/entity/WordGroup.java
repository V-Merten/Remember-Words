package com.example.remember_words.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "word_groups")
public class WordGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "group_name")
    private String name;

    public WordGroup() {
    }

    public WordGroup(String word) {
        this.name = word;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String word) {
        this.name = word;
    }
}
