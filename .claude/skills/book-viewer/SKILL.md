---
name: book-viewer
description: 정적 HTML 동화책 뷰어 빌드 스킬. book-builder 에이전트 전용. 시나리오 + 이미지로부터 빌드 의존성 없이 브라우저에서 바로 열리는 페이지 넘김 뷰어를 생성한다. 트리거 '책 뷰어 만들기', '동화 HTML 뷰어', '페이지 넘김 그림책', 'storybook viewer'.
---

# Book Viewer — 정적 HTML 책 뷰어 빌더

book-builder 에이전트 전용. 시나리오 JSON + `book/images/*.png` 로부터 정적 HTML 뷰어를 만든다.

## 핵심 원칙

1. **No build, no dependency** — 순수 HTML/CSS/JS. `index.html` 더블 클릭하면 열린다.
2. **데이터 인라인 + 외부 JSON** — `file://` 환경에서 fetch 가 막힐 수 있으므로 `book.json` 데이터를 `book.js` 안에 인라인하는 fallback 제공. 또는 사용자에게 `python3 -m http.server` 안내.
3. **반응형** — 데스크탑/모바일 모두 자연스럽게.
4. **부드러운 페이지 전환** — fade + slight slide 200ms.
5. **풍부한 인터랙션** — 키보드(←→·스페이스·Home·End), 클릭, 스와이프(터치).

## 파일 구조

```
book/
├── index.html
├── style.css
├── book.js
├── book.json
└── images/
    ├── cover.png
    └── scene_01.png ... scene_08.png
```

## index.html 골격

```html
<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>동화책</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <main id="book" class="book"></main>
  <nav class="controls">
    <button id="prev" aria-label="이전 페이지">◀</button>
    <span id="indicator">1 / N</span>
    <button id="next" aria-label="다음 페이지">▶</button>
  </nav>
  <div id="dots" class="dots"></div>
  <script src="book.js"></script>
</body>
</html>
```

## style.css 핵심

- `:root` 에 색상/간격 변수
- `.book` 은 화면 중앙, 최대 너비 1100px, 그림자
- `.page` 절대 위치, opacity 트랜지션
- `.page.cover` 는 배경 이미지 + 그라데이션 오버레이 + 큰 타이틀
- `.page.scene` 는 데스크탑은 좌우 2단(이미지+텍스트), 모바일은 위아래
- 폰트: `system-ui, "Pretendard", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif`

## book.js 핵심 로직

- 데이터 로딩: `fetch('book.json')` 시도 → 실패하면 인라인 fallback 사용
- `currentPage` 상태, `render()` 함수가 페이지 DOM 생성
- 키보드/클릭/터치 이벤트 핸들러
- 페이지 전환 시 .leaving / .entering 클래스 토글

## book.json 변환 규칙

시나리오 JSON `_workspace/01_storyteller_scenario.json` 에서:
- `title`, `subtitle`, `author` → book.json 의 같은 필드
- `scenes[*]` → book.json.pages[1..N] (type: "scene")
- 표지 페이지(0번) → type: "cover", 이미지 cover.png
- 엔딩 페이지(마지막) → type: "ending", closing_message + 마지막 장면 이미지 재사용 또는 별도

## 장편 모드 (picture-long, 25+ 페이지)

긴 동화는 추가 UI 가 필요하다:

- **챕터 목차 사이드 패널** — 우상단 ☰ 버튼으로 열림, 챕터 클릭 시 첫 페이지로 점프
- **챕터 제목 페이지** — 챕터 시작 페이지는 큰 챕터 제목 + 부제(요약) + 첫 문단
- **진행률 바** — 하단 점 인디케이터 대신 슬림한 진행률 바 + "Ch.3 / Page 14" 라벨
- **챕터 헤더** — 각 페이지 상단에 작은 텍스트로 "Chapter 3 · 깊은 숲" 표시 (현재 챕터 항상 보임)
- **이미지 프리로딩 전략** — 30+장이라 전체 프리로드는 무거움. 현재 페이지 ± 3장만 프리로드, 나머지는 lazy
- **북마크/북마크 복원** — localStorage 에 마지막 읽은 페이지 저장. 다시 열면 "이어서 읽기?" 옵션

### book.json 장편 확장

```json
{
  "title": "...",
  "mode": "picture-long",
  "chapters": [
    { "number": 1, "title": "도토리 마을의 아침", "summary": "평화로운 마을 소개", "page_indices": [1, 2, 3, 4, 5] }
  ],
  "pages": [
    { "type": "cover", ... },
    { "type": "chapter-opener", "chapter": 1, "title": "도토리 마을의 아침", "summary": "...", "body": "...", "image": "..." },
    { "type": "scene", "chapter": 1, "number": 2, "body": "...", "image": "..." },
    ...
    { "type": "ending", ... }
  ]
}
```

## 품질 체크리스트

- [ ] `file://` 로 열어도 동작 (또는 명확한 서버 실행 안내)
- [ ] 모든 이미지가 alt 속성 가짐
- [ ] 키보드 네비게이션 동작
- [ ] 모바일 뷰포트에서 깨지지 않음
- [ ] 첫 페이지에서 prev 버튼 비활성, 마지막에서 next 비활성
- [ ] 이미지 누락 시 placeholder 표시
