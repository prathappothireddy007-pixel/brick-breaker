package com.brickblitz.model.bricks;

import com.brickblitz.model.Ball;
import java.awt.Color;
import java.awt.Graphics2D;

public class ToughBrick extends Brick {
    public ToughBrick(double x, double y, int width, int height) {
        super(x, y, width, height);
        this.maxHits = 3;
        this.currentHits = 3;
        this.scoreValue = 30;
        this.indestructible = false;
        this.baseColor = new Color(255, 140, 0); // Amber
        this.dropChance = 0.2f;
    }

    @Override
    public void update(double deltaTime) {
    }

    @Override
    public Color getCrackColor() {
        return baseColor.darker().darker();
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
        if (currentHits < maxHits) {
            g.setColor(getCrackColor());
            int numCracks = maxHits - currentHits;
            for (int i = 0; i < numCracks; i++) {
                g.drawLine((int)position.x + 10 + i * 15, (int)position.y + 5, (int)position.x + 15 + i * 15, (int)position.y + height - 5);
            }
        }
    }

    @Override public char getToken() { return 'T'; }
    public Brick copy() { return new ToughBrick(position.x, position.y, width, height); }
}
