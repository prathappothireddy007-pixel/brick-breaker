package com.brickblitz.controller;

import java.awt.Component;
import java.awt.event.*;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;

public class InputHandler implements KeyListener, MouseMotionListener, MouseListener {
    final Set<Integer> pressedKeys = Collections.synchronizedSet(new HashSet<>());
    private int mouseX;
    private int mouseY;
    private boolean leftClick;
    private boolean rightClick;
    private final Queue<MouseEvent> clickEvents = new ConcurrentLinkedQueue<>();

    public void register(Component c) {
        c.addKeyListener(this);
        c.addMouseMotionListener(this);
        c.addMouseListener(this);
    }

    public boolean isKeyPressed(int keyCode) {
        return pressedKeys.contains(keyCode);
    }

    public int getMouseX() { return mouseX; }
    public int getMouseY() { return mouseY; }

    public Queue<MouseEvent> consumeClicks() {
        Queue<MouseEvent> currentClicks = new ConcurrentLinkedQueue<>(clickEvents);
        clickEvents.clear();
        return currentClicks;
    }

    @Override
    public void keyTyped(KeyEvent e) {}

    @Override
    public void keyPressed(KeyEvent e) {
        pressedKeys.add(e.getKeyCode());
    }

    @Override
    public void keyReleased(KeyEvent e) {
        pressedKeys.remove(e.getKeyCode());
    }

    @Override
    public void mouseDragged(MouseEvent e) {
        mouseX = e.getX();
        mouseY = e.getY();
    }

    @Override
    public void mouseMoved(MouseEvent e) {
        mouseX = e.getX();
        mouseY = e.getY();
    }

    @Override
    public void mouseClicked(MouseEvent e) {
        clickEvents.add(e);
    }

    @Override
    public void mousePressed(MouseEvent e) {
        if (e.getButton() == MouseEvent.BUTTON1) leftClick = true;
        if (e.getButton() == MouseEvent.BUTTON3) rightClick = true;
    }

    @Override
    public void mouseReleased(MouseEvent e) {
        if (e.getButton() == MouseEvent.BUTTON1) leftClick = false;
        if (e.getButton() == MouseEvent.BUTTON3) rightClick = false;
    }

    @Override
    public void mouseEntered(MouseEvent e) {}

    @Override
    public void mouseExited(MouseEvent e) {}
    
    public boolean isLeftClick() { return leftClick; }
    public boolean isRightClick() { return rightClick; }
}
