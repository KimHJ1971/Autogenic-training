/**
 * VoiceGuide - 자율훈련법 음성 안내 및 시퀀스 오케스트레이터
 * 구글, 마이크로소프트, 애플 등 다양한 여성 목소리 및 4가지 고품질 여성 보이스 프로필 지원
 */

// 자율훈련법 단계별 스크립트 데이터 (더 부드럽고 친절한 여성 명상 지도자 어조)
const AUTOGENIC_STAGES = [
  {
    id: 'prep',
    name: '준비단계: 자세와 마음 정돈',
    subtitle: '척추 펴기 · 어깨 힘 빼기 · 배경 심상',
    formula: '마음이 차분해지고 있다. 평온한 초원에 편안하게 누워 있다.',
    organ: '전신 자세 및 호흡',
    color: '#38bdf8',
    sentences: [
      { text: '자리에 편안하게 똑바로 눕습니다. 양다리는 골반 너비로 편안히 벌리고, 손바닥은 하늘을 향하도록 몸 옆에 살포시 둡니다.', pause: 5 },
      { text: '손목시계나 안경을 벗어두고, 어깨와 목에 들어간 불필요한 힘을 천천히 툭 빼보세요.', pause: 5 },
      { text: '눈을 부드럽게 감고, 숨을 깊고 천천히 들이마셨다가... 입으로 편안하게 길게 내쉽니다.', pause: 6 },
      { text: '이제 내 몸이 가장 편안해하는 평소의 자연스러운 호흡으로 돌아옵니다.', pause: 5 },
      { text: '마음이 아주 차분해지고 있습니다. 따스하고 평온한 햇살이 가득한 초원에 편안하게 누워 있습니다.', pause: 6 },
      { text: '마음이 지극히 평온합니다. 온몸의 모든 긴장이 부드럽게 사르르 풀려나갑니다.', pause: 5 }
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
      { text: '첫 번째, 중량감 연습이에요. 양팔과 양다리의 기분 좋은 무게감을 가만히 느껴보세요.', pause: 4 },
      { text: '오른팔이 아주 무겁습니다... 기분 좋은 묵직함과 함께 바닥으로 편안하게 스르륵 가라앉아요.', pause: 6 },
      { text: '왼팔이 아주 무겁습니다... 양팔의 단단했던 근육들이 물방울처럼 부드럽게 풀려나갑니다.', pause: 6 },
      { text: '양다리가 아주 무겁습니다... 다리의 모든 긴장이 바닥 아래로 깊숙이 스며듭니다.', pause: 6 },
      { text: '양팔과 양다리가 아주 무겁습니다... 온몸이 침대와 하나가 된 듯 깊고 편안하게 밀착됩니다.', pause: 7 }
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
      { text: '두 번째, 온열감 연습이에요. 근육이 이완되면서 말초 혈관이 부드럽게 열리고 혈액이 원활하게 흘러갑니다.', pause: 5 },
      { text: '오른팔이 아주 따뜻합니다... 손끝과 손바닥까지 포근하고 기분 좋은 온기가 스며듭니다.', pause: 6 },
      { text: '왼팔이 아주 따뜻합니다... 따스한 햇볕을 쬐는 것처럼 양팔이 포근해집니다.', pause: 6 },
      { text: '양다리가 아주 따뜻합니다... 발끝까지 온화한 봄날의 온기가 가득 찹니다.', pause: 6 },
      { text: '양팔과 양다리가 아주 따뜻합니다... 마치 따뜻한 온천수에 몸을 담근 것처럼 전신이 포근하게 데워집니다.', pause: 7 },
      { text: '혹시 맥박이 느껴지더라도 자연스러운 이완 현상이니, 포근하고 따뜻한 느낌에만 부드럽게 마음을 맡겨보세요.', pause: 6 }
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
      { text: '세 번째, 심장 조정 연습이에요. 가슴 중앙에 부드럽고 따뜻한 주의를 기울여 봅니다.', pause: 4 },
      { text: '심장이 조용하고 규칙적으로 뛰고 있습니다.', pause: 7 },
      { text: '내 심장은 지극히 편안하고 고요하게, 부드러운 리듬으로 뛰고 있습니다.', pause: 7 },
      { text: '가슴 전체에 깊은 평화와 안도감이 차오릅니다.', pause: 6 }
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
      { text: '네 번째, 호흡 조정 연습이에요. 억지로 숨을 쉬려 애쓰지 마세요.', pause: 4 },
      { text: '호흡이 지극히 편안합니다.', pause: 6 },
      { text: '숨이 저절로 부드럽게 쉬어집니다.', pause: 7 },
      { text: '산들바람처럼 내 몸이 알아서 숨을 들이쉬고 내쉬는 편안한 리듬을 가만히 지켜봅니다.', pause: 7 }
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
      { text: '다섯 번째, 복부 온열 연습이에요. 명치와 아랫배 부위에 다정한 온기를 느껴봅니다.', pause: 4 },
      { text: '배가 아주 따뜻합니다... 뱃속이 부드럽고 편안하게 풀려납니다.', pause: 7 },
      { text: '명치 주위로 따스하고 은은한 황금빛 에너지가 맴돕니다.', pause: 7 },
      { text: '내장 기관의 모든 긴장이 풀리고 온몸의 소화와 순환이 지극히 편안해집니다.', pause: 6 }
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
      { text: '여섯 번째, 두부 냉감 연습이에요. 이마와 관자놀이에 맑은 의식을 둡니다.', pause: 4 },
      { text: '이마가 시원합니다... 숲속 솔바람이 스치듯 이마가 아주 상쾌해요.', pause: 7 },
      { text: '머리는 맑고 시원하며, 몸은 포근하고 따뜻합니다.', pause: 7 },
      { text: '모든 잡념과 피로가 씻겨 나가고 머릿속이 맑은 이슬처럼 투명해집니다.', pause: 6 }
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
      { text: '자율훈련법 전 과정이 모두 편안하게 끝났습니다.', pause: 4 },
      { text: '지금 당신의 몸과 마음은 가장 깊고 평화로운 이완 상태에 머물러 있습니다.', pause: 5 },
      { text: '몸을 억지로 움직이지 마시고, 이 포근하고 아늑한 온기 속에서 그대로 편안하게 잠에 드세요.', pause: 6 },
      { text: '오늘 하루도 참 고생 많으셨어요. 좋은 꿈 꾸시고 편안한 밤 되세요.', pause: 8 }
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
      { text: '자율훈련법 전 과정을 마쳤습니다. 이제 상쾌한 일상으로 돌아오기 위해 소거 동작을 함께 해요.', pause: 4 },
      { text: '첫째, 양손을 단단하게 주먹 쥐었다 폅니다. 하나, 둘, 셋.', pause: 4 },
      { text: '둘째, 팔을 힘차게 굽혔다 펴며 기지개를 쭉 켭니다. 하나, 둘, 셋.', pause: 4 },
      { text: '셋째, 신선한 공기를 깊게 들이마시고... 시원하게 내쉽니다.', pause: 4 },
      { text: '이제 눈을 번쩍 뜹니다! 온몸에 상쾌하고 맑은 활력이 가득 차올라요.', pause: 4 }
    ]
  }
];

// 4가지 특화 여성 보이스 프로필 정의 (구글, MS, 애플 등 브라우저 음성 엔진 연동)
const FEMALE_VOICE_PROFILES = [
  {
    id: 'google_warm',
    name: '구글 스타일: 맑고 다정한 여성 톤',
    badge: 'Google Warm Female',
    desc: '맑고 온화한 음색으로 친절하고 다정하게 안내합니다.',
    preferredKeywords: ['Google', '한국의', 'Korean', 'kr'],
    pitch: 1.14,
    rate: 0.80,
    previewText: '마음이 아주 차분해지고 있습니다. 온몸이 따뜻하고 편안합니다.'
  },
  {
    id: 'ms_calm',
    name: '선희/헤미 스타일: 차분한 수면 톤',
    badge: 'Calm Bedtime',
    desc: '속삭이듯 조용하고 포근하여 밤에 잠들기 좋은 음색입니다.',
    preferredKeywords: ['SunHi', 'Heami', '헤미', '선희', 'Natural'],
    pitch: 1.04,
    rate: 0.76,
    previewText: '온몸의 긴장이 풀려나갑니다. 그대로 편안하게 잠에 드세요.'
  },
  {
    id: 'meditation_clear',
    name: '명상 강사 스타일: 청아하고 맑은 톤',
    badge: 'Meditation Master',
    desc: '맑고 또렷하면서도 깊은 이완을 이끄는 전문 명상 지도자 음색입니다.',
    preferredKeywords: ['Yuna', '유나', 'Female'],
    pitch: 1.20,
    rate: 0.82,
    previewText: '양팔과 양다리가 아주 무겁습니다. 깊은 평온을 느껴보세요.'
  },
  {
    id: 'natural_soft',
    name: '내추럴 스타일: 자연스럽고 편안한 톤',
    badge: 'Natural Balance',
    desc: '자연스러운 억양으로 오래 들어도 귀가 편안한 기본 음색입니다.',
    preferredKeywords: [],
    pitch: 1.08,
    rate: 0.80,
    previewText: '호흡이 지극히 편안합니다. 숨이 저절로 부드럽게 쉬어집니다.'
  }
];

class VoiceGuide {
  constructor() {
    this.synth = window.speechSynthesis;
    this.voices = [];
    this.selectedVoice = null;
    this.currentProfileId = 'google_warm';
    this.speechRate = 0.80;
    this.speechPitch = 1.14;
    this.mode = 'sleep';
    this.coursePreset = 'standard';
    this.silenceMultiplier = 1.0;

    this.isPlaying = false;
    this.isPaused = false;
    this.currentStageIndex = 0;
    this.currentSentenceIndex = 0;
    this.activeStages = [];
    this.timerId = null;
    this.countdownTimer = null;
    this.currentUtterance = null;

    this.onStageChange = null;
    this.onSentenceChange = null;
    this.onProgressUpdate = null;
    this.onComplete = null;
    this.onCountdownTick = null;
    this.onVoicesReady = null;

    this.initVoices();
  }

  initVoices() {
    const updateVoices = () => {
      const allVoices = this.synth.getVoices();
      this.voices = allVoices.filter(v => v.lang.startsWith('ko') || v.lang.includes('KR'));

      // 브라우저에 한국어 음성이 명시되지 않은 경우 전체 음성 fallback
      if (this.voices.length === 0 && allVoices.length > 0) {
        this.voices = allVoices;
      }

      this.applyProfile(this.currentProfileId, false);
      if (this.onVoicesReady) this.onVoicesReady(this.voices);
    };

    updateVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = updateVoices;
    }

    // 일부 모바일/브라우저 지연 로드 대응 (폴링)
    setTimeout(updateVoices, 300);
    setTimeout(updateVoices, 800);
    setTimeout(updateVoices, 1500);
  }

  getVoices() {
    return this.voices;
  }

  getProfiles() {
    return FEMALE_VOICE_PROFILES;
  }

  setVoice(voiceURI) {
    const found = this.voices.find(v => v.voiceURI === voiceURI);
    if (found) this.selectedVoice = found;
  }

  setPitch(pitch) {
    this.speechPitch = parseFloat(pitch);
  }

  setRate(rate) {
    this.speechRate = parseFloat(rate);
  }

  setMode(mode) {
    this.mode = mode;
  }

  setCourse(preset) {
    this.coursePreset = preset;
  }

  setSilenceMultiplier(mult) {
    this.silenceMultiplier = parseFloat(mult);
  }

  /**
   * 여성 보이스 프로필 적용
   */
  applyProfile(profileId, updateAudioSettings = true) {
    const profile = FEMALE_VOICE_PROFILES.find(p => p.id === profileId) || FEMALE_VOICE_PROFILES[0];
    this.currentProfileId = profile.id;

    if (updateAudioSettings) {
      this.speechPitch = profile.pitch;
      this.speechRate = profile.rate;
    }

    // 선호 음성 엔진 키워드 매칭
    if (this.voices.length > 0) {
      let matchedVoice = null;
      for (const kw of profile.preferredKeywords) {
        matchedVoice = this.voices.find(v => v.name.includes(kw));
        if (matchedVoice) break;
      }
      if (!matchedVoice) {
        // 일반 여성 음성 탐색
        matchedVoice = this.voices.find(v => 
          v.name.includes('Yuna') || 
          v.name.includes('SunHi') || 
          v.name.includes('Heami') || 
          v.name.includes('Google') || 
          v.name.includes('Female')
        );
      }
      this.selectedVoice = matchedVoice || this.voices[0];
    }

    return profile;
  }

  /**
   * 특정 프로필 또는 현재 설정으로 미리듣기 발화
   */
  previewVoice(profileId = this.currentProfileId, onEnd) {
    this.synth.cancel();
    const profile = FEMALE_VOICE_PROFILES.find(p => p.id === profileId) || FEMALE_VOICE_PROFILES[0];
    
    // 임시 적용
    this.applyProfile(profile.id, true);

    const utter = new SpeechSynthesisUtterance(profile.previewText);
    if (this.selectedVoice) utter.voice = this.selectedVoice;
    utter.rate = this.speechRate;
    utter.pitch = this.speechPitch;
    utter.lang = 'ko-KR';

    utter.onend = () => {
      if (onEnd) onEnd();
    };
    utter.onerror = () => {
      if (onEnd) onEnd();
    };

    this.synth.speak(utter);
  }

  buildStageSequence() {
    const finishStageId = this.mode === 'sleep' ? 'finish_sleep' : 'finish_awake';
    const finishStage = AUTOGENIC_STAGES.find(s => s.id === finishStageId);

    if (this.coursePreset === 'quick') {
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
            { text: '첫 번째 중량감이에요. 양팔과 양다리가 아주 무겁습니다... 온몸이 바닥으로 기분 좋게 가라앉아요.', pause: 6 }
          ]
        },
        {
          ...AUTOGENIC_STAGES[2],
          sentences: [
            { text: '두 번째 온열감이에요. 양팔과 양다리가 아주 따뜻합니다... 손발 끝까지 포근한 온기가 가득 번져요.', pause: 6 }
          ]
        },
        {
          ...AUTOGENIC_STAGES[4],
          sentences: [
            { text: '네 번째 호흡이에요. 숨이 저절로 편안하게 쉬어집니다. 지극히 평온해요.', pause: 6 }
          ]
        },
        {
          ...AUTOGENIC_STAGES[6],
          sentences: [
            { text: '여섯 번째, 이마가 시원합니다... 머리는 맑고 몸은 포근하게 따뜻해요.', pause: 6 }
          ]
        },
        finishStage
      ];
      return stages;
    } else if (this.coursePreset === 'deep') {
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
      return AUTOGENIC_STAGES.slice(0, 7).concat([finishStage]);
    }
  }

  start(prepSeconds = 10) {
    this.stop();
    this.isPlaying = true;
    this.isPaused = false;
    this.activeStages = this.buildStageSequence();
    this.currentStageIndex = 0;
    this.currentSentenceIndex = 0;

    if (window.audioEngine) {
      window.audioEngine.startAmbient();
      window.audioEngine.playSingingBowl(528, 5.0);
    }

    if (prepSeconds > 0) {
      let count = prepSeconds;
      if (this.onCountdownTick) this.onCountdownTick(count);

      this.speakSilentNotice('자리에 편안하게 누워 자세를 정돈해 보세요.');

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
      if (window.audioEngine) {
        const bowlFreq = 528 + (this.currentStageIndex % 5) * 44;
        window.audioEngine.playSingingBowl(bowlFreq, 4.5);
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

    if (window.audioEngine) {
      window.audioEngine.duck(0.28, 0.4);
    }

    const utter = new SpeechSynthesisUtterance(text);
    if (this.selectedVoice) utter.voice = this.selectedVoice;
    utter.rate = this.speechRate;
    utter.pitch = this.speechPitch;
    utter.lang = 'ko-KR';

    utter.onend = () => {
      if (window.audioEngine) {
        window.audioEngine.unduck(1.4);
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

window.voiceGuide = new VoiceGuide();
