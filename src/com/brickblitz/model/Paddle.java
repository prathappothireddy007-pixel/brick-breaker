package com.brickblitz.model;

import java.awt.Color;
import java.awt.GradientPaint;
import java.awt.Graphics2D;
import java.awt.RenderingHints;

public class Paddle extends GameObject {
    public Color color = new Color(0, 255, 255);
    public boolean hasLaser = false;
    public boolean hasSticky = false;
    public boolean isExpanded = false;
    public int lives = 3;
    public float targetX;

    private static final int DEFAULT_WIDTH = 100;
    private static final int DEFAULT_HEIGHT = 16;
    private static final float LERP_FACTOR = 15.0f;

    public Paddle(double x, double y) {
        super(x, y, DEFAULT_WIDTH, DEFAULT_HEIGHT);
        this.targetX = (float) x;
    }

    public Paddle(double x, double y, int width, int height) {
        super(x, y, width, height);
        this.targetX = (float) x;
    }

    public void deflectBall(Ball ball) {
        double hitOffset = (ball.getCenter().x - getCenter().x) / (width / 2.0);
        hitOffset = Math.max(-1, Math.min(1, hitOffset));
        
        double maxAngle = Math.toRadians(60);
        double bounceAngle = hitOffset * maxAngle;
        
        double speed = ball.velocity.magnitude();
        ball.velocity.x = Math.sin(bounceAngle) * speed;
        ball.velocity.y = -Math.cos(bounceAngle) * speed;
        ball.capSpeed();
    }

    @Override
    public void render(Graphics2D g) {
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        
        // Glow
        g.setColor(new Color(color.getRed(), color.getGreen(), color.getBlue(), 50));
        g.fillRoundRect((int)position.x - 4, (int)position.y - 4, width + 8, height + 8, 10, 10);
        
        GradientPaint gp = new GradientPaint((float)position.x, (float)position.y, Color.WHITE, (float)position.x, (float)(position.y + height), color);
        g.setPaint(gp);
        g.fillRoundRect((int)position.x, (int)position.y, width, height, 10, 10);
        
        if (hasLaser) {
            g.setColor(Color.RED);
            g.fillRect((int)position.x + 10, (int)position.y - 4, 4, 8);
            g.fillRect((int)(position.x + width - 14), (int)position.y - 4, 4, 8);
        }
    }

    @Override
    public void update(double deltaTime) {
        width = isExpanded ? (int)(DEFAULT_WIDTH * 1.5) : DEFAULT_WIDTH;
        double diff = targetX - position.x;
        position.x += diff * LERP_FACTOR * deltaTime;
    }
}
