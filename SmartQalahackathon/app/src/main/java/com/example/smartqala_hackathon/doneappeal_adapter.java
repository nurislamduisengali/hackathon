package com.example.smartqala_hackathon;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import java.util.ArrayList;

public class doneappeal_adapter extends ArrayAdapter<Appeal> {
    public doneappeal_adapter(@NonNull Context context, @NonNull ArrayList<Appeal> objects) {
        super(context, R.layout.doneappeal_item, objects);
    }

    @NonNull
    @Override
    public View getView(int position, @Nullable View convertView, @NonNull ViewGroup parent) {
        Appeal p = getItem(position);

        LayoutInflater vi = LayoutInflater.from(getContext());
        View v = vi.inflate(R.layout.doneappeal_item, null);

        TextView lblText = v.findViewById(R.id.lblText);
        TextView lblCategory = v.findViewById(R.id.lblCategory);

        lblText.setText(p.text);
        lblCategory.setText(p.category);

        return v;
    }
}