// 네버랜드의 연우 — 장편 doodle 뷰어
(() => {
  // file:// 폴백 데이터는 별도 파일로 분리하여 빌드 시 인라인 주입 가능
  const INLINE_FALLBACK_URL = 'book.json';

  const $ = (sel) => document.querySelector(sel);
  const trackEl = $('#page-track');
  const prevBtn = $('#prev');
  const nextBtn = $('#next');
  const indicator = $('#indicator');
  const progressFill = $('#progress-fill');
  const chapterLabel = $('#chapter-label');
  const edgePrev = $('#edge-prev');
  const edgeNext = $('#edge-next');
  const restartBtn = $('#restart-btn');
  const fullscreenBtn = $('#fullscreen-btn');
  const bookEl = $('#book');
  const tocBtn = $('#toc-btn');
  const tocPanel = $('#toc-panel');
  const tocOverlay = $('#toc-overlay');
  const tocClose = $('#toc-close');
  const tocList = $('#toc-list');
  const playBtn = $('#play-btn');
  const soundBtn = $('#sound-btn');

  let data = null;
  let currentIdx = 0;
  let pageEls = [];
  let isAnimating = false;

  // ── 자동 낭독 + BGM 상태 ──
  let isPlaying = false;       // 자동 재생(낭독+넘김) 중인지
  let bgmOn = true;            // 배경음 on/off
  let bgm = null;              // Web Audio BGM 핸들
  let narrationTimer = null;   // 페이지 전환 타이머
  let preferredVoice = null;   // 선택된 한국어(가능하면 남성) 음성
  const narrationAudio = new Audio(); // page.audio(미리 만든 mp3) 재생용
  narrationAudio.preload = 'auto';

  async function loadData() {
    try {
      const res = await fetch('book.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('book.json fetch failed');
      return await res.json();
    } catch (e) {
      console.warn('[viewer] book.json fetch failed. Long book requires a static server. Try: python3 -m http.server');
      // 인라인 fallback이 너무 커서 분리 — 빈 페이지 안내 표시
      return {
        title: '네버랜드의 연우',
        subtitle: '책 데이터 로딩 실패',
        author: '',
        chapters: [],
        pages: [{
          type: 'cover',
          image: '',
          title: '책 데이터를 로드할 수 없습니다',
          subtitle: 'file:// 로 열면 book.json 을 못 읽을 수 있어요. python3 -m http.server 로 서버를 띄워 주세요.',
          author: ''
        }]
      };
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function buildPages() {
    trackEl.innerHTML = '';
    pageEls = data.pages.map((p, i) => {
      const el = document.createElement('article');
      el.className = `page ${p.type}`;
      el.dataset.idx = i;
      if (p.type === 'cover') {
        el.innerHTML = `
          <div class="cover-img" role="img" aria-label="표지: ${escapeHtml(p.title)}" style="background-image:url('${escapeHtml(p.image)}')"></div>
          <div class="cover-text">
            <h1>${escapeHtml(p.title)}</h1>
            <p class="subtitle">${escapeHtml(p.subtitle || '')}</p>
            <span class="author">${escapeHtml(p.author || '')}</span>
          </div>
        `;
      } else if (p.type === 'chapter-opener') {
        el.innerHTML = `
          <div class="img-side" role="img" aria-label="챕터 ${p.chapter}: ${escapeHtml(p.title)}" style="background-image:url('${escapeHtml(p.image)}')"></div>
          <div class="text-side">
            <div class="chapter-mark">CHAPTER · ${String(p.chapter).padStart(2,'0')}</div>
            <h2 class="chapter-big-title">${escapeHtml(p.chapter_title)}</h2>
            <p class="chapter-summary">${escapeHtml(p.chapter_summary || '')}</p>
            <p class="chapter-body">${escapeHtml(p.body)}</p>
          </div>
        `;
      } else if (p.type === 'scene') {
        el.innerHTML = `
          <div class="scene-img" role="img" aria-label="장면 ${p.number}: ${escapeHtml(p.title)}" style="background-image:url('${escapeHtml(p.image)}')"></div>
          <div class="scene-text">
            <div class="scene-num">PAGE · ${String(p.number).padStart(2,'0')}</div>
            <h2 class="scene-title">${escapeHtml(p.title)}</h2>
            <p class="scene-body">${escapeHtml(p.body)}</p>
          </div>
        `;
      } else if (p.type === 'ending') {
        el.style.setProperty('--ending-bg', `url('${escapeHtml(p.image)}')`);
        el.innerHTML = `
          <div class="ending-inner">
            <span class="ending-mark">END · 끝</span>
            <p class="ending-message">${escapeHtml(p.message)}</p>
            <button class="ending-btn" id="restart-end">처음부터 다시 읽기</button>
          </div>
        `;
      }
      trackEl.appendChild(el);
      return el;
    });

    buildTOC();
  }

  function buildTOC() {
    tocList.innerHTML = '';
    const items = [];
    // 표지를 첫 항목으로
    items.push({ idx: 0, num: 'COVER', title: data.title, summary: data.subtitle });
    // 챕터들
    (data.chapters || []).forEach((c) => {
      // 챕터 첫 페이지 인덱스 = book.json 의 pages 배열에서 해당 chapter-opener 위치
      const pageIdx = data.pages.findIndex(p => p.type === 'chapter-opener' && p.chapter === c.number);
      if (pageIdx >= 0) {
        items.push({
          idx: pageIdx,
          num: `Ch. ${String(c.number).padStart(2, '0')}`,
          title: c.title,
          summary: c.summary
        });
      }
    });
    // 엔딩
    const endingIdx = data.pages.findIndex(p => p.type === 'ending');
    if (endingIdx >= 0) items.push({ idx: endingIdx, num: 'END', title: '끝', summary: '다시 읽기' });

    items.forEach(item => {
      const li = document.createElement('li');
      li.className = 'toc-item';
      li.dataset.targetIdx = item.idx;
      li.innerHTML = `
        <button>
          <span class="toc-num">${escapeHtml(item.num)}</span>
          <span class="toc-text">
            <span class="toc-title">${escapeHtml(item.title)}</span>
            <span class="toc-summary">${escapeHtml(item.summary || '')}</span>
          </span>
        </button>
      `;
      li.querySelector('button').addEventListener('click', () => {
        goTo(item.idx);
        closeTOC();
      });
      tocList.appendChild(li);
    });
  }

  function updateTOCActive() {
    Array.from(tocList.children).forEach(li => {
      const target = parseInt(li.dataset.targetIdx, 10);
      // 현재 페이지가 이 항목의 범위에 속하는지 — 다음 항목 직전까지
      const next = li.nextElementSibling
        ? parseInt(li.nextElementSibling.dataset.targetIdx, 10)
        : Infinity;
      li.classList.toggle('active', currentIdx >= target && currentIdx < next);
    });
  }

  function openTOC() {
    tocPanel.classList.add('open');
    tocOverlay.classList.add('open');
    tocPanel.setAttribute('aria-hidden', 'false');
    tocOverlay.setAttribute('aria-hidden', 'false');
  }
  function closeTOC() {
    tocPanel.classList.remove('open');
    tocOverlay.classList.remove('open');
    tocPanel.setAttribute('aria-hidden', 'true');
    tocOverlay.setAttribute('aria-hidden', 'true');
  }

  function updateChapterLabel() {
    const p = data.pages[currentIdx];
    if (!p) return;
    if (p.type === 'cover') chapterLabel.textContent = data.title;
    else if (p.type === 'ending') chapterLabel.textContent = '끝';
    else chapterLabel.textContent = `Ch. ${String(p.chapter).padStart(2, '0')} · ${p.chapter_title}`;
  }

  function render() {
    pageEls.forEach((el, i) => {
      el.classList.remove('active', 'leaving', 'entering-back');
      if (i === currentIdx) el.classList.add('active');
    });
    indicator.textContent = `${currentIdx + 1} / ${data.pages.length}`;
    progressFill.style.width = `${((currentIdx + 1) / data.pages.length) * 100}%`;
    prevBtn.disabled = currentIdx === 0;
    nextBtn.disabled = currentIdx === data.pages.length - 1;
    updateChapterLabel();
    updateTOCActive();

    const restartEnd = document.getElementById('restart-end');
    if (restartEnd) restartEnd.onclick = () => goTo(0);

    // 로컬 스토리지에 진행 저장
    try { localStorage.setItem('neverland-progress', String(currentIdx)); } catch (e) {}
  }

  function goTo(idx) {
    if (isAnimating) return;
    if (idx < 0 || idx >= data.pages.length) return;
    if (idx === currentIdx) return;
    const oldIdx = currentIdx;
    const goingForward = idx > currentIdx;
    isAnimating = true;

    if (!goingForward) {
      pageEls[idx].classList.add('entering-back');
      void pageEls[idx].offsetWidth;
    }
    pageEls[oldIdx].classList.add('leaving');
    pageEls[oldIdx].classList.remove('active');
    pageEls[idx].classList.add('active');
    pageEls[idx].classList.remove('entering-back');

    currentIdx = idx;
    indicator.textContent = `${currentIdx + 1} / ${data.pages.length}`;
    progressFill.style.width = `${((currentIdx + 1) / data.pages.length) * 100}%`;
    prevBtn.disabled = currentIdx === 0;
    nextBtn.disabled = currentIdx === data.pages.length - 1;
    updateChapterLabel();
    updateTOCActive();

    try { localStorage.setItem('neverland-progress', String(currentIdx)); } catch (e) {}

    setTimeout(() => {
      pageEls[oldIdx].classList.remove('leaving');
      isAnimating = false;
      const restartEnd = document.getElementById('restart-end');
      if (restartEnd) restartEnd.onclick = () => goTo(0);
    }, 500);

    // 페이지 ±3 lazy 이미지 강제 로드는 background-image 라 자동
  }

  function reSyncNarration() {
    if (!isPlaying) return;
    clearTimeout(narrationTimer);
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    try { narrationAudio.pause(); } catch (e) {}
    setTimeout(() => { if (isPlaying) speakCurrent(); }, 560);
  }
  function next() { goTo(currentIdx + 1); reSyncNarration(); }
  function prev() { goTo(currentIdx - 1); reSyncNarration(); }

  function bindEvents() {
    nextBtn.addEventListener('click', next);
    prevBtn.addEventListener('click', prev);
    edgePrev.addEventListener('click', prev);
    edgeNext.addEventListener('click', next);
    restartBtn.addEventListener('click', () => goTo(0));
    tocBtn.addEventListener('click', openTOC);
    tocClose.addEventListener('click', closeTOC);
    tocOverlay.addEventListener('click', closeTOC);
    if (playBtn) playBtn.addEventListener('click', togglePlay);
    if (soundBtn) soundBtn.addEventListener('click', toggleSound);

    fullscreenBtn.addEventListener('click', () => {
      const doc = document;
      if (!doc.fullscreenElement) {
        (doc.documentElement.requestFullscreen || doc.documentElement.webkitRequestFullscreen)?.call(doc.documentElement);
      } else {
        (doc.exitFullscreen || doc.webkitExitFullscreen)?.call(doc);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && tocPanel.classList.contains('open')) { closeTOC(); return; }
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') { e.preventDefault(); next(); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); prev(); }
      else if (e.key === 'Home') { e.preventDefault(); goTo(0); }
      else if (e.key === 'End') { e.preventDefault(); goTo(data.pages.length - 1); }
      else if (e.key === 't' || e.key === 'T') { e.preventDefault(); tocPanel.classList.contains('open') ? closeTOC() : openTOC(); }
    });

    // 터치 스와이프
    let touchStartX = 0, touchStartY = 0, touchStartTime = 0;
    bookEl.addEventListener('touchstart', (e) => {
      const t = e.touches[0];
      touchStartX = t.clientX; touchStartY = t.clientY;
      touchStartTime = Date.now();
    }, { passive: true });
    bookEl.addEventListener('touchend', (e) => {
      const t = e.changedTouches[0];
      const dx = t.clientX - touchStartX;
      const dy = t.clientY - touchStartY;
      const dt = Date.now() - touchStartTime;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) && dt < 700) {
        if (dx < 0) next(); else prev();
      }
    });
  }

  // 점진적 이미지 프리로드 — 현재 페이지 ±3장만
  function preloadAround() {
    const range = 3;
    for (let i = Math.max(0, currentIdx - range); i <= Math.min(data.pages.length - 1, currentIdx + range); i++) {
      const img = data.pages[i].image;
      if (img) {
        const im = new Image();
        im.src = img;
      }
    }
  }

  // ───────────────────── 자동 낭독 + BGM ─────────────────────
  // 한국어 음성 선택 — 가능하면 남성(아빠) 목소리 우선
  function pickVoice() {
    if (!('speechSynthesis' in window)) return;
    const all = speechSynthesis.getVoices() || [];
    const ko = all.filter(v => /ko[-_]?KR/i.test(v.lang) || /korean|한국/i.test(v.name));
    const male = ko.find(v => /injoon|injoon|male|남성|남자|hyunsu|seoyeon?male/i.test(v.name));
    preferredVoice = male || ko[0] || null;
  }

  // 페이지에서 낭독할 텍스트 추출
  function pageText(p) {
    if (!p) return '';
    if (p.type === 'cover') return [p.title, p.subtitle].filter(Boolean).join('. ');
    if (p.type === 'ending') return p.message || '';
    return (p.body || '');  // 제목 제외, 동화 내용(body)만 낭독
  }

  // 현재 페이지 낭독 — page.audio(mp3) 있으면 우선, 없으면 TTS
  function speakCurrent() {
    if (!isPlaying) return;
    const p = data.pages[currentIdx];
    // 1) 미리 만든 음성 파일이 있으면 그것을 재생 (진짜 아빠 목소리 등)
    if (p && p.audio) {
      try {
        narrationAudio.src = p.audio;
        narrationAudio.onended = () => { if (isPlaying) advanceAfterNarration(); };
        narrationAudio.onerror = () => { if (isPlaying) advanceAfterNarration(); };
        narrationAudio.play().catch(() => scheduleAdvanceByTimer());
        return;
      } catch (e) { /* fall through to TTS */ }
    }
    // 2) 브라우저 음성합성(TTS)
    if (!('speechSynthesis' in window)) { scheduleAdvanceByTimer(); return; }
    speechSynthesis.cancel();
    const raw = pageText(p).replace(/\s*\n\s*/g, ' ').trim();
    if (!raw) { scheduleAdvanceByTimer(); return; }
    // 긴 문장은 크롬 15초 끊김 버그가 있어 문장 단위로 쪼개 큐잉
    const chunks = raw.match(/[^.!?。…\n]+[.!?。…]*/g) || [raw];
    let i = 0;
    const speakNext = () => {
      if (!isPlaying) return;
      if (i >= chunks.length) { advanceAfterNarration(); return; }
      const u = new SpeechSynthesisUtterance(chunks[i].trim());
      if (preferredVoice) u.voice = preferredVoice;
      u.lang = (preferredVoice && preferredVoice.lang) || 'ko-KR';
      u.rate = 0.95;   // 살짝 느리게 — 차분하게
      u.pitch = 0.8;   // 음높이 낮춰 따뜻하고 깊은(아빠 같은) 톤
      u.volume = 1.0;
      u.onend = () => { i++; speakNext(); };
      u.onerror = () => { i++; speakNext(); };
      speechSynthesis.speak(u);
    };
    speakNext();
  }

  // 낭독 끝난 뒤 다음 장으로 (마지막이면 정지)
  function advanceAfterNarration() {
    clearTimeout(narrationTimer);
    if (currentIdx >= data.pages.length - 1) { stopPlay(); return; }
    narrationTimer = setTimeout(() => {
      if (!isPlaying) return;
      goTo(currentIdx + 1);
      setTimeout(() => { if (isPlaying) speakCurrent(); }, 560);
    }, 900);
  }

  // TTS 불가/무음 페이지일 때 시간 타이머로 넘김
  function scheduleAdvanceByTimer() {
    clearTimeout(narrationTimer);
    if (currentIdx >= data.pages.length - 1) { stopPlay(); return; }
    narrationTimer = setTimeout(() => {
      if (!isPlaying) return;
      goTo(currentIdx + 1);
      setTimeout(() => { if (isPlaying) speakCurrent(); }, 560);
    }, 6000);
  }

  function startPlay() {
    isPlaying = true;
    if (playBtn) { playBtn.textContent = '⏸'; playBtn.classList.add('playing'); playBtn.title = '낭독 멈춤'; }
    if (bgmOn) startBGM();
    speakCurrent();
  }
  function stopPlay() {
    isPlaying = false;
    if (playBtn) { playBtn.textContent = '▶'; playBtn.classList.remove('playing'); playBtn.title = '자동 낭독'; }
    clearTimeout(narrationTimer);
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    try { narrationAudio.pause(); } catch (e) {}
    stopBGM();
  }
  function togglePlay() { isPlaying ? stopPlay() : startPlay(); }

  // ── 모험·행진풍 BGM (외부 파일 없이 Web Audio로 합성, 갤로핑 베이스 + 영웅 멜로디 무한 재생) ──
  function startBGM() {
    if (bgm) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const ctx = new AC();
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.0001, ctx.currentTime);
      master.gain.exponentialRampToValueAtTime(0.085, ctx.currentTime + 1.6); // 빠르게 차오르는 모험감
      master.connect(ctx.destination);
      // Em - C - G - D  (i-VI-III-VII : 용맹하고 씩씩한 영웅 여정 진행)
      const chords = [
        [164.81, 196.00, 246.94], // Em
        [130.81, 164.81, 196.00], // C
        [196.00, 246.94, 293.66], // G
        [146.83, 185.00, 220.00], // D
      ];
      // 한 마디당 영웅 멜로디 4음(달리는 들개떼처럼 상승·도약하는 모티프)
      const melodyBars = [
        [659.25, 783.99, 659.25, 987.77], // E G E B
        [523.25, 659.25, 783.99, 659.25], // C E G E
        [587.33, 783.99, 987.77, 783.99], // D G B G
        [440.00, 587.33, 659.25, 880.00], // A D E A
      ];
      const state = { ctx, master, stopped: false, timer: null, idx: 0 };
      const bar = 1.7;        // 한 마디 길이(초) — 빠른 행진 템포
      const beat = bar / 4;   // 네 박(갤로핑 추진력)
      const blip = (freq, t, len, peak, type) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = type;
        o.frequency.value = freq;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(peak, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0008, t + len);
        o.connect(g); g.connect(master);
        o.start(t); o.stop(t + len + 0.02);
      };
      const playBar = () => {
        if (state.stopped) return;
        const now = ctx.currentTime;
        const ch = chords[state.idx];
        const root = ch[0] / 2;
        // 1) 갤로핑 베이스 — 네 박마다 둥, 두-둥 (말발굽/들개 질주 느낌)
        for (let b = 0; b < 4; b++) {
          const t = now + b * beat;
          blip(root, t, beat * 0.55, 0.5, 'triangle');
          blip(root, t + beat * 0.5, beat * 0.3, 0.28, 'triangle'); // 엇박 추진
        }
        // 2) 화음 패드 — 마디 전체를 받쳐주는 든든한 배경
        ch.forEach(freq => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = 'sawtooth';
          o.frequency.value = freq;
          g.gain.setValueAtTime(0, now);
          g.gain.linearRampToValueAtTime(0.10, now + 0.18);
          g.gain.linearRampToValueAtTime(0.06, now + bar * 0.7);
          g.gain.linearRampToValueAtTime(0, now + bar);
          o.connect(g); g.connect(master);
          o.start(now); o.stop(now + bar + 0.05);
        });
        // 3) 영웅 멜로디 — 네 박에 한 음씩, 밝고 또렷하게(square)
        const mel = melodyBars[state.idx];
        for (let b = 0; b < 4; b++) {
          blip(mel[b], now + b * beat + 0.02, beat * 0.85, 0.17, 'square');
        }
        state.idx = (state.idx + 1) % chords.length;
        state.timer = setTimeout(playBar, bar * 1000);
      };
      bgm = {
        stop() {
          state.stopped = true;
          clearTimeout(state.timer);
          try { master.gain.cancelScheduledValues(ctx.currentTime); master.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.8); } catch (e) {}
          setTimeout(() => { try { ctx.close(); } catch (e) {} }, 1000);
        }
      };
      if (ctx.state === 'suspended') ctx.resume();
      playBar();
    } catch (e) { bgm = null; }
  }
  function stopBGM() { if (bgm) { bgm.stop(); bgm = null; } }

  function toggleSound() {
    bgmOn = !bgmOn;
    if (soundBtn) { soundBtn.textContent = bgmOn ? '🔊' : '🔇'; soundBtn.title = bgmOn ? '배경음 끄기' : '배경음 켜기'; }
    if (bgmOn && isPlaying) startBGM(); else stopBGM();
  }

  async function init() {
    data = await loadData();
    document.title = data.title;
    buildPages();
    bindEvents();
    if ('speechSynthesis' in window) {
      pickVoice();
      speechSynthesis.onvoiceschanged = pickVoice;
    }

    // 마지막 읽은 페이지 복원 (선택)
    let saved = null;
    try {
      const v = localStorage.getItem('neverland-progress');
      if (v !== null) saved = parseInt(v, 10);
    } catch (e) {}
    if (saved !== null && saved > 0 && saved < data.pages.length) {
      // 자동 복원하지 않고, 작은 알림으로 처리. 간단히 1페이지부터 시작.
    }
    currentIdx = 0;

    render();
    preloadAround();
    // 페이지 이동 시마다 프리로드
    const origGoTo = goTo;
    // (위 goTo 가 closure 라 직접 후크 못 함 — preload 는 사용자가 페이지 넘길 때마다 자동으로 발생하도록 별도 함수)
    setInterval(preloadAround, 2000); // 가벼운 주기적 프리로드
    bookEl.focus();
  }

  init();
})();
