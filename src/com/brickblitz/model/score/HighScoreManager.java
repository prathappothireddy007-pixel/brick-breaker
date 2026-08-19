package com.brickblitz.model.score;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class HighScoreManager {
    private static HighScoreManager instance;
    private List<HighScoreEntry> entries;
    private static final String FILE_PATH = "c:\\Users\\ragha\\Downloads\\v\\highscores.dat";
    private static final int MAX_ENTRIES = 10;

    public static class HighScoreEntry implements Comparable<HighScoreEntry> {
        public String name;
        public long score;
        public int level;
        public String date;

        public HighScoreEntry(String name, long score, int level, String date) {
            this.name = name;
            this.score = score;
            this.level = level;
            this.date = date;
        }

        @Override
        public int compareTo(HighScoreEntry other) {
            return Long.compare(other.score, this.score); // Descending
        }
    }

    private HighScoreManager() {
        entries = new ArrayList<>();
        load();
    }

    public static HighScoreManager getInstance() {
        if (instance == null) {
            instance = new HighScoreManager();
        }
        return instance;
    }

    public void load() {
        entries.clear();
        File file = new File(FILE_PATH);
        if (!file.exists()) return;

        try (BufferedReader br = new BufferedReader(new FileReader(file))) {
            String line;
            while ((line = br.readLine()) != null) {
                String[] parts = line.split(",");
                if (parts.length == 4) {
                    entries.add(new HighScoreEntry(parts[0], Long.parseLong(parts[1]), Integer.parseInt(parts[2]), parts[3]));
                }
            }
            Collections.sort(entries);
        } catch (IOException | NumberFormatException e) {
            e.printStackTrace();
        }
        if (!entries.isEmpty()) {
            ScoreManager.getInstance().setHighScore(entries.get(0).score);
        }
    }

    public void save() {
        try (BufferedWriter bw = new BufferedWriter(new FileWriter(FILE_PATH))) {
            for (HighScoreEntry entry : entries) {
                bw.write(entry.name + "," + entry.score + "," + entry.level + "," + entry.date);
                bw.newLine();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public void addEntry(String name, long score, int level) {
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
        entries.add(new HighScoreEntry(name, score, level, date));
        Collections.sort(entries);
        if (entries.size() > MAX_ENTRIES) {
            entries = entries.subList(0, MAX_ENTRIES);
        }
        save();
        if (!entries.isEmpty()) {
            ScoreManager.getInstance().setHighScore(entries.get(0).score);
        }
    }

    public boolean isHighScore(long score) {
        if (entries.size() < MAX_ENTRIES) return true;
        return score > entries.get(MAX_ENTRIES - 1).score;
    }

    public List<HighScoreEntry> getEntries() {
        return Collections.unmodifiableList(entries);
    }
}
