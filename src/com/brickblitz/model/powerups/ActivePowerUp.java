package com.brickblitz.model.powerups;

public class ActivePowerUp {
    public PowerUpType type;
    public float remainingSeconds;
    public float totalSeconds;

    public ActivePowerUp(PowerUpType type) {
        this.type = type;
        this.totalSeconds = type.durationSeconds;
        this.remainingSeconds = type.durationSeconds;
    }

    public ActivePowerUp(PowerUpType type, float duration) {
        this.type = type;
        this.totalSeconds = duration;
        this.remainingSeconds = duration;
    }

    public PowerUpType getType() { return type; }
    
    public void removeEffect(Object controller) {
        // Effect removal handled by GameController checking expiry
        // Specific cleanup can be done in GameController.onPowerUpExpired()
    }

    public boolean isExpired() {
        return remainingSeconds <= 0;
    }

    public float getProgress() {
        if (totalSeconds == 0) return 0;
        return remainingSeconds / totalSeconds;
    }

    public void update(double deltaTime) {
        remainingSeconds -= deltaTime;
    }

    @Override
    public String toString() {
        return type.label + " (" + String.format("%.1f", remainingSeconds) + "s)";
    }
}
