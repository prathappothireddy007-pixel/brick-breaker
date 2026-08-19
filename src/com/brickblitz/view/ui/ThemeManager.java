package com.brickblitz.view.ui;

import java.awt.Color;

public class ThemeManager {
    private static ThemeManager instance;
    private Theme currentTheme;

    public static class Theme {
        public Color primary;
        public Color accent;
        public Color background;
        public Color surface;
        public Color text;
        public Color danger;
        public Color success;
        public Color neonGlow;

        public Theme(Color primary, Color accent, Color background, Color surface, Color text, Color danger, Color success, Color neonGlow) {
            this.primary = primary;
            this.accent = accent;
            this.background = background;
            this.surface = surface;
            this.text = text;
            this.danger = danger;
            this.success = success;
            this.neonGlow = neonGlow;
        }
    }

    private ThemeManager() {
        setTheme("NEON_CYAN");
    }

    public static ThemeManager getInstance() {
        if (instance == null) {
            instance = new ThemeManager();
        }
        return instance;
    }

    public Theme getTheme() {
        return currentTheme;
    }

    public void setTheme(String name) {
        if (name == null) return;
        switch (name) {
            case "SYNTHWAVE_SUNSET":
                currentTheme = new Theme(
                    new Color(255, 0, 128), new Color(255, 128, 0),
                    new Color(15, 0, 30), new Color(30, 0, 45),
                    Color.WHITE, new Color(255, 50, 50),
                    new Color(50, 255, 50), new Color(255, 0, 128, 100)
                );
                break;
            case "CYBERPUNK_EMERALD":
                currentTheme = new Theme(
                    new Color(0, 255, 128), new Color(0, 128, 255),
                    new Color(0, 20, 10), new Color(0, 40, 20),
                    Color.WHITE, new Color(255, 0, 80),
                    new Color(0, 255, 128), new Color(0, 255, 128, 100)
                );
                break;
            case "NEON_CYAN":
            default:
                currentTheme = new Theme(
                    new Color(0, 255, 255), new Color(255, 0, 255),
                    new Color(10, 10, 20), new Color(20, 20, 40),
                    Color.WHITE, new Color(255, 50, 50),
                    new Color(50, 255, 150), new Color(0, 255, 255, 100)
                );
                break;
        }
    }
}
