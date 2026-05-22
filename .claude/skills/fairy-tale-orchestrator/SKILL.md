---
name: fairy-tale-orchestrator
description: "동화책 자동 제작 오케스트레이터. 시나리오 작성부터 이미지 생성, HTML 책 뷰어 빌드까지 6명의 에이전트 팀(storyteller, art-director, illustrator, book-builder, qa-reviewer, librarian)을 조율한다. 단편(6~10페이지)과 장편(30+페이지) 모두 지원. doodle/watercolor/Ghibli/flat 스타일 선택 가능. 트리거: '동화책 만들어', '동화 만들어줘', '그림책 제작', '두 번째 동화', '새 동화', '동물 동화', '모험 동화', '장편 동화', '챕터 동화', 'doodle 동화', '색연필 동화', '아이용 책 만들기', 'fairy tale book', 'storybook', '동화책 뷰어'. 후속 작업: '동화 다시 써', '이미지 다시 그려', '장면 N 수정', '스토리 보완', '뷰어 디자인 변경', '이전 책 개선', '책 업데이트', '라이브러리 갱신', '도서관 홈 수정' 등 동화 관련 모든 후속 요청도 반드시 이 스킬을 사용."
---

# Fairy Tale Orchestrator — 동화책 제작 통합 워크플로우

5명의 에이전트 팀이 협업하여 시나리오 → 이미지 → 책 뷰어를 완성하는 통합 스킬.

## 실행 모드: 하이브리드

| Phase | 모드 | 이유 |
|-------|------|------|
| Phase 2 (스토리+아트디렉션) | 에이전트 팀 | storyteller ↔ art-director 가 캐릭터/장면 합의 필요 |
| Phase 3 (이미지 생성) | 서브 에이전트 | illustrator 단일이 codex-image 배치를 실행, 팀 통신 오버헤드 불필요 |
| Phase 4 (뷰어 빌드 + QA) | 에이전트 팀 | book-builder ↔ qa-reviewer 가 즉시 피드백 교환 |

## 에이전트 구성

| 팀원 | agent_type | 역할 | 출력 |
|------|-----------|------|------|
| storyteller | storyteller | 8장면 동화 시나리오 작성 | `_workspace/01_storyteller_scenario.json` |
| art-director | art-director | 비주얼 스타일 + 영문 프롬프트 9개 | `_workspace/02_art_director_prompts.json` |
| illustrator | illustrator | codex-image 로 PNG 9장 생성 | `book/images/cover.png + scene_01~08.png` |
| book-builder | book-builder | HTML 책 뷰어 빌드 | `book/index.html + style.css + book.js + book.json` |
| qa-reviewer | qa-reviewer | 통합 정합성 검증 | `_workspace/04_qa_report.md` |

## 워크플로우

### Phase 0: 컨텍스트 확인

1. `_workspace/` 존재 여부 확인
2. `book/index.html` 존재 여부 확인
3. 실행 모드 결정:
   - 둘 다 없음 → **초기 실행**, Phase 1 진행
   - 둘 다 존재 + 사용자가 부분 수정 요청 → **부분 재실행** (해당 에이전트만 호출)
   - 둘 다 존재 + 새 주제 입력 → **새 실행**, 기존 `_workspace/` 와 `book/` 를 각각 `_workspace_{timestamp}/`, `book_{timestamp}/` 로 보관 후 새로 생성

### Phase 1: 준비

1. 사용자 입력에서 주제, 장면 수, 타깃 연령 파싱 (없으면 기본값)
2. 디렉토리 보장: `_workspace/`, `book/images/`
3. codex 인증 사전 확인 (`codex login status` → "Logged in using ChatGPT")

### Phase 2: 스토리 + 아트디렉션 (팀)

**실행 모드:** 에이전트 팀

1. `TeamCreate(team_name: "fairy-tale-creative", members: [storyteller, art-director])`
   - 두 에이전트 모두 `model: "opus"`
2. `TaskCreate`:
   - task A: storyteller — 시나리오 작성 (assignee: storyteller)
   - task B: art-director — 프롬프트 작성, depends_on: [task A]
3. 팀원들이 SendMessage 로 캐릭터 모호점을 협의
4. 완료 후 `TeamDelete`

### Phase 3: 이미지 생성 (서브)

**실행 모드:** 서브 에이전트

1. `Agent(name: illustrator, subagent_type: illustrator, model: opus, prompt: "_workspace/02_art_director_prompts.json 을 읽고 codex-image 배치로 9장 생성")`
   - **서브 에이전트의 빌트인 타입은 `general-purpose`** (커스텀 타입 illustrator 가 빌트인이 아니라면 `subagent_type: "general-purpose"` 로 호출하고 prompt 에 illustrator.md 의 역할을 요약 전달, 또는 .claude/agents/illustrator.md 파일을 그대로 참조하도록 지시)
   - 백그라운드 실행, 약 5~6분 소요
2. 완료 후 `book/images/` 의 PNG 9장 존재 확인

### Phase 4: 뷰어 빌드 + QA (팀)

**실행 모드:** 에이전트 팀

1. `TeamCreate(team_name: "fairy-tale-build", members: [book-builder, qa-reviewer])`
2. `TaskCreate`:
   - task C: book-builder — 뷰어 빌드 (assignee: book-builder)
   - task D: qa-reviewer — 통합 검증, depends_on: [task C]
3. book-builder 완료 → qa-reviewer 가 검증 → 문제 발견 시 SendMessage 로 book-builder 에게 수정 요청
4. PASS 시 팀 정리

### Phase 5: 마무리

1. `_workspace/` 보존
2. 사용자에게 결과 보고: `book/index.html` 경로, 페이지 수, QA 결과
3. 미리보기 안내: `open /Users/robin/Downloads/fairy-tale/book/index.html` 또는 `python3 -m http.server -d /Users/robin/Downloads/fairy-tale/book 8000` 후 `http://localhost:8000`

## 데이터 흐름

```
사용자 입력
    ↓
[storyteller] ─SendMessage→ [art-director]
    ↓                              ↓
01_scenario.json              02_prompts.json
                                   ↓
                          [illustrator (codex-image 병렬)]
                                   ↓
                          book/images/*.png (9장)
                                   ↓
[book-builder] ←SendMessage→ [qa-reviewer]
    ↓                              ↓
book/index.html              04_qa_report.md
    ↓
사용자 (브라우저로 열기)
```

## 에러 핸들링

| 상황 | 전략 |
|------|------|
| codex 미인증 | Phase 1에서 즉시 중단, 사용자에게 `codex login` 요청 |
| storyteller 실패 | 기본 동화 템플릿 (별빛 우정 8장면) 으로 폴백 |
| 이미지 일부 누락 | 누락 장면 1회 재시도, 그래도 실패 시 placeholder + 보고서에 명시 |
| 이미지 전체 실패 | 사용자에게 보고, 텍스트만 있는 뷰어 빌드 여부 확인 |
| book-builder 실패 | 최소 단일 페이지 fallback HTML 생성 |
| qa-reviewer FAIL | 문제 모듈에게 1회 수정 요청, 재실패 시 PARTIAL 로 마무리 |

## 테스트 시나리오

### 정상 흐름
1. 사용자: "동화책 만들어줘 — 별을 좋아하는 토끼 이야기"
2. Phase 2: storyteller 가 8장면 시나리오, art-director 가 일관된 watercolor 스타일 + 9개 영문 프롬프트 생성
3. Phase 3: illustrator 가 codex-image 배치로 약 5분 만에 9장 생성
4. Phase 4: book-builder 가 HTML 뷰어, qa-reviewer 가 PASS
5. 사용자가 `book/index.html` 을 열면 표지부터 8장면 + 엔딩까지 페이지 넘김 가능

### 에러 흐름 (이미지 1장 실패)
1. Phase 3 후 `book/images/scene_05.png` 누락 발견
2. illustrator 가 scene_05 만 단일 codex exec 재시도
3. 재시도 성공 → 정상 진행, 또는 실패 → placeholder + 보고서 명시
4. book-builder 가 placeholder 처리하여 뷰어 빌드
5. qa-reviewer 가 PARTIAL 로 보고

## description 의 후속 작업 키워드

이 description 은 다음 후속 요청에서도 반드시 트리거되어야 한다:
- "동화 다시 써", "장면 3 수정", "이미지 다시 그려", "스타일 바꿔", "뷰어 색감 변경"
- "이전 책 개선", "표지만 바꿔", "엔딩 메시지 수정"
