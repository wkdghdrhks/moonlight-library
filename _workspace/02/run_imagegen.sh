#!/usr/bin/env bash
# 두 번째 책 이미지 31장 배치 생성

set -euo pipefail

PROJECT_DIR="/Users/robin/Downloads/fairy-tale"
PROMPTS_JSON="$PROJECT_DIR/_workspace/02/02_prompts.json"
OUT_DIR="$PROJECT_DIR/books/02-acorn-village-rescue/images"
HELPER="$HOME/.claude/skills/codex-image/scripts/codex_imagegen_batch.sh"
ARGS_FILE="$PROJECT_DIR/_workspace/02/imagegen_args.tsv"

[ -f "$PROMPTS_JSON" ] || { echo "missing prompts json"; exit 1; }
mkdir -p "$OUT_DIR"
[ -f "$HELPER" ] || { echo "helper not found: $HELPER"; exit 1; }

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

ITEMS=()
while IFS=$'\t' read -r PROMPT FILENAME; do
  [ -z "$PROMPT" ] && continue
  ITEMS+=("${PROMPT}::${FILENAME}")
done < "$ARGS_FILE"

echo "[info] item count: ${#ITEMS[@]}"
echo "[info] output: $OUT_DIR"
echo

bash "$HELPER" "$OUT_DIR" "${ITEMS[@]}"
