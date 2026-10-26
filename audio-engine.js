/**
 * AudioEngine - Web Audio API 기반 순수 실시간 힐링 사운드 신시사이저
 * 외부 오디오 파일 다운로드 없이 브라우저 자체에서 부드럽고 맑은 소리를 합성합니다.
 */
class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.ambientGain = null;
    this.bellGain = null;
    this.isPlayingAmbient = false;
    this.ambientNodes = [];
    this.ambientVolume = 0.35;
    this.bellVolume = 0.6;
    this.isDucked = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Ambient Gain (배경음)
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(this.ambientVolume, this.ctx.currentTime);
      this.ambientGain.connect(this.masterGain);

      // Bell Gain (차임 벨)
      this.bellGain = this.ctx.createGain();
      this.bellGain.gain.setValueAtTime(this.bellVolume, this.ctx.currentTime);
      this.bellGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * 싱잉볼 (Tibetan Singing Bowl) 타종 사운드 합성
   * 풍부한 배음(216Hz, 432Hz, 864Hz, 1296Hz)과 자연스러운 금속성 여운
   */
  playSingingBowl(freq = 432, duration = 4.5) {
    this.init();
    const now = this.ctx.currentTime;

    // 배음 구조 (기본 주파수, 2차 배음, 3차 배음, 서브 하모닉)
    const harmonics = [
      { ratio: 0.5, gain: 0.25, decay: duration * 1.1 },
      { ratio: 1.0, gain: 0.55, decay: duration },
      { ratio: 2.01, gain: 0.28, decay: duration * 0.75 },
      { ratio: 3.03, gain: 0.12, decay: duration * 0.55 },
      { ratio: 4.07, gain: 0.05, decay: duration * 0.35 }
    ];

    harmonics.forEach(h => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * h.ratio, now);

      // 미세 비브라토(금속 그릇 떨림)
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(2.5, now);
      lfoGain.gain.setValueAtTime(1.2, now);
      lfo.connect(osc.frequency);
      lfo.start(now);
      lfo.stop(now + h.decay);

      // 부드러운 어택 후 지수 감쇠
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(h.gain * this.bellVolume, now + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.00001, now + h.decay);

      osc.connect(gain);
      gain.connect(this.bellGain);

      osc.start(now);
      osc.stop(now + h.decay + 0.1);
    });
  }

  /**
   * 432Hz 이완 드론 + 6Hz 세타파 바이노럴 비트 + 핑크노이즈 밤바람 합성 시작
   */
  startAmbient(soundType = 'theta') {
    this.init();
    if (this.isPlayingAmbient) {
      this.stopAmbient();
    }

    this.isPlayingAmbient = true;
    const now = this.ctx.currentTime;
    this.ambientNodes = [];

    // 1. 드론 화음 (432Hz 이완 주파수 기반)
    const baseFreq = 216; // 432의 옥타브 아래
    const freqs = [baseFreq, baseFreq * 1.5, baseFreq * 2]; // 으뜸음, 완전5도, 옥타브

    freqs.forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const oscGain = this.ctx.createGain();

      osc.type = idx === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(f, now);

      // 따뜻한 톤을 위한 로우패스 필터
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now);

      // 미세한 위상 변화
      const detuneOsc = this.ctx.createOscillator();
      const detuneGain = this.ctx.createGain();
      detuneOsc.frequency.setValueAtTime(0.1 + idx * 0.05, now);
      detuneGain.gain.setValueAtTime(1.5, now);
      detuneOsc.connect(osc.frequency);
      detuneOsc.start();
      this.ambientNodes.push(detuneOsc);

      const targetGain = 0.15 / (idx + 1);
      oscGain.gain.setValueAtTime(0.0001, now);
      oscGain.gain.linearRampToValueAtTime(targetGain, now + 3);

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(this.ambientGain);

      osc.start();
      this.ambientNodes.push(osc, filter, oscGain);
    });

    // 2. 부드러운 밤바람/파도 앰비언스 (핑크 노이즈 버퍼)
    const bufferSize = this.ctx.sampleRate * 2;
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
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // 파도처럼 오르내리는 필터
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(220, now);

    // 숨결 같은 LFO (0.12Hz = 8초 주기 호흡)
    const breathLfo = this.ctx.createOscillator();
    const breathGain = this.ctx.createGain();
    breathLfo.frequency.setValueAtTime(0.12, now);
    breathGain.gain.setValueAtTime(140, now);
    breathLfo.connect(noiseFilter.frequency);
    breathLfo.start();
    this.ambientNodes.push(breathLfo);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.0001, now);
    noiseGain.gain.linearRampToValueAtTime(0.2, now + 4);

    whiteNoise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ambientGain);

    whiteNoise.start();
    this.ambientNodes.push(whiteNoise, noiseFilter, noiseGain);
  }

  /**
   * 배경 앰비언트 부드럽게 정지
   */
  stopAmbient(fadeSec = 2.0) {
    if (!this.isPlayingAmbient || !this.ctx) return;
    this.isPlayingAmbient = false;

    const now = this.ctx.currentTime;
    if (this.ambientGain) {
      this.ambientGain.gain.setValueAtTime(this.ambientGain.gain.value, now);
      this.ambientGain.gain.linearRampToValueAtTime(0.0001, now + fadeSec);
    }

    setTimeout(() => {
      this.ambientNodes.forEach(node => {
        try {
          if (node.stop) node.stop();
          if (node.disconnect) node.disconnect();
        } catch (e) {}
      });
      this.ambientNodes = [];
      if (this.ambientGain) {
        this.ambientGain.gain.setValueAtTime(this.ambientVolume, this.ctx ? this.ctx.currentTime : 0);
      }
    }, fadeSec * 1000 + 50);
  }

  /**
   * 음성 낭독 시 배경음 살짝 낮추기 (Ducking)
   */
  duck(targetMultiplier = 0.35, duration = 0.6) {
    if (!this.ctx || !this.ambientGain || !this.isPlayingAmbient) return;
    const now = this.ctx.currentTime;
    this.ambientGain.gain.cancelScheduledValues(now);
    this.ambientGain.gain.setValueAtTime(this.ambientGain.gain.value, now);
    this.ambientGain.gain.linearRampToValueAtTime(this.ambientVolume * targetMultiplier, now + duration);
    this.isDucked = true;
  }

  /**
   * 낭독 후 침묵/이완 시간 동안 배경음 다시 복원
   */
  unduck(duration = 1.2) {
    if (!this.ctx || !this.ambientGain || !this.isPlayingAmbient) return;
    const now = this.ctx.currentTime;
    this.ambientGain.gain.cancelScheduledValues(now);
    this.ambientGain.gain.setValueAtTime(this.ambientGain.gain.value, now);
    this.ambientGain.gain.linearRampToValueAtTime(this.ambientVolume, now + duration);
    this.isDucked = false;
  }

  setAmbientVolume(val) {
    this.ambientVolume = Math.max(0, Math.min(1, val));
    if (this.ambientGain && this.ctx && !this.isDucked) {
      this.ambientGain.gain.setValueAtTime(this.ambientVolume, this.ctx.currentTime);
    }
  }

  setBellVolume(val) {
    this.bellVolume = Math.max(0, Math.min(1, val));
    if (this.bellGain && this.ctx) {
      this.bellGain.gain.setValueAtTime(this.bellVolume, this.ctx.currentTime);
    }
  }
}

// 싱글톤 노출
window.audioEngine = new AudioEngine();
