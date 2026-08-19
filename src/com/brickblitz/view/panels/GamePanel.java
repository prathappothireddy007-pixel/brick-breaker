package com.brickblitz.view.panels;

import javax.swing.JPanel;
import java.awt.*;
import com.brickblitz.controller.GameController;
import com.brickblitz.controller.InputHandler;
import com.brickblitz.view.ScreenManager;
import com.brickblitz.view.ui.ModernButton;
import com.brickblitz.view.ui.ThemeManager;

public class GamePanel extends JPanel {
    private GameController controller;
    private InputHandler inputHandler;
    private ScreenManager screenManager;
    private boolean initialized = false;

    private ModernButton btnResume, btnMenu;

    public GamePanel(GameController controller, InputHandler inputHandler, ScreenManager screenManager) {
        this.controller = controller;
        this.inputHandler = inputHandler;
        this.screenManager = screenManager;
        setLayout(null);
        setBackground(Color.BLACK);
        setFocusable(true);
        addKeyListener(inputHandler);
        addMouseMotionListener(inputHandler);
        addMouseListener(inputHandler);

        Color base = ThemeManager.getInstance().getTheme().primary;
        Color glow = ThemeManager.getInstance().getTheme().neonGlow;

        btnResume = new ModernButton("RESUME", base, glow);
        btnMenu = new ModernButton("MAIN MENU", base, glow);

        btnResume.setBounds(340, 300, 220, 50);
        btnMenu.setBounds(340, 370, 220, 50);

        btnResume.addActionListener(e -> controller.resumeGame());
        btnMenu.addActionListener(e -> {
            controller.pause();
            screenManager.showScreen(ScreenManager.MAIN_MENU);
        });

        add(btnResume);
        add(btnMenu);
        btnResume.setVisible(false);
        btnMenu.setVisible(false);
    }

    public void initGame(int levelIndex) {
        controller.startGame(levelIndex);
        initialized = true;
        requestFocusInWindow();
    }

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        Graphics2D g2 = (Graphics2D) g;
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g2.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);

        if (!initialized) {
            // Draw a "Press any key" prompt if game hasn't started
            g2.setColor(new Color(10, 0, 30));
            g2.fillRect(0, 0, getWidth(), getHeight());
            g2.setColor(new Color(0, 255, 255));
            g2.setFont(new Font("Arial", Font.BOLD, 28));
            String msg = "Click PLAY from Level Select to start!";
            FontMetrics fm = g2.getFontMetrics();
            g2.drawString(msg, (getWidth() - fm.stringWidth(msg)) / 2, getHeight() / 2);
            return;
        }

        controller.renderGame(g2); // Renders game world and HUD

        String state = controller.getGameState();

        if ("PAUSED".equals(state)) {
            g2.setColor(new Color(0, 0, 0, 150));
            g2.fillRect(0, 0, getWidth(), getHeight());
            g2.setColor(new Color(0, 255, 255));
            g2.setFont(new Font("Arial", Font.BOLD, 56));
            FontMetrics fm = g2.getFontMetrics();
            String paused = "PAUSED";
            g2.drawString(paused, (getWidth() - fm.stringWidth(paused)) / 2, 220);
            btnResume.setVisible(true);
            btnMenu.setVisible(true);
        } else if ("GAME_OVER".equals(state)) {
            g2.setColor(new Color(50, 0, 0, 160));
            g2.fillRect(0, 0, getWidth(), getHeight());
            g2.setColor(Color.RED);
            g2.setFont(new Font("Arial", Font.BOLD, 56));
            FontMetrics fm = g2.getFontMetrics();
            String msg = "GAME OVER";
            g2.drawString(msg, (getWidth() - fm.stringWidth(msg)) / 2, 220);
            btnResume.setVisible(false);
            btnMenu.setVisible(true);
        } else if ("VICTORY".equals(state)) {
            g2.setColor(new Color(0, 50, 0, 160));
            g2.fillRect(0, 0, getWidth(), getHeight());
            g2.setColor(new Color(0, 255, 100));
            g2.setFont(new Font("Arial", Font.BOLD, 56));
            FontMetrics fm = g2.getFontMetrics();
            String msg = "VICTORY!";
            g2.drawString(msg, (getWidth() - fm.stringWidth(msg)) / 2, 220);
            btnResume.setVisible(false);
            btnMenu.setVisible(true);
        } else {
            // Playing or transitioning — hide buttons
            btnResume.setVisible(false);
            btnMenu.setVisible(false);
        }
    }
}
