package com.brickblitz.levels;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class LevelManager {
    private static LevelManager instance;
    private List<String> levelFilePaths;
    private int currentIndex;
    private Level currentLevel;

    private LevelManager() {
        levelFilePaths = new ArrayList<>();
        currentIndex = 0;
    }

    public static LevelManager getInstance() {
        if (instance == null) {
            instance = new LevelManager();
        }
        return instance;
    }

    public void loadBuiltinLevels(String levelsDir) {
        levelFilePaths.clear();
        String[] files = LevelLoader.listLevelFiles(levelsDir);
        levelFilePaths.addAll(Arrays.asList(files));
        currentIndex = 0;
    }

    public Level loadLevel(int index) {
        if (index >= 0 && index < levelFilePaths.size()) {
            try {
                Level level = LevelLoader.load(levelFilePaths.get(index));
                level.setLevelIndex(index);
                this.currentLevel = level;
                this.currentIndex = index;
                return level;
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        return null;
    }

    public Level nextLevel() {
        if (hasNextLevel()) {
            currentIndex++;
            return loadLevel(currentIndex);
        }
        return null;
    }

    public boolean hasNextLevel() {
        return currentIndex + 1 < levelFilePaths.size();
    }

    public void reloadCurrent() {
        loadLevel(currentIndex);
    }

    public List<String> getAvailableLevelNames() {
        List<String> names = new ArrayList<>();
        for (String path : levelFilePaths) {
            try {
                Level level = LevelLoader.load(path);
                names.add(level.getName());
            } catch (IOException e) {
                names.add("Unknown Level");
            }
        }
        return names;
    }
    
    public Level getCurrentLevel() {
        return currentLevel;
    }
    
    public int getCurrentIndex() {
        return currentIndex;
    }
}
