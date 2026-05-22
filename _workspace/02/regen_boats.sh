#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="/Users/robin/Downloads/fairy-tale"
PROMPTS_JSON="$PROJECT_DIR/_workspace/02/02_prompts.json"
OUT_DIR="$PROJECT_DIR/books/02-acorn-village-rescue/images"
HELPER="$HOME/.claude/skills/codex-image/scripts/codex_imagegen_batch.sh"
ARGS_FILE="$PROJECT_DIR/_workspace/02/regen_boats_args.tsv"

TARGETS=(18 19 20)

python3 - "$PROMPTS_JSON" "$ARGS_FILE" "${TARGETS[@]}" <<'PY'
import json, sys
p, out = sys.argv[1], sys.argv[2]
targets = [int(x) for x in sys.argv[3:]]
data = json.load(open(p))
by_num = {s['scene_number']: s for s in data['scenes']}
lines = []
for n in targets:
    s = by_num[n]
    pr = s['prompt'].replace('\t', ' ').replace('\n', ' ').replace('\r', ' ')
    lines.append(f"{pr}\t{s['filename']}")
with open(out, 'w') as f:
    f.write('\n'.join(lines) + '\n')
print(f"queued {len(lines)} items")
PY

ITEMS=()
while IFS=$'\t' read -r PROMPT FILENAME; do
  [ -z "$PROMPT" ] && continue
  ITEMS+=("${PROMPT}::${FILENAME}")
done < "$ARGS_FILE"

echo "[info] regenerating ${#ITEMS[@]} boat-consistency images"
for i in "${!ITEMS[@]}"; do
  echo "  $((i+1)). ${ITEMS[$i]##*::}"
done
bash "$HELPER" "$OUT_DIR" "${ITEMS[@]}"
