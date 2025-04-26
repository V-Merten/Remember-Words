package com.example.remember_words.dto;

public class WordGroupUpdateRequest {
    private long wordsId;
    private long groupId;

    public WordGroupUpdateRequest() {
    }

    public WordGroupUpdateRequest(long wordsId, long groupId) {
        this.wordsId = wordsId;
        this.groupId = groupId;
    }

    public long getWordsId() {
        return wordsId;
    }

    public void setWordsId(long wordsId) {
        this.wordsId = wordsId;
    }

    public long getGroupId() {
        return groupId;
    }

    public void setGroupId(long groupId) {
        this.groupId = groupId;
    }
}
