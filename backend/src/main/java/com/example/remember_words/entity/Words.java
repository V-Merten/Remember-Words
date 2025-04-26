package com.example.remember_words.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "words")
public class Words {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private long id;

    @Column(name = "foreign_word", length = 100, nullable = false)
    private String foreignWord;

    @Column(name = "translated_word", length = 100, nullable = false)
    private String translatedWord;

    @ManyToOne
    @JoinColumn(name = "group_id",  nullable = true)
    private WordGroup groupId;

    public Words() {
    }

    public Words(String foreignWord, String translatedWord) {
        this.foreignWord = foreignWord;
        this.translatedWord = translatedWord;
    }

    public Words(String foreignWord, String translatedWord, WordGroup groupId) {
        this.foreignWord = foreignWord;
        this.translatedWord = translatedWord;
        this.groupId = groupId;
    }

    public WordGroup getGroupId() {
        return groupId;
    }

    public void setGroupId(WordGroup groupId) {
        this.groupId = groupId;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getForeignWord() {
        return foreignWord;
    }

    public void setForeignWord(String foreignWord) {
        this.foreignWord = foreignWord;
    }

    public String getTranslatedWord() {
        return translatedWord;
    }

    public void setTranslatedWord(String translatedWord) {
        this.translatedWord = translatedWord;
    }
}
