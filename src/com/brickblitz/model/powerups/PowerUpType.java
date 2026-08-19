package com.brickblitz.model.powerups;

import java.awt.Color;

public enum PowerUpType {
    PADDLE_EXPAND("Expand", Color.CYAN, 15, "↔"),
    MULTI_BALL("MultiBall", Color.BLUE, 0, "⚇"),
    LASER_CANNON("Laser", Color.RED, 10, "↑"),
    FIREBALL("Fireball", new Color(255, 69, 0), 8, "🔥"),
    SHIELD_FLOOR("Shield", Color.LIGHT_GRAY, 20, "⛨"),
    TIME_SLOW("Slow", Color.MAGENTA, 12, "⏱"),
    EXTRA_LIFE("1-Up", Color.GREEN, 0, "♥"),
    SCORE_MULTIPLIER("2x Score", Color.YELLOW, 15, "2x");

    public final String label;
    public final Color color;
    public final int durationSeconds;
    public final String icon;

    PowerUpType(String label, Color color, int durationSeconds, String icon) {
        this.label = label;
        this.color = color;
        this.durationSeconds = durationSeconds;
        this.icon = icon;
    }
}
