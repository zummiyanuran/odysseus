/* ==========================================================================
   Zen Sanctuary - 60 FPS Canvas Physics Engine
   ========================================================================== */

class ZenPhysicsEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    this.dpr = window.devicePixelRatio || 1;

    this.mode = 'fluid'; // 'fluid', 'bubbles', 'crystal', 'pond'
    this.theme = 'aurora';
    this.speedMultiplier = 1.0;

    this.mouse = {
      x: -1000,
      y: -1000,
      isDown: false,
      px: -1000,
      py: -1000,
      vx: 0,
      vy: 0
    };

    // Mode-specific Data Structures
    this.particles = [];
    this.bubbles = [];
    this.crystals = [];
    this.shards = [];
    this.ripples = [];
    this.kois = [];
    this.lotuses = [];

    this.themeColors = {
      aurora: ['#6366f1', '#ec4899', '#38bdf8', '#a855f7', '#818cf8'],
      sakura: ['#f43f5e', '#fb7185', '#fbbf24', '#f472b6', '#fda4af'],
      cyber:  ['#06b6d4', '#a855f7', '#10b981', '#3b82f6', '#f43f5e'],
      ocean:  ['#0284c7', '#06b6d4', '#6366f1', '#38bdf8', '#60a5fa'],
      emerald:['#10b981', '#34d399', '#84cc16', '#059669', '#a3e635']
    };

    this.running = false;
    this.init();
  }

  init() {
    this.resize();
    this.setupMode(this.mode);
  }

  resize() {
    this.dpr = window.devicePixelRatio || 1;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.scale(this.dpr, this.dpr);

    // Re-initialize mode objects on resize
    this.setupMode(this.mode);
  }

  setMode(newMode) {
    this.mode = newMode;
    this.setupMode(newMode);
  }

  setTheme(newTheme) {
    this.theme = newTheme;
  }

  setSpeed(speedVal) {
    this.speedMultiplier = speedVal; // 0.5, 1.0, 1.5
  }

  setupMode(mode) {
    this.particles = [];
    this.bubbles = [];
    this.crystals = [];
    this.shards = [];
    this.ripples = [];
    this.kois = [];
    this.lotuses = [];

    if (mode === 'bubbles') {
      this.initBubbles();
    } else if (mode === 'crystal') {
      this.initCrystals();
    } else if (mode === 'pond') {
      this.initPond();
    }
  }

  /* --------------------------------------------------------------------------
     MODE 1: FLUID NEON GALAXY
     -------------------------------------------------------------------------- */
  updateFluid() {
    // Spawn particles on mouse drag or move
    if (this.mouse.x > 0 && this.mouse.y > 0) {
      const speed = Math.hypot(this.mouse.vx, this.mouse.vy);
      const count = this.mouse.isDown ? 8 : (speed > 2 ? 3 : 1);

      for (let i = 0; i < count; i++) {
        const colors = this.themeColors[this.theme];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const angle = Math.random() * Math.PI * 2;
        const velocity = (Math.random() * 2 + 1) * this.speedMultiplier;

        this.particles.push({
          x: this.mouse.x + (Math.random() - 0.5) * 20,
          y: this.mouse.y + (Math.random() - 0.5) * 20,
          vx: Math.cos(angle) * velocity + this.mouse.vx * 0.2,
          vy: Math.sin(angle) * velocity + this.mouse.vy * 0.2,
          radius: Math.random() * 12 + 6,
          color: color,
          alpha: 1,
          decay: Math.random() * 0.015 + 0.008,
          spin: Math.random() * 0.1 - 0.05
        });
      }
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * this.speedMultiplier;
      p.y += p.vy * this.speedMultiplier;
      p.vx *= 0.96;
      p.vy *= 0.96;
      p.alpha -= p.decay;
      p.radius *= 0.98;

      if (p.alpha <= 0 || p.radius < 0.5) {
        this.particles.splice(i, 1);
      }
    }
  }

  drawFluid() {
    this.ctx.fillStyle = 'rgba(7, 10, 18, 0.2)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.globalCompositeOperation = 'lighter';
    this.particles.forEach(p => {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.alpha;
      this.ctx.shadowColor = p.color;
      this.ctx.shadowBlur = 20;
      this.ctx.fill();
      this.ctx.restore();
    });
    this.ctx.globalCompositeOperation = 'source-over';
  }

  /* --------------------------------------------------------------------------
     MODE 2: BUBBLE POP ASMR
     -------------------------------------------------------------------------- */
  initBubbles() {
    this.bubbles = [];
    const size = Math.min(this.width, this.height) > 600 ? 70 : 54;
    const cols = Math.floor((this.width - 40) / size);
    const rows = Math.floor((this.height - 100) / size);
    const offsetX = (this.width - cols * size) / 2 + size / 2;
    const offsetY = (this.height - rows * size) / 2 + size / 2 + 30;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const colors = this.themeColors[this.theme];
        const color = colors[(r + c) % colors.length];

        this.bubbles.push({
          x: offsetX + c * size,
          y: offsetY + r * size,
          baseRadius: size * 0.42,
          radius: size * 0.42,
          color: color,
          popped: false,
          squish: 1,
          respawnTimer: 0
        });
      }
    }
  }

  updateBubbles() {
    this.bubbles.forEach(b => {
      if (b.popped) {
        if (b.respawnTimer > 0) {
          b.respawnTimer--;
          if (b.respawnTimer <= 0) {
            b.popped = false;
            b.radius = 0; // Grow back smoothly
          }
        }
        return;
      }

      // Smooth regrowth
      if (b.radius < b.baseRadius) {
        b.radius += (b.baseRadius - b.radius) * 0.1;
      }

      // Hover squish effect
      const dist = Math.hypot(this.mouse.x - b.x, this.mouse.y - b.y);
      if (dist < b.baseRadius) {
        b.squish = 1.15;
        // Pop on click or hover drag
        if (this.mouse.isDown || dist < b.baseRadius * 0.5) {
          this.popBubble(b);
        }
      } else {
        b.squish += (1 - b.squish) * 0.1;
      }
    });

    // Update popped particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15; // Gravity
      p.alpha -= 0.02;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  popBubble(b) {
    if (b.popped) return;
    b.popped = true;
    b.respawnTimer = 240; // Respawn after ~4 seconds

    if (window.zenAudio) {
      window.zenAudio.playPop(0.8 + Math.random() * 0.5);
    }

    // Spawn popping rainbow fragments
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 / 12) * i + Math.random() * 0.2;
      const speed = Math.random() * 5 + 2;
      this.particles.push({
        x: b.x,
        y: b.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 4 + 2,
        color: b.color,
        alpha: 1
      });
    }
  }

  drawBubbles() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.bubbles.forEach(b => {
      if (b.popped) return;

      this.ctx.save();
      this.ctx.translate(b.x, b.y);
      this.ctx.scale(b.squish, b.squish);

      // Bubble Outer Glow
      const grad = this.ctx.createRadialGradient(
        -b.radius * 0.3, -b.radius * 0.3, b.radius * 0.1,
        0, 0, b.radius
      );
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.4, b.color);
      grad.addColorStop(1, 'rgba(15, 23, 42, 0.8)');

      this.ctx.beginPath();
      this.ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = grad;
      this.ctx.shadowColor = b.color;
      this.ctx.shadowBlur = 15;
      this.ctx.fill();

      // Specular highlight arc
      this.ctx.beginPath();
      this.ctx.arc(-b.radius * 0.35, -b.radius * 0.35, b.radius * 0.3, 0, Math.PI * 2);
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      this.ctx.fill();

      this.ctx.restore();
    });

    // Draw pop particles
    this.particles.forEach(p => {
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fill();
    });
    this.ctx.globalAlpha = 1.0;
  }

  /* --------------------------------------------------------------------------
     MODE 3: CRYSTAL GLASS CHIMES
     -------------------------------------------------------------------------- */
  initCrystals() {
    this.crystals = [];
    this.shards = [];
    for (let i = 0; i < 8; i++) {
      this.spawnCrystal();
    }
  }

  spawnCrystal() {
    const colors = this.themeColors[this.theme];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const radius = Math.random() * 35 + 30;

    this.crystals.push({
      x: Math.random() * (this.width - 160) + 80,
      y: Math.random() * (this.height - 200) + 100,
      radius: radius,
      color: color,
      sides: Math.floor(Math.random() * 3) + 5, // 5 to 7 sides
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.01,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      alpha: 0
    });
  }

  updateCrystals() {
    this.crystals.forEach(c => {
      c.x += c.vx * this.speedMultiplier;
      c.y += c.vy * this.speedMultiplier;
      c.rotation += c.vRot;

      if (c.alpha < 1) c.alpha += 0.02;

      // Bounce off screen boundaries
      if (c.x < c.radius || c.x > this.width - c.radius) c.vx *= -1;
      if (c.y < c.radius + 60 || c.y > this.height - c.radius - 40) c.vy *= -1;

      // Check click or hover tap
      const dist = Math.hypot(this.mouse.x - c.x, this.mouse.y - c.y);
      if (dist < c.radius && this.mouse.isDown) {
        this.shatterCrystal(c);
      }
    });

    // Update shards
    for (let i = this.shards.length - 1; i >= 0; i--) {
      const s = this.shards[i];
      s.x += s.vx * this.speedMultiplier;
      s.y += s.vy * this.speedMultiplier;
      s.rotation += s.vRot;
      s.alpha -= 0.015;

      if (s.alpha <= 0) {
        this.shards.splice(i, 1);
      }
    }
  }

  shatterCrystal(c) {
    const idx = this.crystals.indexOf(c);
    if (idx === -1) return;

    this.crystals.splice(idx, 1);

    if (window.zenAudio) {
      window.zenAudio.playGlassShatter(400 + (c.radius / 65) * 600);
    }

    // Spawn 16 shards
    for (let i = 0; i < 16; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 2;
      this.shards.push({
        x: c.x,
        y: c.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 14 + 6,
        color: c.color,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
        alpha: 1
      });
    }

    // Spawn replacement crystal
    setTimeout(() => this.spawnCrystal(), 1200);
  }

  drawCrystals() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw Prisms
    this.crystals.forEach(c => {
      this.ctx.save();
      this.ctx.translate(c.x, c.y);
      this.ctx.rotate(c.rotation);
      this.ctx.globalAlpha = c.alpha;

      this.ctx.beginPath();
      for (let i = 0; i < c.sides; i++) {
        const a = (Math.PI * 2 / c.sides) * i;
        const px = Math.cos(a) * c.radius;
        const py = Math.sin(a) * c.radius;
        if (i === 0) this.ctx.moveTo(px, py);
        else this.ctx.lineTo(px, py);
      }
      this.ctx.closePath();

      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      this.ctx.strokeStyle = c.color;
      this.ctx.lineWidth = 2;
      this.ctx.shadowColor = c.color;
      this.ctx.shadowBlur = 20;
      this.ctx.fill();
      this.ctx.stroke();

      // Inner polygon facet
      this.ctx.beginPath();
      for (let i = 0; i < c.sides; i++) {
        const a = (Math.PI * 2 / c.sides) * i;
        const px = Math.cos(a) * c.radius * 0.5;
        const py = Math.sin(a) * c.radius * 0.5;
        if (i === 0) this.ctx.moveTo(px, py);
        else this.ctx.lineTo(px, py);
      }
      this.ctx.closePath();
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      this.ctx.stroke();

      this.ctx.restore();
    });

    // Draw Shards
    this.shards.forEach(s => {
      this.ctx.save();
      this.ctx.translate(s.x, s.y);
      this.ctx.rotate(s.rotation);
      this.ctx.globalAlpha = s.alpha;

      this.ctx.beginPath();
      this.ctx.moveTo(0, -s.size);
      this.ctx.lineTo(s.size * 0.6, s.size * 0.6);
      this.ctx.lineTo(-s.size * 0.6, s.size * 0.6);
      this.ctx.closePath();

      this.ctx.fillStyle = s.color;
      this.ctx.shadowColor = s.color;
      this.ctx.shadowBlur = 10;
      this.ctx.fill();

      this.ctx.restore();
    });
    this.ctx.globalAlpha = 1.0;
  }

  /* --------------------------------------------------------------------------
     MODE 4: ZEN WATER POND & KOI FISH
     -------------------------------------------------------------------------- */
  initPond() {
    this.ripples = [];
    this.kois = [];
    this.lotuses = [];

    // Create 4 Koi Fish
    for (let i = 0; i < 4; i++) {
      this.kois.push({
        x: Math.random() * (this.width - 200) + 100,
        y: Math.random() * (this.height - 200) + 100,
        angle: Math.random() * Math.PI * 2,
        speed: 1.2 + Math.random() * 0.8,
        color: i % 2 === 0 ? '#f97316' : '#f43f5e',
        secondaryColor: '#ffffff',
        tailAngle: 0,
        tailSpeed: 0.15 + Math.random() * 0.05
      });
    }

    // Create 3 Lotus flowers
    for (let i = 0; i < 3; i++) {
      this.lotuses.push({
        x: Math.random() * (this.width - 200) + 100,
        y: Math.random() * (this.height - 200) + 100,
        radius: 35 + Math.random() * 15,
        rotation: Math.random() * Math.PI * 2
      });
    }
  }

  triggerRipple(x, y) {
    this.ripples.push({
      x: x,
      y: y,
      radius: 4,
      maxRadius: Math.random() * 80 + 60,
      alpha: 0.8
    });

    if (window.zenAudio) {
      window.zenAudio.playSplash();
    }
  }

  updatePond() {
    // Mouse click ripple trigger
    if (this.mouse.isDown && Math.random() < 0.2) {
      this.triggerRipple(this.mouse.x, this.mouse.y);
    }

    // Update Ripples
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const r = this.ripples[i];
      r.radius += 1.5 * this.speedMultiplier;
      r.alpha -= 0.012;

      if (r.alpha <= 0 || r.radius >= r.maxRadius) {
        this.ripples.splice(i, 1);
      }
    }

    // Update Koi Fish Steering
    this.kois.forEach(k => {
      k.tailAngle += k.tailSpeed;

      // React to ripples / mouse avoidance
      const distMouse = Math.hypot(this.mouse.x - k.x, this.mouse.y - k.y);
      if (distMouse < 140) {
        const avoidAngle = Math.atan2(k.y - this.mouse.y, k.x - this.mouse.x);
        k.angle += (avoidAngle - k.angle) * 0.1;
      } else {
        // Wandering noise
        k.angle += (Math.random() - 0.5) * 0.08;
      }

      k.x += Math.cos(k.angle) * k.speed * this.speedMultiplier;
      k.y += Math.sin(k.angle) * k.speed * this.speedMultiplier;

      // Soft boundary turn
      if (k.x < 100 || k.x > this.width - 100 || k.y < 100 || k.y > this.height - 100) {
        k.angle += 0.1;
      }
    });
  }

  drawPond() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw Water Ripples
    this.ripples.forEach(r => {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      this.ctx.strokeStyle = `rgba(56, 189, 248, ${r.alpha})`;
      this.ctx.lineWidth = 2;
      this.ctx.shadowColor = '#38bdf8';
      this.ctx.shadowBlur = 10;
      this.ctx.stroke();
      this.ctx.restore();
    });

    // Draw Kois
    this.kois.forEach(k => {
      this.ctx.save();
      this.ctx.translate(k.x, k.y);
      this.ctx.rotate(k.angle);

      // Body gradient
      this.ctx.beginPath();
      this.ctx.ellipse(0, 0, 22, 9, 0, 0, Math.PI * 2);
      this.ctx.fillStyle = k.color;
      this.ctx.shadowColor = k.color;
      this.ctx.shadowBlur = 15;
      this.ctx.fill();

      // Tail oscillation
      const tailWiggle = Math.sin(k.tailAngle) * 8;
      this.ctx.beginPath();
      this.ctx.moveTo(-18, 0);
      this.ctx.lineTo(-34, -8 + tailWiggle);
      this.ctx.lineTo(-34, 8 + tailWiggle);
      this.ctx.closePath();
      this.ctx.fillStyle = k.secondaryColor;
      this.ctx.fill();

      this.ctx.restore();
    });

    // Draw Lotuses
    this.lotuses.forEach(l => {
      this.ctx.save();
      this.ctx.translate(l.x, l.y);
      this.ctx.rotate(l.rotation);

      // Lotus Pad (Green leaf)
      this.ctx.beginPath();
      this.ctx.arc(0, 0, l.radius, 0.2, Math.PI * 2 - 0.2);
      this.ctx.lineTo(0, 0);
      this.ctx.closePath();
      this.ctx.fillStyle = '#059669';
      this.ctx.shadowColor = '#10b981';
      this.ctx.shadowBlur = 12;
      this.ctx.fill();

      // Lotus Flower Blossom
      for (let i = 0; i < 8; i++) {
        const a = (Math.PI * 2 / 8) * i;
        this.ctx.beginPath();
        this.ctx.ellipse(Math.cos(a) * 8, Math.sin(a) * 8, 10, 4, a, 0, Math.PI * 2);
        this.ctx.fillStyle = '#f43f5e';
        this.ctx.fill();
      }

      this.ctx.restore();
    });
  }

  /* --------------------------------------------------------------------------
     MAIN ENGINE RENDER LOOP
     -------------------------------------------------------------------------- */
  start() {
    this.running = true;
    const loop = () => {
      if (!this.running) return;

      if (this.mode === 'fluid') {
        this.updateFluid();
        this.drawFluid();
      } else if (this.mode === 'bubbles') {
        this.updateBubbles();
        this.drawBubbles();
      } else if (this.mode === 'crystal') {
        this.updateCrystals();
        this.drawCrystals();
      } else if (this.mode === 'pond') {
        this.updatePond();
        this.drawPond();
      }

      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
  }
}
