package com.brickblitz.levels;

import com.brickblitz.model.bricks.Brick;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class LevelLoader {

    public static Level load(String filePath) throws IOException {
        try (BufferedReader br = new BufferedReader(new FileReader(filePath))) {
            String name = "Unknown";
            String theme = "Default";
            String music = "Default";
            int rows = 0;
            int cols = 0;
            
            String line;
            while ((line = br.readLine()) != null) {
                line = line.trim();
                if (line.startsWith("NAME:")) name = line.substring(5).trim();
                else if (line.startsWith("THEME:")) theme = line.substring(6).trim();
                else if (line.startsWith("MUSIC:")) music = line.substring(6).trim();
                else if (line.startsWith("ROWS:")) rows = Integer.parseInt(line.substring(5).trim());
                else if (line.startsWith("COLS:")) cols = Integer.parseInt(line.substring(5).trim());
                else if (line.startsWith("GRID:")) {
                    break;
                }
            }
            
            if (rows <= 0 || cols <= 0) {
                throw new IOException("Invalid level dimensions");
            }
            
            Level level = new Level(name, theme, music, rows, cols);
            int brickW = 60; // Default width
            int brickH = 20; // Default height
            
            for (int r = 0; r < rows; r++) {
                line = br.readLine();
                if (line != null) {
                    String[] tokens = line.trim().split("\\s+");
                    for (int c = 0; c < cols && c < tokens.length; c++) {
                        char token = tokens[c].charAt(0);
                        Brick b = BrickFactory.createBrick(token, c, r, brickW, brickH);
                        level.setBrick(r, c, b);
                    }
                }
            }
            
            return level;
        }
    }

    public static String[] listLevelFiles(String levelsDir) {
        File dir = new File(levelsDir);
        if (!dir.exists() || !dir.isDirectory()) {
            return new String[0];
        }
        
        File[] files = dir.listFiles((d, name) -> name.endsWith(".lvl"));
        if (files == null) {
            return new String[0];
        }
        
        String[] paths = new String[files.length];
        for (int i = 0; i < files.length; i++) {
            paths[i] = files[i].getAbsolutePath();
        }
        Arrays.sort(paths);
        return paths;
    }
}
