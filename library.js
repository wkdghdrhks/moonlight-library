// 달빛 도서관 — 라이브러리 홈
(() => {
  const INLINE_FALLBACK = {
    "site_title": "달빛 도서관",
    "tagline": "AI가 그리고 쓴 동화책 모음",
    "books": [
      { "slug": "01-moonlight-library", "title": "달빛 도서관과 보리", "subtitle": "잠 못 드는 밤, 책 한 권이 날아왔어요", "cover": "books/01-moonlight-library/images/cover.png", "pages": 10, "style": "수채화", "tags": ["우정", "상상", "잠자리"], "url": "books/01-moonlight-library/", "added": "2026-05-22" },
      { "slug": "02-acorn-village-rescue", "title": "도토리 마을 구출 작전", "subtitle": "사라진 도토리 시계와 다섯 친구의 모험", "cover": "books/02-acorn-village-rescue/images/cover.png", "pages": 32, "style": "doodle", "tags": ["모험", "동물", "협동"], "url": "books/02-acorn-village-rescue/", "added": "2026-05-22" },
      { "slug": "03-bell-tower-yeonwoo", "title": "종탑 위의 연우", "subtitle": "하늘 가까운 곳에서 울려 퍼진 우정의 종소리", "cover": "books/03-bell-tower-yeonwoo/images/cover.jpg", "pages": 20, "style": "doodle", "tags": ["우정", "용기", "성장"], "url": "books/03-bell-tower-yeonwoo/", "added": "2026-05-29" },
      { "slug": "04-neverland-yeonwoo", "title": "네버랜드의 연우", "subtitle": "둘째 별을 지나, 어른이 되지 않는 섬으로", "cover": "books/04-neverland-yeonwoo/images/cover.jpg", "pages": 20, "style": "모험 수채화", "tags": ["모험", "우정", "용기"], "url": "books/04-neverland-yeonwoo/", "added": "2026-06-01" },
      { "slug": "05-silverfang-yeonwoo", "title": "은빛 명견 연우와 들개 친구들", "subtitle": "산을 지킨 여섯 마리의 용감한 모험", "cover": "books/05-silverfang-yeonwoo/images/cover.jpg", "pages": 10, "style": "모험 수채화", "tags": ["모험", "우정", "협동"], "url": "books/05-silverfang-yeonwoo/", "added": "2026-06-04" },
      { "slug": "06-yeonwoo-drawing-world", "title": "연우가 그린 그림나라", "subtitle": "크레용으로 떠나는 신나는 모험", "cover": "books/06-yeonwoo-drawing-world/images/cover.jpg", "pages": 4, "style": "연우 크레용 그림", "tags": ["연우 그림", "놀이동산", "캠핑"], "url": "books/06-yeonwoo-drawing-world/", "added": "2026-06-05" },
      { "slug": "07-yeonwoo-art-gallery", "title": "연우의 그림 전시회", "subtitle": "연우가 그린 스물다섯 가지 알록달록 세상", "cover": "books/07-yeonwoo-art-gallery/images/cover.jpg", "pages": 27, "style": "연우 그림·만들기", "tags": ["연우 그림", "전시회", "모음집"], "url": "books/07-yeonwoo-art-gallery/", "added": "2026-06-05" }
    ]
  };

  async function loadLibrary() {
    try {
      const res = await fetch('books/library.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('library.json fetch failed');
      return await res.json();
    } catch (e) {
      console.info('[library] fetch unavailable (likely file://), using inline fallback.');
      return INLINE_FALLBACK;
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function renderCard(book) {
    const cover = book.cover
      ? `<div class="card-cover" style="background-image:url('${escapeHtml(book.cover)}')"></div>`
      : `<div class="card-cover"><div class="placeholder">표지 준비 중</div></div>`;
    const pages = book.pages ? `<span class="badge">${book.pages}p</span>` : '';
    const style = book.style ? `<span class="badge style">${escapeHtml(book.style)}</span>` : '';
    const tags = (book.tags || []).slice(0, 2).map(t => `<span class="badge tag">${escapeHtml(t)}</span>`).join('');
    const subtitle = book.subtitle ? `<p class="card-subtitle">${escapeHtml(book.subtitle)}</p>` : '';
    return `
      <a class="book-card" href="${escapeHtml(book.url)}" aria-label="${escapeHtml(book.title)} 읽기">
        ${cover}
        <div class="card-info">
          <h2>${escapeHtml(book.title)}</h2>
          ${subtitle}
          <div class="card-meta">
            ${pages}${style}${tags}
          </div>
        </div>
      </a>
    `;
  }

  async function init() {
    const data = await loadLibrary();
    document.title = data.site_title || '달빛 도서관';
    const titleEl = document.getElementById('site-title');
    const taglineEl = document.getElementById('tagline');
    if (titleEl && data.site_title) titleEl.textContent = data.site_title;
    if (taglineEl && data.tagline) taglineEl.textContent = data.tagline;

    const grid = document.getElementById('book-grid');
    const count = document.getElementById('book-count');
    const books = data.books || [];
    if (count) count.textContent = books.length === 0 ? '비어 있음' : `${books.length}권의 책`;

    if (books.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          ✨ 곧 새 책이 도착해요
          <span>AI 동화 작가들이 첫 이야기를 그리는 중...</span>
        </div>`;
      return;
    }

    grid.innerHTML = books.map(renderCard).join('');
  }

  init();
})();
