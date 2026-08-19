package com.brickblitz;

import javax.swing.SwingUtilities;
import com.brickblitz.view.BrickBlitzFrame;

public class BrickBlitzApp {
    public static void main(String[] args) {
        System.setProperty("sun.java2d.opengl", "true");
        SwingUtilities.invokeLater(() -> {
            new BrickBlitzFrame().init();
        });
    }
}
