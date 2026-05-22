---
name: image-generation-batch
description: codex-image 헬퍼 스크립트를 사용한 배치 이미지 생성 스킬. illustrator 에이전트 전용. 프롬프트 JSON 을 받아 9장 이상의 이미지를 5장씩 묶어 병렬 생성한다. 트리거 '이미지 N장 생성', '동화 이미지 배치', '병렬 이미지 생성', 'codex 배치 이미지'.
---

# Image Generation Batch — codex-image 배치 실행

illustrator 에이전트 전용. `~/.claude/skills/codex-image/scripts/codex_imagegen_batch.sh` 를 활용해 이미지를 효율적으로 병렬 생성한다.

## 사전 확인

```bash
codex --version           # 0.128+ 권장
codex login status        # "Logged in using ChatGPT" 확인
```

미인증 시 즉시 중단하고 사용자에게 `codex login` 요청.

## 핵심 명령

```bash
~/.claude/skills/codex-image/scripts/codex_imagegen_batch.sh \
  <output_dir> \
  "<prompt 1>::filename_1.png" \
  "<prompt 2>::filename_2.png" \
  ... 임의 개수
```

- 자동으로 5개씩 묶어 병렬 실행
- 5장 묶음당 ~150~180초 (실측)
- 9장 = 5+4 = 약 5~6분 예상

## 실행 절차 (illustrator 가 따르는 순서)

1. `_workspace/02_art_director_prompts.json` 을 jq 또는 python 으로 파싱
2. 배치 인자 문자열 만들기 — `"prompt::filename"` 형식 N개
3. 헬퍼 스크립트를 Bash 의 `run_in_background: true` 로 호출
4. 백그라운드 완료 알림 대기 (절대 sleep 폴링 금지)
5. 완료 후 `<output_dir>/*.png` 9개 존재 확인

## 인자 생성 예시 (Python one-liner)

```bash
python3 -c "
import json, shlex, sys
data = json.load(open('_workspace/02_art_director_prompts.json'))
args = []
args.append(f\"{data['cover']['prompt']}::{data['cover']['filename']}\")
for s in data['scenes']:
    args.append(f\"{s['prompt']}::{s['filename']}\")
print(' '.join(shlex.quote(a) for a in args))
"
```

이 출력을 그대로 헬퍼 스크립트의 인자로 사용.

## 누락 파일 단일 재시도

배치 후 일부 PNG 가 없으면 해당 프롬프트만 단일 `codex exec` 로 재시도:

```bash
codex exec \
  --sandbox workspace-write \
  --skip-git-repo-check \
  --cd <output_dir> \
  -o /tmp/codex-retry-{n}.md \
  "이미지 생성 도구로 '<프롬프트>' 이미지를 생성하고 ./<filename>.png 로 저장. 파일 경로만 한 줄로 보고."
```

## 결과 검증

```bash
ls -la <output_dir>/*.png  # 파일 크기 0 아닌지 확인
file <output_dir>/*.png    # PNG 파일 형식 검증
```

## 로그 저장

배치 실행 로그는 `<output_dir>/.codex-imagegen-logs/` 에 자동 저장됨. 추가로 `_workspace/03_illustrator_log.md` 에 사람이 읽기 좋은 요약 저장:

```markdown
# Illustrator 실행 로그

- 실행 시각: YYYY-MM-DD HH:MM
- 총 요청: 9장
- 배치 1 (5장): cover, scene_01~04 — 완료 (152초)
- 배치 2 (4장): scene_05~08 — 완료 (138초)
- 재시도: 없음 또는 (장면 N - 사유)
- 누락: 없음 또는 (장면 N)
- 총 소요: 약 X분
```

## 에러 대응

| 증상 | 대응 |
|------|------|
| codex 미인증 | 중단 + 사용자에게 `codex login` 요청 |
| 헬퍼 스크립트 미존재 | `ls ~/.claude/skills/codex-image/scripts/` 확인, 경로 수정 |
| 5장 동시 실패 | 1개씩 단일 실행으로 전환 |
| 모델 거부(safety) | 프롬프트를 art-director 에게 SendMessage 로 재작성 요청 |
| 디스크 쓰기 실패 | output_dir 권한 확인 |
