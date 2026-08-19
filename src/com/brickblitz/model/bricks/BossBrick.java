package com.brickblitz.model.bricks;

import com.brickblitz.model.Ball;
import java.awt.Color;
import java.awt.Graphics2D;

public class BossBrick extends Brick {
    private long creationTime;

    public BossBrick(double x, double y, int width, int height) {
        super(x, y, width, height);
        this.maxHits = 10;
        this.currentHits = 10;
        this.scoreValue = 500;
        this.indestructible = false;
        this.baseColor = new Color(255, 215, 0); // Golden color
        this.dropChance = 1.0f;
        this.creationTime = System.currentTimeMillis();
    }

    @Override
    public void update(double deltaTime) {
    }

    @Override
    public Color getCrackColor() {
        return Color.RED;
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
        super.render(g);
        
        long elapsed = System.currentTimeMillis() - creationTime;
        float pulse = (float) (Math.sin(elapsed / 200.0) + 1.0) / 2.0f;
        
        g.setColor(new Color(255, 215, 0, (int)(150 * pulse)));
        g.fillRect((int)position.x, (int)position.y, width, height);
        
        // Render cracks based on damage
        if (currentHits < maxHits) {
            g.setColor(getCrackColor());
            int numCracks = maxHits - currentHits;
            for (int i = 0; i < numCracks; i++) {
                g.drawLine((int)position.x + 5 + (i * 3) % width, (int)position.y, (int)position.x + 5 + (i * 7) % width, (int)position.y + height);
            }
        }
    }

    @Override public char getToken() { return 'B'; }
    public Brick copy() { return new BossBrick(position.x, position.y, width, height); }
}
