package com.brickblitz.view.panels;

import javax.swing.JPanel;
import javax.swing.Timer;
import java.awt.*;
import com.brickblitz.view.ScreenManager;
import com.brickblitz.view.ui.ModernButton;
import com.brickblitz.view.ui.ThemeManager;

public class CreditsPanel extends JPanel {
    private int scrollY = 700;
    private Timer timer;

    public CreditsPanel(ScreenManager screenManager) {
        setLayout(null);
        setBackground(new Color(10, 10, 20));

        Color base = ThemeManager.getInstance().getTheme().primary;

        ModernButton btnBack = new ModernButton("BACK", base, base);
        btnBack.setBounds(340, 600, 220, 50);
        btnBack.addActionListener(e -> {
            scrollY = 700;
            screenManager.showScreen(ScreenManager.MAIN_MENU);
        });
        add(btnBack);

        timer = new Timer(16, e -> {
            if(isShowing()) {
                scrollY -= 1;
                if(scrollY < -300) scrollY = 700;
                repaint();
            }
        });
        timer.start();
    }

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        Graphics2D g2 = (Graphics2D) g;
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        ThemeManager.Theme theme = ThemeManager.getInstance().getTheme();
        g2.setColor(theme.neonGlow);
        g2.setFont(new Font("Arial", Font.BOLD, 36));
        
        String[] lines = {
            "BRICK BLITZ",
            "",
            "Course: CSA0906",
            "Institution: SIMATS ENGINEERING",
            "Developer: Student",
            "Java Version: 11+",
            "Technologies: Java Swing & Java2D",
            "",
            "Thanks for playing!"
        };

        int y = scrollY;
        for (String line : lines) {
            int w = g2.getFontMetrics().stringWidth(line);
            g2.drawString(line, (getWidth() - w) / 2, y);
            y += 40;
        }
    }
}
