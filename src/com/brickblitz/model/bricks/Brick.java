package com.brickblitz.model.bricks;

import com.brickblitz.model.Ball;
import com.brickblitz.model.GameObject;
import com.brickblitz.model.powerups.PowerUpType;

import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.GradientPaint;
import java.awt.Graphics2D;
import java.awt.RenderingHints;

public abstract class Brick extends GameObject {
    public int maxHits;
    public int currentHits;
    public int scoreValue;
    public boolean indestructible;
    public Color baseColor;
    public PowerUpType dropType;
    public float dropChance;
    public boolean destroyed;

    public Brick(double x, double y, int width, int height) {
        super(x, y, width, height);
        this.destroyed = false;
    }

    public abstract Color getCrackColor();
    public abstract void onHit(Ball ball);
    public abstract char getToken(); public abstract Brick copy();

    @Override
    public void render(Graphics2D g) {
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        
        GradientPaint gp = new GradientPaint((float)position.x, (float)position.y, Color.WHITE, (float)position.x, (float)(position.y + height), baseColor);
        g.setPaint(gp);
        g.fillRoundRect((int)position.x, (int)position.y, width, height, 8, 8);
        
        g.setColor(baseColor.darker());
        g.setStroke(new BasicStroke(2));
        g.drawRoundRect((int)position.x, (int)position.y, width, height, 8, 8);

        if (currentHits < maxHits && currentHits > 0) {
            g.setColor(getCrackColor());
            int crackX = (int)position.x + width / 2;
            int crackY = (int)position.y + height / 2;
            g.drawLine((int)position.x + 5, (int)position.y + 5, crackX, crackY);
            g.drawLine((int)position.x + width - 5, (int)position.y + height - 5, crackX, crackY);
        }
    }

    public boolean hit(Ball ball) {
        onHit(ball);
        return destroyed;
    }

    public boolean shouldDropPowerUp() {
        return destroyed && Math.random() < dropChance;
    }

    // Accessor helpers used by controllers
    public boolean isDestroyed()    { return destroyed; }
    public boolean isIndestructible(){ return indestructible; }
    public int     getScoreValue()  { return scoreValue; }
    public Color   getColor()       { return baseColor; }
}
