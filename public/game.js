'use strict';

/* ============================================================
   BRICK BREAKER: ROGUELIKE BULLET-TIME OVERHAUL (v3.0)
   - Hero Classes with Ultimate Gauges & Actives
   - "SUPERHOT" Time Dilation (Time moves when you move)
   - Roguelike Relic Draft & Synergies (12+ Stackable Relics)
   - Dynamic Anomalies: Gravity Wells, Portals & Physics Debris
   - 5 Themed Worlds · Multi-Phase Boss Encounters
   ============================================================ */

// ─── HERO CLASSES ─────────────────────────────────────────────
const HEROES = {
  CHRONO_MAGE: {
    id: 'CHRONO_MAGE',
    name: 'CHRONO MAGE',
    icon: '⏳',
    color: '#00f5ff',
    passiveText: 'Passive: +15% Deeper Bullet-Time',
    ultName: 'CHRONO REWIND',
    ultDesc: 'Rewinds ball 2.5s into the past & returns it safely to paddle.',
  },
  CYBER_SAMURAI: {
    id: 'CYBER_SAMURAI',
    name: 'CYBER SAMURAI',
    icon: '⚔️',
    color: '#ff00ff',
    passiveText: 'Passive: +25% Speed & Slices Debris',
    ultName: 'DIMENSIONAL SLASH',
    ultDesc: 'Launches 3 energy slashes slicing entire vertical columns.',
  },
  SIEGE_MECH: {
    id: 'SIEGE_MECH',
    name: 'SIEGE MECH',
    icon: '🤖',
    color: '#ffd700',
    passiveText: 'Passive: +20% Wider Heavy Paddle',
    ultName: 'HYPER CANNON',
    ultDesc: 'Fires an orbital hyper-beam destroying everything in path.',
  }
};

// ─── ROGUELIKE RELICS (12 UNIQUE RELICS) ──────────────────────
const RELICS = [
  {
    id: 'TESLA_ARC',
    name: 'TESLA COIL',
    icon: '⚡',
    rarity: 'rare',
    color: '#00f5ff',
    desc: 'Ball impacts arc chain-lightning to 3 adjacent bricks.',
  },
  {
    id: 'SINGULARITY',
    name: 'SINGULARITY CORE',
    icon: '🕳️',
    rarity: 'legendary',
    color: '#cc44ff',
    desc: 'The ball generates a micro gravity well that pulls in debris and bends shots.',
  },
  {
    id: 'CLUSTER_BOMB',
    name: 'CLUSTER SHRAPNEL',
    icon: '💥',
    rarity: 'common',
    color: '#ff2244',
    desc: 'Destroyed bricks shatter into 3 bouncy explosive pellets.',
  },
  {
    id: 'PHASE_SHIFT',
    name: 'PHASE TRANSDUCER',
    icon: '👻',
    rarity: 'rare',
    color: '#88aaff',
    desc: 'Ball damages metal bricks instead of bouncing off helplessly.',
  },
  {
    id: 'OVERCHARGE',
    name: 'OVERCHARGE BATTERY',
    icon: '🔋',
    rarity: 'common',
    color: '#ffe600',
    desc: 'Every 10-combo hit triggers an electric shockwave across the whole row.',
  },
  {
    id: 'KINETIC_BLADE',
    name: 'KINETIC MOMENTUM',
    icon: '⚔️',
    rarity: 'common',
    color: '#ff6a00',
    desc: 'Paddle deflections increase ball damage & score by +15%.',
  },
  {
    id: 'CRYO_FREEZE',
    name: 'CRYO MATRIX',
    icon: '❄️',
    rarity: 'rare',
    color: '#00d4ff',
    desc: 'Freezes boss movement and slows falling debris on brick impacts.',
  },
  {
    id: 'AEGIS_BARRIER',
    name: 'AEGIS GENERATOR',
    icon: '🛡️',
    rarity: 'rare',
    color: '#ffd700',
    desc: 'Automatically grants an energy floor shield at the start of boss fights.',
  },
  {
    id: 'DETONATION_CORE',
    name: 'UNSTABLE REACTOR',
    icon: '💣',
    rarity: 'legendary',
    color: '#ff3366',
    desc: 'Explosive bricks have +100% blast radius and chain to other explosives.',
  },
  {
    id: 'METEOR_STRIKE',
    name: 'SOLAR FLARE',
    icon: '☄️',
    rarity: 'common',
    color: '#ff8800',
    desc: 'Ball leaves a fiery trail that deals thermal burn damage to nearby bricks.',
  },
  {
    id: 'HOMING_MISSILES',
    name: 'WARP MISSILES',
    icon: '🎯',
    rarity: 'legendary',
    color: '#00ff88',
    desc: 'Paddle fires 2 auto-targeting plasma missiles every time a brick breaks.',
  },
  {
    id: 'ALCHEMY_CORE',
    name: 'MIDAS ALGORITHM',
    icon: '💎',
    rarity: 'common',
    color: '#ff44cc',
    desc: 'Bricks drop gold score shards that rapidly recharge your Ultimate gauge.',
  }
];

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
  },
  {
    id: 'lava',
    name: 'LAVA CORE',
    bodyClass: 'world-lava',
    accent: '#ff6a00',
    accent2: '#ff2244',
    bgType: 'lava',
    levels: [4, 5, 6],
  },
  {
    id: 'ocean',
    name: 'DEEP OCEAN',
    bodyClass: 'world-ocean',
    accent: '#00d4ff',
    accent2: '#00ff88',
    bgType: 'ocean',
    levels: [7, 8, 9],
  },
  {
    id: 'space',
    name: 'CYBER SPACE',
    bodyClass: 'world-space',
    accent: '#cc44ff',
    accent2: '#ff44cc',
    bgType: 'space',
    levels: [10, 11, 12],
  },
  {
    id: 'glitch',
    name: 'FINAL GRID',
    bodyClass: 'world-glitch',
    accent: '#00ff44',
    accent2: '#ffe600',
    bgType: 'glitch',
    levels: [13, 14, 15],
  },
];

function getWorldForLevel(level) {
  for (const w of WORLDS) {
    if (level >= w.levels[0] && level <= w.levels[w.levels.length - 1]) return w;
  }
  return { ...WORLDS[4], name: 'FINAL GRID+', levels: [] };
}

function isBossLevel(level) {
  return level % 3 === 0;
}

// ─── CONFIGURATION CONSTANTS ─────────────────────────────────
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
  GHOST:     { hp: 1,        score: 250, color: '#aabbff' },
  ARMORED:   { hp: 5,        score: 500, color: '#cc8800' },
};

const PU = {
  MULTIBALL: { label: 'MULTI',    color: '#00f5ff', dur: 0 },
  BIGPADDLE: { label: 'BIG',      color: '#00ff88', dur: 12 },
  LASER:     { label: 'LASER',    color: '#ff3366', dur: 10 },
  SLOWMO:    { label: 'SLOW',     color: '#aa44ff', dur: 8  },
  SHIELD:    { label: 'SHIELD',   color: '#ffd700', dur: 15 },
  FIREBALL:  { label: 'FIRE',     color: '#ff6a00', dur: 7  },
  GEMSTONE:  { label: 'GEM ×10', color: '#ff44cc', dur: 0,  hits: 5 },
  STORM:     { label: 'STORM',    color: '#ffe600', dur: 5  },
  GRAVITY:   { label: 'GRAV',     color: '#cc44ff', dur: 8  },
  MIRROR:    { label: 'MIRROR',   color: '#88ffdd', dur: 10 },
};

const ACHIEVEMENTS = {
  FIRST_COMBO:   { id: 'FIRST_COMBO',   name: 'COMBO KING',     desc: 'Reach a ×5 combo',       icon: '🔥' },
  NO_DAMAGE:     { id: 'NO_DAMAGE',     name: 'UNTOUCHABLE',    desc: 'Clear a level without losing a life', icon: '🛡️' },
  SPEED_RUN:     { id: 'SPEED_RUN',     name: 'SPEED DEMON',    desc: 'Clear a level in under 30s', icon: '⚡' },
  BOSS_SLAYER:   { id: 'BOSS_SLAYER',   name: 'BOSS SLAYER',    desc: 'Defeat your first boss',   icon: '⚔️' },
  POWER_HOARDER: { id: 'POWER_HOARDER', name: 'POWER HOARDER',  desc: 'Hold 3 power-ups at once', icon: '💎' },
  RELIC_MASTER:  { id: 'RELIC_MASTER',  name: 'RELIC HOARDER',  desc: 'Equip 4 relics in one run', icon: '👑' },
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
      case 'bounce':      this._tone(420, 'sine',     0.18, 0.07, t); break;
      case 'break':       this._noise(0.35, 0.07, t); this._tone(180, 'square', 0.2, 0.09, t); break;
      case 'powerup':     this._arp([523, 659, 784, 1047], 0.065, t); break;
      case 'lost':        this._tone(220, 'sawtooth', 0.45, 0.55, t, -110); break;
      case 'combo':       this._arp([784, 988, 1175], 0.05, t); break;
      case 'gameover':    this._tone(100, 'sawtooth', 0.5, 0.9, t, -40); break;
      case 'victory':     this._arp([523, 659, 784, 1047, 1319], 0.13, t); break;
      case 'explode':     this._noise(0.7, 0.25, t); this._tone(70, 'sawtooth', 0.5, 0.3, t, -50); break;
      case 'laser':       this._tone(600, 'square',   0.2, 0.12, t, -400); break;
      case 'boss_hit':    this._tone(80,  'sawtooth', 0.6, 0.18, t, -30); break;
      case 'boss_die':    this._noise(0.9, 0.6, t); this._arp([100,80,60,40], 0.12, t); break;
      case 'ult_charge':  this._tone(880, 'sine', 0.3, 0.25, t, 440); break;
      case 'ult_fire':    this._arp([440, 880, 1320, 1760], 0.08, t); this._noise(0.6, 0.4, t); break;
      case 'portal':      this._arp([1200, 900, 1500], 0.05, t); break;
      case 'lightning':   this._noise(0.4, 0.15, t); this._tone(900, 'sawtooth', 0.25, 0.1, t, -600); break;
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

// Falling Physics Debris Chunk
class DebrisChunk {
  constructor(x, y, w, h, color) {
    this.x = x; this.y = y; this.w = w; this.h = h; this.color = color;
    this.vx = (Math.random() - 0.5) * 180;
    this.vy = -(60 + Math.random() * 100);
    this.rot = 0; this.rotV = (Math.random() - 0.5) * 8;
    this.alive = true;
    this.life = 4.0;
  }
  update(dt, AW, AH) {
    this.vy += 650 * dt; // gravity
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.rot += this.rotV * dt;
    this.life -= dt;
    // Wall bounce
    if (this.x < 0 || this.x + this.w > AW) { this.vx = -this.vx * 0.7; }
    if (this.y > AH + 50 || this.life <= 0) this.alive = false;
  }
  render(ctx) {
    ctx.save();
    ctx.translate(this.x + this.w/2, this.y + this.h/2);
    ctx.rotate(this.rot);
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 8;
    ctx.fillRect(-this.w/2, -this.h/2, this.w, this.h);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(-this.w/2, -this.h/2, this.w, this.h);
    ctx.restore();
  }
}

// Lightning Arc
class LightningArc {
  constructor(x1, y1, x2, y2, color = '#00f5ff') {
    this.x1 = x1; this.y1 = y1; this.x2 = x2; this.y2 = y2;
    this.color = color; this.life = 0.18; this.maxLife = 0.18;
  }
  update(dt) { this.life -= dt; }
  render(ctx) {
    const a = this.life / this.maxLife;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 14;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(this.x1, this.y1);
    const midX = (this.x1 + this.x2) / 2 + (Math.random() - 0.5) * 30;
    const midY = (this.y1 + this.y2) / 2 + (Math.random() - 0.5) * 30;
    ctx.lineTo(midX, midY);
    ctx.lineTo(this.x2, this.y2);
    ctx.stroke();
    ctx.restore();
  }
  alive() { return this.life > 0; }
}

class ParticleSystem {
  constructor() { this.p = []; this.tp = []; this.debris = []; this.arcs = []; }

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

  addDebris(x, y, w, h, color) {
    this.debris.push(new DebrisChunk(x, y, w, h, color));
  }

  addArc(x1, y1, x2, y2, color) {
    this.arcs.push(new LightningArc(x1, y1, x2, y2, color));
  }

  update(dt, AW, AH) {
    this.p  = this.p.filter(p => { p.update(dt); return p.alive(); });
    this.tp = this.tp.filter(p => { p.update(dt); return p.alive(); });
    this.debris = this.debris.filter(d => { d.update(dt, AW, AH); return d.alive; });
    this.arcs = this.arcs.filter(a => { a.update(dt); return a.alive(); });
  }

  render(ctx) {
    this.p.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.shadowColor = p.color; ctx.shadowBlur = 6;
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
        ctx.arc(0, 0, Math.max(0.5, p.size * p.alpha), 0, Math.PI*2);
        ctx.fill();
      }
      ctx.restore();
    });

    this.debris.forEach(d => d.render(ctx));
    this.arcs.forEach(a => a.render(ctx));

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

  clear() { this.p = []; this.tp = []; this.debris = []; this.arcs = []; }
}

// ─── DYNAMIC ANOMALIES ────────────────────────────────────────
// Gravity Singularity Well
class GravityWell {
  constructor(x, y, strength = 18000, radius = 80) {
    this.x = x; this.y = y; this.strength = strength; this.radius = radius;
    this.rot = 0;
  }
  update(dt) { this.rot += dt * 3.5; }
  pull(ball, dt) {
    const dx = this.x - ball.x, dy = this.y - ball.y;
    const distSq = Math.max(dx*dx + dy*dy, 400);
    const dist = Math.sqrt(distSq);
    if (dist > this.radius * 2.5) return;
    const force = (this.strength / distSq) * dt;
    ball.vx += (dx / dist) * force;
    ball.vy += (dy / dist) * force;
  }
  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.shadowColor = '#cc44ff'; ctx.shadowBlur = 20;
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius);
    g.addColorStop(0, '#000000');
    g.addColorStop(0.4, 'rgba(200,68,255,0.4)');
    g.addColorStop(1, 'rgba(200,68,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(0, 0, this.radius, 0, Math.PI*2); ctx.fill();

    ctx.strokeStyle = '#cc44ff'; ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * (0.3 + i * 0.25), i, i + Math.PI);
      ctx.stroke();
    }
    ctx.restore();
  }
}

// Quantum Portal Pair (Blue & Orange)
class PortalPair {
  constructor(x1, y1, x2, y2, r = 22) {
    this.p1 = { x: x1, y: y1, color: '#00f5ff', cd: 0 };
    this.p2 = { x: x2, y: y2, color: '#ff6a00', cd: 0 };
    this.r = r; this.rot = 0;
  }
  update(dt) {
    this.rot += dt * 4;
    this.p1.cd = Math.max(0, this.p1.cd - dt);
    this.p2.cd = Math.max(0, this.p2.cd - dt);
  }
  warp(ball, audio, ps) {
    const check = (src, dst) => {
      if (src.cd > 0) return false;
      const dx = ball.x - src.x, dy = ball.y - src.y;
      if (dx*dx + dy*dy <= (this.r + ball.r)*(this.r + ball.r)) {
        ball.x = dst.x;
        ball.y = dst.y;
        src.cd = 0.6; dst.cd = 0.6;
        audio.play('portal');
        ps.emit(src.x, src.y, src.color, 16, { speed: 200, type: 'spark' });
        ps.emit(dst.x, dst.y, dst.color, 16, { speed: 200, type: 'spark' });
        return true;
      }
      return false;
    };
    check(this.p1, this.p2) || check(this.p2, this.p1);
  }
  render(ctx) {
    [this.p1, this.p2].forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(this.rot);
      ctx.shadowColor = p.color; ctx.shadowBlur = 18;
      ctx.strokeStyle = p.color; ctx.lineWidth = 3;
      ctx.setLineDash([8, 6]);
      ctx.beginPath(); ctx.arc(0, 0, this.r, 0, Math.PI*2); ctx.stroke();
      ctx.fillStyle = p.color + '33';
      ctx.beginPath(); ctx.arc(0, 0, this.r * 0.6, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    });
  }
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
    this.lavaBlobs = [];
    for (let i = 0; i < 12; i++) {
      this.lavaBlobs.push({
        x: Math.random() * W, y: H * 0.6 + Math.random() * H * 0.4,
        r: 20 + Math.random() * 60,
        spd: 12 + Math.random() * 18,
        phase: Math.random() * Math.PI * 2,
      });
    }
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

  resize(w, h) { this.canvas.width = w; this.canvas.height = h; this._initParticles(); }

  update(dt, mx, my) {
    this.time += dt; this.mx = mx; this.my = my;
    const H = this.canvas.height, W = this.canvas.width;
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
    this._grid(ctx, W, H, 'rgba(0,210,255,0.055)');
    this._stars(ctx, [185, 280]);
  }

  _renderLava() {
    const ctx = this.ctx, W = this.canvas.width, H = this.canvas.height;
    if (!W || !H) return;
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#0f0200'); bg.addColorStop(0.6, '#1a0400'); bg.addColorStop(1, '#2d0a00');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
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
    this.bubbles.forEach(b => {
      ctx.save();
      ctx.globalAlpha = 0.25; ctx.strokeStyle = '#00d4ff'; ctx.lineWidth = 1;
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
    this._stars(ctx, [280, 300]);
    this._grid(ctx, W, H, 'rgba(150,50,255,0.05)');
  }

  _renderGlitch() {
    const ctx = this.ctx, W = this.canvas.width, H = this.canvas.height;
    if (!W || !H) return;
    ctx.fillStyle = '#000800'; ctx.fillRect(0, 0, W, H);
    this._stars(ctx, [130, 60]);
    this._grid(ctx, W, H, 'rgba(0,255,50,0.07)');
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

  _stars(ctx, hues) {
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
}

// ─── TRAIL & FLASH & SHAKE ────────────────────────────────────
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

// ─── BRICK CLASS ──────────────────────────────────────────────
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
    this.ghost = (type === 'GHOST');
    this.ghostRevealed = false;
    this.enterDelay = enterDelay;
    this._targetY = y;
    this.y = y - 80 - enterDelay * 30;
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

    if (this.type === 'ARMORED') {
      const fillRatio = this.hp / this.maxHp;
      ctx.fillStyle = 'rgba(255,200,0,0.3)';
      this._rr(ctx, x+2, y+2, (this.w-4)*fillRatio, this.h-4, 3);
      ctx.fill();
    }

    if (['POWERUP','EXPLOSIVE','GHOST'].includes(this.type)) {
      ctx.shadowBlur = 8; ctx.shadowColor = this.color;
      ctx.fillStyle = '#fff';
      ctx.font = `bold 11px sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const icon = this.type === 'POWERUP' ? '★' : this.type === 'EXPLOSIVE' ? '✕' : '👻';
      ctx.fillText(icon, x + this.w/2, y + this.h/2);
    }
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

// ─── BOSS CLASS ───────────────────────────────────────────────
class Boss {
  constructor(x, y, w, h, world, maxHp = 20) {
    this.x = x; this.y = y; this.w = w; this.h = h;
    this.world = world;
    this.hp = maxHp; this.maxHp = maxHp;
    this.alive = true;
    this.phase = 1;
    this.t = 0;
    this.baseX = x;
    this.pulse = 0;
    this.shootT = 0;
    this.shootInterval = 3.2;
    this.projectiles = [];
    this.color = world.accent2;
    this.name = this._bossName();
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
    if (this.hpRatio < 0.25 && this.phase < 3) {
      this.phase = 3; this.shootInterval = 1.8;
    } else if (this.hpRatio < 0.5 && this.phase < 2) {
      this.phase = 2; this.shootInterval = 2.4;
    }
    return false;
  }

  update(dt, AW) {
    this.t += dt; this.pulse += dt * 2.5;
    if (this.entering) {
      const diff = this._targetY - this.y;
      this.y += diff * Math.min(1, dt * 6);
      if (Math.abs(diff) < 1) { this.y = this._targetY; this.entering = false; }
    }
    this.x = this.baseX + Math.sin(this.t * (this.phase === 3 ? 2.2 : 1.1)) * (AW * 0.35);
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
        x: this.x + this.w/2, y: this.y + this.h,
        vx: Math.cos(angle) * 200, vy: Math.sin(angle) * 200,
        r: 5, life: 5, color: this.color,
      });
    }
  }

  render(ctx) {
    const p = Math.sin(this.pulse) * 0.4 + 0.6;
    ctx.save();
    const g = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.h);
    g.addColorStop(0, this.color + 'dd');
    g.addColorStop(1, '#000');
    ctx.fillStyle = g;
    ctx.shadowColor = this.color; ctx.shadowBlur = 28 * p;
    this._rr(ctx, this.x, this.y, this.w, this.h, 8);
    ctx.fill();

    ctx.strokeStyle = this.color; ctx.lineWidth = 3;
    this._rr(ctx, this.x, this.y, this.w, this.h, 8); ctx.stroke();

    ctx.shadowBlur = 10; ctx.shadowColor = this.color;
    ctx.fillStyle = '#fff';
    ctx.font = `900 ${Math.max(10, this.w/10)}px Orbitron, monospace`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(this.name, this.x + this.w/2, this.y + this.h/2);

    this.projectiles.forEach(pr => {
      ctx.save();
      ctx.shadowColor = pr.color; ctx.shadowBlur = 14;
      ctx.fillStyle = pr.color;
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

// ─── POWER-UP & LASER ─────────────────────────────────────────
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
    ctx.fillStyle = '#fff'; ctx.font = `700 8px Orbitron, monospace`;
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

class Laser {
  constructor(x, y, color = '#ff3366') {
    this.x = x; this.y = y; this.vy = -620; this.alive = true; this.color = color;
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

// ─── MAIN ENGINE ──────────────────────────────────────────────
class BrickBreaker {
  constructor() {
    this.bgC   = document.getElementById('bgCanvas');
    this.gC    = document.getElementById('gameCanvas');
    this.prvC  = document.getElementById('previewCanvas');
    this.gCtx  = this.gC.getContext('2d');
    this.prvCtx= this.prvC ? this.prvC.getContext('2d') : null;

    this.audio = new AudioEngine();
    this.ps    = new ParticleSystem();
    this.trail = new Trail(CFG.TRAIL_LEN);
    this.shake = new Shake();
    this.bg    = new BgRenderer(this.bgC);

    // Novelty State
    this.hero = HEROES['CYBER_SAMURAI'];
    this.relics = []; // List of drafted relic IDs
    this.ultCharge = 0; // 0 to 100
    this.isUltActive = false;
    this.ultTimer = 0;
    this.ballHistory = []; // History buffer for Chrono Rewind

    // Superhot Bullet Time
    this.paddleLastX = 0;
    this.paddleSpeed = 0;
    this.timeScale = 1.0;

    // Anomalies
    this.wells = [];
    this.portals = null;

    // Game Core State
    this.state = 'start';
    this.score = 0;
    this.best  = parseInt(localStorage.getItem('bb_best') || '0');
    this.level = 1;
    this.lives = 3;
    this.combo = 0;
    this.bestCombo = 0;
    this.time  = 0;
    this.levelTime = 0;
    this.startLives = 3;

    // Entities
    this.ball = null; this.paddle = null;
    this.extras = []; this.pups = [];
    this.lasers = []; this.flashes = [];
    this.bricks = []; this.boss = null;
    this.aPU = {}; this.puT = {};
    this.gemHits = 0;
    this.laserCD = 0; this.stormT = 0;

    // Dimensions & Input
    this.AW = 720; this.AH = 640;
    this.mx = 0; this.my = 0; this.keys = {};
    this.prv = null; this._lastT = 0;

    this._init();
  }

  _init() {
    this.audio.init();
    this._resize();
    this._bindInput();
    this._bindButtons();
    this._updateStartBest();
    this._buildLevelSelect();
    this._initDemo();
    this._updateHeroDisplay();
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
  }

  _bindInput() {
    window.addEventListener('resize', () => this._resize());
    window.addEventListener('mousemove', e => {
      this.mx = e.clientX; this.my = e.clientY;
      this.bg.update(0, this.mx, this.my);
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
      if (e.code === 'KeyE') {
        this._activateHeroUlt();
      }
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        if (this.state === 'playing') {
          if (this.ball?.stuck) this._launch();
          else if (this.aPU['LASER'] || this.aPU['STORM']) this._fireLaser();
        } else if (this.state === 'start') {
          this._startGame();
        } else if (this.state === 'paused') {
          this._resume();
        } else if (this.state === 'gameover') {
          this.level = 1; this.relics = []; this._startGame();
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
    on('btn-hero-select',  () => this._showHeroSelect());
    on('btn-hero-back',    () => this._setState('start'));
    on('btn-level-select', () => this._showLevelSelect());
    on('btn-ls-back',      () => this._setState('start'));
    on('btn-pause',        () => this._pause());
    on('btn-resume',       () => this._resume());
    on('btn-menu',         () => this._goMenu());
    on('btn-menu2',        () => this._goMenu());
    on('btn-menu3',        () => this._goMenu());
    on('btn-restart',      () => { this.level = 1; this.relics = []; this._startGame(); });
    on('btn-draft-relic',  () => this._showRelicDraft());
    on('btn-ult',          () => this._activateHeroUlt());

    // Hero selection clicks
    document.querySelectorAll('.hero-card').forEach(card => {
      card.addEventListener('click', () => {
        const hKey = card.getAttribute('data-hero');
        if (HEROES[hKey]) {
          this.hero = HEROES[hKey];
          document.querySelectorAll('.hero-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          this._updateHeroDisplay();
          this._setState('start');
        }
      });
    });
  }

  _showHeroSelect() { this._setState('hero-select'); }

  _updateHeroDisplay() {
    this._set('start-hero-name', this.hero.name);
  }

  // ── HERO ULTIMATE SYSTEM ──────────────────────────────────────
  _addUltCharge(amt) {
    if (this.isUltActive) return;
    this.ultCharge = Math.min(100, this.ultCharge + amt);
    const fill = document.getElementById('hud-ult-fill');
    const btn = document.getElementById('btn-ult');
    if (fill) fill.style.width = this.ultCharge + '%';
    if (btn) {
      if (this.ultCharge >= 100) {
        btn.disabled = false;
        btn.classList.add('ready');
        this.audio.play('ult_charge');
      } else {
        btn.disabled = true;
        btn.classList.remove('ready');
      }
    }
  }

  _activateHeroUlt() {
    if (this.ultCharge < 100 || this.isUltActive) return;
    this.ultCharge = 0;
    this.isUltActive = true;
    this.audio.play('ult_fire');
    this.shake.add(0.6);
    const btn = document.getElementById('btn-ult');
    if (btn) { btn.disabled = true; btn.classList.remove('ready'); }
    const fill = document.getElementById('hud-ult-fill');
    if (fill) fill.style.width = '0%';

    // Hero specific ultimate logic
    if (this.hero.id === 'CHRONO_MAGE') {
      // Recall ball back to paddle safely
      if (this.ball) {
        this.ball.x = this.paddle.x + this.paddle.w/2;
        this.ball.y = this.paddle.y - CFG.BALL_R - 3;
        this.ball.vx = 0; this.ball.vy = 0; this.ball.stuck = true;
      }
      this.ps.addText(this.AW/2, this.AH/2, 'CHRONO REWIND!', '#00f5ff', 30);
      this.isUltActive = false;
    } else if (this.hero.id === 'CYBER_SAMURAI') {
      // 3 Massive vertical energy slices
      const xs = [this.paddle.x, this.paddle.x + this.paddle.w/2, this.paddle.x + this.paddle.w];
      xs.forEach(x => {
        this.flashes.push(new Flash(x, this.AH/2, '#ff00ff'));
        this.bricks.forEach(b => {
          if (!b.alive) return;
          if (Math.abs((b.x + b.w/2) - x) < 36) {
            b.hp = 0; b.alive = false;
            this.ps.burst(b.x, b.y, b.w, b.h, '#ff00ff');
            this._addScore(b.score);
          }
        });
      });
      if (this.boss && this.boss.alive) { this.boss.hp -= 8; this._updateBossBar(); }
      this.ps.addText(this.AW/2, this.AH/2, 'DIMENSIONAL SLASH!', '#ff00ff', 30);
      this._checkWin();
      this.isUltActive = false;
    } else if (this.hero.id === 'SIEGE_MECH') {
      // Hyper Cannon laser beam for 3.5s
      this.ultTimer = 3.5;
      this.ps.addText(this.AW/2, this.AH/2, 'HYPER CANNON!', '#ffd700', 30);
    }
  }

  // ── ROGUELIKE RELIC DRAFT ────────────────────────────────────
  _showRelicDraft() {
    this._setState('relic-draft');
    const container = document.getElementById('relic-cards-container');
    if (!container) return;
    container.innerHTML = '';

    // Pick 3 random available relics
    const unowned = RELICS.filter(r => !this.relics.includes(r.id));
    const pool = unowned.length >= 3 ? unowned : RELICS;
    const shuffled = [...pool].sort(() => 0.5 - Math.random()).slice(0, 3);

    shuffled.forEach(r => {
      const card = document.createElement('div');
      card.className = 'relic-card';
      card.style.setProperty('--rc-color', r.color);
      card.style.setProperty('--rc-glow', r.color + '44');
      card.style.setProperty('--rc-border', r.color);

      card.innerHTML = `
        <div class="relic-rarity">${r.rarity}</div>
        <div class="relic-icon">${r.icon}</div>
        <div class="relic-name">${r.name}</div>
        <div class="relic-desc">${r.desc}</div>
        <button class="btn-primary btn-draft-pick">CLAIM RELIC</button>
      `;

      card.addEventListener('click', () => {
        this.audio.resume();
        this.relics.push(r.id);
        this._updateRelicsBar();
        this.level++;
        this._transitionToNextLevel();
      });
      container.appendChild(card);
    });
  }

  _updateRelicsBar() {
    const list = document.getElementById('active-relics-list');
    if (!list) return;
    list.innerHTML = '';
    this.relics.forEach(id => {
      const r = RELICS.find(x => x.id === id);
      if (!r) return;
      const b = document.createElement('div');
      b.className = 'relic-badge';
      b.style.borderColor = r.color;
      b.style.color = r.color;
      b.innerHTML = `<span>${r.icon}</span> <span>${r.name}</span>`;
      list.appendChild(b);
    });
  }

  // ── GAME FLOW ────────────────────────────────────────────────
  _startGame() {
    this._resize();
    this.score = 0;
    this.combo = 0;
    this.bestCombo = 0;
    this.lives = 3;
    this.startLives = 3;
    this.aPU = {}; this.puT = {};
    this.gemHits = 0;
    this.time = 0; this.levelTime = 0;
    this.laserCD = 0; this.stormT = 0;
    this.ultCharge = 0; this.isUltActive = false;
    this.extras = []; this.pups = [];
    this.lasers = []; this.flashes = [];
    this.boss = null;
    this.ps.clear(); this.trail.clear();

    const world = getWorldForLevel(this.level);
    this._applyWorldTheme(world);
    this._set('hud-world-name', world.name);

    this._initPaddle();
    this._initBall();
    this._buildBricks();
    this._buildAnomalies();
    this._setState('playing');
    this._updateHUD();
    this._updatePUDisplay();
    this._updateBossBar();
    this._updateRelicsBar();
  }

  _initPaddle() {
    let pw = CFG.PADDLE_W;
    if (this.hero.id === 'SIEGE_MECH') pw *= 1.2; // Passive: 20% wider
    this.paddle = { x: this.AW/2 - pw/2, y: this.AH - 38, w: pw, h: CFG.PADDLE_H };
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
    const rows = Math.min(4 + Math.floor(this.level * 0.7), 10);
    const cols = CFG.COLS;
    const bW = (this.AW - CFG.BRICK_SIDE*2 - CFG.PAD*(cols-1)) / cols;
    const bH = Math.min(24, (this.AH * 0.48 - CFG.BRICK_TOP - CFG.PAD*(rows-1)) / rows);
    this.bricks = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const roll = Math.random();
        let type = 'NORMAL';
        if      (this.level >= 5 && roll < 0.08) type = 'ARMORED';
        else if (this.level >= 4 && roll < 0.08) type = 'GHOST';
        else if (this.level >= 3 && roll < 0.14) type = 'METAL';
        else if (this.level >= 2 && roll < 0.22) type = 'EXPLOSIVE';
        else if (this.level >= 1 && roll < 0.30) type = 'TOUGH';
        else if (roll < 0.38)                    type = 'POWERUP';

        const delay = r * 0.08;
        const b = new Brick(CFG.BRICK_SIDE + c * (bW + CFG.PAD), CFG.BRICK_TOP + r * (bH + CFG.PAD), bW, bH, type, (r + c + this.level) % BRICK_COLORS.length, delay);
        if (type === 'POWERUP') {
          const keys = Object.keys(PU);
          b.puType = keys[Math.floor(Math.random() * keys.length)];
        }
        this.bricks.push(b);
      }
    }

    if (isBossLevel(this.level)) {
      const world = getWorldForLevel(this.level);
      const bossW = Math.min(this.AW * 0.6, 320);
      const maxHp = 15 + this.level * 3;
      this.boss = new Boss(this.AW/2 - bossW/2, CFG.BRICK_TOP, bossW, 48, world, maxHp);
      // Aegis barrier relic hook
      if (this.relics.includes('AEGIS_BARRIER')) {
        this.aPU['SHIELD'] = true;
        this.puT['SHIELD'] = 20;
      }
    }
  }

  _buildAnomalies() {
    this.wells = [];
    this.portals = null;
    // Gravity Wells on world 2+ (Level 4+)
    if (this.level >= 4 && !isBossLevel(this.level)) {
      this.wells.push(new GravityWell(this.AW * 0.5, this.AH * 0.45));
    }
    // Portals on world 3+ (Level 7+)
    if (this.level >= 7) {
      this.portals = new PortalPair(this.AW * 0.18, this.AH * 0.55, this.AW * 0.82, this.AH * 0.55);
    }
  }

  _launch() {
    if (!this.ball || !this.ball.stuck) return;
    const spd = CFG.BALL_BASE_SPEED + (this.level - 1) * 20;
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

  _applyWorldTheme(world) {
    document.body.className = world.bodyClass || '';
    this.bg.setTheme(world.bgType, world.accent);
  }

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

  _setState(s) {
    this.state = s;
    document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
    const map = {
      start:        ['screen-start'],
      'hero-select':['screen-hero-select'],
      'relic-draft':['screen-relic-draft'],
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

  _calcStars() {
    let stars = 1;
    if (this.lives === this.startLives) stars++;
    if (this.levelTime < 45)           stars++;
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
      el.appendChild(s);
    }
  }

  _saveLevelProgress(level, stars) {
    const key = `bb_lvl_${level}`;
    const prev = parseInt(localStorage.getItem(key) || '0');
    if (stars > prev) localStorage.setItem(key, stars);
    if (this.score > this.best) {
      this.best = this.score;
      localStorage.setItem('bb_best', this.best);
    }
    const maxKey = 'bb_max_level';
    const curMax = parseInt(localStorage.getItem(maxKey) || '1');
    if (level + 1 > curMax) localStorage.setItem(maxKey, level + 1);
  }

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
    check('RELIC_MASTER',  this.relics.length >= 4);
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

  _buildLevelSelect() {
    const container = document.getElementById('worlds-container');
    if (!container) return;
    container.innerHTML = '';
    const maxLevel = parseInt(localStorage.getItem('bb_max_level') || '1');

    WORLDS.forEach(world => {
      const section = document.createElement('div');
      section.className = 'world-section';
      section.innerHTML = `
        <div class="world-header">
          <div class="world-badge" style="background:${world.accent};color:${world.accent}"></div>
          <div class="world-label" style="color:${world.accent}">${world.name}</div>
          <div class="world-divider"></div>
        </div>
      `;
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
          : `${isBoss ? '<div class="lc-boss-tag">BOSS</div>' : ''}<div class="lc-num">${String(lvl).padStart(2,'0')}</div><div class="lc-stars">${'⭐'.repeat(stars)}${'☆'.repeat(3-stars)}</div>`;
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
    if (type === 'GEMSTONE') this.gemHits = 5;
    this.aPU[type] = true;
    if (PU[type].dur) this.puT[type] = PU[type].dur;
    if (type === 'BIGPADDLE') this.paddle.w = Math.min(220, this.AW*0.35);
    this._updatePUDisplay();
  }

  _removePU(type) {
    delete this.aPU[type]; delete this.puT[type];
    if (type === 'BIGPADDLE' && this.paddle) {
      this.paddle.w = this.hero.id === 'SIEGE_MECH' ? CFG.PADDLE_W * 1.2 : CFG.PADDLE_W;
    }
    this._updatePUDisplay();
  }

  _updatePUDisplay() {
    const d = document.getElementById('powerups-hud');
    if (!d) return;
    d.innerHTML = '';
    Object.keys(this.aPU).forEach(t => {
      const info = PU[t];
      const el = document.createElement('div');
      el.className = 'powerup-pill';
      el.style.cssText = `border-color:${info.color};color:${info.color};`;
      el.textContent = info.label + (this.puT[t] ? ` ${Math.ceil(this.puT[t])}s` : '');
      d.appendChild(el);
    });
  }

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
    if (fill) fill.style.width = pct;
  }

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
    // Bullet-time fill indicator
    const btFill = document.getElementById('bt-fill');
    if (btFill) btFill.style.width = Math.round(this.timeScale * 100) + '%';
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
    const kineticBonus = this.relics.includes('KINETIC_BLADE') ? 1.15 : 1.0;
    const pts = Math.round(base * this._comboMult() * gemBonus * kineticBonus * (this.aPU['SLOWMO'] ? 2 : 1));
    this.score += pts;
    if (this.score > this.best) {
      this.best = this.score;
      localStorage.setItem('bb_best', this.best);
    }
    this._addUltCharge(2.5); // Add charge on brick break
    if (this.gemHits > 0) { this.gemHits--; this._updatePUDisplay(); }
    return pts;
  }

  _incrCombo() {
    this.combo++;
    if (this.combo > this.bestCombo) this.bestCombo = this.combo;
    if (this.combo >= 3 && this.combo % 3 === 0) {
      this.audio.play('combo');
      this._showCombo();
    }
    // Relic hook: OVERCHARGE (every 10-combo fires shockwave)
    if (this.relics.includes('OVERCHARGE') && this.combo % 10 === 0) {
      this.audio.play('lightning');
      this.shake.add(0.4);
      this.flashes.push(new Flash(this.AW/2, this.AH*0.4, '#ffe600'));
      this.bricks.forEach(b => {
        if (!b.alive) return;
        if (Math.abs(b.y - this.AH*0.4) < 60) {
          b.hit();
          this.ps.burst(b.x, b.y, b.w, b.h, '#ffe600');
        }
      });
    }
  }

  _showCombo() {
    const d = document.getElementById('combo-popup');
    if (!d) return;
    d.innerHTML = '';
    const el = document.createElement('div');
    el.className = 'combo-text';
    el.textContent = `×${this.combo} COMBO!`;
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

  // ── MAIN LOOP ────────────────────────────────────────────────
  _loop(t) {
    requestAnimationFrame(ts => this._loop(ts));
    const rawDt = Math.min((t - this._lastT) / 1000, 0.05);
    this._lastT = t;
    this.time += rawDt;

    // "SUPERHOT" Time Dilation Calculation
    if (this.paddle && this.state === 'playing') {
      const pSpeed = Math.abs(this.paddle.x - this.paddleLastX) / Math.max(rawDt, 0.001);
      this.paddleLastX = this.paddle.x;
      const minScale = this.hero.id === 'CHRONO_MAGE' ? 0.05 : 0.10;
      const targetScale = Math.min(1.0, Math.max(minScale, (pSpeed / 350)));
      this.timeScale += (targetScale - this.timeScale) * 0.25;
    } else {
      this.timeScale = 1.0;
    }

    const dt = rawDt * this.timeScale;

    this.bg.update(rawDt, this.mx, this.my);
    this.bg.render();

    if (this.state === 'playing') this._update(dt, rawDt);
    if (this.state === 'start')   this._runDemo(rawDt);

    this._render();
  }

  // ── UPDATE ───────────────────────────────────────────────────
  _update(dt, rawDt) {
    const slow = this.aPU['SLOWMO'] ? 0.45 : 1;
    const sdt  = dt * slow;
    this.levelTime += rawDt;

    this.shake.update(rawDt);
    this.laserCD = Math.max(0, this.laserCD - sdt);

    // Hero Ult Timer (Siege Mech Cannon)
    if (this.isUltActive && this.hero.id === 'SIEGE_MECH') {
      this.ultTimer -= rawDt;
      this.shake.add(0.2);
      this.bricks.forEach(b => {
        if (!b.alive) return;
        if (Math.abs((b.x + b.w/2) - (this.paddle.x + this.paddle.w/2)) < 50) {
          b.hp = 0; b.alive = false;
          this.ps.burst(b.x, b.y, b.w, b.h, '#ffd700');
          this._addScore(b.score);
        }
      });
      if (this.boss && this.boss.alive) { this.boss.hp -= 0.15; this._updateBossBar(); }
      this._checkWin();
      if (this.ultTimer <= 0) this.isUltActive = false;
    }

    // Power-up timers
    Object.keys(this.puT).forEach(t => {
      this.puT[t] -= sdt;
      if (this.puT[t] <= 0) this._removePU(t);
    });
    this._updatePUDisplay();

    // STORM auto-fire
    if (this.aPU['STORM']) {
      this.stormT -= sdt;
      if (this.stormT <= 0) { this.stormT = 0.22; this._fireLaser(); }
    }

    // Keyboard paddle
    const pSpeed = this.hero.id === 'CYBER_SAMURAI' ? 700 : 560;
    if (this.keys['ArrowLeft']  || this.keys['KeyA']) this.paddle.x -= pSpeed * rawDt;
    if (this.keys['ArrowRight'] || this.keys['KeyD']) this.paddle.x += pSpeed * rawDt;
    this._clampP();

    // Anomalies
    this.wells.forEach(w => {
      w.update(sdt);
      if (this.ball && !this.ball.stuck) w.pull(this.ball, sdt);
    });
    if (this.portals) {
      this.portals.update(sdt);
      if (this.ball && !this.ball.stuck) this.portals.warp(this.ball, this.audio, this.ps);
    }

    // Relic Singularity Pull
    if (this.relics.includes('SINGULARITY') && this.ball && !this.ball.stuck) {
      this.ps.debris.forEach(d => {
        const dx = this.ball.x - d.x, dy = this.ball.y - d.y;
        d.vx += (dx / 40) * sdt;
        d.vy += (dy / 40) * sdt;
      });
    }

    // Main ball movement
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
      if (this._rectOverlap(p.bounds, { x: this.paddle.x, y: this.paddle.y, w: this.paddle.w, h: this.paddle.h })) {
        this._applyPU(p.type);
        this.ps.addText(p.x, p.y, PU[p.type].label, PU[p.type].color, 20);
        this.audio.play('powerup');
        return false;
      }
      return true;
    });

    // Boss
    if (this.boss && this.boss.alive) {
      this.boss.update(sdt, this.AW);
      this._updateBossBar();
      this.boss.projectiles.forEach(pr => {
        if (!this.aPU['SHIELD'] && this._circleRect({ x: pr.x, y: pr.y, r: pr.r }, { x: this.paddle.x, y: this.paddle.y, w: this.paddle.w, h: this.paddle.h })) {
          pr.life = -1;
          this._ballLost(this.ball);
        }
      });
    } else if (this.boss && !this.boss.alive && !this.boss._dieHandled) {
      this.boss._dieHandled = true;
      this.audio.play('boss_die');
      this.shake.add(1.0);
      this._addScore(5000);
      this._checkWin();
    }

    // Flashes & Bricks & Particles
    this.flashes.forEach(f => f.update(rawDt));
    this.flashes = this.flashes.filter(f => f.alive());
    this.bricks.forEach(b => b.update(rawDt));
    this.ps.update(rawDt, this.AW, this.AH);

    this._updateHUD();
  }

  _moveBall(ball, dt) {
    if (ball.stuck) return;
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;

    const grav = this.aPU['GRAVITY'] ? -1 : 1;

    // Walls
    if (ball.x - ball.r < 0) { ball.x = ball.r; ball.vx = Math.abs(ball.vx); this.audio.play('bounce'); }
    if (ball.x + ball.r > this.AW) { ball.x = this.AW - ball.r; ball.vx = -Math.abs(ball.vx); this.audio.play('bounce'); }
    if (ball.y - ball.r < 0) { ball.y = ball.r; ball.vy = Math.abs(ball.vy); this.audio.play('bounce'); }

    // Floor / Shield
    if (ball.y - ball.r > this.AH) {
      if (this.aPU['SHIELD']) {
        ball.vy = -Math.abs(ball.vy); ball.y = this.AH - ball.r;
        this.flashes.push(new Flash(ball.x, this.AH, '#ffd700')); this.audio.play('bounce');
      } else {
        ball._lost = true; return;
      }
    }

    // Paddle Deflection
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
      this._addUltCharge(1.5); // Add charge on paddle bounce
    }

    this._ballBricks(ball);

    // Ball vs Boss
    if (this.boss && this.boss.alive && !this.boss.entering) {
      if (this._circleRect(ball, { x: this.boss.x, y: this.boss.y, w: this.boss.w, h: this.boss.h })) {
        ball.vy = -ball.vy;
        this.boss.hit();
        this.audio.play('boss_hit');
        this.shake.add(0.2);
        this._updateBossBar();
        this._incrCombo();
      }
    }
  }

  _ballBricks(ball) {
    for (let i = 0; i < this.bricks.length; i++) {
      const b = this.bricks[i];
      if (!b.alive) continue;
      const nearX = Math.max(b.x, Math.min(ball.x, b.x + b.w));
      const nearY = Math.max(b.y, Math.min(ball.y, b.y + b.h));
      const dx = ball.x - nearX, dy = ball.y - nearY;
      if (dx*dx + dy*dy > ball.r * ball.r) continue;

      const fireball = this.aPU['FIREBALL'];
      const phaseShift = this.relics.includes('PHASE_SHIFT');

      if (!b.indestructible && !fireball) {
        const ox = ball.x < b.x + b.w/2 ? b.x - ball.x - ball.r : b.x + b.w - ball.x + ball.r;
        const oy = ball.y < b.y + b.h/2 ? b.y - ball.y - ball.r : b.y + b.h - ball.y + ball.r;
        if (Math.abs(ox) < Math.abs(oy)) ball.vx = -ball.vx;
        else ball.vy = -ball.vy;
      } else if (b.indestructible && phaseShift) {
        b.indestructible = false; // Phase shift damages metal bricks
      }

      const destroyed = fireball ? (() => { b.hp = 0; b.alive = false; return true; })() : b.hit();
      const cx = b.x + b.w/2, cy = b.y + b.h/2;
      this.flashes.push(new Flash(cx, cy, b.color));
      if (!b.indestructible) this.audio.play(fireball ? 'fireball' : 'break');

      // Relic: TESLA COIL chain lightning
      if (this.relics.includes('TESLA_ARC')) {
        let chainCount = 0;
        this.bricks.forEach(nb => {
          if (nb.alive && nb !== b && chainCount < 3) {
            const ndx = (nb.x+nb.w/2) - cx, ndy = (nb.y+nb.h/2) - cy;
            if (ndx*ndx + ndy*ndy < 160*160) {
              nb.hit();
              this.ps.addArc(cx, cy, nb.x+nb.w/2, nb.y+nb.h/2, '#00f5ff');
              chainCount++;
            }
          }
        });
      }

      if (destroyed) {
        this.ps.burst(b.x, b.y, b.w, b.h, b.color);
        // Physics debris drop for heavy/armored bricks
        if (b.type === 'ARMORED' || b.type === 'TOUGH') {
          this.ps.addDebris(b.x, b.y, b.w/2, b.h/2, b.color);
        }
        // Relic: CLUSTER BOMB
        if (this.relics.includes('CLUSTER_BOMB')) {
          this.ps.emit(cx, cy, '#ff2244', 3, { speed: 200, type: 'shard' });
        }
        // Relic: HOMING MISSILES
        if (this.relics.includes('HOMING_MISSILES')) {
          this.lasers.push(new Laser(this.paddle.x, this.paddle.y, '#00ff88'));
          this.lasers.push(new Laser(this.paddle.x + this.paddle.w, this.paddle.y, '#00ff88'));
        }

        const pts = this._addScore(b.score);
        this.ps.addText(cx, cy, '+' + pts, b.color, 20);
        this._incrCombo();
        this.shake.add(b.type === 'EXPLOSIVE' ? 0.38 : 0.14);

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
    const R = this.relics.includes('DETONATION_CORE') ? 180 : 110;
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
    this._checkWin();
  }

  _laserBricks() {
    this.lasers.forEach(l => {
      if (!l.alive) return;
      if (this.boss && this.boss.alive) {
        if (l.x > this.boss.x && l.x < this.boss.x+this.boss.w && l.y > this.boss.y && l.y < this.boss.y+this.boss.h) {
          this.boss.hit(); this._updateBossBar();
          l.alive = false; return;
        }
      }
      this.bricks.forEach(b => {
        if (!b.alive || b.indestructible) return;
        if (l.x > b.x && l.x < b.x+b.w && l.y > b.y && l.y < b.y+b.h) {
          b.hit(); this.ps.burst(b.x,b.y,b.w,b.h,b.color); this._addScore(b.score); this._checkWin();
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
    this._setState('victory');
  }

  _circleRect(ball, r) {
    const nx = Math.max(r.x, Math.min(ball.x, r.x+r.w));
    const ny = Math.max(r.y, Math.min(ball.y, r.y+r.h));
    const dx = ball.x - nx, dy = ball.y - ny;
    return dx*dx + dy*dy <= ball.r*ball.r;
  }

  _rectOverlap(a, b) {
    return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
  }

  // ── RENDER ───────────────────────────────────────────────────
  _render() {
    if (this.state === 'start') return;
    const ctx = this.gCtx, W = this.AW, H = this.AH;
    ctx.save();
    this.shake.apply(ctx);

    ctx.fillStyle = 'rgba(4,0,12,0.92)';
    ctx.fillRect(-16, -16, W+32, H+32);

    const world = getWorldForLevel(this.level);

    // Anomalies
    this.wells.forEach(w => w.render(ctx));
    if (this.portals) this.portals.render(ctx);

    // Entities
    this.bricks.forEach(b => b.render(ctx));
    if (this.boss && this.boss.alive) this.boss.render(ctx);
    this.pups.forEach(p => p.render(ctx));
    this.lasers.forEach(l => l.render(ctx));
    this.flashes.forEach(f => f.render(ctx));

    // Hyper Cannon Beam Rendering
    if (this.isUltActive && this.hero.id === 'SIEGE_MECH') {
      ctx.save();
      const px = this.paddle.x + this.paddle.w/2;
      ctx.shadowColor = '#ffd700'; ctx.shadowBlur = 40;
      ctx.fillStyle = 'rgba(255,215,0,0.85)';
      ctx.fillRect(px - 36, 0, 72, this.paddle.y);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px - 14, 0, 28, this.paddle.y);
      ctx.restore();
    }

    // Trails & Balls
    this.trail.render(ctx, CFG.BALL_R, world.accent);
    this.extras.forEach(b => b.trail.render(ctx, b.r, world.accent2 || '#ff44cc'));

    if (this.ball?.stuck) this._drawLaunchGuide(ctx, world);
    if (this.ball) this._drawBall(ctx, this.ball, world.accent, this.aPU['FIREBALL']);
    this.extras.forEach(b => this._drawBall(ctx, b, world.accent2 || '#ff44cc', false));

    // Paddle & Shield
    this._drawPaddle(ctx, world);

    if (this.aPU['SHIELD']) {
      ctx.save();
      ctx.strokeStyle = '#ffd700'; ctx.shadowColor = '#ffd700'; ctx.shadowBlur = 12;
      ctx.lineWidth = 3; ctx.setLineDash([12, 8]);
      ctx.beginPath(); ctx.moveTo(0, H - 3); ctx.lineTo(W, H - 3); ctx.stroke();
      ctx.restore();
    }

    this.ps.render(ctx);
    ctx.restore();
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
    ctx.restore();
  }

  _drawPaddle(ctx, world) {
    const p = this.paddle; if (!p) return;
    const isLaser = this.aPU['LASER'] || this.aPU['STORM'];
    const col = isLaser ? '#ff3366' : this.hero.color || world.accent;
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
    ctx.restore();
  }

  _initDemo() {
    if (!this.prvC) return;
    const W = this.prvC.width || window.innerWidth, H = this.prvC.height || window.innerHeight;
    const dBricks = [];
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 10; c++) {
        dBricks.push({
          x: W*0.2 + c*((W*0.6)/10 + 4), y: H*0.15 + r*20,
          w: (W*0.6)/10, h: 16, color: BRICK_COLORS[(r+c)%BRICK_COLORS.length], alive: true,
        });
      }
    }
    this.prv = { ball: { x: W/2, y: H*0.65, vx: 180, vy: -220, r: 7 }, bricks: dBricks, W, H };
  }

  _runDemo(dt) {
    if (!this.prvC || !this.prv) return;
    const prv = this.prv, ctx = this.prvCtx, b = prv.ball;
    b.x += b.vx * dt; b.y += b.vy * dt;
    if (b.x < b.r || b.x > prv.W - b.r) b.vx = -b.vx;
    if (b.y < b.r) b.vy = -b.vy;
    if (b.y > prv.H + 20) { b.y = prv.H * 0.6; b.x = prv.W/2; b.vx = 160; b.vy = -200; }
    ctx.clearRect(0, 0, prv.W, prv.H);
    prv.bricks.forEach(br => {
      if (!br.alive) return;
      ctx.fillStyle = br.color + '44'; ctx.fillRect(br.x, br.y, br.w, br.h);
    });
    ctx.fillStyle = '#00f5ff'; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI*2); ctx.fill();
  }
}

window.addEventListener('load', () => new BrickBreaker());
