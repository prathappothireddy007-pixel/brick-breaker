package com.brickblitz.model;

import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.RenderingHints;

public class Laser extends GameObject {
    public Color color = new Color(0, 255, 255);
    public float speed = 600f;

    public Laser(double x, double y) {
        super(x, y, 4, 16);
    }

    public boolean isActive() { return active; }
    public void setActive(boolean b) { this.active = b; }

    @Override
    public void update(double deltaTime) {
        position.y -= speed * deltaTime;
        if (position.y < -height) {
            active = false;
        }
    }

    @Override
    public void render(Graphics2D g) {
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g.setColor(new Color(color.getRed(), color.getGreen(), color.getBlue(), 100));
        g.fillRoundRect((int)position.x - 2, (int)position.y - 2, width + 4, height + 4, 4, 4);
        
        g.setColor(Color.WHITE);
        g.fillRoundRect((int)position.x, (int)position.y, width, height, 4, 4);
    }
}
