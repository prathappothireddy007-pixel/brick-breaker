package com.brickblitz.audio;

public enum SoundEffect {
    BALL_BOUNCE("Bounce sound"),
    BRICK_BREAK("Brick break sound"),
    EXPLOSION("Explosion sound"),
    LASER_SHOT("Laser shot sound"),
    POWERUP_COLLECT("Powerup collect sound"),
    EXTRA_LIFE("Extra life sound"),
    GAME_OVER("Game over sound"),
    LEVEL_CLEAR("Level clear sound"),
    COMBO_HIT("Combo hit sound"),
    BALL_LOST("Ball lost sound");

    private final String description;

    SoundEffect(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
