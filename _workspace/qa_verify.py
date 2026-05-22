#!/usr/bin/env python3
"""달빛 도서관 통합 QA — 모든 책 + 라이브러리 홈 경계면 검증."""
import json
import os
import sys
from pathlib import Path
from datetime import datetime

ROOT = Path("/Users/robin/Downloads/fairy-tale")
WS = ROOT / "_workspace"
BOOKS = ROOT / "books"
LIB_JSON = BOOKS / "library.json"
HOME_HTML = ROOT / "index.html"
HOME_CSS = ROOT / "library.css"
HOME_JS = ROOT / "library.js"

results = []  # (scope, item, status, note)

def check(scope, item, ok, note=""):
    results.append((scope, item, "PASS" if ok else "FAIL", note))

def read_json(p):
    with open(p, "r", encoding="utf-8") as f:
        return json.load(f)

# ---------- 라이브러리 홈 ----------
check("library", "index.html 루트 존재", HOME_HTML.exists())
check("library", "library.css 루트 존재", HOME_CSS.exists())
check("library", "library.js 루트 존재", HOME_JS.exists())
check("library", "books/library.json 존재", LIB_JSON.exists())

if HOME_HTML.exists():
    html = HOME_HTML.read_text(encoding="utf-8")
    check("library", "index.html → library.css 참조", 'href="library.css"' in html)
    check("library", "index.html → library.js 참조", 'src="library.js"' in html)

if LIB_JSON.exists():
    lib = read_json(LIB_JSON)
    check("library", "site_title 존재", bool(lib.get("site_title")))
    check("library", "books 배열 존재", isinstance(lib.get("books"), list))

    # 각 책의 매니페스트 검증
    for b in lib.get("books", []):
        slug = b.get("slug", "?")
        book_dir = ROOT / b["url"].rstrip("/")
        check(f"library/{slug}", "디렉토리 존재", book_dir.exists())
        check(f"library/{slug}", "표지 경로 존재", (ROOT / b["cover"]).exists(),
              f"path={b['cover']}")
        check(f"library/{slug}", "index.html 존재", (book_dir / "index.html").exists())
        check(f"library/{slug}", "book.json 존재", (book_dir / "book.json").exists())

# ---------- 각 책 내부 ----------
for book_dir in sorted(BOOKS.glob("*/")):
    if not book_dir.is_dir() or not (book_dir / "book.json").exists():
        continue
    slug = book_dir.name
    scope = f"book/{slug}"

    book_json = read_json(book_dir / "book.json")
    pages = book_json.get("pages", [])
    check(scope, "pages 배열 존재", len(pages) > 0)

    # 각 페이지의 image 경로가 책 디렉토리 기준으로 실재하는지
    missing = []
    bad_format = []
    zero_size = []
    for p in pages:
        img = p.get("image")
        if not img:
            continue
        full = book_dir / img
        if not full.exists():
            missing.append(img)
        elif full.stat().st_size == 0:
            zero_size.append(img)
        else:
            with open(full, "rb") as f:
                magic = f.read(8)
            if magic[:8] != b"\x89PNG\r\n\x1a\n":
                bad_format.append(img)
    check(scope, "모든 페이지 이미지 존재", len(missing) == 0,
          f"missing={missing[:5]}{'...' if len(missing)>5 else ''}" if missing else "")
    check(scope, "이미지 0바이트 아님", len(zero_size) == 0,
          f"zero={zero_size}" if zero_size else "")
    check(scope, "이미지 유효 PNG", len(bad_format) == 0,
          f"bad={bad_format}" if bad_format else "")

    # 자원 참조
    html = (book_dir / "index.html").read_text(encoding="utf-8")
    check(scope, "style.css 존재", (book_dir / "style.css").exists())
    check(scope, "book.js 존재", (book_dir / "book.js").exists())
    check(scope, "index.html → style.css 참조", 'href="style.css"' in html)
    check(scope, "index.html → book.js 참조", 'src="book.js"' in html)
    check(scope, "도서관 백 링크 존재 (../../)", '../../' in html)

    # 장편 (picture-long) 추가 검증
    if book_json.get("mode") == "picture-long":
        chapters = book_json.get("chapters", [])
        check(scope, "장편 — chapters 배열 존재", len(chapters) > 0)
        # 챕터 오프너 페이지 개수와 chapters 개수 일치
        openers = [p for p in pages if p.get("type") == "chapter-opener"]
        check(scope, "장편 — chapter-opener 수 == chapters 수",
              len(openers) == len(chapters),
              f"openers={len(openers)}, chapters={len(chapters)}")
        # 페이지 30+ 충족
        content_pages = [p for p in pages if p.get("type") in ("scene", "chapter-opener")]
        check(scope, "장편 — 본문 페이지 30+",
              len(content_pages) >= 30,
              f"got {len(content_pages)}")

# ---------- 보고서 ----------
scopes = {}
for s, item, status, note in results:
    scopes.setdefault(s, []).append((item, status, note))

all_pass = all(s == "PASS" for _, _, s, _ in results)
n_fail = sum(1 for _, _, s, _ in results if s == "FAIL")
overall = "PASS" if all_pass else ("PARTIAL" if any(s == "PASS" for _, _, s, _ in results) else "FAIL")

report = [
    "# 달빛 도서관 통합 QA 보고서",
    "",
    f"**검증 시각:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
    f"**전체 상태:** **{overall}**",
    f"**통계:** {len(results) - n_fail} PASS / {n_fail} FAIL / 총 {len(results)} 항목",
    "",
    "## 검증 결과",
    "",
    "| 범위 | 항목 | 결과 | 비고 |",
    "|------|------|------|------|",
]
for scope, items in scopes.items():
    for item, status, note in items:
        emoji = "✅" if status == "PASS" else "❌"
        report.append(f"| {scope} | {item} | {emoji} {status} | {note} |")

report += ["", "## 발견된 문제", ""]
fails = [(s, i, n) for s, i, st, n in results if st == "FAIL"]
if not fails:
    report.append("- 없음 (모든 검증 통과)")
else:
    for s, i, n in fails:
        report.append(f"- **{s} / {i}**: {n}")

report += [
    "",
    "## 산출물 경로",
    "",
    "- 라이브러리 홈: `/Users/robin/Downloads/fairy-tale/index.html`",
]
# 책 목록
if LIB_JSON.exists():
    lib = read_json(LIB_JSON)
    for b in lib.get("books", []):
        report.append(f"- 📖 {b['title']}: `{b['url']}index.html` ({b.get('pages', '?')}p, {b.get('style', '?')})")

report += [
    "",
    "## 미리보기 방법",
    "",
    "```bash",
    "# 정적 서버 (모든 fetch 동작)",
    "cd /Users/robin/Downloads/fairy-tale && python3 -m http.server 8000",
    "# http://localhost:8000 → 라이브러리 홈",
    "```",
    "",
]

(WS / "04_qa_report.md").write_text("\n".join(report) + "\n", encoding="utf-8")

print(f"QA: {overall}")
print(f"  PASS: {len(results) - n_fail} / {len(results)}")
if fails:
    print("  FAILURES:")
    for s, i, n in fails[:15]:
        print(f"    - {s} / {i}: {n}")
    if len(fails) > 15:
        print(f"    ... and {len(fails) - 15} more")
print(f"  보고서: {WS / '04_qa_report.md'}")

sys.exit(0 if all_pass else 1)
