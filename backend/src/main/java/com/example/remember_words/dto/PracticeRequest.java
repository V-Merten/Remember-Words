package com.example.remember_words.dto;

public class PracticeRequest {

    private long id;
    private String userWord;
    private PracticeDirection direction = PracticeDirection.FOREIGN_TO_NATIVE;

    public PracticeRequest() {
    }

    public PracticeRequest(String userWord, PracticeDirection direction) {
        this.userWord = userWord;
        this.direction = direction;
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

    public PracticeDirection getDirection() {
        return direction;
    }

    public void setDirection(PracticeDirection direction) {
        this.direction = direction;
    }
}
