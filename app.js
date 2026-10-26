/**
 * Autogenic Training App - Main Controller
 * UI 이벤트, 상태 관리, WakeLock, LocalStorage 연동
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM 요소 참조
  const tabBtns = document.querySelectorAll('.nav-tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  // 세션 UI
  const playBtn = document.getElementById('playBtn');
  const playIcon = document.getElementById('playIcon');
  const pauseIcon = document.getElementById('pauseIcon');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  const stageStepTag = document.getElementById('stageStepTag');
  const stageNameDisplay = document.getElementById('stageNameDisplay');
  const stageOrganDisplay = document.getElementById('stageOrganDisplay');
  const breatheRing = document.getElementById('breatheRing');
  const formulaQuote = document.getElementById('formulaQuote');
  const currentSpeechBubble = document.getElementById('currentSpeechBubble');
  const progressFill = document.getElementById('progressFill');
  const progressPercent = document.getElementById('progressPercent');
  const currentSentenceIdx = document.getElementById('currentSentenceIdx');
  const totalSentencesCount = document.getElementById('totalSentencesCount');

  const countdownOverlay = document.getElementById('countdownOverlay');
  const countdownNumber = document.getElementById('countdownNumber');

  const modeBadge = document.getElementById('modeBadge');
  const courseInfo = document.getElementById('courseInfo');

  // 사운드 선택 칩
  const soundChips = document.querySelectorAll('.sound-chip');

  // 암전 슬립 스크린
  const toggleSleepScreenBtn = document.getElementById('toggleSleepScreenBtn');
  const trueBlackScreen = document.getElementById('trueBlackScreen');

  // 설정 UI
  const modeSleepCard = document.getElementById('modeSleepCard');
  const modeAwakeCard = document.getElementById('modeAwakeCard');
  const courseCards = document.querySelectorAll('.course-choice-card');

  const voiceSelect = document.getElementById('voiceSelect');
  const testVoiceBtn = document.getElementById('testVoiceBtn');
  const voicePresetBtns = document.querySelectorAll('.voice-preset-btn');
  const speechPitchSlider = document.getElementById('speechPitchSlider');
  const speechPitchVal = document.getElementById('speechPitchVal');
  const speechRateSlider = document.getElementById('speechRateSlider');
  const speechRateVal = document.getElementById('speechRateVal');
  const silenceSlider = document.getElementById('silenceSlider');
  const silenceVal = document.getElementById('silenceVal');
  const prepTimeSlider = document.getElementById('prepTimeSlider');
  const prepTimeVal = document.getElementById('prepTimeVal');
  const ambientVolSlider = document.getElementById('ambientVolSlider');
  const ambientVolVal = document.getElementById('ambientVolVal');
  const bellVolSlider = document.getElementById('bellVolSlider');
  const bellVolVal = document.getElementById('bellVolVal');

  // 통계 UI
  const statTodayCount = document.getElementById('statTodayCount');
  const statTotalCount = document.getElementById('statTotalCount');
  const statTotalMinutes = document.getElementById('statTotalMinutes');
  const logHistoryList = document.getElementById('logHistoryList');
  const routineAlertMsg = document.getElementById('routineAlertMsg');

  // 상태 변수
  let currentMode = localStorage.getItem('at_mode') || 'sleep';
  let currentCourse = localStorage.getItem('at_course') || 'standard';
  let currentSound = localStorage.getItem('at_sound') || 'crystal';
  let prepSeconds = parseInt(localStorage.getItem('at_prep_sec') || '10', 10);
  let wakeLock = null;

  // 1. 탭 네비게이션
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabTarget = btn.getAttribute('data-tab');
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const activePanel = document.getElementById(`tab-${tabTarget}`);
      if (activePanel) activePanel.classList.add('active');
    });
  });

  // 2. 사운드 칩 UI 연동
  function updateSoundUI(soundType) {
    currentSound = soundType;
    soundChips.forEach(chip => {
      if (chip.getAttribute('data-sound') === soundType) {
        chip.classList.add('selected');
      } else {
        chip.classList.remove('selected');
      }
    });

    localStorage.setItem('at_sound', soundType);
    if (window.audioEngine) {
      window.audioEngine.ambientType = soundType;
      if (window.audioEngine.isPlayingAmbient) {
        window.audioEngine.startAmbient(soundType);
      }
    }
  }

  soundChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const s = chip.getAttribute('data-sound');
      updateSoundUI(s);
    });
  });

  // 3. 모드 및 코스 UI 초기화
  function updateModeUI() {
    if (currentMode === 'sleep') {
      modeSleepCard.classList.add('selected');
      modeAwakeCard.classList.remove('selected');
      modeBadge.className = 'mode-badge';
      modeBadge.innerHTML = '🌙 수면 유도 모드';
    } else {
      modeSleepCard.classList.remove('selected');
      modeAwakeCard.classList.add('selected');
      modeBadge.className = 'mode-badge awake';
      modeBadge.innerHTML = '☀️ 일상 복귀 모드';
    }
    window.voiceGuide.setMode(currentMode);
    localStorage.setItem('at_mode', currentMode);
  }

  function updateCourseUI() {
    courseCards.forEach(card => {
      const course = card.getAttribute('data-course');
      if (course === currentCourse) {
        card.classList.add('selected');
      } else {
        card.classList.remove('selected');
      }
    });

    const courseNames = {
      quick: '⚡ 1~2분 퀵 코스',
      standard: '🌿 3~5분 표준 정통 코스',
      deep: '🌌 8~10분 심층 코스'
    };
    courseInfo.textContent = courseNames[currentCourse] || '🌿 표준 정통 코스';
    window.voiceGuide.setCourse(currentCourse);
    localStorage.setItem('at_course', currentCourse);
  }

  modeSleepCard.addEventListener('click', () => {
    currentMode = 'sleep';
    updateModeUI();
  });

  modeAwakeCard.addEventListener('click', () => {
    currentMode = 'awake';
    updateModeUI();
  });

  courseCards.forEach(card => {
    card.addEventListener('click', () => {
      currentCourse = card.getAttribute('data-course');
      updateCourseUI();
    });
  });

  // 4. 음성 설정 리스너 & 여성 목소리 탐색
  function populateVoiceList() {
    const voices = window.voiceGuide.getVoices();
    voiceSelect.innerHTML = '';
    if (voices.length === 0) {
      const opt = document.createElement('option');
      opt.textContent = '한국어 음성 탐색 중...';
      voiceSelect.appendChild(opt);
      return;
    }

    voices.forEach((v) => {
      const opt = document.createElement('option');
      opt.value = v.voiceURI;
      const isFemale = v.name.includes('Yuna') || v.name.includes('SunHi') || v.name.includes('Heami') || v.name.includes('Female');
      opt.textContent = `${v.name} (${v.lang})${isFemale ? ' [여성]' : ''}`;
      if (window.voiceGuide.selectedVoice && window.voiceGuide.selectedVoice.voiceURI === v.voiceURI) {
        opt.selected = true;
      }
      voiceSelect.appendChild(opt);
    });
  }

  setTimeout(populateVoiceList, 400);
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoiceList;
  }

  voiceSelect.addEventListener('change', (e) => {
    window.voiceGuide.setVoice(e.target.value);
  });

  // 여성 음성 톤 프리셋
  voicePresetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      voicePresetBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      const preset = btn.getAttribute('data-preset');
      window.voiceGuide.setTonePreset(preset);

      // 슬라이더 UI 동기화
      speechPitchSlider.value = window.voiceGuide.speechPitch;
      speechPitchVal.textContent = `${window.voiceGuide.speechPitch}x`;
      speechRateSlider.value = window.voiceGuide.speechRate;
      speechRateVal.textContent = `${window.voiceGuide.speechRate}x`;

      localStorage.setItem('at_pitch', window.voiceGuide.speechPitch);
      localStorage.setItem('at_rate', window.voiceGuide.speechRate);
    });
  });

  // 음성 미리듣기
  testVoiceBtn.addEventListener('click', () => {
    testVoiceBtn.disabled = true;
    testVoiceBtn.style.opacity = '0.6';
    window.voiceGuide.testVoice(() => {
      testVoiceBtn.disabled = false;
      testVoiceBtn.style.opacity = '1';
    });
  });

  speechPitchSlider.addEventListener('input', (e) => {
    const val = e.target.value;
    speechPitchVal.textContent = `${val}x`;
    window.voiceGuide.setPitch(val);
    localStorage.setItem('at_pitch', val);
  });

  speechRateSlider.addEventListener('input', (e) => {
    const val = e.target.value;
    speechRateVal.textContent = `${val}x`;
    window.voiceGuide.setRate(val);
    localStorage.setItem('at_rate', val);
  });

  silenceSlider.addEventListener('input', (e) => {
    const val = e.target.value;
    silenceVal.textContent = `${val}초`;
    window.voiceGuide.setSilenceMultiplier(parseFloat(val) / 5.0);
    localStorage.setItem('at_silence', val);
  });

  prepTimeSlider.addEventListener('input', (e) => {
    prepSeconds = parseInt(e.target.value, 10);
    prepTimeVal.textContent = `${prepSeconds}초`;
    localStorage.setItem('at_prep_sec', prepSeconds);
  });

  ambientVolSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    ambientVolVal.textContent = `${Math.round(val * 100)}%`;
    window.audioEngine.setAmbientVolume(val);
    localStorage.setItem('at_vol_ambient', val);
  });

  bellVolSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    bellVolVal.textContent = `${Math.round(val * 100)}%`;
    window.audioEngine.setBellVolume(val);
    localStorage.setItem('at_vol_bell', val);
  });

  // 저장된 설정 복원
  const savedPitch = localStorage.getItem('at_pitch');
  if (savedPitch) {
    speechPitchSlider.value = savedPitch;
    speechPitchVal.textContent = `${savedPitch}x`;
    window.voiceGuide.setPitch(savedPitch);
  }

  const savedRate = localStorage.getItem('at_rate');
  if (savedRate) {
    speechRateSlider.value = savedRate;
    speechRateVal.textContent = `${savedRate}x`;
    window.voiceGuide.setRate(savedRate);
  }

  const savedSilence = localStorage.getItem('at_silence');
  if (savedSilence) {
    silenceSlider.value = savedSilence;
    silenceVal.textContent = `${savedSilence}초`;
    window.voiceGuide.setSilenceMultiplier(parseFloat(savedSilence) / 5.0);
  }

  prepTimeSlider.value = prepSeconds;
  prepTimeVal.textContent = `${prepSeconds}초`;

  // 5. Wake Lock (화면 꺼짐 방지)
  async function requestWakeLock() {
    try {
      if ('wakeLock' in navigator) {
        wakeLock = await navigator.wakeLock.request('screen');
      }
    } catch (err) {
      console.log('Wake Lock unsupported:', err);
    }
  }

  function releaseWakeLock() {
    if (wakeLock) {
      wakeLock.release().then(() => { wakeLock = null; });
    }
  }

  // 6. 암전 슬립 스크린 제어
  toggleSleepScreenBtn.addEventListener('click', () => {
    trueBlackScreen.classList.add('active');
  });

  trueBlackScreen.addEventListener('click', () => {
    trueBlackScreen.classList.remove('active');
  });

  // 7. VoiceGuide 콜백 바인딩
  window.voiceGuide.onCountdownTick = (count) => {
    countdownOverlay.classList.add('active');
    countdownNumber.textContent = count;
  };

  window.voiceGuide.onStageChange = (stage, stageIdx, totalStages) => {
    countdownOverlay.classList.remove('active');
    breatheRing.classList.add('breathing');

    stageStepTag.textContent = `STEP 0${stageIdx + 1} / 0${totalStages}`;
    stageStepTag.style.color = stage.color || '#38bdf8';
    stageNameDisplay.textContent = stage.name;
    stageOrganDisplay.textContent = `집중 부위: ${stage.organ}`;
    formulaQuote.innerHTML = `공식 <span>"${stage.formula}"</span>`;
    breatheRing.style.borderColor = stage.color ? `${stage.color}88` : 'rgba(56, 189, 248, 0.4)';

    const pct = Math.round(((stageIdx) / totalStages) * 100);
    progressFill.style.width = `${pct}%`;
    progressPercent.textContent = `${pct}%`;
  };

  window.voiceGuide.onSentenceChange = (sentence, sIdx, totalS) => {
    currentSpeechBubble.classList.add('speaking');
    currentSpeechBubble.textContent = sentence.text;
    currentSentenceIdx.textContent = sIdx + 1;
    totalSentencesCount.textContent = totalS;
  };

  window.voiceGuide.onComplete = (mode) => {
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
    breatheRing.classList.remove('breathing');
    releaseWakeLock();

    progressFill.style.width = '100%';
    progressPercent.textContent = '100%';
    currentSpeechBubble.classList.remove('speaking');
    currentSpeechBubble.textContent = mode === 'sleep' 
      ? '훈련이 완료되었습니다. 포근하고 깊은 잠에 드세요...' 
      : '훈련이 완료되었습니다. 맑고 상쾌한 하루를 시작하세요!';

    recordSessionHistory(mode, currentCourse);
    updateStatsUI();
  };

  // 8. 컨트롤 버튼 바인딩
  playBtn.addEventListener('click', () => {
    if (!window.voiceGuide.isPlaying) {
      window.voiceGuide.start(prepSeconds);
      playIcon.style.display = 'none';
      pauseIcon.style.display = 'block';
      requestWakeLock();
    } else if (window.voiceGuide.isPaused) {
      window.voiceGuide.resume();
      playIcon.style.display = 'none';
      pauseIcon.style.display = 'block';
      requestWakeLock();
    } else {
      window.voiceGuide.pause();
      playIcon.style.display = 'block';
      pauseIcon.style.display = 'none';
      breatheRing.classList.remove('breathing');
      releaseWakeLock();
    }
  });

  prevBtn.addEventListener('click', () => {
    window.voiceGuide.prevStage();
  });

  nextBtn.addEventListener('click', () => {
    window.voiceGuide.nextStage();
  });

  // 9. 훈련 기록 및 통계 관리
  function getHistory() {
    try {
      return JSON.parse(localStorage.getItem('at_history') || '[]');
    } catch (e) {
      return [];
    }
  }

  function recordSessionHistory(mode, course) {
    const list = getHistory();
    const durationMinutes = course === 'quick' ? 2 : (course === 'deep' ? 9 : 4);
    const newEntry = {
      timestamp: new Date().toISOString(),
      mode,
      course,
      minutes: durationMinutes
    };
    list.unshift(newEntry);
    localStorage.setItem('at_history', JSON.stringify(list.slice(0, 50)));
  }

  function updateStatsUI() {
    const list = getHistory();
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayList = list.filter(item => item.timestamp.startsWith(todayStr));
    const todayCount = todayList.length;

    statTodayCount.textContent = `${todayCount}회`;
    statTotalCount.textContent = `${list.length}회`;

    const totalMin = list.reduce((acc, cur) => acc + (cur.minutes || 4), 0);
    statTotalMinutes.textContent = `${totalMin}분`;

    if (todayCount === 0) {
      routineAlertMsg.textContent = '💡 오늘은 아직 훈련을 하지 않았습니다. 잠들기 전이나 낮 휴식에 1~2회 실시해보세요.';
      routineAlertMsg.style.borderColor = 'rgba(56, 189, 248, 0.2)';
    } else if (todayCount <= 2) {
      routineAlertMsg.textContent = `✨ 오늘 ${todayCount}회 실시하셨습니다. 전사본 권장대로 하루 1~2회 적정 루틴을 잘 지키고 계십니다!`;
      routineAlertMsg.style.borderColor = 'rgba(16, 185, 129, 0.3)';
    } else if (todayCount === 3) {
      routineAlertMsg.textContent = '🌿 오늘 3회 실시하셨습니다. 하루 권장 상한에 도달했습니다.';
      routineAlertMsg.style.borderColor = 'rgba(234, 179, 8, 0.3)';
    } else {
      routineAlertMsg.textContent = '⚠️ 오늘 4회 이상 실시하셨습니다! 전사본 가이드: 과도한 자기암시 피로 방지를 위해 하루 4회 이상은 권장하지 않습니다.';
      routineAlertMsg.style.borderColor = 'rgba(244, 63, 94, 0.4)';
    }

    logHistoryList.innerHTML = '';
    if (list.length === 0) {
      logHistoryList.innerHTML = '<div style="color:var(--text-dim);font-size:0.8rem;text-align:center;padding:12px;">아직 완료된 훈련 기록이 없습니다.</div>';
      return;
    }

    list.slice(0, 8).forEach(item => {
      const row = document.createElement('div');
      row.className = 'log-item';
      const d = new Date(item.timestamp);
      const timeStr = `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      const modeText = item.mode === 'sleep' ? '🌙 수면' : '☀️ 각성';
      const courseText = item.course === 'quick' ? '1-2분 퀵' : (item.course === 'deep' ? '심층' : '표준');

      row.innerHTML = `
        <span class="log-time">${timeStr} · ${courseText}</span>
        <span class="log-mode-tag" style="background:${item.mode === 'sleep' ? 'rgba(192,132,252,0.15);color:#d8b4fe' : 'rgba(16,185,129,0.15);color:#6ee7b7'}">${modeText}</span>
      `;
      logHistoryList.appendChild(row);
    });
  }

  // 초기화 실행
  updateSoundUI(currentSound);
  updateModeUI();
  updateCourseUI();
  updateStatsUI();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
});
