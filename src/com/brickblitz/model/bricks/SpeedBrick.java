package com.brickblitz.model.bricks;

import com.brickblitz.model.Ball;
import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.Graphics2D;

public class SpeedBrick extends Brick {
    private long creationTime;

    public SpeedBrick(double x, double y, int width, int height) {
        super(x, y, width, height);
        this.maxHits = 1;
        this.currentHits = 1;
        this.scoreValue = 20;
        this.indestructible = false;
        this.baseColor = new Color(0, 191, 255); // Electric Blue
        this.dropChance = 0.1f;
        this.creationTime = System.currentTimeMillis();
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
            ball.speed *= 1.25f;
            ball.capSpeed();
        }
    }

    @Override
    public void render(Graphics2D g) {
        super.render(g);
        
        long elapsed = System.currentTimeMillis() - creationTime;
        float flash = (float) (Math.sin(elapsed / 100.0) + 1.0) / 2.0f;
        
        g.setColor(new Color(255, 255, 255, (int)(150 * flash)));
        g.setStroke(new BasicStroke(2));
        g.drawRect((int)position.x, (int)position.y, width, height);
        
        // Lightning bolt
        g.setColor(Color.YELLOW);
        int[] xPoints = {(int)position.x + width/2 + 5, (int)position.x + width/2 - 2, (int)position.x + width/2, (int)position.x + width/2 - 5};
        int[] yPoints = {(int)position.y + 5, (int)position.y + height/2, (int)position.y + height/2, (int)position.y + height - 5};
        g.drawPolyline(xPoints, yPoints, 4);
    }

    @Override public char getToken() { return 'P'; }
    public Brick copy() { return new SpeedBrick(position.x, position.y, width, height); }
}
