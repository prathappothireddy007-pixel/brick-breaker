'use strict';

/* ============================================================
   BRICK BREAKER — OVERHAUL v2.0
   Five Worlds · Boss Fights · 10 Power-ups · Level Select
   Achievements · Star Ratings · Themed Backgrounds
   ============================================================ */

// ─── WORLD DEFINITIONS ────────────────────────────────────────
const WORLDS = [
  {
    id: 'neon',
    name: 'NEON CITY',
    bodyClass: '',
    accent: '#00f5ff',
    accent2: '#aa44ff',
    bgType: 'neon',
    levels: [1, 2, 3],
    starColors: ['#00f5ff', '#aa44ff'],
  },
  {
    id: 'lava',
    name: 'LAVA CORE',
    bodyClass: 'world-lava',
    accent: '#ff6a00',
    accent2: '#ff2244',
    bgType: 'lava',
    levels: [4, 5, 6],
    starColors: ['#ff6a00', '#ff2244'],
  },
  {
    id: 'ocean',
    name: 'DEEP OCEAN',
    bodyClass: 'world-ocean',
    accent: '#00d4ff',
    accent2: '#00ff88',
    bgType: 'ocean',
    levels: [7, 8, 9],
    starColors: ['#00d4ff', '#00ff88'],
  },
  {
    id: 'space',
    name: 'CYBER SPACE',
    bodyClass: 'world-space',
    accent: '#cc44ff',
    accent2: '#ff44cc',
    bgType: 'space',
    levels: [10, 11, 12],
    starColors: ['#cc44ff', '#ff44cc'],
  },
  {
    id: 'glitch',
    name: 'FINAL GRID',
    bodyClass: 'world-glitch',
    accent: '#00ff44',
    accent2: '#ffe600',
    bgType: 'glitch',
    levels: [13, 14, 15],
    starColors: ['#00ff44', '#ffe600'],
  },
];

function getWorldForLevel(level) {
  for (const w of WORLDS) {
    if (level >= w.levels[0] && level <= w.levels[w.levels.length - 1]) return w;
  }
  // Beyond defined worlds — loop on glitch theme
  return { ...WORLDS[4], name: 'FINAL GRID+', levels: [] };
}

function isBossLevel(level) {
  return level % 3 === 0;
}

// ─── CONFIGURATION ────────────────────────────────────────────
const CFG = {
  BALL_R: 8,
  BALL_BASE_SPEED: 420,
  BALL_MAX_SPEED: 680,
  BALL_MIN_SPEED: 220,
  PADDLE_W: 120,
  PADDLE_H: 16,
  COLS: 12,
  PAD: 6,
  BRICK_TOP: 60,
  BRICK_SIDE: 16,
  TRAIL_LEN: 24,
  SHAKE_DECAY: 3.0,
};

const BRICK_COLORS = [
  '#ff3366','#ff6a00','#ffe600',
  '#00ff88','#00d4ff','#aa44ff','#ff44cc'
];

const BTYPE = {
  NORMAL:    { hp: 1,        score: 100, color: null },
  TOUGH:     { hp: 3,        score: 300, color: '#ff8c00' },
  METAL:     { hp: Infinity, score: 0,   color: '#8899bb' },
  EXPLOSIVE: { hp: 1,        score: 200, color: '#ff2244' },
  POWERUP:   { hp: 1,        score: 150, color: '#00ff88' },
  GHOST:     { hp: 1,        score: 250, color: '#aabbff' }, // NEW: requires 2nd hit to appear
  ARMORED:   { hp: 5,        score: 500, color: '#cc8800' }, // NEW: heavy brick
};

const PU = {
  MULTIBALL: { label: 'MULTI',    color: '#00f5ff', dur: 0 },
  BIGPADDLE: { label: 'BIG',      color: '#00ff88', dur: 12 },
  LASER:     { label: 'LASER',    color: '#ff3366', dur: 10 },
  SLOWMO:    { label: 'SLOW',     color: '#aa44ff', dur: 8  },
  SHIELD:    { label: 'SHIELD',   color: '#ffd700', dur: 15 },
  FIREBALL:  { label: 'FIRE',     color: '#ff6a00', dur: 7  }, // NEW: burns through bricks
  GEMSTONE:  { label: 'GEM ×10', color: '#ff44cc', dur: 0,  hits: 5 }, // NEW: next 5 bricks ×10
  STORM:     { label: 'STORM',    color: '#ffe600', dur: 5  }, // NEW: rapid-fire auto-laser
  GRAVITY:   { label: 'GRAV',     color: '#cc44ff', dur: 8  }, // NEW: reverse ball gravity
  MIRROR:    { label: 'MIRROR',   color: '#88ffdd', dur: 10 }, // NEW: perfect 90° reflect
};

// ─── ACHIEVEMENTS ─────────────────────────────────────────────
const ACHIEVEMENTS = {
  FIRST_COMBO:   { id: 'FIRST_COMBO',   name: 'COMBO KING',     desc: 'Reach a ×5 combo',       icon: '🔥' },
  NO_DAMAGE:     { id: 'NO_DAMAGE',     name: 'UNTOUCHABLE',    desc: 'Clear a level without losing a life', icon: '🛡️' },
  SPEED_RUN:     { id: 'SPEED_RUN',     name: 'SPEED DEMON',    desc: 'Clear a level in under 30s', icon: '⚡' },
  BOSS_SLAYER:   { id: 'BOSS_SLAYER',   name: 'BOSS SLAYER',    desc: 'Defeat your first boss',   icon: '⚔️' },
  POWER_HOARDER: { id: 'POWER_HOARDER', name: 'POWER HOARDER',  desc: 'Hold 3 power-ups at once', icon: '💎' },
  WORLD_CLEAR:   { id: 'WORLD_CLEAR',   name: 'WORLD CONQUEROR',desc: 'Clear all levels in a world', icon: '🌍' },
};

// ─── AUDIO ENGINE ─────────────────────────────────────────────
class AudioEngine {
  constructor() { this.ctx = null; this.gain = null; this.on = true; }

  init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.gain = this.ctx.createGain();
      this.gain.gain.value = 0.28;
      this.gain.connect(this.ctx.destination);
    } catch(e) { this.on = false; }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  play(type) {
    if (!this.on || !this.ctx) return;
    const t = this.ctx.currentTime;
    switch(type) {
      case 'bounce':    this._tone(420, 'sine',     0.18, 0.07, t); break;
      case 'break':     this._noise(0.35, 0.07, t); this._tone(180, 'square', 0.2, 0.09, t); break;
      case 'powerup':   this._arp([523, 659, 784, 1047], 0.065, t); break;
      case 'lost':      this._tone(220, 'sawtooth', 0.45, 0.55, t, -110); break;
      case 'combo':     this._arp([784, 988, 1175], 0.05, t); break;
      case 'gameover':  this._tone(100, 'sawtooth', 0.5, 0.9, t, -40); break;
      case 'victory':   this._arp([523, 659, 784, 1047, 1319], 0.13, t); break;
      case 'explode':   this._noise(0.7, 0.25, t); this._tone(70, 'sawtooth', 0.5, 0.3, t, -50); break;
      case 'laser':     this._tone(600, 'square',   0.2, 0.12, t, -400); break;
      case 'boss_hit':  this._tone(80,  'sawtooth', 0.6, 0.18, t, -30); break;
      case 'boss_die':  this._noise(0.9, 0.6, t); this._arp([100,80,60,40], 0.12, t); break;
      case 'fireball':  this._tone(300, 'sawtooth', 0.3, 0.06, t, 200); break;
      case 'transition':this._arp([440, 550, 660, 880], 0.08, t); break;
      case 'star':      this._arp([880, 1100, 1320], 0.06, t); break;
      case 'achievement': this._arp([523, 784, 1047, 1568], 0.12, t); break;
    }
  }

  _tone(f, type, vol, dur, when, slide = 0) {
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.connect(g); g.connect(this.gain);
    o.type = type;
    o.frequency.setValueAtTime(f, when);
    if (slide) o.frequency.linearRampToValueAtTime(Math.max(20, f + slide), when + dur);
    g.gain.setValueAtTime(vol, when);
    g.gain.exponentialRampToValueAtTime(0.001, when + dur);
    o.start(when); o.stop(when + dur + 0.02);
  }

  _noise(vol, dur, when) {
    const sr = this.ctx.sampleRate;
    const buf = this.ctx.createBuffer(1, sr * dur, sr);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    const g = this.ctx.createGain();
    src.buffer = buf; src.connect(g); g.connect(this.gain);
    g.gain.setValueAtTime(vol, when);
    g.gain.exponentialRampToValueAtTime(0.001, when + dur);
    src.start(when);
  }

  _arp(freqs, dur, when) {
    freqs.forEach((f, i) => this._tone(f, 'sine', 0.28, dur * 2, when + i * dur));
  }
}

// ─── PARTICLE SYSTEM ──────────────────────────────────────────
class Particle {
  constructor(x, y, vx, vy, color, size, life, type = 'shard') {
    this.x = x; this.y = y; this.vx = vx; this.vy = vy;
    this.color = color; this.size = size;
    this.life = life; this.maxLife = life;
    this.type = type;
    this.rot = Math.random() * Math.PI * 2;
    this.rotV = (Math.random() - 0.5) * 10;
    this.alpha = 1;
  }
  update(dt) {
    this.x += this.vx * dt; this.y += this.vy * dt;
    if (this.type === 'shard') this.vy += 400 * dt;
    this.vx *= 0.97; this.rot += this.rotV * dt;
    this.life -= dt; this.alpha = Math.max(0, this.life / this.maxLife);
  }
  alive() { return this.life > 0; }
}

class TextParticle {
  constructor(x, y, text, color, sz = 22) {
    this.x = x; this.y = y; this.text = text; this.color = color; this.sz = sz;
    this.vy = -80; this.life = 1.1; this.maxLife = 1.1; this.alpha = 1; this.scale = 1.4;
  }
  update(dt) {
    this.y += this.vy * dt; this.vy *= 0.94;
    this.life -= dt; this.alpha = Math.max(0, this.life / this.maxLife);
    this.scale = 1 + 0.4 * (1 - this.life / this.maxLife);
  }
  alive() { return this.life > 0; }
}

class ParticleSystem {
  constructor() { this.p = []; this.tp = []; }

  emit(x, y, color, n = 16, opts = {}) {
    const { speed = 220, spread = Math.PI * 2, angle = -Math.PI / 2,
            type = 'shard', sizeR = [2, 7], lifeR = [0.4, 0.9], gravity = true } = opts;
    for (let i = 0; i < n; i++) {
      const a = angle + (Math.random() - 0.5) * spread;
      const s = speed * (0.5 + Math.random() * 0.8);
      const sz = sizeR[0] + Math.random() * (sizeR[1] - sizeR[0]);
      const li = lifeR[0] + Math.random() * (lifeR[1] - lifeR[0]);
      const pt = new Particle(x, y, Math.cos(a) * s, Math.sin(a) * s, color, sz, li, type);
      if (!gravity) pt.vy *= 0.1;
      this.p.push(pt);
    }
  }

  burst(x, y, w, h, color) {
    const cx = x + w / 2, cy = y + h / 2;
    this.emit(cx, cy, color, 24, { speed: 260, type: 'shard', sizeR: [2,8], lifeR: [0.4,1.0] });
    this.emit(cx, cy, '#fff',  12, { speed: 320, type: 'spark', sizeR: [1,3], lifeR: [0.15,0.4] });
    this.emit(cx, cy, '#00f5ff', 8, { speed: 160, type: 'circle', sizeR: [1,4], lifeR: [0.3,0.7], gravity: false });
  }

  addText(x, y, text, color = '#00f5ff', sz = 22) {
    this.tp.push(new TextParticle(x, y, text, color, sz));
  }

  update(dt) {
    this.p  = this.p.filter(p => { p.update(dt); return p.alive(); });
    this.tp = this.tp.filter(p => { p.update(dt); return p.alive(); });
  }

  render(ctx) {
    this.p.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;
      if (p.type === 'shard') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.lineTo(p.size * 0.6, p.size * 0.5);
        ctx.lineTo(-p.size * 0.6, p.size * 0.5);
        ctx.closePath();
        ctx.fill();
      } else if (p.type === 'spark') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(-p.size * 2, 0); ctx.lineTo(p.size * 2, 0);
        ctx.stroke();
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, Math.max(0.5, p.size * p.alpha), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    this.tp.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.scale(p.scale, p.scale);
      ctx.font = `900 ${p.sz}px Orbitron, monospace`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.shadowColor = p.color; ctx.shadowBlur = 18;
      ctx.fillStyle = p.color;
      ctx.fillText(p.text, 0, 0);
      ctx.restore();
    });
  }

  clear() { this.p = []; this.tp = []; }
}

// ─── THEMED BACKGROUND RENDERER ───────────────────────────────
class BgRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.time = 0;
    this.mx = 0; this.my = 0;
    this.stars = [];
    this.bgType = 'neon';
    this.accent = '#00f5ff';
    this.lavaBlobs = [];
    this.bubbles = [];
    this._initParticles();
  }

  setTheme(bgType, accent) {
    this.bgType = bgType;
    this.accent = accent;
    this._initParticles();
  }

  _initParticles() {
    const W = this.canvas.width || window.innerWidth;
    const H = this.canvas.height || window.innerHeight;
    // Stars (neon/space/glitch)
    this.stars = [];
    for (let i = 0; i < 90; i++) {
      this.stars.push({
        x: Math.random() * W, y: Math.random() * H,
        sz: 0.5 + Math.random() * 2,
        spd: 8 + Math.random() * 28,
        op: 0.2 + Math.random() * 0.7,
        hue: Math.random() < 0.5 ? 185 : 280,
      });
    }
    // Lava blobs
    this.lavaBlobs = [];
    for (let i = 0; i < 12; i++) {
      this.lavaBlobs.push({
        x: Math.random() * W, y: H * 0.6 + Math.random() * H * 0.4,
        r: 20 + Math.random() * 60,
        spd: 12 + Math.random() * 18,
        phase: Math.random() * Math.PI * 2,
      });
    }
    // Ocean bubbles
    this.bubbles = [];
    for (let i = 0; i < 30; i++) {
      this.bubbles.push({
        x: Math.random() * W, y: H + Math.random() * H,
        r: 2 + Math.random() * 8,
        spd: 20 + Math.random() * 40,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  resize(w, h) {
    this.canvas.width = w; this.canvas.height = h;
    this._initParticles();
  }

  update(dt, mx, my) {
    this.time += dt; this.mx = mx; this.my = my;
    const H = this.canvas.height;
    const W = this.canvas.width;
    this.stars.forEach(s => {
      s.y -= s.spd * dt;
      if (s.y < -4) { s.y = H + 4; s.x = Math.random() * W; }
    });
    this.lavaBlobs.forEach(b => {
      b.y -= b.spd * dt;
      if (b.y + b.r < 0) { b.y = H + b.r; b.x = Math.random() * W; }
    });
    this.bubbles.forEach(b => {
      b.y -= b.spd * dt;
      b.x += Math.sin(this.time * 0.8 + b.phase) * 0.5;
      if (b.y + b.r < 0) { b.y = H + b.r; b.x = Math.random() * W; }
    });
  }

  render() {
    const { bgType } = this;
    if (bgType === 'neon')   this._renderNeon();
    else if (bgType === 'lava')  this._renderLava();
    else if (bgType === 'ocean') this._renderOcean();
    else if (bgType === 'space') this._renderSpace();
    else if (bgType === 'glitch')this._renderGlitch();
    else                          this._renderNeon();
  }

  _renderNeon() {
    const ctx = this.ctx, W = this.canvas.width, H = this.canvas.height;
    if (!W || !H) return;
    const bg = ctx.createRadialGradient(W/2, H*0.4, 0, W/2, H*0.4, Math.max(W,H)*0.85);
    bg.addColorStop(0, '#10002a'); bg.addColorStop(0.5, '#06000f'); bg.addColorStop(1, '#000005');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    // cursor glow
    const gl = ctx.createRadialGradient(this.mx, this.my, 0, this.mx, this.my, 240);
    gl.addColorStop(0, 'rgba(0,220,255,0.08)'); gl.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gl; ctx.fillRect(0, 0, W, H);
    this._grid(ctx, W, H, 'rgba(0,210,255,0.055)');
    this._stars(ctx, [185, 280]);
    this._aurora(ctx, W, H, [185, 280, 220]);
  }

  _renderLava() {
    const ctx = this.ctx, W = this.canvas.width, H = this.canvas.height;
    if (!W || !H) return;
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#0f0200'); bg.addColorStop(0.6, '#1a0400'); bg.addColorStop(1, '#2d0a00');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    // lava glow from bottom
    const lv = ctx.createLinearGradient(0, H*0.7, 0, H);
    lv.addColorStop(0, 'rgba(255,80,0,0)'); lv.addColorStop(1, 'rgba(255,80,0,0.15)');
    ctx.fillStyle = lv; ctx.fillRect(0, H*0.7, W, H*0.3);
    // lava blobs
    this.lavaBlobs.forEach(b => {
      const p = Math.sin(this.time * 1.2 + b.phase) * 0.3 + 0.7;
      const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r * p);
      g.addColorStop(0, 'rgba(255,140,0,0.18)'); g.addColorStop(1, 'rgba(255,40,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r * p, 0, Math.PI*2); ctx.fill();
    });
    this._grid(ctx, W, H, 'rgba(255,100,0,0.06)');
  }

  _renderOcean() {
    const ctx = this.ctx, W = this.canvas.width, H = this.canvas.height;
    if (!W || !H) return;
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#000d1a'); bg.addColorStop(0.5, '#001424'); bg.addColorStop(1, '#001a30');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    // caustic light ripples
    for (let i = 0; i < 5; i++) {
      const x = W * (0.1 + i * 0.2);
      const y = H * 0.1 + Math.sin(this.time * 0.7 + i * 1.2) * 30;
      const cg = ctx.createRadialGradient(x, y, 0, x, y, 80 + Math.sin(this.time + i) * 20);
      cg.addColorStop(0, 'rgba(0,212,255,0.07)'); cg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = cg; ctx.fillRect(0, 0, W, H);
    }
    // bubbles
    this.bubbles.forEach(b => {
      ctx.save();
      ctx.globalAlpha = 0.25;
      ctx.strokeStyle = '#00d4ff'; ctx.lineWidth = 1;
      ctx.shadowColor = '#00d4ff'; ctx.shadowBlur = 4;
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI*2); ctx.stroke();
      ctx.restore();
    });
    this._grid(ctx, W, H, 'rgba(0,180,255,0.05)');
  }

  _renderSpace() {
    const ctx = this.ctx, W = this.canvas.width, H = this.canvas.height;
    if (!W || !H) return;
    const bg = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W,H)*0.9);
    bg.addColorStop(0, '#0a0020'); bg.addColorStop(0.5, '#000010'); bg.addColorStop(1, '#000008');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    // nebula swirls
    for (let i = 0; i < 3; i++) {
      const angle = this.time * 0.1 + i * (Math.PI*2/3);
      const x = W/2 + Math.cos(angle) * W * 0.3;
      const y = H/2 + Math.sin(angle) * H * 0.25;
      const hue = [280, 200, 320][i];
      const ng = ctx.createRadialGradient(x, y, 0, x, y, 150);
      ng.addColorStop(0, `hsla(${hue},100%,65%,0.06)`); ng.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = ng; ctx.fillRect(0, 0, W, H);
    }
    this._stars(ctx, [280, 300], true);
    this._grid(ctx, W, H, 'rgba(150,50,255,0.05)');
  }

  _renderGlitch() {
    const ctx = this.ctx, W = this.canvas.width, H = this.canvas.height;
    if (!W || !H) return;
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#000800'); bg.addColorStop(1, '#001000');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    // digital scanlines
    ctx.fillStyle = 'rgba(0,255,68,0.012)';
    for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 2);
    // glitch bars (random)
    if (Math.random() < 0.04) {
      const gy = Math.random() * H;
      const gh = 2 + Math.random() * 8;
      ctx.fillStyle = `rgba(0,255,100,${0.05 + Math.random()*0.08})`;
      ctx.fillRect(0, gy, W, gh);
    }
    this._stars(ctx, [130, 60]);
    this._grid(ctx, W, H, 'rgba(0,255,50,0.07)');
    // matrix rain chars (minimal)
    ctx.font = '10px monospace';
    ctx.fillStyle = 'rgba(0,255,68,0.06)';
    for (let i = 0; i < 8; i++) {
      const x = Math.floor(Math.random() * 40) * (W / 40);
      const y = ((this.time * 60 + i * 137) % H);
      ctx.fillText(String.fromCharCode(0x30A0 + Math.floor(Math.random()*96)), x, y);
    }
  }

  _grid(ctx, W, H, color) {
    const vx = W/2, vy = H*0.22;
    ctx.save();
    ctx.strokeStyle = color; ctx.lineWidth = 0.6;
    for (let i = -14; i <= 14; i++) {
      ctx.beginPath(); ctx.moveTo(vx, vy); ctx.lineTo(vx + i*65, H); ctx.stroke();
    }
    for (let i = 0; i < 18; i++) {
      const t = i / 17;
      const y = vy + (H - vy) * Math.pow(t, 1.4);
      const xw = (y - vy) / (H - vy) * W * 0.85;
      ctx.beginPath(); ctx.moveTo(vx - xw/2, y); ctx.lineTo(vx + xw/2, y); ctx.stroke();
    }
    ctx.restore();
  }

  _stars(ctx, hues = [185,280], dense = false) {
    this.stars.forEach(s => {
      const twink = Math.sin(this.time * 2.5 + s.x * 0.05) * 0.3 + 0.7;
      const hue = hues[Math.floor(Math.random() < 0.5 ? 0 : 1)];
      ctx.save();
      ctx.globalAlpha = s.op * twink;
      ctx.shadowColor = `hsl(${hue},100%,75%)`; ctx.shadowBlur = 4;
      ctx.fillStyle = `hsl(${hue},100%,85%)`;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.sz, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    });
  }

  _aurora(ctx, W, H, hues) {
    for (let i = 0; i < 3; i++) {
      const yy = H*0.32 + Math.sin(this.time*0.45 + i*1.8) * 55;
      const gr = ctx.createLinearGradient(0, yy-45, 0, yy+45);
      gr.addColorStop(0, `hsla(${hues[i]},100%,65%,0)`);
      gr.addColorStop(0.5, `hsla(${hues[i]},100%,65%,0.028)`);
      gr.addColorStop(1, `hsla(${hues[i]},100%,65%,0)`);
      ctx.fillStyle = gr; ctx.fillRect(0, yy-45, W, 90);
    }
  }
}

// ─── TRAIL ────────────────────────────────────────────────────
class Trail {
  constructor(n = 24) { this.pts = []; this.n = n; }
  add(x, y) { this.pts.unshift({ x, y }); if (this.pts.length > this.n) this.pts.pop(); }
  render(ctx, r, color) {
    for (let i = this.pts.length - 1; i >= 0; i--) {
      const p = this.pts[i]; const t = 1 - i / this.pts.length;
      ctx.save(); ctx.globalAlpha = t * 0.5;
      ctx.shadowColor = color; ctx.shadowBlur = 10 * t;
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0.5, r * t * 0.8), 0, Math.PI*2); ctx.fill();
      ctx.restore();
    }
  }
  clear() { this.pts = []; }
}

// ─── FLASH ────────────────────────────────────────────────────
class Flash {
  constructor(x, y, color) {
    this.x = x; this.y = y; this.color = color;
    this.r = 0; this.life = 0.22; this.ml = 0.22;
  }
  update(dt) { this.life -= dt; this.r = (1 - this.life / this.ml) * 34; }
  render(ctx) {
    const a = (this.life / this.ml) * 0.85;
    ctx.save(); ctx.globalAlpha = a;
    const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r);
    g.addColorStop(0, 'rgba(255,255,255,0.95)');
    g.addColorStop(0.3, this.color + 'cc');
    g.addColorStop(1, this.color + '00');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  }
  alive() { return this.life > 0; }
}

// ─── SCREEN SHAKE ─────────────────────────────────────────────
class Shake {
  constructor() { this.t = 0; this.x = 0; this.y = 0; }
  add(v) { this.t = Math.min(1, this.t + v); }
  update(dt) {
    this.t = Math.max(0, this.t - CFG.SHAKE_DECAY * dt);
    const m = this.t * this.t;
    this.x = m * (Math.random() * 2 - 1) * 14;
    this.y = m * (Math.random() * 2 - 1) * 14;
  }
  apply(ctx) { ctx.translate(this.x, this.y); }
}

// ─── BRICK ────────────────────────────────────────────────────
class Brick {
  constructor(x, y, w, h, type, ci = 0, enterDelay = 0) {
    this.x = x; this.y = y; this.w = w; this.h = h;
    this.type = type;
    const bt = BTYPE[type];
    this.hp = bt.hp === Infinity ? 999 : bt.hp;
    this.maxHp = this.hp;
    this.indestructible = (bt.hp === Infinity);
    this.score = bt.score;
    this.color = bt.color || BRICK_COLORS[ci % BRICK_COLORS.length];
    this.alive = true;
    this.puType = null;
    this.pulse = Math.random() * Math.PI * 2;
    this.shakeX = 0; this.shakeY = 0; this.shakeT = 0;
    // Ghost brick: invisible until hit once
    this.ghost = (type === 'GHOST');
    this.ghostRevealed = false;
    // Entrance animation
    this.enterDelay = enterDelay;
    this._targetY = y;
    this.y = y - 80 - enterDelay * 30; // starts above
    this.entering = true;
  }

  hit() {
    if (this.ghost && !this.ghostRevealed) {
      this.ghostRevealed = true;
      this._shake(4);
      return false;
    }
    if (this.indestructible) { this._shake(5); return false; }
    this.hp--;
    if (this.hp <= 0) { this.alive = false; return true; }
    this._shake(4);
    return false;
  }

  _shake(mag) {
    this.shakeT = 0.12;
    this.shakeX = (Math.random() - 0.5) * mag;
    this.shakeY = (Math.random() - 0.5) * mag;
  }

  update(dt) {
    this.pulse += dt * 2.2;
    if (this.shakeT > 0) {
      this.shakeT -= dt;
      if (this.shakeT <= 0) { this.shakeX = 0; this.shakeY = 0; }
    }
    // Entrance slide-in
    if (this.entering) {
      if (this.enterDelay > 0) { this.enterDelay -= dt; }
      else {
        const diff = this._targetY - this.y;
        this.y += diff * Math.min(1, dt * 10);
        if (Math.abs(diff) < 0.5) { this.y = this._targetY; this.entering = false; }
      }
    }
  }

  render(ctx) {
    if (!this.alive) return;
    const x = this.x + this.shakeX, y = this.y + this.shakeY;
    const p = Math.sin(this.pulse) * 0.35 + 0.65;

    // Ghost: render as faint shimmer if not revealed
    const ghostAlpha = (this.ghost && !this.ghostRevealed) ? 0.18 : 1.0;
    ctx.save();
    ctx.globalAlpha = ghostAlpha;

    const gf = ctx.createLinearGradient(x, y, x, y + this.h);
    gf.addColorStop(0, 'rgba(255,255,255,0.16)');
    gf.addColorStop(0.45, 'rgba(255,255,255,0.05)');
    gf.addColorStop(1, 'rgba(0,0,0,0.22)');
    this._rr(ctx, x+1, y+1, this.w-2, this.h-2, 4);
    ctx.fillStyle = gf; ctx.fill();

    ctx.fillStyle = this.color + '2f';
    this._rr(ctx, x+1, y+1, this.w-2, this.h-2, 4); ctx.fill();

    ctx.shadowColor = this.color; ctx.shadowBlur = 9 * p;
    ctx.strokeStyle = this.color; ctx.lineWidth = 1.5;
    this._rr(ctx, x+1, y+1, this.w-2, this.h-2, 4); ctx.stroke();

    // TOUGH damage cracks
    if (this.type === 'TOUGH' && this.hp < this.maxHp) {
      const dmg = 1 - this.hp / this.maxHp;
      ctx.strokeStyle = `rgba(255,255,255,${dmg * 0.6})`;
      ctx.lineWidth = 1.2; ctx.shadowBlur = 0;
      const cx = x + this.w/2, cy = y + this.h/2;
      for (let i = 0; i < Math.ceil(dmg * 4); i++) {
        const a = (i / 4) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a)*this.w*0.38, cy + Math.sin(a)*this.h*0.38);
        ctx.stroke();
      }
    }

    // ARMORED: HP segments
    if (this.type === 'ARMORED') {
      const segs = this.maxHp;
      const fillRatio = this.hp / this.maxHp;
      ctx.fillStyle = 'rgba(255,200,0,0.25)';
      ctx.shadowBlur = 0;
      this._rr(ctx, x+2, y+2, (this.w-4)*fillRatio, this.h-4, 3);
      ctx.fill();
    }

    // METAL crosshatch
    if (this.type === 'METAL') {
      ctx.strokeStyle = 'rgba(180,200,255,0.15)';
      ctx.lineWidth = 1; ctx.shadowBlur = 0;
      for (let d = -this.h; d < this.w; d += 8) {
        ctx.beginPath();
        ctx.moveTo(x+d, y); ctx.lineTo(x+d+this.h, y+this.h); ctx.stroke();
      }
    }

    // EXPLOSIVE pulse
    if (this.type === 'EXPLOSIVE') {
      ctx.shadowColor = '#ff2244'; ctx.shadowBlur = 14 * p;
      ctx.fillStyle = 'rgba(255,34,68,0.15)';
      this._rr(ctx, x, y, this.w, this.h, 4); ctx.fill();
    }

    // Icons
    if (['POWERUP','EXPLOSIVE','GHOST'].includes(this.type)) {
      ctx.shadowBlur = 8; ctx.shadowColor = this.color;
      ctx.fillStyle = '#fff';
      ctx.font = `bold 11px sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const icon = this.type === 'POWERUP' ? '★' : this.type === 'EXPLOSIVE' ? '✕' : '👻';
      ctx.fillText(icon, x + this.w/2, y + this.h/2);
    }

    // Top highlight
    const hl = ctx.createLinearGradient(x, y, x, y+5);
    hl.addColorStop(0, 'rgba(255,255,255,0.36)'); hl.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = hl; ctx.shadowBlur = 0;
    ctx.fillRect(x+3, y+1, this.w-6, 5);

    ctx.restore();
  }

  _rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.lineTo(x+w-r, y);
    ctx.quadraticCurveTo(x+w, y, x+w, y+r);
    ctx.lineTo(x+w, y+h-r);
    ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    ctx.lineTo(x+r, y+h);
    ctx.quadraticCurveTo(x, y+h, x, y+h-r);
    ctx.lineTo(x, y+r);
    ctx.quadraticCurveTo(x, y, x+r, y);
    ctx.closePath();
  }
}

// ─── BOSS BRICK ───────────────────────────────────────────────
class Boss {
  constructor(x, y, w, h, world, maxHp = 20) {
    this.x = x; this.y = y; this.w = w; this.h = h;
    this.world = world;
    this.hp = maxHp; this.maxHp = maxHp;
    this.alive = true;
    this.phase = 1; // 1 = normal, 2 = < 50%, 3 = < 25%
    this.t = 0;
    this.baseX = x;
    this.pulse = 0;
    this.shootT = 0;
    this.shootInterval = 3.5;
    this.projectiles = [];
    this.color = world.accent2;
    this.name = this._bossName();
    // Entrance
    this._targetY = y;
    this.y = -h - 20;
    this.entering = true;
  }

  _bossName() {
    const names = ['GRID TYRANT','LAVA GOLEM','OCEAN LEVIATHAN','VOID SENTINEL','FINAL OVERLORD'];
    const wi = WORLDS.findIndex(w => w.id === this.world.id);
    return names[wi] || 'BOSS';
  }

  get hpRatio() { return this.hp / this.maxHp; }

  hit() {
    if (!this.alive) return false;
    this.hp--;
    if (this.hp <= 0) { this.alive = false; return true; }
    // Phase shift
    if (this.hpRatio < 0.25 && this.phase < 3) {
      this.phase = 3; this.shootInterval = 1.8;
    } else if (this.hpRatio < 0.5 && this.phase < 2) {
      this.phase = 2; this.shootInterval = 2.5;
    }
    return false;
  }

  update(dt, AW) {
    this.t += dt; this.pulse += dt * 2.5;
    // Entrance
    if (this.entering) {
      const diff = this._targetY - this.y;
      this.y += diff * Math.min(1, dt * 6);
      if (Math.abs(diff) < 1) { this.y = this._targetY; this.entering = false; }
    }
    // Sideways movement — faster in higher phases
    const speed = (this.phase === 3 ? 220 : this.phase === 2 ? 160 : 100);
    this.x = this.baseX + Math.sin(this.t * (this.phase === 3 ? 2.2 : 1.1)) * (AW * 0.35);
    // Shoot counter-projectiles
    this.shootT -= dt;
    if (this.shootT <= 0 && !this.entering) {
      this.shootT = this.shootInterval;
      this._shoot();
    }
    this.projectiles.forEach(p => {
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.life -= dt;
    });
    this.projectiles = this.projectiles.filter(p => p.life > 0 && p.y < 2000);
  }

  _shoot() {
    const count = this.phase === 3 ? 5 : this.phase === 2 ? 3 : 2;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI / 2) + (i - (count-1)/2) * (Math.PI / 8);
      this.projectiles.push({
        x: this.x + this.w/2,
        y: this.y + this.h,
        vx: Math.cos(angle) * 200,
        vy: Math.sin(angle) * 200,
        r: 5, life: 5,
        color: this.color,
      });
    }
  }

  render(ctx) {
    const p = Math.sin(this.pulse) * 0.4 + 0.6;
    ctx.save();
    // Main body
    const g = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.h);
    g.addColorStop(0, this.color + 'dd');
    g.addColorStop(0.5, this.color + '88');
    g.addColorStop(1, '#000');
    ctx.fillStyle = g;
    ctx.shadowColor = this.color; ctx.shadowBlur = 28 * p;
    this._rr(ctx, this.x, this.y, this.w, this.h, 8);
    ctx.fill();
    // Border
    ctx.strokeStyle = this.color; ctx.lineWidth = 3;
    this._rr(ctx, this.x, this.y, this.w, this.h, 8); ctx.stroke();
    // Phase aura (phase 2+)
    if (this.phase >= 2) {
      ctx.shadowBlur = 40 * p;
      ctx.strokeStyle = this.phase === 3 ? '#fff' : this.color;
      ctx.lineWidth = 2;
      this._rr(ctx, this.x-4, this.y-4, this.w+8, this.h+8, 12); ctx.stroke();
    }
    // Boss label
    ctx.shadowBlur = 10; ctx.shadowColor = this.color;
    ctx.fillStyle = '#fff';
    ctx.font = `900 ${Math.max(10, this.w/10)}px Orbitron, monospace`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(this.name, this.x + this.w/2, this.y + this.h/2);

    // Render projectiles
    this.projectiles.forEach(pr => {
      ctx.save();
      ctx.shadowColor = pr.color; ctx.shadowBlur = 14;
      const rg = ctx.createRadialGradient(pr.x, pr.y, 0, pr.x, pr.y, pr.r);
      rg.addColorStop(0, '#fff'); rg.addColorStop(0.5, pr.color); rg.addColorStop(1, pr.color+'44');
      ctx.fillStyle = rg;
      ctx.beginPath(); ctx.arc(pr.x, pr.y, pr.r, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    });

    ctx.restore();
  }

  _rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x+r, y); ctx.lineTo(x+w-r, y);
    ctx.quadraticCurveTo(x+w, y, x+w, y+r);
    ctx.lineTo(x+w, y+h-r);
    ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    ctx.lineTo(x+r, y+h);
    ctx.quadraticCurveTo(x, y+h, x, y+h-r);
    ctx.lineTo(x, y+r);
    ctx.quadraticCurveTo(x, y, x+r, y);
    ctx.closePath();
  }
}

// ─── POWER-UP DROP ────────────────────────────────────────────
class PowerUp {
  constructor(x, y, type) {
    this.x = x; this.y = y; this.type = type;
    this.info = PU[type];
    this.vy = 120; this.bt = Math.random() * Math.PI * 2;
    this.w = 72; this.h = 22; this.alive = true;
  }
  update(dt) { this.y += this.vy * dt; this.bt += dt * 4; }
  render(ctx) {
    const bx = this.x - this.w/2, by = this.y - this.h/2 + Math.sin(this.bt)*4;
    ctx.save();
    ctx.shadowColor = this.info.color; ctx.shadowBlur = 14;
    ctx.fillStyle = this.info.color + '2e';
    this._pill(ctx, bx, by, this.w, this.h); ctx.fill();
    ctx.strokeStyle = this.info.color; ctx.lineWidth = 1.5;
    this._pill(ctx, bx, by, this.w, this.h); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.shadowBlur = 0;
    ctx.font = `700 8px Orbitron, monospace`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(this.info.label, this.x, by + this.h/2);
    ctx.restore();
  }
  _pill(ctx, x, y, w, h) {
    const r = h/2;
    ctx.beginPath();
    ctx.arc(x+r, y+r, r, Math.PI/2, Math.PI*1.5);
    ctx.lineTo(x+w-r, y);
    ctx.arc(x+w-r, y+r, r, Math.PI*1.5, Math.PI/2);
    ctx.closePath();
  }
  get bounds() { return { x: this.x - this.w/2, y: this.y - this.h/2, w: this.w, h: this.h }; }
}

// ─── LASER BOLT ───────────────────────────────────────────────
class Laser {
  constructor(x, y, color = '#ff3366') {
    this.x = x; this.y = y; this.vy = -620; this.alive = true;
    this.color = color;
  }
  update(dt) { this.y += this.vy * dt; if (this.y < -20) this.alive = false; }
  render(ctx) {
    ctx.save();
    ctx.shadowColor = this.color; ctx.shadowBlur = 12;
    const g = ctx.createLinearGradient(this.x, this.y, this.x, this.y + 24);
    g.addColorStop(0, this.color); g.addColorStop(1, 'rgba(255,51,102,0)');
    ctx.fillStyle = g;
    ctx.fillRect(this.x - 2, this.y, 4, 24);
    ctx.restore();
  }
}

// ─── LEVEL GENERATOR ──────────────────────────────────────────
class LevelGen {
  generate(level, world) {
    const rows = Math.min(4 + Math.floor(level * 0.7), 10);
    const cols = CFG.COLS;
    const layout = [];
    const bossLvl = isBossLevel(level);

    for (let r = 0; r < rows; r++) {
      layout.push([]);
      for (let c = 0; c < cols; c++) {
        const roll = Math.random();
        let type = 'NORMAL';
        if      (level >= 5 && roll < 0.06) type = 'ARMORED';
        else if (level >= 4 && roll < 0.08) type = 'GHOST';
        else if (level >= 3 && roll < 0.14) type = 'METAL';
        else if (level >= 2 && roll < 0.22) type = 'EXPLOSIVE';
        else if (level >= 1 && roll < 0.30) type = 'TOUGH';
        else if (roll < 0.38)               type = 'POWERUP';
        layout[r].push({ type, ci: (r + c + level) % BRICK_COLORS.length });
      }
    }
    return { layout, bossLvl };
  }
}

// ─── MAIN ENGINE ──────────────────────────────────────────────
class BrickBreaker {
  constructor() {
    this.bgC   = document.getElementById('bgCanvas');
    this.gC    = document.getElementById('gameCanvas');
    this.prvC  = document.getElementById('previewCanvas');
    this.gCtx  = this.gC.getContext('2d');
    this.prvCtx= this.prvC ? this.prvC.getContext('2d') : null;

    this.audio  = new AudioEngine();
    this.ps     = new ParticleSystem();
    this.trail  = new Trail(CFG.TRAIL_LEN);
    this.shake  = new Shake();
    this.bg     = new BgRenderer(this.bgC);
    this.lvlGen = new LevelGen();

    // State
    this.state     = 'start';
    this.score     = 0;
    this.best      = parseInt(localStorage.getItem('bb_best') || '0');
    this.level     = 1;
    this.lives     = 3;
    this.combo     = 0;
    this.bestCombo = 0;
    this.time      = 0;
    this.levelTime = 0;
    this.startLives= 3;

    // Entities
    this.ball = null; this.paddle = null;
    this.extras = []; this.pups = [];
    this.lasers = []; this.flashes = [];
    this.bricks = []; this.boss = null;
    this.aPU = {}; this.puT = {};
    this.gemHits = 0; // for GEMSTONE power-up
    this.laserCD = 0; this.stormT = 0;

    // Input
    this.mx = 0; this.my = 0; this.keys = {};

    // Dims
    this.AW = 720; this.AH = 640;

    // Demo
    this.prv = null;
    this._lastT = 0;

    this._init();
  }

  // ── INIT ──────────────────────────────────────────────────
  _init() {
    this.audio.init();
    this._resize();
    this._bindInput();
    this._bindButtons();
    this._updateStartBest();
    this._buildLevelSelect();
    this._initDemo();
    requestAnimationFrame(t => this._loop(t));
  }

  _resize() {
    const W = window.innerWidth, H = window.innerHeight;
    this.bg.resize(W, H);
    const wrapper = document.getElementById('arena-wrapper');
    const wrapW = wrapper ? Math.max(300, wrapper.clientWidth - 28) : W - 32;
    const wrapH = wrapper ? Math.max(300, wrapper.clientHeight - 28) : H - 90;
    this.AW = Math.min(wrapW, 760);
    this.AH = Math.min(wrapH, Math.floor(this.AW * 1.12));
    if (this.AH > wrapH) {
      this.AH = wrapH;
      this.AW = Math.min(wrapW, Math.floor(this.AH / 1.12));
    }
    this.gC.width  = this.AW; this.gC.height = this.AH;
    this.gC.style.width = this.AW + 'px'; this.gC.style.height = this.AH + 'px';
    const frame = document.getElementById('arena-frame');
    if (frame) {
      frame.style.width  = (this.AW + 6) + 'px';
      frame.style.height = (this.AH + 6) + 'px';
      frame.style.left = '50%'; frame.style.top = '50%';
      frame.style.transform = 'translate(-50%, -50%)';
    }
    if (this.prvC) { this.prvC.width = W; this.prvC.height = H; }
    if (this.paddle) {
      this.paddle.y = this.AH - 38;
      this.paddle.x = Math.max(0, Math.min(this.AW - this.paddle.w, this.paddle.x));
    }
    if (this.ball && this.ball.stuck) {
      this.ball.x = this.paddle ? this.paddle.x + this.paddle.w/2 : this.AW/2;
      this.ball.y = this.paddle ? this.paddle.y - CFG.BALL_R - 3   : this.AH - 60;
    }
  }

  _bindInput() {
    window.addEventListener('resize', () => this._resize());
    window.addEventListener('mousemove', e => {
      this.mx = e.clientX; this.my = e.clientY;
      this.bg.update(0, this.mx, this.my);
      // cursor glow
      const cg = document.getElementById('cursor-glow');
      if (cg) { cg.style.left = e.clientX + 'px'; cg.style.top = e.clientY + 'px'; }
      if (this.state === 'playing' && this.paddle) {
        const rect = this.gC.getBoundingClientRect();
        this.paddle.x = e.clientX - rect.left - this.paddle.w/2;
        this._clampP();
      }
    });
    window.addEventListener('keydown', e => {
      this.keys[e.code] = true;
      this.audio.resume();
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        if (this.state === 'playing') {
          if (this.ball?.stuck) this._launch();
          else if (this.aPU['LASER'] || this.aPU['STORM']) this._fireLaser();
        } else if (this.state === 'start') {
          this._startGame();
        } else if (this.state === 'paused') {
          this._resume();
        } else if (this.state === 'victory') {
          this.level++;
          this._transitionToNextLevel();
        } else if (this.state === 'gameover') {
          this.level = 1;
          this._startGame();
        }
      }
      if (e.code === 'KeyP' || e.code === 'Escape') {
        if (this.state === 'playing') this._pause();
        else if (this.state === 'paused') this._resume();
      }
    });
    window.addEventListener('keyup', e => { this.keys[e.code] = false; });
    window.addEventListener('touchmove', e => {
      if (this.state === 'playing' && this.paddle && e.touches.length > 0) {
        const rect = this.gC.getBoundingClientRect();
        this.paddle.x = e.touches[0].clientX - rect.left - this.paddle.w/2;
        this._clampP();
      }
    }, { passive: true });
    window.addEventListener('touchstart', () => {
      this.audio.resume();
      if (this.state === 'playing' && this.ball?.stuck) this._launch();
    }, { passive: true });
    this.gC.addEventListener('click', () => {
      this.audio.resume();
      if (this.state === 'playing' && this.ball?.stuck) this._launch();
    });
  }

  _bindButtons() {
    const on = (id, fn) => {
      const b = document.getElementById(id);
      if (b) b.addEventListener('click', () => { this.audio.resume(); fn(); });
    };
    on('btn-start',        () => this._startGame());
    on('btn-level-select', () => this._showLevelSelect());
    on('btn-ls-back',      () => this._setState('start'));
    on('btn-pause',        () => this._pause());
    on('btn-resume',       () => this._resume());
    on('btn-menu',         () => this._goMenu());
    on('btn-menu2',        () => this._goMenu());
    on('btn-menu3',        () => this._goMenu());
    on('btn-restart',      () => { this.level = 1; this._startGame(); });
    on('btn-next',         () => { this.level++; this._transitionToNextLevel(); });
  }

  // ── STATE ─────────────────────────────────────────────────
  _setState(s) {
    this.state = s;
    document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
    const map = {
      start:        ['screen-start'],
      'level-select':['screen-level-select'],
      playing:      ['screen-game'],
      paused:       ['screen-game', 'screen-pause'],
      gameover:     ['screen-game', 'screen-gameover'],
      victory:      ['screen-game', 'screen-victory'],
    };
    (map[s] || []).forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add('active');
    });

    if (s === 'gameover') {
      const stars = this._calcStars();
      this._set('go-score', this._fmt(this.score));
      this._set('go-combo', '×' + this.bestCombo);
      this._set('go-best',  this._fmt(this.best));
      this._renderStars('go-stars', stars);
    }
    if (s === 'victory') {
      const stars = this._calcStars();
      this._set('vic-score', this._fmt(this.score));
      this._set('vic-combo', '×' + this.bestCombo);
      this._set('vic-time',  Math.round(this.levelTime) + 's');
      this._renderStars('vic-stars', stars);
      this._saveLevelProgress(this.level, stars);
      this._checkAchievements();
    }
  }

  _set(id, v) { const e = document.getElementById(id); if (e) e.textContent = v; }
  _fmt(n) { return Number(n).toLocaleString(); }

  // ── WORLD THEME ───────────────────────────────────────────
  _applyWorldTheme(world) {
    document.body.className = world.bodyClass || '';
    this.bg.setTheme(world.bgType, world.accent);
    // update CSS vars for HUD elements via inline style on root (fallback)
  }

  // ── GAME FLOW ─────────────────────────────────────────────
  _startGame() {
    this._resize();
    this.score     = 0;
    this.combo     = 0;
    this.bestCombo = 0;
    this.lives     = 3;
    this.startLives= 3;
    this.aPU = {}; this.puT = {};
    this.gemHits   = 0;
    this.time      = 0;
    this.levelTime = 0;
    this.laserCD   = 0; this.stormT = 0;
    this.extras = []; this.pups = [];
    this.lasers = []; this.flashes = [];
    this.boss   = null;
    this.ps.clear(); this.trail.clear();

    const world = getWorldForLevel(this.level);
    this._applyWorldTheme(world);
    this._set('hud-world-name', world.name);

    this._initPaddle();
    this._initBall();
    this._buildBricks();
    this._setState('playing');
    this._updateHUD();
    this._updatePUDisplay();
    this._updateBossBar();
  }

  _initPaddle() {
    this.paddle = { x: this.AW/2 - CFG.PADDLE_W/2, y: this.AH - 38, w: CFG.PADDLE_W, h: CFG.PADDLE_H };
  }

  _initBall() {
    this.ball = {
      x: this.paddle.x + this.paddle.w/2,
      y: this.paddle.y - CFG.BALL_R - 3,
      vx: 0, vy: 0, r: CFG.BALL_R, stuck: true,
    };
    this.trail.clear();
  }

  _buildBricks() {
    const { layout, bossLvl } = this.lvlGen.generate(this.level, getWorldForLevel(this.level));
    const rows = layout.length, cols = CFG.COLS;
    const bW = (this.AW - CFG.BRICK_SIDE*2 - CFG.PAD*(cols-1)) / cols;
    const bH = Math.min(24, (this.AH * 0.48 - CFG.BRICK_TOP - CFG.PAD*(rows-1)) / rows);
    this.bricks = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const { type, ci } = layout[r][c];
        const x = CFG.BRICK_SIDE + c * (bW + CFG.PAD);
        const y = CFG.BRICK_TOP + r * (bH + CFG.PAD);
        const delay = r * 0.08;
        const b = new Brick(x, y, bW, bH, type, ci, delay);
        if (type === 'POWERUP') {
          const keys = Object.keys(PU);
          b.puType = keys[Math.floor(Math.random() * keys.length)];
        }
        this.bricks.push(b);
      }
    }
    // Boss
    if (bossLvl) {
      const world = getWorldForLevel(this.level);
      const bossW = Math.min(this.AW * 0.6, 320);
      const bossH = 48;
      const bx = this.AW/2 - bossW/2;
      const by = CFG.BRICK_TOP;
      const maxHp = 15 + this.level * 2;
      this.boss = new Boss(bx, by, bossW, bossH, world, maxHp);
      this._updateBossBar();
    }
  }

  _launch() {
    if (!this.ball || !this.ball.stuck) return;
    const spd = CFG.BALL_BASE_SPEED + (this.level - 1) * 22;
    const a = -Math.PI/2 + (Math.random() - 0.5) * 0.7;
    this.ball.vx = Math.cos(a) * spd;
    this.ball.vy = Math.sin(a) * spd;
    this.ball.stuck = false;
    this.audio.play('bounce');
  }

  _fireLaser() {
    if (this.laserCD > 0) return;
    this.laserCD = 0.18;
    const color = this.aPU['STORM'] ? '#ffe600' : '#ff3366';
    this.lasers.push(new Laser(this.paddle.x + 10, this.paddle.y, color));
    this.lasers.push(new Laser(this.paddle.x + this.paddle.w - 10, this.paddle.y, color));
    this.audio.play('laser');
  }

  _pause()  { if (this.state === 'playing') this._setState('paused'); }
  _resume() { if (this.state === 'paused') { this._setState('playing'); this._lastT = performance.now(); } }
  _goMenu() { this.extras = []; this.boss = null; this._setState('start'); this._updateStartBest(); }
  _showLevelSelect() { this._buildLevelSelect(); this._setState('level-select'); }

  _updateStartBest() { this._set('start-best', this._fmt(this.best)); }

  _clampP() {
    if (!this.paddle) return;
    this.paddle.x = Math.max(0, Math.min(this.AW - this.paddle.w, this.paddle.x));
  }

  // ── LEVEL TRANSITION ──────────────────────────────────────
  _transitionToNextLevel() {
    const overlay = document.getElementById('screen-transition');
    const txt = document.getElementById('transition-text');
    const world = getWorldForLevel(this.level);
    if (txt) {
      const isBoss = isBossLevel(this.level);
      txt.innerHTML = isBoss
        ? `⚠ BOSS STAGE<br><span style="font-size:0.55em;color:#ff2244">PREPARE YOURSELF</span>`
        : `LEVEL ${String(this.level).padStart(2,'0')}<br><span style="font-size:0.55em">${world.name}</span>`;
    }
    if (overlay) overlay.classList.add('active');
    this.audio.play('transition');
    setTimeout(() => {
      if (overlay) overlay.classList.remove('active');
      this._startGame();
    }, 1600);
  }

  // ── STARS & PROGRESS ──────────────────────────────────────
  _calcStars() {
    let stars = 1;
    if (this.lives === this.startLives) stars++;    // no lives lost
    if (this.levelTime < 45)           stars++;    // speed clear
    return stars;
  }

  _renderStars(containerId, count) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = '';
    for (let i = 0; i < 3; i++) {
      const s = document.createElement('span');
      s.className = 'star ' + (i < count ? 'lit' : 'dim');
      s.textContent = '⭐';
      s.style.animationDelay = (i * 0.2) + 's';
      el.appendChild(s);
    }
    if (count > 0) setTimeout(() => this.audio.play('star'), 300);
  }

  _saveLevelProgress(level, stars) {
    const key = `bb_lvl_${level}`;
    const prev = parseInt(localStorage.getItem(key) || '0');
    if (stars > prev) localStorage.setItem(key, stars);
    const bestKey = 'bb_best';
    if (this.score > this.best) {
      this.best = this.score;
      localStorage.setItem(bestKey, this.best);
    }
    // Track highest unlocked level
    const maxKey = 'bb_max_level';
    const curMax = parseInt(localStorage.getItem(maxKey) || '1');
    if (level + 1 > curMax) localStorage.setItem(maxKey, level + 1);
  }

  // ── ACHIEVEMENTS ──────────────────────────────────────────
  _checkAchievements() {
    const unlocked = JSON.parse(localStorage.getItem('bb_achievements') || '[]');
    const check = (id, condition) => {
      if (condition && !unlocked.includes(id)) {
        unlocked.push(id);
        localStorage.setItem('bb_achievements', JSON.stringify(unlocked));
        setTimeout(() => this._showAchievement(ACHIEVEMENTS[id]), 800);
      }
    };
    check('FIRST_COMBO',   this.bestCombo >= 5);
    check('NO_DAMAGE',     this.lives === this.startLives);
    check('SPEED_RUN',     this.levelTime < 30);
    check('BOSS_SLAYER',   isBossLevel(this.level) && !this.boss?.alive);
    check('POWER_HOARDER', Object.keys(this.aPU).length >= 3);
  }

  _showAchievement(ach) {
    if (!ach) return;
    this.audio.play('achievement');
    const toast = document.getElementById('achievement-toast');
    const name  = document.getElementById('ach-name-text');
    if (!toast || !name) return;
    const icon = toast.querySelector('.ach-icon');
    if (icon) icon.textContent = ach.icon;
    name.textContent = ach.name;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3200);
  }

  // ── LEVEL SELECT ──────────────────────────────────────────
  _buildLevelSelect() {
    const container = document.getElementById('worlds-container');
    if (!container) return;
    container.innerHTML = '';
    const maxLevel = parseInt(localStorage.getItem('bb_max_level') || '1');

    WORLDS.forEach(world => {
      const section = document.createElement('div');
      section.className = 'world-section';

      // World header
      const header = document.createElement('div');
      header.className = 'world-header';
      header.innerHTML = `
        <div class="world-badge" style="background:${world.accent};color:${world.accent}"></div>
        <div class="world-label" style="color:${world.accent}">${world.name}</div>
        <div class="world-divider"></div>
      `;
      section.appendChild(header);

      // Levels grid
      const grid = document.createElement('div');
      grid.className = 'levels-grid';
      world.levels.forEach(lvl => {
        const locked = lvl > maxLevel;
        const stars  = parseInt(localStorage.getItem(`bb_lvl_${lvl}`) || '0');
        const isBoss = isBossLevel(lvl);
        const card   = document.createElement('div');
        card.className = 'level-card' + (locked ? ' locked' : '') + (lvl === this.level ? ' current' : '');
        card.style.setProperty('--lc-color', world.accent);
        card.innerHTML = locked
          ? `<div class="lc-lock">🔒</div><div class="lc-num">${String(lvl).padStart(2,'0')}</div>`
          : `
              ${isBoss ? '<div class="lc-boss-tag">BOSS</div>' : ''}
              <div class="lc-num">${String(lvl).padStart(2,'0')}</div>
              <div class="lc-stars">${'⭐'.repeat(stars)}${'☆'.repeat(3-stars)}</div>
            `;
        if (!locked) {
          card.addEventListener('click', () => {
            this.audio.resume();
            this.level = lvl;
            this._startGame();
          });
        }
        grid.appendChild(card);
      });
      section.appendChild(grid);
      container.appendChild(section);
    });
  }

  // ── POWER-UPS ─────────────────────────────────────────────
  _applyPU(type) {
    if (type === 'MULTIBALL') {
      for (let i = 0; i < 2; i++) {
        if (this.extras.length >= 4) break;
        const spd = this.ball ? Math.hypot(this.ball.vx, this.ball.vy) : CFG.BALL_BASE_SPEED;
        const a = (i === 0 ? 0.6 : -0.6) - Math.PI/2;
        this.extras.push({
          x: this.ball?.x ?? this.AW/2, y: this.ball?.y ?? this.AH/2,
          vx: Math.cos(a)*spd, vy: Math.sin(a)*spd,
          r: CFG.BALL_R, stuck: false,
          trail: new Trail(18), _lost: false,
        });
      }
      return;
    }
    if (type === 'GEMSTONE') {
      this.gemHits = 5;
    }
    this.aPU[type] = true;
    if (PU[type].dur) this.puT[type] = PU[type].dur;
    if (type === 'BIGPADDLE') this.paddle.w = Math.min(220, this.AW*0.32);
    if (type === 'GRAVITY')   { /* flag handled in _moveBall */ }
    // Check achievement
    if (Object.keys(this.aPU).length >= 3) this._checkAchievements();
    this._updatePUDisplay();
  }

  _removePU(type) {
    delete this.aPU[type]; delete this.puT[type];
    if (type === 'BIGPADDLE' && this.paddle) this.paddle.w = CFG.PADDLE_W;
    this._updatePUDisplay();
  }

  _updatePUDisplay() {
    const d = document.getElementById('powerups-hud');
    if (!d) return;
    d.innerHTML = '';
    const pills = [];
    Object.keys(this.aPU).forEach(t => {
      const info = PU[t];
      pills.push({ label: info.label + (this.puT[t] ? ` ${Math.ceil(this.puT[t])}s` : ''), color: info.color });
    });
    if (this.gemHits > 0) {
      pills.push({ label: `GEM ×10 (${this.gemHits})`, color: '#ff44cc' });
    }
    pills.forEach(({ label, color }) => {
      const el = document.createElement('div');
      el.className = 'powerup-pill';
      el.style.cssText = `border-color:${color};color:${color};`;
      el.textContent = label;
      d.appendChild(el);
    });
  }

  // ── BOSS BAR ──────────────────────────────────────────────
  _updateBossBar() {
    const container = document.getElementById('boss-hp-container');
    if (!container) return;
    if (!this.boss || !this.boss.alive) {
      container.classList.add('hidden');
      return;
    }
    container.classList.remove('hidden');
    this._set('boss-name-text', this.boss.name);
    const pct = (this.boss.hpRatio * 100) + '%';
    const fill = document.getElementById('boss-hp-fill');
    const glow = document.getElementById('boss-hp-fill-glow');
    if (fill) fill.style.width = pct;
    if (glow) glow.style.width = pct;
  }

  // ── HUD ───────────────────────────────────────────────────
  _updateHUD() {
    const mult = this._comboMult();
    this._set('hud-score', this._fmt(this.score));
    this._set('hud-combo', mult > 1 ? `×${mult.toFixed(1)}` : '×1');
    this._set('hud-level', String(this.level).padStart(2, '0'));
    this._set('hud-best',  this._fmt(this.best));
    const lv = document.getElementById('hud-lives');
    if (lv) {
      lv.querySelectorAll('.life-dot').forEach((d, i) => {
        d.classList.toggle('active', i < this.lives);
      });
    }
  }

  _comboMult() {
    if (this.combo >= 20) return 5;
    if (this.combo >= 10) return 3;
    if (this.combo >= 5)  return 2;
    if (this.combo >= 3)  return 1.5;
    return 1;
  }

  _addScore(base) {
    const gemBonus = this.gemHits > 0 ? 10 : 1;
    const pts = Math.round(base * this._comboMult() * gemBonus * (this.aPU['SLOWMO'] ? 2 : 1));
    this.score += pts;
    if (this.score > this.best) {
      this.best = this.score;
      localStorage.setItem('bb_best', this.best);
    }
    // Milestone popups
    const milestones = [10000, 25000, 50000, 100000];
    milestones.forEach(m => {
      if (this.score >= m && this.score - pts < m) this._showMilestone(m);
    });
    if (this.gemHits > 0) { this.gemHits--; this._updatePUDisplay(); }
    return pts;
  }

  _showMilestone(n) {
    const d = document.getElementById('milestone-popup');
    if (!d) return;
    d.innerHTML = '';
    const el = document.createElement('div');
    el.className = 'milestone-text';
    el.textContent = `${this._fmt(n)} PTS!`;
    d.appendChild(el);
    // big particle burst across arena
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        const x = Math.random() * this.AW, y = Math.random() * this.AH * 0.6;
        const c = ['#ffd700','#ff44cc','#00ff88','#00f5ff'][i%4];
        this.ps.emit(x, y, c, 24, { speed: 280, spread: Math.PI*2, type:'shard' });
      }, i * 80);
    }
    setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 2200);
  }

  _incrCombo() {
    this.combo++;
    if (this.combo > this.bestCombo) this.bestCombo = this.combo;
    if (this.combo >= 3 && this.combo % 3 === 0) {
      this.audio.play('combo');
      this._showCombo();
    }
  }

  _showCombo() {
    const d = document.getElementById('combo-popup');
    if (!d) return;
    d.innerHTML = '';
    const el = document.createElement('div');
    el.className = 'combo-text';
    const labels = { 3:'NICE!', 6:'AWESOME!', 9:'AMAZING!', 12:'INCREDIBLE!', 15:'UNSTOPPABLE!', 18:'GODLIKE!', 21:'LEGENDARY!' };
    const labelKey = Object.keys(labels).reverse().find(k => this.combo >= parseInt(k));
    const label = labelKey ? labels[labelKey] : `×${this.combo} COMBO!`;
    el.textContent = `×${this.combo} ${label}`;
    el.style.color = this.combo >= 10 ? '#ffd700' : '#00f5ff';
    el.style.textShadow = `0 0 20px ${this.combo >= 10 ? '#ffd700' : '#00f5ff'}`;
    d.appendChild(el);
    setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 1600);
  }

  _checkWin() {
    const remaining = this.bricks.filter(b => b.alive && !b.indestructible).length;
    const bossAlive = this.boss && this.boss.alive;
    if (remaining === 0 && !bossAlive && this.state === 'playing') {
      setTimeout(() => this._victory(), 400);
    }
  }

  // ── MAIN LOOP ─────────────────────────────────────────────
  _loop(t) {
    requestAnimationFrame(ts => this._loop(ts));
    const dt = Math.min((t - this._lastT) / 1000, 0.05);
    this._lastT = t;
    this.time += dt;

    this.bg.update(dt, this.mx, this.my);
    this.bg.render();

    if (this.state === 'playing') this._update(dt);
    if (this.state === 'start')   this._runDemo(dt);

    this._render();
  }

  // ── UPDATE ────────────────────────────────────────────────
  _update(dt) {
    const slow = this.aPU['SLOWMO'] ? 0.45 : 1;
    const sdt  = dt * slow;
    this.levelTime += dt;

    this.shake.update(dt);
    this.laserCD = Math.max(0, this.laserCD - dt);

    // Power-up timers
    Object.keys(this.puT).forEach(t => {
      this.puT[t] -= dt;
      if (this.puT[t] <= 0) this._removePU(t);
    });
    this._updatePUDisplay();

    // STORM auto-fire
    if (this.aPU['STORM']) {
      this.stormT -= dt;
      if (this.stormT <= 0) { this.stormT = 0.22; this._fireLaser(); }
    }

    // Keyboard paddle
    if (this.keys['ArrowLeft']  || this.keys['KeyA']) this.paddle.x -= 560 * sdt;
    if (this.keys['ArrowRight'] || this.keys['KeyD']) this.paddle.x += 560 * sdt;
    this._clampP();

    // Main ball
    this._moveBall(this.ball, sdt);
    if (this.ball.stuck) {
      this.ball.x = this.paddle.x + this.paddle.w/2;
      this.ball.y = this.paddle.y - this.ball.r - 3;
    } else {
      this.trail.add(this.ball.x, this.ball.y);
      if (this.ball._lost) this._ballLost(this.ball);
    }

    // Extra balls
    this.extras = this.extras.filter(b => {
      if (b._lost) return false;
      this._moveBall(b, sdt);
      b.trail.add(b.x, b.y);
      return !b._lost;
    });

    // Lasers
    this.lasers.forEach(l => l.update(sdt));
    this.lasers = this.lasers.filter(l => l.alive);
    this._laserBricks();

    // Power-up pickups
    this.pups.forEach(p => p.update(sdt));
    this.pups = this.pups.filter(p => {
      if (p.y > this.AH + 30) return false;
      const b = p.bounds;
      if (this._rectOverlap(b, { x: this.paddle.x, y: this.paddle.y, w: this.paddle.w, h: this.paddle.h })) {
        this._applyPU(p.type);
        this.ps.addText(p.x, p.y, PU[p.type].label, PU[p.type].color, 20);
        this.audio.play('powerup');
        return false;
      }
      return true;
    });

    // Boss
    if (this.boss && this.boss.alive) {
      this.boss.update(dt, this.AW);
      this._updateBossBar();
      // Boss projectile collision with paddle/ball
      this.boss.projectiles.forEach(pr => {
        if (!this.aPU['SHIELD'] &&
            this._circleRect({ x: pr.x, y: pr.y, r: pr.r },
              { x: this.paddle.x, y: this.paddle.y, w: this.paddle.w, h: this.paddle.h })) {
          pr.life = -1; // destroy projectile
          this._ballLost(this.ball); // lose a life
        }
      });
    } else if (this.boss && !this.boss.alive) {
      // Boss just defeated
      if (!this.boss._dieHandled) {
        this.boss._dieHandled = true;
        this.audio.play('boss_die');
        this.shake.add(1.0);
        for (let i = 0; i < 12; i++) {
          setTimeout(() => {
            const x = this.boss.x + Math.random()*this.boss.w;
            const y = this.boss.y + Math.random()*this.boss.h;
            const c = ['#ff6a00','#ff2244','#ffd700','#fff'][i%4];
            this.ps.emit(x, y, c, 36, { speed: 360, spread: Math.PI*2, type:'shard' });
            this.flashes.push(new Flash(x, y, c));
          }, i * 90);
        }
        this._addScore(5000);
        this._showAchievement(ACHIEVEMENTS['BOSS_SLAYER']);
        this._checkWin();
      }
    }

    // Flashes & Bricks
    this.flashes.forEach(f => f.update(dt));
    this.flashes = this.flashes.filter(f => f.alive());
    this.bricks.forEach(b => b.update(dt));

    this.ps.update(dt);
    this._updateHUD();
  }

  // ── BALL MOVEMENT ─────────────────────────────────────────
  _moveBall(ball, dt) {
    if (ball.stuck) return;
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;

    // Gravity flip
    const grav = this.aPU['GRAVITY'] ? -1 : 1;

    // Walls
    if (ball.x - ball.r < 0) { ball.x = ball.r; ball.vx = Math.abs(ball.vx); this.audio.play('bounce'); }
    if (ball.x + ball.r > this.AW) { ball.x = this.AW - ball.r; ball.vx = -Math.abs(ball.vx); this.audio.play('bounce'); }
    if (ball.y - ball.r < 0) { ball.y = ball.r; ball.vy = Math.abs(ball.vy); this.audio.play('bounce'); }

    // GRAVITY: ceiling becomes the losing edge, floor becomes the bouncing wall
    if (this.aPU['GRAVITY']) {
      if (ball.y + ball.r > this.AH) {
        ball.y = this.AH - ball.r;
        ball.vy = -Math.abs(ball.vy);
        this.audio.play('bounce');
      }
      if (ball.y - ball.r < 0) {
        if (this.aPU['SHIELD']) {
          ball.vy = Math.abs(ball.vy); ball.y = ball.r;
          this.flashes.push(new Flash(ball.x, 0, '#ffd700')); this.audio.play('bounce');
        } else {
          ball._lost = true; return;
        }
      }
    } else {
      // Normal: bottom = lose
      if (ball.y - ball.r > this.AH) {
        if (this.aPU['SHIELD']) {
          ball.vy = -Math.abs(ball.vy); ball.y = this.AH - ball.r;
          this.flashes.push(new Flash(ball.x, this.AH, '#ffd700')); this.audio.play('bounce');
        } else {
          ball._lost = true; return;
        }
      }
    }

    // MIRROR: always bounce at 90° off paddle
    const paddleR = { x: this.paddle.x, y: this.paddle.y, w: this.paddle.w, h: this.paddle.h };
    if (ball.vy * grav > 0 && this._circleRect(ball, paddleR)) {
      const hit = (ball.x - this.paddle.x) / this.paddle.w - 0.5;
      const maxA = this.aPU['MIRROR'] ? 0.01 : Math.PI * 0.38;
      const spd  = Math.min(Math.hypot(ball.vx, ball.vy) * 1.01, CFG.BALL_MAX_SPEED);
      ball.vx = Math.sin(hit * maxA) * spd;
      ball.vy = -Math.abs(Math.cos(hit * maxA) * spd) * grav;
      ball.y  = this.paddle.y - ball.r - 1;
      this.audio.play('bounce');
      this.flashes.push(new Flash(ball.x, this.paddle.y, getWorldForLevel(this.level).accent));
      this.combo = 0;
    }

    this._ballBricks(ball);

    // Ball vs Boss
    if (this.boss && this.boss.alive && !this.boss.entering) {
      const bossR = { x: this.boss.x, y: this.boss.y, w: this.boss.w, h: this.boss.h };
      if (this._circleRect(ball, bossR)) {
        ball.vy = -ball.vy;
        ball.y  = this.boss.y + this.boss.h + ball.r + 1;
        const killed = this.boss.hit();
        this.audio.play('boss_hit');
        this.shake.add(0.2);
        this._updateBossBar();
        this.flashes.push(new Flash(this.boss.x + this.boss.w/2, this.boss.y + this.boss.h/2, this.boss.color));
        this._incrCombo();
      }
    }
  }

  // ── BRICK COLLISION ───────────────────────────────────────
  _ballBricks(ball) {
    for (let i = 0; i < this.bricks.length; i++) {
      const b = this.bricks[i];
      if (!b.alive) continue;
      // Ghost bricks: only collide if revealed
      if (b.ghost && !b.ghostRevealed) {
        // Check intersection just to reveal
        const nearX = Math.max(b.x, Math.min(ball.x, b.x + b.w));
        const nearY = Math.max(b.y, Math.min(ball.y, b.y + b.h));
        const dx = ball.x - nearX, dy = ball.y - nearY;
        if (dx*dx + dy*dy <= ball.r * ball.r) {
          b.hit(); // reveals
        }
        continue;
      }
      const nearX = Math.max(b.x, Math.min(ball.x, b.x + b.w));
      const nearY = Math.max(b.y, Math.min(ball.y, b.y + b.h));
      const dx = ball.x - nearX, dy = ball.y - nearY;
      if (dx*dx + dy*dy > ball.r * ball.r) continue;

      // FIREBALL: no reflect, burns through
      const fireball = this.aPU['FIREBALL'];
      if (!b.indestructible && !fireball) {
        const ox = ball.x < b.x + b.w/2 ? b.x - ball.x - ball.r : b.x + b.w - ball.x + ball.r;
        const oy = ball.y < b.y + b.h/2 ? b.y - ball.y - ball.r : b.y + b.h - ball.y + ball.r;
        if (Math.abs(ox) < Math.abs(oy)) ball.vx = -ball.vx;
        else ball.vy = -ball.vy;
      }

      const destroyed = fireball ? (() => { b.hp = 0; b.alive = false; return true; })() : b.hit();
      const cx = b.x + b.w/2, cy = b.y + b.h/2;
      this.flashes.push(new Flash(cx, cy, b.color));
      if (!b.indestructible) this.audio.play(fireball ? 'fireball' : 'break');

      if (destroyed) {
        this.ps.burst(b.x, b.y, b.w, b.h, b.color);
        const pts = this._addScore(b.score);
        this.ps.addText(cx, cy, '+' + pts, b.color, 20);
        this._incrCombo();
        this.shake.add(b.type === 'EXPLOSIVE' || b.type === 'ARMORED' ? 0.38 : 0.14);

        if (b.type === 'EXPLOSIVE') { this.audio.play('explode'); this._explode(b); }

        const dropPU = b.type === 'POWERUP' ? b.puType
          : (Math.random() < 0.09 ? Object.keys(PU)[Math.floor(Math.random() * Object.keys(PU).length)] : null);
        if (dropPU) this.pups.push(new PowerUp(cx, cy, dropPU));

        this._checkWin();
      }
      if (!fireball) break;
    }
  }

  _explode(origin) {
    const R = 110;
    this.bricks.forEach(b => {
      if (!b.alive || b === origin || b.indestructible) return;
      const dx = (b.x+b.w/2) - (origin.x+origin.w/2);
      const dy = (b.y+b.h/2) - (origin.y+origin.h/2);
      if (dx*dx + dy*dy > R*R) return;
      const dest = b.hit();
      this.ps.burst(b.x, b.y, b.w, b.h, b.color);
      this.flashes.push(new Flash(b.x+b.w/2, b.y+b.h/2, b.color));
      if (dest) { this._addScore(b.score); this._incrCombo(); }
    });
    // Boss caught in explosion
    if (this.boss && this.boss.alive) {
      const dx = (this.boss.x+this.boss.w/2)-(origin.x+origin.w/2);
      const dy = (this.boss.y+this.boss.h/2)-(origin.y+origin.h/2);
      if (dx*dx + dy*dy <= (R*1.5)*(R*1.5)) { this.boss.hit(); this._updateBossBar(); }
    }
    this._checkWin();
  }

  _laserBricks() {
    this.lasers.forEach(l => {
      if (!l.alive) return;
      // Laser vs boss
      if (this.boss && this.boss.alive) {
        if (l.x > this.boss.x && l.x < this.boss.x+this.boss.w &&
            l.y > this.boss.y && l.y < this.boss.y+this.boss.h) {
          this.boss.hit(); this._updateBossBar();
          this.flashes.push(new Flash(l.x, l.y, this.boss.color));
          l.alive = false;
          this.audio.play('boss_hit');
          return;
        }
      }
      this.bricks.forEach(b => {
        if (!b.alive || b.indestructible) return;
        if (l.x > b.x && l.x < b.x+b.w && l.y > b.y && l.y < b.y+b.h) {
          const dest = b.hit();
          if (dest) { this.ps.burst(b.x,b.y,b.w,b.h,b.color); this._addScore(b.score); this._checkWin(); }
          l.alive = false;
        }
      });
    });
  }

  _ballLost(ball) {
    if (ball !== this.ball) return;
    this.ball._lost = false;
    if (this.lives <= 0) return;
    this.lives--;
    this.combo = 0;
    this.trail.clear();
    this.audio.play('lost');
    this.shake.add(0.55);
    this._updateHUD();
    if (this.lives <= 0) {
      setTimeout(() => { this.audio.play('gameover'); this._setState('gameover'); }, 500);
    } else {
      this.ball.stuck = true; this.ball.vx = 0; this.ball.vy = 0;
    }
  }

  _victory() {
    this.audio.play('victory');
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        const x = Math.random()*this.AW, y = Math.random()*this.AH*0.5;
        const c = ['#00f5ff','#ff00ff','#00ff88','#ffd700','#ff44cc'][i%5];
        this.ps.emit(x, y, c, 36, { speed: 300, spread: Math.PI*2, type:'shard' });
      }, i * 120);
    }
    this._setState('victory');
  }

  // ── COLLISIONS ────────────────────────────────────────────
  _circleRect(ball, r) {
    const nx = Math.max(r.x, Math.min(ball.x, r.x+r.w));
    const ny = Math.max(r.y, Math.min(ball.y, r.y+r.h));
    const dx = ball.x - nx, dy = ball.y - ny;
    return dx*dx + dy*dy <= ball.r*ball.r;
  }

  _rectOverlap(a, b) {
    return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
  }

  // ── RENDER ────────────────────────────────────────────────
  _render() {
    if (this.state === 'start') return;
    const ctx = this.gCtx, W = this.AW, H = this.AH;
    ctx.save();
    this.shake.apply(ctx);

    // Arena interior
    ctx.fillStyle = 'rgba(4,0,12,0.92)';
    ctx.fillRect(-16, -16, W+32, H+32);

    // Subtle arena grid
    const world = getWorldForLevel(this.level);
    ctx.strokeStyle = `rgba(${this._hexToRgb(world.accent)},0.045)`;
    ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += 38) {
      ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke();
    }
    for (let y = 0; y < H; y += 38) {
      ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke();
    }

    // Entities
    this.bricks.forEach(b => b.render(ctx));
    if (this.boss && this.boss.alive) this.boss.render(ctx);
    this.pups.forEach(p => p.render(ctx));
    this.lasers.forEach(l => l.render(ctx));
    this.flashes.forEach(f => f.render(ctx));

    // Trails
    this.trail.render(ctx, CFG.BALL_R, world.accent);
    this.extras.forEach(b => b.trail.render(ctx, b.r, world.accent2 || '#ff44cc'));

    // Launch guide
    if (this.ball?.stuck) this._drawLaunchGuide(ctx, world);

    // Balls
    if (this.ball) this._drawBall(ctx, this.ball, world.accent, this.aPU['FIREBALL']);
    this.extras.forEach(b => this._drawBall(ctx, b, world.accent2 || '#ff44cc', false));

    // Paddle
    this._drawPaddle(ctx, world);

    // Shield line
    if (this.aPU['SHIELD']) {
      const y = this.aPU['GRAVITY'] ? 3 : H - 3;
      ctx.save();
      ctx.strokeStyle = '#ffd700'; ctx.shadowColor = '#ffd700'; ctx.shadowBlur = 12;
      ctx.lineWidth = 3; ctx.setLineDash([12, 8]);
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      ctx.restore();
    }

    // Particles
    this.ps.render(ctx);

    ctx.restore();
  }

  _hexToRgb(hex) {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return `${r},${g},${b}`;
  }

  _drawLaunchGuide(ctx, world) {
    const b = this.ball;
    ctx.save();
    ctx.strokeStyle = (world.accent || '#00f5ff') + '77';
    ctx.setLineDash([4, 4]); ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x, b.y - 50); ctx.stroke();
    ctx.fillStyle = (world.accent || '#00f5ff') + 'cc';
    ctx.font = '700 10px Orbitron, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SPACE / CLICK TO LAUNCH', b.x, b.y - 58);
    ctx.restore();
  }

  _drawBall(ctx, ball, color, fireball = false) {
    ctx.save();
    const c = fireball ? '#ff6a00' : color;
    ctx.shadowColor = c; ctx.shadowBlur = fireball ? 36 : 22;
    const g = ctx.createRadialGradient(ball.x - ball.r*0.35, ball.y - ball.r*0.35, 0, ball.x, ball.y, ball.r);
    g.addColorStop(0, '#ffffff'); g.addColorStop(0.45, c); g.addColorStop(1, c + '88');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI*2); ctx.fill();
    if (fireball) {
      // fire ring
      ctx.globalAlpha = 0.4;
      ctx.strokeStyle = '#ffaa00'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r + 4, 0, Math.PI*2); ctx.stroke();
    }
    ctx.restore();
  }

  _drawPaddle(ctx, world) {
    const p = this.paddle; if (!p) return;
    const isLaser = this.aPU['LASER'] || this.aPU['STORM'];
    const col = isLaser ? (this.aPU['STORM'] ? '#ffe600' : '#ff3366') : world.accent;
    const r = p.h / 2;
    ctx.save();
    ctx.shadowColor = col; ctx.shadowBlur = 24;
    const g = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.h);
    g.addColorStop(0, '#ffffff'); g.addColorStop(0.25, col); g.addColorStop(1, '#060015');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(p.x+r, p.y+r, r, Math.PI/2, Math.PI*1.5);
    ctx.lineTo(p.x+p.w-r, p.y);
    ctx.arc(p.x+p.w-r, p.y+r, r, Math.PI*1.5, Math.PI/2);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = col; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(p.x+r, p.y+r, r, Math.PI/2, Math.PI*1.5);
    ctx.lineTo(p.x+p.w-r, p.y);
    ctx.arc(p.x+p.w-r, p.y+r, r, Math.PI*1.5, Math.PI/2);
    ctx.closePath(); ctx.stroke();
    // Inner highlight
    ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.shadowBlur = 0;
    ctx.fillRect(p.x+r+4, p.y+2, p.w-r*2-8, 3);
    // Laser turrets
    if (isLaser) {
      ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 10;
      ctx.fillRect(p.x+6, p.y-6, 6, 8);
      ctx.fillRect(p.x+p.w-12, p.y-6, 6, 8);
    }
    // GRAVITY indicator (inverted chevron on paddle)
    if (this.aPU['GRAVITY']) {
      ctx.fillStyle = '#cc44ff'; ctx.shadowColor = '#cc44ff'; ctx.shadowBlur = 8;
      ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('▲', p.x+p.w/2, p.y+p.h/2);
    }
    ctx.restore();
  }

  // ── DEMO (start screen preview) ───────────────────────────
  _initDemo() {
    if (!this.prvC) return;
    const W = this.prvC.width || window.innerWidth;
    const H = this.prvC.height || window.innerHeight;
    const cols = 10, rows = 5;
    const bW = (W*0.6)/cols, bH = 16, bStartX = W*0.2, bStartY = H*0.15;
    const dBricks = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        dBricks.push({
          x: bStartX + c*(bW+4), y: bStartY + r*(bH+4),
          w: bW, h: bH,
          color: BRICK_COLORS[(r+c) % BRICK_COLORS.length],
          alive: true,
        });
      }
    }
    this.prv = {
      ball: { x: W/2, y: H*0.65, vx: 180, vy: -220, r: 7 },
      bricks: dBricks, t: 0, W, H,
    };
  }

  _runDemo(dt) {
    if (!this.prvC || !this.prv) return;
    const prv = this.prv, ctx = this.prvCtx;
    prv.t += dt;
    const b = prv.ball;
    b.x += b.vx * dt; b.y += b.vy * dt;
    if (b.x < b.r || b.x > prv.W - b.r) b.vx = -b.vx;
    if (b.y < b.r) b.vy = -b.vy;
    if (b.y > prv.H + 20) {
      b.y = prv.H * 0.6; b.x = prv.W/2;
      b.vx = 160 + Math.random()*80; b.vy = -200;
    }
    prv.bricks.forEach(br => {
      if (!br.alive) return;
      const nx = Math.max(br.x, Math.min(b.x, br.x+br.w));
      const ny = Math.max(br.y, Math.min(b.y, br.y+br.h));
      const dx = b.x-nx, dy = b.y-ny;
      if (dx*dx + dy*dy < b.r*b.r) { br.alive = false; b.vy = -b.vy; }
    });
    if (prv.bricks.every(br => !br.alive)) prv.bricks.forEach(br => br.alive = true);
    ctx.clearRect(0, 0, prv.W, prv.H);
    prv.bricks.forEach(br => {
      if (!br.alive) return;
      ctx.save(); ctx.globalAlpha = 0.7;
      ctx.fillStyle = br.color + '44'; ctx.fillRect(br.x, br.y, br.w, br.h);
      ctx.strokeStyle = br.color; ctx.lineWidth = 1;
      ctx.shadowColor = br.color; ctx.shadowBlur = 6;
      ctx.strokeRect(br.x+0.5, br.y+0.5, br.w-1, br.h-1);
      ctx.restore();
    });
    ctx.save(); ctx.globalAlpha = 0.75;
    ctx.shadowColor = '#00f5ff'; ctx.shadowBlur = 16; ctx.fillStyle = '#00f5ff';
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  }
}

// ── BOOT ────────────────────────────────────────────────────
window.addEventListener('load', () => new BrickBreaker());
