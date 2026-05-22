---
name: library-home
description: 다중책 라이브러리 홈(루트 index.html) 빌드 스킬. librarian 에이전트 전용. books/library.json 매니페스트를 입력으로 받아 책 카드 그리드를 가진 정적 HTML 홈페이지를 생성한다. 트리거 '라이브러리 홈', '도서관 홈', '책 목록 페이지', '여러 책 보여주는 페이지', 'book index'.
---

# Library Home — 도서관 홈 빌더

librarian 에이전트 전용. 여러 책을 카드 그리드로 보여주는 정적 라이브러리 홈을 만든다.

## 입력

- `books/library.json` — 책 매니페스트
- 표지 이미지들 (각 책의 `images/cover.png`)

## 출력

루트의 3개 파일:
- `index.html` — 라이브러리 홈
- `library.css` — 홈 전용 스타일
- `library.js` — 카드 렌더링 + 인터랙션

## 디자인 원칙

1. **북카페 느낌** — 어두운 배경에 따뜻한 골드 액센트. 책 표지가 주인공.
2. **카드 = 표지 우선** — 표지가 카드의 70% 차지. 텍스트는 하단 작게.
3. **호버 인터랙션** — 카드가 살짝 떠오르고, 표지에 약한 글로우.
4. **장식 디테일** — 헤더에 별빛 배경, 카드 모서리 둥글게, 책 모음에 어울리는 가벼운 그림자.
5. **빈 상태 우아하게** — 책 0권일 때 일러스트 또는 점선 카드 placeholder.

## index.html 골격

```html
<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>달빛 도서관</title>
  <link rel="stylesheet" href="library.css">
</head>
<body>
  <div class="stars-bg" aria-hidden="true"></div>
  <header class="hero">
    <h1 id="site-title">달빛 도서관</h1>
    <p id="tagline">AI가 그린 동화책 모음</p>
  </header>
  <main class="shelf">
    <div id="book-grid" class="book-grid"></div>
  </main>
  <footer class="footer">
    <a id="github-link" href="#">GitHub</a>
    <span>· AI 자동 제작 동화 라이브러리</span>
  </footer>
  <script src="library.js"></script>
</body>
</html>
```

## 카드 구조

```html
<a class="book-card" href="{book.url}">
  <div class="card-cover" style="background-image:url('{book.cover}')"></div>
  <div class="card-info">
    <h2>{book.title}</h2>
    <p class="card-subtitle">{book.subtitle}</p>
    <div class="card-meta">
      <span class="badge">{book.pages}p</span>
      <span class="badge style">{book.style}</span>
    </div>
  </div>
</a>
```

## library.js 핵심

- `fetch('books/library.json')` 시도, 실패 시 인라인 fallback
- 책 0권이면 빈 상태 안내
- 호버 인터랙션은 CSS 만으로 처리

## 반응형

- 데스크탑 (>1000px): 3열
- 태블릿 (600~1000px): 2열
- 모바일 (<600px): 1열

## 품질 체크리스트

- [ ] 매니페스트의 모든 책이 카드로 렌더링됨
- [ ] 카드 클릭 시 해당 책 페이지로 이동
- [ ] 표지 이미지 누락 시 placeholder 표시
- [ ] 키보드(Tab)로 카드 순회 가능
- [ ] 모바일에서 1열, 카드가 화면 너비 차지
