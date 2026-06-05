# Fairy Tale 프로젝트

## 하네스: 동화책 자동 제작

**목표:** 시나리오 작성 → 일관된 그림책 일러스트 → 정적 HTML 책 뷰어를 한 번에 완성.

**트리거:** 동화책/그림책/동화 시나리오/책 뷰어 관련 요청이 들어오면 `fairy-tale-orchestrator` 스킬을 사용하라. 단순 질문(예: "이 폴더에 뭐가 있어?") 은 직접 응답.

**에이전트:** `.claude/agents/` — storyteller, art-director, illustrator, book-builder, qa-reviewer
**스킬:** `.claude/skills/` — fairy-tale-orchestrator (오케스트레이터), story-writing, art-direction, image-generation-batch, book-viewer
**산출물 위치:** `book/` (최종), `_workspace/` (중간)

**이미지 생성 의존성:** `codex-image` 스킬 (codex CLI + ChatGPT OAuth 로그인 필요). Phase 1 에서 `codex login status` 로 사전 확인.

**변경 이력:**

| 날짜 | 변경 내용 | 대상 | 사유 |
|------|----------|------|------|
| 2026-05-22 | 초기 하네스 구성 (에이전트 5 + 스킬 5) | 전체 | 동화책 제작 자동화 |
| 2026-05-22 | index.html 을 프로젝트 루트로 이동, 자원 경로 재배치 | index.html, book/book.json, book/book.js, _workspace/qa_verify.py | 진입점을 루트로 노출 |
| 2026-05-22 | GitHub 배포 (revfactory/fairy-tale-moonlight-library, Pages from main:/) | README.md, .gitignore, git origin | 공개 호스팅 |
| 2026-05-22 | 다중책 구조 도입: book/ → books/01-moonlight-library/, 루트는 라이브러리 홈 | books/library.json, index.html, library.{css,js} | 두 번째 동화 추가를 위한 확장 |
| 2026-05-22 | 하네스 진화: librarian 에이전트 + library-home 스킬, doodle 프리셋, picture-long 장편 모드, 책 뷰어 챕터 목차/진행률 추가 | agents/librarian.md, skills/library-home/, skills/{art-direction,story-writing,book-viewer}/SKILL.md | 30+ 페이지 동물 모험 동화 요청 |
| 2026-05-22 | 두 번째 책 추가: 『도토리 마을 구출 작전』 (32p, doodle) | books/02-acorn-village-rescue/ | 두 번째 동화 제작 |
| 2026-05-29 | 세 번째 책 추가: 『종탑 위의 연우』 (20p, doodle, 이미지 수동 Gemini 생성) | books/03-bell-tower-yeonwoo/ | 세 번째 동화 제작 |
| 2026-06-01 | 이미지 생성 백엔드에 **antigravity(agy)** 추가 — Google AI Pro 구독 OAuth만으로(API 키 미사용) Nano Banana 생성. `agy -p` 불가 → stdin 주입 + 파일 폴링 + Pillow PNG 재인코딩 방식. 신규 스킬 `antigravity-image`, `image-generation-batch`·illustrator 에 백엔드 선택 옵션 | .claude/skills/antigravity-image/{SKILL.md,scripts/}, .claude/skills/image-generation-batch/SKILL.md, .claude/agents/illustrator.md | 구독 CLI를 이미지 생성기로 활용 |
| 2026-06-02 | 네 번째 책 추가: 『네버랜드의 연우』 (20p, agy 모험 수채화). **사람 목소리 낭독 도입** — edge-tts 신경망 음성(API 키 불필요)으로 페이지별 MP3 사전생성, `book.js`가 `page.audio` 우선 재생. 낭독은 제목 빼고 본문(body)만 | books/04-neverland-yeonwoo/, _workspace/generate_narration.py, books/*/book.js | 기계음 개선 요청 |
| 2026-06-04 | 다섯 번째 책 추가: 『은빛 명견 연우와 들개 친구들』 (10p, agy 모험 수채화, 명견 실버 모티브). 낭독은 ko-KR-SunHi(엄마 톤 여성)로 통일, BGM은 모험·행진풍(갤로핑 베이스+영웅 멜로디 Web Audio 합성)으로 책별 커스텀 | books/05-silverfang-yeonwoo/ | 다섯 번째 동화 제작 |
| 2026-06-05 | 여섯 번째 책 추가: 『연우가 그린 그림나라』 (4p). **AI 일러스트가 아닌 연우(아이)의 실제 크레용 그림 사진**을 cv2 원근보정(EXIF 무시, 격자 수동 4점 워프+CLAHE) 후 본문 이미지로 수록하고 스토리텔링. 사진 더 받아 페이지 확장 예정(그림1장=scene 페이지+mp3 추가). 보정 스크립트 ywoo/warp2.py, AI 일러스트 10장은 _workspace/06_images/ 에 미사용 보관 | books/06-yeonwoo-drawing-world/, ywoo/ | 아이 실제 그림 기반 동화 |
