# 달빛 도서관과 보리 🌙📖

> 잠 못 드는 밤, 책 한 권이 날아왔어요.

AI가 자동으로 시나리오를 쓰고, 그림책 일러스트를 그려서, 페이지 넘김 뷰어로 묶은 한국어 동화책입니다.

**👉 [책 읽으러 가기 (GitHub Pages)](https://revfactory.github.io/fairy-tale-moonlight-library/)**

## 등장인물

- **보리** — 여섯 살의 호기심 많은 아이. 어깨 단발 밤색 머리, 별무늬 하늘색 잠옷.
- **별여우** — 달빛 도서관의 수줍은 이야기 지킴이. 꼬리 끝이 별처럼 빛나는 작은 흰 여우.

## 어떻게 만들어졌나

5명의 전문 AI 에이전트로 구성된 **하네스(Harness)** 가 협업하여 시나리오 → 일러스트 → 책 뷰어를 완성합니다.

| 에이전트 | 역할 | 산출물 |
|---------|------|--------|
| `storyteller` | 8장면 시나리오 작성 | `_workspace/01_storyteller_scenario.json` |
| `art-director` | 비주얼 스타일 + 영문 프롬프트 | `_workspace/02_art_director_prompts.json` |
| `illustrator` | `codex-image` 로 PNG 9장 병렬 생성 | `book/images/*.png` |
| `book-builder` | 정적 HTML 책 뷰어 빌드 | `index.html`, `book/*` |
| `qa-reviewer` | 경계면 5개 교차 검증 | `_workspace/04_qa_report.md` |

오케스트레이터 스킬: `.claude/skills/fairy-tale-orchestrator/SKILL.md`

## 디렉토리 구조

```
fairy-tale/
├── index.html              # 진입점
├── book/
│   ├── style.css
│   ├── book.js
│   ├── book.json
│   └── images/             # 표지 + 8장면 = 9장
├── _workspace/             # 중간 산출물 (시나리오/프롬프트/QA 보고서)
└── .claude/
    ├── agents/             # 에이전트 5종
    └── skills/             # 스킬 5종 (오케스트레이터 포함)
```

## 로컬에서 실행

```bash
# 방법 1: 더블 클릭 (file:// — JS 인라인 데이터로 폴백)
open index.html

# 방법 2: 정적 서버 (book.json 도 fetch 동작)
python3 -m http.server 8000
# http://localhost:8000 접속
```

## 인터랙션

- ← → · 스페이스 · Home · End — 키보드 네비게이션
- 페이지 좌/우 끝 클릭 — 이전/다음
- 모바일: 터치 스와이프
- 우상단 ⤢ — 전체화면

## 라이선스

이 책의 텍스트와 이미지는 학습/공유 용도로 자유롭게 사용 가능합니다. 상업적 활용 시에는 별도 문의 바랍니다.

---

*"잠이 안 오는 밤이면 책을 펼쳐 보세요. 어쩌면 작은 친구가 당신을 기다리고 있을지 몰라요."*
