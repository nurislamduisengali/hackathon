package com.example.smartqala_hackathon;

import android.app.AlertDialog;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;

public class AppealActivity extends AppCompatActivity {

    FirebaseDatabase database = FirebaseDatabase.getInstance();
    DatabaseReference appeal_Ref = database.getReference("appeals");

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_appeal);

        EditText editText = findViewById(R.id.appeal_text);
        EditText editCategory = findViewById(R.id.appeal_category);
        EditText editAddress = findViewById(R.id.appeal_address);
        EditText editType = findViewById(R.id.appeal_type);

        String[] categorys = {
                "Транспорт",
                "Экология",
                "ЖКХ"
        };
        editCategory.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                AlertDialog.Builder builder = new AlertDialog.Builder(AppealActivity.this);
                builder.setTitle("Выберите категорию");

                builder.setItems(categorys, (dialog, which) -> {
                    editCategory.setText(categorys[which]);
                });

                builder.show();
            }
        });

        String[] types = {
                "Заявление",
                "Жалоба",
                "Предложение",
                "Запрос",
                "Сообщение"
        };
        editType.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                AlertDialog.Builder builder = new AlertDialog.Builder(AppealActivity.this);
                builder.setTitle("Выберите тип обращения");

                builder.setItems(types, (dialog, which) -> {
                    editType.setText(types[which]);
                });

                builder.show();
            }
        });


        Button send_btn = findViewById(R.id.appeal_send_btn);
        send_btn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                String text = editText.getText().toString();
                String category = editCategory.getText().toString();
                String address = editAddress.getText().toString();
                String type = editType.getText().toString();

                Appeal appeal = new Appeal(text, category, address, type);

                DatabaseReference push = appeal_Ref.push();
                appeal.key = push.getKey().toString();
                push.setValue(appeal);

                Toast.makeText(AppealActivity.this, "Отправлено", Toast.LENGTH_LONG).show();
            }
        });

    }
}