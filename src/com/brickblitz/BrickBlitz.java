package com.brickblitz;

import javax.swing.*;
import java.awt.*;
import java.awt.event.*;
import java.awt.geom.Rectangle2D;
import java.awt.geom.Ellipse2D;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class BrickBlitz extends JFrame {
    public BrickBlitz() {
        setTitle("BrickBlitz");
        setSize(900, 700);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setResizable(false);
        setLocationRelativeTo(null);
        add(new GamePanel());
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new BrickBlitz().setVisible(true));
    }
}

enum Theme {
    NEON_CYAN(new Color(10, 10, 30), new Color(0, 255, 255), new Color(255, 0, 255)),
    SYNTHWAVE_SUNSET(new Color(40, 10, 50), new Color(255, 100, 0), new Color(255, 0, 128)),
    CYBERPUNK_EMERALD(new Color(10, 30, 20), new Color(0, 255, 100), new Color(200, 255, 0));

    final Color background;
    final Color primary;
    final Color secondary;

    Theme(Color bg, Color prim, Color sec) {
        this.background = bg;
        this.primary = prim;
        this.secondary = sec;
    }
}

class GamePanel extends JPanel implements Runnable, KeyListener, MouseMotionListener {
    private Thread gameThread;
    private boolean running = false;
    private final int FPS = 60;
    
    private Paddle paddle;
    private List<Ball> balls;
    private List<Brick> bricks;
    private Theme currentTheme = Theme.NEON_CYAN;
    private int score = 0;
    private int highScore = 0;
    private int lives = 3;
    private boolean gameOver = false;
    private boolean victory = false;

    public GamePanel() {
        setPreferredSize(new Dimension(900, 700));
        setFocusable(true);
        addKeyListener(this);
        addMouseMotionListener(this);
        initGame();
    }

    private void initGame() {
        paddle = new Paddle(400, 630, 100, 15);
        balls = new ArrayList<>();
        balls.add(new Ball(450, 610, -4, -5));
        bricks = new ArrayList<>();
        score = 0;
        lives = 3;
        gameOver = false;
        victory = false;
        generateLevel();
    }

    private void generateLevel() {
        bricks.clear();
        for (int row = 0; row < 5; row++) {
            for (int col = 0; col < 10; col++) {
                if (row == 0 && col == 4) {
                    bricks.add(new BossBrick(col * 80 + 50, row * 40 + 50));
                } else {
                    bricks.add(new Brick(col * 80 + 50, row * 40 + 50, 70, 25, 1));
                }
            }
        }
    }

    @Override
    public void addNotify() {
        super.addNotify();
        if (gameThread == null) {
            gameThread = new Thread(this);
            running = true;
            gameThread.start();
        }
    }

    @Override
    public void run() {
        double drawInterval = 1000000000.0 / FPS;
        double delta = 0;
        long lastTime = System.nanoTime();
        long currentTime;

        while (running) {
            currentTime = System.nanoTime();
            delta += (currentTime - lastTime) / drawInterval;
            lastTime = currentTime;

            if (delta >= 1) {
                update();
                repaint();
                delta--;
            }
        }
    }

    private void update() {
        if (gameOver || victory) return;

        // Update paddle
        paddle.update();

        // Update balls
        Iterator<Ball> ballIt = balls.iterator();
        while (ballIt.hasNext()) {
            Ball ball = ballIt.next();
            ball.update();
            
            // Wall collisions
            if (ball.x <= 0 || ball.x >= 900 - ball.size) ball.dx *= -1;
            if (ball.y <= 0) ball.dy *= -1;
            if (ball.y >= 700) {
                ballIt.remove();
            } else {
                // Paddle collision
                if (ball.getBounds().intersects(paddle.getBounds())) {
                    ball.dy = -Math.abs(ball.dy);
                    ball.dx = ((ball.x + ball.size / 2) - (paddle.x + paddle.width / 2)) * 0.15;
                }

                // Brick collisions
                Iterator<Brick> brickIt = bricks.iterator();
                while (brickIt.hasNext()) {
                    Brick brick = brickIt.next();
                    if (ball.getBounds().intersects(brick.getBounds())) {
                        ball.dy *= -1;
                        brick.hit();
                        score += 10;
                        if (brick.isDestroyed()) {
                            brickIt.remove();
                            // Multiball drop chance logic could go here
                            if (Math.random() < 0.1 && balls.size() < 3) {
                                spawnMultiBall(brick.x, brick.y);
                            }
                        }
                        break;
                    }
                }
            }
        }

        if (balls.isEmpty()) {
            lives--;
            if (lives <= 0) {
                handleGameOver();
            } else {
                balls.add(new Ball(paddle.x + paddle.width / 2, paddle.y - 20, -4, -5));
            }
        }

        if (bricks.isEmpty()) {
            victory = true;
            handleGameOver();
        }
    }

    private void spawnMultiBall(double x, double y) {
        if (balls.size() < 3) { // MultiBall cap: 3 balls max
            balls.add(new Ball(x, y, 4, -4));
        }
    }

    private void handleGameOver() {
        gameOver = true;
        if (score > highScore) {
            highScore = score;
            String name = JOptionPane.showInputDialog(this, "New High Score! Enter your name:", "High Score", JOptionPane.PLAIN_MESSAGE);
            if (name != null && !name.trim().isEmpty()) {
                System.out.println("New High Score by " + name + ": " + score);
            }
        }
    }

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        Graphics2D g2d = (Graphics2D) g;
        
        // Anti-aliasing
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g2d.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);

        // Background
        g2d.setColor(currentTheme.background);
        g2d.fillRect(0, 0, getWidth(), getHeight());

        if (gameOver && !victory) {
            drawCenteredString(g2d, "GAME OVER - Press R to Restart", 35);
        } else if (victory) {
            drawCenteredString(g2d, "VICTORY! - Press R to Restart", 35);
        } else {
            // Draw entities
            paddle.draw(g2d, currentTheme.primary);
            for (Ball ball : balls) {
                ball.draw(g2d, currentTheme.secondary);
            }
            for (Brick brick : bricks) {
                brick.draw(g2d, currentTheme.primary);
            }

            // HUD
            g2d.setColor(Color.WHITE);
            g2d.setFont(new Font("Arial", Font.BOLD, 20));
            g2d.drawString("Score: " + score, 20, 30);
            g2d.drawString("Lives: " + lives, 800, 30);
            g2d.drawString("High Score: " + highScore, 400, 30);
        }
    }

    private void drawCenteredString(Graphics2D g2d, String text, int fontSize) {
        g2d.setFont(new Font("Arial", Font.BOLD, fontSize));
        g2d.setColor(Color.WHITE);
        FontMetrics fm = g2d.getFontMetrics();
        int x = (getWidth() - fm.stringWidth(text)) / 2;
        int y = (getHeight() - fm.getHeight()) / 2 + fm.getAscent();
        g2d.drawString(text, x, y);
    }

    // Input Handling
    @Override
    public void mouseMoved(MouseEvent e) {
        if (!gameOver && !victory) {
            paddle.targetX = e.getX() - paddle.width / 2;
        }
    }
    @Override public void mouseDragged(MouseEvent e) {}
    
    @Override
    public void keyPressed(KeyEvent e) {
        if (e.getKeyCode() == KeyEvent.VK_R && (gameOver || victory)) {
            initGame();
        } else if (e.getKeyCode() == KeyEvent.VK_T) {
            // Switch themes
            int nextIdx = (currentTheme.ordinal() + 1) % Theme.values().length;
            currentTheme = Theme.values()[nextIdx];
        }
    }
    @Override public void keyReleased(KeyEvent e) {}
    @Override public void keyTyped(KeyEvent e) {}
}

class Ball {
    double x, y;
    double dx, dy;
    int size = 12;

    public Ball(double x, double y, double dx, double dy) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
    }

    public void update() {
        x += dx;
        y += dy;
    }

    public void draw(Graphics2D g2d, Color color) {
        g2d.setColor(color);
        g2d.fill(new Ellipse2D.Double(x, y, size, size));
    }

    public Rectangle2D getBounds() {
        return new Rectangle2D.Double(x, y, size, size);
    }
}

class Paddle {
    double x, y;
    double width, height;
    double targetX;

    public Paddle(double x, double y, double width, double height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.targetX = x;
    }

    public void update() {
        // Smooth follow
        x += (targetX - x) * 0.2;
        if (x < 0) x = 0;
        if (x > 900 - width) x = 900 - width;
    }

    public void draw(Graphics2D g2d, Color color) {
        g2d.setColor(color);
        g2d.fill(new Rectangle2D.Double(x, y, width, height));
    }

    public Rectangle2D getBounds() {
        return new Rectangle2D.Double(x, y, width, height);
    }
}

class Brick {
    double x, y;
    double width, height;
    int hp;

    public Brick(double x, double y, double width, double height, int hp) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.hp = hp;
    }

    public void hit() {
        hp--;
    }

    public boolean isDestroyed() {
        return hp <= 0;
    }

    public void draw(Graphics2D g2d, Color color) {
        g2d.setColor(color);
        g2d.fill(new Rectangle2D.Double(x, y, width, height));
        g2d.setColor(Color.WHITE);
        g2d.draw(new Rectangle2D.Double(x, y, width, height));
    }

    public Rectangle2D getBounds() {
        return new Rectangle2D.Double(x, y, width, height);
    }
}

class BossBrick extends Brick {
    public BossBrick(double x, double y) {
        super(x, y, 150, 40, 10);
    }

    @Override
    public void draw(Graphics2D g2d, Color color) {
        // Pulsing animation for BossBrick
        long time = System.currentTimeMillis();
        float pulse = (float) (Math.sin(time / 200.0) * 0.5 + 0.5);
        
        Color bossColor = new Color(
            Math.min(255, (int)(color.getRed() * pulse + 100)),
            Math.min(255, (int)(color.getGreen() * pulse)),
            Math.min(255, (int)(color.getBlue() * pulse))
        );
        
        g2d.setColor(bossColor);
        g2d.fill(new Rectangle2D.Double(x, y, width, height));
        g2d.setColor(Color.WHITE);
        g2d.setStroke(new BasicStroke(2));
        g2d.draw(new Rectangle2D.Double(x, y, width, height));
        
        // Draw HP text
        g2d.setColor(Color.WHITE);
        g2d.setFont(new Font("Arial", Font.BOLD, 14));
        g2d.drawString("BOSS HP: " + hp, (float)x + 20, (float)y + 25);
    }
}
