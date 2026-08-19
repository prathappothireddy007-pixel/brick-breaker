package com.brickblitz.audio;

import javax.sound.sampled.AudioFormat;
import java.util.Random;

public class ProceduralSynth {

    public static final int SAMPLE_RATE = 44100;
    public static final AudioFormat FORMAT = new AudioFormat(44100, 16, 1, true, false);
    private static final Random random = new Random();

    public static byte[] generate(SoundEffect effect) {
        switch (effect) {
            case BALL_BOUNCE:
                return sineChirp(300, 500, 0.06f, 0.6f);
            case BRICK_BREAK:
                return whiteNoiseBurst(0.05f, 0.8f, 0.002f, 0.04f);
            case EXPLOSION:
                return mixBuffers(sineChirp(80, 20, 0.3f, 0.9f), whiteNoiseBurst(0.3f, 0.5f, 0.01f, 0.25f));
            case LASER_SHOT:
                return squareWave(400, 100, 0.12f, 0.5f);
            case POWERUP_COLLECT:
                return arpeggio(new float[]{261.63f, 329.63f, 392f, 523.25f}, 0.07f, 0.7f);
            case EXTRA_LIFE:
                return arpeggio(new float[]{523.25f, 659.25f, 783.99f, 1046.5f}, 0.1f, 0.8f);
            case GAME_OVER:
                return arpeggio(new float[]{440f, 392f, 349.23f, 293.66f}, 0.15f, 0.8f);
            case LEVEL_CLEAR:
                return arpeggio(new float[]{523.25f, 659.25f, 783.99f, 1046.5f, 783.99f, 1046.5f}, 0.1f, 0.8f);
            case COMBO_HIT:
                return sineChirp(600, 800, 0.04f, 0.5f);
            case BALL_LOST:
                return arpeggio(new float[]{440f, 415.3f, 392f}, 0.12f, 0.7f);
            default:
                return new byte[0];
        }
    }

    private static byte[] sineChirp(float startHz, float endHz, float durationSec, float amplitude) {
        int length = (int)(durationSec * SAMPLE_RATE);
        byte[] buffer = new byte[length * 2];
        for (int i = 0; i < length; i++) {
            float t = (float) i / SAMPLE_RATE;
            float freq = startHz + (endHz - startHz) * (t / durationSec);
            double value = amplitude * Math.sin(2.0 * Math.PI * freq * t);
            short sample = toShort(value);
            buffer[2 * i] = (byte)(sample & 0xFF);
            buffer[2 * i + 1] = (byte)((sample >> 8) & 0xFF);
        }
        return buffer;
    }

    private static byte[] whiteNoiseBurst(float durationSec, float amplitude, float attackSec, float decaySec) {
        int length = (int)(durationSec * SAMPLE_RATE);
        int attackLen = (int)(attackSec * SAMPLE_RATE);
        int decayLen = (int)(decaySec * SAMPLE_RATE);
        byte[] buffer = new byte[length * 2];
        for (int i = 0; i < length; i++) {
            double value = amplitude * (random.nextFloat() * 2 - 1);
            
            // Envelope
            float env = 1.0f;
            if (i < attackLen) {
                env = (float)i / attackLen;
            } else if (i > length - decayLen) {
                env = (float)(length - i) / decayLen;
            }
            
            short sample = toShort(value * env);
            buffer[2 * i] = (byte)(sample & 0xFF);
            buffer[2 * i + 1] = (byte)((sample >> 8) & 0xFF);
        }
        return buffer;
    }

    private static byte[] squareWave(float startHz, float endHz, float durationSec, float amplitude) {
        int length = (int)(durationSec * SAMPLE_RATE);
        byte[] buffer = new byte[length * 2];
        double phase = 0.0;
        for (int i = 0; i < length; i++) {
            float t = (float) i / SAMPLE_RATE;
            float freq = startHz + (endHz - startHz) * (t / durationSec);
            phase += freq / SAMPLE_RATE;
            if (phase > 1.0) phase -= 1.0;
            double value = (phase < 0.5 ? 1.0 : -1.0) * amplitude;
            short sample = toShort(value);
            buffer[2 * i] = (byte)(sample & 0xFF);
            buffer[2 * i + 1] = (byte)((sample >> 8) & 0xFF);
        }
        return buffer;
    }

    private static byte[] arpeggio(float[] notes, float noteDuration, float amplitude) {
        int noteLength = (int)(noteDuration * SAMPLE_RATE);
        int totalLength = noteLength * notes.length;
        byte[] buffer = new byte[totalLength * 2];
        
        for (int n = 0; n < notes.length; n++) {
            float freq = notes[n];
            for (int i = 0; i < noteLength; i++) {
                float t = (float) i / SAMPLE_RATE;
                
                // Envelope for each note
                float env = 1.0f;
                if (i < 100) env = i / 100f;
                else if (i > noteLength - 1000) env = (noteLength - i) / 1000f;
                
                double value = amplitude * env * Math.sin(2.0 * Math.PI * freq * t);
                short sample = toShort(value);
                int idx = (n * noteLength + i) * 2;
                buffer[idx] = (byte)(sample & 0xFF);
                buffer[idx + 1] = (byte)((sample >> 8) & 0xFF);
            }
        }
        return buffer;
    }

    private static byte[] mixBuffers(byte[] a, byte[] b) {
        int len = Math.max(a.length, b.length);
        byte[] mixed = new byte[len];
        for (int i = 0; i < len; i += 2) {
            short s1 = 0, s2 = 0;
            if (i + 1 < a.length) {
                s1 = (short)((a[i] & 0xFF) | (a[i+1] << 8));
            }
            if (i + 1 < b.length) {
                s2 = (short)((b[i] & 0xFF) | (b[i+1] << 8));
            }
            
            // Mix and clamp
            int mixedSample = s1 + s2;
            if (mixedSample > 32767) mixedSample = 32767;
            if (mixedSample < -32768) mixedSample = -32768;
            
            mixed[i] = (byte)(mixedSample & 0xFF);
            if (i + 1 < len) {
                mixed[i+1] = (byte)((mixedSample >> 8) & 0xFF);
            }
        }
        return mixed;
    }

    private static short toShort(double sample) {
        if (sample > 1.0) sample = 1.0;
        if (sample < -1.0) sample = -1.0;
        return (short)(sample * 32767);
    }
}
