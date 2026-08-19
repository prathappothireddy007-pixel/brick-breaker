package com.brickblitz.view;

import javax.swing.JPanel;
import java.awt.CardLayout;
import java.util.HashMap;
import java.util.Map;

public class ScreenManager {
    public static final String MAIN_MENU = "MAIN_MENU";
    public static final String GAME = "GAME";
    public static final String LEVEL_SELECT = "LEVEL_SELECT";
    public static final String LEVEL_EDITOR = "LEVEL_EDITOR";
    public static final String LEADERBOARD = "LEADERBOARD";
    public static final String SETTINGS = "SETTINGS";
    public static final String CREDITS = "CREDITS";

    private Map<String, JPanel> screens;
    private JPanel container;
    private String currentScreen;

    public ScreenManager(JPanel container) {
        this.container = container;
        this.screens = new HashMap<>();
    }

    public void register(String name, JPanel panel) {
        screens.put(name, panel);
        container.add(panel, name);
    }

    public void showScreen(String name) {
        if (screens.containsKey(name)) {
            CardLayout cl = (CardLayout) container.getLayout();
            cl.show(container, name);
            currentScreen = name;
            
            // Give focus to the new screen if needed
            JPanel panel = screens.get(name);
            panel.requestFocusInWindow();
        }
    }

    public String getCurrentScreen() {
        return currentScreen;
    }

    public JPanel getPanel(String name) {
        return screens.get(name);
    }
}
