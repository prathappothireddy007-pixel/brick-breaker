package com.brickblitz.model.bricks;

import com.brickblitz.model.Ball;
import java.awt.Color;
import java.awt.GradientPaint;
import java.awt.Graphics2D;

public class IronBrick extends Brick {
    public IronBrick(double x, double y, int width, int height) {
        super(x, y, width, height);
        this.maxHits = 999;
        this.currentHits = 999;
        this.scoreValue = 0;
        this.indestructible = true;
        this.baseColor = Color.DARK_GRAY;
        this.dropChance = 0.0f;
    }

    @Override
    public void update(double deltaTime) {
    }

    @Override
    public Color getCrackColor() {
        return Color.BLACK;
    }

    @Override
    public void onHit(Ball ball) {
        if (ball.onFire) {
            currentHits -= 500;
            if (currentHits <= 0) {
                destroyed = true;
                active = false;
            }
        }
    }

    @Override
    public void render(Graphics2D g) {
        GradientPaint gp = new GradientPaint((float)position.x, (float)position.y, Color.GRAY, (float)position.x, (float)(position.y + height), Color.DARK_GRAY);
        g.setPaint(gp);
        g.fillRect((int)position.x, (int)position.y, width, height);
        
        g.setColor(Color.LIGHT_GRAY);
        g.drawRect((int)position.x, (int)position.y, width, height);
        
        // Rivets
        g.setColor(Color.BLACK);
        g.fillOval((int)position.x + 4, (int)position.y + 4, 4, 4);
        g.fillOval((int)position.x + width - 8, (int)position.y + 4, 4, 4);
        g.fillOval((int)position.x + 4, (int)position.y + height - 8, 4, 4);
        g.fillOval((int)position.x + width - 8, (int)position.y + height - 8, 4, 4);
    }

    @Override public char getToken() { return 'I'; }
    public Brick copy() { return new IronBrick(position.x, position.y, width, height); }
}
