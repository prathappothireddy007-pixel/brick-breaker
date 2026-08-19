package com.brickblitz.view.fx;

import java.awt.Color;
import java.awt.GradientPaint;
import java.awt.Graphics2D;
import java.util.Random;

public class BackgroundRenderer {
    private String theme = "NEON_CYAN";
    private float animTime = 0;
    private Star[] stars;
    private Random random;

    private static class Star {
        float x, y, speed, brightness;
    }

    public BackgroundRenderer() {
        random = new Random();
        stars = new Star[200];
        for (int i = 0; i < stars.length; i++) {
            stars[i] = new Star();
            stars[i].x = random.nextFloat() * 900;
            stars[i].y = random.nextFloat() * 700;
            stars[i].speed = 10 + random.nextFloat() * 40;
            stars[i].brightness = 0.2f + random.nextFloat() * 0.8f;
        }
    }

    public void update(float dt) {
        animTime += dt;
        for (Star s : stars) {
            s.y += s.speed * dt;
            if (s.y > 700) {
                s.y = 0;
                s.x = random.nextFloat() * 900;
            }
        }
    }

    public Color getThemeColor() {
        switch (theme) {
            case "SYNTHWAVE_SUNSET": return new Color(255, 0, 128);
            case "CYBERPUNK_EMERALD": return new Color(0, 255, 128);
            default: return new Color(0, 255, 255); // NEON_CYAN
        }
    }

    public void setTheme(String theme) {
        this.theme = theme;
    }

    public void render(Graphics2D g, int width, int height) {
        // Space gradient
        Color topColor = new Color(10, 0, 30);
        Color bottomColor = new Color(0, 0, 10);
        GradientPaint gp = new GradientPaint(0, 0, topColor, 0, height, bottomColor);
        g.setPaint(gp);
        g.fillRect(0, 0, width, height);

        // Stars
        for (Star s : stars) {
            float twinkle = (float) (Math.sin(animTime * 5 + s.x) * 0.5 + 0.5);
            g.setColor(new Color(1f, 1f, 1f, s.brightness * twinkle));
            g.fillRect((int)s.x, (int)s.y, 2, 2);
        }

        // Aurora
        Color tc = getThemeColor();
        g.setColor(new Color(tc.getRed(), tc.getGreen(), tc.getBlue(), 30));
        for (int i = 0; i < 5; i++) {
            int yPos = height / 2 + (int)(Math.sin(animTime + i) * 50);
            g.fillOval(0, yPos - 50, width, 100);
        }

        // Grid
        g.setColor(new Color(tc.getRed(), tc.getGreen(), tc.getBlue(), 50));
        int centerX = width / 2;
        int topY = height / 3;
        for (int i = -10; i <= 10; i++) {
            int bx = centerX + i * 100;
            g.drawLine(centerX, topY, bx, height);
        }
        for (int i = 0; i < 10; i++) {
            int y = topY + (int)Math.pow(i, 2.5);
            if (y < height) {
                g.drawLine(0, y, width, y);
            }
        }
    }
}
