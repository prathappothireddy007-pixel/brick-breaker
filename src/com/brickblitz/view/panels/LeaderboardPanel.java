package com.brickblitz.view.panels;

import javax.swing.JPanel;
import java.awt.*;
import com.brickblitz.view.ScreenManager;
import com.brickblitz.view.ui.GlassCard;
import com.brickblitz.view.ui.ModernButton;
import com.brickblitz.view.ui.ThemeManager;

public class LeaderboardPanel extends JPanel {
    public LeaderboardPanel(ScreenManager screenManager) {
        setLayout(null);
        setBackground(new Color(10, 10, 20));

        Color base = ThemeManager.getInstance().getTheme().primary;

        GlassCard card = new GlassCard(base);
        card.setBounds(150, 100, 600, 400);
        card.setLayout(null);

        // Dummy data for leaderboard
        String[][] data = {
            {"1", "PlayerOne", "50000", "5", "2023-10-01"},
            {"2", "BrickMaster", "45000", "4", "2023-10-02"},
            {"3", "Neo", "40000", "4", "2023-10-03"}
        };

        JPanel p = new JPanel() {
            @Override
            protected void paintComponent(Graphics g) {
                super.paintComponent(g);
                g.setColor(Color.WHITE);
                g.setFont(new Font("Arial", Font.BOLD, 24));
                g.drawString("HIGH SCORES", 200, 40);

                g.setFont(new Font("Arial", Font.PLAIN, 16));
                int y = 100;
                for (int i = 0; i < data.length; i++) {
                    if(i==0) g.setColor(new Color(255, 215, 0)); // Gold
                    else if(i==1) g.setColor(new Color(192, 192, 192)); // Silver
                    else if(i==2) g.setColor(new Color(205, 127, 50)); // Bronze
                    else g.setColor(Color.WHITE);

                    g.drawString(data[i][0], 50, y);
                    g.drawString(data[i][1], 150, y);
                    g.drawString(data[i][2], 300, y);
                    g.drawString(data[i][3], 400, y);
                    g.drawString(data[i][4], 480, y);
                    y += 40;
                }
            }
        };
        p.setOpaque(false);
        p.setBounds(0,0,600,400);
        card.add(p);
        add(card);

        ModernButton btnBack = new ModernButton("BACK", base, base);
        btnBack.setBounds(340, 550, 220, 50);
        btnBack.addActionListener(e -> screenManager.showScreen(ScreenManager.MAIN_MENU));
        add(btnBack);
    }
}
