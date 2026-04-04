package com.example.smartqala_hackathon;

import android.app.AlertDialog;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;

public class AddFeedbackActivity extends AppCompatActivity {

    FirebaseDatabase database = FirebaseDatabase.getInstance();
    DatabaseReference feedbackRef = database.getReference("feedbacks");

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_add_feedback);

        String appeals_key = getIntent().getStringExtra("appeals_key");

        EditText comment = findViewById(R.id.coment);
        EditText score = findViewById(R.id.score);
        Button save = findViewById(R.id.btn_save);

        String[] scores = {"1", "2", "3", "4", "5"};

        score.setFocusable(false);

        score.setOnClickListener(v -> {
            AlertDialog.Builder builder = new AlertDialog.Builder(AddFeedbackActivity.this);
            builder.setTitle("Выберите оценку");

            builder.setItems(scores, (dialog, which) -> {
                score.setText(scores[which]);
            });

            builder.show();
        });


        save.setOnClickListener(v -> {

            String comment_str = comment.getText().toString();

            if (score.getText().toString().isEmpty()) {
                Toast.makeText(this, "Выберите оценку", Toast.LENGTH_SHORT).show();
                return;
            }

            int score_int = Integer.parseInt(score.getText().toString());

            Feedback feedback = new Feedback(comment_str, score_int, appeals_key);

            DatabaseReference push = feedbackRef.push();
            feedback.key = push.getKey();


            push.setValue(feedback).addOnSuccessListener(aVoid -> {

                Toast.makeText(this, "Отзыв отправлен", Toast.LENGTH_SHORT).show();




                feedbackRef.addListenerForSingleValueEvent(new ValueEventListener() {
                    @Override
                    public void onDataChange(DataSnapshot snapshot) {

                        double sum = 5;
                        int count = 1;

                        for (DataSnapshot ds : snapshot.getChildren()) {
                            Feedback f = ds.getValue(Feedback.class);

                            if (f != null && f.appeal_key.equals(appeals_key)) {
                                sum += f.score;
                                count++;
                            }
                        }

                        double avg = count > 0 ? sum / count : 0;


                        avg = Math.round(avg * 100.0) / 100.0;

                        DatabaseReference appealRef = FirebaseDatabase.getInstance().getReference("appeals");
                        appealRef.child(appeals_key).child("averragescore").setValue(avg);
                    }

                    @Override
                    public void onCancelled(DatabaseError error) {}
                });
                comment.setText("");
                score.setText("");
            });
        });
    }
}