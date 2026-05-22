#!/usr/bin/env python3
"""동화책 통합 정합성 검증 — qa-reviewer 에이전트용 스크립트.

경계면 5개 교차 비교:
  1. 시나리오 ↔ 프롬프트
  2. 프롬프트 ↔ 이미지
  3. 시나리오 ↔ 뷰어 데이터
  4. 뷰어 ↔ 자원
  5. 정적 실행 가능성

출력: _workspace/04_qa_report.md 및 콘솔 요약
"""
import json
import os
import re
import sys
from pathlib import Path
from datetime import datetime

ROOT = Path("/Users/robin/Downloads/fairy-tale")
WS = ROOT / "_workspace"
BOOK = ROOT / "book"
HTML_PATH = ROOT / "index.html"
BOOK_JSON_PATH = BOOK / "book.json"

results = []  # (boundary, item, status, note)

def check(boundary, item, ok, note=""):
    results.append((boundary, item, "PASS" if ok else "FAIL", note))

def read_json(p):
    with open(p, "r", encoding="utf-8") as f:
        return json.load(f)

# 1. 시나리오 ↔ 프롬프트
scen = read_json(WS / "01_storyteller_scenario.json")
prom = read_json(WS / "02_art_director_prompts.json")

check("scenario↔prompts", "장면 수 일치",
      len(scen["scenes"]) == len(prom["scenes"]),
      f"scenario={len(scen['scenes'])}, prompts={len(prom['scenes'])}")

scene_nums_scen = [s["scene_number"] for s in scen["scenes"]]
scene_nums_prom = [s["scene_number"] for s in prom["scenes"]]
check("scenario↔prompts", "scene_number 매칭",
      scene_nums_scen == scene_nums_prom,
      f"{scene_nums_scen} vs {scene_nums_prom}")

# 캐릭터 외모 일관성 — character_signatures의 핵심 키워드가 모든 프롬프트에 등장하는지
bori_sig = prom["character_signatures"]["보리"]
bori_key = "Bori"  # 모든 프롬프트에 등장해야 함
prompts_with_bori = [s for s in prom["scenes"] if bori_key in s["prompt"]]
check("scenario↔prompts", "주인공 '보리' 모든 장면 프롬프트에 등장",
      len(prompts_with_bori) == len(prom["scenes"]),
      f"{len(prompts_with_bori)}/{len(prom['scenes'])}")

# style_suffix 일관성
suffix_key = "soft watercolor children's storybook illustration, hand-painted"
all_have_suffix = all(suffix_key in s["prompt"] for s in prom["scenes"]) and suffix_key in prom["cover"]["prompt"]
check("scenario↔prompts", "style_suffix 모든 프롬프트에 포함",
      all_have_suffix)

# 2. 프롬프트 ↔ 이미지
expected_files = [prom["cover"]["filename"]] + [s["filename"] for s in prom["scenes"]]
missing = []
zero_size = []
for fn in expected_files:
    p = BOOK / "images" / fn
    if not p.exists():
        missing.append(fn)
    elif p.stat().st_size == 0:
        zero_size.append(fn)

check("prompts↔images", "모든 이미지 파일 존재",
      len(missing) == 0,
      f"missing={missing}" if missing else "")
check("prompts↔images", "모든 이미지 0바이트 아님",
      len(zero_size) == 0,
      f"zero={zero_size}" if zero_size else "")

# PNG 매직 바이트 확인
bad_format = []
for fn in expected_files:
    p = BOOK / "images" / fn
    if p.exists() and p.stat().st_size > 0:
        with open(p, "rb") as f:
            magic = f.read(8)
        if magic[:8] != b"\x89PNG\r\n\x1a\n":
            bad_format.append(fn)
check("prompts↔images", "모든 이미지 유효한 PNG",
      len(bad_format) == 0,
      f"bad={bad_format}" if bad_format else "")

# 3. 시나리오 ↔ 뷰어
book_json = read_json(BOOK_JSON_PATH)
# pages = cover + N scenes + ending
expected_pages = 1 + len(scen["scenes"]) + 1
check("scenario↔viewer", "총 페이지 수 일치",
      len(book_json["pages"]) == expected_pages,
      f"book.json={len(book_json['pages'])}, expected={expected_pages}")

# 각 장면 페이지의 body 가 시나리오와 일치
scene_pages = [p for p in book_json["pages"] if p["type"] == "scene"]
body_mismatches = []
for i, sp in enumerate(scene_pages):
    if i < len(scen["scenes"]):
        if sp["body"].strip() != scen["scenes"][i]["body"].strip():
            body_mismatches.append(i + 1)
check("scenario↔viewer", "장면 본문 시나리오와 동일",
      len(body_mismatches) == 0,
      f"mismatch_scenes={body_mismatches}" if body_mismatches else "")

# 4. 뷰어 ↔ 자원
html = HTML_PATH.read_text(encoding="utf-8")
css_exists = (BOOK / "style.css").exists()
js_exists = (BOOK / "book.js").exists()
check("viewer↔resources", "index.html 루트 위치", HTML_PATH.exists())
check("viewer↔resources", "book/style.css 존재", css_exists)
check("viewer↔resources", "book/book.js 존재", js_exists)
check("viewer↔resources", "book/book.json 존재", BOOK_JSON_PATH.exists())
check("viewer↔resources", "index.html 이 book/style.css 참조",
      'href="book/style.css"' in html)
check("viewer↔resources", "index.html 이 book/book.js 참조",
      'src="book/book.js"' in html)

# book.json 이미지 경로는 index.html 기준(루트) 으로 해석되므로 ROOT 기반
img_path_issues = []
for p in book_json["pages"]:
    img = p.get("image")
    if img:
        full = ROOT / img
        if not full.exists():
            img_path_issues.append(img)
check("viewer↔resources", "book.json 의 모든 이미지 경로 유효 (루트 기준)",
      len(img_path_issues) == 0,
      f"missing_refs={img_path_issues}" if img_path_issues else "")

# 5. 정적 실행 가능성 — file:// 에서 fetch 실패 시 fallback 데이터 존재
js_text = (BOOK / "book.js").read_text(encoding="utf-8")
has_inline_fallback = "INLINE_DATA" in js_text and "title" in js_text
check("static-runnable", "file:// 용 인라인 fallback 데이터 존재",
      has_inline_fallback)

# 보고서 작성
boundaries = {}
for b, item, status, note in results:
    boundaries.setdefault(b, []).append((item, status, note))

all_pass = all(s == "PASS" for _, _, s, _ in results)
status_label = "PASS" if all_pass else ("PARTIAL" if any(s == "PASS" for _, _, s, _ in results) else "FAIL")

report_lines = [
    "# 동화책 QA 검증 보고서",
    "",
    f"**프로젝트:** 달빛 도서관과 보리",
    f"**검증 시각:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
    f"**전체 상태:** **{status_label}**",
    "",
    "## 경계면 검증 결과",
    "",
    "| 경계면 | 항목 | 결과 | 비고 |",
    "|--------|------|------|------|",
]
for b, items in boundaries.items():
    for item, status, note in items:
        emoji = "✅" if status == "PASS" else "❌"
        report_lines.append(f"| {b} | {item} | {emoji} {status} | {note} |")

report_lines += [
    "",
    "## 발견된 문제",
    ""
]
fails = [(b, i, n) for b, i, s, n in results if s != "PASS"]
if not fails:
    report_lines.append("- 없음 (모든 검증 통과)")
else:
    for b, i, n in fails:
        report_lines.append(f"- **{b} / {i}**: {n}")

report_lines += [
    "",
    "## 산출물 경로",
    "",
    "- 책 뷰어: `/Users/robin/Downloads/fairy-tale/book/index.html`",
    "- 시나리오: `/Users/robin/Downloads/fairy-tale/_workspace/01_storyteller_scenario.json`",
    "- 이미지: `/Users/robin/Downloads/fairy-tale/book/images/`",
    "",
    "## 미리보기 방법",
    "",
    "```bash",
    "# 방법 1: 더블 클릭 (file:// — JS가 인라인 데이터로 폴백)",
    "open /Users/robin/Downloads/fairy-tale/book/index.html",
    "",
    "# 방법 2: 정적 서버 (book.json 도 fetch 동작)",
    "cd /Users/robin/Downloads/fairy-tale/book && python3 -m http.server 8000",
    "# 후 http://localhost:8000 접속",
    "```",
    "",
    "## 자원 메트릭",
    "",
]
# 이미지 크기 합계
total_img = 0
for fn in expected_files:
    p = BOOK / "images" / fn
    if p.exists():
        total_img += p.stat().st_size
report_lines.append(f"- 이미지 9장 총합: {total_img / 1024 / 1024:.2f} MB")
html_size = HTML_PATH.stat().st_size
css_size = (BOOK / "style.css").stat().st_size
js_size = (BOOK / "book.js").stat().st_size
json_size = (BOOK / "book.json").stat().st_size
report_lines.append(f"- 뷰어 자원: index.html {html_size}B + style.css {css_size}B + book.js {js_size}B + book.json {json_size}B")

(WS / "04_qa_report.md").write_text("\n".join(report_lines) + "\n", encoding="utf-8")

# 콘솔 요약
print(f"QA: {status_label}")
print(f"  PASS: {sum(1 for _,_,s,_ in results if s == 'PASS')} / {len(results)}")
if fails:
    print("  FAILURES:")
    for b, i, n in fails:
        print(f"    - {b} / {i}: {n}")
print(f"  보고서: {WS / '04_qa_report.md'}")

sys.exit(0 if all_pass else 1)
