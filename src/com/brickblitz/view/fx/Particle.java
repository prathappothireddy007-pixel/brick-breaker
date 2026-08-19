package com.brickblitz.view.fx;

import java.awt.AlphaComposite;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.geom.AffineTransform;

public class Particle {
    private float x, y, vx, vy;
    private float life, maxLife;
    private Color color;
    private float size, endSize;
    private float rotation, rotSpeed;
    private boolean alive;

    public Particle(float x, float y, float vx, float vy, float life, Color color, float size, float endSize, float rotSpeed) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.life = life;
        this.maxLife = life;
        this.color = color;
        this.size = size;
        this.endSize = endSize;
        this.rotSpeed = rotSpeed;
        this.rotation = (float) (Math.random() * Math.PI * 2);
        this.alive = true;
    }

    public void update(float dt) {
        if (!alive) return;
        x += vx * dt;
        y += vy * dt;
        rotation += rotSpeed * dt;
        life -= dt;
        if (life <= 0) {
            alive = false;
        }
    }

    public float getAlpha() {
        return Math.max(0, Math.min(1, life / maxLife));
    }

    public float getCurrentSize() {
        float t = 1 - getAlpha();
        return size + (endSize - size) * t;
    }

    public boolean isAlive() {
        return alive;
    }

    public void render(Graphics2D g) {
        if (!alive) return;
        float currentSize = getCurrentSize();
        float alpha = getAlpha();
        if (alpha <= 0 || currentSize <= 0) return;

        AffineTransform old = g.getTransform();
        g.translate(x, y);
        g.rotate(rotation);
        
        g.setComposite(AlphaComposite.getInstance(AlphaComposite.SRC_OVER, alpha));
        g.setColor(color);
        g.fillRect((int)(-currentSize / 2), (int)(-currentSize / 2), (int)currentSize, (int)currentSize);
        
        g.setTransform(old);
        g.setComposite(AlphaComposite.getInstance(AlphaComposite.SRC_OVER, 1f));
    }
}
