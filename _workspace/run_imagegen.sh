#!/usr/bin/env bash
# 동화책 이미지 9장 배치 생성 실행 스크립트

set -euo pipefail

PROJECT_DIR="/Users/robin/Downloads/fairy-tale"
PROMPTS_JSON="$PROJECT_DIR/_workspace/02_art_director_prompts.json"
OUT_DIR="$PROJECT_DIR/book/images"
HELPER="$HOME/.claude/skills/codex-image/scripts/codex_imagegen_batch.sh"
ARGS_FILE="$PROJECT_DIR/_workspace/imagegen_args.tsv"

[ -f "$PROMPTS_JSON" ] || { echo "missing prompts json"; exit 1; }
mkdir -p "$OUT_DIR"
[ -f "$HELPER" ] || { echo "helper not found: $HELPER"; exit 1; }

# Python 으로 prompt 와 filename 을 TAB 구분 1줄씩 출력 (개행 없는 prompt 전제)
python3 - "$PROMPTS_JSON" "$ARGS_FILE" <<'PY'
import json, sys
p, out = sys.argv[1], sys.argv[2]
data = json.load(open(p))
lines = []
def add(prompt, filename):
    pr = prompt.replace('\t', ' ').replace('\n', ' ').replace('\r', ' ')
    lines.append(f"{pr}\t{filename}")
add(data['cover']['prompt'], data['cover']['filename'])
for s in data['scenes']:
    add(s['prompt'], s['filename'])
with open(out, 'w') as f:
    f.write('\n'.join(lines) + '\n')
print(f"wrote {len(lines)} items to {out}")
PY

# bash 3.x 호환: 배열에 라인을 read -r 로 채움
ITEMS=()
while IFS=$'\t' read -r PROMPT FILENAME; do
  [ -z "$PROMPT" ] && continue
  ITEMS+=("${PROMPT}::${FILENAME}")
done < "$ARGS_FILE"

echo "[info] item count: ${#ITEMS[@]}"
for i in "${!ITEMS[@]}"; do
  fn="${ITEMS[$i]##*::}"
  echo "  $((i+1)). $fn"
done
echo

bash "$HELPER" "$OUT_DIR" "${ITEMS[@]}"
