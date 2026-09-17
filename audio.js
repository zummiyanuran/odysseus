/* ==========================================================================
   Zen Sanctuary - Procedural Web Audio API Engine
   ========================================================================== */

class ZenAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.reverbNode = null;
    this.isMuted = false;
    this.volume = 0.8;
    this.currentSoundscape = 'cosmic';
    
    // Ambient soundscape nodes
    this.soundscapeNodes = [];
    this.soundscapeTimer = null;

    // Major Pentatonic Scale frequencies (Hz)
    this.pentatonicScale = [
      196.00, // G3
      220.00, // A3
      261.63, // C4
      293.66, // D4
      329.63, // E4
      392.00, // G4
      440.00, // A4
      523.25, // C5
      587.33, // D5
      659.25, // E5
      783.99, // G5
      880.00, // A5
      1046.50 // C6
    ];

    this.initialized = false;
  }

  init() {
    if (this.initialized) return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Reverb / Delay effect node for lush ambient tail
      this.delayNode = this.ctx.createDelay();
      this.delayNode.delayTime.value = 0.35;

      this.feedbackGain = this.ctx.createGain();
      this.feedbackGain.gain.value = 0.3;

      this.delayFilter = this.ctx.createBiquadFilter();
      this.delayFilter.type = 'lowpass';
      this.delayFilter.frequency.value = 2000;

      // Connect delay loop
      this.delayNode.connect(this.delayFilter);
      this.delayFilter.connect(this.feedbackGain);
      this.feedbackGain.connect(this.delayNode);
      this.delayNode.connect(this.masterGain);

      this.initialized = true;

      // Start initial ambient soundscape
      this.setSoundscape(this.currentSoundscape);
    } catch (e) {
      console.warn('Web Audio API not supported or blocked:', e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime, 0.05);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  // Play Pentatonic Bell Chime based on position
  playChime(posRatioX = 0.5, posRatioY = 0.5) {
    if (!this.initialized || this.isMuted) return;
    this.resume();

    const scaleIndex = Math.floor(posRatioX * (this.pentatonicScale.length - 1));
    const freq = this.pentatonicScale[scaleIndex] || 440;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    // Subtle pitch modulation for organic bell feel
    osc.frequency.exponentialRampToValueAtTime(freq * 0.998, this.ctx.currentTime + 1.2);

    const now = this.ctx.currentTime;
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

    osc.connect(gain);
    gain.connect(this.masterGain);
    gain.connect(this.delayNode);

    osc.start(now);
    osc.stop(now + 2.6);
  }

  // ASMR Popping Sound Generator
  playPop(pitchMultiplier = 1.0) {
    if (!this.initialized || this.isMuted) return;
    this.resume();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const startFreq = (350 + Math.random() * 150) * pitchMultiplier;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(60 * pitchMultiplier, now + 0.08);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  // Crystal Glass Fracture Chime Cluster
  playGlassShatter(baseFreq = 800) {
    if (!this.initialized || this.isMuted) return;
    this.resume();

    const now = this.ctx.currentTime;
    const harmonics = [1, 1.25, 1.5, 2.0];

    harmonics.forEach((h, index) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime((baseFreq + Math.random() * 200) * h, now + index * 0.015);

      gain.gain.setValueAtTime(0.001, now + index * 0.015);
      gain.gain.linearRampToValueAtTime(0.2 / (index + 1), now + index * 0.015 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.015 + 1.2);

      osc.connect(gain);
      gain.connect(this.masterGain);
      gain.connect(this.delayNode);

      osc.start(now + index * 0.015);
      osc.stop(now + index * 0.015 + 1.3);
    });
  }

  // Water Splash Ripple Sound
  playSplash() {
    if (!this.initialized || this.isMuted) return;
    this.resume();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(500 + Math.random() * 200, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.15);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  // Soundscapes Management
  setSoundscape(type) {
    this.currentSoundscape = type;
    this.stopSoundscape();

    if (!this.initialized || type === 'none') return;

    if (type === 'cosmic') {
      this.createCosmicDrone();
    } else if (type === 'rain') {
      this.createRainSoundscape();
    } else if (type === 'ocean') {
      this.createOceanWaves();
    } else if (type === 'forest') {
      this.createForestBreeze();
    }
  }

  stopSoundscape() {
    if (this.soundscapeTimer) {
      clearInterval(this.soundscapeTimer);
      this.soundscapeTimer = null;
    }
    this.soundscapeNodes.forEach(node => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {}
    });
    this.soundscapeNodes = [];
  }

  // Cosmic Drone Pad Synthesizer
  createCosmicDrone() {
    const freqs = [130.81, 196.00, 261.63]; // C3, G3, C4
    freqs.forEach(freq => {
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      this.soundscapeNodes.push(osc, filter, gain);
    });
  }

  // Procedural Rain Soundscape
  createRainSoundscape() {
    // Generate pink noise buffer
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.04; // scale volume
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    whiteNoise.start();
    this.soundscapeNodes.push(whiteNoise, filter, gain);
  }

  // Procedural Ocean Waves
  createOceanWaves() {
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';

    const gain = this.ctx.createGain();

    // Ocean LFO wave filter sweep
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // ~8 sec ocean swell

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(300, this.ctx.currentTime);

    filter.frequency.setValueAtTime(400, this.ctx.currentTime);
    lfo.connect(filter.frequency);

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start();
    lfo.start();
    this.soundscapeNodes.push(noise, filter, gain, lfo);
  }

  // Procedural Forest Breeze
  createForestBreeze() {
    this.createOceanWaves(); // Soft breeze base
  }
}

// Global Singleton Instance
window.zenAudio = new ZenAudioEngine();
