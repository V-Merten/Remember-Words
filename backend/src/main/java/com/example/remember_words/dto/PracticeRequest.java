package com.example.remember_words.dto;

public class PracticeRequest {

    private long id;

    private String userWord;

    public PracticeRequest(String userWord) {
        this.userWord = userWord;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getUserWord() {
        return userWord;
    }

    public void setUserWord(String userWord) {
        this.userWord = userWord;
    }
}
