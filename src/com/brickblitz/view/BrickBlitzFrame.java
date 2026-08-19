package com.brickblitz.view;

import javax.swing.JFrame;
import javax.swing.JPanel;
import java.awt.CardLayout;
import com.brickblitz.view.panels.*;
import com.brickblitz.controller.GameController;
import com.brickblitz.controller.GameLoop;
import com.brickblitz.controller.InputHandler;

public class BrickBlitzFrame extends JFrame {
    private ScreenManager screenManager;
    private GameController gameController;
    private InputHandler inputHandler;
    private GameLoop gameLoop;

    public void init() {
        setTitle("BrickBlitz");
        setSize(900, 700);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setResizable(false);

        inputHandler = new InputHandler();
        addKeyListener(inputHandler);

        JPanel container = new JPanel(new CardLayout());
        screenManager = new ScreenManager(container);
        gameController = new GameController();

        // Instantiate panels
        MainMenuPanel mainMenu = new MainMenuPanel(screenManager);
        GamePanel gamePanel = new GamePanel(gameController, inputHandler, screenManager);
        LevelSelectPanel levelSelect = new LevelSelectPanel(screenManager, gamePanel);
        LevelEditorPanel levelEditor = new LevelEditorPanel(screenManager);
        LeaderboardPanel leaderboard = new LeaderboardPanel(screenManager);
        SettingsPanel settings = new SettingsPanel(screenManager);
        CreditsPanel credits = new CreditsPanel(screenManager);

        screenManager.register(ScreenManager.MAIN_MENU, mainMenu);
        screenManager.register(ScreenManager.GAME, gamePanel);
        screenManager.register(ScreenManager.LEVEL_SELECT, levelSelect);
        screenManager.register(ScreenManager.LEVEL_EDITOR, levelEditor);
        screenManager.register(ScreenManager.LEADERBOARD, leaderboard);
        screenManager.register(ScreenManager.SETTINGS, settings);
        screenManager.register(ScreenManager.CREDITS, credits);

        add(container);

        // Init controller AFTER gamePanel is created
        gameController.init(gamePanel, inputHandler);

        // Start the 60-FPS game loop
        gameLoop = new GameLoop(gameController);
        gameLoop.start();

        screenManager.showScreen(ScreenManager.MAIN_MENU);

        setLocationRelativeTo(null);
        setVisible(true);

        // Ensure keyboard events reach the frame
        requestFocusInWindow();
    }
}
