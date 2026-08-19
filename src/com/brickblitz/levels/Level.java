package com.brickblitz.levels;

import com.brickblitz.model.bricks.Brick;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class Level implements Iterable<Brick> {
    private String name;
    private String theme;
    private String musicStyle;
    private int rows;
    private int cols;
    private Brick[][] grid;
    private int levelIndex;
    private String backgroundStyle;

    public Level(String name, String theme, String musicStyle, int rows, int cols) {
        this.name = name;
        this.theme = theme;
        this.musicStyle = musicStyle;
        this.rows = rows;
        this.cols = cols;
        this.grid = new Brick[rows][cols];
        this.backgroundStyle = "Default";
    }

    public Level(Level other) {
        this.name = other.name;
        this.theme = other.theme;
        this.musicStyle = other.musicStyle;
        this.rows = other.rows;
        this.cols = other.cols;
        this.levelIndex = other.levelIndex;
        this.backgroundStyle = other.backgroundStyle;
        this.grid = new Brick[rows][cols];
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (other.grid[r][c] != null) {
                    this.grid[r][c] = other.grid[r][c].copy();
                }
            }
        }
    }

    public int getBrickCount() {
        int count = 0;
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                Brick b = grid[r][c];
                if (b != null && !b.isIndestructible()) {
                    count++;
                }
            }
        }
        return count;
    }

    @Override
    public Iterator<Brick> iterator() {
        List<Brick> bricks = new ArrayList<>();
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (grid[r][c] != null) {
                    bricks.add(grid[r][c]);
                }
            }
        }
        return bricks.iterator();
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getTheme() { return theme; }
    public void setTheme(String theme) { this.theme = theme; }
    public String getMusicStyle() { return musicStyle; }
    public void setMusicStyle(String musicStyle) { this.musicStyle = musicStyle; }
    public int getRows() { return rows; }
    public void setRows(int rows) { this.rows = rows; }
    public int getCols() { return cols; }
    public void setCols(int cols) { this.cols = cols; }
    public Brick[][] getGrid() { return grid; }
    public void setGrid(Brick[][] grid) { this.grid = grid; }
    public int getLevelIndex() { return levelIndex; }
    public void setLevelIndex(int levelIndex) { this.levelIndex = levelIndex; }
    public String getBackgroundStyle() { return backgroundStyle; }
    public void setBackgroundStyle(String backgroundStyle) { this.backgroundStyle = backgroundStyle; }
    public void setBrick(int row, int col, Brick brick) { this.grid[row][col] = brick; }
    public Brick getBrick(int row, int col) { return this.grid[row][col]; }
}
