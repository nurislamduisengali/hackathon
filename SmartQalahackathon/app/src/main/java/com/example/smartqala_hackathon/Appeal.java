package com.example.smartqala_hackathon;

public class Appeal {
    public String key;
    public String text;
    public String category;
    public String address;
    public String priority = "not used yet";
    public String type;
    public Boolean isdone = false;

    public double averragescore = 5;

    public Appeal() {}

    public Appeal(String text, String category, String address, String type) {
        this.text = text;
        this.category = category;
        this.address = address;
        this.type = type;
    }

}
