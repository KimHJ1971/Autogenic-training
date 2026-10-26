/**
 * AudioEngine - Web Audio API 기반 청명한 고품질 명상 사운드 신시사이저
 * 외부 오디오 다운로드 없이 순수 브라우저 오디오 노드로 맑고 청아한 명상 사운드를 합성합니다.
 */
class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.ambientGain = null;
    this.bellGain = null;
    this.isPlayingAmbient = false;
    this.ambientNodes = [];
    this.ambientType = 'crystal'; // 'crystal', 'chimes', 'stream'
    this.ambientVolume = 0.35;
    this.bellVolume = 0.55;
    this.isDucked = false;
    this.chimeTimer = null;
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
   * 청명한 크리스탈 싱잉볼 타종 사운드 (Crystal Singing Bowl Chime)
   * 둔탁하지 않고 유리처럼 맑고 투명하게 울려 퍼지는 고음역 배음 합성
   */
  playSingingBowl(freq = 528, duration = 5.0) {
    this.init();
    const now = this.ctx.currentTime;

    // 솔페지오 528Hz(치유와 사랑의 주파수) 기반 맑은 크리스탈 배음 구조
    const harmonics = [
      { ratio: 1.0, gain: 0.50, decay: duration },          // 528Hz 맑은 기본음
      { ratio: 1.5, gain: 0.25, decay: duration * 0.9 },    // 792Hz 맑은 완전5도
      { ratio: 2.0, gain: 0.20, decay: duration * 0.8 },    // 1056Hz 영롱한 옥타브
      { ratio: 2.76, gain: 0.12, decay: duration * 0.6 },   // 크리스탈 유리 배음
      { ratio: 4.02, gain: 0.08, decay: duration * 0.45 }   // 청명한 잔향
    ];

    harmonics.forEach(h => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * h.ratio, now);

      // 맑은 미세 비브라토 (크리스탈 볼의 투명한 공명)
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(3.2, now);
      lfoGain.gain.setValueAtTime(1.8, now);
      lfo.connect(osc.frequency);
      lfo.start(now);
      lfo.stop(now + h.decay);

      // 크리스탈 볼 타격 어택 & 긴 여운
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(h.gain * this.bellVolume, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.00001, now + h.decay);

      osc.connect(gain);
      gain.connect(this.bellGain);

      osc.start(now);
      osc.stop(now + h.decay + 0.1);
    });
  }

  /**
   * 청명한 명상 배경 사운드 시작
   * @param {string} type - 'crystal' (크리스탈 싱잉볼), 'chimes' (크리스탈 윈드차임), 'stream' (맑은 숲속 시냇물)
   */
  startAmbient(type = this.ambientType) {
    this.init();
    if (this.isPlayingAmbient) {
      this.stopAmbient(0.4);
    }

    this.isPlayingAmbient = true;
    this.ambientType = type;
    const now = this.ctx.currentTime;
    this.ambientNodes = [];

    if (type === 'crystal') {
      this._buildCrystalAmbient(now);
    } else if (type === 'chimes') {
      this._buildChimesAmbient(now);
    } else if (type === 'stream') {
      this._buildStreamAmbient(now);
    }
  }

  /**
   * 사운드 1: 청명한 528Hz & 432Hz 크리스탈 싱잉볼 지속 공명
   */
  _buildCrystalAmbient(now) {
    // 528Hz(치유), 432Hz(안정), 648Hz(영롱한 5도)
    const tones = [
      { f: 528, gain: 0.14, pan: -0.3, detune: 0 },
      { f: 534, gain: 0.12, pan: 0.3, detune: 6 }, // 6Hz 세타파 바이노럴 비트
      { f: 432, gain: 0.10, pan: -0.2, detune: 0 },
      { f: 660, gain: 0.05, pan: 0.2, detune: 0 }
    ];

    tones.forEach(t => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(t.f, now);

      // 부드러운 위상 요동 (잔잔한 호흡 같은 변조)
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.08, now);
      lfoGain.gain.setValueAtTime(1.2, now);
      lfo.connect(osc.frequency);
      lfo.start();
      this.ambientNodes.push(lfo);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(t.gain, now + 3);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ambientGain);

      osc.start();
      this.ambientNodes.push(osc, filter, gain);
    });

    // 맑은 숲속 숨결 (초저음 로우패스 핑크노이즈)
    this._addGentleBreeze(now, 180, 0.08);
  }

  /**
   * 사운드 2: 청아한 크리스탈 윈드차임 & 산들바람
   */
  _buildChimesAmbient(now) {
    // 따뜻하고 맑은 숲속 바람
    this._addGentleBreeze(now, 320, 0.12);

    // 잔잔한 432Hz 배경 패드
    const padOsc = this.ctx.createOscillator();
    const padGain = this.ctx.createGain();
    padOsc.type = 'sine';
    padOsc.frequency.setValueAtTime(432, now);
    padGain.gain.setValueAtTime(0.0001, now);
    padGain.gain.linearRampToValueAtTime(0.08, now + 2);
    padOsc.connect(padGain);
    padGain.connect(this.ambientGain);
    padOsc.start();
    this.ambientNodes.push(padOsc, padGain);

    // 주기적으로 산들바람에 찰랑거리는 영롱한 크리스탈 차임 멜로디
    const chimeFreqs = [1584, 1760, 2112, 2376, 2640, 3168]; // 고음역 펜타토닉 맑은 종소리
    const playRandomChime = () => {
      if (!this.isPlayingAmbient || this.ambientType !== 'chimes') return;
      const tNow = this.ctx.currentTime;
      const f = chimeFreqs[Math.floor(Math.random() * chimeFreqs.length)];
      
      const cOsc = this.ctx.createOscillator();
      const cGain = this.ctx.createGain();
      cOsc.type = 'sine';
      cOsc.frequency.setValueAtTime(f, tNow);

      cGain.gain.setValueAtTime(0.0001, tNow);
      cGain.gain.exponentialRampToValueAtTime(0.035 * this.ambientVolume, tNow + 0.02);
      cGain.gain.exponentialRampToValueAtTime(0.00001, tNow + 2.8);

      cOsc.connect(cGain);
      cGain.connect(this.masterGain);

      cOsc.start(tNow);
      cOsc.stop(tNow + 3.0);

      // 3~7초 간격으로 불규칙하게 바람결에 흩날림
      const nextDelay = 3500 + Math.random() * 4000;
      this.chimeTimer = setTimeout(playRandomChime, nextDelay);
    };

    this.chimeTimer = setTimeout(playRandomChime, 1500);
  }

  /**
   * 사운드 3: 청명한 숲속 맑은 시냇물 소리
   */
  _buildStreamAmbient(now) {
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.3;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    // 맑은 물방울 대역 필터 (대역 통과 Bandpass)
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(650, now);
    filter.Q.setValueAtTime(1.8, now);

    // 물 흐름 요동 LFO
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.setValueAtTime(0.25, now);
    lfoGain.gain.setValueAtTime(220, now);
    lfo.connect(filter.frequency);
    lfo.start();
    this.ambientNodes.push(lfo);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 3);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ambientGain);

    noise.start();
    this.ambientNodes.push(noise, filter, gain);

    // 528Hz 평온한 저음 앰비언트 결합
    const tone = this.ctx.createOscillator();
    const toneGain = this.ctx.createGain();
    tone.type = 'sine';
    tone.frequency.setValueAtTime(264, now); // 528Hz 옥타브 아래
    toneGain.gain.setValueAtTime(0.0001, now);
    toneGain.gain.linearRampToValueAtTime(0.06, now + 3);
    tone.connect(toneGain);
    toneGain.connect(this.ambientGain);
    tone.start();
    this.ambientNodes.push(tone, toneGain);
  }

  /**
   * 부드러운 산들바람(핑크 노이즈 필터) 생성 보조 함수
   */
  _addGentleBreeze(now, cutoff = 240, targetGain = 0.1) {
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
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.035;
      b6 = white * 0.115926;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(cutoff, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(targetGain, now + 3);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.ambientGain);

    source.start();
    this.ambientNodes.push(source, filter, gain);
  }

  /**
   * 배경 앰비언트 부드럽게 정지
   */
  stopAmbient(fadeSec = 2.0) {
    if (!this.isPlayingAmbient || !this.ctx) return;
    this.isPlayingAmbient = false;

    if (this.chimeTimer) {
      clearTimeout(this.chimeTimer);
      this.chimeTimer = null;
    }

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

  duck(targetMultiplier = 0.30, duration = 0.5) {
    if (!this.ctx || !this.ambientGain || !this.isPlayingAmbient) return;
    const now = this.ctx.currentTime;
    this.ambientGain.gain.cancelScheduledValues(now);
    this.ambientGain.gain.setValueAtTime(this.ambientGain.gain.value, now);
    this.ambientGain.gain.linearRampToValueAtTime(this.ambientVolume * targetMultiplier, now + duration);
    this.isDucked = true;
  }

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

window.audioEngine = new AudioEngine();
