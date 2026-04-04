package com.example.smartqala_hackathon;


import android.content.Intent;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuItem;

import androidx.appcompat.app.AppCompatActivity;

import org.jspecify.annotations.NonNull;

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);



    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.main_menu, menu);
        return super.onCreateOptionsMenu(menu);
    }

    @Override
    public boolean onOptionsItemSelected(@NonNull MenuItem item) {
        if (item.getItemId() == R.id.city) {
            Intent intent = new Intent(MainActivity.this, MainActivity.class);
            startActivity(intent);

        }

        if (item.getItemId() == R.id.appeal) {
            Intent intent = new Intent(MainActivity.this, AppealActivity.class);
            startActivity(intent);

        }
        if (item.getItemId() == R.id.feedback) {
            Intent intent = new Intent(MainActivity.this, DoneAppealsActivity.class);
            startActivity(intent);

        }

        return super.onOptionsItemSelected(item);
    }



}