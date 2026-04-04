package com.example.smartqala_hackathon;

public class Feedback {
    public String key;
    public String coment;
    public int score;
    public String appeal_key;

    public Feedback() {}
    public Feedback(String coment, int score, String appeal_key) {
        this.coment = coment;
        this.score = score;
        this.appeal_key = appeal_key;
    }
}
