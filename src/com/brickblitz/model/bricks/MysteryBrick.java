package com.brickblitz.model.bricks;

import com.brickblitz.model.Ball;
import com.brickblitz.model.powerups.PowerUpType;
import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics2D;

public class MysteryBrick extends Brick {
    public MysteryBrick(double x, double y, int width, int height) {
        super(x, y, width, height);
        this.maxHits = 1;
        this.currentHits = 1;
        this.scoreValue = 25;
        this.indestructible = false;
        this.baseColor = Color.MAGENTA;
        this.dropChance = 1.0f;
    }

    @Override
    public void update(double deltaTime) {
    }

    @Override
    public Color getCrackColor() {
        return Color.WHITE;
    }

    @Override
    public void onHit(Ball ball) {
        currentHits--;
        if (currentHits <= 0) {
            destroyed = true;
            active = false;
            PowerUpType[] types = PowerUpType.values();
            this.dropType = types[(int)(Math.random() * types.length)];
        }
    }

    @Override
    public void render(Graphics2D g) {
        float hue = (System.currentTimeMillis() % 2000) / 2000.0f;
        this.baseColor = Color.getHSBColor(hue, 0.8f, 0.8f);
        super.render(g);
        
        g.setColor(Color.WHITE);
        g.setFont(new Font("Arial", Font.BOLD, 16));
        g.drawString("?", (int)position.x + width/2 - 5, (int)position.y + height/2 + 6);
    }

    @Override public char getToken() { return 'M'; }
    public Brick copy() { return new MysteryBrick(position.x, position.y, width, height); }
}
