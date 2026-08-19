package com.brickblitz.audio;

import javax.sound.sampled.AudioFormat;
import javax.sound.sampled.AudioSystem;
import javax.sound.sampled.DataLine;
import javax.sound.sampled.SourceDataLine;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class SoundManager {
    private static SoundManager instance;
    private final Map<SoundEffect, byte[]> cache = new HashMap<>();
    private float masterVolume = 0.8f;
    private boolean enabled = true;
    private final ExecutorService audioExecutor = Executors.newSingleThreadExecutor();

    private SoundManager() {}

    public static SoundManager getInstance() {
        if (instance == null) {
            instance = new SoundManager();
        }
        return instance;
    }

    public void init() {
        for (SoundEffect effect : SoundEffect.values()) {
            cache.put(effect, ProceduralSynth.generate(effect));
        }
    }

    public void play(SoundEffect effect) {
        if (!enabled) return;
        
        byte[] audioData = cache.get(effect);
        if (audioData == null) return;
        
        audioExecutor.submit(() -> {
            try {
                AudioFormat format = ProceduralSynth.FORMAT;
                DataLine.Info info = new DataLine.Info(SourceDataLine.class, format);
                
                try (SourceDataLine line = (SourceDataLine) AudioSystem.getLine(info)) {
                    line.open(format);
                    line.start();
                    
                    // Apply volume
                    byte[] outData = new byte[audioData.length];
                    for (int i = 0; i < audioData.length; i += 2) {
                        short sample = (short) ((audioData[i] & 0xFF) | (audioData[i+1] << 8));
                        sample = (short) (sample * masterVolume);
                        outData[i] = (byte) (sample & 0xFF);
                        outData[i+1] = (byte) ((sample >> 8) & 0xFF);
                    }
                    
                    line.write(outData, 0, outData.length);
                    line.drain();
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
    }

    public void setVolume(float v) {
        this.masterVolume = Math.max(0.0f, Math.min(1.0f, v));
    }

    public void setEnabled(boolean e) {
        this.enabled = e;
    }
}
