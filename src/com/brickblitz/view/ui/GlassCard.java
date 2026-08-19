package com.brickblitz.view.ui;

import javax.swing.JPanel;
import java.awt.AlphaComposite;
import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.RenderingHints;

public class GlassCard extends JPanel {
    private float alpha = 0.15f;
    private Color borderColor;
    private int cornerRadius = 16;

    public GlassCard(Color borderColor) {
        this.borderColor = borderColor;
        setOpaque(false);
    }

    public void setBorderColor(Color color) {
        this.borderColor = color;
        repaint();
    }

    public void setAlpha(float alpha) {
        this.alpha = alpha;
        repaint();
    }

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        Graphics2D g2 = (Graphics2D) g.create();
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        int w = getWidth() - 1;
        int h = getHeight() - 1;

        g2.setComposite(AlphaComposite.getInstance(AlphaComposite.SRC_OVER, alpha));
        g2.setColor(Color.BLACK);
        g2.fillRoundRect(0, 0, w, h, cornerRadius, cornerRadius);

        g2.setComposite(AlphaComposite.getInstance(AlphaComposite.SRC_OVER, 1f));
        g2.setColor(borderColor);
        g2.setStroke(new BasicStroke(2));
        g2.drawRoundRect(0, 0, w, h, cornerRadius, cornerRadius);

        g2.dispose();
    }
}
