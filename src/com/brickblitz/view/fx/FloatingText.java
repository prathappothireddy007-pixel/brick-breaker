package com.brickblitz.view.fx;

import java.awt.AlphaComposite;
import java.awt.Color;
import java.awt.Font;
import java.awt.FontMetrics;
import java.awt.Graphics2D;
import java.awt.geom.AffineTransform;

public class FloatingText {
    private String text;
    private float x, y;
    private float life, maxLife;
    private Color color;
    private float scale;
    private float vy = -60;
    private boolean alive;

    private FloatingText(String text, float x, float y, Color color, float life) {
        this.text = text;
        this.x = x;
        this.y = y;
        this.color = color;
        this.life = life;
        this.maxLife = life;
        this.scale = 1.5f;
        this.alive = true;
    }

    public static FloatingText forScore(int pts, float x, float y) {
        return new FloatingText("+" + pts, x, y, Color.WHITE, 1.0f);
    }

    public static FloatingText forCombo(int combo, float x, float y) {
        return new FloatingText(combo + "x COMBO!", x, y, new Color(255, 215, 0), 1.5f);
    }

    public static FloatingText forMessage(String msg, float x, float y, Color c) {
        return new FloatingText(msg, x, y, c, 1.5f);
    }

    public void update(float dt) {
        if (!alive) return;
        y += vy * dt;
        life -= dt;
        scale = 1.0f + 0.5f * (life / maxLife);
        if (life <= 0) {
            alive = false;
        }
    }

    public boolean isAlive() {
        return alive;
    }

    public void render(Graphics2D g) {
        if (!alive) return;
        float alpha = Math.max(0, Math.min(1, life / maxLife));
        
        AffineTransform old = g.getTransform();
        g.translate(x, y);
        g.scale(scale, scale);
        
        g.setComposite(AlphaComposite.getInstance(AlphaComposite.SRC_OVER, alpha));
        
        Font font = new Font("Arial", Font.BOLD, 18);
        g.setFont(font);
        FontMetrics fm = g.getFontMetrics();
        int textX = -fm.stringWidth(text) / 2;
        int textY = fm.getAscent() / 2;
        
        // Glow/shadow
        g.setColor(new Color(0, 0, 0, 150));
        g.drawString(text, textX + 2, textY + 2);
        g.drawString(text, textX - 2, textY - 2);
        
        g.setColor(color);
        g.drawString(text, textX, textY);
        
        g.setTransform(old);
        g.setComposite(AlphaComposite.getInstance(AlphaComposite.SRC_OVER, 1f));
    }
}
