/**
 * VoiceGuide - 자율훈련법 음성 안내 및 시퀀스 오케스트레이터
 * Web Speech API와 AudioEngine을 결합하여 자율훈련법 전 과정을 제어합니다.
 */

// 자율훈련법 단계별 스크립트 데이터 (전사본 및 정통 슐츠 공식 완벽 통합)
const AUTOGENIC_STAGES = [
  {
    id: 'prep',
    name: '준비단계: 자세와 마음 정돈',
    subtitle: '척추 펴기 · 어깨 힘 빼기 · 배경 심상',
    formula: '마음이 차분해지고 있다. 평온한 초원에 누워 있다.',
    organ: '전신 자세 및 호흡',
    color: '#38bdf8',
    sentences: [
      { text: '자리에 똑바로 눕습니다. 양다리는 골반 너비로 편안하게 벌리고, 손바닥은 하늘을 향하도록 펴서 몸 옆에 둡니다.', pause: 5 },
      { text: '손목시계나 안경을 벗어두고, 어깨와 목에 들어간 힘을 천천히 빼냅니다.', pause: 4 },
      { text: '눈을 지그시 감고 깊은 숨을 천천히 들이마셨다가 길게 내쉽니다.', pause: 5 },
      { text: '이제 자연스러운 평소 호흡으로 돌아옵니다.', pause: 4 },
      { text: '마음이 차분해지고 있습니다. 평온한 햇살이 가득한 초원에 편안하게 누워 있습니다.', pause: 6 },
      { text: '마음이 아주 편안합니다. 모든 긴장이 부드럽게 풀려납니다.', pause: 5 }
    ]
  },
  {
    id: 'stage1',
    name: '제1단계: 중량감 연습 (무게감)',
    subtitle: '골격근 이완 · 양팔과 양다리 이완',
    formula: '오른팔이 무겁다 → 왼팔이 무겁다 → 양다리가 무겁다',
    organ: '골격근(근육계)',
    color: '#818cf8',
    sentences: [
      { text: '제 1단계, 중량감 연습입니다. 팔과 다리의 기분 좋은 무게감을 느껴봅니다.', pause: 4 },
      { text: '오른팔이 아주 무겁다... 오른팔이 바닥으로 기분 좋게 가라앉습니다.', pause: 6 },
      { text: '왼팔이 아주 무겁다... 양팔의 근육이 스르륵 풀려나갑니다.', pause: 6 },
      { text: '양다리가 아주 무겁다... 다리의 긴장이 완전히 사라집니다.', pause: 6 },
      { text: '양팔과 양다리가 아주 무겁다... 온몸이 바닥에 깊고 편안하게 밀착됩니다.', pause: 7 }
    ]
  },
  {
    id: 'stage2',
    name: '제2단계: 온열감 연습 (따뜻함)',
    subtitle: '말초혈관 확장 · 혈류량 증가 · 피부 온도 상승',
    formula: '오른팔이 따뜻하다 → 왼팔이 따뜻하다 → 양다리가 따뜻하다',
    organ: '혈관순환계',
    color: '#fb923c',
    sentences: [
      { text: '제 2단계, 온열감 연습입니다. 근육이 이완되며 말초 혈관이 부드럽게 확장됩니다.', pause: 4 },
      { text: '오른팔이 아주 따뜻하다... 손끝까지 기분 좋은 온기가 스며듭니다.', pause: 6 },
      { text: '왼팔이 아주 따뜻하다... 혈류량이 늘어나며 피부가 따뜻해집니다.', pause: 6 },
      { text: '양다리가 아주 따뜻하다... 발끝까지 포근한 온기가 가득 찹니다.', pause: 6 },
      { text: '양팔과 양다리가 아주 따뜻하다... 온몸이 온천수에 담긴 듯 따스합니다.', pause: 7 },
      { text: '혹시 맥박이 의식되더라도 자연스러운 현상이니, 포근한 온기가 몸에 감도는 느낌에만 편안히 머무릅니다.', pause: 6 }
    ]
  },
  {
    id: 'stage3',
    name: '제3단계: 심장 조정 연습 (심장 박동)',
    subtitle: '심장 자율신경 안정 · 조용하고 규칙적인 고동',
    formula: '심장이 조용하고 규칙적으로 뛰고 있다',
    organ: '심장 순환계',
    color: '#f43f5e',
    sentences: [
      { text: '제 3단계, 심장 조정 연습입니다. 가슴 중앙에 부드럽게 주의를 둡니다.', pause: 4 },
      { text: '심장이 조용하고 규칙적으로 뛰고 있습니다.', pause: 7 },
      { text: '내 심장은 아주 편안하고 잔잔하게 뛰고 있습니다.', pause: 7 },
      { text: '가슴 전체가 깊은 평온과 고요 속에 머뭅니다.', pause: 6 }
    ]
  },
  {
    id: 'stage4',
    name: '제4단계: 호흡 조정 연습 (자연스러운 숨)',
    subtitle: '호흡 중추 이완 · 숨이 저절로 쉬어지는 관찰',
    formula: '숨이 저절로 쉬어진다 / 호흡이 지극히 편안하다',
    organ: '호흡기계',
    color: '#34d399',
    sentences: [
      { text: '제 4단계, 호흡 조정 연습입니다. 억지로 숨을 쉬려 애쓰지 않습니다.', pause: 4 },
      { text: '호흡이 지극히 편안합니다.', pause: 6 },
      { text: '숨이 저절로 쉬어집니다.', pause: 7 },
      { text: '몸이 알아서 들이쉬고 내쉬는 편안한 리듬을 가만히 느껴봅니다.', pause: 7 }
    ]
  },
  {
    id: 'stage5',
    name: '제5단계: 복부 온열 연습 (태양신경총)',
    subtitle: '내장기관 이완 · 소화기 신경총 안정',
    formula: '배가 따뜻하다 / 명치 부위가 따뜻하다',
    organ: '소화기계(복부 신경총)',
    color: '#eab308',
    sentences: [
      { text: '제 5단계, 복부 온열 연습입니다. 명치와 아랫배 부위에 부드럽게 의식을 둡니다.', pause: 4 },
      { text: '배가 아주 따뜻하다... 뱃속이 부드럽고 편안합니다.', pause: 7 },
      { text: '명치 주위로 따스한 에너지가 은은하게 번져나갑니다.', pause: 7 },
      { text: '내장 기관의 모든 긴장이 풀려 소화와 순환이 편안해집니다.', pause: 6 }
    ]
  },
  {
    id: 'stage6',
    name: '제6단계: 두부 냉감 연습 (이마 청량감)',
    subtitle: '뇌혈관 긴장 완화 · 맑고 시원한 머리',
    formula: '이마가 시원하다 / 머리가 맑고 쾌적하다',
    organ: '중추신경계(두뇌)',
    color: '#06b6d4',
    sentences: [
      { text: '제 6단계, 두부 냉감 연습입니다. 이마와 관자놀이에 의식을 둡니다.', pause: 4 },
      { text: '이마가 시원하다... 솔바람이 스치듯 이마가 상쾌합니다.', pause: 7 },
      { text: '머리는 맑고 시원하며, 몸은 포근하고 따뜻합니다.', pause: 7 },
      { text: '잡념이 씻겨 나가고 머릿속이 맑은 유리처럼 쾌적해집니다.', pause: 6 }
    ]
  },
  {
    id: 'finish_sleep',
    name: '마무리: 수면 이행 모드',
    subtitle: '소거 동작 생략 · 깊은 잠으로 포근하게 이행',
    formula: '그대로 편안하게 깊은 잠에 듭니다',
    organ: '수면 및 회복',
    color: '#a855f7',
    sentences: [
      { text: '자율훈련법 전 과정이 모두 마무리되었습니다.', pause: 4 },
      { text: '지금 당신의 몸과 마음은 가장 깊고 안전한 이완 상태에 도달했습니다.', pause: 5 },
      { text: '몸을 움직이지 마시고, 이 포근하고 아늑한 온기 속에서 그대로 편안하게 잠에 듭니다.', pause: 6 },
      { text: '오늘 하루도 수고 많으셨습니다. 평온하고 깊은 잠을 이루세요.', pause: 8 }
    ]
  },
  {
    id: 'finish_awake',
    name: '마무리: 일상 복귀 (소거 동작)',
    subtitle: '3단계 정통 소거 · 주먹 쥐기 · 팔 굽히기 · 심호흡',
    formula: '주먹 쥐기 → 팔 굽히기 → 심호흡 → 눈 뜨기!',
    organ: '의식 각성 및 활력',
    color: '#10b981',
    sentences: [
      { text: '자율훈련법 전 과정을 마쳤습니다. 일상으로 돌아오기 위해 소거 동작을 실시합니다.', pause: 4 },
      { text: '첫째, 양손을 단단하게 주먹 쥐었다 폅니다. 하나, 둘, 셋.', pause: 4 },
      { text: '둘째, 팔을 힘차게 굽혔다 폅니다. 기지개를 쭉 켭니다. 하나, 둘, 셋.', pause: 4 },
      { text: '셋째, 숨을 크게 깊이 들이마시고... 길게 내쉽니다.', pause: 4 },
      { text: '이제 눈을 번쩍 뜹니다! 온몸에 상쾌한 활력이 가득 차오릅니다.', pause: 4 }
    ]
  }
];

class VoiceGuide {
  constructor() {
    this.synth = window.speechSynthesis;
    this.voices = [];
    this.selectedVoice = null;
    this.speechRate = 0.82; // 차분하고 느린 이완 속도
    this.speechPitch = 0.95; // 따뜻하고 안정적인 톤
    this.mode = 'sleep'; // 'sleep' 또는 'awake'
    this.coursePreset = 'standard'; // 'quick' (1~2분), 'standard' (3~5분), 'deep' (8~10분)
    this.silenceMultiplier = 1.0; // 문장 간 휴식 간격 배수

    // 실행 상태
    this.isPlaying = false;
    this.isPaused = false;
    this.currentStageIndex = 0;
    this.currentSentenceIndex = 0;
    this.activeStages = [];
    this.timerId = null;
    this.countdownTimer = null;
    this.currentUtterance = null;

    // 콜백
    this.onStageChange = null;
    this.onSentenceChange = null;
    this.onProgressUpdate = null;
    this.onComplete = null;
    this.onCountdownTick = null;

    this.initVoices();
  }

  initVoices() {
    const updateVoices = () => {
      this.voices = this.synth.getVoices().filter(v => v.lang.startsWith('ko') || v.lang.includes('KR'));
      if (this.voices.length > 0) {
        // 선호 음성 탐색 (Yuna, Heami, SunHi 등 자연스러운 한국어 보이스 우선)
        const preferred = this.voices.find(v => 
          v.name.includes('Yuna') || 
          v.name.includes('SunHi') || 
          v.name.includes('Heami') || 
          v.name.includes('Natural') ||
          v.name.includes('Google 한국')
        );
        this.selectedVoice = preferred || this.voices[0];
      }
    };

    updateVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = updateVoices;
    }
  }

  getVoices() {
    return this.voices;
  }

  setVoice(voiceURI) {
    const found = this.voices.find(v => v.voiceURI === voiceURI);
    if (found) this.selectedVoice = found;
  }

  setMode(mode) {
    this.mode = mode; // 'sleep' or 'awake'
  }

  setCourse(preset) {
    this.coursePreset = preset;
  }

  setRate(rate) {
    this.speechRate = parseFloat(rate);
  }

  setSilenceMultiplier(mult) {
    this.silenceMultiplier = parseFloat(mult);
  }

  /**
   * 코스 프리셋에 따라 실행할 스테이지 목록 구성
   */
  buildStageSequence() {
    const finishStageId = this.mode === 'sleep' ? 'finish_sleep' : 'finish_awake';
    const finishStage = AUTOGENIC_STAGES.find(s => s.id === finishStageId);

    if (this.coursePreset === 'quick') {
      // 1~2분 퀵 코스: 준비 + 1단계(핵심) + 2단계(핵심) + 6단계(핵심) + 마무리
      const stages = [
        {
          ...AUTOGENIC_STAGES[0],
          sentences: [
            AUTOGENIC_STAGES[0].sentences[0],
            AUTOGENIC_STAGES[0].sentences[4]
          ]
        },
        {
          ...AUTOGENIC_STAGES[1],
          sentences: [
            { text: '제 1단계, 중량감입니다. 양팔과 양다리가 아주 무겁다... 온몸이 바닥으로 기분 좋게 가라앉습니다.', pause: 6 }
          ]
        },
        {
          ...AUTOGENIC_STAGES[2],
          sentences: [
            { text: '제 2단계, 온열감입니다. 양팔과 양다리가 아주 따뜻하다... 손발 끝까지 포근한 온기가 번집니다.', pause: 6 }
          ]
        },
        {
          ...AUTOGENIC_STAGES[4],
          sentences: [
            { text: '제 4단계, 호흡입니다. 숨이 저절로 쉬어집니다. 지극히 편안합니다.', pause: 6 }
          ]
        },
        {
          ...AUTOGENIC_STAGES[6],
          sentences: [
            { text: '제 6단계, 이마가 시원하다... 머리는 맑고 몸은 따뜻합니다.', pause: 6 }
          ]
        },
        finishStage
      ];
      return stages;
    } else if (this.coursePreset === 'deep') {
      // 8~10분 심층 코스: 모든 단계에 추가 호흡/심화 묵상 시간 부여
      return AUTOGENIC_STAGES.slice(0, 7).map(stage => {
        const expandedSentences = stage.sentences.map(s => ({
          ...s,
          pause: s.pause * 1.5
        }));
        return {
          ...stage,
          sentences: expandedSentences
        };
      }).concat([finishStage]);
    } else {
      // 표준 3~5분 정통 슐츠 코스
      return AUTOGENIC_STAGES.slice(0, 7).concat([finishStage]);
    }
  }

  /**
   * 훈련 세션 시작 (준비 카운트다운 후 본격 진행)
   */
  start(prepSeconds = 10) {
    this.stop();
    this.isPlaying = true;
    this.isPaused = false;
    this.activeStages = this.buildStageSequence();
    this.currentStageIndex = 0;
    this.currentSentenceIndex = 0;

    // 배경음 재생 시작
    if (window.audioEngine) {
      window.audioEngine.startAmbient();
      window.audioEngine.playSingingBowl(432, 5.0);
    }

    if (prepSeconds > 0) {
      let count = prepSeconds;
      if (this.onCountdownTick) this.onCountdownTick(count);

      this.speakSilentNotice('자리에 편안히 누워 자세를 정돈하세요.');

      this.countdownTimer = setInterval(() => {
        count--;
        if (this.onCountdownTick) this.onCountdownTick(count);
        if (count <= 0) {
          clearInterval(this.countdownTimer);
          this.countdownTimer = null;
          this.runNextSentence();
        }
      }, 1000);
    } else {
      this.runNextSentence();
    }
  }

  runNextSentence() {
    if (!this.isPlaying || this.isPaused) return;

    if (this.currentStageIndex >= this.activeStages.length) {
      this.finishSession();
      return;
    }

    const stage = this.activeStages[this.currentStageIndex];
    if (this.currentSentenceIndex === 0) {
      // 단계 변경 시 싱잉볼 타종
      if (window.audioEngine) {
        const bowlFreq = 384 + (this.currentStageIndex % 6) * 32;
        window.audioEngine.playSingingBowl(bowlFreq, 4.0);
      }
      if (this.onStageChange) {
        this.onStageChange(stage, this.currentStageIndex, this.activeStages.length);
      }
    }

    const sentence = stage.sentences[this.currentSentenceIndex];
    if (this.onSentenceChange) {
      this.onSentenceChange(sentence, this.currentSentenceIndex, stage.sentences.length);
    }

    this.speak(sentence.text, () => {
      if (!this.isPlaying || this.isPaused) return;

      // 발화 후 침묵/명상 대기 시간 계산
      const pauseDuration = (sentence.pause || 5) * this.silenceMultiplier * 1000;

      this.timerId = setTimeout(() => {
        this.currentSentenceIndex++;
        if (this.currentSentenceIndex >= stage.sentences.length) {
          this.currentStageIndex++;
          this.currentSentenceIndex = 0;
        }
        this.runNextSentence();
      }, pauseDuration);
    });
  }

  speak(text, onEnd) {
    this.synth.cancel();

    // 배경음 덕킹 (소리 줄이기)
    if (window.audioEngine) {
      window.audioEngine.duck(0.35, 0.5);
    }

    const utter = new SpeechSynthesisUtterance(text);
    if (this.selectedVoice) utter.voice = this.selectedVoice;
    utter.rate = this.speechRate;
    utter.pitch = this.speechPitch;
    utter.lang = 'ko-KR';

    utter.onend = () => {
      // 발화 끝나면 배경음 서서히 복원
      if (window.audioEngine) {
        window.audioEngine.unduck(1.2);
      }
      if (onEnd) onEnd();
    };

    utter.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      if (window.audioEngine) window.audioEngine.unduck(0.5);
      if (onEnd) onEnd();
    };

    this.currentUtterance = utter;
    this.synth.speak(utter);
  }

  speakSilentNotice(text) {
    const utter = new SpeechSynthesisUtterance(text);
    if (this.selectedVoice) utter.voice = this.selectedVoice;
    utter.rate = this.speechRate;
    utter.pitch = this.speechPitch;
    utter.lang = 'ko-KR';
    this.synth.speak(utter);
  }

  pause() {
    if (!this.isPlaying || this.isPaused) return;
    this.isPaused = true;
    this.synth.pause();
    if (this.timerId) clearTimeout(this.timerId);
    if (this.countdownTimer) clearInterval(this.countdownTimer);
  }

  resume() {
    if (!this.isPlaying || !this.isPaused) return;
    this.isPaused = false;
    this.synth.resume();
    this.runNextSentence();
  }

  togglePlayPause() {
    if (!this.isPlaying) {
      this.start();
    } else if (this.isPaused) {
      this.resume();
    } else {
      this.pause();
    }
  }

  nextStage() {
    if (!this.isPlaying) return;
    this.synth.cancel();
    if (this.timerId) clearTimeout(this.timerId);
    if (this.currentStageIndex < this.activeStages.length - 1) {
      this.currentStageIndex++;
      this.currentSentenceIndex = 0;
      this.runNextSentence();
    } else {
      this.finishSession();
    }
  }

  prevStage() {
    if (!this.isPlaying) return;
    this.synth.cancel();
    if (this.timerId) clearTimeout(this.timerId);
    if (this.currentStageIndex > 0) {
      this.currentStageIndex--;
      this.currentSentenceIndex = 0;
      this.runNextSentence();
    }
  }

  stop() {
    this.isPlaying = false;
    this.isPaused = false;
    this.synth.cancel();
    if (this.timerId) clearTimeout(this.timerId);
    if (this.countdownTimer) clearInterval(this.countdownTimer);
    if (window.audioEngine) {
      window.audioEngine.stopAmbient(2.0);
    }
  }

  finishSession() {
    this.isPlaying = false;
    this.isPaused = false;
    if (window.audioEngine) {
      if (this.mode === 'sleep') {
        // 수면 모드에서는 5초에 걸쳐 매우 부드럽게 페이드아웃
        window.audioEngine.stopAmbient(6.0);
      } else {
        window.audioEngine.stopAmbient(2.5);
      }
    }
    if (this.onComplete) {
      this.onComplete(this.mode);
    }
  }
}

// 싱글톤 노출
window.voiceGuide = new VoiceGuide();
