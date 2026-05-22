#!/usr/bin/env python3
"""두 번째 책의 book.json 을 시나리오로부터 생성."""
import json
from pathlib import Path

WS = Path("/Users/robin/Downloads/fairy-tale/_workspace/02")
OUT = Path("/Users/robin/Downloads/fairy-tale/books/02-acorn-village-rescue/book.json")

scen = json.load(open(WS / "01_scenario.json", encoding="utf-8"))
prom = json.load(open(WS / "02_prompts.json", encoding="utf-8"))

pages = []

# 표지
pages.append({
    "type": "cover",
    "image": "images/cover.png",
    "title": scen["title"],
    "subtitle": scen["subtitle"],
    "author": scen["author"],
})

# 챕터 + 장면 페이지
# scene.is_chapter_opener 가 True 인 첫 페이지는 type 'chapter-opener'
chapter_titles = {c["chapter_number"]: c["title"] for c in scen["chapters"]}
chapter_summaries = {c["chapter_number"]: c["summary"] for c in scen["chapters"]}

for s in scen["scenes"]:
    page = {
        "type": "chapter-opener" if s.get("is_chapter_opener") else "scene",
        "chapter": s["chapter_number"],
        "chapter_title": chapter_titles[s["chapter_number"]],
        "number": s["scene_number"],
        "title": s["title"],
        "body": s["body"],
        "image": f"images/page_{s['scene_number']:02d}.png",
        "mood": s.get("mood", ""),
    }
    if s.get("is_chapter_opener"):
        page["chapter_summary"] = chapter_summaries[s["chapter_number"]]
    pages.append(page)

# 엔딩
pages.append({
    "type": "ending",
    "message": scen["closing_message"],
    "image": f"images/page_{scen['scenes'][-1]['scene_number']:02d}.png",
})

# 챕터 매니페스트
chapters = []
for c in scen["chapters"]:
    # book.json 내 페이지 인덱스 (0=cover, 1~30=scenes/chapter-opener, 31=ending)
    # chapter 의 첫 페이지 인덱스 (chapter-opener 의 위치)
    start_scene = c["page_range"][0]
    end_scene = c["page_range"][1]
    chapters.append({
        "number": c["chapter_number"],
        "title": c["title"],
        "summary": c["summary"],
        "first_page_index": start_scene,  # 0=cover, 1=scene_1
        "last_page_index": end_scene,
    })

book = {
    "title": scen["title"],
    "subtitle": scen["subtitle"],
    "author": scen["author"],
    "mode": scen["mode"],
    "chapters": chapters,
    "pages": pages,
}

with open(OUT, "w", encoding="utf-8") as f:
    json.dump(book, f, ensure_ascii=False, indent=2)

print(f"pages: {len(pages)} (cover + {len(scen['scenes'])} content + ending)")
print(f"chapters: {len(chapters)}")
print(f"saved: {OUT}")
