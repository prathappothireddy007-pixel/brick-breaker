package com.brickblitz.view.panels;

import javax.swing.JPanel;
import javax.swing.Timer;
import java.awt.*;
import com.brickblitz.view.ScreenManager;
import com.brickblitz.view.fx.BackgroundRenderer;
import com.brickblitz.view.ui.ModernButton;
import com.brickblitz.view.ui.ThemeManager;

public class MainMenuPanel extends JPanel {
    private BackgroundRenderer bgRenderer;
    private Timer animTimer;
    private long startTime;

    public MainMenuPanel(ScreenManager screenManager) {
        setLayout(null);
        setBackground(Color.BLACK);
        bgRenderer = new BackgroundRenderer();
        startTime = System.currentTimeMillis();

        Color base = ThemeManager.getInstance().getTheme().primary;
        Color glow = ThemeManager.getInstance().getTheme().neonGlow;

        ModernButton btnPlay = new ModernButton("PLAY", base, glow);
        ModernButton btnLevelSelect = new ModernButton("LEVEL SELECT", base, glow);
        ModernButton btnLevelEditor = new ModernButton("LEVEL EDITOR", base, glow);
        ModernButton btnLeaderboard = new ModernButton("LEADERBOARD", base, glow);
        ModernButton btnSettings = new ModernButton("SETTINGS", base, glow);
        ModernButton btnCredits = new ModernButton("CREDITS", base, glow);

        int cx = 450 - 110;
        int sy = 250;
        int gap = 60;
        
        btnPlay.setBounds(cx, sy, 220, 50);
        btnLevelSelect.setBounds(cx, sy + gap, 220, 50);
        btnLevelEditor.setBounds(cx, sy + gap * 2, 220, 50);
        btnLeaderboard.setBounds(cx, sy + gap * 3, 220, 50);
        btnSettings.setBounds(cx, sy + gap * 4, 220, 50);
        btnCredits.setBounds(cx, sy + gap * 5, 220, 50);

        btnPlay.addActionListener(e -> {
            screenManager.showScreen(ScreenManager.GAME);
            // Start level 0 via GamePanel
            javax.swing.JPanel p = screenManager.getPanel(ScreenManager.GAME);
            if (p instanceof com.brickblitz.view.panels.GamePanel) {
                ((com.brickblitz.view.panels.GamePanel) p).initGame(0);
            }
        });
        btnLevelSelect.addActionListener(e -> screenManager.showScreen(ScreenManager.LEVEL_SELECT));
        btnLevelEditor.addActionListener(e -> screenManager.showScreen(ScreenManager.LEVEL_EDITOR));
        btnLeaderboard.addActionListener(e -> screenManager.showScreen(ScreenManager.LEADERBOARD));
        btnSettings.addActionListener(e -> screenManager.showScreen(ScreenManager.SETTINGS));
        btnCredits.addActionListener(e -> screenManager.showScreen(ScreenManager.CREDITS));

        add(btnPlay);
        add(btnLevelSelect);
        add(btnLevelEditor);
        add(btnLeaderboard);
        add(btnSettings);
        add(btnCredits);

        animTimer = new Timer(16, e -> {
            bgRenderer.update(0.016f);
            repaint();
        });
        animTimer.start();
    }

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        Graphics2D g2 = (Graphics2D) g;
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        bgRenderer.render(g2, getWidth(), getHeight());

        float time = (System.currentTimeMillis() - startTime) / 1000f;
        float glowOsc = (float) (Math.sin(time * 3) * 0.5 + 0.5);

        g2.setFont(new Font("Arial", Font.BOLD, 64));
        FontMetrics fm = g2.getFontMetrics();
        String title = "BRICK BLITZ";
        int tx = (getWidth() - fm.stringWidth(title)) / 2;
        int ty = 150;

        ThemeManager.Theme theme = ThemeManager.getInstance().getTheme();
        
        g2.setComposite(AlphaComposite.getInstance(AlphaComposite.SRC_OVER, glowOsc * 0.5f + 0.2f));
        g2.setColor(theme.neonGlow);
        for(int i=2; i<=8; i+=2) {
            g2.drawString(title, tx - i, ty - i);
            g2.drawString(title, tx + i, ty + i);
        }
        
        g2.setComposite(AlphaComposite.getInstance(AlphaComposite.SRC_OVER, 1f));
        g2.setColor(theme.primary);
        g2.drawString(title, tx, ty);
        
        g2.setColor(Color.WHITE);
        g2.setFont(new Font("Arial", Font.PLAIN, 20));
        String sub = "ARCADE EDITION";
        g2.drawString(sub, (getWidth() - g2.getFontMetrics().stringWidth(sub)) / 2, ty + 40);
    }
}
