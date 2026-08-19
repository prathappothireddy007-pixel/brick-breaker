package com.brickblitz.model.bricks;

import com.brickblitz.model.Ball;
import java.awt.Color;
import java.awt.Graphics2D;

public class MovingBrick extends Brick {
    public float oscSpeed = 80f;
    public boolean oscRight = true;
    public float oscRange = 120f;
    private double startX;

    public MovingBrick(double x, double y, int width, int height) {
        super(x, y, width, height);
        this.maxHits = 2;
        this.currentHits = 2;
        this.scoreValue = 40;
        this.indestructible = false;
        this.baseColor = new Color(0, 128, 128); // Teal
        this.dropChance = 0.15f;
        this.startX = x;
    }

    @Override
    public void update(double deltaTime) {
        if (oscRight) {
            position.x += oscSpeed * deltaTime;
            if (position.x > startX + oscRange) {
                oscRight = false;
            }
        } else {
            position.x -= oscSpeed * deltaTime;
            if (position.x < startX - oscRange) {
                oscRight = true;
            }
        }
    }

    @Override
    public Color getCrackColor() {
        return Color.CYAN;
    }

    @Override
    public void onHit(Ball ball) {
        currentHits--;
        if (currentHits <= 0) {
            destroyed = true;
            active = false;
        }
    }

    @Override
    public void render(Graphics2D g) {
        // Motion blur effect
        g.setColor(new Color(baseColor.getRed(), baseColor.getGreen(), baseColor.getBlue(), 50));
        int blurOffset = oscRight ? -10 : 10;
        g.fillRoundRect((int)position.x + blurOffset, (int)position.y, width, height, 8, 8);
        
        super.render(g);
    }

    @Override public char getToken() { return 'V'; }
    public Brick copy() { return new MovingBrick(position.x, position.y, width, height); }
}
