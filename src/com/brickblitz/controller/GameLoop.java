package com.brickblitz.controller;

public class GameLoop implements Runnable {
    private int targetFPS = 60;
    private Thread gameThread;
    private boolean running;
    private GameController controller;
    private int actualFPS;

    public GameLoop(GameController controller) {
        this.controller = controller;
    }

    public void start() {
        if (!running) {
            running = true;
            gameThread = new Thread(this, "GameLoopThread");
            gameThread.start();
        }
    }

    public void stop() {
        running = false;
        if (gameThread != null) {
            try {
                gameThread.join();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }

    @Override
    public void run() {
        long lastTime = System.nanoTime();
        double timePerFrame = 1000000000.0 / targetFPS;
        double delta = 0;
        long timer = System.currentTimeMillis();
        int frames = 0;

        while (running) {
            long now = System.nanoTime();
            delta += (now - lastTime) / timePerFrame;
            double deltaTime = (now - lastTime) / 1000000000.0;
            lastTime = now;

            if (delta >= 1) {
                controller.update(deltaTime);
                controller.render();
                frames++;
                delta--;
            }

            long sleepTime = (long)(timePerFrame - (System.nanoTime() - now)) / 1000000;
            if (sleepTime > 0) {
                try {
                    Thread.sleep(sleepTime);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }

            if (System.currentTimeMillis() - timer >= 1000) {
                timer += 1000;
                actualFPS = frames;
                frames = 0;
            }
        }
    }

    public int getActualFPS() {
        return actualFPS;
    }
}
