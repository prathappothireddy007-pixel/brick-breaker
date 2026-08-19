package com.brickblitz.view.panels;

import javax.swing.JPanel;
import java.awt.*;
import com.brickblitz.view.ScreenManager;
import com.brickblitz.view.ui.ModernButton;
import com.brickblitz.view.ui.ThemeManager;

public class SettingsPanel extends JPanel {
    public SettingsPanel(ScreenManager screenManager) {
        setLayout(null);
        setBackground(new Color(10, 10, 20));

        Color base = ThemeManager.getInstance().getTheme().primary;

        ModernButton btnNeon = new ModernButton("NEON CYAN", base, base);
        btnNeon.setBounds(340, 150, 220, 50);
        btnNeon.addActionListener(e -> ThemeManager.getInstance().setTheme("NEON_CYAN"));

        ModernButton btnSynth = new ModernButton("SYNTHWAVE", base, base);
        btnSynth.setBounds(340, 220, 220, 50);
        btnSynth.addActionListener(e -> ThemeManager.getInstance().setTheme("SYNTHWAVE_SUNSET"));

        ModernButton btnCyber = new ModernButton("CYBERPUNK", base, base);
        btnCyber.setBounds(340, 290, 220, 50);
        btnCyber.addActionListener(e -> ThemeManager.getInstance().setTheme("CYBERPUNK_EMERALD"));

        ModernButton btnBack = new ModernButton("BACK", base, base);
        btnBack.setBounds(340, 400, 220, 50);
        btnBack.addActionListener(e -> screenManager.showScreen(ScreenManager.MAIN_MENU));

        add(btnNeon);
        add(btnSynth);
        add(btnCyber);
        add(btnBack);
    }

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        g.setColor(Color.WHITE);
        g.setFont(new Font("Arial", Font.BOLD, 32));
        g.drawString("SETTINGS", 360, 100);
    }
}
