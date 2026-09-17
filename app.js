/* ==========================================================================
   Rehat Sejenak
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  const engine = new ZenPhysicsEngine(canvas);
  engine.start();

  // Mode hints mapping
  const modeHints = {
    fluid: 'Move or drag to release neon flow & harmonic pentatonic chimes',
    bubbles: 'Tap or swipe bubbles to enjoy satisfying ASMR pops',
    crystal: 'Tap floating crystals to fracture them into crystal chimes',
    pond: 'Tap the water surface to create ripples & watch Koi fish react'
  };

  // DOM Elements
  const startOverlay = document.getElementById('startOverlay');
  const btnEnter = document.getElementById('btnEnter');
  const hintText = document.getElementById('hintText');
  const modeBtns = document.querySelectorAll('.nav-btn');
  const btnBreathe = document.getElementById('btnBreathe');
  const breatheModal = document.getElementById('breatheModal');
  const closeBreathe = document.getElementById('closeBreathe');
  const btnSettings = document.getElementById('btnSettings');
  const settingsModal = document.getElementById('settingsModal');
  const closeSettings = document.getElementById('closeSettings');
  const btnAudioToggle = document.getElementById('btnAudioToggle');
  const audioOnIcon = document.querySelector('.audio-on-icon');
  const audioOffIcon = document.querySelector('.audio-off-icon');

  const themeOptions = document.querySelectorAll('.theme-option');
  const selectSoundscape = document.getElementById('selectSoundscape');
  const sliderVolume = document.getElementById('sliderVolume');
  const volumeValue = document.getElementById('volumeValue');
  const sliderSpeed = document.getElementById('sliderSpeed');
  const speedValue = document.getElementById('speedValue');

  // Start Audio Overlay
  btnEnter.addEventListener('click', () => {
    if (window.zenAudio) {
      window.zenAudio.init();
    }
    startOverlay.classList.add('hidden');
  });

  // Mode Switching
  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const mode = btn.getAttribute('data-mode');
      engine.setMode(mode);
      hintText.textContent = modeHints[mode] || '';
    });
  });

  // Track Mouse / Touch Inputs
  let lastChimeTime = 0;

  function updateInputPos(clientX, clientY, isDown = false) {
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    engine.mouse.vx = x - engine.mouse.x;
    engine.mouse.vy = y - engine.mouse.y;
    engine.mouse.px = engine.mouse.x;
    engine.mouse.py = engine.mouse.y;
    engine.mouse.x = x;
    engine.mouse.y = y;
    engine.mouse.isDown = isDown;

    // Play chime sound in fluid mode when moving
    if (engine.mode === 'fluid') {
      const now = Date.now();
      const speed = Math.hypot(engine.mouse.vx, engine.mouse.vy);
      if (speed > 4 && now - lastChimeTime > 120 && window.zenAudio) {
        window.zenAudio.playChime(x / window.innerWidth, y / window.innerHeight);
        lastChimeTime = now;
      }
    }
  }

  canvas.addEventListener('mousemove', e => updateInputPos(e.clientX, e.clientY, e.buttons === 1));
  canvas.addEventListener('mousedown', e => {
    updateInputPos(e.clientX, e.clientY, true);
    if (engine.mode === 'pond') {
      engine.triggerRipple(e.clientX, e.clientY);
    }
  });
  canvas.addEventListener('mouseup', e => updateInputPos(e.clientX, e.clientY, false));
  canvas.addEventListener('mouseleave', () => {
    engine.mouse.x = -1000;
    engine.mouse.y = -1000;
    engine.mouse.isDown = false;
  });

  // Touch Support
  canvas.addEventListener('touchstart', e => {
    if (e.touches.length > 0) {
      const t = e.touches[0];
      updateInputPos(t.clientX, t.clientY, true);
      if (engine.mode === 'pond') {
        engine.triggerRipple(t.clientX, t.clientY);
      }
    }
  }, { passive: true });

  canvas.addEventListener('touchmove', e => {
    if (e.touches.length > 0) {
      const t = e.touches[0];
      updateInputPos(t.clientX, t.clientY, true);
    }
  }, { passive: true });

  canvas.addEventListener('touchend', () => {
    engine.mouse.isDown = false;
  });

  // Window Resize
  window.addEventListener('resize', () => engine.resize());

  /* --------------------------------------------------------------------------
     GUIDED BREATHING COMPANION
     -------------------------------------------------------------------------- */
  let breatheInterval = null;
  let currentRhythm = 'box'; // 'box' or 'relax'
  const breatheCircle = document.getElementById('breatheCircle');
  const breathePhaseText = document.getElementById('breathePhaseText');
  const breatheTimer = document.getElementById('breatheTimer');

  btnBreathe.addEventListener('click', () => {
    breatheModal.classList.remove('hidden');
    startBreathingCycle();
  });

  closeBreathe.addEventListener('click', () => {
    breatheModal.classList.add('hidden');
    stopBreathingCycle();
  });

  document.querySelectorAll('.breathe-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.breathe-mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentRhythm = btn.getAttribute('data-rhythm');
      startBreathingCycle();
    });
  });

  function startBreathingCycle() {
    stopBreathingCycle();

    const phases = currentRhythm === 'box'
      ? [
          { text: 'Inhale', duration: 4, scale: 1.55 },
          { text: 'Hold', duration: 4, scale: 1.55 },
          { text: 'Exhale', duration: 4, scale: 1.0 },
          { text: 'Rest', duration: 4, scale: 1.0 }
        ]
      : [
          { text: 'Inhale', duration: 4, scale: 1.6 },
          { text: 'Hold', duration: 7, scale: 1.6 },
          { text: 'Exhale', duration: 8, scale: 1.0 }
        ];

    let phaseIndex = 0;
    let count = phases[0].duration;

    const updatePhase = () => {
      const current = phases[phaseIndex];
      breathePhaseText.textContent = current.text;
      breatheTimer.textContent = count;
      breatheCircle.style.transform = `scale(${current.scale})`;

      if (window.zenAudio && count === current.duration) {
        window.zenAudio.playChime(0.5, 0.3);
      }

      count--;

      if (count < 0) {
        phaseIndex = (phaseIndex + 1) % phases.length;
        count = phases[phaseIndex].duration;
      }
    };

    updatePhase();
    breatheInterval = setInterval(updatePhase, 1000);
  }

  function stopBreathingCycle() {
    if (breatheInterval) {
      clearInterval(breatheInterval);
      breatheInterval = null;
    }
  }

  /* --------------------------------------------------------------------------
     SETTINGS & THEMES
     -------------------------------------------------------------------------- */
  btnSettings.addEventListener('click', () => settingsModal.classList.remove('hidden'));
  closeSettings.addEventListener('click', () => settingsModal.classList.add('hidden'));

  // Theme Switcher
  themeOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      themeOptions.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');

      const theme = opt.getAttribute('data-theme');
      document.body.className = `theme-${theme}`;
      engine.setTheme(theme);
    });
  });

  // Soundscape Switcher
  selectSoundscape.addEventListener('change', (e) => {
    if (window.zenAudio) {
      window.zenAudio.setSoundscape(e.target.value);
    }
  });

  // Volume Slider
  sliderVolume.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    volumeValue.textContent = `${val}%`;
    if (window.zenAudio) {
      window.zenAudio.setVolume(val / 100);
    }
  });

  // Speed Slider
  sliderSpeed.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    const speedMap = { 1: 'Slow & Gentle', 2: 'Normal', 3: 'Dynamic' };
    const multiplierMap = { 1: 0.6, 2: 1.0, 3: 1.6 };

    speedValue.textContent = speedMap[val];
    engine.setSpeed(multiplierMap[val]);
  });

  // Master Mute Toggle Button
  btnAudioToggle.addEventListener('click', () => {
    if (window.zenAudio) {
      const isMuted = window.zenAudio.toggleMute();
      if (isMuted) {
        audioOnIcon.classList.add('hidden');
        audioOffIcon.classList.remove('hidden');
      } else {
        audioOnIcon.classList.remove('hidden');
        audioOffIcon.classList.add('hidden');
      }
    }
  });
});
