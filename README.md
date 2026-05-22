# 달빛 도서관 🌙📖

> AI가 그리고 쓴 동화책 모음.

**👉 [도서관 입장하기 (GitHub Pages)](https://revfactory.github.io/fairy-tale-moonlight-library/)**

## 책 목록

| # | 제목 | 분량 | 스타일 | 태그 |
|---|------|------|--------|------|
| 1 | 달빛 도서관과 보리 | 10p | 수채화 | 우정 · 상상 · 잠자리 |
| 2 | 도토리 마을 구출 작전 | 32p | doodle | 모험 · 동물 · 협동 |

## 어떻게 만들어졌나

6명의 AI 에이전트가 협업하는 **하네스(Harness)** 가 시나리오 → 일러스트 → 책 뷰어 → 라이브러리까지 자동 제작합니다.

| 에이전트 | 역할 |
|---------|------|
| `storyteller` | 시나리오 작성 (단편 6~10p · 장편 30+p 챕터 구조) |
| `art-director` | 비주얼 스타일 + 영문 프롬프트 (watercolor · Ghibli · flat · doodle) |
| `illustrator` | `codex-image` 로 PNG 병렬 생성 |
| `book-builder` | 정적 HTML 책 뷰어 (목차 · 진행률 · 키보드 · 터치) |
| `qa-reviewer` | 경계면 교차 검증 |
| `librarian` | 다중책 라이브러리 홈 관리 |

오케스트레이터: `.claude/skills/fairy-tale-orchestrator/SKILL.md`

## 디렉토리 구조

```
fairy-tale/
├── index.html              # 라이브러리 홈
├── library.css / library.js
├── books/
│   ├── library.json        # 책 매니페스트
│   ├── 01-moonlight-library/
│   └── 02-acorn-village-rescue/
├── _workspace/             # 중간 산출물 (책별 _workspace/{n}/)
└── .claude/
    ├── agents/             # 에이전트 6종
    └── skills/             # 스킬 6종 (오케스트레이터 포함)
```

## 로컬에서 실행

```bash
# 정적 서버 권장 (장편 책은 book.json fetch 필요)
python3 -m http.server 8000
# http://localhost:8000 → 라이브러리 홈
```

## 인터랙션

- ← → · 스페이스 · Home · End — 키보드 네비게이션
- T — 목차 패널 열기 (장편 책)
- 페이지 좌/우 끝 클릭 — 이전/다음
- 모바일: 터치 스와이프
- 우상단 ⤢ — 전체화면

## 라이선스

자유롭게 학습/공유하세요. 상업적 활용 시에는 별도 문의.

---

*"용기는 혼자 떠나는 것이 아니라, 친구들과 함께 첫걸음을 내딛는 것이에요." — 도토리 마을 구출 작전 中*
