package com.brickblitz.view.fx;

import java.awt.Color;
import java.awt.Graphics2D;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Random;

public class ParticleSystem {
    private List<Particle> particles;
    private final int MAX_PARTICLES = 500;
    private Random random;

    public ParticleSystem() {
        particles = new ArrayList<>();
        random = new Random();
    }

    public void emitBrickExplosion(float x, float y, Color brickColor, int count) {
        for (int i = 0; i < count; i++) {
            if (particles.size() >= MAX_PARTICLES) break;
            float vx = (random.nextFloat() * 400) - 200;
            float vy = (random.nextFloat() * 400) - 200;
            float life = 0.4f + random.nextFloat() * 0.4f;
            Color c = random.nextBoolean() ? brickColor : Color.WHITE;
            float size = 4 + random.nextFloat() * 6;
            float endSize = random.nextFloat() * 2;
            float rotSpeed = (random.nextFloat() * 10) - 5;
            particles.add(new Particle(x, y, vx, vy, life, c, size, endSize, rotSpeed));
        }
    }

    public void emitSparkShower(float x, float y, Color color, int count) {
        for (int i = 0; i < count; i++) {
            if (particles.size() >= MAX_PARTICLES) break;
            float vx = (random.nextFloat() * 100) - 50;
            float vy = -(100 + random.nextFloat() * 200);
            float life = 0.2f + random.nextFloat() * 0.3f;
            particles.add(new Particle(x, y, vx, vy, life, color, 3, 0, 0));
        }
    }

    public void emitLaserTrail(float x, float y) {
        if (particles.size() >= MAX_PARTICLES) return;
        particles.add(new Particle(x, y, 0, 0, 0.2f, Color.CYAN, 2, 0, 0));
    }

    public void emitPowerUpCollect(float x, float y, Color color) {
        int count = 12;
        for (int i = 0; i < count; i++) {
            if (particles.size() >= MAX_PARTICLES) break;
            float angle = (float) (i * Math.PI * 2 / count);
            float speed = 150 + random.nextFloat() * 50;
            float vx = (float) Math.cos(angle) * speed;
            float vy = (float) Math.sin(angle) * speed;
            particles.add(new Particle(x, y, vx, vy, 0.6f, color, 6, 0, 3));
        }
    }

    public void emitBallTrail(float x, float y, Color color) {
        if (particles.size() >= MAX_PARTICLES) return;
        particles.add(new Particle(x, y, 0, 0, 0.3f, color, 5, 0, 0));
    }

    public void update(float dt) {
        Iterator<Particle> it = particles.iterator();
        while (it.hasNext()) {
            Particle p = it.next();
            p.update(dt);
            if (!p.isAlive()) {
                it.remove();
            }
        }
    }

    public void render(Graphics2D g) {
        for (Particle p : particles) {
            p.render(g);
        }
    }
}
