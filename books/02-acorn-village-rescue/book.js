// 도토리 마을 구출 작전 — 장편 doodle 뷰어
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

  let data = null;
  let currentIdx = 0;
  let pageEls = [];
  let isAnimating = false;

  async function loadData() {
    try {
      const res = await fetch('book.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('book.json fetch failed');
      return await res.json();
    } catch (e) {
      console.warn('[viewer] book.json fetch failed. Long book requires a static server. Try: python3 -m http.server');
      // 인라인 fallback이 너무 커서 분리 — 빈 페이지 안내 표시
      return {
        title: '도토리 마을 구출 작전',
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
    try { localStorage.setItem('acorn-village-progress', String(currentIdx)); } catch (e) {}
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

    try { localStorage.setItem('acorn-village-progress', String(currentIdx)); } catch (e) {}

    setTimeout(() => {
      pageEls[oldIdx].classList.remove('leaving');
      isAnimating = false;
      const restartEnd = document.getElementById('restart-end');
      if (restartEnd) restartEnd.onclick = () => goTo(0);
    }, 500);

    // 페이지 ±3 lazy 이미지 강제 로드는 background-image 라 자동
  }

  function next() { goTo(currentIdx + 1); }
  function prev() { goTo(currentIdx - 1); }

  function bindEvents() {
    nextBtn.addEventListener('click', next);
    prevBtn.addEventListener('click', prev);
    edgePrev.addEventListener('click', prev);
    edgeNext.addEventListener('click', next);
    restartBtn.addEventListener('click', () => goTo(0));
    tocBtn.addEventListener('click', openTOC);
    tocClose.addEventListener('click', closeTOC);
    tocOverlay.addEventListener('click', closeTOC);

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

  async function init() {
    data = await loadData();
    document.title = data.title;
    buildPages();
    bindEvents();

    // 마지막 읽은 페이지 복원 (선택)
    let saved = null;
    try {
      const v = localStorage.getItem('acorn-village-progress');
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
