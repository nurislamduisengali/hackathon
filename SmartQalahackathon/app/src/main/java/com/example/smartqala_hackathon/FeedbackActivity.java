package com.example.smartqala_hackathon;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;

public class FeedbackActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_feedback);

        TextView text = findViewById(R.id.textofappeal);
        TextView score = findViewById(R.id.appealsscore);
        Button addfeedback = findViewById(R.id.btn_addfeedback);

        String appeals_key = getIntent().getStringExtra("key");
        DatabaseReference ref = FirebaseDatabase.getInstance().getReference("appeals");
        ref.child(appeals_key).addValueEventListener(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                if (snapshot.exists()) {
                    Appeal appeal = snapshot.getValue(Appeal.class);

                    text.setText(appeal.text);
                    score.setText(appeal.averragescore+"");


                    addfeedback.setOnClickListener(new View.OnClickListener() {
                        @Override
                        public void onClick(View v) {

                            Intent intent = new Intent(FeedbackActivity.this, AddFeedbackActivity.class);
                            intent.putExtra("appeals_key", appeals_key);
                            startActivity(intent);

                        }
                    });






                }
            }
            @Override
            public void onCancelled(DatabaseError error) {}
        });





    }



}