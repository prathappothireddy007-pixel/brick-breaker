package com.brickblitz.view.panels;

import javax.swing.JPanel;
import java.awt.*;
import com.brickblitz.view.ScreenManager;
import com.brickblitz.view.ui.GlassCard;
import com.brickblitz.view.ui.ModernButton;
import com.brickblitz.view.ui.ThemeManager;

public class LevelSelectPanel extends JPanel {
    private ScreenManager screenManager;
    private GamePanel gamePanel;

    public LevelSelectPanel(ScreenManager screenManager, GamePanel gamePanel) {
        this.screenManager = screenManager;
        this.gamePanel = gamePanel;
        setLayout(null);
        setBackground(new Color(10, 10, 20));

        Color base = ThemeManager.getInstance().getTheme().primary;

        int idx = 1;
        for (int row = 0; row < 2; row++) {
            for (int col = 0; col < 4; col++) {
                int levelIndex = idx;
                GlassCard card = new GlassCard(base);
                card.setBounds(50 + col * 200, 100 + row * 220, 180, 180);
                card.setLayout(new BorderLayout());
                
                JPanel p = new JPanel() {
                    @Override
                    protected void paintComponent(Graphics g) {
                        super.paintComponent(g);
                        g.setColor(Color.WHITE);
                        g.drawString("Level " + levelIndex, 60, 20);
                        // Mini preview logic would go here
                        g.setColor(base);
                        g.fillRect(40, 40, 100, 80);
                    }
                };
                p.setOpaque(false);
                card.add(p, BorderLayout.CENTER);

                ModernButton btn = new ModernButton("PLAY", base, base);
                btn.setPreferredSize(new Dimension(160, 30));
                btn.addActionListener(e -> {
                    gamePanel.initGame(levelIndex);
                    screenManager.showScreen(ScreenManager.GAME);
                });
                card.add(btn, BorderLayout.SOUTH);

                add(card);
                idx++;
            }
        }

        ModernButton btnBack = new ModernButton("BACK", base, base);
        btnBack.setBounds(340, 600, 220, 50);
        btnBack.addActionListener(e -> screenManager.showScreen(ScreenManager.MAIN_MENU));
        add(btnBack);
    }
}
