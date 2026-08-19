package com.brickblitz.levels;

import com.brickblitz.model.bricks.Brick;

import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;

public class LevelWriter {

    public static void save(Level level, String filePath) throws IOException {
        try (BufferedWriter bw = new BufferedWriter(new FileWriter(filePath))) {
            bw.write("NAME: " + level.getName() + "\n");
            bw.write("THEME: " + level.getTheme() + "\n");
            bw.write("MUSIC: " + level.getMusicStyle() + "\n");
            bw.write("ROWS: " + level.getRows() + "\n");
            bw.write("COLS: " + level.getCols() + "\n");
            bw.write("GRID:\n");
            
            Brick[][] grid = level.getGrid();
            for (int r = 0; r < level.getRows(); r++) {
                for (int c = 0; c < level.getCols(); c++) {
                    char token = brickToToken(grid[r][c]);
                    bw.write(token + (c == level.getCols() - 1 ? "" : " "));
                }
                bw.write("\n");
            }
        }
    }

    public static char brickToToken(Brick b) {
        if (b == null) return '.';
        return b.getToken(); // Requires Brick class to have getToken()
    }
}
