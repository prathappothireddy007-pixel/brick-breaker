package com.brickblitz.model.bricks;

import com.brickblitz.model.Ball;
import java.awt.Color;
import java.awt.Graphics2D;

public class ExplosiveBrick extends Brick {
    public boolean exploded = false;
    private long creationTime;

    public ExplosiveBrick(double x, double y, int width, int height) {
        super(x, y, width, height);
        this.maxHits = 1;
        this.currentHits = 1;
        this.scoreValue = 50;
        this.indestructible = false;
        this.baseColor = Color.RED;
        this.dropChance = 0.05f;
        this.creationTime = System.currentTimeMillis();
    }

    @Override
    public void update(double deltaTime) {
    }

    @Override
    public Color getCrackColor() {
        return new Color(255, 100, 0); // Bright orange
    }

    @Override
    public void onHit(Ball ball) {
        currentHits--;
        if (currentHits <= 0) {
            exploded = true;
            destroyed = true;
            active = false;
        }
    }

    @Override
    public void render(Graphics2D g) {
        super.render(g);
        
        long elapsed = System.currentTimeMillis() - creationTime;
        float pulse = (float) (Math.sin(elapsed / 150.0) + 1.0) / 2.0f;
        
        g.setColor(new Color(255, (int)(100 * pulse), 0, 150));
        g.fillRect((int)position.x, (int)position.y, width, height);
        
        // Hazard stripes
        g.setColor(Color.BLACK);
        for (int i = 0; i < width; i += 15) {
            g.drawLine((int)position.x + i, (int)position.y, (int)position.x + i - 10, (int)position.y + height);
        }
    }

    @Override public char getToken() { return 'E'; }
    public Brick copy() { return new ExplosiveBrick(position.x, position.y, width, height); }
}
