package com.brickblitz.model.powerups;

import com.brickblitz.model.GameObject;
import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics2D;
import java.awt.RenderingHints;

public class PowerUp extends GameObject {
    public PowerUpType type;
    public float fallSpeed = 120f;
    public float bobOffset = 0f;
    public float bobTime = 0f;
    public boolean collected = false;

    public PowerUp(double x, double y, PowerUpType type) {
        super(x, y, 30, 15);
        this.type = type;
    }

    @Override
    public void update(double deltaTime) {
        position.y += fallSpeed * deltaTime;
        bobTime += deltaTime * 5;
        bobOffset = (float)Math.sin(bobTime) * 5;
        
        if (position.y > 800) { // Assuming screen height is roughly 700-800
            active = false;
        }
    }

    @Override
    public void render(Graphics2D g) {
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        
        int renderY = (int)(position.y + bobOffset);
        
        // Glow ring
        g.setColor(new Color(type.color.getRed(), type.color.getGreen(), type.color.getBlue(), 100));
        g.fillRoundRect((int)position.x - 4, renderY - 4, width + 8, height + 8, 15, 15);
        
        // Pill body
        g.setColor(type.color);
        g.fillRoundRect((int)position.x, renderY, width, height, 15, 15);
        
        // Icon/Text
        g.setColor(Color.WHITE);
        g.setFont(new Font("SansSerif", Font.BOLD, 10));
        g.drawString(type.icon, (int)position.x + 5, renderY + 11);
    }

    public void collect() {
        collected = true;
        active = false;
    }
}
