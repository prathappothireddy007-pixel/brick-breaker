package com.brickblitz.view.ui;

import javax.swing.JComponent;
import javax.swing.Timer;
import java.awt.*;
import java.awt.event.*;
import java.util.ArrayList;
import java.util.List;

public class ModernButton extends JComponent {
    private String text;
    private Color baseColor;
    private Color glowColor;
    private boolean hovered = false;
    private boolean pressed = false;
    private float glowAlpha = 0f;
    private Timer animTimer;
    private List<ActionListener> listeners = new ArrayList<>();

    public ModernButton(String text, Color baseColor, Color glowColor) {
        this.text = text;
        this.baseColor = baseColor;
        this.glowColor = glowColor;
        setPreferredSize(new Dimension(220, 50));
        setCursor(new Cursor(Cursor.HAND_CURSOR));

        animTimer = new Timer(16, e -> {
            float targetAlpha = hovered ? 0.8f : 0f;
            glowAlpha += (targetAlpha - glowAlpha) * 0.2f;
            repaint();
        });
        animTimer.start();

        addMouseListener(new MouseAdapter() {
            @Override
            public void mouseEntered(MouseEvent e) {
                hovered = true;
            }
            @Override
            public void mouseExited(MouseEvent e) {
                hovered = false;
                pressed = false;
            }
            @Override
            public void mousePressed(MouseEvent e) {
                pressed = true;
                repaint();
            }
            @Override
            public void mouseReleased(MouseEvent e) {
                if (pressed && hovered) {
                    for (ActionListener l : listeners) {
                        l.actionPerformed(new ActionEvent(ModernButton.this, ActionEvent.ACTION_PERFORMED, text));
                    }
                }
                pressed = false;
                repaint();
            }
        });
    }

    public void addActionListener(ActionListener l) {
        listeners.add(l);
    }

    @Override
    protected void paintComponent(Graphics g) {
        Graphics2D g2 = (Graphics2D) g.create();
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        int w = getWidth();
        int h = getHeight();

        if (glowAlpha > 0.01f) {
            g2.setComposite(AlphaComposite.getInstance(AlphaComposite.SRC_OVER, glowAlpha * 0.5f));
            g2.setColor(glowColor);
            g2.fillRoundRect(5, 5, w - 10, h - 10, 20, 20);
        }

        g2.setComposite(AlphaComposite.getInstance(AlphaComposite.SRC_OVER, 1f));
        int offset = pressed ? 2 : 0;
        
        GradientPaint gp = new GradientPaint(0, 0, new Color(30, 30, 40), 0, h, new Color(10, 10, 20));
        if (hovered) {
            gp = new GradientPaint(0, 0, new Color(50, 50, 60), 0, h, new Color(20, 20, 30));
        }
        g2.setPaint(gp);
        g2.fillRoundRect(10, 10 + offset, w - 20, h - 20, 15, 15);

        g2.setColor(baseColor);
        g2.setStroke(new BasicStroke(2));
        g2.drawRoundRect(10, 10 + offset, w - 20, h - 20, 15, 15);

        g2.setColor(Color.WHITE);
        g2.setFont(new Font("Arial", Font.BOLD, 16));
        FontMetrics fm = g2.getFontMetrics();
        int tx = (w - fm.stringWidth(text)) / 2;
        int ty = (h - fm.getHeight()) / 2 + fm.getAscent() + offset;
        g2.drawString(text, tx, ty);

        g2.dispose();
    }
}
