// 달빛 도서관과 보리 — 책 뷰어 스크립트
(() => {
  // file:// 환경에서 fetch가 막힐 때 사용할 인라인 fallback 데이터
  const INLINE_DATA = {
    "title": "달빛 도서관과 보리",
    "subtitle": "잠 못 드는 밤, 책 한 권이 날아왔어요",
    "author": "AI 동화 작가",
    "pages": [
      { "type": "cover", "image": "book/images/cover.png", "title": "달빛 도서관과 보리", "subtitle": "잠 못 드는 밤, 책 한 권이 날아왔어요", "author": "AI 동화 작가" },
      { "type": "scene", "number": 1, "title": "잠 못 드는 밤", "body": "보리는 이불 속에서 데구르르 뒤척였어요. 창밖에는 둥근 보름달이 빛나고 있었지요. \"오늘은 잠이 안 와…\" 보리는 베개를 꼭 끌어안고 한숨을 폭 쉬었답니다.", "image": "book/images/scene_01.png" },
      { "type": "scene", "number": 2, "title": "창밖의 부드러운 빛", "body": "그때 창밖에서 사르륵, 종이 넘기는 소리가 들렸어요. 보리가 눈을 동그랗게 떴더니, 작은 책 한 권이 나비처럼 펄럭이며 다가오고 있었지 뭐예요! 책에서는 따뜻한 금빛이 새어 나왔어요.", "image": "book/images/scene_02.png" },
      { "type": "scene", "number": 3, "title": "책을 따라가요", "body": "보리는 살그머니 창문을 열었어요. 책은 \"따라와\" 하듯 폴짝폴짝 앞장섰지요. 구름 위로 종이 페이지가 한 장씩 깔리며 길이 되었답니다. 보리는 슬리퍼를 신고 사뿐사뿐 걸어 올라갔어요.", "image": "book/images/scene_03.png" },
      { "type": "scene", "number": 4, "title": "달빛 도서관", "body": "구름을 다 지나자, 와아- 거대한 달빛 도서관이 떠 있었어요! 책장은 하늘 끝까지 닿아 있고, 책들이 새처럼 날아다녔지요. 모든 것이 은빛 달빛에 잠겨 있었답니다.", "image": "book/images/scene_04.png" },
      { "type": "scene", "number": 5, "title": "수줍은 친구를 만나요", "body": "책장 사이에서 빛나는 무언가가 살짝 고개를 내밀었어요. 별처럼 반짝이는 꼬리를 가진 작은 여우였답니다. \"안녕… 나는 별여우야.\" 별여우는 부끄러운 듯 작게 속삭였어요.", "image": "book/images/scene_05.png" },
      { "type": "scene", "number": 6, "title": "색이 빠진 그림책", "body": "별여우는 한 권의 그림책을 보여 주었어요. 그런데 어머나, 책의 색이 흐릿하게 바래고 있었지 뭐예요. \"오랫동안 아무도 읽어 주지 않아서 이야기가 잠들고 있어.\" 별여우의 목소리가 떨렸어요.", "image": "book/images/scene_06.png" },
      { "type": "scene", "number": 7, "title": "함께 읽는 이야기", "body": "보리는 별여우의 곁에 앉아 책을 펼쳤어요. \"옛날 옛날에…\" 보리가 부드럽게 읽어 가자 책에서 색깔들이 폭, 폭 피어났답니다. 그림 속 토끼가 깡충, 무지개가 활짝! 둘은 까르르 함께 웃었어요.", "image": "book/images/scene_07.png" },
      { "type": "scene", "number": 8, "title": "달콤한 꿈", "body": "이야기가 끝나자, 보리는 어느새 자기 방 침대에 폭 안겨 있었어요. 머리맡에는 그 작은 책이 사르륵 빛나고 있었고요. 보리는 살며시 웃으며 잠이 들었어요. \"잘 자, 별여우. 또 만나자.\"", "image": "book/images/scene_08.png" },
      { "type": "ending", "message": "잠이 안 오는 밤이면 책을 펼쳐 보세요.\n어쩌면 작은 친구가 당신을 기다리고 있을지 몰라요.", "image": "book/images/scene_08.png" }
    ]
  };

  const $ = (sel) => document.querySelector(sel);
  const trackEl = $('#page-track');
  const prevBtn = $('#prev');
  const nextBtn = $('#next');
  const indicator = $('#indicator');
  const dotsEl = $('#dots');
  const edgePrev = $('#edge-prev');
  const edgeNext = $('#edge-next');
  const restartBtn = $('#restart-btn');
  const fullscreenBtn = $('#fullscreen-btn');
  const bookEl = $('#book');
  const playBtn = $('#play-btn');
  const soundBtn = $('#sound-btn');

  let data = null;
  let currentIdx = 0;
  let pageEls = [];
  let isAnimating = false;

  // ── 자동 낭독 + BGM 상태 ──
  let isPlaying = false;
  let bgmOn = true;
  let bgm = null;
  let narrationTimer = null;
  let preferredVoice = null;
  const narrationAudio = new Audio();
  narrationAudio.preload = 'auto';

  async function loadData() {
    try {
      const res = await fetch('book.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('book.json fetch failed');
      return await res.json();
    } catch (e) {
      console.info('[viewer] fetch unavailable (likely file://), using inline data.');
      return INLINE_DATA;
    }
  }

  function buildPages() {
    trackEl.innerHTML = '';
    pageEls = data.pages.map((p, i) => {
      const el = document.createElement('article');
      el.className = `page ${p.type}`;
      el.dataset.idx = i;
      if (p.type === 'cover') {
        el.innerHTML = `
          <div class="cover-img" role="img" aria-label="표지: ${escapeHtml(p.title)}" style="background-image:url('${p.image}')"></div>
          <div class="cover-text">
            <h1>${escapeHtml(p.title)}</h1>
            <p class="subtitle">${escapeHtml(p.subtitle || '')}</p>
            <span class="author">${escapeHtml(p.author || '')}</span>
          </div>
        `;
      } else if (p.type === 'scene') {
        el.innerHTML = `
          <div class="scene-img" role="img" aria-label="장면 ${p.number}: ${escapeHtml(p.title)}" style="background-image:url('${p.image}')"></div>
          <div class="scene-text">
            <div class="scene-num">SCENE · ${String(p.number).padStart(2,'0')}</div>
            <h2 class="scene-title">${escapeHtml(p.title)}</h2>
            <p class="scene-body">${escapeHtml(p.body)}</p>
          </div>
        `;
      } else if (p.type === 'ending') {
        el.style.setProperty('--ending-bg', `url('${p.image}')`);
        el.innerHTML = `
          <div class="ending-inner">
            <span class="ending-mark">FIN</span>
            <p class="ending-message">${escapeHtml(p.message)}</p>
            <button class="ending-btn" id="restart-end">처음부터 다시 읽기</button>
          </div>
        `;
      }
      trackEl.appendChild(el);
      return el;
    });

    // 이미지 로딩 표시 (필요 시 .loading 클래스를 토글하는 향상된 로직을 추가 가능)

    // 점 인디케이터
    dotsEl.innerHTML = '';
    data.pages.forEach((_, i) => {
      const d = document.createElement('span');
      d.className = 'dot';
      d.dataset.idx = i;
      d.addEventListener('click', () => goTo(i));
      dotsEl.appendChild(d);
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function render() {
    pageEls.forEach((el, i) => {
      el.classList.remove('active', 'leaving', 'entering-back');
      if (i === currentIdx) el.classList.add('active');
    });
    indicator.textContent = `${currentIdx + 1} / ${data.pages.length}`;
    Array.from(dotsEl.children).forEach((d, i) => {
      d.classList.toggle('active', i === currentIdx);
    });
    prevBtn.disabled = currentIdx === 0;
    nextBtn.disabled = currentIdx === data.pages.length - 1;

    // 메타 타이틀 업데이트
    const p = data.pages[currentIdx];
    const metaEl = document.getElementById('meta-title');
    if (metaEl) {
      if (p.type === 'cover') metaEl.textContent = data.title;
      else if (p.type === 'scene') metaEl.textContent = `${data.title} · ${p.title}`;
      else metaEl.textContent = `${data.title} · 끝`;
    }

    // 새로 만든 ending 버튼 바인딩
    const restartEnd = document.getElementById('restart-end');
    if (restartEnd) restartEnd.onclick = () => goTo(0);
  }

  function goTo(idx) {
    if (isAnimating) return;
    if (idx < 0 || idx >= data.pages.length) return;
    if (idx === currentIdx) return;
    const goingForward = idx > currentIdx;
    const oldIdx = currentIdx;
    isAnimating = true;

    if (!goingForward) {
      pageEls[idx].classList.add('entering-back');
      // 약간의 reflow 강제 후 active 전환
      void pageEls[idx].offsetWidth;
    }
    pageEls[oldIdx].classList.add('leaving');
    pageEls[oldIdx].classList.remove('active');
    pageEls[idx].classList.add('active');
    pageEls[idx].classList.remove('entering-back');

    currentIdx = idx;
    // 부분 업데이트
    indicator.textContent = `${currentIdx + 1} / ${data.pages.length}`;
    Array.from(dotsEl.children).forEach((d, i) => d.classList.toggle('active', i === currentIdx));
    prevBtn.disabled = currentIdx === 0;
    nextBtn.disabled = currentIdx === data.pages.length - 1;

    // 메타 타이틀
    const p = data.pages[currentIdx];
    const metaEl = document.getElementById('meta-title');
    if (metaEl) {
      if (p.type === 'cover') metaEl.textContent = data.title;
      else if (p.type === 'scene') metaEl.textContent = `${data.title} · ${p.title}`;
      else metaEl.textContent = `${data.title} · 끝`;
    }

    setTimeout(() => {
      pageEls[oldIdx].classList.remove('leaving');
      isAnimating = false;
      const restartEnd = document.getElementById('restart-end');
      if (restartEnd) restartEnd.onclick = () => goTo(0);
    }, 560);
  }

  function reSyncNarration() {
    if (!isPlaying) return;
    clearTimeout(narrationTimer);
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    try { narrationAudio.pause(); } catch (e) {}
    setTimeout(() => { if (isPlaying) speakCurrent(); }, 580);
  }
  function next() { goTo(currentIdx + 1); reSyncNarration(); }
  function prev() { goTo(currentIdx - 1); reSyncNarration(); }

  function bindEvents() {
    nextBtn.addEventListener('click', next);
    prevBtn.addEventListener('click', prev);
    edgePrev.addEventListener('click', prev);
    edgeNext.addEventListener('click', next);
    restartBtn.addEventListener('click', () => goTo(0));
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
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault(); next();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault(); prev();
      } else if (e.key === 'Home') {
        e.preventDefault(); goTo(0);
      } else if (e.key === 'End') {
        e.preventDefault(); goTo(data.pages.length - 1);
      }
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

  // 이미지 프리로딩
  function preloadImages() {
    data.pages.forEach(p => {
      if (p.image) {
        const img = new Image();
        img.src = p.image;
      }
    });
  }

  // ───────────────────── 자동 낭독 + BGM ─────────────────────
  function pickVoice() {
    if (!('speechSynthesis' in window)) return;
    const all = speechSynthesis.getVoices() || [];
    const ko = all.filter(v => /ko[-_]?KR/i.test(v.lang) || /korean|한국/i.test(v.name));
    const male = ko.find(v => /injoon|male|남성|남자|hyunsu/i.test(v.name));
    preferredVoice = male || ko[0] || null;
  }

  function pageText(p) {
    if (!p) return '';
    if (p.type === 'cover') return [p.title, p.subtitle].filter(Boolean).join('. ');
    if (p.type === 'ending') return p.message || '';
    return [p.title, p.body].filter(Boolean).join('. ');
  }

  function speakCurrent() {
    if (!isPlaying) return;
    const p = data.pages[currentIdx];
    if (p && p.audio) {
      try {
        narrationAudio.src = p.audio;
        narrationAudio.onended = () => { if (isPlaying) advanceAfterNarration(); };
        narrationAudio.onerror = () => { if (isPlaying) advanceAfterNarration(); };
        narrationAudio.play().catch(() => scheduleAdvanceByTimer());
        return;
      } catch (e) {}
    }
    if (!('speechSynthesis' in window)) { scheduleAdvanceByTimer(); return; }
    speechSynthesis.cancel();
    const raw = pageText(p).replace(/\s*\n\s*/g, ' ').trim();
    if (!raw) { scheduleAdvanceByTimer(); return; }
    const chunks = raw.match(/[^.!?。…\n]+[.!?。…]*/g) || [raw];
    let i = 0;
    const speakNext = () => {
      if (!isPlaying) return;
      if (i >= chunks.length) { advanceAfterNarration(); return; }
      const u = new SpeechSynthesisUtterance(chunks[i].trim());
      if (preferredVoice) u.voice = preferredVoice;
      u.lang = (preferredVoice && preferredVoice.lang) || 'ko-KR';
      u.rate = 0.95; u.pitch = 0.8; u.volume = 1.0;
      u.onend = () => { i++; speakNext(); };
      u.onerror = () => { i++; speakNext(); };
      speechSynthesis.speak(u);
    };
    speakNext();
  }

  function advanceAfterNarration() {
    clearTimeout(narrationTimer);
    if (currentIdx >= data.pages.length - 1) { stopPlay(); return; }
    narrationTimer = setTimeout(() => {
      if (!isPlaying) return;
      goTo(currentIdx + 1);
      setTimeout(() => { if (isPlaying) speakCurrent(); }, 580);
    }, 900);
  }

  function scheduleAdvanceByTimer() {
    clearTimeout(narrationTimer);
    if (currentIdx >= data.pages.length - 1) { stopPlay(); return; }
    narrationTimer = setTimeout(() => {
      if (!isPlaying) return;
      goTo(currentIdx + 1);
      setTimeout(() => { if (isPlaying) speakCurrent(); }, 580);
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

  function startBGM() {
    if (bgm) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const ctx = new AC();
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.0001, ctx.currentTime);
      master.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 3);
      master.connect(ctx.destination);
      const chords = [
        [261.63, 329.63, 392.00],
        [220.00, 261.63, 329.63],
        [174.61, 220.00, 261.63],
        [196.00, 246.94, 293.66],
      ];
      const state = { ctx, master, stopped: false, timer: null, idx: 0 };
      const playChord = () => {
        if (state.stopped) return;
        const now = ctx.currentTime;
        const dur = 4.2;
        chords[state.idx].forEach(freq => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = 'sine';
          o.frequency.value = freq;
          g.gain.setValueAtTime(0, now);
          g.gain.linearRampToValueAtTime(0.5, now + 1.3);
          g.gain.linearRampToValueAtTime(0, now + dur);
          o.connect(g); g.connect(master);
          o.start(now); o.stop(now + dur + 0.1);
        });
        state.idx = (state.idx + 1) % chords.length;
        state.timer = setTimeout(playChord, dur * 1000 * 0.9);
      };
      bgm = {
        stop() {
          state.stopped = true;
          clearTimeout(state.timer);
          try { master.gain.cancelScheduledValues(ctx.currentTime); master.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 1); } catch (e) {}
          setTimeout(() => { try { ctx.close(); } catch (e) {} }, 1200);
        }
      };
      if (ctx.state === 'suspended') ctx.resume();
      playChord();
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
    render();
    preloadImages();
    bookEl.focus();
  }

  init();
})();
