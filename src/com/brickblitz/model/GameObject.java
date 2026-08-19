package com.brickblitz.model;

import java.awt.Graphics2D;
import java.awt.Rectangle;

public abstract class GameObject {
    public Vector2D position;
    public Vector2D velocity;
    public int width;
    public int height;
    public boolean active;

    public GameObject(double x, double y, int width, int height) {
        this.position = new Vector2D(x, y);
        this.velocity = new Vector2D(0, 0);
        this.width = width;
        this.height = height;
        this.active = true;
    }

    public abstract void update(double deltaTime);
    public abstract void render(Graphics2D g);

    public Rectangle getBounds() {
        return new Rectangle((int) position.x, (int) position.y, width, height);
    }

    public boolean intersects(GameObject other) {
        return this.getBounds().intersects(other.getBounds());
    }

    public Vector2D getCenter() {
        return new Vector2D(position.x + width / 2.0, position.y + height / 2.0);
    }

    public void setActive(boolean active) { this.active = active; }

    // Convenience accessors used across controllers/physics
    public float getX()          { return (float) position.x; }
    public float getY()          { return (float) position.y; }
    public void  setX(float x)  { position.x = x; }
    public void  setY(float y)  { position.y = y; }
    public int   getWidth()      { return width; }
    public int   getHeight()     { return height; }
    public Vector2D getVelocity(){ return velocity; }
}
