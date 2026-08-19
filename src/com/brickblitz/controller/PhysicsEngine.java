package com.brickblitz.controller;

import com.brickblitz.model.Ball;
import com.brickblitz.model.Laser;
import com.brickblitz.model.Paddle;
import com.brickblitz.model.Vector2D;
import com.brickblitz.model.bricks.Brick;

import java.util.List;

public class PhysicsEngine {

    public static void resolveCollisions(Ball ball, Paddle paddle, List<Brick> bricks, List<Laser> lasers, GameController ctrl) {
        // 1. Ball vs walls
        if (ball.getX() - ball.getRadius() < 0) {
            ball.setX(ball.getRadius());
            ball.getVelocity().setX(Math.abs(ball.getVelocity().getX()));
            if (ctrl.getScreenShake() != null) ctrl.getScreenShake().addTrauma(0.2f);
        } else if (ball.getX() + ball.getRadius() > 900) { // Screen width 900
            ball.setX(900 - ball.getRadius());
            ball.getVelocity().setX(-Math.abs(ball.getVelocity().getX()));
            if (ctrl.getScreenShake() != null) ctrl.getScreenShake().addTrauma(0.2f);
        }

        // 2. Ball vs ceiling
        if (ball.getY() - ball.getRadius() < 0) {
            ball.setY(ball.getRadius());
            ball.getVelocity().setY(Math.abs(ball.getVelocity().getY()));
        }

        // 3. Ball vs paddle
        if (ball.getVelocity().getY() > 0 && circleIntersectsRect(ball.getX(), ball.getY(), ball.getRadius(), paddle.getX(), paddle.getY(), paddle.getWidth(), paddle.getHeight())) {
            paddle.deflectBall(ball);
            if (ctrl.getSoundManager() != null) {
                ctrl.getSoundManager().play(com.brickblitz.audio.SoundEffect.BALL_BOUNCE);
            }
        }

        // 4. Ball vs each brick
        for (int i = 0; i < bricks.size(); i++) {
            Brick brick = bricks.get(i);
            if (!brick.isDestroyed() && circleIntersectsRect(ball.getX(), ball.getY(), ball.getRadius(), brick.getX(), brick.getY(), brick.getWidth(), brick.getHeight())) {
                Vector2D normal = getCollisionNormal(ball, brick);
                
                // Resolve overlap
                ball.setX((float)(ball.getX() + normal.getX() * 2));
                ball.setY((float)(ball.getY() + normal.getY() * 2));
                
                // Reflect velocity
                double dot = ball.getVelocity().getX() * normal.getX() + ball.getVelocity().getY() * normal.getY();
                ball.getVelocity().setX((float)(ball.getVelocity().getX() - 2 * dot * normal.getX()));
                ball.getVelocity().setY((float)(ball.getVelocity().getY() - 2 * dot * normal.getY()));
                
                brick.hit(ball);
                if (brick.isDestroyed()) {
                    ctrl.onBrickDestroyed(brick, ball);
                }
                break; // Only hit one brick per frame for simplicity
            }
        }

        // 5. Laser vs each brick
        if (lasers != null) {
            for (int i = lasers.size() - 1; i >= 0; i--) {
                Laser laser = lasers.get(i);
                for (int j = 0; j < bricks.size(); j++) {
                    Brick brick = bricks.get(j);
                    if (!brick.isDestroyed() && laser.getX() >= brick.getX() && laser.getX() <= brick.getX() + brick.getWidth() &&
                        laser.getY() >= brick.getY() && laser.getY() <= brick.getY() + brick.getHeight()) {
                        
                        laser.setActive(false);
                        brick.hit(null);
                        if (brick.isDestroyed()) {
                            ctrl.onBrickDestroyed(brick, null);
                        }
                        break;
                    }
                }
            }
        }
    }

    private static Vector2D getCollisionNormal(Ball ball, Brick brick) {
        float testX = ball.getX();
        float testY = ball.getY();

        if (ball.getX() < brick.getX()) testX = brick.getX();
        else if (ball.getX() > brick.getX() + brick.getWidth()) testX = brick.getX() + brick.getWidth();

        if (ball.getY() < brick.getY()) testY = brick.getY();
        else if (ball.getY() > brick.getY() + brick.getHeight()) testY = brick.getY() + brick.getHeight();

        float distX = ball.getX() - testX;
        float distY = ball.getY() - testY;
        float distance = (float)Math.sqrt((distX*distX) + (distY*distY));
        
        if (distance == 0) return new Vector2D(0, -1);
        return new Vector2D(distX / distance, distY / distance);
    }

    public static void checkBallLost(Ball ball, int screenHeight, GameController ctrl) {
        if (ball.getY() - ball.getRadius() > screenHeight) {
            ctrl.onBallLost(ball);
        }
    }

    public static boolean circleIntersectsRect(float cx, float cy, float r, float rx, float ry, float rw, float rh) {
        float testX = cx;
        float testY = cy;

        if (cx < rx) testX = rx;
        else if (cx > rx + rw) testX = rx + rw;

        if (cy < ry) testY = ry;
        else if (cy > ry + rh) testY = ry + rh;

        float distX = cx - testX;
        float distY = cy - testY;
        float distance = (float)Math.sqrt((distX*distX) + (distY*distY));

        return distance <= r;
    }
}
