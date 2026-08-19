package com.brickblitz.model;

import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.RadialGradientPaint;
import java.awt.geom.Point2D;
import java.util.ArrayDeque;
import java.util.Deque;

public class Ball extends GameObject {
    public int radius = 8;
    public Color color = Color.WHITE;
    public Color trailColor = new Color(255, 255, 255, 100);
    public boolean onFire = false;
    public Deque<Vector2D> trailPositions = new ArrayDeque<>();
    public float speed;
    public static final float MAX_SPEED = 600f;
    public static final float MIN_SPEED = 150f;
    public boolean sticky = false;
    public Vector2D stickyOffset = new Vector2D();
    
    private final int TRAIL_LENGTH = 12;

    public Ball(double x, double y) {
        super(x, y, 16, 16);
        this.speed = 300f;
    }

    public Ball(double x, double y, int radius) {
        super(x, y, radius * 2, radius * 2);
        this.radius = radius;
        this.speed = 300f;
    }

    public int getRadius() { return radius; }
    public void setRadius(int r) { this.radius = r; this.width = r * 2; this.height = r * 2; }
    public void setVelocity(Vector2D v) { this.velocity = v; }

    @Override
    public void update(double deltaTime) {
        if (!sticky) {
            position.add(Vector2D.scale(velocity, deltaTime));
            trailPositions.addFirst(new Vector2D(position.x + radius, position.y + radius));
            if (trailPositions.size() > TRAIL_LENGTH) {
                trailPositions.removeLast();
            }
        }
    }

    @Override
    public void render(Graphics2D g) {
        int i = 0;
        for (Vector2D trailPos : trailPositions) {
            float alpha = 1.0f - (float)i / trailPositions.size();
            Color tColor = onFire ? new Color(255, 100, 0, (int)(100 * alpha)) : new Color(trailColor.getRed(), trailColor.getGreen(), trailColor.getBlue(), (int)(100 * alpha));
            g.setColor(tColor);
            int tRadius = radius - i / 2;
            if (tRadius > 0) {
                g.fillOval((int)trailPos.x - tRadius, (int)trailPos.y - tRadius, tRadius * 2, tRadius * 2);
            }
            i++;
        }

        if (onFire) {
            g.setColor(new Color(255, 100, 0, 200));
            g.fillOval((int)position.x - 2, (int)position.y - 2, width + 4, height + 4);
        }

        Point2D center = new Point2D.Float((float)position.x + radius, (float)position.y + radius);
        float[] dist = {0.0f, 1.0f};
        Color[] colors = {Color.WHITE, color};
        RadialGradientPaint p = new RadialGradientPaint(center, radius, dist, colors);
        g.setPaint(p);
        g.fillOval((int)position.x, (int)position.y, width, height);
    }

    public void launch() {
        if (sticky) {
            sticky = false;
            velocity.x = speed * (Math.random() > 0.5 ? 1 : -1) * 0.5;
            velocity.y = -speed;
            velocity.normalize();
            velocity.scale(speed);
        }
    }

    public void capSpeed() {
        double currentSpeed = velocity.magnitude();
        if (currentSpeed < MIN_SPEED) {
            velocity.normalize();
            velocity.scale(MIN_SPEED);
            speed = MIN_SPEED;
        } else if (currentSpeed > MAX_SPEED) {
            velocity.normalize();
            velocity.scale(MAX_SPEED);
            speed = MAX_SPEED;
        } else {
            speed = (float)currentSpeed;
        }
    }

    public void reset(double paddleX, double paddleY) {
        sticky = true;
        position.x = paddleX;
        position.y = paddleY;
        velocity = new Vector2D(0, 0);
        trailPositions.clear();
        onFire = false;
    }
}
