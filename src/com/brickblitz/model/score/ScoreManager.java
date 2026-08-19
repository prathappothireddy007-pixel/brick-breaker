package com.brickblitz.model.score;

public class ScoreManager {
    private static ScoreManager instance;

    private long currentScore;
    private long highScore;
    private int combo;
    private int maxCombo;
    private float multiplier = 1.0f;

    private ScoreManager() {
        reset();
    }

    public static ScoreManager getInstance() {
        if (instance == null) {
            instance = new ScoreManager();
        }
        return instance;
    }

    public void addScore(int base) {
        currentScore += (long)(base * multiplier * getComboBonus());
        if (currentScore > highScore) {
            highScore = currentScore;
        }
    }

    public void incrementCombo() {
        combo++;
        if (combo > maxCombo) {
            maxCombo = combo;
        }
    }

    public void resetCombo() {
        combo = 0;
    }

    public float getComboBonus() {
        if (combo >= 20) return 5.0f;
        if (combo >= 10) return 3.0f;
        if (combo >= 5) return 2.0f;
        return 1.0f;
    }

    public void reset() {
        currentScore = 0;
        combo = 0;
        maxCombo = 0;
        multiplier = 1.0f;
    }

    private int lives = 3;
    
    public void resetScore() { 
        reset();
        lives = 3; 
    }
    public void loseLife() { lives = Math.max(0, lives - 1); }
    public void addLife()  { lives++; }
    public int  getLives() { return lives; }
    
    public void renderHUD(java.awt.Graphics2D g, Object state, int levelIndex) {
        g.setFont(new java.awt.Font("Monospaced", java.awt.Font.BOLD, 20));
        g.setColor(new java.awt.Color(0, 255, 255));
        g.drawString("SCORE: " + currentScore, 15, 30);
        g.setColor(java.awt.Color.WHITE);
        g.setFont(new java.awt.Font("Monospaced", java.awt.Font.BOLD, 14));
        g.drawString("LIVES: " + lives, 15, 55);
        g.drawString("LEVEL: " + (levelIndex + 1), 15, 75);
        if (combo > 1) {
            g.setColor(new java.awt.Color(255, 215, 0));
            g.drawString("COMBO x" + combo, 15, 95);
        }
    }

    public void setMultiplier(float multiplier) {
        this.multiplier = multiplier;
    }

    public long getCurrentScore() {
        return currentScore;
    }

    public long getHighScore() {
        return highScore;
    }

    public int getCombo() {
        return combo;
    }

    public int getMaxCombo() {
        return maxCombo;
    }

    public float getMultiplier() {
        return multiplier;
    }

    public void setHighScore(long hs) {
        this.highScore = hs;
    }
}
