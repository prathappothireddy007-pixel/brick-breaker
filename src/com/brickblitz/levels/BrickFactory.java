package com.brickblitz.levels;

import com.brickblitz.model.bricks.*;
import java.awt.Color;

public class BrickFactory {

    public static Brick createBrick(char token, int col, int row, int brickW, int brickH) {
        int margin = 50;
        int topMargin = 50;
        float x = col * (brickW + 4) + margin;
        float y = row * (brickH + 4) + topMargin;

        switch (token) {
            case 'S':
                int colorIndex = (col + row) % 7;
                StandardBrick sb = new StandardBrick(x, y, brickW, brickH, colorIndex);
                return sb;
            case 'T':
                return new ToughBrick(x, y, brickW, brickH);
            case 'I':
                return new IronBrick(x, y, brickW, brickH);
            case 'E':
                return new ExplosiveBrick(x, y, brickW, brickH);
            case 'P':
                return new SpeedBrick(x, y, brickW, brickH);
            case 'M':
                return new MysteryBrick(x, y, brickW, brickH);
            case 'V':
                return new MovingBrick(x, y, brickW, brickH);
            case 'B':
                BossBrick bb = new BossBrick(x, y, brickW * 2 + 4, brickH * 2 + 4);
                
                 // Golden color
                return bb;
            case '.':
            default:
                return null;
        }
    }
}
