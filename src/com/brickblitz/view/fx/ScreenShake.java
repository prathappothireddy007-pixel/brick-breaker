package com.brickblitz.view.fx;

import java.awt.Graphics2D;
import java.util.Random;

public class ScreenShake {
    private float trauma = 0f;
    private float decayRate = 2.5f;
    private float maxOffset = 12f;
    private float offsetX = 0f, offsetY = 0f;
    private Random random;

    public ScreenShake() {
        random = new Random();
    }

    public void addTrauma(float amount) {
        trauma = Math.min(1.0f, trauma + amount);
    }

    public void update(float dt) {
        if (trauma > 0) {
            trauma -= decayRate * dt;
            if (trauma < 0) trauma = 0;
            
            float shake = trauma * trauma;
            offsetX = maxOffset * shake * ((random.nextFloat() * 2) - 1);
            offsetY = maxOffset * shake * ((random.nextFloat() * 2) - 1);
        } else {
            offsetX = 0;
            offsetY = 0;
        }
    }

    public void applyTransform(Graphics2D g) {
        if (isShaking()) {
            g.translate(offsetX, offsetY);
        }
    }

    public void resetTransform(Graphics2D g) {
        if (isShaking()) {
            g.translate(-offsetX, -offsetY);
        }
    }

    public boolean isShaking() {
        return trauma > 0;
    }
}
