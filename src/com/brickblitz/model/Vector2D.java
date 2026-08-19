package com.brickblitz.model;

public class Vector2D {
    public double x;
    public double y;

    public Vector2D() {
        this(0, 0);
    }

    public Vector2D(double x, double y) {
        this.x = x;
        this.y = y;
    }

    public void add(Vector2D other) {
        this.x += other.x;
        this.y += other.y;
    }

    public void subtract(Vector2D other) {
        this.x -= other.x;
        this.y -= other.y;
    }

    public void scale(double scalar) {
        this.x *= scalar;
        this.y *= scalar;
    }

    public double dot(Vector2D other) {
        return this.x * other.x + this.y * other.y;
    }

    public double magnitude() {
        return Math.sqrt(x * x + y * y);
    }

    public void normalize() {
        double mag = magnitude();
        if (mag > 0) {
            x /= mag;
            y /= mag;
        }
    }

    public void reflect(Vector2D normal) {
        double dotProduct = dot(normal);
        this.x = this.x - 2 * dotProduct * normal.x;
        this.y = this.y - 2 * dotProduct * normal.y;
    }

    public double distance(Vector2D other) {
        double dx = this.x - other.x;
        double dy = this.y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    public Vector2D copy() {
        return new Vector2D(this.x, this.y);
    }

    @Override
    public String toString() {
        return "Vector2D(" + x + ", " + y + ")";
    }

    public static Vector2D add(Vector2D v1, Vector2D v2) {
        return new Vector2D(v1.x + v2.x, v1.y + v2.y);
    }

    public static Vector2D subtract(Vector2D v1, Vector2D v2) {
        return new Vector2D(v1.x - v2.x, v1.y - v2.y);
    }

    public static Vector2D scale(Vector2D v, double scalar) {
        return new Vector2D(v.x * scalar, v.y * scalar);
    }

    // Accessor aliases used by PhysicsEngine / GameController
    public double getX()         { return x; }
    public double getY()         { return y; }
    public void   setX(double x) { this.x = x; }
    public void   setY(double y) { this.y = y; }
}
