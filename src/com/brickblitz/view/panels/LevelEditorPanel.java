package com.brickblitz.view.panels;

import javax.swing.JPanel;
import java.awt.*;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.awt.event.MouseMotionAdapter;
import com.brickblitz.view.ScreenManager;
import com.brickblitz.view.ui.ModernButton;
import com.brickblitz.view.ui.ThemeManager;

public class LevelEditorPanel extends JPanel {
    private char[][] editorGrid;
    private char selectedToken = 'S';
    private final int COLS = 15;
    private final int ROWS = 12;
    private final int CELL_SIZE = 40;

    public LevelEditorPanel(ScreenManager screenManager) {
        setLayout(null);
        setBackground(new Color(15, 15, 25));
        editorGrid = new char[ROWS][COLS];
        for(int r=0; r<ROWS; r++) {
            for(int c=0; c<COLS; c++) {
                editorGrid[r][c] = '.';
            }
        }

        Color base = ThemeManager.getInstance().getTheme().primary;

        ModernButton btnBack = new ModernButton("BACK", base, base);
        btnBack.setBounds(10, 10, 100, 40);
        btnBack.addActionListener(e -> screenManager.showScreen(ScreenManager.MAIN_MENU));
        add(btnBack);

        // Simple palette selection
        String[] types = {"S", "T", "I", "E", "P", "M", "V", "."};
        for(int i=0; i<types.length; i++) {
            String t = types[i];
            ModernButton b = new ModernButton(t, base, base);
            b.setBounds(10, 100 + i*50, 60, 40);
            b.addActionListener(e -> selectedToken = t.charAt(0));
            add(b);
        }

        JPanel canvas = new JPanel() {
            @Override
            protected void paintComponent(Graphics g) {
                super.paintComponent(g);
                for(int r=0; r<ROWS; r++) {
                    for(int c=0; c<COLS; c++) {
                        int x = c * CELL_SIZE;
                        int y = r * CELL_SIZE;
                        g.setColor(Color.DARK_GRAY);
                        g.drawRect(x, y, CELL_SIZE, CELL_SIZE);
                        if(editorGrid[r][c] != '.') {
                            g.setColor(getColorForToken(editorGrid[r][c]));
                            g.fillRect(x+1, y+1, CELL_SIZE-2, CELL_SIZE-2);
                        }
                    }
                }
            }
        };
        canvas.setBounds(100, 100, COLS * CELL_SIZE, ROWS * CELL_SIZE);
        
        MouseAdapter ma = new MouseAdapter() {
            private void handle(MouseEvent e) {
                int c = e.getX() / CELL_SIZE;
                int r = e.getY() / CELL_SIZE;
                if(r>=0 && r<ROWS && c>=0 && c<COLS) {
                    editorGrid[r][c] = selectedToken;
                    canvas.repaint();
                }
            }
            @Override
            public void mousePressed(MouseEvent e) { handle(e); }
            @Override
            public void mouseDragged(MouseEvent e) { handle(e); }
        };
        canvas.addMouseListener(ma);
        canvas.addMouseMotionListener(ma);
        add(canvas);
    }

    private Color getColorForToken(char t) {
        switch(t) {
            case 'S': return Color.BLUE;
            case 'T': return Color.GREEN;
            case 'I': return Color.GRAY;
            case 'E': return Color.RED; // explosive
            default: return Color.WHITE;
        }
    }
}
