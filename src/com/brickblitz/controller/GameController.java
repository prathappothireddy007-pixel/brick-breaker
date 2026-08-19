package com.brickblitz.controller;

import com.brickblitz.audio.SoundEffect;
import com.brickblitz.audio.SoundManager;
import com.brickblitz.levels.Level;
import com.brickblitz.levels.LevelManager;
import com.brickblitz.model.*;
import com.brickblitz.model.bricks.Brick;
import com.brickblitz.model.bricks.ExplosiveBrick;
import com.brickblitz.model.powerups.*; import com.brickblitz.view.fx.*; import com.brickblitz.view.panels.*; import com.brickblitz.model.score.ScoreManager;

import javax.swing.SwingUtilities;
import java.awt.Graphics2D;
import java.awt.event.KeyEvent;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;

public class GameController {

    public enum GameState {
        MENU, PLAYING, PAUSED, GAME_OVER, VICTORY, LEVEL_TRANSITION
    }

    private GameState state = GameState.MENU;
    private Level currentLevel;
    private List<Ball> balls = new ArrayList<>();
    private Paddle paddle;
    private List<PowerUp> powerups = new ArrayList<>();
    private List<ActivePowerUp> activePowerUps = new ArrayList<>();
    private List<Laser> lasers = new ArrayList<>();
    private List<Brick> activeBricks = new ArrayList<>();
    private ParticleSystem particleSystem;
    private ScreenShake screenShake;
    private List<FloatingText> floatingTexts = new ArrayList<>();
    private SoundManager soundManager;
    private ScoreManager scoreManager;
    private LevelManager levelManager;
    private InputHandler inputHandler;
    private BackgroundRenderer bgRenderer;
    private GamePanel panel;
    private float levelTransitionTimer;
    private boolean shieldActive;
    private float timeSlowFactor = 1.0f;

    public void init(GamePanel panel, InputHandler input) {
        this.panel = panel;
        this.inputHandler = input;
        this.levelManager = LevelManager.getInstance();
        this.soundManager = SoundManager.getInstance();
        this.scoreManager = ScoreManager.getInstance();
        this.particleSystem = new ParticleSystem();
        this.screenShake = new ScreenShake();
        this.bgRenderer = new BackgroundRenderer();
        
        soundManager.init();
        levelManager.loadBuiltinLevels("levels");
    }

    public void startGame(int levelIndex) {
        currentLevel = levelManager.loadLevel(levelIndex);
        if (currentLevel != null) {
            paddle = new Paddle(400, 650, 100, 15);
            balls.clear();
            Ball startBall = new Ball(450, 630, 8);
            startBall.setVelocity(new Vector2D(0, -300));
            balls.add(startBall);
            
            powerups.clear();
            activePowerUps.clear();
            lasers.clear();
            floatingTexts.clear();
            
            
            activeBricks.clear();
            for (Brick b : currentLevel) {
                activeBricks.add(b);
            }
            
            state = GameState.PLAYING;
            scoreManager.resetScore();
        }
    }

    public void update(double deltaTime) {
        double dt = deltaTime * timeSlowFactor;
        handleInput(dt);
        
        if (screenShake != null) screenShake.update((float)deltaTime);
        if (bgRenderer != null) bgRenderer.update((float)deltaTime);

        switch (state) {
            case PLAYING:
                updatePlaying(dt);
                break;
            case LEVEL_TRANSITION:
                levelTransitionTimer -= deltaTime;
                if (levelTransitionTimer <= 0) {
                    Level next = levelManager.nextLevel();
                    if (next != null) {
                        startGame(levelManager.getCurrentIndex());
                    } else {
                        state = GameState.VICTORY;
                    }
                }
                break;
            default:
                break;
        }
    }

    private void updatePlaying(double dt) {
        paddle.update(dt);
        
        for (int i = balls.size() - 1; i >= 0; i--) {
            Ball b = balls.get(i);
            b.update(dt);
            PhysicsEngine.resolveCollisions(b, paddle, activeBricks, lasers, this);
            PhysicsEngine.checkBallLost(b, 700, this);
        }
        
        for (int i = lasers.size() - 1; i >= 0; i--) {
            Laser l = lasers.get(i);
            l.update(dt);
            if (l.getY() < 0 || !l.isActive()) {
                lasers.remove(i);
            }
        }
        
        for (int i = powerups.size() - 1; i >= 0; i--) {
            PowerUp pu = powerups.get(i);
            pu.update(dt);
            if (PhysicsEngine.circleIntersectsRect(pu.getX(), pu.getY(), 15, paddle.getX(), paddle.getY(), paddle.getWidth(), paddle.getHeight())) {
                onPowerUpCollected(pu);
                powerups.remove(i);
            } else if (pu.getY() > 700) {
                powerups.remove(i);
            }
        }
        
        for (int i = activePowerUps.size() - 1; i >= 0; i--) {
            ActivePowerUp apu = activePowerUps.get(i);
            apu.update(dt);
            if (apu.isExpired()) {
                apu.removeEffect(this);
                activePowerUps.remove(i);
            }
        }
        
        particleSystem.update((float)dt);
        
        for (int i = floatingTexts.size() - 1; i >= 0; i--) {
            FloatingText ft = floatingTexts.get(i);
            ft.update((float)dt);
            if (!ft.isAlive()) {
                floatingTexts.remove(i);
            }
        }
        
        for (Brick b : activeBricks) {
            b.update(dt);
        }
        
        checkVictory();
    }

    public void render() {
        if (panel != null) {
            SwingUtilities.invokeLater(() -> panel.repaint());
        }
    }

    public void renderGame(Graphics2D g) {
        if (screenShake != null) screenShake.applyTransform(g);
        
        if (bgRenderer != null) {
            if (currentLevel != null) bgRenderer.setTheme(currentLevel.getTheme());
            bgRenderer.render(g, 900, 700);
        }
        
        for (Brick b : activeBricks) {
            if (!b.isDestroyed()) b.render(g);
        }
        
        for (PowerUp pu : powerups) pu.render(g);
        for (Laser l : lasers) l.render(g);
        if (paddle != null) paddle.render(g);
        for (Ball b : balls) b.render(g);
        
        if (particleSystem != null) particleSystem.render(g);
        for (FloatingText ft : floatingTexts) ft.render(g);
        
        if (scoreManager != null) scoreManager.renderHUD(g, state, levelManager.getCurrentIndex());
        
        if (screenShake != null) screenShake.resetTransform(g);
    }

    public void onBrickDestroyed(Brick brick, Ball ball) {
        activeBricks.remove(brick);
        scoreManager.addScore(brick.getScoreValue());
        soundManager.play(SoundEffect.BRICK_BREAK);
        particleSystem.emitBrickExplosion(brick.getX() + brick.getWidth()/2, brick.getY() + brick.getHeight()/2, java.awt.Color.WHITE, 20);
        
        if (Math.random() < 0.1) {
            powerups.add(new PowerUp(brick.getX() + brick.getWidth()/2, brick.getY() + brick.getHeight()/2, PowerUpType.values()[(int)(Math.random() * PowerUpType.values().length)]));
        }
        
        if (brick instanceof ExplosiveBrick) {
            explodeChain((ExplosiveBrick) brick, activeBricks);
        }
    }

    public void onBallLost(Ball ball) {
        balls.remove(ball);
        if (balls.isEmpty()) {
            if (shieldActive) {
                shieldActive = false;
                Ball b = new Ball(paddle.getX() + paddle.getWidth()/2, paddle.getY() - 10, 8);
                b.setVelocity(new Vector2D(0, -300));
                balls.add(b);
            } else {
                scoreManager.loseLife();
                if (scoreManager.getLives() <= 0) {
                    state = GameState.GAME_OVER;
                    soundManager.play(SoundEffect.GAME_OVER);
                    if (scoreManager.getCurrentScore() > 0 && scoreManager.getCurrentScore() >= scoreManager.getHighScore()) {
                        javax.swing.SwingUtilities.invokeLater(() -> {
                            javax.swing.JOptionPane.showInputDialog(null, "New High Score! Enter your name:", "High Score", javax.swing.JOptionPane.PLAIN_MESSAGE);
                        });
                    }
                } else {
                    Ball b = new Ball(paddle.getX() + paddle.getWidth()/2, paddle.getY() - 10, 8);
                    b.setVelocity(new Vector2D(0, -300));
                    balls.add(b);
                    soundManager.play(SoundEffect.BALL_LOST);
                }
            }
        }
    }

    public void onPowerUpCollected(PowerUp pu) {
        soundManager.play(SoundEffect.POWERUP_COLLECT);
        scoreManager.addScore(100);
        floatingTexts.add(FloatingText.forScore(100, pu.getX(), pu.getY()));
        
        switch (pu.type) {
            case MULTI_BALL:
                if (balls.size() < 3 && !balls.isEmpty()) {
                    Ball b1 = new Ball(balls.get(0).getX(), balls.get(0).getY(), 8);
                    b1.setVelocity(new Vector2D(200, -200));
                    balls.add(b1);
                }
                break;
            case LASER_CANNON:
                activePowerUps.add(new ActivePowerUp(PowerUpType.LASER_CANNON, 5.0f));
                break;
            case EXTRA_LIFE:
                scoreManager.addLife();
                soundManager.play(SoundEffect.EXTRA_LIFE);
                break;
            case TIME_SLOW:
                activePowerUps.add(new ActivePowerUp(PowerUpType.TIME_SLOW, 5.0f));
                timeSlowFactor = 0.5f;
                break;
            case SHIELD_FLOOR:
                shieldActive = true;
                break;
            default:
                break;
        }
    }

    public void fireLasers() {
        lasers.add(new Laser(paddle.getX() + 10, paddle.getY()));
        lasers.add(new Laser(paddle.getX() + paddle.getWidth() - 10, paddle.getY()));
        soundManager.play(SoundEffect.LASER_SHOT);
    }

    public void explodeChain(ExplosiveBrick origin, List<Brick> bricks) {
        soundManager.play(SoundEffect.EXPLOSION);
        Queue<ExplosiveBrick> queue = new LinkedList<>();
        queue.add(origin);
        
        while (!queue.isEmpty()) {
            ExplosiveBrick eb = queue.poll();
            screenShake.addTrauma(0.5f);
            float cx = eb.getX() + eb.getWidth() / 2;
            float cy = eb.getY() + eb.getHeight() / 2;
            float radius = 100; // explosion radius
            
            for (int i = bricks.size() - 1; i >= 0; i--) {
                Brick b = bricks.get(i);
                if (b == eb) continue;
                float bcx = b.getX() + b.getWidth() / 2;
                float bcy = b.getY() + b.getHeight() / 2;
                float dist = (float) Math.sqrt((cx-bcx)*(cx-bcx) + (cy-bcy)*(cy-bcy));
                
                if (dist <= radius) {
                    b.hit(null);
                    if (b.isDestroyed()) {
                        scoreManager.addScore(b.getScoreValue());
                        particleSystem.emitBrickExplosion(bcx, bcy, java.awt.Color.WHITE, 20);
                        bricks.remove(i);
                        if (b instanceof ExplosiveBrick) {
                            queue.add((ExplosiveBrick) b);
                        }
                    }
                }
            }
        }
    }

    public void checkVictory() {
        boolean allDestroyed = true;
        for (Brick b : activeBricks) {
            if (!b.isIndestructible() && !b.isDestroyed()) {
                allDestroyed = false;
                break;
            }
        }
        
        if (allDestroyed && activeBricks.size() > 0) {
            soundManager.play(SoundEffect.LEVEL_CLEAR);
            if (levelManager.hasNextLevel()) {
                state = GameState.LEVEL_TRANSITION;
                levelTransitionTimer = 3.0f;
            } else {
                state = GameState.VICTORY;
                if (scoreManager.getCurrentScore() > 0 && scoreManager.getCurrentScore() >= scoreManager.getHighScore()) {
                    javax.swing.SwingUtilities.invokeLater(() -> {
                        javax.swing.JOptionPane.showInputDialog(null, "New High Score! Enter your name:", "High Score", javax.swing.JOptionPane.PLAIN_MESSAGE);
                    });
                }
            }
        }
    }

    public void pause() {
        if (state == GameState.PLAYING) state = GameState.PAUSED;
    }

    public void resume() {
        if (state == GameState.PAUSED) state = GameState.PLAYING;
    }

    public void handleInput(double dt) {
        if (paddle != null && state == GameState.PLAYING) {
            paddle.setX(inputHandler.getMouseX() - paddle.getWidth() / 2);
            if (paddle.getX() < 0) paddle.setX(0);
            if (paddle.getX() + paddle.getWidth() > 900) paddle.setX(900 - paddle.getWidth());
        }
        
        if (inputHandler.isKeyPressed(KeyEvent.VK_P)) {
            if (state == GameState.PLAYING) pause();
            else if (state == GameState.PAUSED) resume();
            inputHandler.pressedKeys.remove(KeyEvent.VK_P); // consume
        }
        
        if (inputHandler.isKeyPressed(KeyEvent.VK_SPACE) && state == GameState.PLAYING) {
            boolean hasLaser = false;
            for (ActivePowerUp apu : activePowerUps) {
                if (apu.type == PowerUpType.LASER_CANNON) {
                    hasLaser = true;
                    break;
                }
            }
            if (hasLaser && lasers.size() < 10) { // arbitrary limit to prevent spam
                fireLasers();
                inputHandler.pressedKeys.remove(KeyEvent.VK_SPACE); // consume to prevent rapid fire
            }
        }
    }
    
    public ScreenShake getScreenShake() { return screenShake; }
    public SoundManager getSoundManager() { return soundManager; }
    public void resumeGame() { resume(); } public String getGameState() { return state.name(); } public void setTimeSlowFactor(float factor) { this.timeSlowFactor = factor; }
}
