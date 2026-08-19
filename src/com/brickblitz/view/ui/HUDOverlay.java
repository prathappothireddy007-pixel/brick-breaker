package com.brickblitz.view.ui;

import javax.swing.JComponent;
import java.awt.*;
import java.util.List;
import com.brickblitz.model.ScoreManager; // Assume model classes exist
import com.brickblitz.model.Paddle;
import com.brickblitz.model.ActivePowerUp;

public class HUDOverlay extends JComponent {
    private ScoreManager scoreManager;
    private Paddle paddle;
    private List<ActivePowerUp> activePowerUps;
    private int fps = 60;

    public HUDOverlay(ScoreManager sm, Paddle p, List<ActivePowerUp> powerUps) {
        this.scoreManager = sm;
        this.paddle = p;
        this.activePowerUps = powerUps;
    }

    public void setFps(int fps) {
        this.fps = fps;
    }

    public void render(Graphics2D g, int width, int height) {
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);

        ThemeManager.Theme theme = ThemeManager.getInstance().getTheme();
        
        // Score
        g.setFont(new Font("Arial", Font.BOLD, 24));
        g.setColor(theme.primary);
        String scoreTxt = String.format("%06d", scoreManager != null ? scoreManager.getScore() : 0);
        g.drawString("SCORE: " + scoreTxt, 20, 30);

        // Combo
        if (scoreManager != null && scoreManager.getCombo() > 1) {
            g.setColor(new Color(255, 215, 0));
            g.setFont(new Font("Arial", Font.BOLD, 16));
            g.drawString("COMBO x" + scoreManager.getCombo(), 20, 50);
        }

        // Lives
        int lives = paddle != null ? paddle.getLives() : 3;
        g.setColor(theme.primary);
        for (int i = 0; i < lives; i++) {
            g.fillOval(width - 40 - (i * 25), 15, 15, 15);
        }

        // Active Powerups
        if (activePowerUps != null) {
            int yPos = height - 40;
            int xPos = 20;
            g.setFont(new Font("Arial", Font.PLAIN, 12));
            for (ActivePowerUp p : activePowerUps) {
                g.setColor(new Color(40, 40, 40, 200));
                g.fillRoundRect(xPos, yPos, 100, 20, 10, 10);
                
                g.setColor(theme.success); // or powerup color
                float ratio = p.getRemainingTime() / p.getMaxTime();
                g.fillRoundRect(xPos, yPos, (int)(100 * ratio), 20, 10, 10);
                
                g.setColor(Color.WHITE);
                g.drawString(p.getName(), xPos + 5, yPos + 14);
                
                xPos += 110;
            }
        }

        // FPS
        g.setColor(new Color(255, 255, 255, 100));
        g.setFont(new Font("Arial", Font.PLAIN, 10));
        g.drawString("FPS: " + fps, width / 2 - 15, 15);
    }
}
