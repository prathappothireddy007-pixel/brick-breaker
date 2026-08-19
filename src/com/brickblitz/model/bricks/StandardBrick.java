package com.brickblitz.model.bricks;

import com.brickblitz.model.Ball;
import java.awt.Color;

public class StandardBrick extends Brick {
    private static final Color[] COLORS = {
        Color.RED, Color.ORANGE, Color.YELLOW, Color.GREEN, Color.BLUE, Color.CYAN, Color.MAGENTA
    };

    public StandardBrick(double x, double y, int width, int height, int colorIndex) {
        super(x, y, width, height);
        this.maxHits = 1;
        this.currentHits = 1;
        this.scoreValue = 10;
        this.indestructible = false;
        this.baseColor = COLORS[Math.max(0, Math.min(colorIndex, COLORS.length - 1))];
        this.dropChance = 0.1f;
    }

    @Override
    public void update(double deltaTime) {
    }

    @Override
    public Color getCrackColor() {
        return baseColor.darker();
    }

    @Override
    public void onHit(Ball ball) {
        currentHits--;
        if (currentHits <= 0) {
            destroyed = true;
            active = false;
        }
    }

    @Override public char getToken() { return 'S'; }
    public Brick copy() { 
        StandardBrick b = new StandardBrick(position.x, position.y, width, height, 0);
        b.baseColor = this.baseColor;
        return b;
    }
}
