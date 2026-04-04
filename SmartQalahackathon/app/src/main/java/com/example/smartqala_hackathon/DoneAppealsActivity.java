package com.example.smartqala_hackathon;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ListView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;

import java.util.ArrayList;

public class DoneAppealsActivity extends AppCompatActivity {
    doneappeal_adapter adapter;
    ArrayList<Appeal> appeals = new ArrayList<>();

    FirebaseDatabase database = FirebaseDatabase.getInstance();
    DatabaseReference myRef = database.getReference("appeals");


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_doneappeals);

        ListView listView = findViewById(R.id.myListView);

        myRef.addValueEventListener(new ValueEventListener() {            //получение списка аниме из БД
            @Override
            public void onDataChange(@NonNull DataSnapshot snapshot) {
                appeals.clear();
                for (DataSnapshot data : snapshot.getChildren()) {
                    Appeal p = data.getValue(Appeal.class);
                    if (p.isdone){ appeals.add(p); }     //показывает уже проедланные работы
                }
                adapter.notifyDataSetChanged();
            }

            @Override
            public void onCancelled(@NonNull DatabaseError error) {

            }
        });


        adapter = new doneappeal_adapter(this, appeals);
        listView.setAdapter(adapter);

        listView.setOnItemClickListener(new AdapterView.OnItemClickListener() {              //изменение элемента
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {

                Appeal appeal = appeals.get(position);

                Intent intent = new Intent(DoneAppealsActivity.this, FeedbackActivity.class);
                intent.putExtra("key", appeal.key);
                startActivity(intent);
            }
        });

    }
}