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
